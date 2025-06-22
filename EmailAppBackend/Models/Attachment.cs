using System.ComponentModel.DataAnnotations;

namespace EmailAppBackend.Models;

public class Attachment
{
    public int Id { get; set; }
    
    [Required]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    public string ContentType { get; set; } = string.Empty;
    
    [Required]
    public long FileSize { get; set; }
    
    [Required]
    public string FilePath { get; set; } = string.Empty;
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key property referencing the related email
    public int EmailId { get; set; }
    
    // Navigation property to the related email entity
    public Email Email { get; set; } = null!;
} 