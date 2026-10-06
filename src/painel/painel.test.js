import { describe, expect, it, vi } from 'vitest';
import { catalogoDemonstracao, itensNotaExemplo, LOJA_DEMONSTRACAO } from './dados/catalogo.js';
import { gerarNotaExemplo, lerNotaFiscal } from './lib/nfe.js';
import {
  arredondarPreco,
  CONFIG_PADRAO,
  diagnosticar,
  margemReal,
  precoMinimo,
  resumir,
} from './lib/precificacao.js';
import { faixaDaRegiao } from './lib/regiao.js';
import { cnpjValido, eanValido, formatarCep, formatarCnpj } from './lib/validacao.js';
import { AMOSTRAS_TESTE, buscarCep, buscarCnpj, buscarProdutoPorEan } from './servicos/apis.js';

describe('validação', () => {
  it('confere os dígitos do CNPJ', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cnpjValido('11.222.333/0001-82')).toBe(false);
    expect(cnpjValido('00000000000000')).toBe(false);
    expect(cnpjValido(AMOSTRAS_TESTE.cnpj)).toBe(true);
    expect(formatarCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(formatarCep('03515000')).toBe('03515-000');
  });

  it('confere o dígito do código de barras', () => {
    expect(eanValido(AMOSTRAS_TESTE.produto)).toBe(true);
    expect(eanValido('7891000100103')).toBe(true);
    expect(eanValido('7891000100104')).toBe(false);
    for (const p of catalogoDemonstracao()) if (p.ean) expect(eanValido(p.ean)).toBe(true);
  });
});

describe('preço', () => {
  const cfg = CONFIG_PADRAO;

  it('arredonda para preço de etiqueta', () => {
    expect(arredondarPreco(27.62, '49-99', 'cima')).toBe(27.99);
    expect(arredondarPreco(27.31, '49-99', 'cima')).toBe(27.49);
    expect(arredondarPreco(29.9, '49-99', 'perto')).toBe(29.99);
    expect(arredondarPreco(7.1, '90', 'cima')).toBe(7.9);
    expect(arredondarPreco(7.1, '00', 'baixo')).toBe(7);
  });

  it('preço mínimo cobre compra, perdas, imposto e cartão', () => {
    const p = precoMinimo(10, cfg, 0);
    expect(margemReal(p, 10, cfg)).toBeCloseTo(0, 10);
    expect(margemReal(precoMinimo(10, cfg, 0.08), 10, cfg)).toBeCloseTo(0.08, 10);
  });

  it('acusa item vendido no prejuízo e sugere preço que volta a dar lucro', () => {
    const d = diagnosticar({ custo: 7.9, preco: 8.49, vendasMes: 120 }, { min: 9.49, mediana: 10.49, max: 11.99 }, cfg);
    expect(d.status).toBe('prejuizo');
    expect(d.sugestao).toBe(9.49);
    expect(d.margemNova).toBeGreaterThanOrEqual(cfg.margemMinima);
    expect(d.impactoMes).toBeCloseTo(120, 6);
  });

  it('sobe o item abaixo da região sem passar da mediana', () => {
    const faixa = { min: 26.5, mediana: 28.9, max: 32.9 };
    const d = diagnosticar({ custo: 19.8, preco: 24.9, vendasMes: 40 }, faixa, cfg);
    expect(d.status).toBe('abaixo');
    expect(d.sugestao).toBeGreaterThanOrEqual(faixa.min);
    expect(d.sugestao).toBeLessThanOrEqual(faixa.mediana);
    expect(d.impactoMes).toBeCloseTo((d.sugestao - 24.9) * 40, 6);
  });

  it('baixa o item acima da região até perto da mediana', () => {
    const d = diagnosticar({ custo: 22.5, preco: 32.9, vendasMes: 40 }, { min: 27.9, mediana: 29.9, max: 31.9 }, cfg);
    expect(d.status).toBe('acima');
    expect(d.sugestao).toBe(29.99);
    expect(d.impactoMes).toBeLessThan(0);
  });

  it('mantém o item na faixa e sem dado quando não há o que fazer', () => {
    expect(diagnosticar({ custo: 4.15, preco: 5.49, vendasMes: 300 }, { min: 5.29, mediana: 5.69, max: 6.19 }, cfg).sugestao).toBe(
      null,
    );
    const semDado = diagnosticar({ custo: 2, preco: 3.5, vendasMes: 10 }, null, cfg);
    expect(semDado.status).toBe('sem-dado');
    expect(semDado.sugestao).toBe(null);
  });

  it('a loja de demonstração tem todos os tipos de situação', () => {
    const linhas = catalogoDemonstracao().map((p) => ({
      produto: p,
      diagnostico: diagnosticar(p, faixaDaRegiao(p, LOJA_DEMONSTRACAO), cfg),
    }));
    const r = resumir(linhas);
    expect(r.contagem.prejuizo).toBeGreaterThan(0);
    expect(r.contagem.abaixo).toBeGreaterThan(0);
    expect(r.contagem.acima).toBeGreaterThan(0);
    expect(r.contagem.faixa).toBeGreaterThan(r.total / 3);
    expect(r.recuperavel).toBeGreaterThan(300);
    expect(r.recuperavel).toBeLessThan(1200);
  });
});

