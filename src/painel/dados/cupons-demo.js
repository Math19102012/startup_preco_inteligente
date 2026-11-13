// Cupons de venda SIMULADOS da loja de demonstração.
//
// Cada dia é gerado a partir da própria data (sementes fixas), então o mesmo dia sempre tem os
// mesmos cupons: o histórico não muda a cada abertura e a pasta de exemplo de "hoje" não repete
// cupons do histórico.
//
// Volume: a premissa do site é um minimercado de R$ 80 mil por mês; com gasto médio de cerca de
// R$ 25 por cupom, são uns 3.200 cupons por mês (100 a 110 por dia).
//
// Seis padrões de compra foram plantados de propósito, para mostrar o que a análise encontra:
//   - terça à tarde, quem leva pão francês costuma levar mortadela;
//   - sábado, quem leva salgadinho costuma levar refrigerante;
//   - a semana toda, quem leva macarrão costuma levar molho de tomate;
//   - toda manhã, quem leva pão francês costuma levar leite;
//   - sexta à noite, quem leva cerveja costuma levar amendoim;
//   - no fim de semana, quem leva linguiça costuma levar carvão.
// Fora isso, os produtos entram nos cupons de forma independente, conforme as vendas de cada um.
import { chaveDeCupom, chaveDoItem } from '../lib/cupons.js';

export const CUPONS_POR_MES = 3200;
export const SEMANAS_DE_HISTORICO = 8;

// cupons por dia, de domingo a sábado
const CUPONS_POR_DIA = [70, 95, 100, 100, 105, 130, 150];
// peso de cada hora no movimento do dia (7h às 21h)
const HORAS = { 7: 4, 8: 7, 9: 8, 10: 8, 11: 9, 12: 10, 13: 8, 14: 6, 15: 6, 16: 7, 17: 10, 18: 12, 19: 11, 20: 7, 21: 3 };

export const PADROES = [
  { quando: (dia, hora) => dia === 2 && hora >= 12 && hora < 18, se: 'pao-frances', leva: 'mortadela-kg', chance: 0.45 },
  { quando: (dia) => dia === 6, se: 'salgadinho', leva: 'refri-2l', chance: 0.5 },
  { quando: () => true, se: 'macarrao-500', leva: 'molho-340', chance: 0.35 },
  { quando: (dia, hora) => hora < 12, se: 'pao-frances', leva: 'leite-1', chance: 0.4 },
  { quando: (dia, hora) => dia === 5 && hora >= 18, se: 'cerveja-lata', leva: 'amendoim', chance: 0.55 },
  { quando: (dia) => dia === 6 || dia === 0, se: 'linguica-kg', leva: 'carvao', chance: 0.55 },
];

// Itens que vendem mais em certos momentos (churrasco no fim de semana, cerveja na sexta à noite).
function reforco(ref, dia, hora) {
  if (dia === 6 && (ref === 'salgadinho' || ref === 'cerveja-lata')) return 1.6;
  if (dia === 5 && hora >= 18 && ref === 'cerveja-lata') return 1.6;
  if ((dia === 6 || dia === 0) && ref === 'linguica-kg') return 2.5;
  return 1;
}

// gerador pseudoaleatório com semente (mulberry32)
function sorteador(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTexto(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const porKg = (nome) => /,\s*kg$/i.test(nome.trim());

function quantidade(produto, sorteio) {
  if (porKg(produto.nome)) return Math.round((0.2 + sorteio() * 0.8) * 1000) / 1000;
  if (produto.ref === 'cerveja-lata') return [1, 2, 3, 6, 12][Math.floor(sorteio() * 5)];
  return sorteio() < 0.8 ? 1 : 2;
}

// "2026-11-03" + n dias
function somarDias(data, n) {
  const [a, m, d] = data.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

// Cupons de um dia. `produtos`: o catálogo atual da loja (preço e nome vêm dele).
export function cuponsDoDia(data, produtos, { padroes = PADROES } = {}) {
  const sorteio = sorteador(hashTexto(`cupons|${data}`));
  const [a, m, d] = data.split('-').map(Number);
  const dia = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  const porRef = new Map(produtos.filter((p) => p.ref).map((p) => [p.ref, p]));
  const vendaveis = [...porRef.values()].filter((p) => p.vendasMes > 0);
  if (vendaveis.length === 0) return [];

  const horas = Object.entries(HORAS);
  const pesoTotal = horas.reduce((s, [, p]) => s + p, 0);
  const sortearHora = () => {
    let r = sorteio() * pesoTotal;
    for (const [h, p] of horas) {
      r -= p;
      if (r <= 0) return Number(h);
    }
    return 21;
  };

  const total = CUPONS_POR_DIA[dia];
  const cupons = [];
  for (let i = 0; i < total; i++) {
    const hora = sortearHora();
    const minuto = Math.floor(sorteio() * 60);
    const levados = new Set();
    for (const p of vendaveis) {
      const chance = (p.vendasMes / CUPONS_POR_MES) * reforco(p.ref, dia, hora);
      if (sorteio() < Math.min(0.6, chance)) levados.add(p.ref);
    }
    for (const padrao of padroes) {
      if (padrao.quando(dia, hora) && levados.has(padrao.se) && porRef.has(padrao.leva) && sorteio() < padrao.chance) {
        levados.add(padrao.leva);
      }
    }
    if (levados.size === 0) levados.add(vendaveis[Math.floor(sorteio() * vendaveis.length)].ref);

    const emissao = `${data}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
    const itens = [...levados].map((ref) => {
      const p = porRef.get(ref);
      const q = quantidade(p, sorteio);
      return {
        chave: chaveDoItem(p.ean, p.ref),
        ean: p.ean ?? null,
        codigo: p.ref.toUpperCase(),
        descricao: p.nome,
        quantidade: q,
        valor: Math.round(p.preco * q * 100) / 100,
      };
    });
    // número do cupom: dias desde 2020 × 1000 + ordem no dia, para nunca repetir
    const numero = Math.round(Date.UTC(a, m - 1, d) / 86_400_000 - 18_262) * 1000 + i + 1;
    cupons.push({ chave: chaveDeCupom(emissao, numero), emissao, itens });
  }
  return cupons.sort((x, y) => x.emissao.localeCompare(y.emissao));
}

// Cupons de hoje até a hora atual (para a pasta de exemplo). Antes das primeiras vendas do dia,
// devolve o dia inteiro, para a pasta nunca vir vazia.
export function cuponsDeHojeAteAgora(produtos, agora = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  const limite = `${hojeLocal(agora)}T${p(agora.getHours())}:${p(agora.getMinutes())}`;
  const todos = cuponsDoDia(hojeLocal(agora), produtos);
  const ateAgora = todos.filter((c) => c.emissao <= limite);
  return ateAgora.length >= 20 ? ateAgora : todos;
}

// Histórico das últimas semanas, terminando ontem.
export function historicoDemonstracao(produtos, hoje, opcoes) {
  const dias = SEMANAS_DE_HISTORICO * 7;
  const cupons = [];
  for (let i = dias; i >= 1; i--) cupons.push(...cuponsDoDia(somarDias(hoje, -i), produtos, opcoes));
  return cupons;
}

// Data local de hoje no formato AAAA-MM-DD.
export function hojeLocal(agora = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}
