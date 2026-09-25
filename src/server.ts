import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { handleContact } from './server/contact';

// ponytail: parser mínimo de .env, sem interpolação. Trocar por dotenv se o arquivo crescer.
function loadDotEnv() {
  const file = join(process.cwd(), '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

loadDotEnv();

// ponytail: o Angular derruba a resposta inteira para client-side rendering ao
// receber QUALQUER x-forwarded-* que não confia, e o default só cobre host e proto.
// Um x-forwarded-for da Vercel, ou o x-forwarded-port padrão do nginx, desligaria o
// SSR do site sem erro: HTTP 200 com casca vazia. Lista os cinco que o Angular
// reconhece mais o x-forwarded-ssl do nginx. A env ainda sobrescreve.
process.env['NG_TRUST_PROXY_HEADERS'] ??=
  'x-forwarded-for,x-forwarded-host,x-forwarded-proto,x-forwarded-port,x-forwarded-prefix,x-forwarded-ssl';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ponytail: só os cabeçalhos que não quebram nada. CSP completa ficou de fora:
// o Angular SSR injeta CSS crítico com onload inline e o mermaid gera estilos inline.
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.post('/api/contact', express.json({ limit: '32kb' }), async (req, res) => {
  try {
    const result = await handleContact(req.body ?? {}, req.headers['x-forwarded-for'], req.ip);
    if (result.retryAfter) res.setHeader('Retry-After', String(result.retryAfter));
    res.status(result.status).json(result.body);
  } catch {
    res.status(500).json({ error: 'Falha ao enviar a mensagem.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the PORT environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
