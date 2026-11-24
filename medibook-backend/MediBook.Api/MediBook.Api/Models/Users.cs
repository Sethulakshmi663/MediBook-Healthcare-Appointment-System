using System.ComponentModel.DataAnnotations;

namespace MediBook.Api.Models
{
    public class Users
    {
        public int Id { get; set; }

        [Required]
        public required string Name { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public  string PasswordHash { get; set; }

        [Required]
        public required string Role { get; set; }

        public int? DoctorId { get; set; }

        public int? PatientId { get; set; }
    }
}