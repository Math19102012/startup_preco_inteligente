// "Preço da região": a faixa que as lojas vizinhas cobram por um produto.
//
// Botijão de gás: dado real da ANP por cidade (1ª entrega do projeto).
// Demais itens: base de referência de demonstração, ajustada por cidade e bairro de forma
// determinística (o mesmo endereço sempre vê os mesmos números).
import { CIDADES } from '../../data/conteudo.js';
import { REFERENCIA } from '../dados/catalogo.js';
import { normalizarTexto, soDigitos } from './validacao.js';

// Faixa do botijão quando a cidade da loja não está entre as 12 da análise:
// extremos e mediana das 12 cidades com mais coletas no estado.
const GLP_ESTADO = { min: 79.99, mediana: 115.0, max: 150.0, coletas: 23_880 };

function hash(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

// preço com cara de gôndola: 7,4837 → 7,49
const gondola = (v) => Math.max(0.49, Math.round(v * 10) / 10 - 0.01);

export function referenciaDo(produto) {
  if (produto.ref) {
    const r = REFERENCIA.find((x) => x.ref === produto.ref);
    if (r) return r;
  }
  const ean = soDigitos(produto.ean);
  return ean ? (REFERENCIA.find((x) => x.ean === ean) ?? null) : null;
}

export function faixaDaRegiao(produto, loja) {
  const r = referenciaDo(produto);
  if (!r) return null;
  const cidade = loja?.cidade ?? 'São Paulo';

  if (r.anp) {
    const c = CIDADES.find((x) => normalizarTexto(x.cidade) === normalizarTexto(cidade));
    const f = c ?? GLP_ESTADO;
    return {
      min: f.min,
      mediana: f.mediana,
      max: f.max,
      amostras: c ? c.coletas : f.coletas,
      fonte: c ? `ANP · ${c.cidade}, jan a ago/2026` : 'ANP · estado de SP, jan a ago/2026',
      real: true,
    };
  }

  // fora da capital, os preços variam até 4% para cima ou para baixo
  const fator =
    normalizarTexto(cidade) === 'sao paulo' ? 1 : 1 + ((hash(normalizarTexto(cidade)) % 9) - 4) / 100;
  const [min, mediana, max] = r.faixa.map((v) => (fator === 1 ? v : gondola(v * fator)));
  return {
    min,
    mediana,
    max,
    amostras: 6 + (hash(`${r.ref}|${normalizarTexto(loja?.bairro)}`) % 15),
    fonte: 'Base de demonstração',
    real: false,
  };
}
