using System.ComponentModel.DataAnnotations;

namespace MediBook.Api.Models;

public class Appointment
{
    public int Id { get; set; }

    [Required]
    public int PatientId { get; set; }

    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    public string AppointmentTime { get; set; }

    [Required]
    public string Status { get; set; }

    public string Reason { get; set; }
}