using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LiquidacionesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public LiquidacionesController(AppDbContext db)
        {
            _db = db;
        }

        // DTOs
        public class LiquidacionDto
        {
            public int LiquidacionId { get; set; }
            public int TrabajadorId { get; set; }
            public string TrabajadorNombre { get; set; } = string.Empty;
            public string TrabajadorCedula { get; set; } = string.Empty;
            public decimal MontoHora { get; set; }
            public decimal TotalHoras { get; set; }
            public decimal TotalPagar { get; set; }
            public string Estado { get; set; } = string.Empty;
            public string? FechaPago { get; set; }
            public string? MetodoPago { get; set; }
            public string? NumeroReferencia { get; set; }
            public DateTime FechaCreacion { get; set; }
            public int? ProyectoId { get; set; }
            public string? ProyectoNombre { get; set; }
            public string? ProyectoUbicacion { get; set; }
        }

        public class CreateLiquidacionDto
        {
            public int TrabajadorId { get; set; }
            public int ProyectoId { get; set; }
            public decimal TotalHoras { get; set; }
            public string Estado { get; set; } = "Pendiente";
            public string? FechaPago { get; set; }
            public string? MetodoPago { get; set; }
            public string? NumeroReferencia { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<List<LiquidacionDto>>> GetAll()
        {
            var liquidaciones = await _db.LiquidacionesSemanales
                .Include(l => l.Trabajador)
                .Include(l => l.Detalles)
                    .ThenInclude(d => d.Proyecto)
                .OrderByDescending(l => l.FechaCreacion)
                .ToListAsync();

            var result = liquidaciones.Select(l =>
            {
                var detalle = l.Detalles.FirstOrDefault();
                return new LiquidacionDto
                {
                    LiquidacionId = l.LiquidacionId,
                    TrabajadorId = l.TrabajadorId,
                    TrabajadorNombre = $"{l.Trabajador?.Nombre} {l.Trabajador?.Apellido}",
                    TrabajadorCedula = l.Trabajador?.Cedula ?? "",
                    MontoHora = l.Trabajador?.MontoHora ?? 0,
                    TotalHoras = l.TotalHoras,
                    TotalPagar = l.TotalPagar,
                    Estado = l.Estado,
                    FechaPago = l.FechaPago?.ToString("yyyy-MM-dd"),
                    MetodoPago = l.MetodoPago,
                    NumeroReferencia = l.NumeroReferencia,
                    FechaCreacion = l.FechaCreacion,
                    ProyectoId = detalle?.ProyectoId,
                    ProyectoNombre = detalle?.Proyecto?.Name,
                    ProyectoUbicacion = detalle?.Proyecto?.Ubicacion
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LiquidacionDto>> GetById(int id)
        {
            var l = await _db.LiquidacionesSemanales
                .Include(x => x.Trabajador)
                .Include(x => x.Detalles)
                    .ThenInclude(d => d.Proyecto)
                .FirstOrDefaultAsync(x => x.LiquidacionId == id);

            if (l == null) return NotFound();

            var detalle = l.Detalles.FirstOrDefault();
            return Ok(new LiquidacionDto
            {
                LiquidacionId = l.LiquidacionId,
                TrabajadorId = l.TrabajadorId,
                TrabajadorNombre = $"{l.Trabajador?.Nombre} {l.Trabajador?.Apellido}",
                TrabajadorCedula = l.Trabajador?.Cedula ?? "",
                MontoHora = l.Trabajador?.MontoHora ?? 0,
                TotalHoras = l.TotalHoras,
                TotalPagar = l.TotalPagar,
                Estado = l.Estado,
                FechaPago = l.FechaPago?.ToString("yyyy-MM-dd"),
                MetodoPago = l.MetodoPago,
                NumeroReferencia = l.NumeroReferencia,
                FechaCreacion = l.FechaCreacion,
                ProyectoId = detalle?.ProyectoId,
                ProyectoNombre = detalle?.Proyecto?.Name,
                ProyectoUbicacion = detalle?.Proyecto?.Ubicacion
            });
        }

        [HttpPost]
        public async Task<ActionResult<LiquidacionDto>> Create([FromBody] CreateLiquidacionDto dto)
        {
            var trabajador = await _db.Workers.FindAsync(dto.TrabajadorId);
            if (trabajador == null) return BadRequest("Trabajador no encontrado");

            var proyecto = await _db.Projects.FindAsync(dto.ProyectoId);
            if (proyecto == null) return BadRequest("Proyecto no encontrado");

            var estadosPermitidos = new[] { "Pendiente", "Pagado", "Cancelado" };
            if (!estadosPermitidos.Contains(dto.Estado))
                return BadRequest($"Estado inválido: '{dto.Estado}'. Valores permitidos: {string.Join(", ", estadosPermitidos)}");

            var totalPagar = dto.TotalHoras * trabajador.MontoHora;

            var liquidacion = new LiquidacionSemanal
            {
                TrabajadorId = dto.TrabajadorId,
                TotalHoras = dto.TotalHoras,
                TotalPagar = totalPagar,
                Estado = dto.Estado,
                FechaPago = string.IsNullOrEmpty(dto.FechaPago) ? null : DateOnly.Parse(dto.FechaPago),
                MetodoPago = dto.MetodoPago,
                NumeroReferencia = dto.NumeroReferencia,
                FechaCreacion = DateTime.Now
            };

            _db.LiquidacionesSemanales.Add(liquidacion);
            await _db.SaveChangesAsync();

            // Crear detalle (relación con proyecto)
            var detalle = new DetalleLiquidacionSemanal
            {
                LiquidacionId = liquidacion.LiquidacionId,
                ProyectoId = dto.ProyectoId,
                Horas = dto.TotalHoras,
                MontoHora = trabajador.MontoHora,
                Total = dto.TotalHoras * trabajador.MontoHora
            };
            _db.DetalleLiquidaciones.Add(detalle);
            await _db.SaveChangesAsync();

            return Ok(new LiquidacionDto
            {
                LiquidacionId = liquidacion.LiquidacionId,
                TrabajadorId = liquidacion.TrabajadorId,
                TrabajadorNombre = $"{trabajador.Nombre} {trabajador.Apellido}",
                TrabajadorCedula = trabajador.Cedula,
                MontoHora = trabajador.MontoHora,
                TotalHoras = liquidacion.TotalHoras,
                TotalPagar = liquidacion.TotalPagar,
                Estado = liquidacion.Estado,
                FechaPago = liquidacion.FechaPago?.ToString("yyyy-MM-dd"),
                MetodoPago = liquidacion.MetodoPago,
                NumeroReferencia = liquidacion.NumeroReferencia,
                FechaCreacion = liquidacion.FechaCreacion,
                ProyectoId = dto.ProyectoId,
                ProyectoNombre = proyecto.Name,
                ProyectoUbicacion = proyecto.Ubicacion
            });
        }
    }
}
