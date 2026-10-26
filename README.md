# DentSide Remote

DentSide Remote is a unified, dentist-only digital platform (web + mobile app) that serves as an all-in-one remote career hub for dental professionals. Dentists sign up once, verify their licenses, set their availability, and gain instant access to diverse income streams — including teledentistry, insurance review, freelance gigs, medico-legal consulting, and corporate DSO contracts — all within a single dashboard.

![DentSide Remote Favicon](/public/favicon.svg)

---

## Key Modules & Platform Features

### 1. Teledentistry & Consultation Hub (`/consultations`)
- **Virtual Exam Rooms**: Simulated interactive video consultation interface with camera, audio, screen share, and session recording controls.
- **Radiograph & DICOM Viewer**: High-contrast digital dental imaging viewer supporting bitewings, panorex, and periapical views with invert and zoom controls.
- **AI SOAP Notes Generator**: Integrated clinical assistant powered by Gemini API that auto-synthesizes subjective symptoms, objective findings, assessment, and care plans into standardized medical SOAP notes.
- **Triage & State-Level Routing**: Intake queue prioritizing emergencies, post-op checks, orthodontic aligner consults, and second opinions.

### 2. Opportunity Engine & AI Matchmaker (`/opportunities`)
- **Filterable Gig Marketplace**: Browse remote opportunities across Teledentistry, Insurance Claims Review, Medical Writing, Academic Tutoring, DSO Consulting, and Medico-Legal case review.
- **AI Matchmaker (`/api/match`)**: Gemini-powered matchmaking endpoint analyzing practitioner profiles (experience, specialties, jurisdiction licenses) against gig requirements to compute a compatibility score and tailored rationale.
- **Application Drawer & Gig Poster**: Practitioners can submit customized proposals with estimated turnarounds, and clinic clients can post new gigs directly.

### 3. Multi-Currency Wallet & Escrow (`/wallet`)
- **Dual Payout Rails**: Global payment support with direct Stripe Connect bank deposits and Kenyan / East African mobile money disbursements via M-Pesa.
- **Milestone Escrow Protection**: Client funds are held securely in escrow upon contract start and released instantly upon practitioner milestone approval.
- **Financial Analytics**: Available balance, pending escrow funds, lifetime earnings, and downloadable statement records.

### 4. Dentist Profile Builder & Credentialing (`/profile-builder`)
- **Comprehensive Practice Profile**: Set custom clinical bios, hourly consulting rates, per-case review rates, time zones, and availability schedules.
- **Clinical Specialization Tags**: Tagging for General Dentistry, Orthodontics, Endodontics, Periodontics, Prosthodontics, Dental Radiology, and Dental Public Health.
- **Residency & Academic Credentials**: Track dental schools, advanced degrees (DDS, DMD, BDS, MSD), and hospital residency credentials.

### 5. Identity & License Verification Engine (`/verification`)
- **Jurisdiction & Board Clearinghouse**: Automated verification checks across state boards, National Provider Identifiers (NPI), and international councils (e.g., KMPDC).
- **Fraud Prevention & Credential Badges**: Cryptographically-verified badges displayed on verified practitioner cards to build trust with clinics and insurance payers.

### 6. Practice & Clinic Dashboard (`/client-dashboard`)
- **Client Workspace**: Tailored portal for DSOs, private dental practices, and health-tech enterprises to manage postings, review candidates, inspect escrow status, and message verified doctors.

### 7. Resilient Authentication & Role-Based Access (`AuthContext`)
- **Flexible Auth**: Support for Google OAuth and Email/Password via Firebase Authentication.
- **One-Click Demo Profiles**: Instant testing access as either a Licensed Dentist (`Dr. Felix Jenkins, DDS`) or Dental Practice Manager (`Pacific Dental Group`).
- **Offline Resilience**: Local session caching and graceful offline fallbacks so practitioners are never locked out during intermittent network connectivity.

---

## Route Overview

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public / Dentist | Main practitioner dashboard and performance analytics |
| `/login` | Public | Authentication, Google Sign-in, Demo switcher, and role selection |
| `/opportunities` | Dentist (Protected) | Gigs marketplace, AI Matchmaker, and application flow |
| `/consultations` | Dentist (Protected) | Virtual exam rooms, DICOM viewer, and AI SOAP notes generator |
| `/wallet` | Dentist (Protected) | Multi-currency payouts (M-Pesa / Stripe) and escrow ledger |
| `/profile-builder` | Dentist (Protected) | Clinical bio, rates, availability, and specialty tagging |
| `/verification` | Dentist (Protected) | License upload, NPI checks, and credential verification |
| `/client-dashboard` | Client (Protected) | DSO / Dental clinic employer portal and candidate tracker |
| `/privacy` | Public | Privacy policy and healthcare data handling disclosure |
| `/terms` | Public | Service terms, escrow guidelines, and teledentistry compliance |

---

## Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Express.js with Vite middleware in development (`server.ts`)
- **AI & Intelligence**: Google Gemini API (`@google/genai`) for match scoring and clinical SOAP note generation
- **Authentication & Database**: Firebase Auth, Cloud Firestore with defensive offline caching
- **Styling & Design System**: Tailwind CSS utility classes, Inter and Manrope typography, medical cyan & deep blue palette (`#0077B6`, `#00B4D8`)

---

## Setup & Running Locally

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd dentside-remote
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` (or use the built-in BYOK modal within the app).

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Production Deployment

- **Build Application**:
  ```bash
  npm run build
  ```
- **Run Production Server**:
  ```bash
  npm start
  ```
  Runs `node server.ts` which serves the Express API routes alongside the compiled Vite assets on port 3000.

---

## Security & Compliance
- **Zero Hardcoded Secrets**: All external API keys use the Bring-Your-Own-Key (BYOK) pattern or server-side environment proxies.
- **HIPAA / Data Handling Principles**: Protected medical health disclosures, ephemeral video room state, and strict client-side encryption awareness for clinical records.
- **Role Isolation**: Strict route guards separating licensed dentist workflows from enterprise dental practice operations.
