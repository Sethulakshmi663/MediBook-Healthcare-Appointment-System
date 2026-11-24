
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MediBook.Api.Data;
using MediBook.Api.Models;
using System.Security.Claims;

namespace MediBook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PatientsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Admin - All patients
    // Doctor - Patients with assigned appointments
    // Patient - Own profile
    [HttpGet]
    public async Task<IActionResult> GetPatients()
    {
        var user = await GetCurrentUser();

        if (user == null)
            return Forbid();

        if (user.Role == "Admin")
        {
            var patients = await _context.Patients.ToListAsync();
            return Ok(patients);
        }

        if (user.Role == "Patient")
        {
            if (user.PatientId == null)
                return Forbid();

            var patient = await _context.Patients
                .Where(p => p.Id == user.PatientId)
                .ToListAsync();

            return Ok(patient);
        }

        if (user.Role == "Doctor")
        {
            if (user.DoctorId == null)
                return Forbid();

            var patients = await _context.Appointments
                .Where(a => a.DoctorId == user.DoctorId)
                .Select(a => a.PatientId)
                .Distinct()
                .Join(
                    _context.Patients,
                    patientId => patientId,
                    patient => patient.Id,
                    (patientId, patient) => patient
                )
                .ToListAsync();

            return Ok(patients);
        }

        return Forbid();
    }

    // Only Admin can create patient profiles manually
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreatePatient(Patient patient)
    {
        _context.Patients.Add(patient);

        await _context.SaveChangesAsync();

        return Ok(patient);
    }

    // Admin - Update any patient
    // Patient - Update own profile
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePatient(
        int id,
        Patient patient)
    {
        var user = await GetCurrentUser();

        if (user == null)
            return Forbid();

        var existingPatient =
            await _context.Patients.FindAsync(id);

        if (existingPatient == null)
            return NotFound("Patient not found");

        if (user.Role == "Patient")
        {
            if (user.PatientId == null ||
                user.PatientId != id)
                return Forbid();
        }
        else if (user.Role != "Admin")
        {
            return Forbid();
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

    // Only Admin can delete patients
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await _context.Patients.FindAsync(id);

        if (patient == null)
            return NotFound("Patient not found");

        _context.Patients.Remove(patient);

        await _context.SaveChangesAsync();

        return Ok("Patient deleted successfully");
    }

    // Get logged-in user from JWT token
    private async Task<Users?> GetCurrentUser()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userId, out int id))
            return null;

        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);
    }
}
