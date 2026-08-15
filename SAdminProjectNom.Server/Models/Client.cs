using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("Cliente")]
    public class Client
    {
        [Key]
        [Column("ClienteId")]
        public int Id { get; set; }

        [Required]
        [Column("Nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column("Apellido")]
        [MaxLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Column("Cedula")]
        [MaxLength(30)]
        public string? Cedula { get; set; }

        [Required]
        [Column("Celular")]
        [MaxLength(30)]
        public string Celular { get; set; } = string.Empty;

        [Column("Correo")]
        [MaxLength(150)]
        public string? Correo { get; set; }

        [Column("Activo")]
        public bool Activo { get; set; } = true;

        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
