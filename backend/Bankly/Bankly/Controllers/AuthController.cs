using Bankly.Data;
using Bankly.DTOs;
using Bankly.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<ActionResult> Register(
            RegisterRequest request)
        {
            var normalizedUsername =
                request.Username.Trim();

            var normalizedEmail =
                request.Email.Trim();

            var customer = await _context.Customers
                .FindAsync(request.CustomerId);

            if (customer == null)
            {
                return BadRequest(
                    "Customer not found."
                );
            }

            var usernameExists =
                await _context.Users.AnyAsync(
                    user =>
                        user.Username ==
                        normalizedUsername
                );

            if (usernameExists)
            {
                return Conflict(
                    "Username is already in use."
                );
            }

            var emailExists =
                await _context.Users.AnyAsync(
                    user =>
                        user.Email ==
                        normalizedEmail
                );

            if (emailExists)
            {
                return Conflict(
                    "Email is already in use."
                );
            }

            var passwordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password
                );

            var user = new User
            {
                Username = normalizedUsername,
                Email = normalizedEmail,
                PasswordHash = passwordHash,
                CustomerId = request.CustomerId
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "User registered successfully.",

                userId = user.Id,

                username = user.Username
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>>
            Login(LoginRequest request)
        {
            var normalizedUsername =
                request.Username.Trim();

            var user = await _context.Users
                .FirstOrDefaultAsync(
                    user =>
                        user.Username ==
                        normalizedUsername
                );

            if (user == null)
            {
                return Unauthorized(
                    "Invalid username or password."
                );
            }

            var passwordValid =
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash
                );

            if (!passwordValid)
            {
                return Unauthorized(
                    "Invalid username or password."
                );
            }

            var token =
                GenerateToken(user);

            var response =
                new LoginResponseDto
                {
                    Token = token,
                    UserId = user.Id,
                    CustomerId =
                        user.CustomerId,
                    Username =
                        user.Username
                };

            return Ok(response);
        }

        private string GenerateToken(
            User user)
        {
            var jwtKey =
                _configuration["Jwt:Key"];

            var jwtIssuer =
                _configuration["Jwt:Issuer"];

            var jwtAudience =
                _configuration["Jwt:Audience"];

            var expirationValue =
                _configuration[
                    "Jwt:ExpirationMinutes"
                ];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "JWT key is not configured."
                );
            }

            if (
                string.IsNullOrWhiteSpace(
                    jwtIssuer
                )
            )
            {
                throw new InvalidOperationException(
                    "JWT issuer is not configured."
                );
            }

            if (
                string.IsNullOrWhiteSpace(
                    jwtAudience
                )
            )
            {
                throw new InvalidOperationException(
                    "JWT audience is not configured."
                );
            }

            if (
                !int.TryParse(
                    expirationValue,
                    out var expirationMinutes
                )
            )
            {
                throw new InvalidOperationException(
                    "JWT expiration is not configured correctly."
                );
            }

            var claims =
                new List<Claim>
                {
                    new(
                        ClaimTypes.NameIdentifier,
                        user.Id.ToString()
                    ),

                    new(
                        ClaimTypes.Name,
                        user.Username
                    ),

                    new(
                        "CustomerId",
                        user.CustomerId.ToString()
                    )
                };

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        jwtKey
                    )
                );

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                );

            var token =
                new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires:
                        DateTime.UtcNow.AddMinutes(
                            expirationMinutes
                        ),
                    signingCredentials:
                        credentials
                );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}