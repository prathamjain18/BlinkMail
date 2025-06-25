namespace EmailAppBackend.DTOs
{
    public class EmailDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Sender { get; set; } = string.Empty;
        public string Recipient { get; set; } = string.Empty;
        public string RecipientEmail { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public bool IsHighPriority { get; set; }
        public List<AttachmentDto> Attachments { get; set; } = new List<AttachmentDto>();
    }

    public class AttachmentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string UploadedAt { get; set; } = string.Empty;
    }
} 