using Bankly.Data;
using Bankly.DTOs;
using Bankly.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Bankly.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly BankDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            BankDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest("Username is required.");

            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            if (string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Password is required.");

            if (request.Password.Length < 6)
                return BadRequest("Password must contain at least 6 characters.");

            var customer = await _context.Customers.FindAsync(request.CustomerId);

            if (customer == null)
                return BadRequest("Customer not found.");

            var usernameExists = _context.Users
                .Any(user => user.Username == request.Username);

            if (usernameExists)
                return Conflict("Username is already in use.");

            var emailExists = _context.Users
                .Any(user => user.Email == request.Email);

            if (emailExists)
                return Conflict("Email is already in use.");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                CustomerId = request.CustomerId
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully.",
                userId = user.Id,
                username = user.Username
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginRequest request)
        {
            var user = _context.Users
                .FirstOrDefault(user => user.Username == request.Username);

            if (user == null)
                return Unauthorized("Invalid username or password.");

            var passwordValid = BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash
            );

            if (!passwordValid)
                return Unauthorized("Invalid username or password.");

            var token = GenerateToken(user);

            var response = new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                CustomerId = user.CustomerId,
                Username = user.Username
            };

            return Ok(response);
        }

        private string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("CustomerId", user.CustomerId.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    int.Parse(_configuration["Jwt:ExpirationMinutes"]!)
                ),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}