using Bankly.Data;
using Bankly.DTOs;
using Bankly.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bankly.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly BankDbContext _context;

        public AccountsController(BankDbContext context)
        {
            _context = context;
        }

        // GET: api/accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountResponseDto>>> GetAll()
        {
            var accounts = await _context.Accounts
                .Select(account => new AccountResponseDto
                {
                    Id = account.Id,
                    AccountNumber = account.AccountNumber,
                    Balance = account.Balance,
                    IsActive = account.IsActive,
                    CustomerId = account.CustomerId
                })
                .ToListAsync();

            return Ok(accounts);
        }

        // GET: api/accounts/1
        [HttpGet("{id}")]
        public async Task<ActionResult<AccountResponseDto>> GetById(int id)
        {
            var account = await _context.Accounts
                .Where(account => account.Id == id)
                .Select(account => new AccountResponseDto
                {
                    Id = account.Id,
                    AccountNumber = account.AccountNumber,
                    Balance = account.Balance,
                    IsActive = account.IsActive,
                    CustomerId = account.CustomerId
                })
                .FirstOrDefaultAsync();

            if (account == null)
                return NotFound();

            return Ok(account);
        }

        // POST: api/accounts
        [HttpPost]
        public async Task<ActionResult<AccountResponseDto>> Create(CreateAccountDto dto)
        {
            var customer = await _context.Customers.FindAsync(dto.CustomerId);

            if (customer == null)
                return BadRequest("Customer not found.");

            var account = new Account
            {
                AccountNumber = dto.AccountNumber,
                CustomerId = dto.CustomerId,
                Balance = 0,
                IsActive = true
            };

            _context.Accounts.Add(account);

            await _context.SaveChangesAsync();

            var response = new AccountResponseDto
            {
                Id = account.Id,
                AccountNumber = account.AccountNumber,
                Balance = account.Balance,
                IsActive = account.IsActive,
                CustomerId = account.CustomerId
            };

            return CreatedAtAction(
                nameof(GetById),
                new { id = account.Id },
                response
            );
        }

        // PUT: api/accounts/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateAccountDto dto)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
                return NotFound();

            account.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/accounts/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
                return NotFound();

            _context.Accounts.Remove(account);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}