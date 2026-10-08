// Textos e dados de apoio do site. Os números de mercado e da análise da ANP
// vêm da 1ª entrega do projeto (relatório) e do deck de planejamento estratégico.

export const PROMESSA =
  'Em uma semana, mostrar ao dono do mercadinho quais produtos ele vende fora do preço da região e quanto isso custa por mês.';

export const TAGLINE = 'A inteligência de preço das grandes redes no bolso do mercado de bairro.';

// ---------------------------------------------------------------------------
// O problema: análise dos dados públicos da ANP (gás de cozinha, botijão 13 kg)
// ---------------------------------------------------------------------------
export const PROBLEMA_NUMEROS = [
  { valor: '23.880', rotulo: 'preços de gás de cozinha coletados', detalhe: '882 revendas em 101 cidades paulistas' },
  { valor: '16,6%', rotulo: 'de diferença típica na mesma cidade', detalhe: 'mediana de 2.658 combinações de cidade e semana' },
  { valor: 'R$ 17,00', rotulo: 'de diferença no mesmo botijão', detalhe: 'entre a revenda mais barata e a mais cara' },
  { valor: '57,9%', rotulo: 'no caso mais extremo', detalhe: 'Sumaré, 1 a 7 de junho de 2026' },
];

export const CASO_EXTREMO = {
  cidade: 'Sumaré',
  periodo: '1 a 7 de junho de 2026',
  menor: 94.99,
  maior: 150.0,
  revendas: 9,
};

// Os 12 municípios com mais coletas (Tabela da seção 5.7 do relatório)
export const CIDADES = [
  { cidade: 'São Paulo', coletas: 1420, mediana: 115.0, min: 94.99, max: 149.99 },
  { cidade: 'São José do Rio Preto', coletas: 704, mediana: 120.0, min: 104.0, max: 145.0 },
  { cidade: 'São José dos Campos', coletas: 523, mediana: 100.0, min: 79.99, max: 125.0 },
  { cidade: 'Araçatuba', coletas: 511, mediana: 104.99, min: 95.0, max: 116.0 },
  { cidade: 'Sorocaba', coletas: 492, mediana: 119.99, min: 100.0, max: 135.0 },
  { cidade: 'São Carlos', coletas: 437, mediana: 132.0, min: 115.0, max: 140.0 },
  { cidade: 'Presidente Prudente', coletas: 416, mediana: 116.5, min: 94.9, max: 128.0 },
  { cidade: 'Osasco', coletas: 414, mediana: 109.99, min: 94.99, max: 124.99 },
  { cidade: 'Guarulhos', coletas: 411, mediana: 109.99, min: 88.99, max: 125.0 },
  { cidade: 'Campinas', coletas: 406, mediana: 114.99, min: 99.99, max: 129.99 },
  { cidade: 'Franca', coletas: 380, mediana: 115.0, min: 104.9, max: 129.0 },
  { cidade: 'Araraquara', coletas: 379, mediana: 118.8, min: 100.0, max: 132.0 },
];

export const ACHADOS = [
  {
    titulo: 'O preço é escolhido, não calculado',
    texto:
      'Os preços se amontoam em números redondos: R$ 100, R$ 105, R$ 110, R$ 115. O valor mais comum é R$ 110,00. Quase ninguém cobra R$ 113,40, que é o tipo de valor de quem parte do custo e aplica uma margem.',
  },
  {
    titulo: 'A diferença não some com o tempo',
    texto:
      'O preço mediano mudou só uma vez em oito meses, de R$ 110 para R$ 115. A distância entre a revenda mais barata e a mais cara ficou do mesmo tamanho do começo ao fim. É uma característica do mercado, não um desajuste passageiro.',
  },
  {
    titulo: 'O fornecedor não explica a diferença',
    texto:
      'As três maiores distribuidoras somam 64,6% das coletas. Quem compra do mesmo lugar tem custo parecido. Se o preço final varia tanto, a diferença vem da decisão de cada comerciante.',
  },
  {
    titulo: 'Ninguém publica o custo',
    texto:
      'A coluna de preço de compra está vazia em 100% dos registros da ANP. Se nem a agência reguladora tem esse número, o dono do mercadinho também não tem. Por isso o custo vem do sistema de caixa e das notas fiscais do próprio cliente.',
  },
];

