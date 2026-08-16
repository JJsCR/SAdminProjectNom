using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("Factura")]
    public class Factura
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("FacturaId")]
        public int Id { get; set; }

        [Column("CotizacionId")]
        public int CotizacionId { get; set; }

        [Column("NumeroFactura")]
        [MaxLength(50)]
        public string NumeroFactura { get; set; } = string.Empty;

        [Column("Subtotal")]
        public decimal Subtotal { get; set; }

        [Column("Impuesto")]
        public decimal Impuesto { get; set; }

        [Column("Total")]
        public decimal Total { get; set; }

        [Column("FechaEmision")]
        public DateTime FechaEmision { get; set; } = DateTime.UtcNow;

        [Column("Estado")]
        [MaxLength(30)]
        public string Estado { get; set; } = "Emitida";

        [ForeignKey("CotizacionId")]
        public Cotizacion? Cotizacion { get; set; }
    }
}
