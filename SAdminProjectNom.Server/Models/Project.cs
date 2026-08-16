using System;
using System.Collections.Generic;
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

        [Column("ClienteId")]
        public int ClienteId { get; set; }

        [Required]
        [Column("Nombre")]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("Ubicacion")]
        [StringLength(300)]
        public string Ubicacion { get; set; } = string.Empty;

        [Column("MontoObra", TypeName = "decimal(18,2)")]
        public decimal MontoObra { get; set; }

        [Required]
        [Column("Estado")]
        [StringLength(30)]
        public string Estado { get; set; } = string.Empty;

        [Column("FechaInicio")]
        public DateTime? FechaInicio { get; set; }

        [Column("FechaFinEstimada")]
        public DateTime? FechaFinEstimada { get; set; }

        [Column("FechaCreacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [ForeignKey("ClienteId")]
        public Client? Cliente { get; set; }

        public ICollection<ProyectoTrabajador> ProyectoTrabajadores { get; set; } = new List<ProyectoTrabajador>();
        public ICollection<AbonoProyecto> Abonos { get; set; } = new List<AbonoProyecto>();
        public ICollection<Cotizacion> Cotizaciones { get; set; } = new List<Cotizacion>();
    }
}