export const POR_QUE_GAS =
  'Usamos o gás de cozinha como referência porque São Paulo não publica os preços da nota fiscal do varejo. O botijão é um produto idêntico em qualquer lugar e é vendido por revendas de bairro, o mesmo perfil do nosso cliente. É o comércio de proximidade com o melhor dado aberto do país.';

// ---------------------------------------------------------------------------
// Perfil do cliente (Value Proposition Design)
// ---------------------------------------------------------------------------
export const CLIENTE = {
  quem: 'Dono de minimercado ou mercearia de bairro, com 1 a 3 caixas, em São Paulo.',
  tarefas: [
    'Revisar o preço de centenas de itens toda semana',
    'Repassar aumento do fornecedor sem espantar cliente',
    'Montar o encarte da semana',
    'Girar estoque parado antes de vencer',
  ],
  dores: [
    'Não sabe o preço do concorrente sem ir até lá',
    'O custo real esconde imposto, cartão e perda',
    'Vende itens no vermelho sem perceber',
    'Revisar preço na mão consome noites',
  ],
  ganhos: [
    'Mais margem sem perder movimento',
    'Descobrir rápido onde vaza dinheiro',
    'Encarte que atrai sem destruir o lucro',
    'Negociar com fornecedor com dado na mão',
  ],
};

// ---------------------------------------------------------------------------
// A solução
// ---------------------------------------------------------------------------
export const MAPA_DE_VALOR = [
  { dor: 'Não sabe o preço do concorrente', recurso: 'Painel do preço praticado na região, sem sair da loja' },
  { dor: 'O custo real esconde imposto e taxas', recurso: 'Cálculo do custo real e do preço mínimo que não dá prejuízo' },
  { dor: 'Vende no vermelho sem perceber', recurso: 'Alerta semanal dos itens fora da faixa de mercado' },
  { dor: 'Revisar preço consome noites', recurso: 'Sugestão em número redondo, pronta para a etiqueta' },
];

export const PASSOS = [
  {
    titulo: 'Conectamos o caixa',
    texto: 'Ligamos a plataforma ao sistema de caixa da loja ou importamos os arquivos das notas fiscais.',
  },
  {
    titulo: 'Os dados entram sozinhos',
    texto: 'Catálogo, custo de compra e histórico de vendas chegam pela integração. O dono não digita nada.',
  },
  {
    titulo: 'Diagnóstico em até 7 dias',
    texto: 'A loja recebe a lista de itens fora do preço da região e quanto cada um custa por mês.',
  },
];

// Exemplo ilustrativo do diagnóstico. Preços de supermercado são fictícios;
// a linha do botijão usa a faixa real da cidade de São Paulo (ANP, 2026).
export const DIAGNOSTICO_EXEMPLO = [
  { produto: 'Arroz tipo 1, 5 kg', seu: 24.9, min: 26.5, mediana: 28.9, max: 32.9, sugestao: 27.9, unidadesMes: 60 },
  { produto: 'Botijão de gás, 13 kg', seu: 92.0, min: 94.99, mediana: 115.0, max: 149.99, sugestao: 104.99, unidadesMes: 12, real: true },
  { produto: 'Feijão carioca, 1 kg', seu: 6.99, min: 7.49, mediana: 8.49, max: 9.49, sugestao: 7.99, unidadesMes: 75 },
  { produto: 'Óleo de soja, 900 ml', seu: 6.49, min: 6.79, mediana: 7.49, max: 8.29, sugestao: 6.99, unidadesMes: 140 },
  { produto: 'Leite integral, 1 L', seu: 5.49, min: 5.29, mediana: 5.69, max: 6.19, sugestao: null, unidadesMes: 300 },
  { produto: 'Café torrado, 500 g', seu: 32.9, min: 27.9, mediana: 29.9, max: 31.9, sugestao: 29.9, unidadesMes: 40 },
];

