using Microsoft.EntityFrameworkCore;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Worker> Workers { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProyectoTrabajador> ProyectoTrabajadores { get; set; }
        public DbSet<AbonoProyecto> AbonosProyecto { get; set; }
        public DbSet<Cotizacion> Cotizaciones { get; set; }
        public DbSet<DetalleCotizacion> DetallesCotizacion { get; set; }
        public DbSet<Factura> Facturas { get; set; }
        public DbSet<LiquidacionSemanal> LiquidacionesSemanales { get; set; }
        public DbSet<DetalleLiquidacionSemanal> DetalleLiquidaciones { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProyectoTrabajador>()
                .HasOne(pt => pt.Proyecto)
                .WithMany(p => p.ProyectoTrabajadores)
                .HasForeignKey(pt => pt.ProyectoId);

            modelBuilder.Entity<ProyectoTrabajador>()
                .HasOne(pt => pt.Trabajador)
                .WithMany()
                .HasForeignKey(pt => pt.TrabajadorId);

            modelBuilder.Entity<AbonoProyecto>()
                .HasOne(a => a.Proyecto)
                .WithMany(p => p.Abonos)
                .HasForeignKey(a => a.ProyectoId);

            modelBuilder.Entity<Cotizacion>()
                .HasOne(c => c.Proyecto)
                .WithMany(p => p.Cotizaciones)
                .HasForeignKey(c => c.ProyectoId);

            modelBuilder.Entity<DetalleCotizacion>()
                .HasOne(d => d.Cotizacion)
                .WithMany(c => c.Detalles)
                .HasForeignKey(d => d.CotizacionId);

            modelBuilder.Entity<DetalleCotizacion>()
                .HasOne(d => d.Producto)
                .WithMany()
                .HasForeignKey(d => d.ProductoId);

            modelBuilder.Entity<Factura>()
                .HasOne(f => f.Cotizacion)
                .WithOne(c => c.Factura)
                .HasForeignKey<Factura>(f => f.CotizacionId);

            modelBuilder.Entity<LiquidacionSemanal>()
                .HasOne(l => l.Trabajador)
                .WithMany()
                .HasForeignKey(l => l.TrabajadorId);

            modelBuilder.Entity<DetalleLiquidacionSemanal>()
                .HasOne(d => d.Liquidacion)
                .WithMany(l => l.Detalles)
                .HasForeignKey(d => d.LiquidacionId);

            modelBuilder.Entity<DetalleLiquidacionSemanal>()
                .HasOne(d => d.Proyecto)
                .WithMany()
                .HasForeignKey(d => d.ProyectoId);
        }
    }
}
