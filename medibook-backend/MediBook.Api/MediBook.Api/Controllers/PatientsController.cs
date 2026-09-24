
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.Api.Data;
using MediBook.Api.Models;

namespace MediBook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PatientsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPatients()
    {
        var patients = await _context.Patients.ToListAsync();

        return Ok(patients);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePatient(Patient patient)
    {
        _context.Patients.Add(patient);

        await _context.SaveChangesAsync();

        return Ok(patient);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePatient(
        int id,
        Patient patient)
    {
        var existingPatient = await _context.Patients.FindAsync(id);

        if (existingPatient == null)
        {
            return NotFound("Patient not found");
        }

        existingPatient.Name = patient.Name;
        existingPatient.Age = patient.Age;
        existingPatient.Gender = patient.Gender;
        existingPatient.Phone = patient.Phone;
        existingPatient.Email = patient.Email;
        existingPatient.Address = patient.Address;

        await _context.SaveChangesAsync();

        return Ok(existingPatient);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await _context.Patients.FindAsync(id);

        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        _context.Patients.Remove(patient);

        await _context.SaveChangesAsync();

        return Ok("Patient deleted successfully");
    }
}