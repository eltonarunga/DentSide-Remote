# Tasks & Roadmap

## ✅ Completed Tasks

- [x] **Full-Stack Security & Auth Hardening**: Implemented Express Bearer token authentication (`requireAuth`, `requireRole`) supporting Firebase RS256 ID tokens and signed HMAC-SHA256 demo session tokens, ownership checks on wallet/consultation endpoints, and explicit `type` imports for Node `--experimental-strip-types`.
- [x] **Firestore Schema & Rules Synchronization**: Aligned `firebase-blueprint.json`, `firestore.rules`, `src/lib/firebase.ts` (`firestoreDatabaseId` + `handleFirestoreError`), and `AuthContext.tsx` onboarding/profile sanitization (`createdAt`/`updatedAt` timestamps and bounded fields).
- [x] **Server-Side Gemini AI Integration**: Upgraded `@google/genai` and unified `/api/ai/match`, `/api/ai/diagnose`, and `/api/ai/generate-gig` on `gemini-4-hydrogen` with structured JSON `responseSchema` outputs using server-side `GEMINI_API_KEY`.
- [x] **Dentist Profiles & Verification Flow**: Built `/profile-builder` and `/verification` with consistent navigation, experience option alignment, and persistent profile updates.
- [x] **Gig Marketplace & AI Matchmaker**: Aligned `/opportunities` and `POST /api/ai/match` request/response contracts, persisted applied gig state across reloads via `GET /api/gigs/applied/:dentistId`, and fixed cover note & license state submissions.
- [x] **Multi-Currency Wallet & Ledger**: Fixed Stripe/M-Pesa withdrawal channel validation, real balance/escrow computation, transaction sign formatting across all ledger types, and CSV statement export (`/wallet`).
- [x] **Teledentistry Consultations Hub**: Built live triage filtering, interactive radiograph zoom/contrast invert controls, and AI-assisted SOAP/CDT clinical diagnosis with automatic escrow release (`/consultations`).
- [x] **Clinic & DSO Client Portal**: Implemented real applicant inspection (`GET /api/gigs/:id/applications`), dynamic active case escrow totals, dentist selection binding for consult dispatch, and AI gig drafting (`/client-dashboard`).
- [x] **UI & Animation Polish**: Added missing CSS fade/slide animations in `src/index.css`, removed `window.alert` usage, and synchronized `README.md`, `planning.md`, and `tasks.md`.
- [x] **Design System & Dual-Theme Implementation (`design.md`)**: Established authoritative `design.md` specification using the grayscale base (`#111111` / `#6B7280` / `#E5E7EB` / `#FFFFFF`) and Electric Blue (`#2563EB`) accent, wired CSS custom properties and Tailwind v4 `@theme inline` tokens in `src/index.css`, added persistent Light/Dark switching (`ThemeContext`, `ThemeToggle`), and migrated all pages and components.

---

## 🚀 Active & Next-Up Tasks (Phase 2 Completion & Phase 3)

- [ ] **Persistent Marketplace & Ledger Storage**: Replace server-side in-memory arrays (`gigsStore`, `consultationsStore`, `transactionsStore`, `applicationsStore`) with persistent database storage.
- [ ] **WebRTC Live Signaling Server & Video Room**: Add WebSocket signaling and interactive audio/video consultation controls in `/consultations`.
- [ ] **Real-Time Messaging**: Implement direct messaging between hiring clinics and practitioners on active gig applications and consultations.
- [ ] **Automated NPI / State Board Lookup**: Connect live NPPES NPI Registry and dental board verification APIs in `/verification`.
- [ ] **Insurance Review Batch Portal**: Build batch claims evaluation workbench with CDT / EDI 837/835 parsing.
- [ ] **Payment Provider Webhooks**: Wire Stripe Connect webhooks and Daraja M-Pesa STK push callbacks for live fund settlement.
