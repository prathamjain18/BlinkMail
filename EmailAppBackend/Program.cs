// Program.cs - Entry point for the Email App Backend
// This file configures and starts the ASP.NET Core web application, sets up services, middleware, and database initialization.
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EmailAppBackend.Services;
using EmailAppBackend.Data;
using BCrypt.Net;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://blinkmail-frontend.onrender.com",
                "http://localhost:3000",
                "http://localhost:5173",
                "https://localhost:3000",
                "https://localhost:5173"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("Content-Disposition", "Content-Length", "Content-Type")
              .SetPreflightMaxAge(TimeSpan.FromHours(1));
    });
});
// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found in configuration"))
            )
        };
    });

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var dbPath = Path.GetFullPath(context.Database.GetDbConnection().DataSource);
        Console.WriteLine($"[DB] Using SQLite database at: {dbPath}");
        Console.WriteLine("Attempting to connect to database...");
        context.Database.EnsureCreated();
        Console.WriteLine("Database connection successful!");

        // --- DEMO USER SEEDING ---
        Console.WriteLine("Checking for demo users...");
        var recruiterEmail = "demo.recruiter@blinkmail.com";
        var candidateEmail = "demo.candidate@blinkmail.com";
        var demoPassword = "password123";
        var recruiter = context.Users.FirstOrDefault(u => u.Email == recruiterEmail);
        if (recruiter == null)
        {
            Console.WriteLine($"Recruiter not found, creating: {recruiterEmail}");
            context.Users.Add(new EmailAppBackend.Models.User
            {
                Email = recruiterEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword),
                FirstName = "Demo",
                LastName = "Recruiter",
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            Console.WriteLine($"Recruiter already exists: {recruiterEmail}");
            Console.WriteLine($"Recruiter password hash: {recruiter.PasswordHash}");
        }
        var candidate = context.Users.FirstOrDefault(u => u.Email == candidateEmail);
        if (candidate == null)
        {
            Console.WriteLine($"Candidate not found, creating: {candidateEmail}");
            context.Users.Add(new EmailAppBackend.Models.User
            {
                Email = candidateEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword),
                FirstName = "Demo",
                LastName = "Candidate",
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            Console.WriteLine($"Candidate already exists: {candidateEmail}");
            Console.WriteLine($"Candidate password hash: {candidate.PasswordHash}");
        }
        context.SaveChanges();
        Console.WriteLine("Demo user seeding complete.");
        // --- END DEMO USER SEEDING ---
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database connection failed: {ex.Message}");
        Console.WriteLine("Please ensure the application has write permissions to create the SQLite database file.");
    }
}

// Ensure the wwwroot directory exists in the project root for static files (required by UseStaticFiles)

// Configure static files for attachments
app.UseStaticFiles();

// Only use HTTPS redirection in development
// if (app.Environment.IsDevelopment())
// {
//     app.UseHttpsRedirection();
// }
app.UseHttpsRedirection();

// Apply CORS before authentication and authorization
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure the app listens on the port provided by Railway or default to 8080
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

app.Run();