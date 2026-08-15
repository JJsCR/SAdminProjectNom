using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ClientsController(AppDbContext db)
        {
            _db = db;
        }

        public class ClientDto
        {
            public int Id { get; set; }
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public string? Cedula { get; set; }
            public string Celular { get; set; } = string.Empty;
            public string? Correo { get; set; }
            public bool Activo { get; set; }
            public DateTime FechaCreacion { get; set; }
        }

        public class CreateClientDto
        {
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public string? Cedula { get; set; }
            public string Celular { get; set; } = string.Empty;
            public string? Correo { get; set; }
        }

        public class PatchStatusDto
        {
            public bool Activo { get; set; }
        }

        // GET /api/clients
        [HttpGet]
        public IActionResult GetAll()
        {
            var clients = _db.Clients
                .OrderByDescending(c => c.FechaCreacion)
                .Select(c => new ClientDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Apellido = c.Apellido,
                    Cedula = c.Cedula,
                    Celular = c.Celular,
                    Correo = c.Correo,
                    Activo = c.Activo,
                    FechaCreacion = c.FechaCreacion
                })
                .ToList();

            return Ok(clients);
        }

        // POST /api/clients
        [HttpPost]
        public IActionResult Create([FromBody] CreateClientDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var client = new Client
            {
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                Cedula = dto.Cedula,
                Celular = dto.Celular,
                Correo = dto.Correo,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _db.Clients.Add(client);
            _db.SaveChanges();

            return CreatedAtAction(nameof(GetAll), new { id = client.Id }, new ClientDto
            {
                Id = client.Id,
                Nombre = client.Nombre,
                Apellido = client.Apellido,
                Cedula = client.Cedula,
                Celular = client.Celular,
                Correo = client.Correo,
                Activo = client.Activo,
                FechaCreacion = client.FechaCreacion
            });
        }

        public class UpdateClientDto
        {
            public string Nombre { get; set; } = string.Empty;
            public string Apellido { get; set; } = string.Empty;
            public string? Cedula { get; set; }
            public string Celular { get; set; } = string.Empty;
            public string? Correo { get; set; }
        }

        // PUT /api/clients/{id}
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateClientDto dto)
        {
            var client = _db.Clients.Find(id);
            if (client == null)
                return NotFound();

            client.Nombre = dto.Nombre;
            client.Apellido = dto.Apellido;
            client.Cedula = dto.Cedula;
            client.Celular = dto.Celular;
            client.Correo = dto.Correo;

            _db.SaveChanges();

            return Ok(new ClientDto
            {
                Id = client.Id,
                Nombre = client.Nombre,
                Apellido = client.Apellido,
                Cedula = client.Cedula,
                Celular = client.Celular,
                Correo = client.Correo,
                Activo = client.Activo,
                FechaCreacion = client.FechaCreacion
            });
        }

        // PATCH /api/clients/{id}/status
        [HttpPatch("{id}/status")]
        public IActionResult PatchStatus(int id, [FromBody] PatchStatusDto dto)
        {
            var client = _db.Clients.Find(id);
            if (client == null)
                return NotFound();

            client.Activo = dto.Activo;
            _db.SaveChanges();

            return NoContent();
        }
    }
}
