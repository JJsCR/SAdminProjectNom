using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAdminProjectNom.Server.Data;
using SAdminProjectNom.Server.Models;

namespace SAdminProjectNom.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProductsController(AppDbContext db)
        {
            _db = db;
        }

        public class ProductDto
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public string? City { get; set; }
            public string? ImageUrl { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class CreateProductDto
        {
            public string Name { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public string? City { get; set; }
            public string? ImageUrl { get; set; }
        }

        public class PatchStatusDto
        {
            public bool IsActive { get; set; }
        }

        // GET /api/products
        [HttpGet]
        public IActionResult GetAll()
        {
            var products = _db.Products
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    City = p.City,
                    ImageUrl = p.ImageUrl,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToList();

            return Ok(products);
        }

        // POST /api/products
        [HttpPost]
        public IActionResult Create([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                City = dto.City,
                ImageUrl = dto.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Products.Add(product);
            _db.SaveChanges();

            return CreatedAtAction(nameof(GetAll), new { id = product.Id }, new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                City = product.City,
                ImageUrl = product.ImageUrl,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt
            });
        }

        // PATCH /api/products/{id}/status
        [HttpPatch("{id}/status")]
        public IActionResult PatchStatus(int id, [FromBody] PatchStatusDto dto)
        {
            var product = _db.Products.Find(id);
            if (product == null)
                return NotFound();

            product.IsActive = dto.IsActive;
            _db.SaveChanges();

            return NoContent();
        }
    }
}
