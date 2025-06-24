using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using EmailAppBackend.DTOs;
using EmailAppBackend.Models;
using EmailAppBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace EmailAppBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context;

        public AuthService(IConfiguration config, ApplicationDbContext context)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            // Validate the registration data for required fields and password strength
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrEmpty(dto.Email)) throw new ArgumentException("Email is required", nameof(dto));
            if (string.IsNullOrEmpty(dto.Password)) throw new ArgumentException("Password is required", nameof(dto));
            if (string.IsNullOrEmpty(dto.FirstName)) throw new ArgumentException("First name is required", nameof(dto));
            if (string.IsNullOrEmpty(dto.LastName)) throw new ArgumentException("Last name is required", nameof(dto));

            // Validate password requirements
            if (dto.Password.Length < 8)
                throw new ArgumentException("Password must be at least 8 characters long");

            var normalizedEmail = dto.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
                throw new Exception("User already exists");

            var user = new User
            {
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return GenerateToken(user);
        }

        public async Task<string> LoginAsync(LoginDto dto)
        {
            // Validate the login data for required fields
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrEmpty(dto.Email)) throw new ArgumentException("Email is required", nameof(dto));
            if (string.IsNullOrEmpty(dto.Password)) throw new ArgumentException("Password is required", nameof(dto));

            var normalizedEmail = dto.Email.Trim().ToLower();
            Console.WriteLine($"[LOGIN] Attempting login for: '{normalizedEmail}'");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (user == null)
            {
                Console.WriteLine($"[LOGIN] User not found for email: '{normalizedEmail}'");
            }
            else
            {
                Console.WriteLine($"[LOGIN] User found. Checking password for: '{normalizedEmail}'");
                var passwordMatch = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
                Console.WriteLine($"[LOGIN] Password match: {passwordMatch}");
            }
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new Exception("Invalid credentials");

            // Update the user's last login timestamp
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return GenerateToken(user);
        }

        private string GenerateToken(User user)
        {
            // Generate a JWT token for the authenticated user
            if (user == null) throw new ArgumentNullException(nameof(user));
            if (string.IsNullOrEmpty(user.Email)) throw new ArgumentException("User email is required", nameof(user));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName)
            };

            var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found in configuration");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            var normalizedEmail = email.Trim().ToLower();
            return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }
    }
}
