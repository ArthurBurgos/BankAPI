namespace Bankly.DTOs
{
    public class CreateAccountDto
    {
        public string AccountNumber { get; set; } = string.Empty;

        public int CustomerId { get; set; }
    }
}