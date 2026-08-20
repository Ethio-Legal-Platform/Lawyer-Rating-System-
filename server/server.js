import express from 'express';
import cors    from 'cors';
import path    from 'path';
import dotenv  from 'dotenv';
import { fileURLToPath } from 'url';
import { connectDB } from './lib/mongoose.js';

// ── Environment ────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ── Route modules ──────────────────────────────────────────────────────────
import authRoutes   from './routes/authRoutes.js';
import mojRoutes    from './routes/mojRoutes.js';
import courtRoutes  from './routes/courtRoutes.js';
import lawyerRoutes from './routes/lawyerRoutes.js';
import qaRoutes     from './routes/qaRoutes.js';

// ── App setup ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Root health check ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    system: 'LEX-RATING API Server',
    endpoints: {
      auth:    '/api/auth    → POST /register, /register-verify, /login',
      moj:     '/api/moj     → POST /verify-license  |  GET /licenses',
      court:   '/api/court   → GET /cases, GET /lawyer-rating/:id  |  POST /cases',
      lawyers: '/api/lawyers → GET /search?specialization=...',
      qa:      '/api/qa      → GET /questions, POST /questions, POST /questions/:id/answers'
    }
  });
});

// ── Mount routes ───────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/moj',     mojRoutes);
app.use('/api/court',   courtRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/qa',      qaRoutes);

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`\n⚖  LEX-RATING Server running on http://localhost:${PORT}`);
  console.log(`   Auth API:   /api/auth`);
  console.log(`   MoJ API:    /api/moj`);
  console.log(`   Court API:  /api/court`);
  console.log(`   Lawyer API: /api/lawyers`);
  console.log(`   Q&A API:    /api/qa\n`);
});
