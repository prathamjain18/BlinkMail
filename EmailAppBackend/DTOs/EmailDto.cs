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
    }
} 