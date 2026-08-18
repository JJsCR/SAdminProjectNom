using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAdminProjectNom.Server.Controllers;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;
using Xunit;

namespace SAdminProjectNom.Tests
{
    public class ProjectsControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly ProjectsController _controller;

        public ProjectsControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            // Seed a client for FK reference
            _context.Clients.Add(new Client
            {
                Id = 1,
                Nombre = "Juan",
                Apellido = "Pérez",
                Celular = "8091234567",
                Correo = "juan@test.com"
            });
            _context.SaveChanges();

            // Seed a worker
            _context.Workers.Add(new Worker
            {
                TrabajadorId = 1,
                Nombre = "Carlos",
                Apellido = "López",
                Cedula = "00100100101",
                Celular = "8099876543",
                FechaNacimiento = new DateTime(1990, 1, 1),
                MontoHora = 250m
            });
            _context.SaveChanges();

            _controller = new ProjectsController(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        #region Create Tests

        [Theory]
        [InlineData("Pendiente")]
        [InlineData("Finalizado")]
        [InlineData("En Progreso")]
        [InlineData("Suspendido")]
        [InlineData("Cancelado")]
        [InlineData("Cualquier Texto")]
        public async Task Create_WithAnyEstado_ShouldSucceed(string estado)
        {
            // Arrange
            var dto = new CreateProjectDto
            {
                Nombre = $"Proyecto Test {estado}",
                ClienteId = 1,
                Ubicacion = "Santo Domingo",
                MontoObra = 500000m,
                Estado = estado,
                FechaInicio = DateTime.UtcNow,
                FechaFinEstimada = DateTime.UtcNow.AddMonths(3),
                TrabajadorIds = new List<int> { 1 }
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(201, createdResult.StatusCode);

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Estado == estado);
            Assert.NotNull(project);
            Assert.Equal(estado, project.Estado);
            Assert.Equal(dto.Nombre, project.Name);
            Assert.Equal(dto.MontoObra, project.MontoObra);
        }

        [Fact]
        public async Task Create_WithTrabajadores_ShouldAssignWorkers()
        {
            // Arrange
            var dto = new CreateProjectDto
            {
                Nombre = "Proyecto Con Trabajadores",
                ClienteId = 1,
                Ubicacion = "Santiago",
                MontoObra = 300000m,
                Estado = "En Progreso",
                TrabajadorIds = new List<int> { 1 }
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result.Result);
            var assignments = await _context.ProyectoTrabajadores.ToListAsync();
            Assert.Single(assignments);
            Assert.Equal(1, assignments[0].TrabajadorId);
        }

        [Fact]
        public async Task Create_WithoutTrabajadores_ShouldNotAssignWorkers()
        {
            // Arrange
            var dto = new CreateProjectDto
            {
                Nombre = "Proyecto Sin Trabajadores",
                ClienteId = 1,
                Ubicacion = "La Vega",
                MontoObra = 200000m,
                Estado = "Pendiente",
                TrabajadorIds = null
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<CreatedAtActionResult>(result.Result);
            var assignments = await _context.ProyectoTrabajadores.ToListAsync();
            Assert.Empty(assignments);
        }

        #endregion

        #region Update Tests

        [Theory]
        [InlineData("Pendiente")]
        [InlineData("Finalizado")]
        [InlineData("En Progreso")]
        [InlineData("Suspendido")]
        [InlineData("Cancelado")]
        [InlineData("Cualquier Texto")]
        public async Task Update_WithAnyEstado_ShouldSucceed(string nuevoEstado)
        {
            // Arrange - Create a project first
            var project = new Project
            {
                Name = "Proyecto Original",
                ClienteId = 1,
                Ubicacion = "Santo Domingo",
                MontoObra = 100000m,
                Estado = "Pendiente",
                FechaCreacion = DateTime.UtcNow
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var dto = new CreateProjectDto
            {
                Nombre = "Proyecto Actualizado",
                ClienteId = 1,
                Ubicacion = "Santiago",
                MontoObra = 200000m,
                Estado = nuevoEstado,
                FechaInicio = DateTime.UtcNow,
                FechaFinEstimada = DateTime.UtcNow.AddMonths(6),
                TrabajadorIds = new List<int> { 1 }
            };

            // Act
            var result = await _controller.Update(project.Id, dto);

            // Assert
            Assert.IsType<NoContentResult>(result);

            var updated = await _context.Projects.FindAsync(project.Id);
            Assert.NotNull(updated);
            Assert.Equal(nuevoEstado, updated.Estado);
            Assert.Equal("Proyecto Actualizado", updated.Name);
            Assert.Equal(200000m, updated.MontoObra);
        }

        [Fact]
        public async Task Update_NonExistentProject_ShouldReturnNotFound()
        {
            // Arrange
            var dto = new CreateProjectDto
            {
                Nombre = "No Existe",
                ClienteId = 1,
                Ubicacion = "Nowhere",
                MontoObra = 0,
                Estado = "Pendiente"
            };

            // Act
            var result = await _controller.Update(9999, dto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Update_ShouldReassignWorkers()
        {
            // Arrange
            var project = new Project
            {
                Name = "Proyecto Reasignar",
                ClienteId = 1,
                Ubicacion = "Moca",
                MontoObra = 150000m,
                Estado = "Pendiente",
                FechaCreacion = DateTime.UtcNow
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Add initial worker assignment
            _context.ProyectoTrabajadores.Add(new ProyectoTrabajador
            {
                ProyectoId = project.Id,
                TrabajadorId = 1,
                FechaCreacion = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            // Update without workers
            var dto = new CreateProjectDto
            {
                Nombre = "Proyecto Reasignar",
                ClienteId = 1,
                Ubicacion = "Moca",
                MontoObra = 150000m,
                Estado = "En Progreso",
                TrabajadorIds = null
            };

            // Act
            var result = await _controller.Update(project.Id, dto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var assignments = await _context.ProyectoTrabajadores
                .Where(pt => pt.ProyectoId == project.Id)
                .ToListAsync();
            Assert.Empty(assignments);
        }

        #endregion
    }
}
