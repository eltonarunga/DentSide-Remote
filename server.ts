import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { GoogleGenAI, Type } from '@google/genai';

// ==========================================
// Domain Types & Interfaces
// ==========================================

export interface GigItem {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  type: 'Teledentistry' | 'Freelance' | 'Insurance' | 'AI Review' | 'Full-Time';
  rate: string;
  rateNum: number;
  location: string;
  stateRequired?: string;
  description: string;
  requirements: string[];
  tags: string[];
  matchScore?: string;
  postedAt: string;
  clientId?: string;
  applicantsCount: number;
}

export interface GigApplication {
  id: string;
  gigId: string;
  dentistId: string;
  dentistName: string;
  dentistDegree?: string;
  specialty?: string;
  licenseNumber?: string;
  licenseState?: string;
  coverNote?: string;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Declined';
  appliedAt: string;
}

export interface ConsultationCase {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  symptoms: string[];
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  caseType:
    | 'Orthodontic Review'
    | 'Clear Aligner Staging'
    | 'Telediagnostic Second Opinion'
    | 'Radiology Review'
    | 'Emergency Triage';
  scanImageUrl?: string;
  status: 'Pending Review' | 'In Progress' | 'Completed';
  dentistId?: string;
  dentistName?: string;
  clientId: string;
  clientName: string;
  fee: number;
  createdAt: string;
  clinicalDiagnosis?: {
    soapSubjective?: string;
    soapObjective?: string;
    soapAssessment?: string;
    soapPlan?: string;
    cdtCodes?: string[];
    riskLevel?: 'Low' | 'Moderate' | 'High';
    notes?: string;
    completedAt?: string;
  };
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'consultation_payout' | 'escrow_hold' | 'escrow_release';
  amount: number;
  date: string;
  description: string;
  status: 'Completed' | 'Pending';
  channel?: 'stripe' | 'mpesa' | 'bank_transfer';
  referenceId?: string;
}

export interface DentistProfileItem {
  id: string;
  name: string;
  title: string;
  specialty: string;
  degree: string;
  institution: string;
  experience: string;
  location: string;
  licenseState: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  avatarUrl: string;
  subSpecialties: string[];
  availableFor: string;
  verified: boolean;
}

interface AuthUser {
  uid: string;
  role: 'dentist' | 'client' | 'admin';
  email: string;
  name: string;
  isDemo: boolean;
}

interface AuthenticatedRequest extends Request {
  auth?: AuthUser;
}

// ==========================================
// In-Memory State Stores (Demo / Preview)
// ==========================================

const gigsStore: GigItem[] = [
  {
    id: 'gig-1',
    title: 'Teledentistry Consultation Specialist',
    company: 'Delta Dental Advisors',
    companyLogo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100&auto=format&fit=crop&q=80',
    type: 'Teledentistry',
    rate: '$95/hr',
    rateNum: 95,
    location: 'Remote (US Wide)',
    stateRequired: 'California',
    description: 'Provide virtual video consultations for acute emergency dental triage and orthodontic preliminary assessments.',
    requirements: ['Active California or multi-state DDS/DMD license', '3+ years clinical experience', 'HIPAA compliant workspace'],
    tags: ['Invisalign', 'Treatment Plan', 'Part-Time'],
    matchScore: '98%',
    postedAt: '2 hours ago',
    applicantsCount: 1,
  },
  {
    id: 'gig-2',
    title: 'Dental AI Clinical Reviewer & Annotator',
    company: 'DentAI Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80',
    type: 'AI Review',
    rate: '$120/hr',
    rateNum: 120,
    location: 'Remote Worldwide',
    description: 'Validate computer-vision 3D margin detection and bone loss annotations on CBCT and bitewing radiographic scans.',
    requirements: ['DDS/DMD or BDS degree', 'Experience with digital intraoral scanners (iTero/3Shape)', 'Strong diagnostic eye'],
    tags: ['Dental AI', 'iTero Scanning', 'Flexible'],
    matchScore: '95%',
    postedAt: '5 hours ago',
    applicantsCount: 0,
  },
  {
    id: 'gig-3',
    title: 'Telediagnostics Night Consult Specialist',
    company: 'Apex Emergency Dental Network',
    companyLogo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100&auto=format&fit=crop&q=80',
    type: 'Teledentistry',
    rate: '$115/hr',
    rateNum: 115,
    location: 'Remote',
    stateRequired: 'New York',
    description: 'Handle urgent after-hours teledental queries, prescribe interim analgesics/antibiotics when indicated, and route to local ERs.',
    requirements: ['Board certified', 'Active DEA license', 'Emergency triage capability'],
    tags: ['Urgent Advice', 'Radiology', 'On-Call'],
    matchScore: '91%',
    postedAt: '1 day ago',
    applicantsCount: 0,
  },
  {
    id: 'gig-4',
    title: 'Insurance Diagnostic Claims Auditor',
    company: 'MetLife Health Review Group',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    type: 'Insurance',
    rate: '$85/hr',
    rateNum: 85,
    location: 'Remote',
    description: 'Review pre-authorizations and appeal claims for restorative, endodontic, and crown/bridge dental insurance submissions.',
    requirements: ['DDS or DMD with 5+ years practice', 'CDT coding expertise', 'Available 15-20 hrs/week'],
    tags: ['Orthodontics', 'Claims', 'Contract'],
    matchScore: '88%',
    postedAt: '2 days ago',
    applicantsCount: 0,
  },
  {
    id: 'gig-5',
    title: 'Clear Aligner Treatment Plan Designer',
    company: 'SmileStream Digital Ortho',
    companyLogo: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=100&auto=format&fit=crop&q=80',
    type: 'Freelance',
    rate: '$135/hr',
    rateNum: 135,
    location: 'Remote',
    description: 'Stage digital tooth movements, specify attachment geometries, and create custom clear aligner setups on proprietary 3D CAD software.',
    requirements: ['Orthodontist or experienced clear aligner general practitioner', 'Completed 50+ clear aligner cases'],
    tags: ['Ortho', 'CAD/CAM', 'High Pay'],
    matchScore: '96%',
    postedAt: '3 days ago',
    applicantsCount: 0,
  },
];

