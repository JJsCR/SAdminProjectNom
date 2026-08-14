using System.Linq;
using Microsoft.AspNetCore.Identity;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Data
{
    public class DbInitializer
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;

        public DbInitializer(AppDbContext db, IPasswordHasher<User> hasher)
        {
            _db = db;
            _hasher = hasher;
        }

        public void Seed()
        {
            if (!_db.Users.Any(u => u.NombreUsuario == "jArmandoGO"))
            {
                var user = new User
                {
                    NombreUsuario = "jArmandoGO",
                    Nombre = "José Armando Gutiérrez Ortiz",
                    Activo = true,
                    FechaCreacion = System.DateTime.UtcNow
                };

                user.PasswordHash = _hasher.HashPassword(user, "8822");
                _db.Users.Add(user);
                _db.SaveChanges();
            }
        }
    }
}
