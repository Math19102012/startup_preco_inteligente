import { describe, expect, it } from 'vitest';
import { CENARIOS, MERCADINHO, RODADA } from '../data/premissas.js';
import { precoDoPlano, projetarCenario, simularInvestidor, simularMercadinho, ticketMedio } from './modelo.js';

describe('ticket médio', () => {
  it('pondera Essencial e Completo pelo mix de planos', () => {
    expect(ticketMedio()).toBeCloseTo(0.7 * 79 + 0.3 * 149, 6);
  });
});

describe('projeção do cenário base', () => {
  const p = projetarCenario(CENARIOS.base);

  it('a receita do ano 1 usa a média de lojas do ano', () => {
    expect(p.anos[0].receita).toBeCloseTo(40 * ticketMedio() * 12, 6);
  });

  it('o caixa nunca acaba com a captação proposta', () => {
    expect(p.caixaMinimo).toBeGreaterThan(0);
    expect(p.aporteExtra).toBe(0);
    expect(p.fatorDiluicao).toBe(1);
  });

  it('a empresa passa a dar lucro no ano 4', () => {
    expect(p.anoLucro).toBe(4);
  });

  it('pós-money = valor captado / participação', () => {
    expect(p.posMoney).toBe(RODADA.valorCaptado / RODADA.participacao);
  });
});

describe('investidor: CDI × startup', () => {
  const projecao = projetarCenario(CENARIOS.base);
  const r = simularInvestidor({ valor: 100_000, projecao, cdi: 0.15, horizonte: 5 });

  it('o CDI compõe juros anuais', () => {
    expect(r.cdiFinal).toBeCloseTo(100_000 * 1.15 ** 5, 6);
  });

  it('antes da primeira avaliação a participação vale o preço pago', () => {
    expect(r.serie[1].startup).toBe(100_000);
    expect(r.serie[2].startup).toBe(100_000);
  });

  it('no ano 5 a participação vale a fatia × valor da empresa', () => {
    const fatia = 100_000 / projecao.posMoney;
    expect(r.startupFinal).toBeCloseTo(fatia * projecao.anos[4].valorEmpresa, 6);
  });

  it('com as lojas de empate a startup rende exatamente o CDI', () => {
    const lojas = r.lojasEmpate;
    const valorEmpresa = lojas * projecao.ticket * 12 * CENARIOS.base.multiploReceita;
    expect((100_000 / projecao.posMoney) * valorEmpresa).toBeCloseTo(r.cdiFinal, 4);
  });

  it('o múltiplo não depende do valor investido', () => {
    const outro = simularInvestidor({ valor: 10_000, projecao, cdi: 0.15, horizonte: 5 });
    expect(outro.multiploStartup).toBeCloseTo(r.multiploStartup, 10);
  });
});

describe('a rodada proposta ganha do CDI em todos os cenários', () => {
  for (const cenario of Object.values(CENARIOS)) {
    const projecao = projetarCenario(cenario);

    it(`${cenario.nome}: pelo menos 40% acima do CDI de 15% e acima do CDI de 20%`, () => {
      const r = simularInvestidor({ valor: 100_000, projecao, cdi: 0.15 });
      expect(r.startupFinal).toBeGreaterThan(r.cdiFinal * 1.4);
      const caro = simularInvestidor({ valor: 100_000, projecao, cdi: 0.2 });
      expect(caro.startupFinal).toBeGreaterThan(caro.cdiFinal);
    });

    it(`${cenario.nome}: o caixa da captação basta, sem diluir o investidor`, () => {
      expect(projecao.fatorDiluicao).toBe(1);
    });
  }
});

describe('diluição quando o caixa acaba', () => {
  it('capta o que falta e dilui quem já era sócio', () => {
    const caro = { ...CENARIOS.conservador, equipe: CENARIOS.conservador.equipe.map((v) => v * 2) };
    const p = projetarCenario(caro);
    expect(p.aporteExtra).toBeGreaterThan(0);
    expect(p.fatorDiluicao).toBeLessThan(1);
    const r = simularInvestidor({ valor: 100_000, projecao: p });
    expect(r.participacaoFinal).toBeLessThan(r.participacaoInicial);
  });
});

describe('mercadinho', () => {
  it('sem perda de volume, o ganho é o aumento aplicado sobre a receita dos itens', () => {
    const r = simularMercadinho({ ...MERCADINHO, perdaVolume: 0, mensalidade: 79 });
    expect(r.ganhoBruto).toBeCloseTo(80_000 * 0.2 * 0.03, 6);
  });

  it('com os valores iniciais a assinatura se paga várias vezes', () => {
    const r = simularMercadinho({ ...MERCADINHO, mensalidade: precoDoPlano('essencial') });
    expect(r.ganhoBruto).toBeCloseTo(440, 6);
    expect(r.ganhoLiquido).toBeCloseTo(361, 6);
    expect(r.retornoPorReal).toBeGreaterThan(5);
  });

  it('perda de volume grande pode anular o ganho', () => {
    const r = simularMercadinho({ ...MERCADINHO, perdaVolume: 0.2, mensalidade: 79 });
    expect(r.ganhoBruto).toBeLessThan(0);
    expect(r.diasParaPagar).toBeNull();
  });
});
