using System.ComponentModel.DataAnnotations;

namespace Bankly.DTOs
{
    public class UpdateCustomerDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(30)]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}