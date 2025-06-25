# BlinkMail

BlinkMail is a full-stack email application featuring user authentication, inbox management, email composition, draft saving, and attachment support. The backend is built with ASP.NET Core (C#), and the frontend uses React, TypeScript, and Tailwind CSS.

---
## Table of Contents

- [Features](#features)
- [Backend (ASP.NET Core)](#backend-aspnet-core)
  - [Setup](#backend-setup)
  - [API Endpoints](#api-endpoints)
  - [Project Structure](#backend-project-structure)
- [Frontend (React)](#frontend-react)
  - [Setup](#frontend-setup)
  - [Project Structure](#frontend-project-structure)
- [Environment Variables](#environment-variables)
- [Technologies Used](#technologies-used)

---
## Features

- User registration and login (JWT authentication)
- View inbox, sent, and draft emails
- Compose and send emails
- Save emails as drafts
- Delete emails
- Mark emails as read
- Upload and download attachments
- Responsive, modern UI

---

## Backend (ASP.NET Core)

### Backend Setup

**Prerequisites:**
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- SQLite (default, or configure another DB)

**Steps:**
1. Navigate to the backend directory:
   ```bash
   cd EmailAppBackend
   ```
2. Restore dependencies:
   ```bash
   dotnet restore
   ```
3. Update the connection string in `appsettings.json` if needed.
4. Run database migrations (optional, for schema updates):
   ```bash
   dotnet ef database update
   ```
5. Start the backend server:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:8080` (or as configured).

### API Endpoints

#### AuthController (`/api/auth`)
- `POST /register` — Register a new user
- `POST /login` — Login and receive JWT
- `GET /validate-token` — Validate JWT token
- `GET /user-by-email?email=...` — Get user info by email

#### EmailController (`/api/email`)
- `POST /send` — Send a new email
- `GET /{id}` — Get email by ID
- `GET /inbox` — Get inbox emails
- `GET /sent` — Get sent emails
- `GET /drafts` — Get draft emails
- `POST /draft` — Save an email as draft
- `PUT /{id}` — Update an email
- `DELETE /{id}` — Delete an email
- `PUT /{id}/read` — Mark email as read
- `POST /{id}/attachments` — Add attachment to email
- `GET /attachments/{id}` — Get attachment metadata
- `GET /attachments/{id}/download` — Download attachment

### Backend Project Structure

- `Controllers/` — API controllers (Auth, Email)
- `Services/` — Business logic (AuthService, EmailService, UserService)
- `Models/` — Data models (User, Email, Attachment)
- `DTOs/` — Data Transfer Objects
- `Data/` — Entity Framework DB context
- `Migrations/` — Database migrations
- `wwwroot/uploads/` — Uploaded attachments

---

## Frontend (React)

### Frontend Setup

**Prerequisites:**
- Node.js (v14+)
- npm (v6+)

**Steps:**
1. Navigate to the frontend directory:
   ```bash
   cd EmailAppFrontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root with:
   ```
   VITE_API_URL=http://localhost:8080
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

5. To build for production:
   ```bash
   npm run build
   ```

### Frontend Project Structure

- `src/components/` — Reusable UI components (Sidebar, Layout, ProtectedRoute, HamburgerIcon)
- `src/pages/` — Main pages (Compose, Inbox, Sent, Drafts, Login, Register, Dashboard)
- `src/utils/` — Utility functions (e.g., Axios instance)
- `src/App.tsx` — Main app component
- `src/index.css` — Global styles

---

## Environment Variables

**Backend:**
- `appsettings.json` — Set connection strings, JWT secret, etc.

**Frontend:**
- `.env` — Set `VITE_API_URL` to backend API URL

---

## Technologies Used

**Backend:**
- ASP.NET Core 8.0
- Entity Framework Core (SQLite)
- JWT Authentication
- BCrypt.Net (password hashing)

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Heroicons
