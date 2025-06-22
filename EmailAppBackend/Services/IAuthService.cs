using EmailAppBackend.DTOs;
using EmailAppBackend.Models;

namespace EmailAppBackend.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDto dto);
        Task<string> LoginAsync(LoginDto dto);
        Task<User?> GetUserByEmailAsync(string email);
    }
}
