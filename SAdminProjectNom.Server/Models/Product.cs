using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("Producto")]
    public class Product
    {
        [Key]
        [Column("ProductoId")]
        public int Id { get; set; }

        [Required]
        [Column("Nombre")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("Precio")]
        public decimal Price { get; set; }

        [Column("Foto", TypeName = "nvarchar(max)")]
        public string? Foto { get; set; }

        [Column("Activo")]
        public bool IsActive { get; set; } = true;

        [Column("FechaCreacion")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
