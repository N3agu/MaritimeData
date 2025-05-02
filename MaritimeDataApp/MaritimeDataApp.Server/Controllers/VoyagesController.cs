using MaritimeDataApp.Server.Data;
using MaritimeDataApp.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MaritimeDataApp.Server.Controllers
{
    [Route("api/[controller]")] // /api/voyages
    [ApiController]
    public class VoyagesController : ControllerBase
    {
        private readonly MaritimeDbContext _context;

        public VoyagesController(MaritimeDbContext context)
        {
            _context = context;
        }

        // GET: api/voyages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voyage>>> GetVoyages()
        {
            return await _context.Voyages
                                 .Include(v => v.DeparturePort)
                                 .Include(v => v.ArrivalPort) 
                                 .OrderByDescending(v => v.VoyageDate)
                                 .ToListAsync();
        }

        // GET: api/voyages/1001
        [HttpGet("{id}")]
        public async Task<ActionResult<Voyage>> GetVoyage(int id)
        {
            var voyage = await _context.Voyages
                                       .Include(v => v.DeparturePort)
                                       .Include(v => v.ArrivalPort)
                                       .FirstOrDefaultAsync(v => v.Id == id);

            if (voyage == null)
            {
                return NotFound($"Voyage with ID {id} not found.");
            }

            return voyage;
        }

        // POST: api/voyages
        [HttpPost]
        public async Task<ActionResult<Voyage>> PostVoyage(Voyage voyage)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var departurePortExists = await _context.Ports.AnyAsync(p => p.Id == voyage.DeparturePortId);
            var arrivalPortExists = await _context.Ports.AnyAsync(p => p.Id == voyage.ArrivalPortId);

            if (!departurePortExists || !arrivalPortExists)
            {
                return BadRequest("Invalid Departure or Arrival Port ID provided.");
            }

            _context.Voyages.Add(voyage);
            await _context.SaveChangesAsync();

            // Refetch data
            var createdVoyage = await _context.Voyages
                                      .Include(v => v.DeparturePort)
                                      .Include(v => v.ArrivalPort)
                                      .FirstOrDefaultAsync(v => v.Id == voyage.Id);


            return CreatedAtAction(nameof(GetVoyage), new { id = voyage.Id }, createdVoyage);
        }

        // PUT: api/voyages/1001
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVoyage(int id, Voyage voyage)
        {
            if (id != voyage.Id) return BadRequest("ID mismatch.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Check if port exists
            var departurePortExists = await _context.Ports.AnyAsync(p => p.Id == voyage.DeparturePortId);
            var arrivalPortExists = await _context.Ports.AnyAsync(p => p.Id == voyage.ArrivalPortId);
            if (!departurePortExists || !arrivalPortExists)
            {
                return BadRequest("Invalid Departure or Arrival Port ID provided.");
            }

            _context.Entry(voyage).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VoyageExists(id)) return NotFound($"Voyage with ID {id} not found.");
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/voyages/1001
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoyage(int id)
        {
            var voyage = await _context.Voyages.FindAsync(id);
            if (voyage == null) return NotFound($"Voyage with ID {id} not found.");

            _context.Voyages.Remove(voyage);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VoyageExists(int id)
        {
            return _context.Voyages.Any(e => e.Id == id);
        }
    }
}
