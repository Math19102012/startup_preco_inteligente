// Integrações com APIs públicas, chamadas direto do navegador (todas liberam CORS e
// dispensam chave de acesso):
//
//   BrasilAPI · CNPJ   dados cadastrais da loja a partir do CNPJ (Receita Federal)
//   BrasilAPI · CEP    endereço e bairro, que definem a região de comparação
//   ViaCEP             reserva do CEP, se a BrasilAPI não responder
//   Open Food Facts    nome, marca e foto do produto a partir do código de barras
//
// Cada chamada fica registrada (serviço, tempo de resposta, resultado) para a tela de integrações.
import { cepValido, cnpjValido, eanValido, soDigitos } from '../lib/validacao.js';

export const SERVICOS = {
  cnpj: {
    nome: 'BrasilAPI · CNPJ',
    descricao: 'Preenche o cadastro da loja com os dados públicos da Receita Federal.',
    url: 'https://brasilapi.com.br/docs#tag/CNPJ',
  },
  cep: {
    nome: 'BrasilAPI · CEP',
    descricao: 'Encontra bairro e cidade da loja, que definem com quem ela é comparada.',
    url: 'https://brasilapi.com.br/docs#tag/CEP-V2',
  },
  viacep: {
    nome: 'ViaCEP',
    descricao: 'Reserva da consulta de CEP, usada se a BrasilAPI não responder.',
    url: 'https://viacep.com.br',
  },
  produto: {
    nome: 'Open Food Facts',
    descricao: 'Traz nome, marca e foto do produto pelo código de barras.',
    url: 'https://br.openfoodfacts.org',
  },
};

export class ErroApi extends Error {
  constructor(mensagem, tipo) {
    super(mensagem);
    this.tipo = tipo; // 'invalido' | 'nao-encontrado' | 'rede' | 'servico'
  }
}

// ---------------------------------------------------------------------------
// Registro das chamadas (memória + localStorage, últimas 30)
// ---------------------------------------------------------------------------
const CHAVE_REGISTRO = 'preco-inteligente:painel:chamadas';
const ouvintes = new Set();
let registro = [];
try {
  registro = JSON.parse(localStorage.getItem(CHAVE_REGISTRO)) ?? [];
} catch {
  registro = [];
}

function anotar(entrada) {
  registro = [{ ...entrada, quando: new Date().toISOString() }, ...registro].slice(0, 30);
  try {
    localStorage.setItem(CHAVE_REGISTRO, JSON.stringify(registro));
  } catch {
    // sem armazenamento (aba anônima): o registro vale só para esta visita
  }
  ouvintes.forEach((f) => f(registro));
}

export const chamadasRecentes = () => registro;
export function ouvirChamadas(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

// ---------------------------------------------------------------------------
// GET com tempo limite e erros em português
// ---------------------------------------------------------------------------
async function obterJson(servico, url, { tempoLimite = 8000, fetcher = globalThis.fetch } = {}) {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), tempoLimite);
  const inicio = performance.now();
  let resposta;
  try {
    resposta = await fetcher(url, { signal: controle.signal, headers: { Accept: 'application/json' } });
  } catch (e) {
    const ms = Math.round(performance.now() - inicio);
    const porTempo = e?.name === 'AbortError';
    anotar({ servico, url, ok: false, status: porTempo ? 'tempo esgotado' : 'sem conexão', ms });
    throw new ErroApi(
      porTempo ? 'O serviço demorou demais para responder. Tente de novo.' : 'Sem conexão com o serviço. Confira a internet.',
      'rede',
    );
  } finally {
    clearTimeout(relogio);
  }
  const ms = Math.round(performance.now() - inicio);
  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    corpo = null;
  }
  anotar({ servico, url, ok: resposta.ok, status: resposta.status, ms });
  return { status: resposta.status, ok: resposta.ok, corpo, ms };
}

