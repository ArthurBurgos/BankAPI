using Bankly.Data;
using Bankly.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bankly.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly BankDbContext _context;

        public TransactionsController(BankDbContext context)
        {
            _context = context;
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetAll()
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value;

            if (!int.TryParse(customerIdClaim, out int customerId))
                return Unauthorized("Invalid customer identity.");

            var transactions = await _context.Transactions
                .Where(transaction =>
                    transaction.Account.CustomerId == customerId)
                .OrderByDescending(transaction => transaction.Date)
                .Select(transaction => new TransactionResponseDto
                {
                    Id = transaction.Id,
                    Amount = transaction.Amount,
                    Date = transaction.Date,
                    Type = transaction.Type,
                    AccountId = transaction.AccountId
                })
                .ToListAsync();

            return Ok(transactions);
        }

        // GET: api/transactions/1
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionResponseDto>> GetById(int id)
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value;

            if (!int.TryParse(customerIdClaim, out int customerId))
                return Unauthorized("Invalid customer identity.");

            var transaction = await _context.Transactions
                .Where(transaction =>
                    transaction.Id == id &&
                    transaction.Account.CustomerId == customerId)
                .Select(transaction => new TransactionResponseDto
                {
                    Id = transaction.Id,
                    Amount = transaction.Amount,
                    Date = transaction.Date,
                    Type = transaction.Type,
                    AccountId = transaction.AccountId
                })
                .FirstOrDefaultAsync();

            if (transaction == null)
                return NotFound("Transaction not found.");

            return Ok(transaction);
        }

        // GET: api/transactions/account/1
        [HttpGet("account/{accountId}")]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetByAccount(
            int accountId)
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value;

            if (!int.TryParse(customerIdClaim, out int customerId))
                return Unauthorized("Invalid customer identity.");

            var accountExists = await _context.Accounts
                .AnyAsync(account =>
                    account.Id == accountId &&
                    account.CustomerId == customerId);

            if (!accountExists)
                return NotFound("Account not found.");

            var transactions = await _context.Transactions
                .Where(transaction =>
                    transaction.AccountId == accountId &&
                    transaction.Account.CustomerId == customerId)
                .OrderByDescending(transaction => transaction.Date)
                .Select(transaction => new TransactionResponseDto
                {
                    Id = transaction.Id,
                    Amount = transaction.Amount,
                    Date = transaction.Date,
                    Type = transaction.Type,
                    AccountId = transaction.AccountId
                })
                .ToListAsync();

            return Ok(transactions);
        }
    }
}