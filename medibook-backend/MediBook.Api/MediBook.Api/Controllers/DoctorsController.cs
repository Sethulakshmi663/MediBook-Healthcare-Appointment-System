using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.Api.Data;
using MediBook.Api.Models;

namespace MediBook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DoctorsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDoctors()
    {
        var doctors = await _context.Doctors.ToListAsync();

        return Ok(doctors);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDoctor(Doctor doctor)
    {
        _context.Doctors.Add(doctor);

        await _context.SaveChangesAsync();

        return Ok(doctor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDoctor(int id, Doctor doctor)
    {
        var existingDoctor = await _context.Doctors.FindAsync(id);

        if (existingDoctor == null)
        {
            return NotFound("Doctor not found");
        }

        existingDoctor.Name = doctor.Name;
        existingDoctor.Specialization = doctor.Specialization;
        existingDoctor.Experience = doctor.Experience;
        existingDoctor.IsAvailable = doctor.IsAvailable;

        await _context.SaveChangesAsync();

        return Ok(existingDoctor);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);

        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        _context.Doctors.Remove(doctor);

        await _context.SaveChangesAsync();

        return Ok("Doctor deleted successfully");
    }
}