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

            var countries = await _context.Voyages
                .Where(v => v.VoyageEnd >= oneYearAgo) // last year
                .Include(v => v.ArrivalPort)
                .Select(v => v.ArrivalPort!.Country)
                .Distinct()
                .OrderBy(country => country) // alphabetically
                .ToListAsync();

            if (countries == null || !countries.Any())
            {
                return Ok(new List<string>());
            }

            return Ok(countries);
        }
    }
}
