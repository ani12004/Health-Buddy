# Health Buddy AI - Developer Documentation

This is the end-to-end technical reference for the Health Buddy web platform, from public website routes through dashboard flows, server actions, Gemini orchestration, and external ML inference.

## 1) Full Technology Stack

- Frontend framework: Next.js 16.1.6 (App Router)
- UI runtime: React 19.2.3
- Language: TypeScript 5
- Styling: Tailwind CSS 4
- Animation: Framer Motion
- Icons: Lucide React
- Auth and DB: Supabase (SSR + PostgreSQL)
- LLM integration: `@google/generative-ai` (Gemini family)
- ML inference backend: FastAPI service (Hugging Face Space)
- Notifications: Sonner + database notifications table

## 2) Repository Layout

- `/app`: App Router pages, route groups, and API route handlers
  - `/(auth)`: login/register
  - `/(dashboard)`: patient + doctor protected routes
  - `/docs`: in-app documentation center
  - `/api/reports/[id]/pdf`: report PDF API endpoint
- `/components`: reusable UI and feature modules
  - `/layout`: navbar/sidebar/footer/notifications
  - `/features`: workflow feature components
  - `/ui`: primitive controls and visual elements
- `/lib/supabase`: client/server/middleware auth setup
- `/lib/actions`: server actions (DB + AI + ML integration)
- `/hooks`: client-side state hooks like `useUser`
- `/docs`: markdown documentation and ML reference files
- `/health buddy ml v10`: Python ML stack and model artifacts

## 3) Routing Model

### Public routes (no login)

- `/`
- `/login`
- `/register`
- `/onboarding`
- `/features`
- `/how-it-works`
- `/security`
- `/enterprise`
- `/customer-stories`
- `/about`
- `/careers`
- `/press`
- `/contact`
- `/privacy`
- `/terms`
- `/hipaa`
- `/docs`
- `/docs/*`

### Protected patient routes

- `/patient/dashboard`
- `/patient/profile`
- `/patient/medical-reports`
- `/patient/medical-reports/[id]`
- `/patient/appointments`
- `/patient/medications`
- `/patient/chat`
- `/patient/ai-checkup`
- `/patient/assessment`
- `/patient/health-update`
- `/patient/settings`
- `/patient/whats-new`

### Protected doctor routes

- `/doctor/dashboard`
- `/doctor/patients`
- `/doctor/patients/[id]`
- `/doctor/appointments`
- `/doctor/analytics`
- `/doctor/settings`

## 4) Authentication and Middleware Flow

- `middleware.ts` is the global gatekeeper.
- It calls `updateSession(request)` from `lib/supabase/middleware.ts`.
- `updateSession` initializes `createServerClient` and syncs cookies.
- Middleware classifies request path as public/private.
- If private and unauthenticated -> redirect to `/login`.
- If authenticated but wrong role path -> redirect to role dashboard.
- Root `/` remains public, even for authenticated users.

## 5) Supabase and Data Surfaces

Core application tables currently used in actions and UI:

- `profiles`: identity extension and role metadata
- `doctors`: doctor profile extension fields
- `appointments`: scheduling lifecycle
- `prescriptions`: medication issuance and status
- `notifications`: event stream per user
- `reports`: generated health report records
- `health_assessments`: structured AI/ML assessment payloads
- `chats`: chat sessions and message history
- `ml_feedback`: post-assessment quality feedback

## 6) Complete Server Action Method Catalog

### Auth and profile actions

- `syncUser()`
- `updateUserRole(role: 'patient' | 'doctor')`
- `updateAvatarUrl(url: string)`
- `updateProfile(data: any)`

### Appointment and medication actions

- `createAppointment(data)`
- `updateAppointmentStatus(id, status)`
- `issuePrescription(data)`
- `updatePrescriptionStatus(id, status)`

### Reports and notifications

- `getPatientReports()`
- `shareReportWithDoctor(reportId, doctorId)`
- `getReportById(id)`
- `getNotifications()`
- `markNotificationAsRead(id)`
- `createNotification(userId, message, type)`

