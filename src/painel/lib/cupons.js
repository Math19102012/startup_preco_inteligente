// Cupons de venda da própria loja (NFC-e, modelo 65, layout 4.00 da Sefaz).
//
// O programa de caixa grava o XML de cada cupom autorizado numa pasta do computador da loja
// (a loja é obrigada a guardar esses arquivos). O painel lê essa pasta e guarda, de cada cupom,
// só o que a análise de combos precisa: quando foi a compra e quais produtos saíram juntos.
//
// LGPD: o cupom pode trazer o CPF do consumidor ("CPF na nota"). O bloco <dest> nunca é lido.
import { blocos, chaveDeAcesso, esc, numero, tag } from './nfe.js';

export const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export const PERIODOS = [
  { id: 'manha', rotulo: 'manhã', quando: 'de manhã', faixa: 'até 12h', ate: 12 },
  { id: 'tarde', rotulo: 'tarde', quando: 'à tarde', faixa: '12h às 18h', ate: 18 },
  { id: 'noite', rotulo: 'noite', quando: 'à noite', faixa: 'depois das 18h', ate: 24 },
];

// "2026-11-03T15:20" → { dia: 2 (terça), periodo: 'tarde' }. Usa a hora local gravada na nota,
// sem converter fuso, para a análise não depender do fuso do computador que abre o painel.
export function momentoDe(emissao) {
  const [data, hora = '00'] = emissao.split('T');
  const [a, m, d] = data.split('-').map(Number);
  const dia = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  const h = Number(hora.slice(0, 2));
  return { dia, periodo: PERIODOS.find((p) => h < p.ate).id };
}

// Identificador do produto dentro do cupom: o código de barras ou, sem ele, o código interno.
export const chaveDoItem = (ean, codigo) => (ean ? ean : `cod:${String(codigo ?? '').toUpperCase()}`);

export class ErroCupom extends Error {}

export function lerCupom(xml) {
  const infNFe = tag(xml, 'infNFe');
  if (!infNFe) throw new ErroCupom('Não é um XML de NF-e/NFC-e.');
  const ide = tag(infNFe, 'ide');
  if (tag(ide, 'mod') !== '65') throw new ErroCupom('Não é um cupom de venda (NFC-e).');
  const chave = xml.match(/<(?:\w+:)?infNFe[^>]*\sId="NFe(\d{44})"/)?.[1];
  const dhEmi = tag(ide, 'dhEmi');
  if (!chave || !dhEmi) throw new ErroCupom('Cupom sem chave de acesso ou sem data de emissão.');

  const itens = blocos(infNFe, 'det').map((det) => {
    const prod = tag(det, 'prod');
    const gtin = (tag(prod, 'cEAN') || '').replace(/\D/g, '');
    const ean = gtin.length >= 8 ? gtin : null;
    const codigo = tag(prod, 'cProd');
    return {
      chave: chaveDoItem(ean, codigo),
      ean,
      codigo,
      descricao: tag(prod, 'xProd') ?? '',
      quantidade: numero(tag(prod, 'qCom')),
      valor: numero(tag(prod, 'vProd')),
    };
  });

  return {
    chave,
    // hora local da venda, como está na nota (sem o fuso)
    emissao: dhEmi.slice(0, 16),
    itens,
  };
}

// Evento de cancelamento (tpEvento 110111): o cupom deixa de contar.
export function lerCancelamento(xml) {
  const inf = tag(xml, 'infEvento');
  if (!inf || tag(inf, 'tpEvento') !== '110111') return null;
  return tag(inf, 'chNFe');
}

