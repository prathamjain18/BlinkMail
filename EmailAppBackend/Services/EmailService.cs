using EmailAppBackend.Data;
using EmailAppBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace EmailAppBackend.Services;

public class EmailService : IEmailService
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public EmailService(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<Email> SendEmailAsync(Email email)
    {
        // If RecipientId is not set, attempt to resolve it from the provided RecipientEmail
        if (email.RecipientId == null && !string.IsNullOrEmpty(email.RecipientEmail))
        {
            var recipient = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.RecipientEmail.ToLower());
            if (recipient != null)
            {
                email.RecipientId = recipient.Id;
            }
            else
            {
                throw new Exception("Recipient not found");
            }
        }
        // Set the Sender navigation property for the email
        var sender = await _context.Users.FindAsync(email.SenderId);
        if (sender == null)
            throw new Exception("Sender not found");
        email.Sender = sender;
        email.SentAt = DateTime.UtcNow;
        email.IsDraft = false;
        
        _context.Emails.Add(email);
        await _context.SaveChangesAsync();
        return email;
    }

    public async Task<Email?> GetEmailByIdAsync(int id)
    {
        return await _context.Emails
            .Include(e => e.Sender)
            .Include(e => e.Recipient)
            .Include(e => e.Attachments)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Email>> GetInboxEmailsAsync(int userId, string? userEmail = null)
    {
        return await _context.Emails
            .Include(e => e.Sender)
            .Include(e => e.Attachments)
            .Where(e => (e.RecipientId == userId || (userEmail != null && e.RecipientEmail == userEmail)) && !e.IsDraft)
            .OrderByDescending(e => e.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Email>> GetSentEmailsAsync(int userId)
    {
        return await _context.Emails
            .Include(e => e.Recipient)
            .Include(e => e.Attachments)
            .Where(e => e.SenderId == userId && !e.IsDraft)
            .OrderByDescending(e => e.SentAt)
            .ToListAsync();
    }

    public async Task<Email> SaveDraftAsync(Email email)
    {
        // If RecipientId is not set, attempt to resolve it from the provided RecipientEmail
        if (email.RecipientId == null && !string.IsNullOrEmpty(email.RecipientEmail))
        {
            var recipient = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.RecipientEmail.ToLower());
            if (recipient != null)
            {
                email.RecipientId = recipient.Id;
            }
            // If the recipient is not found, allow saving the draft without a recipient
        }
        // Set the Sender navigation property for the draft email
        var sender = await _context.Users.FindAsync(email.SenderId);
        if (sender == null)
            throw new Exception("Sender not found");
        email.Sender = sender;
        email.IsDraft = true;
        email.SentAt = DateTime.UtcNow; // Always set the SentAt property to the current UTC time for drafts
        
        _context.Emails.Add(email);
        await _context.SaveChangesAsync();
        return email;
    }

    public async Task<IEnumerable<Email>> GetDraftEmailsAsync(int userId, string? userEmail = null)
    {
        return await _context.Emails
            .Include(e => e.Recipient)
            .Include(e => e.Attachments)
            .Where(e => e.SenderId == userId && e.IsDraft)
            .OrderByDescending(e => e.SentAt)
            .ToListAsync();
    }

    public async Task<Email?> UpdateEmailAsync(Email email)
    {
        var existingEmail = await _context.Emails.FindAsync(email.Id);
        if (existingEmail == null)
            return null;

        existingEmail.Subject = email.Subject;
        existingEmail.Body = email.Body;
        existingEmail.RecipientId = email.RecipientId;
        existingEmail.RecipientEmail = email.RecipientEmail;
        existingEmail.IsDraft = email.IsDraft;
        
        if (!email.IsDraft)
        {
            existingEmail.SentAt = DateTime.UtcNow;
        }
        else
        {
            existingEmail.SentAt = DateTime.UtcNow; // Update the SentAt property to reflect the last modification time for drafts
        }

        if (!existingEmail.IsDraft && existingEmail.RecipientId == null && !string.IsNullOrEmpty(existingEmail.RecipientEmail))
        {
            var recipient = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == existingEmail.RecipientEmail.ToLower());
            if (recipient != null)
            {
                existingEmail.RecipientId = recipient.Id;
            }
            else
            {
                throw new Exception("Recipient not found when sending draft.");
            }
        }

        await _context.SaveChangesAsync();
        return existingEmail;
    }

    public async Task<bool> DeleteEmailAsync(int id)
    {
        var email = await _context.Emails.FindAsync(id);
        if (email == null) return false;

        _context.Emails.Remove(email);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkEmailAsReadAsync(int id)
    {
        var email = await _context.Emails.FindAsync(id);
        if (email == null) return false;

        email.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddAttachmentAsync(int emailId, IFormFile file)
    {
        var email = await _context.Emails.FindAsync(emailId);
        if (email == null) return false;

        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var attachment = new Attachment
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            FilePath = uniqueFileName,
            EmailId = emailId
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Attachment?> GetAttachmentAsync(int attachmentId)
    {
        return await _context.Attachments
            .Include(a => a.Email)
            .FirstOrDefaultAsync(a => a.Id == attachmentId);
    }
} 