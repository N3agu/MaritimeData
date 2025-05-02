using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MaritimeDataApp.Server.Models
{
    public class Voyage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime VoyageDate { get; set; }

        [Required]
        public int DeparturePortId { get; set; }

        [Required]
        public int ArrivalPortId { get; set; }

        [Required]
        public DateTimeOffset VoyageStart { get; set; } // timezone awareness

        [Required]
        public DateTimeOffset VoyageEnd { get; set; }

        [ForeignKey("DeparturePortId")]
        public virtual Port? DeparturePort { get; set; }

        [ForeignKey("ArrivalPortId")]
        public virtual Port? ArrivalPort { get; set; }

        // public int ShipId { get; set; }
        // [ForeignKey("ShipId")]
        // public virtual Ship? Ship { get; set; }
    }
}
