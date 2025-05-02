using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using MaritimeDataApp.Server.Controllers;
using MaritimeDataApp.Server.Data;
using MaritimeDataApp.Server.Models;

namespace MaritimeDataApp.Server.Tests.Controllers
{
    public class CountryVisitsControllerTests
    {
        private DbContextOptions<MaritimeDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<MaritimeDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;
        }

        private void SeedVoyageData(MaritimeDbContext context)
        {
            var ports = new List<Port>
            {
                new Port { Id = 1, Name = "Port A", Country = "CountryX" },
                new Port { Id = 2, Name = "Port B", Country = "CountryY" },
                new Port { Id = 3, Name = "Port C", Country = "CountryZ" },
                new Port { Id = 4, Name = "Port D", Country = "CountryX" }
            };
            context.Ports.AddRange(ports);
            context.SaveChanges();

            var voyages = new List<Voyage>
            {
                // ended within last year
                new Voyage { Id = 101, VoyageDate = DateTime.UtcNow.AddMonths(-6), DeparturePortId = 1, ArrivalPortId = 2, VoyageStart = DateTimeOffset.UtcNow.AddMonths(-6).AddDays(-5), VoyageEnd = DateTimeOffset.UtcNow.AddMonths(-6) },
                // within last year (same arrival country)
                new Voyage { Id = 102, VoyageDate = DateTime.UtcNow.AddMonths(-3), DeparturePortId = 3, ArrivalPortId = 2, VoyageStart = DateTimeOffset.UtcNow.AddMonths(-3).AddDays(-2), VoyageEnd = DateTimeOffset.UtcNow.AddMonths(-3) },
                // ended within last year (different arrival country, same departure country as 101)
                new Voyage { Id = 103, VoyageDate = DateTime.UtcNow.AddMonths(-2), DeparturePortId = 1, ArrivalPortId = 3, VoyageStart = DateTimeOffset.UtcNow.AddMonths(-2).AddDays(-4), VoyageEnd = DateTimeOffset.UtcNow.AddMonths(-2) },
                // ended within last year (departure and arrival in same country)
                new Voyage { Id = 104, VoyageDate = DateTime.UtcNow.AddMonths(-1), DeparturePortId = 1, ArrivalPortId = 4, VoyageStart = DateTimeOffset.UtcNow.AddMonths(-1).AddDays(-1), VoyageEnd = DateTimeOffset.UtcNow.AddMonths(-1) },
                // ended MORE than one year ago
                new Voyage { Id = 105, VoyageDate = DateTime.UtcNow.AddYears(-2), DeparturePortId = 2, ArrivalPortId = 3, VoyageStart = DateTimeOffset.UtcNow.AddYears(-2).AddDays(-5), VoyageEnd = DateTimeOffset.UtcNow.AddYears(-2) }
            };
            context.Voyages.AddRange(voyages);
            context.SaveChanges();
        }

        [Fact]
        public async Task GetCountriesVisitedLastYear_ReturnsOkResult_WithDistinctCountries()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedVoyageData(context);
                var controller = new CountryVisitsController(context);

                var actionResult = await controller.GetCountriesVisitedLastYear();

                var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
                var countries = Assert.IsAssignableFrom<IEnumerable<string>>(okResult.Value);

                var expectedCountries = new List<string> { "CountryX", "CountryY", "CountryZ" }.OrderBy(c => c).ToList();

                Assert.NotNull(countries);
                Assert.Equal(3, countries.Count());
                Assert.Equal(expectedCountries, countries);
            }
        }

        [Fact]
        public async Task GetCountriesVisitedLastYear_ReturnsOkResult_WithEmptyList_WhenNoVoyagesLastYear()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                context.Ports.AddRange(
                   new Port { Id = 1, Name = "Port A", Country = "CountryX" },
                   new Port { Id = 2, Name = "Port B", Country = "CountryY" }
                );
                context.SaveChanges();
                context.Voyages.Add(new Voyage { Id = 105, VoyageDate = DateTime.UtcNow.AddYears(-2), DeparturePortId = 1, ArrivalPortId = 2, VoyageStart = DateTimeOffset.UtcNow.AddYears(-2).AddDays(-5), VoyageEnd = DateTimeOffset.UtcNow.AddYears(-2) });
                context.SaveChanges();

                var controller = new CountryVisitsController(context);

                var actionResult = await controller.GetCountriesVisitedLastYear();

                var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
                var countries = Assert.IsAssignableFrom<IEnumerable<string>>(okResult.Value);
                Assert.Empty(countries);
            }
        }
    }
}
