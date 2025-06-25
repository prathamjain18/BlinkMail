using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EmailAppBackend.Models;
using EmailAppBackend.Services;
using EmailAppBackend.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EmailAppBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    // Service for handling email-related operations
    private readonly IEmailService _emailService;
    // Database context for direct database access
    private readonly ApplicationDbContext _context;

    public EmailController(IEmailService emailService, ApplicationDbContext context)
    {
        _emailService = emailService;
        _context = context;
    }

    // Maps an Email entity to an EmailDto for API responses
    private EmailAppBackend.DTOs.EmailDto MapToDto(Email email)
    {
        return new EmailAppBackend.DTOs.EmailDto
        {
            Id = email.Id,
            Subject = email.Subject,
            Body = email.Body,
            Sender = email.Sender?.Email ?? "",
            Recipient = email.Recipient?.Email ?? email.RecipientEmail ?? "",
            RecipientEmail = email.RecipientEmail ?? "",
            Timestamp = email.SentAt.ToString("o"),
            IsRead = email.IsRead,
            IsHighPriority = email.IsHighPriority,
            Attachments = email.Attachments?.Select(a => new EmailAppBackend.DTOs.AttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                ContentType = a.ContentType,
                FileSize = a.FileSize,
                UploadedAt = a.UploadedAt.ToString("o")
            }).ToList() ?? new List<EmailAppBackend.DTOs.AttachmentDto>()
        };
    }

    [HttpPost("send")]
    // Sends a new email
    public async Task<ActionResult<EmailAppBackend.DTOs.EmailDto>> SendEmail([FromBody] Email email)
    {
        try
        {
            if (email == null)
                return BadRequest("Email data is required");

            if (string.IsNullOrEmpty(email.Subject))
                return BadRequest("Subject is required");

            if (string.IsNullOrEmpty(email.Body))
                return BadRequest("Body is required");

            if (string.IsNullOrEmpty(email.RecipientEmail))
                return BadRequest("Recipient email is required");

            var result = await _emailService.SendEmailAsync(email);
            return Ok(MapToDto(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Email>> GetEmail(int id)
    {
        var email = await _emailService.GetEmailByIdAsync(id);
        if (email == null)
            return NotFound();
            
        return Ok(email);
    }

    [HttpGet("inbox")]
    public async Task<ActionResult<IEnumerable<EmailAppBackend.DTOs.EmailDto>>> GetInbox()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userEmail = User.FindFirst("email")?.Value;
        var emails = await _emailService.GetInboxEmailsAsync(userId, userEmail);
        return Ok(emails.Select(MapToDto));
    }

    [HttpGet("sent")]
    public async Task<ActionResult<IEnumerable<EmailAppBackend.DTOs.EmailDto>>> GetSent()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var emails = await _emailService.GetSentEmailsAsync(userId);
        return Ok(emails.Select(MapToDto));
    }

    [HttpGet("drafts")]
    public async Task<ActionResult<IEnumerable<EmailAppBackend.DTOs.EmailDto>>> GetDrafts()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var userEmail = User.FindFirst("email")?.Value;
        var emails = await _emailService.GetDraftEmailsAsync(userId, userEmail);
        return Ok(emails.Select(MapToDto));
    }

    [HttpPost("draft")]
    // Saves an email as a draft
    public async Task<ActionResult<EmailAppBackend.DTOs.EmailDto>> SaveDraft([FromBody] Email email)
    {
        try
        {
            if (email == null)
                return BadRequest("Email data is required");

            if (string.IsNullOrEmpty(email.Subject))
                return BadRequest("Subject is required");

            if (string.IsNullOrEmpty(email.Body))
                return BadRequest("Body is required");

            if (string.IsNullOrEmpty(email.RecipientEmail))
                return BadRequest("Recipient email is required");

            var result = await _emailService.SaveDraftAsync(email);
            return Ok(MapToDto(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    // Updates an existing email
    public async Task<ActionResult<EmailAppBackend.DTOs.EmailDto>> UpdateEmail(int id, [FromBody] Email email)
    {
        if (id != email.Id)
            return BadRequest();

        var result = await _emailService.UpdateEmailAsync(email);
        if (result == null)
            return NotFound();

        return Ok(MapToDto(result));
    }

    [HttpDelete("{id}")]
    // Deletes an email by its ID
    public async Task<ActionResult> DeleteEmail(int id)
    {
        var success = await _emailService.DeleteEmailAsync(id);
        if (!success)
            return NotFound();
            
        return NoContent();
    }

    [HttpPut("{id}/read")]
    // Marks an email as read
    public async Task<ActionResult> MarkAsRead(int id)
    {
        var success = await _emailService.MarkEmailAsReadAsync(id);
        if (!success)
            return NotFound();
            
        return NoContent();
    }

    [HttpPost("{id}/attachments")]
    // Adds an attachment to an email
    public async Task<ActionResult> AddAttachment(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var success = await _emailService.AddAttachmentAsync(id, file);
        if (!success)
            return NotFound();

        return Ok();
    }

    [HttpGet("attachments/{id}")]
    // Retrieves attachments for a specific email
    public async Task<ActionResult<Attachment>> GetAttachment(int id)
    {
        var attachment = await _emailService.GetAttachmentAsync(id);
        if (attachment == null)
            return NotFound();

        return Ok(attachment);
    }

    [HttpGet("attachments/{id}/download")]
    // Downloads an attachment file
    public async Task<ActionResult> DownloadAttachment(int id)
    {
        var attachment = await _emailService.GetAttachmentAsync(id);
        if (attachment == null)
            return NotFound();

        var filePath = Path.Combine(_emailService.GetUploadsPath(), attachment.FilePath);
        if (!System.IO.File.Exists(filePath))
            return NotFound("File not found on server");

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(fileBytes, attachment.ContentType, attachment.FileName);
    }

    [HttpGet("test")]
    public async Task<ActionResult> TestConnection()
    {
        try
        {
            // Test database connection
            var emailCount = await _context.Emails.CountAsync();
            return Ok(new { message = "Database connection successful", emailCount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Database connection failed", error = ex.Message });
        }
    }
} 