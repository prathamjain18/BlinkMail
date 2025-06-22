# Email App Frontend

This is the frontend application for the Email App, built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (login/register)
- View inbox and sent emails
- Compose new emails
- Save email drafts
- Delete emails
- Mark emails as read
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add:
```
VITE_API_URL=http://localhost:5217
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5217`.

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Heroicons 