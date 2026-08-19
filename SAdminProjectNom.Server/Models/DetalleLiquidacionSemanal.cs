using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("DetalleLiquidacion")]
    public class DetalleLiquidacionSemanal
    {
        [Key]
        [Column("DetalleLiquidacionId")]
        public int DetalleLiquidacionId { get; set; }

        [Required]
        [Column("LiquidacionId")]
        public int LiquidacionId { get; set; }

        [ForeignKey("LiquidacionId")]
        public LiquidacionSemanal? Liquidacion { get; set; }

        [Required]
        [Column("ProyectoId")]
        public int ProyectoId { get; set; }

        [ForeignKey("ProyectoId")]
        public Project? Proyecto { get; set; }

        [Required]
        [Column("MontoHora")]
        public decimal MontoHora { get; set; }

        [Required]
        [Column("Horas")]
        public decimal Horas { get; set; }

        [Required]
        [Column("Total")]
        public decimal Total { get; set; }

        [Required]
        [Column("TotalS")]
        public decimal TotalS { get; set; }
    }
}