const applicationsStore: GigApplication[] = [
  {
    id: 'app-1',
    gigId: 'gig-1',
    dentistId: 'demo_dentist_123',
    dentistName: 'Dr. Sarah Jenkins, DDS',
    dentistDegree: 'DDS',
    specialty: 'General Dentistry',
    licenseNumber: 'DDS-948271',
    licenseState: 'California',
    coverNote: 'Extensive background in teledentistry consults and Invisalign certified workflows.',
    status: 'Submitted',
    appliedAt: '2026-08-30T10:20:00Z',
  },
];

const consultationsStore: ConsultationCase[] = [
  {
    id: 'case-101',
    patientName: 'Emma Richardson',
    patientAge: 29,
    patientGender: 'Female',
    chiefComplaint: 'Severe sensitivity in lower right quadrant (#30) and crowding in anterior mandibular teeth',
    symptoms: ['Cold sensitivity lasting > 30s', 'Pain upon mastication', 'Mild gingival inflammation'],
    urgency: 'Urgent',
    caseType: 'Telediagnostic Second Opinion',
    scanImageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80',
    status: 'In Progress',
    dentistId: 'demo_dentist_123',
    dentistName: 'Dr. Sarah Jenkins, DDS',
    clientId: 'demo_client_123',
    clientName: 'Pacific Dental Partners',
    fee: 95.0,
    createdAt: '2026-08-31T09:15:00Z',
    clinicalDiagnosis: {
      soapSubjective: 'Patient reports lingering pain to cold stimulus and difficulty chewing on lower right quadrant.',
      soapObjective: 'Bitewing radiograph shows deep radiolucency approaching pulp chamber on disto-occlusal #30. No periapical radiolucency noted.',
      soapAssessment: 'Irreversible pulpitis on tooth #30; mild anterior mandibular crowding.',
      soapPlan: 'Recommend in-person endodontic evaluation for RCT #30. Prescribed Chlorhexidine rinse and NSAID for pain management.',
      cdtCodes: ['D0140 (Limited Oral Eval)', 'D0220 (Periapical 1st film)', 'D3330 (Endodontic Therapy - Molar - Recommended)'],
      riskLevel: 'Moderate',
      notes: 'Advised patient to schedule root canal therapy before restorative buildup.',
      completedAt: '2026-08-31T11:00:00Z',
    },
  },
  {
    id: 'case-102',
    patientName: 'David Chen',
    patientAge: 34,
    patientGender: 'Male',
    chiefComplaint: 'Clear aligner stage 14 tracking issue on maxillary lateral incisor (#7)',
    symptoms: ['Aligner not seating flush', 'Air gap under edge of tooth #7', 'No spontaneous pain'],
    urgency: 'Routine',
    caseType: 'Clear Aligner Staging',
    scanImageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80',
    status: 'Pending Review',
    clientId: 'demo_client_123',
    clientName: 'Pacific Dental Partners',
    fee: 80.0,
    createdAt: '2026-08-31T12:00:00Z',
  },
  {
    id: 'case-103',
    patientName: 'Marcus Vance',
    patientAge: 45,
    patientGender: 'Male',
    chiefComplaint: 'Throbbing night pain and swelling near upper left premolar (#12)',
    symptoms: ['Facial fullness', 'Spontaneous nocturnal throbbing', 'Percussion sensitivity'],
    urgency: 'Emergency',
    caseType: 'Emergency Triage',
    scanImageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    status: 'Pending Review',
    clientId: 'client-3',
    clientName: 'Apex Urgent Teledental',
    fee: 125.0,
    createdAt: '2026-08-31T12:45:00Z',
  },
];