// Lê uma leva de arquivos da pasta. `arquivos`: [{ caminho, assinatura, ler: () => Promise<string> }].
// A assinatura (caminho + tamanho + data) evita reler, a cada abertura do painel, os milhares de
// cupons que já entraram.
export async function sincronizar(arquivos, assinaturasLidas = new Set()) {
  const resultado = { cupons: [], cancelados: [], assinaturas: [], notasDeCompra: 0, ignorados: 0, erros: [] };
  for (const arq of arquivos) {
    if (!/\.xml$/i.test(arq.caminho) || assinaturasLidas.has(arq.assinatura)) continue;
    let texto;
    try {
      texto = await arq.ler();
    } catch {
      resultado.erros.push(arq.caminho);
      continue;
    }
    resultado.assinaturas.push(arq.assinatura);
    const cancelado = lerCancelamento(texto);
    if (cancelado) {
      resultado.cancelados.push(cancelado);
      continue;
    }
    const mod = tag(tag(texto, 'ide') ?? '', 'mod');
    if (mod === '55') {
      resultado.notasDeCompra += 1;
      continue;
    }
    try {
      const cupom = lerCupom(texto);
      if (cupom.itens.length) resultado.cupons.push(cupom);
      else resultado.ignorados += 1;
    } catch {
      resultado.ignorados += 1;
    }
  }
  return resultado;
}

// Junta cupons de várias fontes, sem repetir chave e sem os cancelados.
export function juntarCupons(listas, cancelados = []) {
  const fora = new Set(cancelados);
  const vistos = new Map();
  for (const lista of listas) for (const c of lista) if (!fora.has(c.chave) && !vistos.has(c.chave)) vistos.set(c.chave, c);
  return [...vistos.values()];
}

// ---------------------------------------------------------------------------
// XML de NFC-e, usado para montar a pasta de exemplo da demonstração.
// Emitente e chaves fictícios; estrutura igual à de um cupom real.
// ---------------------------------------------------------------------------
export const CNPJ_DEMONSTRACAO = '98765432000198';

export function chaveDeCupom(emissao, numeroCupom, cnpj = CNPJ_DEMONSTRACAO) {
  const aamm = `${emissao.slice(2, 4)}${emissao.slice(5, 7)}`;
  const n = String(numeroCupom).padStart(9, '0');
  return chaveDeAcesso(`35${aamm}${cnpj}65001${n}1${n.slice(-8)}`);
}

export function cupomParaXml(cupom, { cnpj = CNPJ_DEMONSTRACAO, nome = 'Mercadinho Bom Preço (demonstração)' } = {}) {
  const nNF = Number(cupom.chave.slice(25, 34));
  const dets = cupom.itens
    .map(
      (it, i) =>
        `<det nItem="${i + 1}"><prod><cProd>${esc(it.codigo ?? i + 1)}</cProd><cEAN>${it.ean ?? 'SEM GTIN'}</cEAN><xProd>${esc(it.descricao)}</xProd><uCom>${/,\s*kg$/i.test(it.descricao) ? 'KG' : 'UN'}</uCom><qCom>${it.quantidade.toFixed(4)}</qCom><vUnCom>${(it.valor / it.quantidade).toFixed(2)}</vUnCom><vProd>${it.valor.toFixed(2)}</vProd><indTot>1</indTot></prod></det>`,
    )
    .join('');
  const total = cupom.itens.reduce((s, it) => s + it.valor, 0).toFixed(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><NFe><infNFe Id="NFe${cupom.chave}" versao="4.00"><ide><cUF>35</cUF><natOp>Venda ao consumidor</natOp><mod>65</mod><serie>1</serie><nNF>${nNF}</nNF><dhEmi>${cupom.emissao}:00-03:00</dhEmi><tpNF>1</tpNF><tpImp>4</tpImp></ide><emit><CNPJ>${cnpj}</CNPJ><xNome>${esc(nome)}</xNome></emit>${dets}<total><ICMSTot><vProd>${total}</vProd><vNF>${total}</vNF></ICMSTot></total><pag><detPag><tPag>01</tPag><vPag>${total}</vPag></detPag></pag></infNFe></NFe></nfeProc>`;
}

export function cancelamentoParaXml(chave, quando) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<procEventoNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00"><evento versao="1.00"><infEvento Id="ID110111${chave}01"><cOrgao>35</cOrgao><chNFe>${chave}</chNFe><dhEvento>${quando}:00-03:00</dhEvento><tpEvento>110111</tpEvento><nSeqEvento>1</nSeqEvento><detEvento versao="1.00"><descEvento>Cancelamento</descEvento><xJust>Cupom emitido em duplicidade</xJust></detEvento></infEvento></evento></procEventoNFe>`;
}
