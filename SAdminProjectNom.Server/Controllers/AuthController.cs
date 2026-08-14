using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IPasswordHasher<User> hasher, IConfiguration config)
        {
            _db = db;
            _hasher = hasher;
            _config = config;
        }

        [HttpPost("signin/local")]
        public IActionResult SignInLocal([FromBody] LoginModel model)
        {
            if (model == null || string.IsNullOrEmpty(model.email) || string.IsNullOrEmpty(model.password))
            {
                return BadRequest("Missing credentials");
            }

            var user = _db.Users.SingleOrDefault(u => u.NombreUsuario == model.email);
            if (user == null)
            {
                return Unauthorized("Invalid credentials");
            }

            if (!user.Activo)
            {
                return Unauthorized("User is inactive");
            }

            var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, model.password);
            if (verify == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Invalid credentials");
            }

            // Obtener información de tablas de BD para verificar conexión
            var dbInfo = new
            {
                database = "DbAdminProjectNom",
                connected = true,
                tables = new List<string>()
            };

            try
            {
                var tableNames = _db.Model.GetEntityTypes()
                    .Select(t => t.GetAnnotation("Relational:TableName")?.Value?.ToString() ?? t.ClrType.Name)
                    .ToList();

                dbInfo = new
                {
                    database = "DbAdminProjectNom",
                    connected = true,
                    tables = tableNames
                };
            }
            catch (Exception ex)
            {
                dbInfo = new
                {
                    database = "DbAdminProjectNom",
                    connected = false,
                    tables = new List<string> { $"ERROR: {ex.Message}" }
                };
            }

            var jwtSection = _config.GetSection("Jwt");
            var key = jwtSection.GetValue<string>("Key") ?? "change_this_secret_for_prod";
            var issuer = jwtSection.GetValue<string>("Issuer") ?? "SAdminProjectNom";

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, user.NombreUsuario),
                new Claim("id", user.Id.ToString()),
                new Claim("name", user.Nombre ?? string.Empty)
            };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddDays(30);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: null,
                claims: claims,
                expires: expires,
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // Retornar token y información de BD
            return Ok(new
            {
                token = tokenString,
                dbInfo = dbInfo
            });
        }

        public class LoginModel
        {
            public string? email { get; set; }
            public string? password { get; set; }
            public string? social { get; set; }
        }

        [HttpPost("create-user")]
        public IActionResult CreateUser([FromBody] CreateUserModel model)
        {
            // Protect this endpoint with an installer API key
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
            if (model == null || string.IsNullOrWhiteSpace(model.NombreUsuario) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest("Missing user data");
            }

            // Check existing
            var exists = _db.Users.Any(u => u.NombreUsuario == model.NombreUsuario);
            if (exists)
            {
                return Conflict("User already exists");
            }

            var user = new User
            {
                NombreUsuario = model.NombreUsuario,
                Nombre = model.Nombre ?? string.Empty,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            user.PasswordHash = _hasher.HashPassword(user, model.Password);

            _db.Users.Add(user);
            _db.SaveChanges();

            return CreatedAtAction(nameof(SignInLocal), new { id = user.Id }, new { userId = user.Id, user = user.NombreUsuario });
        }

        public class CreateUserModel
        {
            public string? NombreUsuario { get; set; }
            public string? Password { get; set; }
            public string? Nombre { get; set; }
        }
    }
}
