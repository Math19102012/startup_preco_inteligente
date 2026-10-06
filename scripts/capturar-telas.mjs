// Tira os prints do painel do lojista que aparecem no site de apresentação.
//
//   npm run telas
//
// Precisa do Playwright com o Chromium (uma vez só):
//   npm i -D playwright && npx playwright install chromium
//
// Gera src/assets/img/painel/*.webp a partir do build em dist/, com data e hora fixas
// para os prints saírem sempre iguais.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright não encontrado. Rode: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const PASTA = fileURLToPath(new URL('../src/assets/img/painel/', import.meta.url));
const MOMENTO = new Date('2026-10-06T15:20:00-03:00');

const servidor = await preview({ preview: { port: 4179, strictPort: true }, logLevel: 'warn' });
const BASE = 'http://localhost:4179/painel/';
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

// PNG do Playwright → WebP pelo próprio Chromium (sem dependência extra).
async function salvar(pagina, nome, png, qualidade = 0.86) {
  const dataUrl = await pagina.evaluate(
    async ([b64, q]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', q);
    },
    [png.toString('base64'), qualidade],
  );
  const arquivo = `${PASTA}${nome}.webp`;
  await writeFile(arquivo, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('ok', arquivo);
}

async function novaPagina(opcoes) {
  const contexto = await navegador.newContext({ locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', ...opcoes });
  const pagina = await contexto.newPage();
  await pagina.clock.setFixedTime(MOMENTO);
  await pagina.goto(`${BASE}?demo=1#/inicio`);
  await pagina.waitForSelector('.p-destaque');
  await pagina.evaluate(() => document.fonts.ready);
  // sem animação, para o print não pegar o menu no meio da transição
  await pagina.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  return pagina;
}

const aplicar = async (pagina, produto) => {
  await pagina.locator('tr', { hasText: produto }).getByRole('button', { name: 'Aplicar' }).click();
};

try {
  await mkdir(PASTA, { recursive: true });
  const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };
  const p = await novaPagina(desktop);

  await p.goto(`${BASE}?demo=1#/precos`);
  await p.waitForSelector('.p-tabela');
  await salvar(p, 'precos', await p.screenshot());

  await p.goto(`${BASE}?demo=1#/precos?item=arroz-5`);
  await p.waitForSelector('.p-detalhe');
  await salvar(p, 'custo-real', await p.screenshot());
  await p.keyboard.press('Escape');

  // alguns ajustes já feitos, para a visão geral mostrar o "já recuperado"
  for (const item of ['Botijão de gás', 'Arroz tipo 1', 'Refrigerante de cola']) await aplicar(p, item);
  await p.goto(`${BASE}?demo=1#/inicio`);
  await p.waitForSelector('.p-destaque');
  await salvar(p, 'visao-geral', await p.screenshot());

  await p.goto(`${BASE}?demo=1#/nota`);
  await p.getByRole('button', { name: 'Usar uma nota de exemplo' }).click();
  await p.waitForSelector('.p-nota-topo');
  await salvar(p, 'nota-fiscal', await p.screenshot());

  await p.goto(`${BASE}?demo=1#/etiquetas`);
  await p.waitForSelector('.p-folha');
  await salvar(p, 'etiquetas', await p.screenshot());

  const celular = await novaPagina({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await salvar(celular, 'celular', await celular.screenshot());
} finally {
  await navegador.close();
  await servidor.close();
}
