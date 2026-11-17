# DentSide Remote - Strategic Phasing & Milestones

## 🟢 PHASE 1 — Core Platform & Marketplace MVP (Completed)
**Focus:** Practitioner onboarding, gig marketplace, multi-currency wallet ledger, and practice portal.
- [x] Design Public Landing Page (`/`) & Role-Aware Practitioner Dashboard (`/dashboard`)
- [x] Setup Full-Stack Architecture (Express.js `server.ts` + Vite + React 19 + TypeScript)
- [x] Implement Authenticated API Middleware (Firebase RS256 ID token verification + signed HMAC-SHA256 demo tokens) & Role Guards
- [x] Harden Cloud Firestore Security Rules (`firestore.rules`) & Schema Blueprint (`firebase-blueprint.json`)
- [x] Implement Dentist Profile Builder (`/profile-builder`) with degrees, specialties, availability, and clinical bios
- [x] Build Gig Marketplace (`/opportunities`) with search, type filtering, persistent applied status, and proposal submissions
- [x] Integrate Multi-Currency Wallet & Escrow Ledger (`/wallet`) supporting Stripe Connect, M-Pesa payout channel, deposits, and CSV statement export
- [x] Implement Server-Side AI Opportunity Matchmaker (`POST /api/ai/match`) using `@google/genai` (`gemini-4-hydrogen`)
- [x] Credential & License Document Submission Flow (`/verification`) with sandbox preview workflow
- [x] Clinic & DSO Client Portal (`/client-dashboard`) with AI gig generator, applicant drawer, dentist directory, and consult dispatch

---

## 🟡 PHASE 2 — Teledentistry Layer (Core Clinical Workbench Shipped)
**Focus:** Second opinions, treatment planning, diagnostic scan review, and AI-assisted documentation.
- [x] Virtual Consultations Hub (`/consultations`) with urgency & status triage filters
- [x] Interactive Digital Dental Radiograph Viewer with zoom in/out, contrast inversion, and reset controls
- [x] Server-Side AI Clinical Decision Support (`POST /api/ai/diagnose`) generating structured SOAP notes, CDT codes, and risk stratification via Gemini (`gemini-4-hydrogen`)
- [x] Automatic consultation payout settlement into the practitioner wallet ledger upon diagnosis completion
- [ ] WebRTC peer mesh signaling backend & live video/audio consult room UI
- [ ] Automated jurisdiction license-aware state routing enforcement
- [ ] Patient-facing booking and pre-consult intake questionnaire widget

---

## 🔴 PHASE 3 — Persistence, Verification APIs & Enterprise Layer (Upcoming)
**Focus:** Production database persistence, real-time clearinghouses, insurance batch claims, and payment webhooks.
- [ ] Migrate server in-memory preview stores (gigs, applications, consultations, wallet ledger) to persistent database storage (Cloud Firestore Admin / Cloud SQL)
- [ ] Direct automated API integrations with State Dental Boards & NPPES NPI Registry
- [ ] Dedicated Insurance Claims Review Portal with prior-authorization batch processing (EDI 837/835)
- [ ] Automated Escrow settlement via Stripe Connect & Daraja M-Pesa webhooks
- [ ] DSO multi-location staff scheduling, contract management, and dispute arbitration
