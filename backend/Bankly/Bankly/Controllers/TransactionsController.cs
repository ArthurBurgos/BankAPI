using Bankly.Data;
using Bankly.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bankly.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly BankDbContext _context;

        public TransactionsController(
            BankDbContext context)
        {
            _context = context;
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<
            ActionResult<
                IEnumerable<TransactionResponseDto>
            >
        > GetAll()
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var transactions =
                await _context.Transactions
                    .AsNoTracking()
                    .Where(transaction =>
                        transaction.Account != null &&
                        transaction.Account.CustomerId ==
                        customerId
                    )
                    .OrderByDescending(transaction =>
                        transaction.Date
                    )
                    .Select(transaction =>
                        new TransactionResponseDto
                        {
                            Id =
                                transaction.Id,

                            Amount =
                                transaction.Amount,

                            Date =
                                transaction.Date,

                            Type =
                                transaction.Type,

                            AccountId =
                                transaction.AccountId
                        }
                    )
                    .ToListAsync();

            return Ok(transactions);
        }

        // GET: api/transactions/1
        [HttpGet("{id:int}")]
        public async Task<
            ActionResult<TransactionResponseDto>
        > GetById(int id)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var transaction =
                await _context.Transactions
                    .AsNoTracking()
                    .Where(transaction =>
                        transaction.Id == id &&
                        transaction.Account != null &&
                        transaction.Account.CustomerId ==
                        customerId
                    )
                    .Select(transaction =>
                        new TransactionResponseDto
                        {
                            Id =
                                transaction.Id,

                            Amount =
                                transaction.Amount,

                            Date =
                                transaction.Date,

                            Type =
                                transaction.Type,

                            AccountId =
                                transaction.AccountId
                        }
                    )
                    .FirstOrDefaultAsync();

            if (transaction == null)
            {
                return NotFound(
                    "Transaction not found."
                );
            }

            return Ok(transaction);
        }

        // GET: api/transactions/account/1
        [HttpGet("account/{accountId:int}")]
        public async Task<
            ActionResult<
                IEnumerable<TransactionResponseDto>
            >
        > GetByAccount(int accountId)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var accountExists =
                await _context.Accounts
                    .AsNoTracking()
                    .AnyAsync(account =>
                        account.Id == accountId &&
                        account.CustomerId ==
                        customerId
                    );

            if (!accountExists)
            {
                return NotFound(
                    "Account not found."
                );
            }

            var transactions =
                await _context.Transactions
                    .AsNoTracking()
                    .Where(transaction =>
                        transaction.AccountId ==
                        accountId &&
                        transaction.Account != null &&
                        transaction.Account.CustomerId ==
                        customerId
                    )
                    .OrderByDescending(transaction =>
                        transaction.Date
                    )
                    .Select(transaction =>
                        new TransactionResponseDto
                        {
                            Id =
                                transaction.Id,

                            Amount =
                                transaction.Amount,

                            Date =
                                transaction.Date,

                            Type =
                                transaction.Type,

                            AccountId =
                                transaction.AccountId
                        }
                    )
                    .ToListAsync();

            return Ok(transactions);
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
    }
}