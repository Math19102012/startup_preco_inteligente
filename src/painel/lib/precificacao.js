// Motor de preço do painel do lojista.
// Funções puras: recebem o produto, a faixa de preço da região e os custos da loja,
// devolvem a situação do item, a sugestão de preço e quanto isso vale por mês.

// Custos da loja que incidem sobre o preço de venda (valores iniciais, o lojista ajusta em "Minha loja").
export const CONFIG_PADRAO = {
  imposto: 0.04, // Simples Nacional, comércio, faixa inicial
  taxaCartao: 0.025, // taxa média da maquininha (débito e crédito)
  fatiaCartao: 0.6, // parte das vendas paga no cartão
  perdas: 0.02, // quebra, validade e furto, sobre o custo de compra
  margemMinima: 0.08, // margem líquida mínima aceitável em cada item
  finais: '49-99', // como arredondar a sugestão: ,49 ou ,99
};

export const FINAIS = [
  { id: '49-99', rotulo: 'R$ x,49 ou x,99', centavos: [0.49, 0.99] },
  { id: '99', rotulo: 'R$ x,99', centavos: [0.99] },
  { id: '90', rotulo: 'R$ x,90', centavos: [0.9] },
  { id: '00', rotulo: 'Reais inteiros', centavos: [0] },
];

const centavos = (v) => Math.round(v * 100) / 100;

// Parte do preço que fica com imposto e maquininha.
export const deducoesSobrePreco = (cfg) => cfg.imposto + cfg.taxaCartao * cfg.fatiaCartao;

// Custo de compra com as perdas embutidas.
export const custoComPerdas = (custo, cfg) => custo * (1 + cfg.perdas);

// Menor preço que entrega a margem pedida (margem 0 = não dá prejuízo).
export function precoMinimo(custo, cfg, margem = 0) {
  const sobra = 1 - deducoesSobrePreco(cfg) - margem;
  return sobra > 0 ? custoComPerdas(custo, cfg) / sobra : Infinity;
}

// Quanto sobra de cada venda, em fração do preço, depois de compra, perdas, imposto e cartão.
export function margemReal(preco, custo, cfg) {
  if (!preco) return 0;
  return (preco * (1 - deducoesSobrePreco(cfg)) - custoComPerdas(custo, cfg)) / preco;
}

// Decomposição do custo real de uma unidade vendida a `preco`.
export function custoReal(custo, preco, cfg) {
  const perdas = custo * cfg.perdas;
  const impostos = preco * cfg.imposto;
  const cartao = preco * cfg.taxaCartao * cfg.fatiaCartao;
  const total = custo + perdas + impostos + cartao;
  return { compra: custo, perdas, impostos, cartao, total, lucro: preco - total };
}

// Arredonda para um preço "de etiqueta". direcao: 'cima' | 'baixo' | 'perto'.
export function arredondarPreco(valor, finais = CONFIG_PADRAO.finais, direcao = 'cima') {
  const opcao = FINAIS.find((f) => f.id === finais) ?? FINAIS[0];
  const base = Math.floor(valor);
  const candidatos = [];
  for (let r = base - 1; r <= base + 1; r++) {
    for (const c of opcao.centavos) {
      const v = centavos(r + c);
      if (v > 0) candidatos.push(v);
    }
  }
  candidatos.sort((a, b) => a - b);
  const alvo = centavos(valor);
  if (direcao === 'baixo') return candidatos.filter((c) => c <= alvo).at(-1) ?? candidatos[0];
  if (direcao === 'perto') {
    return candidatos.reduce((melhor, c) => (Math.abs(c - alvo) < Math.abs(melhor - alvo) ? c : melhor));
  }
  return candidatos.find((c) => c >= alvo) ?? candidatos.at(-1);
}

