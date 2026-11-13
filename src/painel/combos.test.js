import { describe, expect, it } from 'vitest';
import { catalogoDemonstracao } from './dados/catalogo.js';
import { cuponsDoDia, historicoDemonstracao } from './dados/cupons-demo.js';
import { analisarCombos, medirCombo, precificarCombo } from './lib/combos.js';
import {
  cancelamentoParaXml,
  cupomParaXml,
  juntarCupons,
  lerCancelamento,
  lerCupom,
  momentoDe,
  sincronizar,
} from './lib/cupons.js';
import { gerarNotaExemplo, lerNotaFiscal } from './lib/nfe.js';
import { CONFIG_PADRAO, margemReal } from './lib/precificacao.js';
import { crc32, criarZip } from './lib/zip.js';
import { itensNotaExemplo } from './dados/catalogo.js';

const produtos = catalogoDemonstracao();
const porChave = new Map(produtos.map((p) => [p.ean ?? `cod:${p.ref.toUpperCase()}`, p]));
const produtoDe = (k) => porChave.get(k) ?? null;
const HOJE = '2026-11-07';

describe('cupom de venda (NFC-e)', () => {
  const cupom = cuponsDoDia('2026-11-03', produtos)[10];

  it('lê de volta o cupom que gera, com data local e itens', () => {
    const lido = lerCupom(cupomParaXml(cupom));
    expect(lido.chave).toBe(cupom.chave);
    expect(lido.chave).toHaveLength(44);
    expect(lido.emissao).toBe(cupom.emissao);
    expect(lido.itens.map((i) => i.chave)).toEqual(cupom.itens.map((i) => i.chave));
  });

  it('nunca lê o CPF do consumidor', () => {
    const comCpf = cupomParaXml(cupom).replace('</emit>', '</emit><dest><CPF>12345678909</CPF><xNome>Fulano</xNome></dest>');
    expect(JSON.stringify(lerCupom(comCpf))).not.toMatch(/12345678909|Fulano/);
  });

  it('separa dia da semana e período pela hora da nota', () => {
    expect(momentoDe('2026-11-03T15:20')).toEqual({ dia: 2, periodo: 'tarde' });
    expect(momentoDe('2026-11-07T09:05')).toEqual({ dia: 6, periodo: 'manha' });
    expect(momentoDe('2026-11-08T19:59')).toEqual({ dia: 0, periodo: 'noite' });
  });

  it('a tela de nota de compra recusa cupom de venda', () => {
    expect(() => lerNotaFiscal(cupomParaXml(cupom))).toThrow(/cupom de venda/);
  });
});

describe('leitura da pasta', () => {
  const dia = cuponsDoDia('2026-11-03', produtos).slice(0, 5);
  const arquivo = (caminho, texto) => ({ caminho, assinatura: `${caminho}|${texto.length}`, ler: async () => texto });

  it('lê cupons novos, aplica cancelamento, separa nota de compra e pula o que já leu', async () => {
    const arquivos = [
      ...dia.map((c) => arquivo(`NFCe/${c.chave}.xml`, cupomParaXml(c))),
      arquivo('NFCe/cancelamento.xml', cancelamentoParaXml(dia[0].chave, '2026-11-03T20:00')),
      arquivo('Compras/nota.xml', gerarNotaExemplo(itensNotaExemplo())),
      arquivo('leia-me.txt', 'não é XML'),
    ];
    const r = await sincronizar(arquivos);
    expect(r.cupons).toHaveLength(5);
    expect(r.cancelados).toEqual([dia[0].chave]);
    expect(r.notasDeCompra).toBe(1);
    expect(juntarCupons([r.cupons], r.cancelados)).toHaveLength(4);

    const segunda = await sincronizar(arquivos, new Set(r.assinaturas));
    expect(segunda.cupons).toHaveLength(0);
    expect(segunda.assinaturas).toHaveLength(0);
  });

  it('reconhece só o evento de cancelamento', () => {
    expect(lerCancelamento(cancelamentoParaXml('1'.repeat(44), '2026-11-03T20:00'))).toBe('1'.repeat(44));
    expect(lerCancelamento(cupomParaXml(dia[1]))).toBe(null);
  });
});

