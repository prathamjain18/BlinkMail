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

        [HttpGet("validate-token")]
        // Validates if the current token is valid (requires authentication)
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult ValidateToken()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst("email")?.Value;
            
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
            {
                return Unauthorized();
            }
            
            return Ok(new { userId, email });
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
                Console.WriteLine($"[AUTH] Register attempt for email: {dto?.Email}");
                var token = await _authService.RegisterAsync(dto);
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                Console.WriteLine($"[AUTH] Register successful for user: {user?.Email}");
                return Ok(new { token, userId = user?.Id, email = user?.Email, firstName = user?.FirstName, lastName = user?.LastName });
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"[AUTH] Register failed - ArgumentException: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH] Register failed - Exception: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        // Authenticates a user and returns a JWT token
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                Console.WriteLine($"[AUTH] Login attempt for email: {dto?.Email}");
                var token = await _authService.LoginAsync(dto);
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                Console.WriteLine($"[AUTH] Login successful for user: {user?.Email}");
                return Ok(new { token, userId = user?.Id, email = user?.Email, firstName = user?.FirstName, lastName = user?.LastName });
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"[AUTH] Login failed - ArgumentException: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH] Login failed - Exception: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("login")]
        public IActionResult LoginGet()
        {
            return Ok(new { message = "Auth API is running. Use POST to login." });
        }

        [HttpGet("test-cors")]
        public IActionResult TestCors()
        {
            return Ok(new { message = "CORS is working!", timestamp = DateTime.UtcNow });
        }
    }
}
