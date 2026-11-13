// Combos e promoções a partir dos cupons de venda da própria loja.
//
// Técnica: análise de cesta de compras com regras de associação entre pares de produtos,
// calculadas separadamente para cada dia da semana e período do dia (e para a semana toda).
//
// Para cada par A + B (A é o produto que mais aparece, o que puxa a venda) e cada momento:
//   - de quem leva A, quantos levam B                         → taxa com A    (confiança)
//   - dos outros cupons do mesmo momento, quantos levam B     → taxa sem A
//   - quantas vezes mais                                       → razão         (≈ lift)
//   - é por acaso? teste exato de Fisher (unilateral), com correção de Benjamini-Hochberg porque
//     muitos pares são testados ao mesmo tempo (sem ela, sempre aparece algum padrão falso).
// Depois, para cada par aprovado, o motor procura a janela de calendário (um horário, um dia,
// todas as manhãs, fim de semana...) que melhor separa o padrão do resto da semana; se nenhuma
// se destaca, o combo vale a semana toda.
//
// Com o volume de um minimercado (cerca de 100 cupons por dia), contar pares é suficiente:
// algoritmos como Apriori ou FP-Growth só seriam necessários para combos de três ou mais itens.
import { DIAS, momentoDe, PERIODOS } from './cupons.js';
import { arredondarPreco, deducoesSobrePreco, margemReal, precoMinimo } from './precificacao.js';

export const OPCOES_PADRAO = {
  minCupons: 20, // o par precisa aparecer junto em pelo menos 20 cupons no momento
  minTaxa: 0.25, // pelo menos 25% de quem leva A leva B
  minRazao: 1.5, // e 1,5 vez mais que nos outros cupons do mesmo momento
  fdr: 0.05, // até 5% de padrões falsos entre os aprovados
  gTempo: 10.83, // exigência para dizer que o padrão é de um horário específico (p < 0,001)
  desconto: 0.1, // desconto de partida no produto que a promoção quer empurrar
};

const TODOS = 'todos';

export const vendidoPorKg = (produto) => Boolean(produto?.nome && /,\s*kg$/i.test(produto.nome.trim()));

// "Salgadinho de milho, 120 g" → "salgadinho de milho", para caber numa frase
export function nomeNaFrase(nome) {
  const n = nome.split(',')[0].trim();
  return n.charAt(0).toLowerCase() + n.slice(1);
}
export const idMomento = (dia, periodo) => `${dia}-${periodo}`;

// log do fatorial, tabelado
function tabelaLogFatorial(n) {
  const t = new Float64Array(n + 1);
  for (let i = 2; i <= n; i++) t[i] = t[i - 1] + Math.log(i);
  return t;
}

// P(X ≥ x) para X hipergeométrica: N cupons, K com B, n com A. É o teste exato de Fisher unilateral.
function caudaHipergeometrica(lf, N, K, n, x) {
  const lnC = (a, b) => lf[a] - lf[b] - lf[a - b];
  const base = lnC(N, n);
  let p = 0;
  for (let k = x; k <= Math.min(K, n); k++) p += Math.exp(lnC(K, k) + lnC(N - K, n - k) - base);
  return Math.min(1, p);
}

// Benjamini-Hochberg: devolve o maior p-valor aprovado (ou -1 se nenhum).
function corteBH(pvalores, q) {
  const ord = [...pvalores].sort((a, b) => a - b);
  let corte = -1;
  ord.forEach((p, i) => {
    if (p <= ((i + 1) / ord.length) * q) corte = p;
  });
  return corte;
}

// Conta cupons, produtos e pares por momento (21 momentos + a semana toda).
function contar(cupons) {
  const n = new Map();
  const itens = new Map();
  const pares = new Map();
  const soma = (mapa, k) => mapa.set(k, (mapa.get(k) ?? 0) + 1);
  for (const c of cupons) {
    const { dia, periodo } = momentoDe(c.emissao);
    const momentos = [idMomento(dia, periodo), TODOS];
    const unicos = [...new Set(c.itens.map((i) => i.chave))].sort();
    for (const m of momentos) {
      soma(n, m);
      for (const a of unicos) soma(itens, `${m}|${a}`);
      for (let i = 0; i < unicos.length; i++) {
        for (let j = i + 1; j < unicos.length; j++) soma(pares, `${m}|${unicos[i]}|${unicos[j]}`);
      }
    }
  }
  return { n, itens, pares };
}

