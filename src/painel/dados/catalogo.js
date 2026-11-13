// Catálogo da loja de demonstração e base de preços de referência.
//
// O botijão de gás usa a faixa real da ANP (1ª entrega do projeto). Os demais itens têm
// faixa de preço simulada para a demonstração, já que São Paulo não publica os preços da
// nota fiscal do varejo. No produto, essa base vem da rede de lojas assinantes.
//
// Os códigos de barras começam com 2 (faixa GS1 de uso interno): são fictícios e não
// colidem com nenhum produto real.
import { comDigito } from '../lib/validacao.js';

const cod = (n) => comDigito(`2000000${String(n).padStart(5, '0')}`);

// faixa: preço praticado na cidade de São Paulo (mínimo, mediana e máximo)
export const REFERENCIA = [
  { ref: 'arroz-5', ean: cod(1), nome: 'Arroz tipo 1, 5 kg', categoria: 'Mercearia', faixa: [26.5, 28.9, 32.9] },
  { ref: 'feijao-1', ean: cod(2), nome: 'Feijão carioca, 1 kg', categoria: 'Mercearia', faixa: [7.49, 8.49, 9.49] },
  { ref: 'oleo-900', ean: cod(3), nome: 'Óleo de soja, 900 ml', categoria: 'Mercearia', faixa: [6.79, 7.49, 8.29] },
  { ref: 'leite-1', ean: cod(4), nome: 'Leite integral, 1 L', categoria: 'Laticínios', faixa: [5.29, 5.69, 6.19] },
  { ref: 'cafe-500', ean: cod(5), nome: 'Café torrado e moído, 500 g', categoria: 'Mercearia', faixa: [27.9, 29.9, 31.9] },
  { ref: 'glp-13', ean: null, nome: 'Botijão de gás, 13 kg', categoria: 'Gás', faixa: null, anp: true },
  { ref: 'acucar-1', ean: cod(7), nome: 'Açúcar refinado, 1 kg', categoria: 'Mercearia', faixa: [4.29, 4.79, 5.29] },
  { ref: 'macarrao-500', ean: cod(8), nome: 'Macarrão espaguete, 500 g', categoria: 'Mercearia', faixa: [3.79, 4.29, 4.99] },
  { ref: 'refri-2l', ean: cod(9), nome: 'Refrigerante de cola, 2 L', categoria: 'Bebidas', faixa: [9.49, 10.49, 11.99] },
  { ref: 'cerveja-lata', ean: cod(10), nome: 'Cerveja pilsen, lata 350 ml', categoria: 'Bebidas', faixa: [3.49, 3.99, 4.49] },
  { ref: 'papel-12', ean: cod(11), nome: 'Papel higiênico, 12 rolos', categoria: 'Limpeza', faixa: [17.9, 21.9, 24.9] },
  { ref: 'detergente', ean: cod(12), nome: 'Detergente líquido, 500 ml', categoria: 'Limpeza', faixa: [2.29, 2.59, 2.99] },
  { ref: 'sabao-po', ean: cod(13), nome: 'Sabão em pó, 1,6 kg', categoria: 'Limpeza', faixa: [17.9, 19.9, 22.9] },
  { ref: 'pao-forma', ean: cod(14), nome: 'Pão de forma, 400 g', categoria: 'Padaria', faixa: [6.99, 7.49, 7.99] },
  { ref: 'ovos-12', ean: cod(15), nome: 'Ovos brancos, dúzia', categoria: 'Hortifrúti', faixa: [10.49, 11.49, 12.99] },
  { ref: 'banana-kg', ean: cod(16), nome: 'Banana prata, kg', categoria: 'Hortifrúti', faixa: [5.49, 6.49, 7.49] },
  { ref: 'margarina', ean: cod(17), nome: 'Margarina, 500 g', categoria: 'Laticínios', faixa: [7.99, 8.99, 9.99] },
  { ref: 'mussarela-kg', ean: cod(18), nome: 'Muçarela fatiada, kg', categoria: 'Frios', faixa: [42.9, 46.9, 49.9] },
  { ref: 'presunto-kg', ean: cod(19), nome: 'Presunto fatiado, kg', categoria: 'Frios', faixa: [32.9, 36.9, 39.9] },
  { ref: 'agua-15', ean: cod(20), nome: 'Água mineral, 1,5 L', categoria: 'Bebidas', faixa: [2.49, 2.99, 3.49] },
  { ref: 'biscoito', ean: cod(21), nome: 'Biscoito recheado, 130 g', categoria: 'Mercearia', faixa: [2.59, 2.99, 3.49] },
  { ref: 'sabonete', ean: cod(22), nome: 'Sabonete, 85 g', categoria: 'Higiene', faixa: [1.99, 2.39, 2.79] },
  { ref: 'creme-dental', ean: cod(23), nome: 'Creme dental, 90 g', categoria: 'Higiene', faixa: [4.29, 4.79, 5.49] },
  { ref: 'farinha-1', ean: cod(24), nome: 'Farinha de trigo, 1 kg', categoria: 'Mercearia', faixa: [4.99, 5.49, 5.99] },
  { ref: 'molho-340', ean: cod(25), nome: 'Molho de tomate, 340 g', categoria: 'Mercearia', faixa: [1.99, 2.29, 2.59] },
  { ref: 'pao-frances', ean: cod(28), nome: 'Pão francês, kg', categoria: 'Padaria', faixa: [13.99, 15.99, 18.99] },
  { ref: 'mortadela-kg', ean: cod(29), nome: 'Mortadela fatiada, kg', categoria: 'Frios', faixa: [19.9, 24.9, 29.9] },
  { ref: 'salgadinho', ean: cod(30), nome: 'Salgadinho de milho, 120 g', categoria: 'Mercearia', faixa: [6.49, 7.49, 8.49] },
  // Mais itens de giro do minimercado: todos na faixa da região ou acima dela, de propósito,
  // para não mudar o diagnóstico principal da loja de demonstração (R$ 672 por mês em 8 itens).
  { ref: 'leite-condensado', ean: cod(31), nome: 'Leite condensado, 395 g', categoria: 'Mercearia', faixa: [5.49, 5.99, 6.79] },
  { ref: 'milho-lata', ean: cod(32), nome: 'Milho verde em lata, 170 g', categoria: 'Mercearia', faixa: [2.99, 3.49, 3.99] },
  { ref: 'atum-lata', ean: cod(33), nome: 'Atum em lata, 170 g', categoria: 'Mercearia', faixa: [8.99, 9.99, 11.49] },
  { ref: 'sardinha-lata', ean: cod(34), nome: 'Sardinha em lata, 125 g', categoria: 'Mercearia', faixa: [4.99, 5.49, 6.29] },
  { ref: 'macarrao-instantaneo', ean: cod(35), nome: 'Macarrão instantâneo, 85 g', categoria: 'Mercearia', faixa: [1.79, 1.99, 2.49] },
  { ref: 'sal-1', ean: cod(36), nome: 'Sal refinado, 1 kg', categoria: 'Mercearia', faixa: [2.49, 2.99, 3.49] },
  { ref: 'vinagre', ean: cod(37), nome: 'Vinagre de álcool, 750 ml', categoria: 'Mercearia', faixa: [2.49, 2.89, 3.29] },
  { ref: 'azeite', ean: cod(38), nome: 'Azeite extravirgem, 500 ml', categoria: 'Mercearia', faixa: [32.9, 36.9, 42.9] },
  { ref: 'fuba', ean: cod(39), nome: 'Fubá mimoso, 1 kg', categoria: 'Mercearia', faixa: [3.99, 4.49, 4.99] },
  { ref: 'amendoim', ean: cod(40), nome: 'Amendoim torrado, 150 g', categoria: 'Mercearia', faixa: [5.49, 6.29, 6.99] },
  { ref: 'refri-lata', ean: cod(41), nome: 'Refrigerante de cola, lata 350 ml', categoria: 'Bebidas', faixa: [4.49, 4.99, 5.79] },
  { ref: 'guarana-2l', ean: cod(42), nome: 'Refrigerante de guaraná, 2 L', categoria: 'Bebidas', faixa: [7.99, 8.99, 9.99] },
  { ref: 'suco-uva', ean: cod(43), nome: 'Suco de uva integral, 1 L', categoria: 'Bebidas', faixa: [11.9, 13.9, 15.9] },
  { ref: 'iogurte', ean: cod(44), nome: 'Iogurte natural, 170 g', categoria: 'Laticínios', faixa: [2.49, 2.99, 3.49] },
  { ref: 'requeijao', ean: cod(45), nome: 'Requeijão cremoso, 200 g', categoria: 'Laticínios', faixa: [7.49, 8.49, 9.49] },
  { ref: 'manteiga', ean: cod(46), nome: 'Manteiga com sal, 200 g', categoria: 'Laticínios', faixa: [11.9, 13.9, 15.9] },
  { ref: 'linguica-kg', ean: cod(47), nome: 'Linguiça toscana, kg', categoria: 'Açougue', faixa: [21.9, 24.9, 28.9] },
  { ref: 'frango-kg', ean: cod(48), nome: 'Frango inteiro congelado, kg', categoria: 'Açougue', faixa: [11.9, 13.9, 15.9] },
  { ref: 'carvao', ean: cod(49), nome: 'Carvão vegetal, 3 kg', categoria: 'Outros', faixa: [17.9, 19.9, 23.9] },
  { ref: 'tomate-kg', ean: cod(50), nome: 'Tomate, kg', categoria: 'Hortifrúti', faixa: [6.99, 7.99, 9.49] },
  { ref: 'batata-kg', ean: cod(51), nome: 'Batata, kg', categoria: 'Hortifrúti', faixa: [4.99, 5.99, 6.99] },
  { ref: 'cebola-kg', ean: cod(52), nome: 'Cebola, kg', categoria: 'Hortifrúti', faixa: [4.49, 5.49, 6.49] },
  { ref: 'agua-sanitaria', ean: cod(53), nome: 'Água sanitária, 2 L', categoria: 'Limpeza', faixa: [5.49, 5.99, 6.99] },
  { ref: 'amaciante', ean: cod(54), nome: 'Amaciante, 2 L', categoria: 'Limpeza', faixa: [11.9, 13.9, 15.9] },
  { ref: 'esponja', ean: cod(55), nome: 'Esponja multiuso, 3 unidades', categoria: 'Limpeza', faixa: [3.99, 4.49, 5.29] },
  { ref: 'papel-toalha', ean: cod(56), nome: 'Papel toalha, 2 rolos', categoria: 'Limpeza', faixa: [5.99, 6.99, 7.99] },
  { ref: 'shampoo', ean: cod(57), nome: 'Shampoo, 350 ml', categoria: 'Higiene', faixa: [12.9, 14.9, 17.9] },
  { ref: 'desodorante', ean: cod(58), nome: 'Desodorante aerossol, 150 ml', categoria: 'Higiene', faixa: [14.9, 16.9, 18.9] },
  // Itens que ainda não estão no catálogo da loja: chegam pela nota fiscal de exemplo.
  { ref: 'achocolatado', ean: cod(26), nome: 'Achocolatado em pó, 400 g', categoria: 'Mercearia', faixa: [7.49, 8.29, 8.99] },
  { ref: 'extrato-140', ean: cod(27), nome: 'Extrato de tomate, 140 g', categoria: 'Mercearia', faixa: [2.19, 2.49, 2.79] },
];