describe('combos', () => {
  const historico = historicoDemonstracao(produtos, HOJE);
  const r = analisarCombos(historico, { produtoDe, cfg: CONFIG_PADRAO });
  // o par pode sair em qualquer ordem: o primeiro é o produto que mais aparece nos cupons
  const achar = (a, b) =>
    r.sugestoes.find(
      (s) => (s.a.produto?.ref === a && s.b.produto?.ref === b) || (s.a.produto?.ref === b && s.b.produto?.ref === a),
    );

  it('o histórico de demonstração tem cerca de 100 cupons por dia', () => {
    expect(historico.length / 56).toBeGreaterThan(95);
    expect(historico.length / 56).toBeLessThan(115);
  });

  it('encontra os seis padrões plantados, cada um na janela certa, e nenhum outro', () => {
    expect(r.sugestoes).toHaveLength(6);
    expect(achar('pao-frances', 'mortadela-kg').quando).toBe('Terça à tarde');
    expect(achar('salgadinho', 'refri-2l').quando).toBe('Sábado, o dia todo');
    expect(achar('macarrao-500', 'molho-340').quando).toBe('A semana toda');
    expect(achar('pao-frances', 'leite-1').quando).toBe('Todos os dias de manhã');
    expect(achar('cerveja-lata', 'amendoim').quando).toBe('Sexta à noite');
    expect(achar('linguica-kg', 'carvao').quando).toBe('Fim de semana');
  });

  it('acha os mesmos seis em outras semanas de cupons', () => {
    for (const hoje of ['2026-10-06', '2026-11-20', '2026-12-15']) {
      const outra = analisarCombos(historicoDemonstracao(produtos, hoje), { produtoDe, cfg: CONFIG_PADRAO });
      expect(outra.sugestoes.map((s) => s.quando).sort()).toEqual(
        ['A semana toda', 'Fim de semana', 'Sexta à noite', 'Sábado, o dia todo', 'Terça à tarde', 'Todos os dias de manhã'],
      );
    }
  });

  it('não inventa padrão quando os produtos são comprados de forma independente', () => {
    const semPadrao = historicoDemonstracao(produtos, HOJE, { padroes: [] });
    expect(analisarCombos(semPadrao, { produtoDe, cfg: CONFIG_PADRAO }).sugestoes).toHaveLength(0);
  });

  it('o mapa de calor mostra a terça à tarde acima dos outros momentos', () => {
    const s = achar('pao-frances', 'mortadela-kg');
    const tercaTarde = s.mapa.find((c) => c.dia === 2 && c.periodo === 'tarde');
    const outros = s.mapa.filter((c) => c !== tercaTarde && c.taxa !== null);
    expect(tercaTarde.taxa).toBeGreaterThan(Math.max(...outros.map((c) => c.taxa)));
    expect(s.fora.taxa).toBeLessThan(s.taxaCom / 3);
  });

  it('o preço do combo respeita a margem mínima da loja', () => {
    for (const s of r.sugestoes) {
      expect(s.preco.viavel).toBe(true);
      expect(s.preco.preco).toBeLessThan(s.preco.precoOriginal);
      expect(s.preco.margem).toBeGreaterThanOrEqual(CONFIG_PADRAO.margemMinima - 1e-9);
    }
    expect(achar('pao-frances', 'mortadela-kg').preco.tipo).toBe('complemento');
    expect(achar('salgadinho', 'refri-2l').preco.tipo).toBe('kit');
    expect(achar('cerveja-lata', 'amendoim').preco.tipo).toBe('kit');
  });

  it('sem margem para desconto, sugere só expor junto', () => {
    const a = { nome: 'A', preco: 5, custo: 4.5 };
    const b = { nome: 'B', preco: 5, custo: 4.5 };
    expect(precificarCombo(a, b, CONFIG_PADRAO)).toEqual({ tipo: 'vitrine', viavel: false });
    expect(margemReal(5, 4.5, CONFIG_PADRAO)).toBeLessThan(CONFIG_PADRAO.margemMinima);
  });

  it('mede o combo antes e depois de criado', () => {
    const s = achar('pao-frances', 'mortadela-kg');
    const combo = { a: s.a.chave, b: s.b.chave, janela: s.janela, criadoEm: `${HOJE}T00:00:00.000Z` };
    const m = medirCombo([...historico, ...cuponsDoDia(HOJE, produtos)], combo);
    expect(m.antes.taxa).toBeCloseTo(s.taxaCom, 6);
    expect(m.depois.na).toBe(0); // hoje é sábado: ainda não houve terça à tarde
  });
});

describe('zip da pasta de exemplo', () => {
  it('calcula o CRC-32 padrão', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('monta um zip com uma entrada por arquivo', () => {
    const z = criarZip([
      { nome: 'NFCe/a.xml', conteudo: '<a/>' },
      { nome: 'NFCe/b.xml', conteudo: '<b/>' },
    ]);
    const v = new DataView(z.buffer);
    expect(v.getUint32(0, true)).toBe(0x04034b50);
    const fim = z.length - 22;
    expect(v.getUint32(fim, true)).toBe(0x06054b50);
    expect(v.getUint16(fim + 10, true)).toBe(2);
  });
});