const semanasDe = (cupons) => {
  const datas = new Set(cupons.map((c) => c.emissao.slice(0, 10)));
  return Math.max(1, datas.size / 7);
};

// Janelas de calendário em que um combo pode valer. O motor testa todas e fica com a que
// melhor separa o padrão do resto da semana; assim o resultado sai em termos que o lojista
// usa ("terça à tarde", "todas as manhãs", "fim de semana"), e não numa lista de horários.
const SEMANA = [1, 2, 3, 4, 5, 6, 0];
const UTEIS = [1, 2, 3, 4, 5];
const FDS = [6, 0];
const nomeDia = (d) => DIAS[d][0].toUpperCase() + DIAS[d].slice(1);
const artigo = (d) => (d === 6 || d === 0 ? 'no' : 'na');
const momentosDe = (dias, periodos) => dias.flatMap((d) => periodos.map((p) => idMomento(d, p)));

export function janelasCandidatas() {
  const todos = PERIODOS.map((p) => p.id);
  const janelas = [];
  for (const d of SEMANA) {
    for (const p of PERIODOS) {
      janelas.push({ tipo: 'momento', momentos: momentosDe([d], [p.id]), texto: `${nomeDia(d)} ${p.quando}`, frase: `${artigo(d)} ${DIAS[d]} ${p.quando}` });
    }
    janelas.push({ tipo: 'dia', momentos: momentosDe([d], todos), texto: `${nomeDia(d)}, o dia todo`, frase: `${artigo(d)} ${DIAS[d]}` });
  }
  for (const p of PERIODOS) {
    janelas.push({ tipo: 'periodo', momentos: momentosDe(SEMANA, [p.id]), texto: `Todos os dias ${p.quando}`, frase: `toda ${p.rotulo}` });
    janelas.push({ tipo: 'uteis', momentos: momentosDe(UTEIS, [p.id]), texto: `De segunda a sexta ${p.quando}`, frase: `de segunda a sexta ${p.quando}` });
    janelas.push({ tipo: 'fds', momentos: momentosDe(FDS, [p.id]), texto: `Fim de semana ${p.quando}`, frase: `no fim de semana ${p.quando}` });
  }
  janelas.push({ tipo: 'fds', momentos: momentosDe(FDS, todos), texto: 'Fim de semana', frase: 'no fim de semana' });
  return janelas;
}

export const JANELA_SEMANA = { tipo: 'semana', momentos: [], texto: 'A semana toda', frase: 'em qualquer dia' };

export function descreverJanela(janela) {
  return janela.texto ?? JANELA_SEMANA.texto;
}

// Estatística G (razão de verossimilhança) de uma tabela 2×2: mede quanto a taxa de B entre os
// cupons com A muda dentro e fora da janela. Não estoura para valores muito significativos, ao
// contrário do p-valor, então serve para comparar janelas. G ≥ 10,83 equivale a p < 0,001.
function estatisticaG(a, b, c, d) {
  const n = a + b + c + d;
  const termo = (o, e) => (o > 0 ? o * Math.log(o / e) : 0);
  const l1 = a + b;
  const l2 = c + d;
  const c1 = a + c;
  const c2 = b + d;
  if (!l1 || !l2 || !c1 || !c2) return 0;
  return 2 * (termo(a, (l1 * c1) / n) + termo(b, (l1 * c2) / n) + termo(c, (l2 * c1) / n) + termo(d, (l2 * c2) / n));
}

