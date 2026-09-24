using Microsoft.EntityFrameworkCore;
using MediBook.Api.Models;

namespace MediBook.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Patient> Patients { get; set; }

    public DbSet<Appointment> Appointments { get; set; }
}