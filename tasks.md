# Tasks & Roadmap

## ✅ Completed Tasks (Phase 1 & Phase 2 Core)

- [x] **Dentist Profiles & Profile Builder**: Implemented customizable profile builder with clinical bios, hourly rates, case review fees, time zones, credentials, and specialty tagging (`/profile-builder`).
- [x] **Gig Marketplace & Discovery Engine**: Built interactive freelance & remote opportunity marketplace with search, category filtering, proposal drawer, and gig creation modal (`/opportunities`).
- [x] **Payments & Multi-Currency Escrow**: Integrated Stripe Connect bank payouts and East African M-Pesa mobile money support with escrow lock and release workflows (`/wallet`).
- [x] **AI Matchmaker Service**: Deployed Gemini-powered matchmaking endpoint (`/api/match`) that computes dentist compatibility scores with rationale.
- [x] **Teledentistry Consultations Hub**: Shipped interactive video exam room, diagnostic radiograph/DICOM viewer with invert/zoom, and automated AI SOAP clinical notes generator (`/consultations`).
- [x] **Identity & License Verification**: Implemented multi-board license lookup, verification status badges, and credential uploads (`/verification`).
- [x] **Practice / Client Portal**: Built dedicated workspace for dental practices and DSOs to manage postings and applicants (`/client-dashboard`).
- [x] **Favicon & Brand Identity**: Designed and linked crisp modern SVG dental remote emblem favicon and updated app metadata.
- [x] **Documentation Sync**: Synchronized `README.md`, `planning.md`, and `tasks.md` to reflect full-stack architecture and feature set.

---

## 🚀 Active & Next-Up Tasks (Phase 2 & Phase 3 Roadmap)

- [ ] **WebRTC Live Signaling Server**: Implement WebSocket signaling in `server.ts` for live peer-to-peer audio/video streaming in consultations.
- [ ] **Real-Time Messaging**: Add live in-app messaging between hiring clinics and dentists during gig applications and teledentistry consultations.
- [ ] **Automated NPI / Board Lookup**: Connect live API queries to NPPES NPI Registry for instant real-time US provider verification.
- [ ] **Insurance Review Batch Portal**: Build batch claims evaluation workbench with EDI 837/835 dental claim code parser.
- [ ] **Automated Escrow Webhook Listeners**: Wire Stripe webhooks (`/api/webhooks/stripe`) and Daraja M-Pesa STK push callbacks for instant automated balance top-ups.
- [ ] **PWA Offline Service Worker**: Add progressive web app service worker for offline gig bookmarking and cached radiograph viewing.