// Situação inicial da loja de demonstração: custo de compra, preço na gôndola e vendas por mês.
const LOJA = {
  'arroz-5': [19.8, 24.9, 40],
  'feijao-1': [5.2, 6.99, 75],
  'oleo-900': [5.1, 6.49, 80],
  'leite-1': [4.15, 5.49, 300],
  'cafe-500': [22.5, 32.9, 40],
  'glp-13': [78.0, 92.0, 12],
  'acucar-1': [3.6, 4.49, 90],
  'macarrao-500': [3.1, 3.99, 110],
  'refri-2l': [7.9, 8.49, 120],
  'cerveja-lata': [2.95, 3.79, 480],
  'papel-12': [14.9, 18.49, 35],
  detergente: [1.85, 2.29, 150],
  'sabao-po': [15.4, 15.9, 25],
  'pao-forma': [5.4, 8.49, 70],
  'ovos-12': [8.2, 10.99, 80],
  'banana-kg': [3.8, 5.99, 90],
  margarina: [6.1, 7.99, 45],
  'mussarela-kg': [32.0, 54.9, 18],
  'presunto-kg': [24.0, 32.9, 20],
  'agua-15': [1.4, 2.49, 160],
  biscoito: [1.9, 2.49, 130],
  sabonete: [1.6, 2.19, 100],
  'creme-dental': [3.2, 4.99, 60],
  'farinha-1': [3.9, 4.19, 40],
  'molho-340': [1.7, 2.79, 70],
  'pao-frances': [9.8, 15.99, 1100],
  'mortadela-kg': [15.5, 24.9, 160],
  salgadinho: [4.6, 7.49, 320],
  'leite-condensado': [4.3, 5.99, 60],
  'milho-lata': [2.3, 3.29, 70],
  'atum-lata': [6.9, 9.79, 40],
  'sardinha-lata': [3.8, 5.49, 45],
  'macarrao-instantaneo': [1.25, 1.99, 260],
  'sal-1': [1.6, 2.79, 35],
  vinagre: [1.7, 2.79, 30],
  azeite: [27.0, 47.9, 12],
  fuba: [2.9, 4.49, 30],
  amendoim: [3.9, 5.99, 70],
  'refri-lata': [3.3, 4.99, 220],
  'guarana-2l': [6.1, 8.79, 90],
  'suco-uva': [9.4, 13.49, 25],
  iogurte: [1.85, 2.99, 110],
  requeijao: [5.7, 8.29, 55],
  manteiga: [10.0, 16.9, 30],
  'linguica-kg': [16.5, 24.9, 180],
  'frango-kg': [9.3, 13.49, 150],
  carvao: [12.5, 19.9, 60],
  'tomate-kg': [4.8, 7.99, 120],
  'batata-kg': [3.3, 5.49, 130],
  'cebola-kg': [3.1, 5.29, 90],
  'agua-sanitaria': [3.7, 5.99, 45],
  amaciante: [9.2, 13.9, 30],
  esponja: [2.4, 4.49, 40],
  'papel-toalha': [4.3, 6.79, 35],
  shampoo: [9.8, 14.9, 25],
  desodorante: [11.6, 21.9, 22],
};