const transactionsStore: WalletTransaction[] = [
  {
    id: 'tx-101',
    userId: 'demo_dentist_123',
    type: 'consultation_payout',
    amount: 850.0,
    date: 'Aug 28, 2026',
    description: 'Teledentistry Consult Settlement - Delta Dental Advisors',
    status: 'Completed',
    channel: 'stripe',
    referenceId: 'STRIPE_TX_94819',
  },
  {
    id: 'tx-102',
    userId: 'demo_dentist_123',
    type: 'consultation_payout',
    amount: 400.0,
    date: 'Aug 24, 2026',
    description: 'Orthodontic Treatment Plan Review Batch #14',
    status: 'Completed',
    channel: 'stripe',
    referenceId: 'STRIPE_TX_83719',
  },
  {
    id: 'tx-103',
    userId: 'demo_dentist_123',
    type: 'escrow_hold',
    amount: 450.0,
    date: 'Aug 30, 2026',
    description: 'Pending Escrow for 3 Assigned Teledentistry Cases',
    status: 'Pending',
    channel: 'stripe',
  },
];

const dentistsDirectory: DentistProfileItem[] = [
  {
    id: 'dentist-1',
    name: 'Dr. Sarah Jenkins, DDS',
    title: 'Teledentistry & Orthodontic Specialist',
    specialty: 'General Dentistry & Clear Aligners',
    degree: 'DDS, UCSF School of Dentistry',
    institution: 'University of California, San Francisco',
    experience: '8 years clinical experience',
    location: 'San Francisco, CA',
    licenseState: 'California (Active)',
    rating: 4.96,
    reviewCount: 48,
    hourlyRate: 95,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    subSpecialties: ['Invisalign Certified', 'Dental AI Diagnostics', 'Emergency Triage'],
    availableFor: 'Teledentistry, Treatment Planning, Night Consults',
    verified: true,
  },
  {
    id: 'dentist-2',
    name: 'Dr. Marcus Reynolds, DMD',
    title: 'Board Certified Orthodontist & 3D CAD Stager',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    degree: 'DMD, Harvard School of Dental Medicine',
    institution: 'Harvard University',
    experience: '12 years experience',
    location: 'Boston, MA',
    licenseState: 'Massachusetts & New York',
    rating: 4.98,
    reviewCount: 92,
    hourlyRate: 135,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    subSpecialties: ['Class II/III Correction', 'iTero Scan Reviews', 'Surgical Ortho'],
    availableFor: 'Aligner Staging, Remote Orthodontic Supervision',
    verified: true,
  },
  {
    id: 'dentist-3',
    name: 'Dr. Amara Patel, BDS, MS',
    title: 'Dental Radiologist & AI Clinical Validator',
    specialty: 'Oral & Maxillofacial Radiology',
    degree: 'MS in Oral Radiology, NYU College of Dentistry',
    institution: 'New York University',
    experience: '10 years experience',
    location: 'New York, NY',
    licenseState: 'New York & Texas',
    rating: 4.92,
    reviewCount: 34,
    hourlyRate: 120,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813501-c88f98a2e584?w=150&auto=format&fit=crop&q=80',
    subSpecialties: ['CBCT 3D Interpretation', 'Pathology Triage', 'AI Claim Auditing'],
    availableFor: 'Radiology Reads, AI Annotation, Insurance Reviews',
    verified: true,
  },
];

// Tracks verified roles for Firebase Auth users synced from the client
const userRolesStore = new Map<string, 'dentist' | 'client' | 'admin'>();

// ==========================================
// Security & Token Helpers
// ==========================================

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function signDemoToken(payload: AuthUser): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `demo.${encoded}.${sig}`;
}

function verifyDemoToken(token: string): AuthUser | null {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'demo') return null;
  const [, encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!parsed.uid || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      uid: parsed.uid,
      role: parsed.role,
      email: parsed.email,
      name: parsed.name,
      isDemo: true,
    };
  } catch {
    return null;
  }
}

let cachedFirebaseCerts: Record<string, string> = {};
let firebaseCertsExpiry = 0;

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  if (Date.now() < firebaseCertsExpiry && Object.keys(cachedFirebaseCerts).length > 0) {
    return cachedFirebaseCerts;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error('Failed to fetch Firebase public certificates');
  }
  const certs = (await resp.json()) as Record<string, string>;
  const cacheControl = resp.headers.get('cache-control') || '';
  const match = cacheControl.match(/max-age=(\d+)/);
  const maxAgeMs = match ? Number(match[1]) * 1000 : 3600 * 1000;
  cachedFirebaseCerts = certs;
  firebaseCertsExpiry = Date.now() + maxAgeMs;
  return certs;
}

