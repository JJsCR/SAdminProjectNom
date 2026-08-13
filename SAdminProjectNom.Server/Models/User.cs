using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("Usuario")]
    public class User
    {
        [Key]
        [Column("UsuarioId")]
        public int Id { get; set; }

        [Column("NombreUsuario")]
        public string NombreUsuario { get; set; } = string.Empty;

        [Column("PasswordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("Nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("Activo")]
        public bool Activo { get; set; } = true;

        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