export function catalogoDemonstracao() {
  return Object.entries(LOJA).map(([ref, [custo, preco, vendasMes]]) => {
    const r = REFERENCIA.find((x) => x.ref === ref);
    return {
      id: ref,
      ref,
      ean: r.ean,
      nome: r.nome,
      categoria: r.categoria,
      custo,
      preco,
      vendasMes,
      origem: 'demonstracao',
    };
  });
}

// Sobe quando o catálogo ou o histórico da demonstração mudam: quem já tinha aberto a loja
// de demonstração recebe a versão nova em vez de ficar com os dados antigos salvos no navegador.
export const VERSAO_DEMONSTRACAO = 2;

export const LOJA_DEMONSTRACAO = {
  demonstracao: true,
  versaoDemonstracao: VERSAO_DEMONSTRACAO,
  cnpj: null,
  razaoSocial: 'Mercadinho Bom Preço (demonstração)',
  nome: 'Mercadinho Bom Preço',
  atividade: 'Comércio varejista de mercadorias em geral, minimercados e mercearias',
  logradouro: 'Rua Doutor Luís Ayres',
  numero: '300',
  bairro: 'Vila Matilde',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '03515000',
  caixas: 2,
  plano: 'essencial',
};

// Itens da nota de exemplo: 4 produtos que a loja já vende (custo novo) e 2 novos.
export function itensNotaExemplo() {
  const pega = (ref) => REFERENCIA.find((r) => r.ref === ref);
  return [
    { r: pega('arroz-5'), custoUnitario: 20.4, caixas: 2, porCaixa: 6, ncm: '10063021' },
    { r: pega('feijao-1'), custoUnitario: 5.05, caixas: 3, porCaixa: 10, ncm: '07133319' },
    { r: pega('oleo-900'), custoUnitario: 5.1, caixas: 2, porCaixa: 20, ncm: '15079011' },
    { r: pega('refri-2l'), custoUnitario: 8.15, caixas: 4, porCaixa: 6, ncm: '22021000' },
    { r: pega('achocolatado'), custoUnitario: 5.6, caixas: 1, porCaixa: 12, ncm: '18069000' },
    { r: pega('extrato-140'), custoUnitario: 1.55, caixas: 2, porCaixa: 24, ncm: '20029090' },
  ].map(({ r, ...it }) => ({
    ...it,
    ean: r.ean,
    codigo: r.ref.toUpperCase(),
    descricao: r.nome.toUpperCase().replace(',', ''),
  }));
}

