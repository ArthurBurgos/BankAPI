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

        // POST: api/accounts/1/deposit
        [HttpPost("{id}/deposit")]
        public async Task<ActionResult<AccountResponseDto>> Deposit(
            int id,
            DepositRequest request)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
                return NotFound("Account not found.");

            if (!account.IsActive)
                return BadRequest("Account is inactive.");

            if (request.Amount <= 0)
                return BadRequest("Deposit amount must be greater than zero.");

            account.Balance += request.Amount;

            var transaction = new Transaction
            {
                Amount = request.Amount,
                Date = DateTime.UtcNow,
                Type = "Deposit",
                AccountId = account.Id
            };

            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();

            var response = new AccountResponseDto
            {
                Id = account.Id,
                AccountNumber = account.AccountNumber,
                Balance = account.Balance,
                IsActive = account.IsActive,
                CustomerId = account.CustomerId
            };

            return Ok(response);
        }

        // POST: api/accounts/1/withdraw
        [HttpPost("{id}/withdraw")]
        public async Task<ActionResult<AccountResponseDto>> Withdraw(
            int id,
            WithdrawRequest request)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
                return NotFound("Account not found.");

            if (!account.IsActive)
                return BadRequest("Account is inactive.");

            if (request.Amount <= 0)
                return BadRequest("Withdrawal amount must be greater than zero.");

            if (request.Amount > account.Balance)
                return BadRequest("Insufficient balance.");

            account.Balance -= request.Amount;

            var transaction = new Transaction
            {
                Amount = request.Amount,
                Date = DateTime.UtcNow,
                Type = "Withdrawal",
                AccountId = account.Id
            };

            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();

            var response = new AccountResponseDto
            {
                Id = account.Id,
                AccountNumber = account.AccountNumber,
                Balance = account.Balance,
                IsActive = account.IsActive,
                CustomerId = account.CustomerId
            };

            return Ok(response);
        }

        // POST: api/accounts/1/transfer
        [HttpPost("{id}/transfer")]
        public async Task<IActionResult> Transfer(
            int id,
            TransferRequest request)
        {
            // Buscar conta de origem
            var sourceAccount = await _context.Accounts.FindAsync(id);

            if (sourceAccount == null)
                return NotFound("Source account not found.");

            // Buscar conta de destino
            var destinationAccount = await _context.Accounts
                .FindAsync(request.DestinationAccountId);

            if (destinationAccount == null)
                return NotFound("Destination account not found.");

            // Verificar se as contas são diferentes
            if (sourceAccount.Id == destinationAccount.Id)
                return BadRequest(
                    "Source and destination accounts must be different."
                );

            // Verificar se a conta de origem está ativa
            if (!sourceAccount.IsActive)
                return BadRequest("Source account is inactive.");

            // Verificar se a conta de destino está ativa
            if (!destinationAccount.IsActive)
                return BadRequest("Destination account is inactive.");

            // Verificar valor
            if (request.Amount <= 0)
                return BadRequest(
                    "Transfer amount must be greater than zero."
                );

            // Verificar saldo
            if (request.Amount > sourceAccount.Balance)
                return BadRequest("Insufficient balance.");

            // Retirar dinheiro da conta de origem
            sourceAccount.Balance -= request.Amount;

            // Adicionar dinheiro na conta de destino
            destinationAccount.Balance += request.Amount;

            // Registrar saída da conta de origem
            var sourceTransaction = new Transaction
            {
                Amount = request.Amount,
                Date = DateTime.UtcNow,
                Type = "Transfer Out",
                AccountId = sourceAccount.Id
            };

            // Registrar entrada na conta de destino
            var destinationTransaction = new Transaction
            {
                Amount = request.Amount,
                Date = DateTime.UtcNow,
                Type = "Transfer In",
                AccountId = destinationAccount.Id
            };

            _context.Transactions.Add(sourceTransaction);
            _context.Transactions.Add(destinationTransaction);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Transfer completed successfully.",
                amount = request.Amount,
                sourceAccountId = sourceAccount.Id,
                destinationAccountId = destinationAccount.Id
            });
        }

        // PUT: api/accounts/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateAccountDto dto)
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