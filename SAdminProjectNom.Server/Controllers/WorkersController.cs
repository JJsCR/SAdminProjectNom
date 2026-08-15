using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public WorkersController(AppDbContext db)
        {
            _db = db;
        }

        public class WorkerDto
        {
            public int TrabajadorId { get; set; }
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public string Cedula { get; set; } = string.Empty;
            public DateTime FechaNacimiento { get; set; }
            public string? Celular { get; set; }
            public bool Activo { get; set; }
            public DateTime FechaCreacion { get; set; }
        }

        public class CreateWorkerDto
        {
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public string Cedula { get; set; } = string.Empty;
            public DateTime FechaNacimiento { get; set; }
            public string? Celular { get; set; }
        }

        public class UpdateWorkerDto
        {
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public string Cedula { get; set; } = string.Empty;
            public DateTime FechaNacimiento { get; set; }
            public string? Celular { get; set; }
        }

        public class PatchStatusDto
        {
            public bool Activo { get; set; }
        }

        // GET /api/workers
        [HttpGet]
        public IActionResult GetAll([FromQuery] string? nombre = null)
        {
            var query = _db.Workers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                query = query.Where(w => w.Nombre.Contains(nombre) || w.Apellido.Contains(nombre));
            }

            var workers = query
                .OrderByDescending(w => w.FechaCreacion)
                .Select(w => new WorkerDto
                {
                    TrabajadorId = w.TrabajadorId,
                    Nombre = w.Nombre,
                    Apellido = w.Apellido,
                    Cedula = w.Cedula,
                    FechaNacimiento = w.FechaNacimiento,
                    Celular = w.Celular,
                    Activo = w.Activo,
                    FechaCreacion = w.FechaCreacion
                })
                .ToList();

            return Ok(workers);
        }

        // POST /api/workers
        [HttpPost]
        public IActionResult Create([FromBody] CreateWorkerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var worker = new Worker
            {
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                Cedula = dto.Cedula,
                FechaNacimiento = dto.FechaNacimiento,
                Celular = dto.Celular,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _db.Workers.Add(worker);
            _db.SaveChanges();

            return CreatedAtAction(nameof(GetAll), new { id = worker.TrabajadorId }, new WorkerDto
            {
                TrabajadorId = worker.TrabajadorId,
                Nombre = worker.Nombre,
                Apellido = worker.Apellido,
                Cedula = worker.Cedula,
                FechaNacimiento = worker.FechaNacimiento,
                Celular = worker.Celular,
                Activo = worker.Activo,
                FechaCreacion = worker.FechaCreacion
            });
        }

        // PUT /api/workers/{id}
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateWorkerDto dto)
        {
            var worker = _db.Workers.Find(id);
            if (worker == null)
                return NotFound();

            worker.Nombre = dto.Nombre;
            worker.Apellido = dto.Apellido;
            worker.Cedula = dto.Cedula;
            worker.FechaNacimiento = dto.FechaNacimiento;
            worker.Celular = dto.Celular;

            _db.SaveChanges();

            return Ok(new WorkerDto
            {
                TrabajadorId = worker.TrabajadorId,
                Nombre = worker.Nombre,
                Apellido = worker.Apellido,
                Cedula = worker.Cedula,
                FechaNacimiento = worker.FechaNacimiento,
                Celular = worker.Celular,
                Activo = worker.Activo,
                FechaCreacion = worker.FechaCreacion
            });
        }

        // PATCH /api/workers/{id}/status
        [HttpPatch("{id}/status")]
        public IActionResult PatchStatus(int id, [FromBody] PatchStatusDto dto)
        {
            var worker = _db.Workers.Find(id);
            if (worker == null)
                return NotFound();

            worker.Activo = dto.Activo;
            _db.SaveChanges();

            return NoContent();
        }
    }
}
