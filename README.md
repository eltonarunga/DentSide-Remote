# DentSide Remote

DentSide Remote is a unified, dentist-only digital platform that serves as an all-in-one remote career hub for dental professionals. Dentists sign up, submit their credentials, set their availability, and access remote clinical and non-clinical income streams — including teledentistry consultations, insurance claims auditing, AI scan annotation, clear aligner staging, and DSO contracts — alongside a dedicated portal for dental clinics and practices.

![DentSide Remote Favicon](/public/favicon.svg)

---

## Key Modules & Platform Features

### 1. Teledentistry & Consultation Hub (`/consultations`)
- **Live Triage Queue**: Filterable case queue (`Routine`, `Urgent`, `Emergency` and status tabs) for second opinions, clear aligner staging, radiology reviews, and emergency triage.
- **Interactive Radiograph Viewer**: High-contrast dental scan viewer with zoom in/out, contrast inversion, and reset controls.
- **AI Clinical Decision Support (`POST /api/ai/diagnose`)**: Server-side Gemini AI (`gemini-4-hydrogen`) clinical assistant generating structured differential findings, urgency flags, recommended CDT codes, and standardized SOAP notes (Subjective, Objective, Assessment, Plan).
- **Automated Escrow Settlement**: Submitting a finalized clinical diagnosis completes the case and credits the practitioner's wallet ledger.

### 2. Opportunity Engine & AI Matchmaker (`/opportunities`)
- **Filterable Gig Marketplace**: Browse remote opportunities across Teledentistry, Freelance, Insurance Claims Review, AI Review, and Full-Time roles.
- **AI Matchmaker (`POST /api/ai/match`)**: Server-side Gemini AI endpoint evaluating the practitioner's profile (specialty, experience, licenses, availability) against live marketplace openings to produce ranked compatibility scores and tailored match reasons.
- **Application Proposals**: Submit applications with jurisdiction state and custom cover notes, with applied status tracked persistently against the authenticated account.

### 3. Multi-Currency Wallet & Escrow (`/wallet`)
- **Dual Payout Rails**: Supports Stripe Connect bank transfers and East African mobile money disbursements via M-Pesa.
- **Escrow Ledger & Payouts**: Tracks available balance, pending escrow holdings, deposits, consultation payouts, and withdrawals (`POST /api/wallet/deposit`, `POST /api/wallet/withdraw`).
- **CSV Statement Export**: One-click CSV statement download of transaction history.

### 4. Dentist Profile Builder & Credentialing (`/profile-builder`)
- **Comprehensive Practice Profile**: Configure academic degrees (`DDS`, `DMD`, `BDS`, `MSD`), institution, graduation year, clinical specialty tags, sub-specialties, years of experience, remote availability, and clinical bio.

### 5. Identity & License Verification (`/verification`)
- **Credential & Document Filing**: Submit issuing state/board details, license numbers, and supporting license documentation.
- **Sandbox Preview Approval**: Files verification metadata directly to the user profile for testing practitioner workflows, with automated NPPES/State Dental Board API clearinghouse integration planned for Phase 3.

### 6. Practice & Clinic Dashboard (`/client-dashboard`)
- **Client Workspace**: Portal for dental practices and DSOs to publish remote gigs (including AI-assisted gig drafting via `POST /api/ai/generate-gig`), inspect submitted applicants (`GET /api/gigs/:id/applications`), browse verified practitioners, and dispatch teledentistry consultation cases with active escrow tracking.

### 7. Authentication & Role-Based Access (`AuthContext`)
- **Firebase Authentication & Cloud Firestore**: Supports Google OAuth via Firebase Auth with Cloud Firestore persistence for user profiles (`users/{uid}`) governed by `firestore.rules` and `firebase-blueprint.json`.
- **Signed Demo Access**: One-click preview accounts for a Licensed Dentist (`Dr. Sarah Jenkins, DDS`) and Dental Practice Client (`Pacific Dental Clinic`), backed by signed HMAC-SHA256 demo session tokens when testing without Firebase keys.
- **Role Isolation**: Route guards and backend Bearer token authentication enforce separation between practitioner (`dentist`) and practice (`client`) workflows.

---

## Route Overview

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Landing page (redirects signed-in users to `/dashboard` or `/client-dashboard`) |
| `/login` | Public | Google Sign-In, role onboarding selector, and Demo Access switcher |
| `/dashboard` | Dentist (Protected) | Practitioner overview, metrics, availability toggle, and quick AI matching |
| `/opportunities` | Dentist (Protected) | Gig marketplace, AI Matchmaker, and proposal submission |
| `/consultations` | Dentist (Protected) | Triage queue, radiograph zoom/invert viewer, and AI SOAP/CDT diagnosis |
| `/wallet` | Dentist (Protected) | Multi-currency ledger (Stripe / M-Pesa), payouts, deposits, and CSV export |
| `/profile-builder` | Dentist (Protected) | Academic credentials, specialty tags, availability, and bio |
| `/verification` | Dentist (Protected) | License details and credential document upload |
| `/client-dashboard` | Client (Protected) | Practice portal for posting gigs, reviewing applicants, and creating consults |
| `/privacy` | Public | Privacy policy and healthcare data handling disclosure |
| `/terms` | Public | Service terms, escrow guidelines, and teledentistry compliance |

---

## Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Design System & Theming**: Grayscale structural palette (`#111111` / `#6B7280` / `#E5E7EB` / `#FFFFFF`) with Electric Blue (`#2563EB`) primary accents and Light/Dark theme switching via `ThemeContext` and `ThemeToggle` (see [`design.md`](./design.md))
- **Backend**: Express.js (`server.ts`) with `vite.middlewares` in development and `node --experimental-strip-types server.ts` in production
- **AI & Intelligence**: Server-side `@google/genai` (`gemini-4-hydrogen`) with structured JSON schemas for AI matching, SOAP/CDT clinical assistance, and gig drafting
- **Authentication & Persistence**: Firebase Auth & Cloud Firestore (`users` collection) alongside server-side in-memory preview stores for marketplace gigs, applications, consultations, and wallet transactions
- **Security**: Helmet HTTP headers, CORS, API rate limiting, Zod request validation, Bearer token middleware (Firebase RS256 ID tokens + signed demo tokens), and role checks

---

## Setup & Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment configuration**:
   Create a `.env` file from `.env.example` and configure environment secrets:
   - `GEMINI_API_KEY`: Required for server-side Gemini AI endpoints (configured via **Settings > Secrets** in AI Studio or `.env` locally).
   - **Firebase Configuration**: Provisioned automatically via `firebase-applet-config.json` (with `firestore.rules` deployed to the configured Firestore database). Instant Demo Access also remains available on `/login`.
3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Production Build & Start

- **Typecheck & Build**:
  ```bash
  npm run lint
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm start
  ```
  Runs `node --experimental-strip-types server.ts` on port `3000`.

---

## Security Notes
- **Server-Side AI Proxy**: `GEMINI_API_KEY` is read exclusively by `server.ts` and never exposed to client bundles.
- **Authenticated API Routes**: Protected `/api/*` endpoints require a valid `Authorization: Bearer <token>` header and verify ownership and role permissions.
- **Firestore Rules**: `firestore.rules` and `firebase-blueprint.json` define field allowlists, immutable identity timestamps, and owner/admin checks; review and verify rules against your production requirements before deploying broadly.