// ---------------------------------------------------------------------------
// CNPJ
// ---------------------------------------------------------------------------
export async function buscarCnpj(cnpj, opcoes) {
  const d = soDigitos(cnpj);
  if (!cnpjValido(d)) throw new ErroApi('CNPJ inválido. Confira os 14 números.', 'invalido');
  const r = await obterJson('cnpj', `https://brasilapi.com.br/api/cnpj/v1/${d}`, opcoes);
  if (r.status === 404) throw new ErroApi('Não encontramos esse CNPJ na Receita Federal.', 'nao-encontrado');
  if (!r.ok || !r.corpo) throw new ErroApi('A consulta de CNPJ está fora do ar agora. Preencha à mão.', 'servico');
  const c = r.corpo;
  const titulo = (s) =>
    String(s ?? '')
      .toLowerCase()
      .replace(/(^|\s|\/)(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
      .replace(/\b(De|Da|Do|Das|Dos|E)\b/g, (m) => m.toLowerCase())
      .trim();
  return {
    cnpj: d,
    razaoSocial: c.razao_social ?? '',
    nome: titulo(c.nome_fantasia || c.razao_social),
    atividade: c.cnae_fiscal_descricao ?? '',
    situacao: c.descricao_situacao_cadastral ?? null,
    logradouro: titulo([c.descricao_tipo_de_logradouro, c.logradouro].filter(Boolean).join(' ')),
    numero: c.numero ?? '',
    bairro: titulo(c.bairro),
    cidade: titulo(c.municipio),
    uf: c.uf ?? '',
    cep: soDigitos(c.cep),
    ms: r.ms,
  };
}

// ---------------------------------------------------------------------------
// CEP (BrasilAPI, com ViaCEP de reserva)
// ---------------------------------------------------------------------------
export async function buscarCep(cep, opcoes) {
  const d = soDigitos(cep);
  if (!cepValido(d)) throw new ErroApi('CEP inválido. São 8 números.', 'invalido');

  let falhaBrasilApi = null;
  try {
    const r = await obterJson('cep', `https://brasilapi.com.br/api/cep/v2/${d}`, opcoes);
    if (r.ok && r.corpo?.city) {
      const coord = r.corpo.location?.coordinates;
      return {
        cep: d,
        logradouro: r.corpo.street ?? '',
        bairro: r.corpo.neighborhood ?? '',
        cidade: r.corpo.city,
        uf: r.corpo.state,
        latitude: coord?.latitude ? Number(coord.latitude) : null,
        longitude: coord?.longitude ? Number(coord.longitude) : null,
        fonte: 'BrasilAPI',
        ms: r.ms,
      };
    }
    if (r.status === 404) falhaBrasilApi = 'nao-encontrado';
  } catch (e) {
    falhaBrasilApi = e.tipo;
  }

  const r = await obterJson('viacep', `https://viacep.com.br/ws/${d}/json/`, opcoes);
  if (r.ok && r.corpo && !r.corpo.erro) {
    return {
      cep: d,
      logradouro: r.corpo.logradouro ?? '',
      bairro: r.corpo.bairro ?? '',
      cidade: r.corpo.localidade,
      uf: r.corpo.uf,
      latitude: null,
      longitude: null,
      fonte: 'ViaCEP',
      ms: r.ms,
    };
  }
  if (r.corpo?.erro || falhaBrasilApi === 'nao-encontrado') throw new ErroApi('CEP não encontrado.', 'nao-encontrado');
  throw new ErroApi('A consulta de CEP está fora do ar agora. Preencha à mão.', 'servico');
}

// ---------------------------------------------------------------------------
// Produto pelo código de barras (Open Food Facts)
// ---------------------------------------------------------------------------
const CAMPOS_PRODUTO = 'code,product_name_pt,product_name,generic_name_pt,brands,quantity,image_front_small_url,categories_tags';

export async function buscarProdutoPorEan(ean, opcoes) {
  const d = soDigitos(ean);
  if (!eanValido(d)) throw new ErroApi('Código de barras inválido. Confira os números.', 'invalido');
  const r = await obterJson(
    'produto',
    `https://world.openfoodfacts.org/api/v2/product/${d}.json?fields=${CAMPOS_PRODUTO}`,
    opcoes,
  );
  if (r.status === 404 || r.corpo?.status === 0) {
    throw new ErroApi('Produto não encontrado na base aberta. Cadastre o nome à mão.', 'nao-encontrado');
  }
  if (!r.ok || !r.corpo?.product) throw new ErroApi('A base de produtos está fora do ar agora. Cadastre à mão.', 'servico');
  const p = r.corpo.product;
  const nomeBase = p.product_name_pt || p.product_name || p.generic_name_pt || '';
  const marca = String(p.brands ?? '').split(',')[0].trim();
  const nome = [nomeBase, marca && !nomeBase.toLowerCase().includes(marca.toLowerCase()) ? marca : '', p.quantity]
    .filter(Boolean)
    .join(', ');
  return {
    ean: d,
    nome: nome || `Produto ${d}`,
    marca,
    quantidade: p.quantity ?? '',
    imagem: p.image_front_small_url ?? null,
    categoria: categoriaDe(p.categories_tags ?? []),
    ms: r.ms,
  };
}

function categoriaDe(tags) {
  const t = tags.join(' ');
  if (/beverages|bebidas|drinks/.test(t)) return 'Bebidas';
  if (/dairies|laticinios|milks|cheeses/.test(t)) return 'Laticínios';
  if (/snacks|biscuits|chocolates/.test(t)) return 'Mercearia';
  if (/hygiene|higiene|toothpastes|soaps/.test(t)) return 'Higiene';
  if (/cleaning|limpeza|detergents/.test(t)) return 'Limpeza';
  return 'Mercearia';
}

// ---------------------------------------------------------------------------
// Teste de conexão (tela de integrações)
// ---------------------------------------------------------------------------
export const AMOSTRAS_TESTE = {
  cnpj: '06990590000123', // Google Brasil Internet Ltda: cadastro público, ótimo para testar
  cep: '01310100', // Avenida Paulista
  viacep: '01310100',
  produto: '7894900011517', // refrigerante de cola 2 L
};

export async function testarServico(id, opcoes) {
  const inicio = performance.now();
  try {
    let detalhe;
    if (id === 'cnpj') detalhe = (await buscarCnpj(AMOSTRAS_TESTE.cnpj, opcoes)).razaoSocial;
    else if (id === 'cep') {
      const r = await obterJson('cep', `https://brasilapi.com.br/api/cep/v2/${AMOSTRAS_TESTE.cep}`, opcoes);
      if (!r.ok) throw new ErroApi(`Respondeu com erro ${r.status}.`, 'servico');
      detalhe = `${r.corpo.street}, ${r.corpo.city}`;
    } else if (id === 'viacep') {
      const r = await obterJson('viacep', `https://viacep.com.br/ws/${AMOSTRAS_TESTE.viacep}/json/`, opcoes);
      if (!r.ok) throw new ErroApi(`Respondeu com erro ${r.status}.`, 'servico');
      detalhe = `${r.corpo.logradouro}, ${r.corpo.localidade}`;
    } else if (id === 'produto') detalhe = (await buscarProdutoPorEan(AMOSTRAS_TESTE.produto, opcoes)).nome;
    return { ok: true, ms: Math.round(performance.now() - inicio), detalhe };
  } catch (e) {
    return { ok: false, ms: Math.round(performance.now() - inicio), detalhe: e.message };
  }
}
