# BlinkMail - Email Application

A simple email application with authentication, draft autosave, inbox filtering, and encrypted storage.

## Features Implemented

### ✅ Authentication
- JWT-based authentication with BCrypt password hashing
- Protected API endpoints with `[Authorize]` attribute
- Token validation and automatic logout on expiration
- Secure password requirements (minimum 8 characters)

### ✅ Draft Autosave
- Automatic draft saving every 30 seconds when typing
- Visual indicators showing save status ("Saving..." / "Saved at time")
- Manual save button also available
- Drafts are preserved with attachments

### ✅ Inbox Filtering
- Search emails by subject, body, sender, or recipient
- Filter by read/unread status
- Filter by high priority emails
- Debounced search (500ms delay) to avoid excessive API calls
- Clear filters button to reset all filters

### ✅ Encrypted SQLite Storage
- Database encrypted using SQLCipher
- Encryption key stored in configuration
- Automatic database creation with encryption
- Test endpoint to verify encryption is working

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate-token` - Validate current token
- `GET /api/auth/test-encryption` - Test database encryption

### Emails
- `GET /api/email/inbox?search=&isRead=&isHighPriority=` - Get filtered inbox
- `GET /api/email/sent` - Get sent emails
- `GET /api/email/drafts` - Get draft emails
- `POST /api/email/draft` - Save new draft
- `PUT /api/email/{id}` - Update email/draft
- `DELETE /api/email/{id}` - Delete email
- `PUT /api/email/{id}/read` - Mark email as read

## Configuration

The application uses encrypted SQLite storage. The encryption key is configured in `appsettings.json`:

```json
{
  "Database": {
    "EncryptionKey": "YourSecretEncryptionKey2024!@#$%^&*()"
  }
}
```

## Security Features

- HTTPS enforced
- JWT tokens with 1-hour expiration
- BCrypt password hashing
- CORS restricted to known origins
- Database encryption at rest
- Automatic token cleanup on 401 responses

## Getting Started

1. Clone the repository
2. Update the encryption key in `appsettings.json`
3. Run the backend: `dotnet run`
4. Run the frontend: `npm start`
5. Register a new account and start using the email application

## Notes

- Draft autosave triggers when you have a recipient and either subject or body content
- Search is debounced to improve performance
- Database encryption is transparent to the application logic
- All sensitive data is encrypted at rest in the SQLite database 
