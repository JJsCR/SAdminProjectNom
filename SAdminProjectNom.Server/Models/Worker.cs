using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("Trabajador")]
    public class Worker
    {
        [Key]
        [Column("TrabajadorId")]
        public int TrabajadorId { get; set; }

        [Required]
        [Column("Nombre")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column("Apellido")]
        [MaxLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [Column("Cedula")]
        [MaxLength(30)]
        public string Cedula { get; set; } = string.Empty;

        [Required]
        [Column("FechaNacimiento")]
        public DateTime FechaNacimiento { get; set; }

        [Column("Celular")]
        [MaxLength(30)]
        public string? Celular { get; set; }

        [Required]
        [Column("MontoHora")]
        public decimal MontoHora { get; set; }

        [Required]
        [Column("MontoHoraS")]
        public decimal MontoHoraS { get; set; }

        [Column("Activo")]
        public bool Activo { get; set; } = true;

        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}
