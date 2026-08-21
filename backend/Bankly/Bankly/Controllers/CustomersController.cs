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

        public CustomersController(
            BankDbContext context)
        {
            _context = context;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<
            ActionResult<
                IEnumerable<CustomerResponseDto>
            >
        > GetAll()
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var customers =
                await _context.Customers
                    .AsNoTracking()
                    .Where(customer =>
                        customer.Id ==
                        customerId
                    )
                    .Select(customer =>
                        new CustomerResponseDto
                        {
                            Id =
                                customer.Id,

                            FirstName =
                                customer.FirstName,

                            LastName =
                                customer.LastName,

                            Email =
                                customer.Email,

                            PhoneNumber =
                                customer.PhoneNumber
                        }
                    )
                    .ToListAsync();

            return Ok(customers);
        }

        // GET: api/customers/1
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CustomerResponseDto>>
            GetById(int id)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            if (id != customerId)
            {
                return Forbid();
            }

            var customer =
                await _context.Customers
                    .AsNoTracking()
                    .Where(customer =>
                        customer.Id == id
                    )
                    .Select(customer =>
                        new CustomerResponseDto
                        {
                            Id =
                                customer.Id,

                            FirstName =
                                customer.FirstName,

                            LastName =
                                customer.LastName,

                            Email =
                                customer.Email,

                            PhoneNumber =
                                customer.PhoneNumber
                        }
                    )
                    .FirstOrDefaultAsync();

            if (customer == null)
            {
                return NotFound(
                    "Customer not found."
                );
            }

            return Ok(customer);
        }

        // POST: api/customers
        // Required before user registration
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<CustomerResponseDto>>
            Create(CreateCustomerDto dto)
        {
            var normalizedFirstName =
                dto.FirstName.Trim();

            var normalizedLastName =
                dto.LastName.Trim();

            var normalizedEmail =
                dto.Email.Trim();

            var normalizedPhoneNumber =
                dto.PhoneNumber.Trim();

            var emailExists =
                await _context.Customers
                    .AnyAsync(customer =>
                        customer.Email ==
                        normalizedEmail
                    );

            if (emailExists)
            {
                return Conflict(
                    "Email is already associated with a customer."
                );
            }

            var customer = new Customer
            {
                FirstName =
                    normalizedFirstName,

                LastName =
                    normalizedLastName,

                Email =
                    normalizedEmail,

                PhoneNumber =
                    normalizedPhoneNumber
            };

            _context.Customers.Add(
                customer
            );

            await _context.SaveChangesAsync();

            var response =
                MapToResponseDto(
                    customer
                );

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = customer.Id
                },
                response
            );
        }

        // PUT: api/customers/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateCustomerDto dto)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            if (id != customerId)
            {
                return Forbid();
            }

            var customer =
                await _context.Customers
                    .FindAsync(id);

            if (customer == null)
            {
                return NotFound(
                    "Customer not found."
                );
            }

            var normalizedEmail =
                dto.Email.Trim();

            var emailExists =
                await _context.Customers
                    .AnyAsync(otherCustomer =>
                        otherCustomer.Id != id &&
                        otherCustomer.Email ==
                        normalizedEmail
                    );

            if (emailExists)
            {
                return Conflict(
                    "Email is already associated with another customer."
                );
            }

            customer.FirstName =
                dto.FirstName.Trim();

            customer.LastName =
                dto.LastName.Trim();

            customer.Email =
                normalizedEmail;

            customer.PhoneNumber =
                dto.PhoneNumber.Trim();

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/customers/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(
            int id)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            if (id != customerId)
            {
                return Forbid();
            }

            var customer =
                await _context.Customers
                    .FindAsync(id);

            if (customer == null)
            {
                return NotFound(
                    "Customer not found."
                );
            }

            _context.Customers.Remove(
                customer
            );

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TryGetCustomerId(
            out int customerId)
        {
            var customerIdClaim =
                User.FindFirst(
                    "CustomerId"
                )?.Value;

            return int.TryParse(
                customerIdClaim,
                out customerId
            );
        }

        private static CustomerResponseDto
            MapToResponseDto(
                Customer customer)
        {
            return new CustomerResponseDto
            {
                Id =
                    customer.Id,

                FirstName =
                    customer.FirstName,

                LastName =
                    customer.LastName,

                Email =
                    customer.Email,

                PhoneNumber =
                    customer.PhoneNumber
            };
        }
    }
}