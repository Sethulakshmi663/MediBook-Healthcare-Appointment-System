
using System.ComponentModel.DataAnnotations;

namespace MediBook.Api.Dtos
{
    public class Registration
    {
        [Required]
        public required string Name { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [MinLength(6)]
        public required string Password { get; set; }

        [Required]
        [Range(1, 120)]
        public required int Age { get; set; }

        [Required]
        public required string Gender { get; set; }

        [Required]
        public required string Phone { get; set; }

        public string? Address { get; set; }
    }
}
