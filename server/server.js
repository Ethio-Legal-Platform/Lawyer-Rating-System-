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
import lawyerRoutes      from './routes/lawyerRoutes.js';
import qaRoutes          from './routes/qaRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

// ── App setup ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Security: prevent common header-based attacks
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── Root health check ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    system: 'LEX-RATING API Server',
    endpoints: {
      auth:         '/api/auth         → POST /register, /register-verify, /login',
      moj:          '/api/moj          → POST /verify-license  |  GET /licenses',
      court:        '/api/court        → GET /cases, GET /lawyer-rating/:id  |  POST /cases',
      lawyers:      '/api/lawyers      → GET /search?specialization=...',
      qa:           '/api/qa           → GET /questions, POST /questions, POST /questions/:id/answers',
      integrations: '/api/integrations → POST /court/cases, POST /moj/licenses, GET /health'
    }
  });
});

// ── Mount routes ───────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/moj',          mojRoutes);
app.use('/api/court',        courtRoutes);
app.use('/api/lawyers',      lawyerRoutes);
app.use('/api/qa',           qaRoutes);
app.use('/api/integrations', integrationRoutes);

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n⚖  LEX-RATING Server running on http://localhost:${PORT}`);
    console.log(`   Auth API:        /api/auth`);
    console.log(`   MoJ API:         /api/moj`);
    console.log(`   Court API:       /api/court`);
    console.log(`   Lawyer API:      /api/lawyers`);
    console.log(`   Q&A API:         /api/qa`);
    console.log(`   Integration API: /api/integrations\n`);
  });
})();
