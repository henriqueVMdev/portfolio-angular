import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

// ponytail: pôster do hero serve de card (1920x1080; o LinkedIn recorta para 1.91:1).
// Trocar por um 1200x630 dedicado se o corte incomodar.
const OG_IMAGE = '/media/hero-1920-poster.jpg';

// O LinkedIn ignora og:image relativa. As páginas são pré-renderizadas no build,
// onde não há requisição: na Vercel o domínio vem de VERCEL_PROJECT_PRODUCTION_URL
// (já troca para o domínio próprio quando houver). Fora dela, a origem da página.
function siteOrigin(doc: Document) {
  const vercelHost = typeof process !== 'undefined' ? process.env['VERCEL_PROJECT_PRODUCTION_URL'] : '';
  return vercelHost ? `https://${vercelHost}` : doc.location.origin;
}

/** Título, description e cartão de compartilhamento da página. Chamar no construtor. */
export function setPageMeta(title: string, description: string) {
  const doc = inject(DOCUMENT);
  const meta = inject(Meta);
  const origin = siteOrigin(doc);

  inject(Title).setTitle(title);
  meta.updateTag({ name: 'description', content: description });
  meta.updateTag({ property: 'og:title', content: title });
  meta.updateTag({ property: 'og:description', content: description });
  meta.updateTag({ property: 'og:url', content: origin + doc.location.pathname });
  meta.updateTag({ property: 'og:image', content: origin + OG_IMAGE });
  meta.updateTag({ property: 'og:image:width', content: '1920' });
  meta.updateTag({ property: 'og:image:height', content: '1080' });
}
