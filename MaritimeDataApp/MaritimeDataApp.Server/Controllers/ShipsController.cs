using MaritimeDataApp.Server.Data;
using MaritimeDataApp.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MaritimeDataApp.Server.Controllers
{
    [Route("api/[controller]")] // /api/ships
    [ApiController]
    public class ShipsController : ControllerBase
    {
        private readonly MaritimeDbContext _context;

        public ShipsController(MaritimeDbContext context)
        {
            _context = context;
        }

        // GET: api/ships
        // Retrieves all ships
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ship>>> GetShips()
        {
            var ships = await _context.Ships.ToListAsync();
            return Ok(ships);
        }

        // GET: api/ships/5
        // Retrieves a specific ship by its ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Ship>> GetShip(int id)
        {
            var ship = await _context.Ships.FindAsync(id);

            if (ship == null)
            {
                return NotFound($"Ship with ID {id} not found.");
            }

            return Ok(ship);
        }

        // POST: api/ships
        // Creates a new ship
        [HttpPost]
        public async Task<ActionResult<Ship>> PostShip(Ship ship)
        {
            // Check if the model state is valid (based on annotations like [Required])
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Ships.Add(ship);
            await _context.SaveChangesAsync();

            // The CreatedAtAction result includes a 'Location' header in the response
            return CreatedAtAction(nameof(GetShip), new { id = ship.Id }, ship);
        }

        // PUT: api/ships/5
        // Updates an existing ship
        [HttpPut("{id}")]
        public async Task<IActionResult> PutShip(int id, Ship ship)
        {
            if (id != ship.Id)
            {
                return BadRequest("ID mismatch between URL and ship data.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(ship).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // handle the case when the ship was deleted by another user
                if (!ShipExists(id))
                {
                    return NotFound($"Ship with ID {id} not found.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/ships/5
        // Deletes a ship
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShip(int id)
        {
            var ship = await _context.Ships.FindAsync(id);
            if (ship == null)
            {
                return NotFound($"Ship with ID {id} not found.");
            }

            _context.Ships.Remove(ship);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ShipExists(int id)
        {
            return _context.Ships.Any(e => e.Id == id);
        }
    }
}
