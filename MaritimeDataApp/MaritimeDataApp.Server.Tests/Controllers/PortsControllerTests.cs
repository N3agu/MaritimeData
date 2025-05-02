using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using MaritimeDataApp.Server.Controllers;
using MaritimeDataApp.Server.Data;
using MaritimeDataApp.Server.Models;

namespace MaritimeDataApp.Server.Tests.Controllers
{
    public class PortsControllerTests
    {
        private DbContextOptions<MaritimeDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<MaritimeDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        private void SeedPorts(MaritimeDbContext context)
        {
            context.Ports.AddRange(
                new Port { Id = 1, Name = "Test Port 1", Country = "Country A" },
                new Port { Id = 2, Name = "Test Port 2", Country = "Country B" }
            );
            context.SaveChanges();
        }

        private void SeedVoyagesForPortConstraint(MaritimeDbContext context)
        {
            SeedPorts(context);
            context.Voyages.Add(new Voyage
            {
                Id = 101,
                VoyageDate = DateTime.UtcNow.AddMonths(-1),
                DeparturePortId = 1, // Port 1
                ArrivalPortId = 2,
                VoyageStart = DateTimeOffset.UtcNow.AddMonths(-1).AddDays(-2),
                VoyageEnd = DateTimeOffset.UtcNow.AddMonths(-1)
            });
            context.SaveChanges();
        }

        [Fact]
        public async Task GetPorts_ReturnsOkResult_WithListOfPorts()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedPorts(context);
                var controller = new PortsController(context);

                var actionResult = await controller.GetPorts();

                Assert.NotNull(actionResult);
                var ports = Assert.IsAssignableFrom<IEnumerable<Port>>(actionResult.Value);
                Assert.NotNull(ports);
                Assert.Equal(2, ports.Count());
            }
        }

        [Fact]
        public async Task GetPort_ReturnsNotFoundResult_WhenPortDoesNotExist()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new PortsController(context);
                int nonExistentId = 99;

                var actionResult = await controller.GetPort(nonExistentId);

                var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
                Assert.Equal($"Port with ID {nonExistentId} not found.", notFoundResult.Value);
            }
        }

        [Fact]
        public async Task GetPort_ReturnsOkResult_WithPort_WhenPortExists()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedPorts(context);
                var controller = new PortsController(context);
                int existingId = 1;

                var actionResult = await controller.GetPort(existingId);

                Assert.NotNull(actionResult);
                var port = Assert.IsType<Port>(actionResult.Value);
                Assert.NotNull(port);
                Assert.Equal(existingId, port.Id);
                Assert.Equal("Test Port 1", port.Name);
            }
        }

        [Fact]
        public async Task PostPort_ReturnsCreatedAtActionResult_WithPort()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new PortsController(context);
                var newPortData = new Port { Name = "New Port", Country = "Country C" };

                var actionResult = await controller.PostPort(newPortData);

                var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
                var createdPort = Assert.IsType<Port>(createdAtActionResult.Value);
                Assert.Equal(newPortData.Name, createdPort.Name);
                Assert.Equal(newPortData.Country, createdPort.Country);
                Assert.True(createdPort.Id > 0);
                Assert.Equal(nameof(controller.GetPort), createdAtActionResult.ActionName);

                var portInDb = await context.Ports.FindAsync(createdPort.Id);
                Assert.NotNull(portInDb);
                Assert.Equal(newPortData.Name, portInDb.Name);
            }
        }

        [Fact]
        public async Task PutPort_ReturnsNoContentResult_WhenUpdateIsSuccessful()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedPorts(context);
                var controller = new PortsController(context);
                int portIdToUpdate = 1;

                var existingPort = await context.Ports.FindAsync(portIdToUpdate);
                Assert.NotNull(existingPort);
                context.Entry(existingPort).State = EntityState.Detached;

                var portToUpdate = new Port { Id = portIdToUpdate, Name = "Updated Port Name", Country = "Country D" };

                var result = await controller.PutPort(portIdToUpdate, portToUpdate);

                Assert.IsType<NoContentResult>(result);

                var updatedPortInDb = await context.Ports.FindAsync(portIdToUpdate);
                Assert.NotNull(updatedPortInDb);
                Assert.Equal("Updated Port Name", updatedPortInDb.Name);
                Assert.Equal("Country D", updatedPortInDb.Country);
            }
        }

        [Fact]
        public async Task PutPort_ReturnsBadRequest_WhenIdMismatch()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new PortsController(context);
                int urlId = 1;
                var portWithDifferentId = new Port { Id = 2, Name = "Mismatch", Country = "X" };

                var result = await controller.PutPort(urlId, portWithDifferentId);

                var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
                Assert.Equal("ID mismatch.", badRequestResult.Value);
            }
        }

        [Fact]
        public async Task DeletePort_ReturnsNoContentResult_WhenDeleteIsSuccessful()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedPorts(context);
                var controller = new PortsController(context);
                int portIdToDelete = 2;

                var result = await controller.DeletePort(portIdToDelete);

                Assert.IsType<NoContentResult>(result);

                var deletedPort = await context.Ports.FindAsync(portIdToDelete);
                Assert.Null(deletedPort);
                Assert.Equal(1, await context.Ports.CountAsync());
            }
        }

        [Fact]
        public async Task DeletePort_ReturnsBadRequest_WhenPortIsInUse()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                SeedVoyagesForPortConstraint(context);
                var controller = new PortsController(context);
                int portIdToDelete = 1; // try to delete port 1 which is in use

                var result = await controller.DeletePort(portIdToDelete);

                var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
                Assert.Equal($"Cannot delete Port ID {portIdToDelete} because it is referenced by existing Voyages.", badRequestResult.Value);

                // Verify that the port WAS NOT deleted
                var portInDb = await context.Ports.FindAsync(portIdToDelete);
                Assert.NotNull(portInDb);
            }
        }

        [Fact]
        public async Task DeletePort_ReturnsNotFoundResult_WhenPortDoesNotExist()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new PortsController(context);
                int nonExistentId = 99;

                var result = await controller.DeletePort(nonExistentId);

                var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
                Assert.Equal($"Port with ID {nonExistentId} not found.", notFoundResult.Value);
            }
        }
    }
}