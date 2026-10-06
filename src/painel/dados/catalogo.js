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

export const LOJA_DEMONSTRACAO = {
  demonstracao: true,
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
