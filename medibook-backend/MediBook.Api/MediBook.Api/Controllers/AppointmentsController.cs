
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.Api.Data;
using MediBook.Api.Models;

namespace MediBook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AppointmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Appointments
    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var appointments = await _context.Appointments.ToListAsync();

        return Ok(appointments);
    }

    // POST: api/Appointments
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        Appointment appointment)
    {
        _context.Appointments.Add(appointment);

        await _context.SaveChangesAsync();

        return Ok(appointment);
    }

    // PUT: api/Appointments/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppointment(
        int id,
        Appointment appointment)
    {
        var existingAppointment =
            await _context.Appointments.FindAsync(id);

        if (existingAppointment == null)
        {
            return NotFound("Appointment not found");
        }

        existingAppointment.PatientId = appointment.PatientId;
        existingAppointment.DoctorId = appointment.DoctorId;
        existingAppointment.AppointmentDate =
            appointment.AppointmentDate;
        existingAppointment.AppointmentTime =
            appointment.AppointmentTime;
        existingAppointment.Status = appointment.Status;
        existingAppointment.Reason = appointment.Reason;

        await _context.SaveChangesAsync();

        return Ok(existingAppointment);
    }

    // DELETE: api/Appointments/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var appointment =
            await _context.Appointments.FindAsync(id);

        if (appointment == null)
        {
            return NotFound("Appointment not found");
        }

        _context.Appointments.Remove(appointment);

        await _context.SaveChangesAsync();

        return Ok("Appointment deleted successfully");
    }
}