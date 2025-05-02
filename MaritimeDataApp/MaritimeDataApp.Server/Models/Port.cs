using System.ComponentModel.DataAnnotations;

namespace MaritimeDataApp.Server.Models
{
    public class Port
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        public virtual ICollection<Voyage> DepartingVoyages { get; set; } = new List<Voyage>();
        public virtual ICollection<Voyage> ArrivingVoyages { get; set; } = new List<Voyage>();
    }
}
