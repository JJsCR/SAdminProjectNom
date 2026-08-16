using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("Cotizacion")]
    public class Cotizacion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("CotizacionId")]
        public int Id { get; set; }

        [Column("ProyectoId")]
        public int ProyectoId { get; set; }

        [Column("Subtotal")]
        public decimal Subtotal { get; set; }

        [Column("Impuesto")]
        public decimal Impuesto { get; set; }

        [Column("Total")]
        public decimal Total { get; set; }

        [Column("Estado")]
        [MaxLength(30)]
        public string Estado { get; set; } = "Activo";

        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProyectoId")]
        public Project? Proyecto { get; set; }

        public ICollection<DetalleCotizacion> Detalles { get; set; } = new List<DetalleCotizacion>();

        public Factura? Factura { get; set; }
    }
}
