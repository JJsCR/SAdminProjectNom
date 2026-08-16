using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CotizacionesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CotizacionesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/cotizaciones/proyecto/5
        [HttpGet("proyecto/{proyectoId}")]
        public async Task<ActionResult<IEnumerable<CotizacionListDto>>> GetByProyecto(int proyectoId)
        {
            var cotizaciones = await _context.Cotizaciones
                .Where(c => c.ProyectoId == proyectoId)
                .Include(c => c.Factura)
                .OrderByDescending(c => c.FechaCreacion)
                .Select(c => new CotizacionListDto
                {
                    Id = c.Id,
                    ProyectoId = c.ProyectoId,
                    Subtotal = c.Subtotal,
                    Impuesto = c.Impuesto,
                    Total = c.Total,
                    Estado = c.Estado,
                    FechaCreacion = c.FechaCreacion,
                    TieneFactura = c.Factura != null
                })
                .ToListAsync();

            return Ok(cotizaciones);
        }

        // GET: api/cotizaciones/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CotizacionDetailDto>> GetById(int id)
        {
            var cotizacion = await _context.Cotizaciones
                .Include(c => c.Detalles)
                    .ThenInclude(d => d.Producto)
                .Include(c => c.Factura)
                .Include(c => c.Proyecto)
                    .ThenInclude(p => p!.Cliente)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cotizacion == null) return NotFound();

            var dto = new CotizacionDetailDto
            {
                Id = cotizacion.Id,
                ProyectoId = cotizacion.ProyectoId,
                ProyectoNombre = cotizacion.Proyecto?.Name ?? "",
                ClienteNombre = cotizacion.Proyecto?.Cliente != null
                    ? cotizacion.Proyecto.Cliente.Nombre + " " + cotizacion.Proyecto.Cliente.Apellido
                    : "",
                Subtotal = cotizacion.Subtotal,
                Impuesto = cotizacion.Impuesto,
                Total = cotizacion.Total,
                Estado = cotizacion.Estado,
                FechaCreacion = cotizacion.FechaCreacion,
                Detalles = cotizacion.Detalles.Select(d => new DetalleCotizacionDto
                {
                    Id = d.Id,
                    ProductoId = d.ProductoId,
                    ProductoNombre = d.Producto?.Name ?? "",
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList(),
                Factura = cotizacion.Factura != null ? new FacturaDto
                {
                    Id = cotizacion.Factura.Id,
                    NumeroFactura = cotizacion.Factura.NumeroFactura,
                    Subtotal = cotizacion.Factura.Subtotal,
                    Impuesto = cotizacion.Factura.Impuesto,
                    Total = cotizacion.Factura.Total,
                    FechaEmision = cotizacion.Factura.FechaEmision,
                    Estado = cotizacion.Factura.Estado
                } : null
            };

            return Ok(dto);
        }

        // POST: api/cotizaciones
        // Recibe los items del carrito + proyectoId, crea detalles, cotización y factura
        [HttpPost]
        public async Task<ActionResult<CotizacionDetailDto>> Create([FromBody] CreateCotizacionDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("Debe incluir al menos un producto.");

            // Verificar que el proyecto existe
            var proyecto = await _context.Projects.FindAsync(dto.ProyectoId);
            if (proyecto == null) return BadRequest("Proyecto no encontrado.");

            // Calcular detalles
            var detalles = new List<DetalleCotizacion>();
            decimal subtotal = 0;

            foreach (var item in dto.Items)
            {
                var detalleSubtotal = item.PrecioUnitario * item.Cantidad;
                detalles.Add(new DetalleCotizacion
                {
                    ProductoId = item.ProductoId,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = item.PrecioUnitario,
                    Subtotal = detalleSubtotal
                });
                subtotal += detalleSubtotal;
            }

            decimal impuesto = Math.Round(subtotal * 0.13m, 2);
            decimal total = subtotal + impuesto;

            // Crear cotización
            var cotizacion = new Cotizacion
            {
                ProyectoId = dto.ProyectoId,
                Subtotal = subtotal,
                Impuesto = impuesto,
                Total = total,
                Estado = "Activo",
                FechaCreacion = DateTime.UtcNow,
                Detalles = detalles
            };

            _context.Cotizaciones.Add(cotizacion);
            await _context.SaveChangesAsync();

            // Generar factura automáticamente
            var ultimaFactura = await _context.Facturas
                .OrderByDescending(f => f.Id)
                .FirstOrDefaultAsync();
            int siguienteNumero = (ultimaFactura?.Id ?? 0) + 1;
            string numeroFactura = $"FAC-{siguienteNumero:D4}";

            var factura = new Factura
            {
                CotizacionId = cotizacion.Id,
                NumeroFactura = numeroFactura,
                Subtotal = subtotal,
                Impuesto = impuesto,
                Total = total,
                FechaEmision = DateTime.UtcNow,
                Estado = "Emitida"
            };

            _context.Facturas.Add(factura);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = cotizacion.Id }, new { cotizacionId = cotizacion.Id, facturaId = factura.Id, numeroFactura });
        }
    }

    // --- DTOs ---

    public class CotizacionListDto
    {
        public int Id { get; set; }
        public int ProyectoId { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public bool TieneFactura { get; set; }
    }

    public class CotizacionDetailDto
    {
        public int Id { get; set; }
        public int ProyectoId { get; set; }
        public string ProyectoNombre { get; set; } = string.Empty;
        public string ClienteNombre { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public List<DetalleCotizacionDto> Detalles { get; set; } = new();
        public FacturaDto? Factura { get; set; }
    }

    public class DetalleCotizacionDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class FacturaDto
    {
        public int Id { get; set; }
        public string NumeroFactura { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public DateTime FechaEmision { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

    public class CreateCotizacionDto
    {
        public int ProyectoId { get; set; }
        public List<CreateDetalleCotizacionDto> Items { get; set; } = new();
    }

    public class CreateDetalleCotizacionDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }
}
