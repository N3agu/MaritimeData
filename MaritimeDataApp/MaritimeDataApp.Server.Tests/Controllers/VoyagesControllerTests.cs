using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using MaritimeDataApp.Server.Controllers;
using MaritimeDataApp.Server.Data;
using MaritimeDataApp.Server.Models;

namespace MaritimeDataApp.Server.Tests.Controllers
{
    public class VoyagesControllerTests
    {
        private DbContextOptions<MaritimeDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<MaritimeDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        private void SeedData(MaritimeDbContext context)
        {
            var ports = new List<Port>
            {
                new Port { Id = 1, Name = "Port A", Country = "CountryX" },
                new Port { Id = 2, Name = "Port B", Country = "CountryY" }
            };
            context.Ports.AddRange(ports);
            context.SaveChanges();

            var voyages = new List<Voyage>
            {
                new Voyage { Id = 101, VoyageDate = DateTime.UtcNow.AddDays(-10), DeparturePortId = 1, ArrivalPortId = 2, VoyageStart = DateTimeOffset.UtcNow.AddDays(-10).AddHours(-5), VoyageEnd = DateTimeOffset.UtcNow.AddDays(-8) },
                new Voyage { Id = 102, VoyageDate = DateTime.UtcNow.AddDays(-5), DeparturePortId = 2, ArrivalPortId = 1, VoyageStart = DateTimeOffset.UtcNow.AddDays(-5).AddHours(-3), VoyageEnd = DateTimeOffset.UtcNow.AddDays(-3) }
            };
            context.Voyages.AddRange(voyages);
            context.SaveChanges();
        }

        [Fact]
        public async Task GetVoyages_ReturnsOkResult_WithListOfVoyagesIncludingPorts()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedData(context);
                var controller = new VoyagesController(context);

                var actionResult = await controller.GetVoyages();

                Assert.NotNull(actionResult);
                var voyages = Assert.IsAssignableFrom<IEnumerable<Voyage>>(actionResult.Value);
                Assert.NotNull(voyages);
                Assert.Equal(2, voyages.Count());
                
                var firstVoyage = voyages.First();
                Assert.Equal(102, firstVoyage.Id);
                Assert.NotNull(firstVoyage.DeparturePort);
                Assert.NotNull(firstVoyage.ArrivalPort);

