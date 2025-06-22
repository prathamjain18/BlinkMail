using Microsoft.AspNetCore.Mvc;
using EmailAppBackend.Services;
using EmailAppBackend.DTOs;

namespace EmailAppBackend.Controllers
{
    // Controller for handling authentication-related API endpoints
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Service for authentication logic
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet("user-by-email")]
        // Retrieves user information by email address
        public async Task<IActionResult> GetUserByEmail([FromQuery] string email)
        {
            var user = await _authService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(new { user.Id, user.Email });
        }

        [HttpPost("register")]
        // Registers a new user and returns a JWT token
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
            {
                var token = await _authService.RegisterAsync(dto);
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                return Ok(new { token, userId = user?.Id, email = user?.Email, firstName = user?.FirstName, lastName = user?.LastName });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        // Authenticates a user and returns a JWT token
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var token = await _authService.LoginAsync(dto);
            var user = await _authService.GetUserByEmailAsync(dto.Email);
            return Ok(new { token, userId = user?.Id, email = user?.Email, firstName = user?.FirstName, lastName = user?.LastName });
        }
    }
}
