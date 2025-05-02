using MaritimeDataApp.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MaritimeDataApp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountryVisitsController : ControllerBase
    {
        private readonly MaritimeDbContext _context;

        public CountryVisitsController(MaritimeDbContext context)
        {
            _context = context;
        }

        // GET: api/countryvisits/lastyear
        [HttpGet("lastyear")]
        public async Task<ActionResult<IEnumerable<string>>> GetCountriesVisitedLastYear()
        {
            var oneYearAgo = DateTimeOffset.UtcNow.AddYears(-1);

            // Query voyages that ended within the last year
            var voyagesLastYear = await _context.Voyages
                .Where(v => v.VoyageEnd >= oneYearAgo)
                .Include(v => v.ArrivalPort)
                .Include(v => v.DeparturePort)
                .ToListAsync();

            // get distinct countries from both departure and arrival
            var arrivalCountries = voyagesLastYear
                .Where(v => v.ArrivalPort != null)
                .Select(v => v.ArrivalPort!.Country);

            var departureCountries = voyagesLastYear
                 .Where(v => v.DeparturePort != null)
                 .Select(v => v.DeparturePort!.Country);

            var distinctCountries = arrivalCountries
                .Concat(departureCountries) // combine lists
                .Where(c => !string.IsNullOrEmpty(c))
                .Distinct()
                .OrderBy(country => country);

            if (!distinctCountries.Any())
            {
                return Ok(new List<string>());
            }

            return Ok(distinctCountries.ToList());
        }
    }
}
