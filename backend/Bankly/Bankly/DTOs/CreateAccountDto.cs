using System.ComponentModel.DataAnnotations;

namespace Bankly.DTOs
{
    public class CreateAccountDto
    {
        [Required]
        [StringLength(20)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        public int CustomerId { get; set; }
    }
}