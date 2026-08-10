using System.ComponentModel.DataAnnotations;

namespace Bankly.DTOs
{
    public class TransferRequest
    {
        [Required]
        public int DestinationAccountId { get; set; }

        [Range(0.01, 1000000)]
        public decimal Amount { get; set; }
    }
}