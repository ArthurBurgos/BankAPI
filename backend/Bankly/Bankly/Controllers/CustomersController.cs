using Bankly.Data;
using Bankly.DTOs;
using Bankly.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bankly.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly BankDbContext _context;

        public CustomersController(BankDbContext context)
        {
            _context = context;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerResponseDto>>> GetAll()
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value;

            if (!int.TryParse(customerIdClaim, out int customerId))
                return Unauthorized("Invalid customer identity.");

            var customers = await _context.Customers
                .Where(customer => customer.Id == customerId)
                .Select(customer => new CustomerResponseDto
                {
                    Id = customer.Id,
                    FirstName = customer.FirstName,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    PhoneNumber = customer.PhoneNumber
                })
                .ToListAsync();

            return Ok(customers);
        }

        // GET: api/customers/1
        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerResponseDto>> GetById(int id)
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value;

            if (!int.TryParse(customerIdClaim, out int customerId))
                return Unauthorized("Invalid customer identity.");

            if (id != customerId)
                return Forbid();

            var customer = await _context.Customers
                .Where(customer => customer.Id == id)
                .Select(customer => new CustomerResponseDto
                {
                    Id = customer.Id,
                    FirstName = customer.FirstName,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    PhoneNumber = customer.PhoneNumber
                })
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        // POST: api/customers
        // Necessário antes do registro do usuário
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<CustomerResponseDto>> Create(
            CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber
            };

            _context.Customers.Add(customer);

            await _context.SaveChangesAsync();

            var response = new CustomerResponseDto
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber
            };

            return CreatedAtAction(
                nameof(GetById),
                new { id = customer.Id },
                response
            );
        }

        // PUT: api/customers/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateCustomerDto dto)
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value;

            if (!int.TryParse(customerIdClaim, out int customerId))
                return Unauthorized("Invalid customer identity.");

            if (id != customerId)
                return Forbid();

            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
                return NotFound();

            customer.FirstName = dto.FirstName;
            customer.LastName = dto.LastName;
            customer.Email = dto.Email;
            customer.PhoneNumber = dto.PhoneNumber;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/customers/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value;

            if (!int.TryParse(customerIdClaim, out int customerId))
                return Unauthorized("Invalid customer identity.");

            if (id != customerId)
                return Forbid();

            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
                return NotFound();

            _context.Customers.Remove(customer);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}