async function verifyFirebaseIdToken(token: string): Promise<AuthUser | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (header.alg !== 'RS256' || !header.kid) return null;

    const certs = await getFirebasePublicCerts();
    const cert = certs[header.kid];
    if (!cert) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    const isValidSig = verifier.verify(cert, parts[2], 'base64url');
    if (!isValidSig) return null;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.sub || typeof payload.sub !== 'string') return null;
    if (!payload.exp || payload.exp <= now) return null;
    if (!payload.iat || payload.iat > now + 300) return null;

    let appletConfigProjectId: string | undefined;
    try {
      const cfgRaw = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
      appletConfigProjectId = JSON.parse(cfgRaw)?.projectId;
    } catch {
      appletConfigProjectId = undefined;
    }

    const configuredProjectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.VITE_FIREBASE_PROJECT_ID ||
      appletConfigProjectId;
    if (configuredProjectId) {
      if (payload.aud !== configuredProjectId) return null;
      if (payload.iss !== `https://securetoken.google.com/${configuredProjectId}`) return null;
    }

    const email = typeof payload.email === 'string' ? payload.email : '';
    const storedRole = userRolesStore.get(payload.sub) || 'dentist';
    return {
      uid: payload.sub,
      role: storedRole,
      email,
      name: typeof payload.name === 'string' ? payload.name : email.split('@')[0] || 'Practitioner',
      isDemo: false,
    };
  } catch {
    return null;
  }
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.slice('Bearer '.length).trim();

  if (token.startsWith('demo.')) {
    const demoUser = verifyDemoToken(token);
    if (!demoUser) {
      return res.status(401).json({ error: 'Invalid or expired demo session token' });
    }
    req.auth = demoUser;
    return next();
  }

  const firebaseUser = await verifyFirebaseIdToken(token);
  if (!firebaseUser) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
  req.auth = firebaseUser;
  return next();
}

function requireRole(roles: Array<'dentist' | 'client' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }
    return next();
  };
}

// ==========================================
// Wallet Computation Helper
// ==========================================

function computeWalletSummary(userId: string) {
  const userTx = transactionsStore.filter((t) => t.userId === userId);

  const credits = userTx
    .filter(
      (t) =>
        t.status === 'Completed' &&
        (t.type === 'deposit' || t.type === 'consultation_payout' || t.type === 'escrow_release')
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const debits = userTx
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingEscrow = userTx
    .filter((t) => t.status === 'Pending' && t.type === 'escrow_hold')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    userId,
    balance: Math.max(Number((credits - debits).toFixed(2)), 0),
    pending: Number(pendingEscrow.toFixed(2)),
    transactions: userTx,
  };
}

