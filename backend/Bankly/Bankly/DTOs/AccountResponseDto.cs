namespace Bankly.DTOs
{
    public class AccountResponseDto
    {
        public int Id { get; set; }

        public string AccountNumber { get; set; } = string.Empty;

        public decimal Balance { get; set; }

        public bool IsActive { get; set; }

        public int CustomerId { get; set; }
    }
}