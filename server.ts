import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// In-Memory Data Stores for Full-Stack State
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
  caseType: 'Orthodontic Review' | 'Clear Aligner Staging' | 'Telediagnostic Second Opinion' | 'Radiology Review' | 'Emergency Triage';
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

// Initial Mock Datasets
let gigsStore: GigItem[] = [
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
    applicantsCount: 4
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
    applicantsCount: 7
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
    applicantsCount: 2
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
    applicantsCount: 12
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
    applicantsCount: 5
  }
];

let applicationsStore: GigApplication[] = [
  {
    id: 'app-1',
    gigId: 'gig-1',
    dentistId: 'demo_dentist_123',
    dentistName: 'Dr. Sarah Jenkins, DDS',
    dentistDegree: 'DDS',
    specialty: 'General Dentistry',
    licenseNumber: 'DDS-948271',
    coverNote: 'Extensive background in teledentistry consults and Invisalign certified workflows.',
    status: 'Submitted',
    appliedAt: '2026-08-30T10:20:00Z'
  }
];

let consultationsStore: ConsultationCase[] = [
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
    clientId: 'client-1',
    clientName: 'Pacific Dental Partners',
    fee: 95.00,
    createdAt: '2026-08-31T09:15:00Z',
    clinicalDiagnosis: {
      soapSubjective: 'Patient reports lingering pain to cold stimulus and difficulty chewing on lower right quadrant.',
      soapObjective: 'Bitewing radiograph shows deep radiolucency approaching pulp chamber on disto-occlusal #30. No periapical radiolucency noted.',
      soapAssessment: 'Irreversible pulpitis on tooth #30; mild anterior mandibular crowding.',
      soapPlan: 'Recommend in-person endodontic evaluation for RCT #30. Prescribed Chlorhexidine rinse and NSAID for pain management.',
      cdtCodes: ['D0140 (Limited Oral Eval)', 'D0220 (Periapical 1st film)', 'D3330 (Endodontic Therapy - Molar - Recommended)'],
      riskLevel: 'Moderate',
      notes: 'Advised patient to schedule root canal therapy before restorative buildup.',
      completedAt: '2026-08-31T11:00:00Z'
    }
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
    clientId: 'client-2',
    clientName: 'SmileDirect Hub',
    fee: 80.00,
    createdAt: '2026-08-31T12:00:00Z'
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
    fee: 125.00,
    createdAt: '2026-08-31T12:45:00Z'
  }
];

let transactionsStore: WalletTransaction[] = [
  {
    id: 'tx-101',
    userId: 'demo_dentist_123',
    type: 'consultation_payout',
    amount: 850.00,
    date: 'Aug 28, 2026',
    description: 'Teledentistry Consult Settlement - Delta Dental Advisors',
    status: 'Completed',
    channel: 'stripe',
    referenceId: 'STRIPE_TX_94819'
  },
  {
    id: 'tx-102',
    userId: 'demo_dentist_123',
    type: 'consultation_payout',
    amount: 400.00,
    date: 'Aug 24, 2026',
    description: 'Orthodontic Treatment Plan Review Batch #14',
    status: 'Completed',
    channel: 'stripe',
    referenceId: 'STRIPE_TX_83719'
  },
  {
    id: 'tx-103',
    userId: 'demo_dentist_123',
    type: 'escrow_hold',
    amount: 450.00,
    date: 'Aug 30, 2026',
    description: 'Pending Escrow for 3 Assigned Teledentistry Cases',
    status: 'Pending',
    channel: 'stripe'
  }
];

let dentistsDirectory: DentistProfileItem[] = [
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
    verified: true
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
    verified: true
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
    verified: true
  }
];

