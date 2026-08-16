using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("LiquidacionSemanal")]
    public class LiquidacionSemanal
    {
        [Key]
        [Column("LiquidacionId")]
        public int LiquidacionId { get; set; }

        [Required]
        [Column("TrabajadorId")]
        public int TrabajadorId { get; set; }

        [ForeignKey("TrabajadorId")]
        public Worker? Trabajador { get; set; }

        [Required]
        [Column("TotalHoras", TypeName = "decimal(10,2)")]
        public decimal TotalHoras { get; set; }

        [Required]
        [Column("TotalPagar", TypeName = "decimal(18,2)")]
        public decimal TotalPagar { get; set; }

        [Required]
        [Column("Estado")]
        [MaxLength(30)]
        public string Estado { get; set; } = "Pendiente";

        [Column("FechaPago")]
        public DateOnly? FechaPago { get; set; }

        [Column("MetodoPago")]
        [MaxLength(30)]
        public string? MetodoPago { get; set; }

        [Column("NumeroReferencia")]
        [MaxLength(100)]
        public string? NumeroReferencia { get; set; }

        [Required]
        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Navegación a DetalleLiquidacion
        public ICollection<DetalleLiquidacionSemanal> Detalles { get; set; } = new List<DetalleLiquidacionSemanal>();
    }
}
