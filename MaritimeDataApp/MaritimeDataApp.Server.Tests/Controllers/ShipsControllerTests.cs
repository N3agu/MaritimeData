using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using MaritimeDataApp.Server.Data;
using MaritimeDataApp.Server.Models;
using MaritimeDataApp.Server.Controllers;

namespace MaritimeDataApp.Server.Tests.Controllers
{
    public class ShipsControllerTests
    {
        private DbContextOptions<MaritimeDbContext> CreateNewContextOptions()
        {
            return new DbContextOptionsBuilder<MaritimeDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;
        }

        private void AddTestData(MaritimeDbContext context)
        {
            context.Ships.AddRange(
                new Ship { Id = 1, Name = "Test Ship 1", MaxSpeed = 20 },
                new Ship { Id = 2, Name = "Test Ship 2", MaxSpeed = 30 }
            );
            context.SaveChanges();
        }

        [Fact]
        public async Task GetShips_ReturnsOkResult_WithListOfShips()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                AddTestData(context);
                var controller = new ShipsController(context);

                var result = await controller.GetShips();

                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var ships = Assert.IsAssignableFrom<IEnumerable<Ship>>(okResult.Value);
                Assert.Equal(2, ships.Count());
            }
        }

        [Fact]
        public async Task GetShip_ReturnsNotFoundResult_WhenShipDoesNotExist()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new ShipsController(context);
                int nonExistentId = 99;

                var result = await controller.GetShip(nonExistentId);

                var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
                Assert.Equal($"Ship with ID {nonExistentId} not found.", notFoundResult.Value);
            }
        }

        [Fact]
        public async Task GetShip_ReturnsOkResult_WithShip_WhenShipExists()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                AddTestData(context);
                var controller = new ShipsController(context);
                int existingId = 1;

                var result = await controller.GetShip(existingId);

                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var ship = Assert.IsType<Ship>(okResult.Value);
                Assert.Equal(existingId, ship.Id);
                Assert.Equal("Test Ship 1", ship.Name);
            }
        }

        [Fact]
        public async Task PostShip_ReturnsCreatedAtActionResult_WithShip()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new ShipsController(context);
                var newShip = new Ship { Name = "New Ship", MaxSpeed = 25 };

                // Act
                var result = await controller.PostShip(newShip);

                // Assert
                var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
                var createdShip = Assert.IsType<Ship>(createdAtActionResult.Value);
                Assert.Equal(newShip.Name, createdShip.Name);
                Assert.Equal(newShip.MaxSpeed, createdShip.MaxSpeed);
                Assert.True(createdShip.Id > 0);
                Assert.Equal(nameof(controller.GetShip), createdAtActionResult.ActionName);

                var shipInDb = await context.Ships.FindAsync(createdShip.Id);
                Assert.NotNull(shipInDb);
                Assert.Equal(newShip.Name, shipInDb.Name);
            }
        }

        [Fact]
        public async Task PutShip_ReturnsNoContentResult_WhenUpdateIsSuccessful()
        {
            // Arrange
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                AddTestData(context);
                var controller = new ShipsController(context);
                int shipIdToUpdate = 1;

                var existingShip = await context.Ships.FindAsync(shipIdToUpdate);
                Assert.NotNull(existingShip);

                context.Entry(existingShip).State = EntityState.Detached;

                var shipToUpdate = new Ship { Id = shipIdToUpdate, Name = "Updated Ship Name", MaxSpeed = 99 };

                var result = await controller.PutShip(shipIdToUpdate, shipToUpdate);

                Assert.IsType<NoContentResult>(result);

                var updatedShipInDb = await context.Ships.FindAsync(shipIdToUpdate);
                Assert.NotNull(updatedShipInDb);
                Assert.Equal("Updated Ship Name", updatedShipInDb.Name);
                Assert.Equal(99, updatedShipInDb.MaxSpeed);
            }
        }

        [Fact]
        public async Task PutShip_ReturnsBadRequest_WhenIdMismatch()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new ShipsController(context);
                int urlId = 1;
                var shipWithDifferentId = new Ship { Id = 2, Name = "Mismatch", MaxSpeed = 10 };

                var result = await controller.PutShip(urlId, shipWithDifferentId);

                var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
                Assert.Equal("ID mismatch between URL and ship data.", badRequestResult.Value);
            }
        }

        [Fact]
        public async Task DeleteShip_ReturnsNoContentResult_WhenDeleteIsSuccessful()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                AddTestData(context);
                var controller = new ShipsController(context);
                int shipIdToDelete = 1;

                var result = await controller.DeleteShip(shipIdToDelete);

                Assert.IsType<NoContentResult>(result);

                var deletedShip = await context.Ships.FindAsync(shipIdToDelete);
                Assert.Null(deletedShip);
                Assert.Equal(1, await context.Ships.CountAsync());
            }
        }

        [Fact]
        public async Task DeleteShip_ReturnsNotFoundResult_WhenShipDoesNotExist()
        {
            var options = CreateNewContextOptions();
            using (var context = new MaritimeDbContext(options))
            {
                var controller = new ShipsController(context);
                int nonExistentId = 99;

                var result = await controller.DeleteShip(nonExistentId);

                var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
                Assert.Equal($"Ship with ID {nonExistentId} not found.", notFoundResult.Value);
            }
        }
    }
}