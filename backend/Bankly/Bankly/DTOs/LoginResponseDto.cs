namespace Bankly.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public int UserId { get; set; }

        public int CustomerId { get; set; }

        public string Username { get; set; } = string.Empty;
    }
}