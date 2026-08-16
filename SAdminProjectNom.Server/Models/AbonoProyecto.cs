using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("AbonoProyecto")]
    public class AbonoProyecto
    {
        [Key]
        [Column("AbonoId")]
        public int Id { get; set; }

        [Column("ProyectoId")]
        public int ProyectoId { get; set; }

        [Required]
        [Column("Monto", TypeName = "decimal(18,2)")]
        public decimal Monto { get; set; }

        [Required]
        [Column("Fecha")]
        public DateTime Fecha { get; set; }

        [Column("MetodoPago")]
        [StringLength(30)]
        public string? MetodoPago { get; set; }

        [Column("NumeroReferencia")]
        [StringLength(100)]
        public string? NumeroReferencia { get; set; }

        [Column("Observaciones")]
        [StringLength(500)]
        public string? Observaciones { get; set; }

        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProyectoId")]
        public Project? Proyecto { get; set; }
    }
}
