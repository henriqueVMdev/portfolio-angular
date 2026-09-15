/**
 * Copia o worker do pdf.js para public/vendor.
 *
 * O visualizador do currículo desenha o PDF em canvas (leitura apenas), e o
 * pdf.js exige que o worker seja servido como arquivo estático. Copiar aqui
 * mantém o worker sempre na mesma versão do pacote instalado.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const target = resolve(root, "public/vendor/pdf.worker.min.mjs");

try {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
} catch (error) {
  console.warn(
    `[copy-pdf-worker] não foi possível copiar o worker do pdf.js: ${error.message}`,
  );
  process.exitCode = 0;
}