describe('região', () => {
  it('usa a faixa real da ANP para o botijão', () => {
    const glp = catalogoDemonstracao().find((p) => p.ref === 'glp-13');
    const f = faixaDaRegiao(glp, { cidade: 'Sao Jose dos Campos' });
    expect(f).toMatchObject({ min: 79.99, mediana: 100, max: 125, real: true });
    expect(faixaDaRegiao(glp, { cidade: 'Itu' }).fonte).toMatch(/estado de SP/);
  });

  it('é determinística e não acha produto desconhecido', () => {
    const p = catalogoDemonstracao()[0];
    expect(faixaDaRegiao(p, { cidade: 'Campinas', bairro: 'Cambuí' })).toEqual(
      faixaDaRegiao(p, { cidade: 'Campinas', bairro: 'Cambuí' }),
    );
    expect(faixaDaRegiao({ ean: '7891000100103' }, LOJA_DEMONSTRACAO)).toBe(null);
  });
});

describe('nota fiscal (XML da NF-e)', () => {
  it('lê a nota de exemplo e calcula o custo por unidade', () => {
    const nota = lerNotaFiscal(gerarNotaExemplo(itensNotaExemplo(), { emissao: new Date('2026-10-01T10:00:00Z') }));
    expect(nota.chave).toHaveLength(44);
    expect(nota.fornecedor.nome).toBe('Distribuidora Exemplo');
    expect(nota.itens).toHaveLength(6);
    const arroz = nota.itens[0];
    expect(arroz.quantidade).toBe(12);
    expect(arroz.custoUnitario).toBeCloseTo(20.4, 4);
    expect(eanValido(arroz.ean)).toBe(true);
  });

  it('soma frete, IPI e ST e desconta o desconto no custo', () => {
    const xml = `<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe35261011222333000181550010000000011000000011" versao="4.00">
      <ide><nNF>1</nNF><serie>1</serie><dhEmi>2026-10-01T10:00:00-03:00</dhEmi></ide>
      <emit><CNPJ>11222333000181</CNPJ><xNome>Atacado &amp; Cia</xNome></emit>
      <det nItem="1"><prod><cProd>9</cProd><cEAN>SEM GTIN</cEAN><xProd>CAFE 500G</xProd><uCom>CX</uCom><qCom>1</qCom>
        <vProd>200.00</vProd><uTrib>UN</uTrib><qTrib>10</qTrib><vFrete>10.00</vFrete><vDesc>5.00</vDesc></prod>
        <imposto><IPI><IPITrib><vIPI>3.00</vIPI></IPITrib></IPI><ICMS><ICMS10><vICMSST>2.00</vICMSST></ICMS10></ICMS></imposto></det>
      </infNFe></NFe></nfeProc>`;
    const nota = lerNotaFiscal(xml);
    expect(nota.fornecedor.nome).toBe('Atacado & Cia');
    expect(nota.itens[0].ean).toBe(null);
    expect(nota.itens[0].custoUnitario).toBeCloseTo(21, 6);
  });

  it('recusa arquivo que não é NF-e', () => {
    expect(() => lerNotaFiscal('<html></html>')).toThrow(/NF-e/);
    expect(() => lerNotaFiscal('texto')).toThrow(/XML/);
  });
});

