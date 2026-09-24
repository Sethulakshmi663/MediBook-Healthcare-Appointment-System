namespace MediBook.Api.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        public string Name { get; set; }    
        public string Specialization { get; set; }

        public string Experience { get; set; }

        public bool IsAvailable { get; set; }
    }
}
