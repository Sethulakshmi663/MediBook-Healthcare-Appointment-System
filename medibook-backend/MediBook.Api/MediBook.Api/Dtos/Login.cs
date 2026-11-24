using System.ComponentModel.DataAnnotations;
namespace MediBook.Api.Dtos

{
    public class Login
    {
        [Required]
        [EmailAddress] public required string Email { get; set; }
        [Required]
        public  required string Password { get; set; }

    }
}
