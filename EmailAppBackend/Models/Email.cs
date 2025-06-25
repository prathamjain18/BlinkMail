using System.ComponentModel.DataAnnotations;

namespace EmailAppBackend.Models;

public class Email
{
    public int Id { get; set; }
    
    [Required]
    public string Subject { get; set; } = string.Empty;
    
    [Required]
    public string Body { get; set; } = string.Empty;
    
    // For draft emails, this property represents the last modified date; for sent emails, it represents the sent date
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    
    public bool IsRead { get; set; }
    
    public bool IsDraft { get; set; }
    
    public bool IsHighPriority { get; set; } = false;
    
    public string? RecipientEmail { get; set; }
    
    // Foreign key properties for sender and recipient
    public int SenderId { get; set; }
    public int? RecipientId { get; set; }
    
    // Navigation properties for related entities (sender, recipient, attachments)
    public User? Sender { get; set; } = null!;
    public User? Recipient { get; set; }
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
} 