// Matriz BCG dos módulos do produto
export const MODULOS = [
  {
    quadrante: 'Estrela',
    nome: 'Painel de preço da região',
    texto: 'É a razão pela qual o cliente assina. Mercado em expansão e adesão alta. Recebe a maior parte do investimento.',
  },
  {
    quadrante: 'Interrogação',
    nome: 'Recomendação automática e previsão sazonal',
    texto: 'A parte mais inovadora e mais incerta. Precisa de validação com cliente real antes de virar aposta principal.',
  },
  {
    quadrante: 'Vaca leiteira',
    nome: 'Cálculo de custo real e preço mínimo',
    texto: 'Estável, barata de manter e segura o cliente na base. Sustenta a receita recorrente.',
  },
  {
    quadrante: 'Abacaxi',
    nome: 'Relatórios e exportações avançadas',
    texto: 'Muito pedido, pouco usado e caro de manter. Deve ser automatizado ao máximo ou deixado para depois.',
  },
];

// ---------------------------------------------------------------------------
// A empresa
// ---------------------------------------------------------------------------
export const BLOCOS_MODELO = [
  {
    titulo: 'Segmento de clientes',
    texto:
      'Minimercados e mercearias de bairro com 1 a 3 caixas, em São Paulo. Começamos por quem já emite nota fiscal eletrônica e usa algum sistema de caixa.',
  },
  {
    titulo: 'Proposta de valor',
    texto:
      'Preço da região, custo real e margem em um só lugar, com ajuste em minutos e justificativa em uma linha. O resultado é medido em reais recuperados.',
  },
  {
    titulo: 'Fontes de receita',
    texto:
      'Assinatura mensal por loja, a partir de R$ 79, em faixas por quantidade de itens. Plano gratuito como porta de entrada e taxa opcional sobre a margem recuperada.',
  },
  {
    titulo: 'Estrutura de custos',
    texto:
      'Infraestrutura de dados, equipe de desenvolvimento e visita em campo para conquistar as primeiras lojas. Produto 100% digital, sem estoque nem logística.',
  },
];

export const TRES_PERGUNTAS = [
  { pergunta: 'Desejabilidade', resposta: 'O mercado quer', prova: '16,6% de diferença medida em dado público' },
  { pergunta: 'Praticabilidade', resposta: 'Conseguimos construir', prova: 'Dados abertos + integração com o caixa' },
  { pergunta: 'Viabilidade', resposta: 'A conta fecha', prova: 'Assinatura recorrente e custo de operação baixo' },
];

// Responsabilidades conforme a 1ª entrega do projeto
export const EQUIPE = [
  { nome: 'Ana Luiza Ribeiro do Vale', papel: 'Coleta e carregamento dos dados' },
  { nome: 'Gustavo Silva de Moura', papel: 'Dicionário de dados e classificação das variáveis' },
  { nome: 'Henri Seixas Souza', papel: 'Análise exploratória e gráficos' },
  { nome: 'Matheus Fernandes Moraes', papel: 'Redação e interpretação dos resultados' },
];

// ---------------------------------------------------------------------------
// Mercado e concorrência
// ---------------------------------------------------------------------------
export const MERCADO = [
  {
    valor: '439.728',
    rotulo: 'lojas no varejo alimentar brasileiro',
    fonte: 'Ranking ABRAS 2025',
    url: 'https://centraldovarejo.com.br/maiores-redes-de-mercado-do-brasil-ranking-abras-2025-lista-lideres-do-varejo-alimentar/',
  },
  {
    valor: '26.965',
    rotulo: 'estabelecimentos supermercadistas no estado de SP, 65% deles micro e pequenos',
    fonte: 'Sebrae-SP',
    url: 'https://meuatendimento.sebrae.com.br/Sebrae/Portal%20Sebrae/UFs/SP/Pesquisas/minimercado_mercearia.pdf',
  },
  {
    valor: '162 por dia',
    rotulo: 'novos minimercados e mercearias abertos no Brasil no 1º semestre de 2025',
    fonte: 'Agência Sebrae',
    url: 'https://agenciasebrae.com.br/economia-e-politica/mais-de-160-mercadinhos-sao-abertos-por-dia-no-brasil/',
  },
];

export const LOJAS_BRASIL = 439_728;

