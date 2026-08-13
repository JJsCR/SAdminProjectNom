using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;
        private readonly IConfiguration _config;

        public UsersController(AppDbContext db, IPasswordHasher<User> hasher, IConfiguration config)
        {
            _db = db;
            _hasher = hasher;
            _config = config;
        }

        public class UserDto
        {
            public int Id { get; set; }
            public string NombreUsuario { get; set; } = string.Empty;
            public string Nombre { get; set; } = string.Empty; // first + last
            public bool Activo { get; set; }
            public DateTime FechaCreacion { get; set; }
        }

        public class CreateUserDto
        {
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? NombreUsuario { get; set; }
            public string? Password { get; set; }
            public bool Activo { get; set; } = true;
        }

        public class UpdateUserDto
        {
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Password { get; set; }
            public bool? Activo { get; set; }
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _db.Users.Select(u => new UserDto
            {
                Id = u.Id,
                NombreUsuario = u.NombreUsuario,
                Nombre = u.Nombre,
                Activo = u.Activo,
                FechaCreacion = u.FechaCreacion
            }).ToList();

            // Map to frontend UsersList shape
            var rows = users.Select(u => new
            {
                id = u.Id.toString(),
            });

            // Build rows with expected client model
            var clientRows = users.Select(u => new
            {
                id = u.Id.ToString(),
                firstName = (u.Nombre ?? string.Empty).Split(' ').FirstOrDefault() ?? string.Empty,
                lastName = string.Join(' ', (u.Nombre ?? string.Empty).Split(' ').Skip(1)).Trim(),
                phoneNumber = '',
                email = '',
                role = "user",
                disabled = !u.Activo,
                password = '',
                emailVerified = true,
                emailVerificationToken = '',
                emailVerificationTokenExpiresAt = (DateTime?)null,
                passwordResetToken = '',
                passwordResetTokenExpiresAt = (DateTime?)null,
                provider = "local",
                avatar = new object[] { },
                createdBy = (object?)null,
                updatedBy = (object?)null
            }).ToList();

            return Ok(new { count = clientRows.Count, rows = clientRows });
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var u = _db.Users.Find(id);
            if (u == null) return NotFound();

            var first = (u.Nombre ?? string.Empty).Split(' ').FirstOrDefault() ?? string.Empty;
            var last = string.Join(' ', (u.Nombre ?? string.Empty).Split(' ').Skip(1)).Trim();

            var clientUser = new
            {
                id = u.Id.ToString(),
                firstName = first,
                lastName = last,
                phoneNumber = "",
                email = "",
                role = "user",
                disabled = !u.Activo,
                password = "",
                emailVerified = true,
                emailVerificationToken = "",
                emailVerificationTokenExpiresAt = (DateTime?)null,
                passwordResetToken = "",
                passwordResetTokenExpiresAt = (DateTime?)null,
                provider = "local",
                avatar = new object[] { },
                createdBy = (object?)null,
                updatedBy = (object?)null,
            };

            return Ok(clientUser);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateUserDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NombreUsuario) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Missing data");
            }

            if (_db.Users.Any(x => x.NombreUsuario == dto.NombreUsuario))
            {
                return Conflict("User already exists");
            }

            var nombre = string.Join(' ', new[] { dto.FirstName ?? string.Empty, dto.LastName ?? string.Empty }.Where(s => !string.IsNullOrWhiteSpace(s))).Trim();

            var user = new User
            {
                NombreUsuario = dto.NombreUsuario,
                Nombre = nombre,
                Activo = dto.Activo,
                FechaCreacion = DateTime.UtcNow
            };

            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            _db.Users.Add(user);
            _db.SaveChanges();

            var resultDto = new UserDto
            {
                Id = user.Id,
                NombreUsuario = user.NombreUsuario,
                Nombre = user.Nombre,
                Activo = user.Activo,
                FechaCreacion = user.FechaCreacion
            };

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, resultDto);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateUserDto dto)
        {
            var user = _db.Users.Find(id);
            if (user == null) return NotFound();

            if (dto.FirstName != null || dto.LastName != null)
            {
                var first = dto.FirstName ?? string.Empty;
                var last = dto.LastName ?? string.Empty;
                user.Nombre = string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.PasswordHash = _hasher.HashPassword(user, dto.Password!);
            }

            if (dto.Activo.HasValue)
            {
                user.Activo = dto.Activo.Value;
            }

            _db.Users.Update(user);
            _db.SaveChanges();

            return NoContent();
        }

        // Run a one-time test to create the requested user (protected by installer key)
        [HttpPost("run-test-create-jarmandogo")]
        public IActionResult RunTestCreateJArmando()
        {
            var headerKey = string.Empty;
            if (Request.Headers.TryGetValue("X-Installer-Key", out var headerValues))
            {
                headerKey = headerValues.ToString();
            }

            var expectedKey = _config.GetValue<string>("CreateUserApiKey");
            if (string.IsNullOrEmpty(expectedKey) || headerKey != expectedKey)
            {
                return Unauthorized("Invalid or missing installer key");
            }

            var nombreUsuario = "jArmandoGO";
            var password = "8822";

            if (_db.Users.Any(u => u.NombreUsuario == nombreUsuario))
            {
                var existing = _db.Users.Single(u => u.NombreUsuario == nombreUsuario);
                return Ok(new { message = "AlreadyExists", userId = existing.Id });
            }

            var user = new User
            {
                NombreUsuario = nombreUsuario,
                Nombre = "jArmando GO",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            user.PasswordHash = _hasher.HashPassword(user, password);
            _db.Users.Add(user);
            _db.SaveChanges();

            return Ok(new { message = "Created", userId = user.Id });
        }
    }
}
