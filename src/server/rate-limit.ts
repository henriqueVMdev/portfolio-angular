// ponytail: janela deslizante em memória, por instância — zera em cold start.
// Segura loop de bot e envio repetido acidental, não ataque distribuído.
const MAX_HITS = 3;
const WINDOW_MS = 10 * 60 * 1000;

const hits = new Map<string, number[]>();

export function readClientIp(forwarded: string | string[] | undefined, fallback = 'unknown') {
  const header = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return header?.split(',')[0]?.trim() || fallback;
}

/** Registra a tentativa e devolve os segundos de espera, ou 0 se liberado. */
export function retryAfterSeconds(ip: string, now = Date.now()) {
  const cutoff = now - WINDOW_MS;

  for (const [key, times] of hits) {
    const kept = times.filter((time) => time > cutoff);
    if (kept.length) hits.set(key, kept);
    else hits.delete(key);
  }

  const recent = hits.get(ip) ?? [];
  if (recent.length >= MAX_HITS) {
    return Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
  }

  hits.set(ip, [...recent, now]);
  return 0;
}

if (process.argv[1]?.includes('rate-limit')) {
  const eq = (got: number, want: number, msg: string) => {
    if (got !== want) throw new Error(`${msg}: esperado ${want}, veio ${got}`);
  };
  const t = 1_000_000;

  eq(retryAfterSeconds('a', t), 0, '1a tentativa');
  eq(retryAfterSeconds('a', t + 1), 0, '2a tentativa');
  eq(retryAfterSeconds('a', t + 2), 0, '3a tentativa');
  eq(retryAfterSeconds('a', t + 3), 600, '4a tentativa bloqueia');
  eq(retryAfterSeconds('b', t + 3), 0, 'outro IP não é afetado');
  eq(retryAfterSeconds('a', t + WINDOW_MS + 1), 0, 'janela expira');

  console.log('rate-limit ok');
}
