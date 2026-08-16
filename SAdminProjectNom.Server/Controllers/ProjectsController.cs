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
        public async Task<ActionResult<IEnumerable<ProjectListDto>>> GetAll()
        {
            var projects = await _context.Projects
                .Include(p => p.Cliente)
                .Include(p => p.ProyectoTrabajadores)
                .Include(p => p.Abonos)
                .OrderByDescending(p => p.FechaCreacion)
                .Select(p => new ProjectListDto
                {
                    Id = p.Id,
                    Nombre = p.Name,
                    ClienteNombre = p.Cliente != null ? p.Cliente.Nombre + " " + p.Cliente.Apellido : "",
                    Ubicacion = p.Ubicacion,
                    MontoObra = p.MontoObra,
                    Estado = p.Estado,
                    NumTrabajadores = p.ProyectoTrabajadores.Count,
                    NumAbonos = p.Abonos.Count,
                    FechaInicio = p.FechaInicio,
                    FechaFinEstimada = p.FechaFinEstimada
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDetailDto>> GetById(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Cliente)
                .Include(p => p.ProyectoTrabajadores)
                    .ThenInclude(pt => pt.Trabajador)
                .Include(p => p.Abonos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound();

            var totalAbonos = project.Abonos.Sum(a => a.Monto);

            var dto = new ProjectDetailDto
            {
                Id = project.Id,
                Nombre = project.Name,
                ClienteId = project.ClienteId,
                ClienteNombre = project.Cliente != null ? project.Cliente.Nombre + " " + project.Cliente.Apellido : "",
                Ubicacion = project.Ubicacion,
                MontoObra = project.MontoObra,
                Estado = project.Estado,
                FechaInicio = project.FechaInicio,
                FechaFinEstimada = project.FechaFinEstimada,
                FechaCreacion = project.FechaCreacion,
                TotalAbonos = totalAbonos,
                SaldoPendiente = project.MontoObra - totalAbonos,
                Trabajadores = project.ProyectoTrabajadores.Select(pt => new TrabajadorAsignadoDto
                {
                    TrabajadorId = pt.TrabajadorId,
                    NombreCompleto = pt.Trabajador != null ? pt.Trabajador.Nombre + " " + pt.Trabajador.Apellido : ""
                }).ToList(),
                Abonos = project.Abonos.OrderByDescending(a => a.Fecha).Select(a => new AbonoDto
                {
                    Id = a.Id,
                    Monto = a.Monto,
                    Fecha = a.Fecha,
                    MetodoPago = a.MetodoPago,
                    NumeroReferencia = a.NumeroReferencia,
                    Observaciones = a.Observaciones
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<ProjectDetailDto>> Create([FromBody] CreateProjectDto dto)
        {
            var project = new Project
            {
                Name = dto.Nombre,
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

            // Asignar trabajadores
            if (dto.TrabajadorIds != null && dto.TrabajadorIds.Count > 0)
            {
                foreach (var trabajadorId in dto.TrabajadorIds)
                {
                    _context.ProyectoTrabajadores.Add(new ProyectoTrabajador
                    {
                        ProyectoId = project.Id,
                        TrabajadorId = trabajadorId,
                        FechaCreacion = DateTime.UtcNow
                    });
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, null);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateProjectDto dto)
        {
            var project = await _context.Projects
                .Include(p => p.ProyectoTrabajadores)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound();

            project.Name = dto.Nombre;
            project.ClienteId = dto.ClienteId;
            project.Ubicacion = dto.Ubicacion;
            project.MontoObra = dto.MontoObra;
            project.Estado = dto.Estado;
            project.FechaInicio = dto.FechaInicio;
            project.FechaFinEstimada = dto.FechaFinEstimada;

            // Reasignar trabajadores
            _context.ProyectoTrabajadores.RemoveRange(project.ProyectoTrabajadores);
            if (dto.TrabajadorIds != null && dto.TrabajadorIds.Count > 0)
            {
                foreach (var trabajadorId in dto.TrabajadorIds)
                {
                    _context.ProyectoTrabajadores.Add(new ProyectoTrabajador
                    {
                        ProyectoId = project.Id,
                        TrabajadorId = trabajadorId,
                        FechaCreacion = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/abonos")]
        public async Task<ActionResult<AbonoDto>> CreateAbono(int id, [FromBody] CreateAbonoDto dto)
        {
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == id);
            if (!projectExists) return NotFound();

            var abono = new AbonoProyecto
            {
                ProyectoId = id,
                Monto = dto.Monto,
                Fecha = dto.Fecha,
                MetodoPago = dto.MetodoPago,
                NumeroReferencia = dto.NumeroReferencia,
                Observaciones = dto.Observaciones,
                FechaCreacion = DateTime.UtcNow
            };

            _context.AbonosProyecto.Add(abono);
            await _context.SaveChangesAsync();

            return Ok(new AbonoDto
            {
                Id = abono.Id,
                Monto = abono.Monto,
                Fecha = abono.Fecha,
                MetodoPago = abono.MetodoPago,
                NumeroReferencia = abono.NumeroReferencia,
                Observaciones = abono.Observaciones
            });
        }

        [HttpDelete("{id}/abonos/{abonoId}")]
        public async Task<IActionResult> DeleteAbono(int id, int abonoId)
        {
            var abono = await _context.AbonosProyecto
                .FirstOrDefaultAsync(a => a.Id == abonoId && a.ProyectoId == id);

            if (abono == null) return NotFound();

            _context.AbonosProyecto.Remove(abono);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    // --- DTOs ---

    public class ProjectListDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string ClienteNombre { get; set; } = string.Empty;
        public string Ubicacion { get; set; } = string.Empty;
        public decimal MontoObra { get; set; }
        public string Estado { get; set; } = string.Empty;
        public int NumTrabajadores { get; set; }
        public int NumAbonos { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFinEstimada { get; set; }
    }

    public class ProjectDetailDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int ClienteId { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public string Ubicacion { get; set; } = string.Empty;
        public decimal MontoObra { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFinEstimada { get; set; }
        public DateTime FechaCreacion { get; set; }
        public decimal TotalAbonos { get; set; }
        public decimal SaldoPendiente { get; set; }
        public List<TrabajadorAsignadoDto> Trabajadores { get; set; } = new();
        public List<AbonoDto> Abonos { get; set; } = new();
    }

    public class TrabajadorAsignadoDto
    {
        public int TrabajadorId { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
    }

    public class AbonoDto
    {
        public int Id { get; set; }
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }
        public string? MetodoPago { get; set; }
        public string? NumeroReferencia { get; set; }
        public string? Observaciones { get; set; }
    }

    public class CreateProjectDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int ClienteId { get; set; }
        public string Ubicacion { get; set; } = string.Empty;
        public decimal MontoObra { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFinEstimada { get; set; }
        public List<int>? TrabajadorIds { get; set; }
    }

    public class CreateAbonoDto
    {
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }
        public string? MetodoPago { get; set; }
        public string? NumeroReferencia { get; set; }
        public string? Observaciones { get; set; }
    }
}