// Histórico da loja de demonstração, para o painel não abrir vazio: ela "usa" o Preço
// Inteligente há seis semanas, já ajustou três preços (hoje dentro da faixa) e importou duas
// notas. Os ajustes não mudam o diagnóstico atual, só o "já recuperado".
export function historicoDemonstracaoLoja(agora = new Date()) {
  const diasAtras = (n, hora = 10) => {
    const d = new Date(agora);
    d.setDate(d.getDate() - n);
    d.setHours(hora, 0, 0, 0);
    return d.toISOString();
  };
  const ajuste = (id, nome, de, para, vendasMes, dias) => ({
    id: `hist-${id}`,
    produtoId: id,
    nome,
    de,
    para,
    vendasMes,
    quando: diasAtras(dias),
    motivo: 'sugestao',
  });
  return {
    desde: diasAtras(42, 9),
    alteracoes: [
      ajuste('ovos-12', 'Ovos brancos, dúzia', 10.49, 10.99, 80, 8),
      ajuste('acucar-1', 'Açúcar refinado, 1 kg', 4.19, 4.49, 90, 22),
      ajuste('cerveja-lata', 'Cerveja pilsen, lata 350 ml', 3.49, 3.79, 480, 35),
    ],
    notas: [
      {
        id: 'hist-nota-2',
        chave: null,
        numero: '47920',
        fornecedor: 'Atacadista Exemplo',
        emissao: diasAtras(13, 8),
        valorTotal: 1876.4,
        itens: 11,
        atualizados: 11,
        criados: 0,
        importadaEm: diasAtras(13, 14),
      },
      {
        id: 'hist-nota-1',
        chave: null,
        numero: '47512',
        fornecedor: 'Distribuidora Exemplo',
        emissao: diasAtras(27, 8),
        valorTotal: 1284.6,
        itens: 9,
        atualizados: 8,
        criados: 1,
        importadaEm: diasAtras(27, 15),
      },
    ],
  };
}