// Mapas de posicionamento perceptual (posições do deck; x e y de 0 a 100)
export const MAPAS = [
  {
    id: 'preco',
    titulo: 'Preço × profundidade',
    eixoX: ['barato', 'caro'],
    eixoY: ['simples', 'profunda'],
    descricao: 'Preço da ferramenta × profundidade da análise',
    pontos: [
      { nome: 'Planilha', x: 10, y: 12 },
      { nome: 'Módulo de ERP', x: 34, y: 34 },
      { nome: 'Precifica', x: 86, y: 80 },
      { nome: 'Predify', x: 72, y: 90 },
      { nome: 'Preço Inteligente', x: 20, y: 72, nos: true },
    ],
  },
  {
    id: 'uso',
    titulo: 'Implantação × uso',
    eixoX: ['rápida', 'demorada'],
    eixoY: ['difícil', 'fácil'],
    descricao: 'Tempo de implantação × facilidade de uso no dia a dia',
    pontos: [
      { nome: 'Planilha', x: 22, y: 20 },
      { nome: 'Módulo de ERP', x: 52, y: 60 },
      { nome: 'Precifica', x: 88, y: 74 },
      { nome: 'InfoPrice', x: 76, y: 34 },
      { nome: 'Preço Inteligente', x: 16, y: 84, nos: true },
    ],
  },
  {
    id: 'foco',
    titulo: 'Foco × porte',
    eixoX: ['generalista', 'especializada'],
    eixoY: ['loja pequena', 'rede grande'],
    descricao: 'Foco da solução × porte do cliente atendido',
    pontos: [
      { nome: 'Planilha', x: 12, y: 14 },
      { nome: 'Módulo de ERP', x: 22, y: 42 },
      { nome: 'Precifica', x: 44, y: 86 },
      { nome: 'Predify', x: 34, y: 76 },
      { nome: 'Preço Inteligente', x: 88, y: 16, nos: true },
    ],
  },
];

export const SWOT = {
  forcas: [
    'Base própria de preços por região, montada de dados públicos',
    'Produto digital, custo de operação baixo',
    'Equipe com domínio de dados e desenvolvimento',
    'Nicho definido e pouco disputado',
  ],
  fraquezas: [
    'Marca inexistente e nenhum cliente ainda',
    'Depende de integração com sistemas que ainda não temos',
    'Custo de compra não é público, precisa vir do dono',
    'Equipe pequena, sem time comercial',
  ],
  oportunidades: [
    'Diferença de 16,6% comprovada e sem solução para o pequeno',
    'Avanço da nota fiscal eletrônica e dos sistemas de caixa',
    'Ferramentas atuais miram médio porte e e-commerce',
    'Distribuidores e associações como canal de indicação',
  ],
  ameacas: [
    'Sistemas de gestão podem embutir um módulo de preço',
    'Precifica, Predify e InfoPrice descendo de faixa',
    'Baixa disposição a pagar no pequeno varejo',
    'Resistência do dono, que confia na intuição',
  ],
};

export const ESTRATEGIAS = [
  {
    nome: 'Atacar',
    cruzamento: 'Forças + Oportunidades',
    texto:
      'Entrar em São Paulo usando a evidência de 16,6% como argumento de venda, num nicho que nenhum concorrente atende hoje. Dá para começar sem cliente, porque o dado de preço já é público.',
  },
  {
    nome: 'Defender',
    cruzamento: 'Forças + Ameaças',
    texto:
      'Custo baixo e foco em um nicho só permitem um preço que o concorrente grande não acompanha sem canibalizar o próprio produto. Especialização é a barreira.',
  },
  {
    nome: 'Reforçar',
    cruzamento: 'Fraquezas + Oportunidades',
    texto:
      'Fechar parceria com um sistema de gestão do varejo. Resolve a integração que não temos e entrega canal de distribuição de uma vez, transformando a ameaça em aliado.',
  },
  {
    nome: 'Proteger',
    cruzamento: 'Fraquezas + Ameaças',
    texto:
      'Plano gratuito de consulta de preço para derrubar a barreira de entrada e provar valor antes de cobrar, reduzindo o risco de um piloto que não vira assinatura.',
  },
];

// ---------------------------------------------------------------------------
// Riscos para o investidor e como reduzimos cada um
// ---------------------------------------------------------------------------
export const RISCOS = [
  {
    risco: 'A startup não decolar',
    resposta:
      'Piloto de 8 semanas com 5 lojas antes de acelerar os gastos. O dinheiro é liberado em etapas, conforme as metas do piloto forem cumpridas.',
  },
  {
    risco: 'Um sistema de gestão lançar módulo de preço',
    resposta: 'Virar parceiro deles em vez de concorrente: somos o módulo de preço que eles não têm hoje.',
  },
  {
    risco: 'O dono não querer pagar',
    resposta: 'Plano gratuito como porta de entrada e resultado medido em reais. A mensalidade se paga com menos de R$ 3 por dia.',
  },
  {
    risco: 'Dinheiro parado por 5 anos',
    resposta: 'Participação em startup não tem liquidez diária. Por isso o retorno esperado precisa ser bem maior que o do CDI.',
  },
];

