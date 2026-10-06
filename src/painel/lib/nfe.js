// Leitura do XML da NF-e de compra (modelo 55, layout 4.00 da Sefaz).
// É o arquivo que o fornecedor manda por e-mail junto com a nota. Dele saem o custo de
// cada item e o código de barras, que é como o painel casa a nota com o catálogo da loja.
//
// O XML da NF-e é gerado por sistema e tem estrutura fixa, então uma leitura por tags basta
// e funciona igual no navegador e nos testes (sem depender de DOMParser).

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodificar(texto) {
  return texto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
      return ENTIDADES[e] ?? m;
    })
    .trim();
}

// Conteúdo do primeiro <tag> dentro de `xml` (aceita prefixo de namespace, ex.: <nfe:xProd>).
function tag(xml, nome) {
  const m = xml?.match(new RegExp(`<(?:\\w+:)?${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${nome}>`));
  return m ? decodificar(m[1]) : null;
}

function blocos(xml, nome) {
  const re = new RegExp(`<(?:\\w+:)?${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${nome}>`, 'g');
  return [...xml.matchAll(re)].map((m) => m[1]);
}

const numero = (v) => (v === null || v === '' ? 0 : Number(v));

export class ErroNotaFiscal extends Error {}

export function lerNotaFiscal(xml) {
  if (typeof xml !== 'string' || !xml.includes('<')) throw new ErroNotaFiscal('O arquivo não é um XML.');
  const infNFe = tag(xml, 'infNFe');
  if (!infNFe) throw new ErroNotaFiscal('Não encontramos uma NF-e neste XML. Confira se é o XML da nota (e não o PDF do DANFE).');

  const ide = tag(infNFe, 'ide');
  const emit = tag(infNFe, 'emit');
  const chave = xml.match(/<(?:\w+:)?infNFe[^>]*\sId="NFe(\d{44})"/)?.[1] ?? null;

  const itens = blocos(infNFe, 'det').map((det, i) => {
    const prod = tag(det, 'prod');
    const imposto = tag(det, 'imposto') ?? '';
    const quantidadeComercial = numero(tag(prod, 'qCom'));
    // A unidade tributável costuma ser a unidade de venda ao consumidor (ex.: caixa com 12 → 12 UN).
    const quantidade = numero(tag(prod, 'qTrib')) || quantidadeComercial;
    const valorProdutos = numero(tag(prod, 'vProd'));
    // custo de verdade: produto + frete, seguro e outras despesas − desconto + IPI e ICMS-ST
    const acrescimos =
      numero(tag(prod, 'vFrete')) +
      numero(tag(prod, 'vSeg')) +
      numero(tag(prod, 'vOutro')) -
      numero(tag(prod, 'vDesc')) +
      numero(tag(tag(imposto, 'IPI') ?? '', 'vIPI')) +
      numero(tag(imposto, 'vICMSST'));
    const custoTotal = valorProdutos + acrescimos;
    const gtin = (tag(prod, 'cEANTrib') || tag(prod, 'cEAN') || '').replace(/\D/g, '');
    return {
      item: i + 1,
      codigo: tag(prod, 'cProd'),
      ean: gtin.length >= 8 ? gtin : null,
      descricao: tag(prod, 'xProd') ?? `Item ${i + 1}`,
      ncm: tag(prod, 'NCM'),
      unidadeComercial: tag(prod, 'uCom'),
      quantidadeComercial,
      unidade: tag(prod, 'uTrib') ?? tag(prod, 'uCom'),
      quantidade,
      valorProdutos,
      custoTotal,
      custoUnitario: quantidade > 0 ? Math.round((custoTotal / quantidade) * 10000) / 10000 : 0,
    };
  });

  if (itens.length === 0) throw new ErroNotaFiscal('A nota não tem itens.');

  return {
    chave,
    numero: tag(ide, 'nNF'),
    serie: tag(ide, 'serie'),
    emissao: tag(ide, 'dhEmi') ?? tag(ide, 'dEmi'),
    fornecedor: {
      cnpj: tag(emit, 'CNPJ'),
      nome: tag(emit, 'xFant') || tag(emit, 'xNome') || 'Fornecedor',
    },
    valorTotal: numero(tag(tag(infNFe, 'ICMSTot') ?? '', 'vNF')) || itens.reduce((s, i) => s + i.custoTotal, 0),
    itens,
  };
}

// ---------------------------------------------------------------------------
// Nota de exemplo, para quem quer testar sem ter um XML em mãos.
// Fornecedor e chave fictícios; estrutura igual à de uma NF-e real.
// ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Chave de 43 dígitos + dígito verificador (módulo 11, pesos 2 a 9).
function chaveDeAcesso(base) {
  let peso = 2;
  let soma = 0;
  for (let i = base.length - 1; i >= 0; i--) {
    soma += Number(base[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  return `${base}${resto < 2 ? 0 : 11 - resto}`;
}

export function gerarNotaExemplo(itens, { numero: nNF = '48213', emissao = new Date() } = {}) {
  const dets = itens
    .map((it, i) => {
      const qCom = it.caixas;
      const qTrib = it.caixas * it.porCaixa;
      const vProd = (it.custoUnitario * qTrib).toFixed(2);
      return `<det nItem="${i + 1}"><prod><cProd>${esc(it.codigo)}</cProd><cEAN>${it.ean}</cEAN><xProd>${esc(it.descricao)}</xProd><NCM>${it.ncm}</NCM><CFOP>5102</CFOP><uCom>CX</uCom><qCom>${qCom.toFixed(4)}</qCom><vUnCom>${(Number(vProd) / qCom).toFixed(4)}</vUnCom><vProd>${vProd}</vProd><cEANTrib>${it.ean}</cEANTrib><uTrib>UN</uTrib><qTrib>${qTrib.toFixed(4)}</qTrib><vUnTrib>${it.custoUnitario.toFixed(4)}</vUnTrib><indTot>1</indTot></prod><imposto><ICMS><ICMSSN102><orig>0</orig><CSOSN>102</CSOSN></ICMSSN102></ICMS></imposto></det>`;
    })
    .join('');
  const total = itens.reduce((s, it) => s + it.custoUnitario * it.caixas * it.porCaixa, 0).toFixed(2);
  const dh = emissao.toISOString().slice(0, 19) + '-03:00';
  const aamm = `${String(emissao.getFullYear()).slice(2)}${String(emissao.getMonth() + 1).padStart(2, '0')}`;
  const chave = chaveDeAcesso(`35${aamm}1122233300018155001${nNF.padStart(9, '0')}1${nNF.padStart(8, '0')}`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><NFe><infNFe Id="NFe${chave}" versao="4.00"><ide><cUF>35</cUF><natOp>Venda de mercadoria</natOp><mod>55</mod><serie>1</serie><nNF>${nNF}</nNF><dhEmi>${dh}</dhEmi><tpNF>1</tpNF></ide><emit><CNPJ>11222333000181</CNPJ><xNome>Distribuidora Exemplo de Alimentos Ltda</xNome><xFant>Distribuidora Exemplo</xFant><enderEmit><xMun>Sao Paulo</xMun><UF>SP</UF></enderEmit></emit>${dets}<total><ICMSTot><vProd>${total}</vProd><vNF>${total}</vNF></ICMSTot></total></infNFe></NFe></nfeProc>`;
}
