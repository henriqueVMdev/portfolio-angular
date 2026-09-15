import { profile } from '../app/data/portfolio';
import { readClientIp, retryAfterSeconds } from './rate-limit';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_FROM_LENGTH = 254;

type ContactBody = {
  from?: unknown;
  message?: unknown;
};

function readContactEmail() {
  const configured = process.env['CONTACT_TO_EMAIL']?.trim();
  if (configured) return configured;

  const portfolioEmail = profile.contacts.find((contact) => contact.label === 'Email')?.value;
  return portfolioEmail?.trim() || '';
}

export async function handleContact(
  body: ContactBody,
  forwarded: string | string[] | undefined,
  fallbackIp = 'unknown',
): Promise<{ status: number; body: Record<string, unknown>; retryAfter?: number }> {
  const retryAfter = retryAfterSeconds(readClientIp(forwarded, fallbackIp));
  if (retryAfter > 0) {
    return {
      status: 429,
      retryAfter,
      body: { error: 'Muitas mensagens em pouco tempo. Tente novamente mais tarde.' },
    };
  }

  const apiKey = process.env['RESEND_API_KEY']?.trim();
  if (!apiKey) {
    return {
      status: 503,
      body: { error: 'Envio de email não configurado. Defina RESEND_API_KEY.' },
    };
  }

  const to = readContactEmail();
  if (!to || !EMAIL_PATTERN.test(to)) {
    return { status: 500, body: { error: 'Destinatário de contato inválido.' } };
  }

  const from = typeof body.from === 'string' ? body.from.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!from || !EMAIL_PATTERN.test(from) || from.length > MAX_FROM_LENGTH) {
    return { status: 400, body: { error: 'Informe um email válido.' } };
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { status: 400, body: { error: 'A mensagem precisa ter entre 1 e 4000 caracteres.' } };
  }

  const fromAddress =
    process.env['CONTACT_FROM_EMAIL']?.trim() || 'Portfólio <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      reply_to: from,
      subject: `Contato via portfólio: ${from}`,
      text: `${message}\n\nDe: ${from}`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('[contact] Resend', response.status, detail);
    return { status: 502, body: { error: 'Falha ao enviar o email. Tente novamente.' } };
  }

  return { status: 200, body: { ok: true } };
}
