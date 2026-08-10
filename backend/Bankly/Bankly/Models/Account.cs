namespace Bankly.Models
{
    public class Account
    {
        public int Id { get; set; }

        public string AccountNumber { get; set; } = string.Empty;

        public decimal Balance { get; set; }

        public bool IsActive { get; set; }

        public int CustomerId { get; set; }

        public Customer? Customer { get; set; }

        public List<Transaction> Transactions { get; set; } = new();
    }
}