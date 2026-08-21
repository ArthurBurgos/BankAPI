using System.ComponentModel.DataAnnotations;

namespace Bankly.DTOs
{
    public class TransferRequest
    {
        [Range(1, int.MaxValue)]
        public int DestinationAccountId { get; set; }

        [Range(
            typeof(decimal),
            "0.01",
            "9999999999999999.99"
        )]
        public decimal Amount { get; set; }
    }
}