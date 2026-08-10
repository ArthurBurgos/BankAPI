namespace Bankly.DTOs
{
    public class TransactionResponseDto
    {
        public int Id { get; set; }

        public decimal Amount { get; set; }

        public DateTime Date { get; set; }

        public string Type { get; set; } = string.Empty;

        public int AccountId { get; set; }
    }
}