                Assert.Equal("Port B", firstVoyage.DeparturePort.Name);
                Assert.Equal("Port A", firstVoyage.ArrivalPort.Name);
            }
        }


        [Fact]
        public async Task GetVoyage_ReturnsNotFoundResult_WhenVoyageDoesNotExist()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new VoyagesController(context);
                int nonExistentId = 999;

                var actionResult = await controller.GetVoyage(nonExistentId);

                var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
                Assert.Equal($"Voyage with ID {nonExistentId} not found.", notFoundResult.Value);
            }
        }

        [Fact]
        public async Task GetVoyage_ReturnsOkResult_WithVoyage_WhenVoyageExists()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedData(context);
                var controller = new VoyagesController(context);
                int existingId = 101;

                var actionResult = await controller.GetVoyage(existingId);

                Assert.NotNull(actionResult);
                var voyage = Assert.IsType<Voyage>(actionResult.Value);
                Assert.NotNull(voyage);
                Assert.Equal(existingId, voyage.Id);
                Assert.NotNull(voyage.DeparturePort);
                Assert.Equal(1, voyage.DeparturePortId);
            }
        }

        [Fact]
        public async Task PostVoyage_ReturnsCreatedAtActionResult_WithVoyage()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                context.Ports.AddRange(
                   new Port { Id = 1, Name = "Port A", Country = "CountryX" },
                   new Port { Id = 2, Name = "Port B", Country = "CountryY" }
                );
                context.SaveChanges();

                var controller = new VoyagesController(context);
                var newVoyageData = new Voyage
                {
                    VoyageDate = DateTime.UtcNow.AddDays(1),
                    DeparturePortId = 1,
                    ArrivalPortId = 2,
                    VoyageStart = DateTimeOffset.UtcNow.AddDays(1).AddHours(2),
                    VoyageEnd = DateTimeOffset.UtcNow.AddDays(3)
                };

                var actionResult = await controller.PostVoyage(newVoyageData);

                var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
                var createdVoyage = Assert.IsType<Voyage>(createdAtActionResult.Value);
                Assert.Equal(newVoyageData.DeparturePortId, createdVoyage.DeparturePortId);
                Assert.Equal(newVoyageData.ArrivalPortId, createdVoyage.ArrivalPortId);
                Assert.Equal(newVoyageData.VoyageDate, createdVoyage.VoyageDate);
                Assert.True(createdVoyage.Id > 0);
                Assert.Equal(nameof(controller.GetVoyage), createdAtActionResult.ActionName);
                Assert.NotNull(createdVoyage.DeparturePort); // Check included data in response
                Assert.NotNull(createdVoyage.ArrivalPort);

                var voyageInDb = await context.Voyages.FindAsync(createdVoyage.Id);
                Assert.NotNull(voyageInDb);
                Assert.Equal(newVoyageData.DeparturePortId, voyageInDb.DeparturePortId);
            }
        }

        [Fact]
        public async Task PostVoyage_ReturnsBadRequest_WhenPortDoesNotExist()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                context.Ports.Add(new Port { Id = 1, Name = "Port A", Country = "CountryX" });
                context.SaveChanges();

                var controller = new VoyagesController(context);
                var newVoyageData = new Voyage { DeparturePortId = 1, ArrivalPortId = 99 }; // Invalid Arrival Port

                var actionResult = await controller.PostVoyage(newVoyageData);

                var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
                Assert.Equal("Invalid Departure or Arrival Port ID provided.", badRequestResult.Value);
            }
        }


        [Fact]
        public async Task PutVoyage_ReturnsNoContentResult_WhenUpdateIsSuccessful()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedData(context);
                var controller = new VoyagesController(context);
                int voyageIdToUpdate = 101;

                var existingVoyage = await context.Voyages.FindAsync(voyageIdToUpdate);
                Assert.NotNull(existingVoyage);
                context.Entry(existingVoyage).State = EntityState.Detached;

                var voyageToUpdate = new Voyage
                {
                    Id = voyageIdToUpdate,
                    VoyageDate = DateTime.UtcNow.AddDays(1),
                    DeparturePortId = existingVoyage.DeparturePortId,
                    ArrivalPortId = existingVoyage.ArrivalPortId,
                    VoyageStart = existingVoyage.VoyageStart.AddHours(1),
                    VoyageEnd = existingVoyage.VoyageEnd.AddHours(2)
                };

                var result = await controller.PutVoyage(voyageIdToUpdate, voyageToUpdate);

                Assert.IsType<NoContentResult>(result);

                var updatedVoyageInDb = await context.Voyages.FindAsync(voyageIdToUpdate);
                Assert.NotNull(updatedVoyageInDb);
                Assert.Equal(voyageToUpdate.VoyageDate, updatedVoyageInDb.VoyageDate);
                Assert.Equal(voyageToUpdate.VoyageStart, updatedVoyageInDb.VoyageStart);
                Assert.Equal(voyageToUpdate.VoyageEnd, updatedVoyageInDb.VoyageEnd);
            }
        }

        [Fact]
        public async Task DeleteVoyage_ReturnsNoContentResult_WhenDeleteIsSuccessful()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedData(context);
                var controller = new VoyagesController(context);
                int voyageIdToDelete = 101;

                var result = await controller.DeleteVoyage(voyageIdToDelete);

                Assert.IsType<NoContentResult>(result);

                var deletedVoyage = await context.Voyages.FindAsync(voyageIdToDelete);
                Assert.Null(deletedVoyage);
                Assert.Equal(1, await context.Voyages.CountAsync()); // Only voyage 102 should remain
            }
        }

        [Fact]
        public async Task DeleteVoyage_ReturnsNotFoundResult_WhenVoyageDoesNotExist()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new VoyagesController(context);
                int nonExistentId = 999;

                var result = await controller.DeleteVoyage(nonExistentId);

                var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
                Assert.Equal($"Voyage with ID {nonExistentId} not found.", notFoundResult.Value);
            }
        }
    }
}
