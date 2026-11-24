
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MediBook.Api.Data;
using MediBook.Api.Models;
using MediBook.Api.Dtos;
using Microsoft.AspNetCore.Identity;

namespace MediBook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<Users> _passwordHasher;

    public DoctorsController(ApplicationDbContext context)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<Users>();
    }

    // All logged-in users can view doctors
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetDoctors()
    {
        var doctors = await _context.Doctors.ToListAsync();
        return Ok(doctors);
    }

    // Only Admin can create Doctor profile and login account
    [Authorize(Roles = "Admin")]
    [HttpPost("create-account")]
    public async Task<IActionResult> CreateDoctorAccount(
        DoctorRegistration request)
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

        var doctor = new Doctor
        {
            Name = request.Name,
            Specialization = request.Specialization,
            Experience = request.Experience,
            IsAvailable = request.IsAvailable
        };

        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        var user = new Users
        {
            Name = request.Name,
            Email = request.Email,
            Role = "Doctor",
            DoctorId = doctor.Id
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();

        return Ok(new
        {
            message = "Doctor account created successfully",
            doctorId = doctor.Id,
            userId = user.Id
        });
    }

    // Only Admin can add doctor profile
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateDoctor(Doctor doctor)
    {
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        return Ok(doctor);
    }

    // Only Admin can update doctors
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDoctor(int id, Doctor doctor)
    {
        var existingDoctor = await _context.Doctors.FindAsync(id);

        if (existingDoctor == null)
            return NotFound("Doctor not found");

        existingDoctor.Name = doctor.Name;
        existingDoctor.Specialization = doctor.Specialization;
        existingDoctor.Experience = doctor.Experience;
        existingDoctor.IsAvailable = doctor.IsAvailable;

        await _context.SaveChangesAsync();

        return Ok(existingDoctor);
    }

    // Only Admin can delete doctors
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);

        if (doctor == null)
            return NotFound("Doctor not found");

        _context.Doctors.Remove(doctor);
        await _context.SaveChangesAsync();

        return Ok("Doctor deleted successfully");
    }
}
