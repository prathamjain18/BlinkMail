using System.Data.SQLite;
using Microsoft.EntityFrameworkCore;
using EmailAppBackend.Data;

namespace EmailAppBackend.Services
{
    public class EncryptedDatabaseService
    {
        private readonly string _connectionString;
        private readonly string _encryptionKey;

        public EncryptedDatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=EmailAppDb.db";
            _encryptionKey = configuration["Database:EncryptionKey"] ?? "YourSecretEncryptionKey2024!@#$%^&*()";
        }

        public void InitializeEncryptedDatabase()
        {
            var dbPath = ExtractDbPath(_connectionString);
            var dbDirectory = Path.GetDirectoryName(dbPath);
            
            if (!Directory.Exists(dbDirectory))
            {
                Directory.CreateDirectory(dbDirectory);
            }

            // Create encrypted database if it doesn't exist
            if (!File.Exists(dbPath))
            {
                using (var connection = new SQLiteConnection($"Data Source={dbPath};Version=3;"))
                {
                    connection.Open();
                    connection.ChangePassword(_encryptionKey);
                    Console.WriteLine($"[DB] Created encrypted database at: {dbPath}");
                }
            }
        }

        public string GetEncryptedConnectionString()
        {
            var dbPath = ExtractDbPath(_connectionString);
            return $"Data Source={dbPath};Password={_encryptionKey};Version=3;";
        }

        private string ExtractDbPath(string connectionString)
        {
            // Extract the database path from the connection string
            var dataSourceIndex = connectionString.IndexOf("Data Source=");
            if (dataSourceIndex >= 0)
            {
                var startIndex = dataSourceIndex + "Data Source=".Length;
                var endIndex = connectionString.IndexOf(';', startIndex);
                if (endIndex < 0) endIndex = connectionString.Length;
                return connectionString.Substring(startIndex, endIndex - startIndex);
            }
            return "EmailAppDb.db";
        }
    }
} 