// Preço da promoção. Produto vendido a quilo vira "desconto no complemento para quem leva A";
// os demais viram "leve os dois por R$ X". A margem nunca fica abaixo da margem mínima da loja.
export function precificarCombo(a, b, cfg, desconto = OPCOES_PADRAO.desconto) {
  if (!a?.preco || !b?.preco) return null;
  if (vendidoPorKg(a) || vendidoPorKg(b)) {
    const minimo = b.custo > 0 ? precoMinimo(b.custo, cfg, cfg.margemMinima) : 0;
    let preco = arredondarPreco(b.preco * (1 - desconto), cfg.finais, 'baixo');
    if (preco < minimo) preco = arredondarPreco(minimo, cfg.finais, 'cima');
    if (preco >= b.preco - 0.05) return { tipo: 'vitrine', viavel: false };
    return {
      tipo: 'complemento',
      viavel: true,
      precoOriginal: b.preco,
      preco,
      economia: b.preco - preco,
      margem: b.custo > 0 ? margemReal(preco, b.custo, cfg) : null,
    };
  }
  const soma = a.preco + b.preco;
  const custo = (a.custo ?? 0) + (b.custo ?? 0);
  const minimo = custo > 0 ? precoMinimo(custo, cfg, cfg.margemMinima) : 0;
  let preco = arredondarPreco(soma - b.preco * desconto, cfg.finais, 'baixo');
  if (preco < minimo) preco = arredondarPreco(minimo, cfg.finais, 'cima');
  if (preco >= soma - 0.05) return { tipo: 'vitrine', viavel: false };
  return {
    tipo: 'kit',
    viavel: true,
    precoOriginal: soma,
    preco,
    economia: soma - preco,
    margem: custo > 0 ? (preco * (1 - deducoesSobrePreco(cfg)) - custo * (1 + cfg.perdas)) / preco : null,
  };
}

