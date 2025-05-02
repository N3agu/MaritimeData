using MaritimeDataApp.Server.Data;
using MaritimeDataApp.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MaritimeDataApp.Server.Controllers
{
    [Route("api/[controller]")] // /api/ports
    [ApiController]
    public class PortsController : ControllerBase
    {
        private readonly MaritimeDbContext _context;

        public PortsController(MaritimeDbContext context)
        {
            _context = context;
        }

        // GET: api/ports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Port>>> GetPorts()
        {
            return await _context.Ports.ToListAsync();
        }

        // GET: api/ports/101
        [HttpGet("{id}")]
        public async Task<ActionResult<Port>> GetPort(int id)
        {
            var port = await _context.Ports.FindAsync(id);

            if (port == null)
            {
                return NotFound($"Port with ID {id} not found.");
            }

            return port;
        }

        // POST: api/ports
        [HttpPost]
        public async Task<ActionResult<Port>> PostPort(Port port)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.Ports.Add(port);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPort), new { id = port.Id }, port);
        }

        // PUT: api/ports/101
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPort(int id, Port port)
        {
            if (id != port.Id) return BadRequest("ID mismatch.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.Entry(port).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PortExists(id)) return NotFound($"Port with ID {id} not found.");
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/ports/101
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePort(int id)
        {
            var port = await _context.Ports.FindAsync(id);
            if (port == null) return NotFound($"Port with ID {id} not found.");

            // Check if port is used in any voyages before deleting
            bool isInUse = await _context.Voyages.AnyAsync(v => v.DeparturePortId == id || v.ArrivalPortId == id);
            if (isInUse)
            {
                return BadRequest($"Cannot delete Port ID {id} because it is referenced by existing Voyages.");
            }

            _context.Ports.Remove(port);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PortExists(int id)
        {
            return _context.Ports.Any(e => e.Id == id);
        }
    }
}
