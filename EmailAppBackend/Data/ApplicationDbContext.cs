using Microsoft.EntityFrameworkCore;
using EmailAppBackend.Models;

namespace EmailAppBackend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Email> Emails { get; set; }
    public DbSet<Attachment> Attachments { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Email).IsRequired().HasColumnType("varchar(255)");
            entity.Property(e => e.PasswordHash).IsRequired().HasColumnType("text");
            entity.Property(e => e.FirstName).IsRequired().HasColumnType("varchar(255)");
            entity.Property(e => e.LastName).IsRequired().HasColumnType("varchar(255)");
        });
        
        // Configure relationships
        modelBuilder.Entity<Email>()
            .HasOne(e => e.Sender)
            .WithMany(u => u.SentEmails)
            .HasForeignKey(e => e.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Email>()
            .HasOne(e => e.Recipient)
            .WithMany(u => u.ReceivedEmails)
            .HasForeignKey(e => e.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Email>()
            .Property(e => e.RecipientEmail)
            .HasColumnType("varchar(255)");
            
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Email)
            .WithMany(e => e.Attachments)
            .HasForeignKey(a => a.EmailId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Configure entity relationships and property types for the database schema
    }
} 