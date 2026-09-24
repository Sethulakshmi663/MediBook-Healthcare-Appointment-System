using System.ComponentModel.DataAnnotations;

namespace MediBook.Api.Models
{
    public class Patient
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public int Age { get; set; }

        [Required]
        public string Gender { get; set; }

        [Required]
        public string Phone { get; set; }

        public string Email { get; set; }

        public string Address { get; set; }
    }
}