describe('APIs públicas', () => {
  const resposta = (status, corpo) => vi.fn(async () => ({ status, ok: status < 400, json: async () => corpo }));

  it('traduz a resposta da BrasilAPI de CNPJ', async () => {
    const fetcher = resposta(200, {
      razao_social: 'MERCADINHO DO BAIRRO LTDA',
      nome_fantasia: 'MERCADINHO DO BAIRRO',
      descricao_tipo_de_logradouro: 'RUA',
      logradouro: 'DAS FLORES',
      numero: '10',
      bairro: 'VILA MATILDE',
      municipio: 'SAO PAULO',
      uf: 'SP',
      cep: '03515-000',
      cnae_fiscal_descricao: 'Comércio varejista de mercadorias em geral',
    });
    const loja = await buscarCnpj('11.222.333/0001-81', { fetcher });
    expect(fetcher.mock.calls[0][0]).toBe('https://brasilapi.com.br/api/cnpj/v1/11222333000181');
    expect(loja).toMatchObject({ nome: 'Mercadinho do Bairro', bairro: 'Vila Matilde', cidade: 'Sao Paulo', cep: '03515000' });
  });

  it('não chama a API com CNPJ inválido e avisa quando não encontra', async () => {
    const fetcher = resposta(404, { message: 'not found' });
    await expect(buscarCnpj('11.222.333/0001-82', { fetcher })).rejects.toMatchObject({ tipo: 'invalido' });
    expect(fetcher).not.toHaveBeenCalled();
    await expect(buscarCnpj('11.222.333/0001-81', { fetcher })).rejects.toMatchObject({ tipo: 'nao-encontrado' });
  });

  it('usa o ViaCEP quando a BrasilAPI falha', async () => {
    const fetcher = vi.fn(async (url) => {
      if (url.includes('brasilapi')) throw new TypeError('Failed to fetch');
      return { status: 200, ok: true, json: async () => ({ logradouro: 'Avenida Paulista', bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'SP' }) };
    });
    const cep = await buscarCep('01310-100', { fetcher });
    expect(cep).toMatchObject({ fonte: 'ViaCEP', bairro: 'Bela Vista', cidade: 'São Paulo' });
  });

  it('busca o produto no Open Food Facts pelo código de barras', async () => {
    const fetcher = resposta(200, {
      status: 1,
      product: { product_name_pt: 'Leite condensado', brands: 'Moça,Nestlé', quantity: '395 g', image_front_small_url: 'https://x/y.jpg' },
    });
    const p = await buscarProdutoPorEan('7891000100103', { fetcher });
    expect(fetcher.mock.calls[0][0]).toMatch(/world\.openfoodfacts\.org\/api\/v2\/product\/7891000100103\.json/);
    expect(p).toMatchObject({ nome: 'Leite condensado, Moça, 395 g', marca: 'Moça', imagem: 'https://x/y.jpg' });
    await expect(buscarProdutoPorEan('7891000100103', { fetcher: resposta(404, { status: 0 }) })).rejects.toMatchObject({
      tipo: 'nao-encontrado',
    });
  });
});
