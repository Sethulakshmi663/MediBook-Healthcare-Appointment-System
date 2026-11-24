
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
public class AppointmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AppointmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: Admin - All
    // Doctor - Assigned
    // Patient - Own
    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var user = await GetCurrentUser();

        if (user == null)
            return Forbid();

        var appointments = _context.Appointments.AsQueryable();

        if (user.Role == "Patient")
        {
            if (user.PatientId == null)
                return Forbid();

            appointments = appointments.Where(
                a => a.PatientId == user.PatientId);
        }
        else if (user.Role == "Doctor")
        {
            if (user.DoctorId == null)
                return Forbid();

            appointments = appointments.Where(
                a => a.DoctorId == user.DoctorId);
        }
        else if (user.Role != "Admin")
        {
            return Forbid();
        }

        return Ok(await appointments.ToListAsync());
    }

    // POST: Patient creates own appointment
    // Admin can create for any patient
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        Appointment appointment)
    {
        var user = await GetCurrentUser();

        if (user == null)
            return Forbid();

        if (user.Role == "Patient")
        {
            if (user.PatientId == null)
                return Forbid();

            appointment.PatientId = user.PatientId.Value;
        }
        else if (user.Role != "Admin")
        {
            return Forbid();
        }

        var patientExists = await _context.Patients
            .AnyAsync(p => p.Id == appointment.PatientId);

        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.Id == appointment.DoctorId);

        if (!patientExists || !doctorExists)
            return BadRequest("Invalid patient or doctor");

        _context.Appointments.Add(appointment);

        await _context.SaveChangesAsync();

        return Ok(appointment);
    }

    // Admin - Full update
    // Patient - Own appointment details only
    // Doctor - Assigned appointment status only

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppointment(int id, Appointment appointment)
    {
        var user = await GetCurrentUser();
        if (user == null) return Forbid();

        var existingAppointment = await _context.Appointments.FindAsync(id);
        if (existingAppointment == null) return NotFound("Appointment not found");

        if (user.Role == "Admin")
        {
            var patientExists = await _context.Patients.AnyAsync(p => p.Id == appointment.PatientId);
            var doctorExists = await _context.Doctors.AnyAsync(d => d.Id == appointment.DoctorId);
            if (!patientExists || !doctorExists) return BadRequest("Invalid patient or doctor");

            existingAppointment.PatientId = appointment.PatientId;
            existingAppointment.DoctorId = appointment.DoctorId;
            existingAppointment.AppointmentDate = appointment.AppointmentDate;
            existingAppointment.AppointmentTime = appointment.AppointmentTime;
            existingAppointment.Status = appointment.Status;
            existingAppointment.Reason = appointment.Reason;
        }
        else if (user.Role == "Patient")
        {
            if (user.PatientId == null || existingAppointment.PatientId != user.PatientId)
                return Forbid();

            if (string.Equals(appointment.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                if (existingAppointment.Status == "Completed")
                    return BadRequest("Completed appointments cannot be cancelled");

                existingAppointment.Status = "Cancelled";
            }
            else
            {
                existingAppointment.AppointmentDate = appointment.AppointmentDate;
                existingAppointment.AppointmentTime = appointment.AppointmentTime;
                existingAppointment.Reason = appointment.Reason;
            }
        }
        else if (user.Role == "Doctor")
        {
            if (user.DoctorId == null || existingAppointment.DoctorId != user.DoctorId)
                return Forbid();

            existingAppointment.Status = appointment.Status;
        }
        else
        {
            return Forbid();
        }

        await _context.SaveChangesAsync();
        return Ok(existingAppointment);
    }

    // Only Admin can delete appointments
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var appointment =
            await _context.Appointments.FindAsync(id);

        if (appointment == null)
            return NotFound("Appointment not found");

        _context.Appointments.Remove(appointment);

        await _context.SaveChangesAsync();

        return Ok("Appointment deleted successfully");
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
