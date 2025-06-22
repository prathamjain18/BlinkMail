using System.Threading.Tasks;
using EmailAppBackend.Models;

namespace EmailAppBackend.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByEmailAsync(string email);
    }
} 