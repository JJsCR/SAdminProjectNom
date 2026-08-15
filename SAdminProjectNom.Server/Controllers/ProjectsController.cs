using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetAll()
        {
            return await _context.Projects
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Project>> Create([FromBody] CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                ClienteId = dto.ClienteId,
                Ubicacion = dto.Ubicacion,
                MontoObra = dto.MontoObra,
                Estado = dto.Estado,
                FechaInicio = dto.FechaInicio,
                FechaFinEstimada = dto.FechaFinEstimada,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = project.Id }, project);
        }
    }

    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public int ClienteId { get; set; }
        public string Ubicacion { get; set; } = string.Empty;
        public decimal MontoObra { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFinEstimada { get; set; }
    }
}
