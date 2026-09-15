// A Vercel injeta VERCEL_PROJECT_PRODUCTION_URL (sem protocolo) em build e runtime.
export const siteUrl = process.env['VERCEL_PROJECT_PRODUCTION_URL']
  ? `https://${process.env['VERCEL_PROJECT_PRODUCTION_URL']}`
  : 'http://localhost:4200';

// ponytail: o pôster do hero serve de card — é 1920x1080 e já é a cara do site.
// LinkedIn recorta para 1.91:1. Se o corte incomodar, trocar por um 1200x630.
// Precisa ser repetido em cada generateMetadata: o Next substitui o objeto
// openGraph inteiro no filho, não faz merge das imagens do layout raiz.
export const ogImage = {
  url: "/media/hero-1920-poster.jpg",
  width: 1920,
  height: 1080,
};
