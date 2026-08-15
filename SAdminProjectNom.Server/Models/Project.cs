using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("Proyecto")]
    public class Project
    {
        [Key]
        [Column("ProyectoId")]
        public int Id { get; set; }

        [Required]
        [Column("Nombre")]
        public string Name { get; set; } = string.Empty;

        [Column("Descripcion")]
        public string? Description { get; set; }

        [Column("Activo")]
        public bool IsActive { get; set; } = true;

        [Column("FechaCreacion")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
