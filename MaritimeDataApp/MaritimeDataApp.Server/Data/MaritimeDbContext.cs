using MaritimeDataApp.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace MaritimeDataApp.Server.Data
{
    public class MaritimeDbContext : DbContext
    {
        public MaritimeDbContext(DbContextOptions<MaritimeDbContext> options) : base(options)
        {
        }

        public DbSet<Ship> Ships { get; set; } = null!;
        public DbSet<Port> Ports { get; set; } = null!;
        public DbSet<Voyage> Voyages { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Voyage>()
                .HasOne(v => v.DeparturePort)
                .WithMany(p => p.DepartingVoyages)
                .HasForeignKey(v => v.DeparturePortId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Voyage>()
                .HasOne(v => v.ArrivalPort)
                .WithMany(p => p.ArrivingVoyages)
                .HasForeignKey(v => v.ArrivalPortId)
                .OnDelete(DeleteBehavior.Restrict);

            // initial testing
            modelBuilder.Entity<Port>().HasData(
                new Port { Id = 101, Name = "Port of Rotterdam", Country = "Netherlands" },
                new Port { Id = 102, Name = "Port of Singapore", Country = "Singapore" },
                new Port { Id = 103, Name = "Port of Hamburg", Country = "Germany" },
                new Port { Id = 104, Name = "Port of Los Angeles", Country = "USA" },
                new Port { Id = 105, Name = "Port Constanta", Country = "Romania" }
            );

            modelBuilder.Entity<Ship>().HasData(
                 new Ship { Id = 1, Name = "Ocean Voyager", MaxSpeed = 25 },
                 new Ship { Id = 2, Name = "Sea Serpent", MaxSpeed = 18 },
                 new Ship { Id = 3, Name = "Coastal Runner", MaxSpeed = 35 }
            );

            modelBuilder.Entity<Voyage>().HasData(
               new Voyage { Id = 1001, VoyageDate = new DateTime(2025, 4, 15), DeparturePortId = 101, ArrivalPortId = 103, VoyageStart = new DateTimeOffset(2025, 4, 15, 8, 0, 0, TimeSpan.Zero), VoyageEnd = new DateTimeOffset(2025, 4, 18, 16, 0, 0, TimeSpan.Zero) },
               new Voyage { Id = 1002, VoyageDate = new DateTime(2025, 4, 20), DeparturePortId = 102, ArrivalPortId = 104, VoyageStart = new DateTimeOffset(2025, 4, 20, 12, 0, 0, TimeSpan.Zero), VoyageEnd = new DateTimeOffset(2025, 5, 5, 10, 0, 0, TimeSpan.Zero) }
            );
        }
    }
}
