# Health Buddy AI - Developer Documentation

This document provides technical details for developers working on the Health Buddy AI project.

## Technology Stack
- **Frontend**: Next.js 16 (Turbopack), React 19, Tailwind CSS 4
- **Language**: TypeScript
- **Authentication**: Supabase Auth (Email/Password)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **Styling**: Vanilla CSS with Tailwind utilities, Framer Motion for animations
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure
- `/app`: Next.js App Router pages and layouts.
  - `/(auth)`: Authentication related pages (Login, Register).
  - `/(dashboard)`: Protected dashboard routes for patients and doctors.
- `/components`: Reusable UI components.
  - `/ui`: Accessible primitive components.
  - `/features`: Feature-specific components (Chat, Symptom Checker, etc.).
- `/lib`: Shared utilities and service clients.
  - `/supabase`: Supabase client and middleware configurations.
  - `/actions`: Next.js Server Actions for data mutations and AI calls.
- `/docs`: Project documentation.
- `/hooks`: Custom React hooks.

## Environment Variables
The following variables are required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous API key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side admin tasks).
- `GEMINI_API_KEY`: Your Google Gemini API key.

## Database Schema
The database uses several key tables:
- `profiles`: Extends `auth.users` with roles and metadata.
- `patients`: Patient-specific medical data.
- `doctors`: Doctor-specific professional data.
- `appointments`: Scheduling information.
- `reports`: Medical reports and analysis results.
- `chats`: Message history for the AI companion.

Refer to `init_schema.sql` in the root directory for the complete SQL setup.

## Authentication Flow
The application uses Supabase for authentication.
1. **Registration**: Users select a role (Patient/Doctor) during sign-up. Metadata is stored in `auth.users`.
2. **Profile Sync**: A PostgreSQL trigger (`on_auth_user_created`) automatically creates a corresponding entry in the `profiles` and role-specific tables.
3. **Session Management**: Handled via `lib/supabase/middleware.ts` to protect routes and redirect based on user roles.

## AI Implementation
Symptom analysis is handled via the `analyzeSymptoms` server action in `lib/actions/gemini/symptoms.ts`. It uses the `gemini-2.5-flash` model to return structured JSON data for potential conditions and severity.

## Development Commands
- `npm run dev`: Start the development server.
- `npm run build`: Build the production application.
- `npm run lint`: Run ESLint for code quality checks.
