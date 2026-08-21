using System.ComponentModel.DataAnnotations;

namespace Bankly.DTOs
{
    public class TransferRequest
    {
        [Range(1, int.MaxValue)]
        public int DestinationAccountId { get; set; }

        public decimal Amount { get; set; }
    }
}