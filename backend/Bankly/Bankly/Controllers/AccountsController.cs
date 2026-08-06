using Bankly.Data;
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
        public async Task<ActionResult<IEnumerable<Account>>> GetAll()
        {
            return await _context.Accounts.ToListAsync();
        }

        // GET: api/accounts/1
        [HttpGet("{id}")]
        public async Task<ActionResult<Account>> GetById(int id)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
                return NotFound();

            return account;
        }

        // POST: api/accounts
        [HttpPost]
        public async Task<ActionResult<Account>> Create(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById),
                new { id = account.Id },
                account);
        }

        // PUT: api/accounts/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Account updatedAccount)
        {
            if (id != updatedAccount.Id)
                return BadRequest();

            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
                return NotFound();

            account.AccountNumber = updatedAccount.AccountNumber;
            account.Balance = updatedAccount.Balance;
            account.IsActive = updatedAccount.IsActive;
            account.CustomerId = updatedAccount.CustomerId;

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