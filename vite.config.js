import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const caminho = (arquivo) => fileURLToPath(new URL(arquivo, import.meta.url));

// Duas páginas no mesmo projeto:
//   index.html         site de apresentação (para a banca e investidores)
//   painel/index.html  painel do lojista (o produto, para o dono do mercadinho)
//
// `npm run build` gera as duas em dist/ (para hospedar, ex.: GitHub Pages).
// `npm run build:offline` gera dist-offline/index.html e dist-offline/painel/index.html,
// cada um num arquivo só, com fontes e imagens embutidas, que abrem com dois cliques
// mesmo sem internet (bom para a banca).
export default defineConfig(({ mode }) => {
  if (mode === 'offline' || mode === 'offline-painel') {
    const painel = mode === 'offline-painel';
    return {
      base: './',
      plugins: [react(), viteSingleFile()],
      build: {
        outDir: 'dist-offline',
        emptyOutDir: !painel,
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        rolldownOptions: { input: caminho(painel ? 'painel/index.html' : 'index.html') },
      },
    };
  }
  return {
    base: './',
    plugins: [react()],
    build: {
      outDir: 'dist',
      rolldownOptions: {
        input: { site: caminho('index.html'), painel: caminho('painel/index.html') },
      },
    },
  };
});
