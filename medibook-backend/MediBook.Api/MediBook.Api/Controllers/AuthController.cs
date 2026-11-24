
using MediBook.Api.Data;
using MediBook.Api.Dtos;
using MediBook.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MediBook.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<Users> _passwordHasher;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<Users>();
        }

        // REGISTER
        [HttpPost("register")]
        public async Task<IActionResult> Register(Registration request)
        {
            var existingUser = await _context.Users
                .AnyAsync(u => u.Email == request.Email);

            if (existingUser)
            {
                return BadRequest(new
                {
                    message = "Email already registered"
                });
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            // Create Patient record
            var patient = new Patient
            {
                Name = request.Name,
                Age = request.Age,
                Gender = request.Gender,
                Phone = request.Phone,
                Email = request.Email,
                Address = request.Address ?? string.Empty
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            // Create User account and link Patient
            var user = new Users
            {
                Name = request.Name,
                Email = request.Email,
                Role = "Patient",
                PatientId = patient.Id
            };

            user.PasswordHash = _passwordHasher.HashPassword(
                user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                message = "Registration successful",
                patientId = patient.Id,
                userId = user.Id
            });
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login(Login request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password"
                });
            }

            var result = _passwordHasher.VerifyHashedPassword(
                user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password"
                });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Login successful",
                token = token,
                name = user.Name,
                email = user.Email,
                role = user.Role
            });
        }

        // GENERATE JWT TOKEN
        private string GenerateJwtToken(Users user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!));

            var credentials = new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