export const STATUS = {
  prejuizo: { rotulo: 'Vende no prejuízo', curto: 'No prejuízo', icone: 'alerta', ordem: 0 },
  abaixo: { rotulo: 'Abaixo da região', curto: 'Abaixo', icone: 'descer', ordem: 1 },
  acima: { rotulo: 'Acima da região', curto: 'Acima', icone: 'subir', ordem: 2 },
  faixa: { rotulo: 'Na faixa', curto: 'Na faixa', icone: 'igual', ordem: 3 },
  'sem-dado': { rotulo: 'Sem dado da região', curto: 'Sem dado', icone: 'interrogacao', ordem: 4 },
};

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Diagnóstico de um produto.
// produto: { custo, preco, vendasMes }  ·  faixa: { min, mediana, max } ou null  ·  cfg: CONFIG_PADRAO
export function diagnosticar(produto, faixa, cfg = CONFIG_PADRAO) {
  const { custo, preco, vendasMes = 0 } = produto;
  const temCusto = custo > 0;
  const semPrejuizo = temCusto ? precoMinimo(custo, cfg, 0) : 0;
  const comMargem = temCusto ? precoMinimo(custo, cfg, cfg.margemMinima) : 0;

  let status;
  if (temCusto && preco < semPrejuizo - 0.005) status = 'prejuizo';
  else if (!faixa) status = 'sem-dado';
  else if (preco < faixa.min) status = 'abaixo';
  else if (preco > faixa.max) status = 'acima';
  else status = 'faixa';

  let alvo = null;
  let direcao = 'cima';
  if (status === 'prejuizo') {
    alvo = Math.max(comMargem, faixa ? faixa.min : 0);
  } else if (status === 'abaixo') {
    // sobe até perto do meio da faixa, sem passar da mediana: o cliente não percebe o ajuste
    alvo = Math.max(comMargem, faixa.min + (faixa.mediana - faixa.min) * 0.4);
  } else if (status === 'acima') {
    alvo = Math.max(comMargem, faixa.mediana);
    direcao = 'perto';
  } else if (temCusto && preco < comMargem && (!faixa || comMargem <= faixa.max)) {
    // na faixa (ou sem dado), mas com margem abaixo do mínimo da loja
    alvo = comMargem;
  }

  let sugestao = alvo === null ? null : arredondarPreco(alvo, cfg.finais, direcao);
  if (sugestao !== null && temCusto && sugestao < comMargem) sugestao = arredondarPreco(comMargem, cfg.finais, 'cima');
  if (sugestao !== null && Math.abs(sugestao - preco) < 0.005) sugestao = null;

  const impactoMes = sugestao === null ? 0 : (sugestao - preco) * vendasMes;
  // custo acima do que a região cobra: o problema está na compra, não no preço
  const custoAcimaDaRegiao = Boolean(faixa && temCusto && semPrejuizo > faixa.max);

  let justificativa;
  if (status === 'prejuizo') {
    const real = custoReal(custo, preco, cfg).total;
    justificativa = `Custo real de ${brl(real)} por unidade: a ${brl(preco)} você perde ${brl(real - preco)} em cada venda.`;
  } else if (status === 'abaixo') {
    justificativa = `A região cobra de ${brl(faixa.min)} a ${brl(faixa.max)}. Você está ${brl(faixa.min - preco)} abaixo do mais barato.`;
  } else if (status === 'acima') {
    justificativa = `Você está ${brl(preco - faixa.max)} acima do mais caro da região. O cliente compara e leva o resto da compra junto.`;
  } else if (status === 'faixa') {
    justificativa = `Dentro da faixa da região (${brl(faixa.min)} a ${brl(faixa.max)}).`;
  } else {
    justificativa = 'Ainda não há coleta deste item na sua região. O custo real continua sendo conferido.';
  }
  if (custoAcimaDaRegiao) justificativa += ' Seu custo já passa do preço da região: vale renegociar com o fornecedor.';

  return {
    status,
    sugestao,
    impactoMes,
    precoSemPrejuizo: semPrejuizo,
    precoComMargem: comMargem,
    margemAtual: temCusto ? margemReal(preco, custo, cfg) : null,
    margemNova: temCusto && sugestao !== null ? margemReal(sugestao, custo, cfg) : null,
    custoAcimaDaRegiao,
    justificativa,
  };
}

// Totais do diagnóstico para os cartões da visão geral.
export function resumir(linhas) {
  const contagem = Object.fromEntries(Object.keys(STATUS).map((s) => [s, 0]));
  let recuperavel = 0;
  let ajustes = 0;
  for (const l of linhas) {
    contagem[l.diagnostico.status] += 1;
    if (l.diagnostico.impactoMes > 0) recuperavel += l.diagnostico.impactoMes;
    if (l.diagnostico.sugestao !== null) ajustes += 1;
  }
  return { contagem, recuperavel, ajustes, total: linhas.length };
}