### Chat and feedback

- `saveMessage(content, role, sessionId)`
- `getChatMessages(sessionId)`
- `getLatestCheckupResult()`
- `submitMLFeedback(data)`
- `getDoctors()`

### Gemini and ML integration methods

- `analyzeSymptoms(symptoms)`
- `chatWithAI(userMessage, checkupResults, history)`
- `getHealthUpdate(userFeeling)`
- `analyzeHealthWithGemini(input, language)`
- `explainMLWithGemini(input, mlResults, language)`
- `generateWithModelFallback(apiKey, prompt)`
- `runMLBridge(input)`
- `checkMLHealth()`
- `analyzeHealthData(data, language)`
- `getReportPDFData(reportId)`
- `analyzeHealth(input)`

## 7) Site-to-ML Pipeline (AI Checkup)

1. Patient completes AI Checkup form on `/patient/ai-checkup`.
2. Client invokes `analyzeHealthData(data, language)` server action.
3. Form inputs are normalized and mapped to strict `HealthInput` schema.
4. `runMLBridge(input)` sends `POST /predict` to external ML API.
5. If ML fails, pipeline falls back to `analyzeHealthWithGemini`.
6. For non-English languages, Gemini full localization is attempted.
7. If localization output is invalid or still English, deterministic language-pack fallback is used.
8. For English path with missing explanation details, `explainMLWithGemini` enriches output.
9. Unified output contract is returned for UI cards/charts/summary text.
10. If user is authenticated, assessment is persisted to `health_assessments` and `reports`.

## 8) ML Bridge Contract

`lib/actions/ml/bridge.ts` defines strict request and response interfaces.

### Request endpoint

- `POST {ML_API_URL}/predict`

### Health probe

- `GET {ML_API_URL}/health`

### Input payload (18 explicit fields)

- `age`, `sex`, `bmi`, `waist`, `systolic_bp`, `diastolic_bp`, `heart_rate`
- `history`, `total_cholesterol`, `ldl`, `hdl`, `triglycerides`
- `fasting_glucose`, `hba1c`, `smoking`, `activity`, `stress`, `salt_intake`

### Response envelope

- `'Heart Disease'`
- `'Hypertension'`
- `'Diabetes'`
- `health_score`
- `version`
- `ensemble`

Each disease includes risk metrics, model probabilities, risk drivers, and protective factors.

## 9) Gemini Orchestration Details

### Key Gemini modules

- `gemini/symptoms.ts`: symptom-to-JSON triage
- `gemini/healthAssessment.ts`: full 3-condition JSON assessment
- `gemini/explainResults.ts`: explanation and precautions synthesis
- `gemini/chat.ts`: health companion conversational responses
- `gemini/healthUpdate.ts`: brief empathetic wellness update
- `gemini/modelFallback.ts`: model candidate failover engine

### Parsing strategy

- Extract first `{` to last `}` from LLM text
- Parse JSON
- Return typed data or robust fallback error

### Model fallback

- Candidate list from `GEMINI_MODEL_CANDIDATES` env var or defaults
- Tries models in order until one succeeds

## 10) API Route Notes

- `GET /api/reports/[id]/pdf` authenticates user and currently returns temporary `503` (PDF generation disabled).
- `getReportPDFData(reportId)` still exists to shape report data for future PDF template rendering.

## 11) Environment Variables

Required or supported in this project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `ML_API_URL` (optional override)
- `GEMINI_MODEL_CANDIDATES` (optional model fallback list)

## 12) Build and Quality Commands

- `npm run dev`
- `npm run build`
- `npm run lint`

## 13) Developer Notes and Operational Tips

- Keep LLM outputs behind strict JSON contracts and parse guards.
- Preserve role boundaries at middleware and data-query layers.
- Treat external ML as a network dependency: handle timeout and cold-start gracefully.
- Prefer typed interfaces in action boundaries before persisting to DB.
- Keep user-facing health copy as guidance and non-diagnostic language.
