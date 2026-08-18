using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAdminProjectNom.Server.Data;
using System.Globalization;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/salarios")]
    [Authorize]
    public class SalariosController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SalariosController(AppDbContext db)
        {
            _db = db;
        }

        public class ProyectoDetalleDto
        {
            public int ProyectoId { get; set; }
            public string NombreProyecto { get; set; } = string.Empty;
            public decimal HorasEnProyecto { get; set; }
            public decimal MontoHoraProyecto { get; set; }
            public decimal TotalGanadoProyecto { get; set; }
        }

        public class SalarioMensualDto
        {
            public int Anio { get; set; }
            public int Mes { get; set; }
            public string NombreMes { get; set; } = string.Empty;
            public decimal HorasTrabajadas { get; set; }
            public decimal SalarioReal { get; set; }
            public decimal TarifaHoraReal { get; set; }
            public List<ProyectoDetalleDto> Proyectos { get; set; } = new();
        }

        // GET /api/salarios/historial/{trabajadorId}
        [HttpGet("historial/{trabajadorId}")]
        public async Task<IActionResult> GetHistorial(int trabajadorId)
        {
            var culture = new CultureInfo("es-CR");

            var liquidaciones = await _db.LiquidacionesSemanales
                .Where(l => l.TrabajadorId == trabajadorId)
                .ToListAsync();

            if (!liquidaciones.Any())
                return Ok(new List<SalarioMensualDto>());

            var mesesAgrupados = liquidaciones
                .GroupBy(l => new { l.FechaCreacion.Year, l.FechaCreacion.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new
                {
                    Anio = g.Key.Year,
                    Mes = g.Key.Month,
                    HorasTrabajadas = g.Sum(x => x.TotalHoras),
                    TotalPagar = g.Sum(x => x.TotalPagar),
                    LiquidacionIds = g.Select(x => x.LiquidacionId).ToList()
                })
                .ToList();

            var allLiqIds = mesesAgrupados.SelectMany(m => m.LiquidacionIds).ToList();
            var detalles = await _db.DetalleLiquidaciones
                .Include(d => d.Proyecto)
                .Where(d => allLiqIds.Contains(d.LiquidacionId))
                .ToListAsync();

            var result = mesesAgrupados.Select(m =>
            {
                var nombreMes = culture.DateTimeFormat.GetMonthName(m.Mes);
                nombreMes = char.ToUpper(nombreMes[0]) + nombreMes[1..];

                var proyectosMes = detalles
                    .Where(d => m.LiquidacionIds.Contains(d.LiquidacionId))
                    .GroupBy(d => new { d.ProyectoId, Nombre = d.Proyecto?.Name ?? "Sin Proyecto" })
                    .Select(pg => new ProyectoDetalleDto
                    {
                        ProyectoId = pg.Key.ProyectoId,
                        NombreProyecto = pg.Key.Nombre,
                        HorasEnProyecto = pg.Sum(x => x.Horas),
                        MontoHoraProyecto = pg.First().MontoHora,
                        TotalGanadoProyecto = pg.Sum(x => x.Total)
                    }).ToList();

                return new SalarioMensualDto
                {
                    Anio = m.Anio,
                    Mes = m.Mes,
                    NombreMes = $"{nombreMes} {m.Anio}",
                    HorasTrabajadas = m.HorasTrabajadas,
                    SalarioReal = m.TotalPagar,
                    TarifaHoraReal = m.HorasTrabajadas > 0
                        ? Math.Round(m.TotalPagar / m.HorasTrabajadas, 2)
                        : 0,
                    Proyectos = proyectosMes
                };
            }).ToList();

            return Ok(result);
        }
    }
}