// ---------------------------------------------------------------------------
// Plano de ação (5W2H) e resgate da promessa
// ---------------------------------------------------------------------------
// Do ponto de vista do cliente: o que o dono do mercadinho recebe.
export const PLANO_5W2H = [
  {
    sigla: 'What',
    pergunta: 'O quê',
    resposta:
      'Um painel que mostra, item por item, quais produtos estão fora do preço da região e quanto isso custa por mês, com o custo real de cada um e a sugestão de preço pronta para a etiqueta.',
  },
  {
    sigla: 'Why',
    pergunta: 'Por quê',
    resposta:
      'Para recuperar a margem que escapa sem ele perceber: itens vendidos abaixo do custo real ou mais baratos que toda a vizinhança, e itens caros demais que afastam o cliente.',
  },
  {
    sigla: 'Where',
    pergunta: 'Onde',
    resposta:
      'No celular ou no computador do balcão, sem instalar nada. A comparação é com as lojas do próprio bairro e da cidade.',
  },
  {
    sigla: 'When',
    pergunta: 'Quando',
    resposta:
      'O primeiro diagnóstico chega em até 7 dias depois do cadastro, e a lista de ajustes é atualizada toda semana. O custo novo entra assim que a nota do fornecedor é importada.',
  },
  {
    sigla: 'Who',
    pergunta: 'Quem',
    resposta:
      'Donos de minimercados e mercearias de bairro, com 1 a 3 caixas e margem de lucro possivelmente apertada, que definem o preço sem saber quanto o vizinho cobra.',
  },
  {
    sigla: 'How',
    pergunta: 'Como',
    resposta:
      'Cadastra a loja pelo CNPJ, importa o XML da nota do fornecedor e o custo entra sozinho. Recebe as sugestões, aplica com um clique e imprime as etiquetas novas.',
  },
  {
    sigla: 'How much',
    pergunta: 'Quanto',
    resposta:
      'Grátis para consultar até 20 itens; R$ 79 por mês no plano Essencial e R$ 149 no Completo, sem instalação e sem fidelidade. Na loja típica, o ganho estimado é de R$ 440 por mês.',
  },
];

export const MARCOS = [
  { quando: 'Fim do semestre', titulo: 'Versão inicial no ar', texto: 'Painel de preço da região e cálculo do preço mínimo.' },
  { quando: '+ 8 semanas', titulo: 'Piloto com 5 lojas', texto: 'Medir quanto de margem o dado recupera na prática.' },
  { quando: 'Ano 1', titulo: 'Primeiras lojas pagantes', texto: 'Venda em campo na Grande São Paulo.' },
  { quando: 'Ano 2', titulo: 'Parceria com sistema de caixa', texto: 'Integração pronta e novo canal de distribuição.' },
  { quando: 'Ano 4', titulo: 'Empresa no lucro', texto: 'Receita recorrente passa a cobrir toda a operação.' },
];

export const RESGATE = [
  { titulo: 'O problema', texto: 'medido em 23.880 preços reais: 16,6% de diferença na mesma cidade.' },
  { titulo: 'O encaixe', texto: 'cada dor do cliente tem um recurso da plataforma que responde a ela.' },
  { titulo: 'O modelo', texto: 'assinatura mensal viável, com custo de operação baixo e produto digital.' },
  { titulo: 'O espaço', texto: 'nenhum concorrente entrega análise profunda, barata e simples para loja pequena.' },
  { titulo: 'O plano', texto: 'versão inicial neste semestre e piloto de oito semanas com cinco lojas.' },
];

export const FONTES = [
  {
    nome: 'ANP · Série Histórica de Preços de Combustíveis e GLP (jan a ago de 2026)',
    url: 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/serie-historica-de-precos-de-combustiveis',
  },
  { nome: 'INMET · Dados históricos das estações meteorológicas', url: 'https://portal.inmet.gov.br/dadoshistoricos' },
  ...MERCADO.map((m) => ({ nome: `${m.fonte} · ${m.rotulo}`, url: m.url })),
];