// ==========================================
// Gemini AI Client Helper (Server-Side Only)
// ==========================================

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// Express Server Setup
// ==========================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.use(
    cors({
      origin: process.env.APP_URL || '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://apis.google.com',
            'https://www.gstatic.com',
            'https://*.firebaseapp.com',
            'https://*.googleapis.com',
            'https://*.google.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: [
            "'self'",
            'https://*.firebaseapp.com',
            'https://*.googleapis.com',
            'https://*.google.com',
            'https://*.firebaseio.com',
            'wss://*.firebaseio.com',
          ],
          frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com'],
          frameAncestors: ['*'],
          workerSrc: ["'self'", 'blob:'],
        },
      },
      frameguard: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', apiLimiter);

  // ==========================================
  // Health & Auth Session Endpoints
  // ==========================================

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'DentSide Remote Backend API',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      activeGigsCount: gigsStore.length,
      activeConsultationsCount: consultationsStore.length,
    });
  });

  const DemoSessionSchema = z.object({
    role: z.enum(['dentist', 'client']),
  });

  app.post('/api/auth/demo', (req, res) => {
    const parsed = DemoSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid demo role' });
    }
    const { role } = parsed.data;
    const demoUser: AuthUser =
      role === 'dentist'
        ? {
            uid: 'demo_dentist_123',
            role: 'dentist',
            email: 'dr.jenkins@dentside.com',
            name: 'Dr. Sarah Jenkins, DDS',
            isDemo: true,
          }
        : {
            uid: 'demo_client_123',
            role: 'client',
            email: 'clinic@pacificdental.com',
            name: 'Pacific Dental Clinic',
            isDemo: true,
          };

    const token = signDemoToken(demoUser);
    res.json({ token, user: demoUser });
  });

  const SyncRoleSchema = z.object({
    role: z.enum(['dentist', 'client']),
  });

  app.post('/api/auth/sync-role', requireAuth, (req: AuthenticatedRequest, res) => {
    const parsed = SyncRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid role selection' });
    }
    if (req.auth && !req.auth.isDemo) {
      userRolesStore.set(req.auth.uid, parsed.data.role);
    }
    res.json({ uid: req.auth?.uid, role: parsed.data.role });
  });

  // ==========================================
  // Gigs Marketplace Endpoints
  // ==========================================

  app.get('/api/gigs', (req, res) => {
    try {
      const { q, type, minRate, state } = req.query;
      let results = [...gigsStore];

      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        results = results.filter(
          (g) =>
            g.title.toLowerCase().includes(query) ||
            g.company.toLowerCase().includes(query) ||
            g.description.toLowerCase().includes(query) ||
            g.tags.some((t) => t.toLowerCase().includes(query))
        );
      }

      if (type && typeof type === 'string' && type !== 'All') {
        results = results.filter((g) => g.type.toLowerCase() === type.toLowerCase());
      }

      if (minRate && typeof minRate === 'string') {
        const rateThreshold = Number(minRate);
        if (!isNaN(rateThreshold)) {
          results = results.filter((g) => g.rateNum >= rateThreshold);
        }
      }

      if (state && typeof state === 'string' && state !== 'All') {
        results = results.filter(
          (g) => !g.stateRequired || g.stateRequired.toLowerCase() === state.toLowerCase()
        );
      }

      res.json(results);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      res.status(500).json({ error: 'Failed to fetch gigs' });
    }
  });

  app.get('/api/gigs/applied/:dentistId', requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.auth!.uid !== req.params.dentistId && req.auth!.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot view another user applications' });
    }
    const userApps = applicationsStore.filter((a) => a.dentistId === req.params.dentistId);
    res.json(userApps);
  });

  app.get('/api/gigs/:id', (req, res) => {
    const gig = gigsStore.find((g) => g.id === req.params.id);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    res.json(gig);
  });

  app.get(
    '/api/gigs/:id/applications',
    requireAuth,
    requireRole(['client', 'admin']),
    (req: AuthenticatedRequest, res) => {
      const gig = gigsStore.find((g) => g.id === req.params.id);
      if (!gig) {
        return res.status(404).json({ error: 'Gig not found' });
      }
      if (gig.clientId && gig.clientId !== req.auth!.uid && req.auth!.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const apps = applicationsStore.filter((a) => a.gigId === req.params.id);
      res.json(apps);
    }
  );

  const CreateGigSchema = z.object({
    title: z.string().min(3).max(120),
    company: z.string().min(2).max(100),
    type: z.enum(['Teledentistry', 'Freelance', 'Insurance', 'AI Review', 'Full-Time']),
    rate: z.string().min(2).max(50),
    rateNum: z.number().min(10).max(1000),
    location: z.string().min(2).max(100),
    stateRequired: z.string().max(64).optional(),
    description: z.string().min(10).max(2000),
    requirements: z.array(z.string().max(300)).min(1).max(20),
    tags: z.array(z.string().max(50)).min(1).max(10),
  });

  app.post(
    '/api/gigs',
    requireAuth,
    requireRole(['client', 'admin']),
    (req: AuthenticatedRequest, res) => {
      const parsed = CreateGigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid gig payload', details: parsed.error.issues });
      }

      const newGig: GigItem = {
        id: `gig-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        ...parsed.data,
        clientId: req.auth!.uid,
        postedAt: 'Just now',
        applicantsCount: 0,
        matchScore: '95%',
      };

      gigsStore.unshift(newGig);
      res.status(201).json(newGig);
    }
  );

  const ApplyGigSchema = z.object({
    dentistName: z.string().min(1).max(120),
    dentistDegree: z.string().max(120).optional(),
    specialty: z.string().max(120).optional(),
    licenseNumber: z.string().max(64).optional(),
    licenseState: z.string().max(64).optional(),
    coverNote: z.string().max(1000).optional(),
  });

  app.post(
    '/api/gigs/:id/apply',
    requireAuth,
    requireRole(['dentist', 'admin']),
    (req: AuthenticatedRequest, res) => {
      const gig = gigsStore.find((g) => g.id === req.params.id);
      if (!gig) {
        return res.status(404).json({ error: 'Gig not found' });
      }

      const parsed = ApplyGigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid application payload', details: parsed.error.issues });
      }

      const dentistId = req.auth!.uid;
      const alreadyApplied = applicationsStore.find(
        (a) => a.gigId === req.params.id && a.dentistId === dentistId
      );
      if (alreadyApplied) {
        return res.status(409).json({ error: 'You have already applied for this gig.' });
      }

      const newApp: GigApplication = {
        id: `app-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        gigId: req.params.id,
        dentistId,
        ...parsed.data,
        status: 'Submitted',
        appliedAt: new Date().toISOString(),
      };

      applicationsStore.push(newApp);
      gig.applicantsCount += 1;

      res.status(201).json({ message: 'Application submitted successfully', application: newApp });
    }
  );

  // ==========================================
  // Teledentistry Consultations Hub Endpoints
  // ==========================================

  app.get('/api/consultations', requireAuth, (req: AuthenticatedRequest, res) => {
    const { status, urgency } = req.query;
    const authUser = req.auth!;
    let cases = [...consultationsStore];

    if (authUser.role === 'client') {
      cases = cases.filter((c) => c.clientId === authUser.uid);
    } else if (authUser.role === 'dentist') {
      cases = cases.filter((c) => !c.dentistId || c.dentistId === authUser.uid);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      cases = cases.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }
    if (urgency && typeof urgency === 'string' && urgency !== 'All') {
      cases = cases.filter((c) => c.urgency.toLowerCase() === urgency.toLowerCase());
    }

    res.json(cases);
  });

  app.get('/api/consultations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const item = consultationsStore.find((c) => c.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Consultation case not found' });
    }
    const authUser = req.auth!;
    if (authUser.role === 'client' && item.clientId !== authUser.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (authUser.role === 'dentist' && item.dentistId && item.dentistId !== authUser.uid) {
      return res.status(403).json({ error: 'Case assigned to another practitioner' });
    }
    res.json(item);
  });

  const CreateConsultationSchema = z.object({
    patientName: z.string().min(2).max(120),
    patientAge: z.number().min(1).max(120),
    patientGender: z.string().min(1).max(32),
    chiefComplaint: z.string().min(5).max(1000),
    symptoms: z.array(z.string().max(120)).min(1).max(20),
    urgency: z.enum(['Routine', 'Urgent', 'Emergency']),
    caseType: z.enum([
      'Orthodontic Review',
      'Clear Aligner Staging',
      'Telediagnostic Second Opinion',
      'Radiology Review',
      'Emergency Triage',
    ]),
    scanImageUrl: z.string().max(2048).optional(),
    clientName: z.string().min(2).max(120),
    fee: z.number().min(20).max(500),
    dentistId: z.string().max(128).optional(),
    dentistName: z.string().max(120).optional(),
  });

  app.post(
    '/api/consultations',
    requireAuth,
    requireRole(['client', 'admin']),
    (req: AuthenticatedRequest, res) => {
      const parsed = CreateConsultationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid consultation payload', details: parsed.error.issues });
      }

      const newCase: ConsultationCase = {
        id: `case-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        ...parsed.data,
        clientId: req.auth!.uid,
        status: parsed.data.dentistId ? 'In Progress' : 'Pending Review',
        createdAt: new Date().toISOString(),
      };

      consultationsStore.unshift(newCase);
      res.status(201).json(newCase);
    }
  );

  const SubmitDiagnosisSchema = z.object({
    dentistName: z.string().min(1).max(120),
    soapSubjective: z.string().min(5).max(2000),
    soapObjective: z.string().min(5).max(2000),
    soapAssessment: z.string().min(5).max(2000),
    soapPlan: z.string().min(5).max(2000),
    cdtCodes: z.array(z.string().max(100)).max(20).optional(),
    riskLevel: z.enum(['Low', 'Moderate', 'High']),
    notes: z.string().max(2000).optional(),
  });

  app.post(
    '/api/consultations/:id/diagnose',
    requireAuth,
    requireRole(['dentist', 'admin']),
    (req: AuthenticatedRequest, res) => {
      const caseItem = consultationsStore.find((c) => c.id === req.params.id);
      if (!caseItem) {
        return res.status(404).json({ error: 'Case not found' });
      }
      if (caseItem.status === 'Completed') {
        return res.status(409).json({ error: 'Consultation has already been completed' });
      }
      if (
        caseItem.dentistId &&
        caseItem.dentistId !== req.auth!.uid &&
        req.auth!.role !== 'admin'
      ) {
        return res.status(403).json({ error: 'Case is assigned to another dentist' });
      }

      const parsed = SubmitDiagnosisSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid diagnosis payload', details: parsed.error.issues });
      }

      const dentistId = req.auth!.uid;
      caseItem.dentistId = dentistId;
      caseItem.dentistName = parsed.data.dentistName;
      caseItem.status = 'Completed';
      caseItem.clinicalDiagnosis = {
        soapSubjective: parsed.data.soapSubjective,
        soapObjective: parsed.data.soapObjective,
        soapAssessment: parsed.data.soapAssessment,
        soapPlan: parsed.data.soapPlan,
        cdtCodes: parsed.data.cdtCodes || [],
        riskLevel: parsed.data.riskLevel,
        notes: parsed.data.notes || '',
        completedAt: new Date().toISOString(),
      };

      transactionsStore.unshift({
        id: `tx-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        userId: dentistId,
        type: 'consultation_payout',
        amount: caseItem.fee,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        description: `Consultation Fee Payout: Case #${caseItem.id} (${caseItem.patientName})`,
        status: 'Completed',
        channel: 'stripe',
        referenceId: `CONSULT_FEE_${caseItem.id}`,
      });

      res.json({
        message: 'Clinical diagnosis submitted and consultation marked completed!',
        case: caseItem,
      });
    }
  );

  // ==========================================
  // Wallet, Escrow & Financial Ledger Endpoints
  // ==========================================

  app.get('/api/wallet/:userId', requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.auth!.uid !== req.params.userId && req.auth!.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(computeWalletSummary(req.params.userId));
  });

  const WithdrawSchema = z.object({
    amount: z.number().min(1).max(100000),
    channel: z.enum(['stripe', 'mpesa', 'bank_transfer']),
    destinationAccount: z.string().max(120).optional(),
  });

  app.post('/api/wallet/withdraw', requireAuth, (req: AuthenticatedRequest, res) => {
    const parsed = WithdrawSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid withdrawal payload', details: parsed.error.issues });
    }

    const userId = req.auth!.uid;
    const current = computeWalletSummary(userId);
    if (parsed.data.amount > current.balance) {
      return res.status(400).json({ error: 'Insufficient available balance for withdrawal.' });
    }

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
      userId,
      type: 'withdrawal',
      amount: parsed.data.amount,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      description: `Payout Withdrawal via ${parsed.data.channel.toUpperCase()} (${parsed.data.destinationAccount || 'Primary Account'})`,
      status: 'Completed',
      channel: parsed.data.channel,
      referenceId: `WD_${Date.now()}`,
    };

    transactionsStore.unshift(newTx);
    const updated = computeWalletSummary(userId);
    res.json({
      message: 'Withdrawal processed successfully',
      transaction: newTx,
      ...updated,
    });
  });

  const DepositSchema = z.object({
    amount: z.number().min(10).max(100000),
    description: z.string().max(240).optional(),
  });

  app.post('/api/wallet/deposit', requireAuth, (req: AuthenticatedRequest, res) => {
    const parsed = DepositSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid deposit payload', details: parsed.error.issues });
    }

    const userId = req.auth!.uid;
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
      userId,
      type: 'deposit',
      amount: parsed.data.amount,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      description:
        parsed.data.description || 'Client Escrow Deposit for Teledentistry Sessions',
      status: 'Completed',
      channel: 'stripe',
      referenceId: `DEP_${Date.now()}`,
    };

    transactionsStore.unshift(newTx);
    const updated = computeWalletSummary(userId);
    res.json({
      message: 'Funds deposited successfully',
      transaction: newTx,
      ...updated,
    });
  });

  // ==========================================
  // Dentist Talent Directory Endpoints
  // ==========================================

  app.get('/api/dentists', (req, res) => {
    try {
      const { q, specialty, state } = req.query;
      let results = [...dentistsDirectory];

      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        results = results.filter(
          (d) =>
            d.name.toLowerCase().includes(query) ||
            d.specialty.toLowerCase().includes(query) ||
            d.institution.toLowerCase().includes(query) ||
            d.subSpecialties.some((s) => s.toLowerCase().includes(query))
        );
      }

      if (specialty && typeof specialty === 'string' && specialty !== 'All') {
        results = results.filter((d) =>
          d.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
      }

      if (state && typeof state === 'string' && state !== 'All') {
        results = results.filter((d) =>
          d.licenseState.toLowerCase().includes(state.toLowerCase())
        );
      }

      res.json(results);
    } catch (error) {
      console.error('Error fetching dentists:', error);
      res.status(500).json({ error: 'Failed to fetch dentists' });
    }
  });

  // ==========================================
  // AI-Powered Endpoints (Server-Side Gemini 4 Hydrogen)
  // ==========================================

  const MatchRequestSchema = z.object({
    profile: z.object({
      displayName: z.string().max(120).optional(),
      degree: z.string().max(120).optional(),
      institution: z.string().max(150).optional(),
      experience: z.string().max(64).optional(),
      specialty: z.string().max(120).optional(),
      subSpecialties: z.array(z.string().max(100)).max(20).optional(),
      licenseState: z.string().max(64).optional(),
      licenseNumber: z.string().max(64).optional(),
      licenses: z.array(z.string().max(64)).max(20).optional(),
      availability: z.string().max(100).optional(),
      interests: z.array(z.string().max(100)).max(20).optional(),
      bio: z.string().max(2000).optional(),
    }),
  });

  app.post('/api/ai/match', requireAuth, async (req, res) => {
    const parsedData = MatchRequestSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res
        .status(400)
        .json({ error: 'Invalid payload structure', details: parsedData.error.issues });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to enable AI matchmaking.',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Dentist profile: ${JSON.stringify(parsedData.data.profile)}\nAvailable database gigs: ${JSON.stringify(
          gigsStore.map((g) => ({
            id: g.id,
            title: g.title,
            company: g.company,
            type: g.type,
            rate: g.rate,
            tags: g.tags,
            requirements: g.requirements,
          }))
        )}`,
        config: {
          systemInstruction:
            'You are an AI Clinical Matchmaker for DentSide Remote. Analyze the practitioner credentials, dental degree, specialty, state licensure, and sub-specialties against the available gigs and return the top 3 matching opportunities with match percentages (0-100) and a concise 1-sentence rationale.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                gigId: { type: Type.STRING, description: 'The exact id of the matched gig.' },
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                type: { type: Type.STRING },
                rate: { type: Type.STRING },
                matchScore: { type: Type.INTEGER, description: 'Compatibility score 0-100.' },
                match: { type: Type.STRING, description: 'Formatted score e.g. 96%' },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                rationale: { type: Type.STRING },
              },
              required: [
                'gigId',
                'title',
                'company',
                'type',
                'rate',
                'matchScore',
                'match',
                'tags',
                'rationale',
              ],
            },
          },
        },
      });

      const raw = (response.text ?? '[]').trim();
      const matches = JSON.parse(raw);
      res.json({ matches });
    } catch (error: any) {
      console.error('AI Match Error:', error);
      res.status(502).json({
        error: error?.message || 'Failed to generate AI gig matches from Gemini.',
      });
    }
  });

  app.post('/api/match', (req, res, next) => {
    req.url = '/api/ai/match';
    (app as any).handle(req, res, next);
  });

  const ClinicalAssistSchema = z.object({
    chiefComplaint: z.string().min(5).max(1000),
    symptoms: z.array(z.string().max(120)).max(20),
    patientAge: z.number().min(1).max(120).optional(),
    caseType: z.string().min(2).max(120),
    clinicalNotes: z.string().max(2000).optional(),
  });

  app.post('/api/ai/clinical-assist', requireAuth, async (req, res) => {
    const parsed = ClinicalAssistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid case payload', details: parsed.error.issues });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to enable AI Clinical Decision Support.',
      });
    }

    const { chiefComplaint, symptoms, patientAge, caseType, clinicalNotes } = parsed.data;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Case Details:\nType: ${caseType}\nPatient Age: ${patientAge || 35}\nChief Complaint: ${chiefComplaint}\nReported Symptoms: ${symptoms.join(', ')}\nClinical Notes: ${clinicalNotes || 'None'}`,
        config: {
          systemInstruction:
            'You are an expert Board-Certified Teledentistry AI Consultant assisting licensed dentists. Analyze the case details and produce structured differential diagnoses, SOAP note drafts, CDT billing code suggestions, urgency recommendation, and clinical red flags.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              differentialDiagnosis: { type: Type.ARRAY, items: { type: Type.STRING } },
              soapSuggestion: {
                type: Type.OBJECT,
                properties: {
                  subjective: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  assessment: { type: Type.STRING },
                  plan: { type: Type.STRING },
                },
                required: ['subjective', 'objective', 'assessment', 'plan'],
              },
              recommendedCdtCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
              urgencyRecommendation: { type: Type.STRING },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'differentialDiagnosis',
              'soapSuggestion',
              'recommendedCdtCodes',
              'urgencyRecommendation',
              'redFlags',
            ],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      res.json(JSON.parse(raw));
    } catch (error: any) {
      console.error('Clinical Assist Error:', error);
      res.status(502).json({
        error: error?.message || 'Failed to generate AI clinical assistance from Gemini.',
      });
    }
  });

  const GenerateGigSchema = z.object({
    roleType: z.string().min(2).max(80),
    practiceName: z.string().min(2).max(120),
    scope: z.string().min(5).max(1000),
    targetRate: z.number().min(10).max(1000).optional(),
  });

  app.post(
    '/api/ai/generate-gig',
    requireAuth,
    requireRole(['client', 'admin']),
    async (req, res) => {
      const parsed = GenerateGigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: 'Invalid prompt payload', details: parsed.error.issues });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to enable AI gig drafting.',
        });
      }

      const { roleType, practiceName, scope, targetRate } = parsed.data;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Role Type: ${roleType}\nClinic Name: ${practiceName}\nScope: ${scope}\nHourly Target: ${targetRate || 110}`,
          config: {
            systemInstruction:
              'You are an expert dental clinical recruiter. Generate a structured remote dental gig listing matching the requested role type, practice name, scope, and target hourly rate.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                type: { type: Type.STRING },
                rate: { type: Type.STRING },
                rateNum: { type: Type.NUMBER },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                'title',
                'company',
                'type',
                'rate',
                'rateNum',
                'location',
                'description',
                'requirements',
                'tags',
              ],
            },
          },
        });

        const raw = (response.text ?? '{}').trim();
        res.json(JSON.parse(raw));
      } catch (error: any) {
        console.error('Generate Gig Error:', error);
        res.status(502).json({
          error: error?.message || 'Failed to generate gig listing from Gemini.',
        });
      }
    }
  );

  // Global Express Error Handler for API routes
  app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled API Error:', err);
    res.status(err?.status || 500).json({ error: err?.message || 'Internal server error' });
  });

  // ==========================================
  // Vite Middleware & Static Production Serving
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DentSide Backend] Full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
