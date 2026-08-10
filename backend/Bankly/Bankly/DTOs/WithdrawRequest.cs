using System.ComponentModel.DataAnnotations;

namespace Bankly.DTOs
{
    public class WithdrawRequest
    {
        [Range(0.01, 1000000)]
        public decimal Amount { get; set; }
    }
}