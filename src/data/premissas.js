// Todas as premissas numéricas do site ficam neste arquivo.
// Mudou um número aqui, o site inteiro (textos, gráficos e simuladores) se atualiza.
// Valores em reais (R$). Taxas como fração: 0.15 = 15%.

// ---------------------------------------------------------------------------
// Comparação com a renda fixa
// ---------------------------------------------------------------------------
export const CDI_ANUAL = 0.15; // CDI de referência usado na comparação
export const HORIZONTE_ANOS = 5; // o investidor sai (ou é avaliado) no fim do ano 5
// Participação em startup só ganha preço quando é vendida. A proposta prevê a saída no
// fim do ano 5; antes disso não há negociação que diga outro valor, então a participação
// fica avaliada pelo preço pago (prática usual de fundos) e não é comparada ano a ano.
export const ANO_PRIMEIRA_AVALIACAO = 5;

// ---------------------------------------------------------------------------
// Rodada de investimento proposta
// ---------------------------------------------------------------------------
export const RODADA = {
  valorCaptado: 500_000,
  // 35% da empresa para quem entra nesta rodada. A fatia foi definida para que o investidor
  // ganhe com folga do CDI mesmo no cenário conservador (veja os testes em lib/modelo.test.js).
  participacao: 0.35,
  instrumento: 'Mútuo conversível em participação (investidor-anjo, LC 155/2016)',
  usoDosRecursos: [
    { item: 'Produto e dados', detalhe: 'Desenvolvimento da plataforma e motor de preços', pct: 0.4 },
    { item: 'Vendas em campo e implantação', detalhe: 'Visitas às lojas e onboarding assistido', pct: 0.25 },
    { item: 'Marketing e parcerias', detalhe: 'Associações, distribuidores e sistemas de caixa', pct: 0.15 },
    { item: 'Reserva de caixa', detalhe: 'Colchão para atrasos no cronograma', pct: 0.12 },
    { item: 'Infraestrutura em nuvem', detalhe: 'Hospedagem, banco de dados e coleta', pct: 0.08 },
  ],
};

// ---------------------------------------------------------------------------
// Planos (mesmos valores do 5W2H)
// ---------------------------------------------------------------------------
export const PLANOS = [
  {
    id: 'consulta',
    nome: 'Consulta',
    preco: 0,
    limite: 'Até 20 itens',
    descricao: 'Preço da região para os itens que você escolher. Porta de entrada.',
    recursos: ['Preço da região', 'Sem cartão de crédito'],
  },
  {
    id: 'essencial',
    nome: 'Essencial',
    preco: 79,
    limite: 'Até 500 itens',
    descricao: 'Para o mercadinho que quer parar de vender no vermelho.',
    recursos: ['Preço da região', 'Custo real e preço mínimo', 'Alerta semanal', 'Etiquetas prontas'],
    destaque: true,
  },
  {
    id: 'completo',
    nome: 'Completo',
    preco: 149,
    limite: 'Até 2.000 itens',
    descricao: 'Para quem monta encarte e quer acompanhar a margem de perto.',
    recursos: ['Tudo do Essencial', 'Montagem do encarte', 'Relatório de margem'],
  },
];

// Proporção esperada de lojas pagantes em cada plano (usada no ticket médio)
export const MIX_PLANOS = { essencial: 0.7, completo: 0.3 };

// ---------------------------------------------------------------------------
// Custos da startup
// ---------------------------------------------------------------------------
export const CUSTOS = {
  impostosSobreReceita: 0.1, // Simples Nacional, faixa inicial de serviços de software
  infraPorLojaMes: 10, // nuvem, dados e suporte por loja ativa
  infraFixaAno: 12_000,
  custoAquisicaoPorLoja: 350, // visita em campo + implantação de cada loja nova
  cancelamentoMensal: 0.015, // 1,5% das lojas cancelam por mês
};

// ---------------------------------------------------------------------------
// Cenários de crescimento (5 anos)
// lojasFimAno: lojas pagantes ativas no fim de cada ano
// equipe / administrativo: custo anual em reais
// multiploReceita: valor da empresa = múltiplo × receita recorrente anual (ARR)
// ---------------------------------------------------------------------------
export const CENARIOS = {
  conservador: {
    id: 'conservador',
    nome: 'Conservador',
    resumo: 'Adoção lenta, crescimento só na Grande São Paulo.',
    lojasFimAno: [50, 200, 450, 800, 1200],
    equipe: [120_000, 200_000, 280_000, 360_000, 440_000],
    administrativo: [24_000, 30_000, 40_000, 50_000, 60_000],
    multiploReceita: 3,
  },
  base: {
    id: 'base',
    nome: 'Base',
    resumo: 'Piloto valida o produto e a parceria com um sistema de caixa abre o canal.',
    lojasFimAno: [80, 400, 1000, 1900, 3000],
    equipe: [120_000, 280_000, 420_000, 640_000, 900_000],
    administrativo: [24_000, 36_000, 54_000, 80_000, 110_000],
    multiploReceita: 4,
  },
  otimista: {
    id: 'otimista',
    nome: 'Otimista',
    resumo: 'Expansão para outras capitais a partir do ano 3.',
    lojasFimAno: [100, 600, 1600, 3200, 5000],
    equipe: [120_000, 320_000, 560_000, 900_000, 1_300_000],
    administrativo: [24_000, 40_000, 70_000, 110_000, 150_000],
    multiploReceita: 5,
  },
};

export const CENARIO_PADRAO = 'base';

// ---------------------------------------------------------------------------
// Simulador do dono do mercadinho (valores iniciais dos controles)
// ---------------------------------------------------------------------------
export const MERCADINHO = {
  faturamentoMensal: 80_000, // minimercado de 1 a 3 caixas
  margemBruta: 0.22, // margem bruta média do pequeno varejo alimentar
  margemLiquida: 0.04, // lucro líquido sobre o faturamento
  fatiaAbaixoDoMercado: 0.2, // parte do faturamento em itens vendidos abaixo da faixa da região
  ajustePreco: 0.03, // aumento médio aplicado nesses itens
  perdaVolume: 0.01, // vendas perdidas nesses itens por causa do aumento
  plano: 'essencial',
};
