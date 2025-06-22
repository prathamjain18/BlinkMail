using System.ComponentModel.DataAnnotations;

namespace EmailAppBackend.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation properties for related emails (sent and received)
    public ICollection<Email> SentEmails { get; set; } = new List<Email>();
    public ICollection<Email> ReceivedEmails { get; set; } = new List<Email>();
} 