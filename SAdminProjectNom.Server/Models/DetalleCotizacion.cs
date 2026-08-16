using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("DetalleCotizacion")]
    public class DetalleCotizacion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("DetalleCotizacionId")]
        public int Id { get; set; }

        [Column("CotizacionId")]
        public int CotizacionId { get; set; }

        [Column("ProductoId")]
        public int ProductoId { get; set; }

        [Column("Cantidad")]
        public int Cantidad { get; set; }

        [Column("PrecioUnitario")]
        public decimal PrecioUnitario { get; set; }

        [Column("Subtotal")]
        public decimal Subtotal { get; set; }

        [ForeignKey("CotizacionId")]
        public Cotizacion? Cotizacion { get; set; }

        [ForeignKey("ProductoId")]
        public Product? Producto { get; set; }
    }
}