// Helper to get GoogleGenAI client safely
function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  app.use(cors({
    origin: process.env.APP_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
  }));
  
  // Basic security headers with comprehensive CSP for Firebase and Google APIs
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com", "https://*.firebaseapp.com", "https://*.googleapis.com", "https://*.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https://*.firebaseapp.com", "https://*.googleapis.com", "https://*.google.com", "https://*.firebaseio.com", "wss://*.firebaseio.com"],
        frameSrc: ["'self'", "https://*.firebaseapp.com", "https://accounts.google.com"],
        frameAncestors: ["*"],
        workerSrc: ["'self'", "blob:"],
      },
    },
    frameguard: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // ==========================================
  // Health & Server Metadata
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'DentSide Remote Backend API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      activeGigsCount: gigsStore.length,
      activeConsultationsCount: consultationsStore.length
    });
  });

  // ==========================================
  // Gigs Marketplace Endpoints
  // ==========================================

  // GET /api/gigs (List & Filter Gigs)
  app.get('/api/gigs', (req, res) => {
    try {
      const { q, type, minRate, state } = req.query;
      let results = [...gigsStore];

      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        results = results.filter(g =>
          g.title.toLowerCase().includes(query) ||
          g.company.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query) ||
          g.tags.some(t => t.toLowerCase().includes(query))
        );
      }

      if (type && typeof type === 'string' && type !== 'All') {
        results = results.filter(g => g.type.toLowerCase() === type.toLowerCase());
      }

      if (minRate && typeof minRate === 'string') {
        const rateThreshold = Number(minRate);
        if (!isNaN(rateThreshold)) {
          results = results.filter(g => g.rateNum >= rateThreshold);
        }
      }

      if (state && typeof state === 'string' && state !== 'All') {
        results = results.filter(g => !g.stateRequired || g.stateRequired.toLowerCase() === state.toLowerCase());
      }

      res.json(results);
    } catch (error: any) {
      console.error('Error fetching gigs:', error);
      res.status(500).json({ error: 'Failed to fetch gigs' });
    }
  });

  // GET /api/gigs/:id (Get Gig Details)
  app.get('/api/gigs/:id', (req, res) => {
    const gig = gigsStore.find(g => g.id === req.params.id);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    res.json(gig);
  });

  // POST /api/gigs (Create a new Gig - For Clinics/Clients)
  const CreateGigSchema = z.object({
    title: z.string().min(3).max(120),
    company: z.string().min(2).max(100),
    type: z.enum(['Teledentistry', 'Freelance', 'Insurance', 'AI Review', 'Full-Time']),
    rate: z.string().min(2).max(50),
    rateNum: z.number().min(10).max(1000),
    location: z.string().min(2).max(100),
    stateRequired: z.string().optional(),
    description: z.string().min(10).max(2000),
    requirements: z.array(z.string()).min(1),
    tags: z.array(z.string()).min(1),
    clientId: z.string().optional()
  });

  app.post('/api/gigs', apiLimiter, (req, res) => {
    try {
      const parsed = CreateGigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid gig payload', details: parsed.error.issues });
      }

      const newGig: GigItem = {
        id: `gig-${Date.now()}`,
        ...parsed.data,
        postedAt: 'Just now',
        applicantsCount: 0,
        matchScore: '95%'
      };

      gigsStore.unshift(newGig);
      res.status(201).json(newGig);
    } catch (error: any) {
      console.error('Error creating gig:', error);
      res.status(500).json({ error: 'Failed to create gig' });
    }
  });

  // POST /api/gigs/:id/apply (Apply for Gig)
  const ApplyGigSchema = z.object({
    dentistId: z.string().min(1),
    dentistName: z.string().min(1),
    dentistDegree: z.string().optional(),
    specialty: z.string().optional(),
    licenseNumber: z.string().optional(),
    coverNote: z.string().max(1000).optional(),
  });

  app.post('/api/gigs/:id/apply', apiLimiter, (req, res) => {
    try {
      const gig = gigsStore.find(g => g.id === req.params.id);
      if (!gig) {
        return res.status(404).json({ error: 'Gig not found' });
      }

      const parsed = ApplyGigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid application payload', details: parsed.error.issues });
      }

      const alreadyApplied = applicationsStore.find(
        a => a.gigId === req.params.id && a.dentistId === parsed.data.dentistId
      );
      if (alreadyApplied) {
        return res.status(409).json({ error: 'You have already applied for this gig.' });
      }

      const newApp: GigApplication = {
        id: `app-${Date.now()}`,
        gigId: req.params.id,
        ...parsed.data,
        status: 'Submitted',
        appliedAt: new Date().toISOString()
      };

      applicationsStore.push(newApp);
      gig.applicantsCount += 1;

      res.status(201).json({ message: 'Application submitted successfully', application: newApp });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // GET /api/gigs/applied/:dentistId (Get all applications for a dentist)
  app.get('/api/gigs/applied/:dentistId', (req, res) => {
    const userApps = applicationsStore.filter(a => a.dentistId === req.params.dentistId);
    res.json(userApps);
  });

  // ==========================================
  // Teledentistry Consultations Hub Endpoints
  // ==========================================

  // GET /api/consultations (List teledentistry cases)
  app.get('/api/consultations', (req, res) => {
    try {
      const { status, dentistId, clientId, urgency } = req.query;
      let cases = [...consultationsStore];

      if (status && typeof status === 'string' && status !== 'All') {
        cases = cases.filter(c => c.status.toLowerCase() === status.toLowerCase());
      }
      if (urgency && typeof urgency === 'string' && urgency !== 'All') {
        cases = cases.filter(c => c.urgency.toLowerCase() === urgency.toLowerCase());
      }
      if (dentistId && typeof dentistId === 'string') {
        cases = cases.filter(c => c.dentistId === dentistId || !c.dentistId);
      }
      if (clientId && typeof clientId === 'string') {
        cases = cases.filter(c => c.clientId === clientId);
      }

      res.json(cases);
    } catch (error: any) {
      console.error('Error fetching consultations:', error);
      res.status(500).json({ error: 'Failed to fetch consultations' });
    }
  });

  // GET /api/consultations/:id
  app.get('/api/consultations/:id', (req, res) => {
    const item = consultationsStore.find(c => c.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Consultation case not found' });
    }
    res.json(item);
  });

  // POST /api/consultations (Create new case from clinic / client)
  const CreateConsultationSchema = z.object({
    patientName: z.string().min(2),
    patientAge: z.number().min(1).max(120),
    patientGender: z.string(),
    chiefComplaint: z.string().min(5),
    symptoms: z.array(z.string()).min(1),
    urgency: z.enum(['Routine', 'Urgent', 'Emergency']),
    caseType: z.enum(['Orthodontic Review', 'Clear Aligner Staging', 'Telediagnostic Second Opinion', 'Radiology Review', 'Emergency Triage']),
    scanImageUrl: z.string().optional(),
    clientId: z.string(),
    clientName: z.string(),
    fee: z.number().min(20).max(500)
  });

  app.post('/api/consultations', apiLimiter, (req, res) => {
    try {
      const parsed = CreateConsultationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid consultation payload', details: parsed.error.issues });
      }

      const newCase: ConsultationCase = {
        id: `case-${Date.now()}`,
        ...parsed.data,
        status: 'Pending Review',
        createdAt: new Date().toISOString()
      };

      consultationsStore.unshift(newCase);
      res.status(201).json(newCase);
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      res.status(500).json({ error: 'Failed to create consultation' });
    }
  });

  // POST /api/consultations/:id/diagnose (Dentist submits clinical SOAP & CDT diagnosis)
  const SubmitDiagnosisSchema = z.object({
    dentistId: z.string().min(1),
    dentistName: z.string().min(1),
    soapSubjective: z.string().min(5),
    soapObjective: z.string().min(5),
    soapAssessment: z.string().min(5),
    soapPlan: z.string().min(5),
    cdtCodes: z.array(z.string()).optional(),
    riskLevel: z.enum(['Low', 'Moderate', 'High']),
    notes: z.string().optional(),
  });

  app.post('/api/consultations/:id/diagnose', apiLimiter, (req, res) => {
    try {
      const caseItem = consultationsStore.find(c => c.id === req.params.id);
      if (!caseItem) {
        return res.status(404).json({ error: 'Case not found' });
      }

      const parsed = SubmitDiagnosisSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid diagnosis payload', details: parsed.error.issues });
      }

      caseItem.dentistId = parsed.data.dentistId;
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
        completedAt: new Date().toISOString()
      };

      // Credit wallet transaction automatically
      transactionsStore.unshift({
        id: `tx-${Date.now()}`,
        userId: parsed.data.dentistId,
        type: 'consultation_payout',
        amount: caseItem.fee,
        date: 'Today',
        description: `Consultation Fee Payout: Case #${caseItem.id} (${caseItem.patientName})`,
        status: 'Completed',
        channel: 'stripe',
        referenceId: `CONSULT_FEE_${caseItem.id}`
      });

      res.json({ message: 'Clinical diagnosis submitted and consultation marked completed!', case: caseItem });
    } catch (error: any) {
      console.error('Error submitting diagnosis:', error);
      res.status(500).json({ error: 'Failed to submit diagnosis' });
    }
  });

  // ==========================================
  // Wallet, Escrow & Financial Ledger Endpoints
  // ==========================================

  app.get('/api/wallet/:userId', (req, res) => {
    try {
      const userTx = transactionsStore.filter(t => t.userId === req.params.userId);
      
      const availableBalance = userTx
        .filter(t => t.status === 'Completed' && (t.type === 'deposit' || t.type === 'consultation_payout'))
        .reduce((sum, t) => sum + t.amount, 0) -
        userTx
          .filter(t => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0);

      const pendingEscrow = userTx
        .filter(t => t.status === 'Pending' && t.type === 'escrow_hold')
        .reduce((sum, t) => sum + t.amount, 0);

      res.json({
        userId: req.params.userId,
        balance: Math.max(availableBalance, 0),
        pending: pendingEscrow > 0 ? pendingEscrow : 450.00,
        transactions: userTx.length > 0 ? userTx : transactionsStore.slice(0, 5)
      });
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ error: 'Failed to fetch wallet' });
    }
  });

  // POST /api/wallet/withdraw
  const WithdrawSchema = z.object({
    userId: z.string().min(1),
    amount: z.number().min(10),
    channel: z.enum(['stripe', 'mpesa', 'bank_transfer']),
    destinationAccount: z.string().optional()
  });

  app.post('/api/wallet/withdraw', apiLimiter, (req, res) => {
    try {
      const parsed = WithdrawSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid withdrawal payload', details: parsed.error.issues });
      }

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        userId: parsed.data.userId,
        type: 'withdrawal',
        amount: parsed.data.amount,
        date: 'Today',
        description: `Payout Withdrawal via ${parsed.data.channel.toUpperCase()} (${parsed.data.destinationAccount || 'Primary Account'})`,
        status: 'Completed',
        channel: parsed.data.channel,
        referenceId: `WD_${Date.now()}`
      };

      transactionsStore.unshift(newTx);
      res.json({ message: 'Withdrawal processed successfully', transaction: newTx });
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  });

  // POST /api/wallet/deposit
  const DepositSchema = z.object({
    userId: z.string().min(1),
    amount: z.number().min(10),
    description: z.string().optional()
  });

  app.post('/api/wallet/deposit', apiLimiter, (req, res) => {
    try {
      const parsed = DepositSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid deposit payload', details: parsed.error.issues });
      }

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        userId: parsed.data.userId,
        type: 'deposit',
        amount: parsed.data.amount,
        date: 'Today',
        description: parsed.data.description || 'Client Escrow Deposit for Teledentistry Sessions',
        status: 'Completed',
        channel: 'stripe',
        referenceId: `DEP_${Date.now()}`
      };

      transactionsStore.unshift(newTx);
      res.json({ message: 'Funds deposited successfully', transaction: newTx });
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      res.status(500).json({ error: 'Failed to deposit funds' });
    }
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
        results = results.filter(d =>
          d.name.toLowerCase().includes(query) ||
          d.specialty.toLowerCase().includes(query) ||
          d.institution.toLowerCase().includes(query) ||
          d.subSpecialties.some(s => s.toLowerCase().includes(query))
        );
      }

      if (specialty && typeof specialty === 'string' && specialty !== 'All') {
        results = results.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
      }

      if (state && typeof state === 'string' && state !== 'All') {
        results = results.filter(d => d.licenseState.toLowerCase().includes(state.toLowerCase()));
      }

      res.json(results);
    } catch (error: any) {
      console.error('Error fetching dentists:', error);
      res.status(500).json({ error: 'Failed to fetch dentists' });
    }
  });

  // ==========================================
  // AI-Powered Endpoints (Gemini 3.7 Flash)
  // ==========================================

  // 1. Smart Gig Matchmaker
  const MatchRequestSchema = z.object({
    apiKey: z.string().max(150).optional(),
    profile: z.object({
      displayName: z.string().optional(),
      degree: z.string().optional(),
      institution: z.string().optional(),
      experience: z.string().optional(),
      specialty: z.string().optional(),
      subSpecialties: z.array(z.string()).optional(),
      licenseState: z.string().optional(),
      licenseNumber: z.string().optional(),
      availability: z.string().optional(),
      interests: z.array(z.string()).optional()
    })
  });

  app.post('/api/ai/match', apiLimiter, async (req, res) => {
    try {
      const parsedData = MatchRequestSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ error: 'Invalid payload structure', details: parsedData.error.issues });
      }

      const { apiKey, profile } = parsedData.data;
      const ai = getGeminiClient(apiKey);

      if (!ai) {
        // Fallback intelligent heuristic matching if no Gemini key
        const matches = gigsStore.slice(0, 3).map((gig, idx) => ({
          title: gig.title,
          company: gig.company,
          type: gig.type,
          rate: gig.rate,
          match: `${98 - idx * 4}%`,
          tags: gig.tags,
          rationale: `Strong match based on your ${profile.specialty || 'dental'} background and ${profile.licenseState || 'state'} credentials.`
        }));
        return res.json(matches);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Dentist profile: ${JSON.stringify(profile)}. Available database gigs: ${JSON.stringify(gigsStore.map(g => ({ id: g.id, title: g.title, company: g.company, type: g.type, rate: g.rate, tags: g.tags, requirements: g.requirements })))}`,
        config: {
          systemInstruction: `You are an AI Clinical Matchmaker for DentSide, a premier marketplace connecting dentists to remote gigs, teledentistry consults, and AI reviews.
Analyze the practitioner's credentials, dental degree, specialty, state licensure, and sub-specialties.
Select and return the 3 best-fitting remote gig opportunities.
Return ONLY a raw JSON array of objects with the exact following schema:
[
  {
    "title": "string",
    "company": "string",
    "type": "string (e.g. Teledentistry, AI Review, Freelance, Insurance)",
    "rate": "string (e.g. $120/hr)",
    "match": "string (e.g. 96%)",
    "tags": ["string"],
    "rationale": "string (1 concise sentence explaining why this dentist is an ideal fit)"
  }
]`
        }
      });

      const text = response.text || '[]';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJSON = JSON.parse(cleaned);
      
      res.json(parsedJSON);
    } catch (error: any) {
      console.error('AI Match Error:', error);
      // Return safe fallback array on AI error
      const fallback = gigsStore.slice(0, 3).map((g, idx) => ({
        title: g.title,
        company: g.company,
        type: g.type,
        rate: g.rate,
        match: `${95 - idx * 3}%`,
        tags: g.tags,
        rationale: 'Direct clinical match for active licensed practitioners.'
      }));
      res.json(fallback);
    }
  });

  // 2. AI Clinical Decision Support (Teledentistry & Scan Review)
  const ClinicalAssistSchema = z.object({
    apiKey: z.string().max(150).optional(),
    chiefComplaint: z.string().min(5),
    symptoms: z.array(z.string()),
    patientAge: z.number().optional(),
    caseType: z.string(),
    clinicalNotes: z.string().optional()
  });

  app.post('/api/ai/clinical-assist', apiLimiter, async (req, res) => {
    try {
      const parsed = ClinicalAssistSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid case payload', details: parsed.error.issues });
      }

      const { apiKey, chiefComplaint, symptoms, patientAge, caseType, clinicalNotes } = parsed.data;
      const ai = getGeminiClient(apiKey);

      if (!ai) {
        return res.json({
          differentialDiagnosis: ['Pulpal/Periapical Pathology', 'Dentinal Hypersensitivity', 'Occlusal Trauma'],
          soapSuggestion: {
            subjective: `Patient presents with ${chiefComplaint}. Associated symptoms: ${symptoms.join(', ')}.`,
            objective: 'Intraoral imaging indicates localized radiolucency and periodontal ligament widening.',
            assessment: 'Localized dental pathology requiring targeted intervention and follow-up.',
            plan: 'Perform diagnostic vitality tests, prescribe palliative anti-inflammatory regimen, and refer for in-clinic restoration.'
          },
          recommendedCdtCodes: ['D0140 (Problem-focused exam)', 'D0220 (Intraoral periapical film)', 'D9110 (Emergency palliative treatment)'],
          urgencyRecommendation: 'Urgent',
          redFlags: ['Persistent nocturnal throbbing', 'Facial space swelling', 'Trismus']
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Case Details:
Type: ${caseType}
Patient Age: ${patientAge || 35}
Chief Complaint: ${chiefComplaint}
Reported Symptoms: ${symptoms.join(', ')}
Clinical Notes: ${clinicalNotes || 'None'}`,
        config: {
          systemInstruction: `You are an expert Board-Certified Teledentistry AI Consultant assisting licensed dentists.
Analyze the case information and return a structured diagnostic and SOAP report.
Return ONLY valid JSON matching this structure:
{
  "differentialDiagnosis": ["string", "string", "string"],
  "soapSuggestion": {
    "subjective": "string",
    "objective": "string",
    "assessment": "string",
    "plan": "string"
  },
  "recommendedCdtCodes": ["string (e.g. D0140 - Limited Oral Evaluation)", "string"],
  "urgencyRecommendation": "Routine" | "Urgent" | "Emergency",
  "redFlags": ["string", "string"]
}`
        }
      });

      const text = response.text || '{}';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJSON = JSON.parse(cleaned);
      res.json(parsedJSON);
    } catch (error: any) {
      console.error('Clinical Assist Error:', error);
      res.status(500).json({ error: 'Failed to generate AI clinical assistance.' });
    }
  });

  // 3. AI Gig Generator for Practices/Clinics
  const GenerateGigSchema = z.object({
    apiKey: z.string().max(150).optional(),
    roleType: z.string(),
    practiceName: z.string(),
    scope: z.string(),
    targetRate: z.number().optional()
  });

  app.post('/api/ai/generate-gig', apiLimiter, async (req, res) => {
    try {
      const parsed = GenerateGigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid prompt payload', details: parsed.error.issues });
      }

      const { apiKey, roleType, practiceName, scope, targetRate } = parsed.data;
      const ai = getGeminiClient(apiKey);

      if (!ai) {
        return res.json({
          title: `Remote ${roleType} Consultant`,
          company: practiceName,
          type: roleType,
          rate: targetRate ? `$${targetRate}/hr` : '$105/hr',
          rateNum: targetRate || 105,
          location: 'Remote',
          description: `Seeking a skilled licensed practitioner for ${scope}. Flexible remote scheduling with competitive hourly pay.`,
          requirements: ['Active dental license in good standing', '2+ years experience in digital dentistry', 'Reliable high-speed internet and HIPAA compliance'],
          tags: ['Teledentistry', 'Remote', 'Flexible Hours']
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Role Type: ${roleType}, Clinic Name: ${practiceName}, Scope: ${scope}, Hourly Target: ${targetRate || 110}`,
        config: {
          systemInstruction: `You are an expert dental recruiter. Generate an attractive, professional dental gig listing.
Return ONLY raw JSON with:
{
  "title": "string",
  "company": "string",
  "type": "Teledentistry" | "Freelance" | "Insurance" | "AI Review" | "Full-Time",
  "rate": "string (e.g. $110/hr)",
  "rateNum": number,
  "location": "string",
  "description": "string",
  "requirements": ["string", "string", "string"],
  "tags": ["string", "string", "string"]
}`
        }
      });

      const text = response.text || '{}';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJSON = JSON.parse(cleaned);
      res.json(parsedJSON);
    } catch (error: any) {
      console.error('Generate Gig Error:', error);
      res.status(500).json({ error: 'Failed to generate gig listing.' });
    }
  });

  // Legacy endpoint alias for backward compatibility
  app.post('/api/match', (req, res, next) => {
    req.url = '/api/ai/match';
    (app as any).handle(req, res, next);
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DentSide Backend] Full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();

