using Bankly.Data;
using Bankly.DTOs;
using Bankly.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bankly.Controllers
{
    [Authorize]
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
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var accounts = await _context.Accounts
                .AsNoTracking()
                .Where(account =>
                    account.CustomerId == customerId
                )
                .Select(account =>
                    new AccountResponseDto
                    {
                        Id = account.Id,
                        AccountNumber =
                            account.AccountNumber,
                        Balance = account.Balance,
                        IsActive = account.IsActive,
                        CustomerId =
                            account.CustomerId
                    }
                )
                .ToListAsync();

            return Ok(accounts);
        }

        // GET: api/accounts/1
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AccountResponseDto>> GetById(
            int id)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var account = await _context.Accounts
                .AsNoTracking()
                .FirstOrDefaultAsync(account =>
                    account.Id == id &&
                    account.CustomerId == customerId
                );

            if (account == null)
            {
                return NotFound(
                    "Account not found."
                );
            }

            return Ok(
                MapToResponseDto(account)
            );
        }

        // POST: api/accounts
        [HttpPost]
        public async Task<ActionResult<AccountResponseDto>> Create(
            CreateAccountDto dto)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var customerExists =
                await _context.Customers.AnyAsync(
                    customer =>
                        customer.Id == customerId
                );

            if (!customerExists)
            {
                return BadRequest(
                    "Customer not found."
                );
            }

            var normalizedAccountNumber =
                dto.AccountNumber.Trim();

            var accountNumberExists =
                await _context.Accounts.AnyAsync(
                    account =>
                        account.AccountNumber ==
                        normalizedAccountNumber
                );

            if (accountNumberExists)
            {
                return Conflict(
                    "Account number is already in use."
                );
            }

            var account = new Account
            {
                AccountNumber =
                    normalizedAccountNumber,

                CustomerId = customerId,

                Balance = 0,

                IsActive = true
            };

            _context.Accounts.Add(account);

            await _context.SaveChangesAsync();

            var response =
                MapToResponseDto(account);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = account.Id
                },
                response
            );
        }

        // POST: api/accounts/1/deposit
        [HttpPost("{id:int}/deposit")]
        public async Task<ActionResult<AccountResponseDto>> Deposit(
            int id,
            DepositRequest request)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var account = await _context.Accounts
                .FirstOrDefaultAsync(account =>
                    account.Id == id &&
                    account.CustomerId == customerId
                );

            if (account == null)
            {
                return NotFound(
                    "Account not found."
                );
            }

            if (!account.IsActive)
            {
                return BadRequest(
                    "Account is inactive."
                );
            }

            if (request.Amount <= 0)
            {
                return BadRequest(
                    "Deposit amount must be greater than zero."
                );
            }

            account.Balance += request.Amount;

            var transaction = new Transaction
            {
                Amount = request.Amount,
                Date = DateTime.UtcNow,
                Type = "Deposit",
                AccountId = account.Id
            };

            _context.Transactions.Add(
                transaction
            );

            await _context.SaveChangesAsync();

            return Ok(
                MapToResponseDto(account)
            );
        }

        // POST: api/accounts/1/withdraw
        [HttpPost("{id:int}/withdraw")]
        public async Task<ActionResult<AccountResponseDto>> Withdraw(
            int id,
            WithdrawRequest request)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var account = await _context.Accounts
                .FirstOrDefaultAsync(account =>
                    account.Id == id &&
                    account.CustomerId == customerId
                );

            if (account == null)
            {
                return NotFound(
                    "Account not found."
                );
            }

            if (!account.IsActive)
            {
                return BadRequest(
                    "Account is inactive."
                );
            }

            if (request.Amount <= 0)
            {
                return BadRequest(
                    "Withdrawal amount must be greater than zero."
                );
            }

            if (request.Amount > account.Balance)
            {
                return BadRequest(
                    "Insufficient balance."
                );
            }

            account.Balance -= request.Amount;

            var transaction = new Transaction
            {
                Amount = request.Amount,
                Date = DateTime.UtcNow,
                Type = "Withdrawal",
                AccountId = account.Id
            };

            _context.Transactions.Add(
                transaction
            );

            await _context.SaveChangesAsync();

            return Ok(
                MapToResponseDto(account)
            );
        }

        // POST: api/accounts/1/transfer
        [HttpPost("{id:int}/transfer")]
        public async Task<IActionResult> Transfer(
            int id,
            TransferRequest request)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            if (request.Amount <= 0)
            {
                return BadRequest(
                    "Transfer amount must be greater than zero."
                );
            }

            if (
                request.DestinationAccountId <= 0
            )
            {
                return BadRequest(
                    "Destination account ID is invalid."
                );
            }

            await using var databaseTransaction =
                await _context.Database
                    .BeginTransactionAsync();

            try
            {
                var sourceAccount =
                    await _context.Accounts
                        .FirstOrDefaultAsync(
                            account =>
                                account.Id == id &&
                                account.CustomerId ==
                                customerId
                        );

                if (sourceAccount == null)
                {
                    return NotFound(
                        "Source account not found."
                    );
                }

                var destinationAccount =
                    await _context.Accounts
                        .FirstOrDefaultAsync(
                            account =>
                                account.Id ==
                                request
                                    .DestinationAccountId
                        );

                if (destinationAccount == null)
                {
                    return NotFound(
                        "Destination account not found."
                    );
                }

                if (
                    sourceAccount.Id ==
                    destinationAccount.Id
                )
                {
                    return BadRequest(
                        "Source and destination accounts must be different."
                    );
                }

                if (!sourceAccount.IsActive)
                {
                    return BadRequest(
                        "Source account is inactive."
                    );
                }

                if (!destinationAccount.IsActive)
                {
                    return BadRequest(
                        "Destination account is inactive."
                    );
                }

                if (
                    request.Amount >
                    sourceAccount.Balance
                )
                {
                    return BadRequest(
                        "Insufficient balance."
                    );
                }

                sourceAccount.Balance -=
                    request.Amount;

                destinationAccount.Balance +=
                    request.Amount;

                var transactionDate =
                    DateTime.UtcNow;

                var sourceTransaction =
                    new Transaction
                    {
                        Amount = request.Amount,
                        Date = transactionDate,
                        Type = "Transfer Out",
                        AccountId =
                            sourceAccount.Id
                    };

                var destinationTransaction =
                    new Transaction
                    {
                        Amount = request.Amount,
                        Date = transactionDate,
                        Type = "Transfer In",
                        AccountId =
                            destinationAccount.Id
                    };

                _context.Transactions.AddRange(
                    sourceTransaction,
                    destinationTransaction
                );

                await _context.SaveChangesAsync();

                await databaseTransaction
                    .CommitAsync();

                return Ok(new
                {
                    message =
                        "Transfer completed successfully.",

                    amount =
                        request.Amount,

                    sourceAccountId =
                        sourceAccount.Id,

                    destinationAccountId =
                        destinationAccount.Id
                });
            }
            catch
            {
                await databaseTransaction
                    .RollbackAsync();

                throw;
            }
        }

        // PUT: api/accounts/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateAccountDto dto)
        {
            if (!TryGetCustomerId(out var customerId))
            {
                return Unauthorized(
                    "Invalid customer identity."
                );
            }

            var account = await _context.Accounts
                .FirstOrDefaultAsync(account =>
                    account.Id == id &&
                    account.CustomerId == customerId
                );

            if (account == null)
            {
                return NotFound(
                    "Account not found."
                );
            }

            account.IsActive =
                dto.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/accounts/1
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

            var account = await _context.Accounts
                .FirstOrDefaultAsync(account =>
                    account.Id == id &&
                    account.CustomerId == customerId
                );

            if (account == null)
            {
                return NotFound(
                    "Account not found."
                );
            }

            _context.Accounts.Remove(account);

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

        private static AccountResponseDto MapToResponseDto(
            Account account)
        {
            return new AccountResponseDto
            {
                Id = account.Id,

                AccountNumber =
                    account.AccountNumber,

                Balance =
                    account.Balance,

                IsActive =
                    account.IsActive,

                CustomerId =
                    account.CustomerId
            };
        }
    }
}