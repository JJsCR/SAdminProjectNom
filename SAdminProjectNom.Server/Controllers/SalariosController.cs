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
            public decimal MontoHoraSProyecto { get; set; }
            public decimal TotalSProyecto { get; set; }
        }

        public class SemanaDetalleDto
        {
            public int NumeroSemana { get; set; }
            public string Etiqueta { get; set; } = string.Empty;
            public decimal HorasSemana { get; set; }
            public decimal TotalSSemana { get; set; }
            public List<ProyectoDetalleDto> Proyectos { get; set; } = new();
        }

        public class SalarioMensualDto
        {
            public int Anio { get; set; }
            public int Mes { get; set; }
            public string NombreMes { get; set; } = string.Empty;
            public decimal HorasTrabajadas { get; set; }
            public decimal TotalS { get; set; }
            public List<ProyectoDetalleDto> Proyectos { get; set; } = new();
            public List<SemanaDetalleDto> Semanas { get; set; } = new();
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
                .GroupBy(l => new {
                    Year = l.FechaPago.HasValue ? l.FechaPago.Value.Year : l.FechaCreacion.Year,
                    Month = l.FechaPago.HasValue ? l.FechaPago.Value.Month : l.FechaCreacion.Month
                })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new
                {
                    Anio = g.Key.Year,
                    Mes = g.Key.Month,
                    HorasTrabajadas = g.Sum(x => x.TotalHoras),
                    TotalS = g.Sum(x => x.TotalS),
                    LiquidacionIds = g.Select(x => x.LiquidacionId).ToList()
                })
                .ToList();

            var allLiqIds = mesesAgrupados.SelectMany(m => m.LiquidacionIds).ToList();
            var detalles = await _db.DetalleLiquidaciones
                .Include(d => d.Proyecto)
                .Where(d => allLiqIds.Contains(d.LiquidacionId))
                .ToListAsync();

            var liquidacionDict = liquidaciones.ToDictionary(l => l.LiquidacionId);

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
                        MontoHoraSProyecto = pg.First().TotalS != 0 ? Math.Round(pg.Sum(x => x.TotalS) / pg.Sum(x => x.Horas), 2) : 0,
                        TotalSProyecto = pg.Sum(x => x.TotalS)
                    }).ToList();

                // Calcular semanas del mes
                var semanas = CalcularSemanasMes(m.Anio, m.Mes);
                var semanasDto = semanas.Select((sem, idx) =>
                {
                    var liqsSemana = m.LiquidacionIds
                        .Where(id =>
                        {
                            var liq = liquidacionDict[id];
                            var fecha = liq.FechaPago.HasValue
                                ? liq.FechaPago.Value.ToDateTime(TimeOnly.MinValue)
                                : liq.FechaCreacion;
                            return fecha.Date >= sem.Inicio && fecha.Date <= sem.Fin;
                        }).ToList();

                    var proyectosSemana = detalles
                        .Where(d => liqsSemana.Contains(d.LiquidacionId))
                        .GroupBy(d => new { d.ProyectoId, Nombre = d.Proyecto?.Name ?? "Sin Proyecto" })
                        .Select(pg => new ProyectoDetalleDto
                        {
                            ProyectoId = pg.Key.ProyectoId,
                            NombreProyecto = pg.Key.Nombre,
                            HorasEnProyecto = pg.Sum(x => x.Horas),
                            MontoHoraSProyecto = pg.Sum(x => x.Horas) != 0 ? Math.Round(pg.Sum(x => x.TotalS) / pg.Sum(x => x.Horas), 2) : 0,
                            TotalSProyecto = pg.Sum(x => x.TotalS)
                        }).ToList();

                    return new SemanaDetalleDto
                    {
                        NumeroSemana = idx + 1,
                        Etiqueta = $"{sem.Inicio:dd MMM} - {sem.Fin:dd MMM}",
                        HorasSemana = liqsSemana.Sum(id => liquidacionDict[id].TotalHoras),
                        TotalSSemana = liqsSemana.Sum(id => liquidacionDict[id].TotalS),
                        Proyectos = proyectosSemana
                    };
                }).ToList();

                return new SalarioMensualDto
                {
                    Anio = m.Anio,
                    Mes = m.Mes,
                    NombreMes = $"{nombreMes} {m.Anio}",
                    HorasTrabajadas = m.HorasTrabajadas,
                    TotalS = m.TotalS,
                    Proyectos = proyectosMes,
                    Semanas = semanasDto
                };
            }).ToList();

            return Ok(result);
        }

        private static List<(DateTime Inicio, DateTime Fin)> CalcularSemanasMes(int anio, int mes)
        {
            var semanas = new List<(DateTime Inicio, DateTime Fin)>();
            var primerDia = new DateTime(anio, mes, 1);
            var ultimoDia = new DateTime(anio, mes, DateTime.DaysInMonth(anio, mes));

            var inicioSemana = primerDia;
            while (inicioSemana <= ultimoDia)
            {
                // Fin de semana = próximo domingo o último día del mes
                var finSemana = inicioSemana;
                while (finSemana.DayOfWeek != DayOfWeek.Sunday && finSemana < ultimoDia)
                    finSemana = finSemana.AddDays(1);

                semanas.Add((inicioSemana, finSemana));
                inicioSemana = finSemana.AddDays(1);
            }

            return semanas;
        }
    }
}
