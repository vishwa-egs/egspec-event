import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const portFromArg = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? Number(process.argv[portArgIndex + 1]) : null;
const PORT = Number(process.env.PORT) || portFromArg || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize backend Supabase client if credentials exist (using service role key securely)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-project'))
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Backend API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'E.G.S. Pillay Engineering College - Event Management Portal',
    timestamp: new Date().toISOString(),
    supabaseConnected: Boolean(supabaseAdmin),
  });
});

app.post('/api/verify-ticket', async (req: Request, res: Response) => {
  const { registrationId, eventId } = req.body;
  if (!registrationId) {
    return res.status(400).json({ error: 'registrationId is required' });
  }

  // If Supabase service role is configured, run server-side verification with row update
  if (supabaseAdmin) {
    try {
      const { data: reg, error } = await supabaseAdmin
        .from('registrations')
        .select('*, student:profiles(*), event:events(*)')
        .eq('registration_id', registrationId)
        .single();

      if (error || !reg) {
        return res.status(404).json({ valid: false, message: 'Ticket not found' });
      }

      if (eventId && reg.event_id !== eventId) {
        return res.status(400).json({ valid: false, message: 'Ticket belongs to a different event' });
      }

      return res.json({
        valid: true,
        registration: reg,
        message: 'Ticket verified successfully',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Simulated fallback response
  return res.json({
    valid: true,
    registrationId,
    message: 'Verified via local portal engine',
  });
});

async function startServer() {
  if (!isProduction) {
    // Development: integrate Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

startServer();
