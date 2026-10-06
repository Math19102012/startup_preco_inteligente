// Estado do painel: dados da loja, custos, catálogo e histórico de ajustes.
// Fica salvo no navegador (localStorage). Na versão com servidor, este é o ponto onde
// as ações viram chamadas à API do Preço Inteligente; as telas não mudam.
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { catalogoDemonstracao, LOJA_DEMONSTRACAO } from '../dados/catalogo.js';
import { CONFIG_PADRAO, diagnosticar, resumir } from '../lib/precificacao.js';
import { faixaDaRegiao } from '../lib/regiao.js';

const CHAVE = 'preco-inteligente:painel:v1';

const VAZIO = { loja: null, config: CONFIG_PADRAO, produtos: [], alteracoes: [], notas: [] };

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo?.loja) return { ...VAZIO, ...salvo, config: { ...CONFIG_PADRAO, ...salvo.config } };
  } catch {
    // armazenamento indisponível ou corrompido: começa do zero
  }
  return VAZIO;
}

const novoId = () => Math.random().toString(36).slice(2, 10);
const agora = () => new Date().toISOString();

function aplicarPrecos(estado, itens, motivo) {
  const porId = new Map(itens.map((i) => [i.id, i.para]));
  const alteracoes = [];
  const produtos = estado.produtos.map((p) => {
    if (!porId.has(p.id)) return p;
    const para = porId.get(p.id);
    if (Math.abs(para - p.preco) < 0.005) return p;
    alteracoes.push({ id: novoId(), produtoId: p.id, nome: p.nome, de: p.preco, para, vendasMes: p.vendasMes, quando: agora(), motivo });
    return { ...p, preco: para, etiquetaPendente: true, atualizadoEm: agora() };
  });
  return { ...estado, produtos, alteracoes: [...alteracoes, ...estado.alteracoes] };
}

function redutor(estado, acao) {
  switch (acao.tipo) {
    case 'entrar-demonstracao':
      return { ...VAZIO, loja: { ...LOJA_DEMONSTRACAO, desde: agora() }, produtos: catalogoDemonstracao() };
    case 'criar-loja':
      return {
        ...VAZIO,
        loja: { plano: 'essencial', caixas: 1, ...acao.loja, demonstracao: false, desde: agora() },
        produtos: acao.comCatalogo ? catalogoDemonstracao() : [],
      };
    case 'atualizar-loja':
      return { ...estado, loja: { ...estado.loja, ...acao.dados } };
    case 'atualizar-config':
      return { ...estado, config: { ...estado.config, ...acao.dados } };
    case 'salvar-produto': {
      const existe = estado.produtos.some((p) => p.id === acao.produto.id);
      if (!existe) return { ...estado, produtos: [{ ...acao.produto, id: acao.produto.id ?? novoId(), atualizadoEm: agora() }, ...estado.produtos] };
      const anterior = estado.produtos.find((p) => p.id === acao.produto.id);
      let novo = { ...estado, produtos: estado.produtos.map((p) => (p.id === acao.produto.id ? { ...p, ...acao.produto, preco: anterior.preco } : p)) };
      // mudança de preço passa pelo mesmo caminho dos ajustes, para entrar no histórico e nas etiquetas
      if (acao.produto.preco !== anterior.preco) novo = aplicarPrecos(novo, [{ id: anterior.id, para: acao.produto.preco }], 'manual');
      return novo;
    }
    case 'remover-produto':
      return { ...estado, produtos: estado.produtos.filter((p) => p.id !== acao.id) };
    case 'aplicar-precos':
      return aplicarPrecos(estado, acao.itens, 'sugestao');
    case 'aplicar-nota': {
      const { nota, decisoes } = acao;
      let produtos = [...estado.produtos];
      let atualizados = 0;
      let criados = 0;
      for (const d of decisoes) {
        if (d.acao === 'atualizar') {
          produtos = produtos.map((p) =>
            p.id === d.produtoId ? { ...p, custoAnterior: p.custo, custo: d.custo, atualizadoEm: agora() } : p,
          );
          atualizados += 1;
        } else if (d.acao === 'criar') {
          produtos = [{ ...d.produto, id: novoId(), origem: 'nota', etiquetaPendente: true, atualizadoEm: agora() }, ...produtos];
          criados += 1;
        }
      }
      const registro = {
        id: novoId(),
        chave: nota.chave,
        numero: nota.numero,
        fornecedor: nota.fornecedor.nome,
        emissao: nota.emissao,
        valorTotal: nota.valorTotal,
        itens: nota.itens.length,
        atualizados,
        criados,
        importadaEm: agora(),
      };
      return { ...estado, produtos, notas: [registro, ...estado.notas] };
    }
    case 'etiquetas-impressas': {
      const ids = new Set(acao.ids);
      return { ...estado, produtos: estado.produtos.map((p) => (ids.has(p.id) ? { ...p, etiquetaPendente: false } : p)) };
    }
    case 'sair':
      return VAZIO;
    default:
      throw new Error(`Ação desconhecida: ${acao.tipo}`);
  }
}

const Contexto = createContext(null);

export function ProvedorLoja({ children }) {
  const [estado, despachar] = useReducer(redutor, undefined, carregar);

  useEffect(() => {
    try {
      if (estado.loja) localStorage.setItem(CHAVE, JSON.stringify(estado));
      else localStorage.removeItem(CHAVE);
    } catch {
      // sem armazenamento: o painel funciona, só não lembra na próxima visita
    }
  }, [estado]);

  const linhas = useMemo(
    () =>
      estado.produtos.map((produto) => {
        const faixa = faixaDaRegiao(produto, estado.loja);
        return { produto, faixa, diagnostico: diagnosticar(produto, faixa, estado.config) };
      }),
    [estado.produtos, estado.loja, estado.config],
  );
  const resumo = useMemo(() => resumir(linhas), [linhas]);

  const valor = useMemo(() => ({ estado, despachar, linhas, resumo }), [estado, linhas, resumo]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLoja() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useLoja precisa estar dentro de <ProvedorLoja>');
  return c;
}

// Quanto os ajustes já feitos rendem por mês (só aumentos contam como margem recuperada).
export function recuperadoPorMes(alteracoes, produtos) {
  const vigentes = new Map();
  for (const a of [...alteracoes].reverse()) {
    const atual = vigentes.get(a.produtoId);
    vigentes.set(a.produtoId, { de: atual ? atual.de : a.de, para: a.para });
  }
  let total = 0;
  for (const [id, { de, para }] of vigentes) {
    const p = produtos.find((x) => x.id === id);
    if (p && para > de) total += (para - de) * p.vendasMes;
  }
  return total;
}
