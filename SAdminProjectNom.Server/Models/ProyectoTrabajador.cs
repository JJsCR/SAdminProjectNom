using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAdminProjectNom.Server.Models
{
    [Table("ProyectoTrabajador")]
    public class ProyectoTrabajador
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ProyectoTrabajadorId")]
        public int Id { get; set; }

        [Column("ProyectoId")]
        public int ProyectoId { get; set; }

        [Column("TrabajadorId")]
        public int TrabajadorId { get; set; }

        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProyectoId")]
        public Project? Proyecto { get; set; }

        [ForeignKey("TrabajadorId")]
        public Worker? Trabajador { get; set; }
    }
}
