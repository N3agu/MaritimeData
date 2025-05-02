using System.ComponentModel.DataAnnotations;

namespace MaritimeDataApp.Server.Models
{
    public class Ship
    {
        [Key]
        public int Id { get; set; }

        [Required] // name required
        [StringLength(100)] // maximum length
        public string Name { get; set; } = string.Empty;

        [Range(0, 1000)]
        public decimal MaxSpeed { get; set; }
    }
}
