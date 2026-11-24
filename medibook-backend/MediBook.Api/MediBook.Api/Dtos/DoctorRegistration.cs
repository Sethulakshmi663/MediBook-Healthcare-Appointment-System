
using System.ComponentModel.DataAnnotations;

namespace MediBook.Api.Dtos
{
    public class DoctorRegistration
    {
        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Specialization { get; set; }

        [Required]
        public required string Experience { get; set; }

        public bool IsAvailable { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [MinLength(6)]
        public required string Password { get; set; }
    }
}
