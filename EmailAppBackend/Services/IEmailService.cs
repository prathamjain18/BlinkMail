using EmailAppBackend.Models;

namespace EmailAppBackend.Services;

public interface IEmailService
{
    Task<Email> SendEmailAsync(Email email);
    Task<Email?> GetEmailByIdAsync(int id);
    Task<IEnumerable<Email>> GetInboxEmailsAsync(int userId, string? userEmail = null);
    Task<IEnumerable<Email>> GetSentEmailsAsync(int userId);
    Task<IEnumerable<Email>> GetDraftEmailsAsync(int userId, string? userEmail = null);
    Task<Email> SaveDraftAsync(Email email);
    Task<Email?> UpdateEmailAsync(Email email);
    Task<bool> DeleteEmailAsync(int id);
    Task<bool> MarkEmailAsReadAsync(int id);
    Task<bool> AddAttachmentAsync(int emailId, IFormFile file);
    Task<Attachment?> GetAttachmentAsync(int attachmentId);
    string GetUploadsPath();
} 