// Sugestões de combo. `produtoDe(chaveDoItem)` devolve o produto do catálogo (ou null).
export function analisarCombos(cupons, { produtoDe = () => null, cfg, opcoes = {} } = {}) {
  const o = { ...OPCOES_PADRAO, ...opcoes };
  if (cupons.length === 0) return { sugestoes: [], cupons: 0, semanas: 0, testados: 0 };
  const { n, itens, pares } = contar(cupons);
  const lf = tabelaLogFatorial(cupons.length + 1);
  const semanas = semanasDe(cupons);

  // 1. candidatos: par × momento com volume e força mínimos
  const candidatos = [];
  for (const [chave, nab] of pares) {
    if (nab < o.minCupons) continue;
    const [m, x, y] = chave.split('|');
    const nx = itens.get(`${m}|${x}`);
    const ny = itens.get(`${m}|${y}`);
    // A = o que mais aparece (puxa a venda); B = o complemento que a promoção empurra
    const [a, b, na, nb] = nx >= ny ? [x, y, nx, ny] : [y, x, ny, nx];
    const N = n.get(m);
    const taxaCom = nab / na;
    const taxaSem = N > na ? (nb - nab) / (N - na) : 0;
    const razao = taxaSem > 0 ? taxaCom / taxaSem : Infinity;
    if (taxaCom < o.minTaxa || razao < o.minRazao) continue;
    candidatos.push({ momento: m, a, b, N, na, nb, nab, taxaCom, taxaSem, razao, p: caudaHipergeometrica(lf, N, nb, na, nab) });
  }

  // 2. controle de padrões falsos entre todos os testes
  const corte = corteBH(candidatos.map((c) => c.p), o.fdr);
  const aprovados = candidatos.filter((c) => c.p <= corte);

  // 3. por par, o melhor momento e se o padrão é daquele horário ou da semana toda
  const porPar = new Map();
  for (const c of aprovados) {
    const k = `${c.a}|${c.b}`;
    porPar.set(k, [...(porPar.get(k) ?? []), c]);
  }

  const sugestoes = [];
  for (const [k, lista] of porPar) {
    const [a, b] = k.split('|');
    const par = [a, b].sort().join('|');
    // números do par somados num conjunto de momentos
    const estat = (momentos) => {
      const soma = (f) => momentos.reduce((s, m) => s + (f(m) ?? 0), 0);
      const N = soma((m) => n.get(m));
      const na = soma((m) => itens.get(`${m}|${a}`));
      const nb = soma((m) => itens.get(`${m}|${b}`));
      const nab = soma((m) => pares.get(`${m}|${par}`));
      const taxaCom = na ? nab / na : 0;
      const taxaSem = N > na ? (nb - nab) / (N - na) : 0;
      return { N, na, nb, nab, taxaCom, taxaSem, razao: taxaSem > 0 ? taxaCom / taxaSem : Infinity };
    };
    const especificos = lista.filter((c) => c.momento !== TODOS).sort((x, y) => y.taxaCom - x.taxaCom);

    // taxa B|A em cada um dos 21 momentos (mapa de calor)
    const mapa = [];
    for (let dia = 0; dia < 7; dia++) {
      for (const per of PERIODOS) {
        const m = idMomento(dia, per.id);
        const na = itens.get(`${m}|${a}`) ?? 0;
        const nab = pares.get(`${m}|${par}`) ?? 0;
        mapa.push({ dia, periodo: per.id, cuponsComA: na, juntos: nab, taxa: na ? nab / na : null });
      }
    }

    // a janela de calendário que melhor separa o padrão do resto da semana
    const todos = estat([TODOS]);
    let janela = JANELA_SEMANA;
    let dentro = todos;
    let fora = null;
    let melhorG = o.gTempo;
    if (especificos.length) {
      for (const j of janelasCandidatas()) {
        const d = estat(j.momentos);
        if (d.nab < o.minCupons || d.na >= todos.na) continue;
        const naFora = todos.na - d.na;
        const nabFora = todos.nab - d.nab;
        const taxaFora = nabFora / naFora;
        if (d.taxaCom < taxaFora * 1.3) continue;
        const g = estatisticaG(d.nab, d.na - d.nab, nabFora, naFora - nabFora);
        if (g > melhorG) {
          melhorG = g;
          janela = j;
          dentro = d;
          fora = { taxa: taxaFora, cuponsComA: naFora };
        }
      }
    }
    // padrão "da semana toda" só vale se ele também passou no teste com todos os cupons
    if (janela.tipo === 'semana' && !lista.some((c) => c.momento === TODOS)) continue;

    const pa = produtoDe(a);
    const pb = produtoDe(b);
    sugestoes.push({
      id: `${a}|${b}`,
      a: { chave: a, nome: pa?.nome ?? a, produto: pa },
      b: { chave: b, nome: pb?.nome ?? b, produto: pb },
      janela: { tipo: janela.tipo, momentos: janela.momentos },
      quando: janela.texto,
      quandoFrase: janela.frase,
      taxaCom: dentro.taxaCom,
      taxaSem: dentro.taxaSem,
      razao: dentro.razao,
      juntos: dentro.nab,
      cuponsComA: dentro.na,
      fora,
      // clientes por semana que levam A no momento e não levam B: o público da promoção
      oportunidadeSemana: (dentro.na - dentro.nab) / semanas,
      p: Math.min(...lista.map((c) => c.p)),
      mapa,
      preco: pa && pb && cfg ? precificarCombo(pa, pb, cfg, o.desconto) : null,
    });
  }

  // padrões com dia e horário primeiro (são os que viram promoção), depois os da semana toda
  sugestoes.sort((x, y) => (y.janela.tipo !== 'semana') - (x.janela.tipo !== 'semana') || y.oportunidadeSemana - x.oportunidadeSemana);
  return { sugestoes, cupons: cupons.length, semanas, testados: candidatos.length };
}

// Mede um combo ativo: a taxa B|A na janela antes e depois de criado.
export function medirCombo(cupons, combo) {
  const naJanela = (c) => {
    if (combo.janela.tipo === 'semana') return true;
    const { dia, periodo } = momentoDe(c.emissao);
    return combo.janela.momentos.includes(idMomento(dia, periodo));
  };
  const inicio = combo.criadoEm.slice(0, 16);
  const conta = (lista) => {
    let na = 0;
    let nab = 0;
    for (const c of lista) {
      if (!naJanela(c)) continue;
      const chaves = new Set(c.itens.map((i) => i.chave));
      if (!chaves.has(combo.a)) continue;
      na += 1;
      if (chaves.has(combo.b)) nab += 1;
    }
    return { na, nab, taxa: na ? nab / na : null };
  };
  return {
    antes: conta(cupons.filter((c) => c.emissao < inicio)),
    depois: conta(cupons.filter((c) => c.emissao >= inicio)),
  };
}
