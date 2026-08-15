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
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Project>> Create([FromBody] CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = project.Id }, project);
        }
    }

    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
