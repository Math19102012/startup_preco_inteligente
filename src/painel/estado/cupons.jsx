// Cupons de venda da loja e a análise de combos feita sobre eles.
// Fontes: o histórico simulado (só na loja de demonstração) e a pasta conectada do caixa.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cuponsDeHojeAteAgora, historicoDemonstracao, hojeLocal } from '../dados/cupons-demo.js';
import { analisarCombos } from '../lib/combos.js';
import { cancelamentoParaXml, chaveDoItem, cupomParaXml, juntarCupons, sincronizar } from '../lib/cupons.js';
import { criarZip } from '../lib/zip.js';
import { apagarTudo, assinaturasLidas, gravarAjuste, gravarLeitura, lerAjuste, todosOsCancelados, todosOsCupons } from '../servicos/armazem.js';
import { arquivosDaPasta, arquivosDoSeletor, escolherPasta, esquecerPasta, pastaSalva, permissao, suportaPasta } from '../servicos/pasta.js';
import { useLoja } from './loja.jsx';

const Contexto = createContext(null);

const LEIA_ME = `Pasta de cupons de exemplo do Preço Inteligente
================================================

Estes arquivos imitam a pasta onde o programa de caixa grava o XML de cada cupom
de venda (NFC-e). Os cupons são de hoje, simulados para a loja de demonstração.
Um deles vem com o evento de cancelamento, que o painel desconta.

Como testar:
1. Descompacte este arquivo.
2. No painel, abra Combos e clique em "Conectar a pasta do caixa".
3. Escolha a pasta "cupons-exemplo".

Nas próximas vezes que o painel abrir, ele lê sozinho os cupons novos da pasta.
`;

export function ProvedorCupons({ children }) {
  const { estado } = useLoja();
  const { loja, produtos, config } = estado;
  const demonstracao = Boolean(loja?.demonstracao);

  const [reais, setReais] = useState([]);
  const [cancelados, setCancelados] = useState([]);
  const [pasta, setPasta] = useState(null); // { nome, permissao }
  const [leitura, setLeitura] = useState({ estado: 'parado' });
  const alca = useRef(null);
  const hoje = hojeLocal();

  // histórico simulado: só depende do que cada produto é, não do preço do momento
  const chaveCatalogo = produtos.map((p) => `${p.ref}|${p.ean}|${p.vendasMes}`).join(',');
  const historico = useMemo(
    () => (demonstracao ? historicoDemonstracao(produtos, hoje) : []),
    // refaz só quando muda o catálogo (chaveCatalogo), não a cada preço aplicado
    [demonstracao, hoje, chaveCatalogo],
  );

  const ler = useCallback(async (fonte, origem) => {
    setLeitura({ estado: 'lendo' });
    try {
      const ja = new Set(await assinaturasLidas().catch(() => []));
      const arquivos = await fonte();
      const r = await sincronizar(arquivos, ja);
      await gravarLeitura(r).catch(() => {});
      setReais((atual) => [...atual, ...r.cupons]);
      setCancelados((atual) => [...atual, ...r.cancelados]);
      const resumo = {
        estado: 'ok',
        origem,
        quando: new Date().toISOString(),
        arquivos: arquivos.length,
        novos: r.cupons.length,
        cancelados: r.cancelados.length,
        notasDeCompra: r.notasDeCompra,
        ignorados: r.ignorados + r.erros.length,
      };
      setLeitura(resumo);
      gravarAjuste('ultimaLeitura', resumo).catch(() => {});
    } catch (erro) {
      setLeitura({ estado: 'erro', mensagem: erro?.message ?? String(erro) });
    }
  }, []);

  // ao abrir o painel: carrega o que já foi lido e, se a pasta ainda está autorizada, lê os cupons novos
  useEffect(() => {
    if (!loja) return undefined;
    let ativo = true;
    (async () => {
      const [cs, xs, ultima, salva] = await Promise.all([
        todosOsCupons().catch(() => []),
        todosOsCancelados().catch(() => []),
        lerAjuste('ultimaLeitura').catch(() => null),
        suportaPasta() ? pastaSalva() : null,
      ]);
      if (!ativo) return;
      setReais(cs ?? []);
      setCancelados(xs ?? []);
      if (ultima) setLeitura(ultima);
      if (salva) {
        alca.current = salva;
        const p = await permissao(salva).catch(() => 'prompt');
        if (!ativo) return;
        setPasta({ nome: salva.name, permissao: p });
        if (p === 'granted') ler(() => arquivosDaPasta(salva), 'pasta');
      }
    })();
    return () => {
      ativo = false;
    };
    // só na abertura do painel ou quando uma loja entra
  }, [Boolean(loja)]);

  // "Apagar e sair" também apaga os cupons guardados
  useEffect(() => {
    if (loja) return;
    apagarTudo().catch(() => {});
    alca.current = null;
    setReais([]);
    setCancelados([]);
    setPasta(null);
    setLeitura({ estado: 'parado' });
  }, [loja]);

  const conectarPasta = useCallback(async () => {
    try {
      const p = await escolherPasta();
      alca.current = p;
      setPasta({ nome: p.name, permissao: 'granted' });
      await ler(() => arquivosDaPasta(p), 'pasta');
    } catch (erro) {
      if (erro?.name !== 'AbortError') setLeitura({ estado: 'erro', mensagem: erro?.message ?? String(erro) });
    }
  }, [ler]);

  const lerAgora = useCallback(async () => {
    const p = alca.current;
    if (!p) return;
    const ok = await permissao(p, true).catch(() => 'denied');
    setPasta({ nome: p.name, permissao: ok });
    if (ok === 'granted') await ler(() => arquivosDaPasta(p), 'pasta');
  }, [ler]);

  const importarArquivos = useCallback((lista) => ler(async () => arquivosDoSeletor(lista), 'arquivos'), [ler]);

  const desconectar = useCallback(async () => {
    await esquecerPasta();
    alca.current = null;
    setPasta(null);
  }, []);

  const baixarExemplo = useCallback(() => {
    const cupons = cuponsDeHojeAteAgora(produtos);
    if (!cupons.length) return;
    const arquivos = [
      { nome: 'cupons-exemplo/LEIA-ME.txt', conteudo: LEIA_ME },
      ...cupons.map((c) => ({ nome: `cupons-exemplo/NFCe/${c.chave}-nfce.xml`, conteudo: cupomParaXml(c) })),
      {
        nome: `cupons-exemplo/Eventos/${cupons[0].chave}-cancelamento.xml`,
        conteudo: cancelamentoParaXml(cupons[0].chave, cupons[0].emissao),
      },
    ];
    const url = URL.createObjectURL(new Blob([criarZip(arquivos)], { type: 'application/zip' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `cupons-exemplo-${hojeLocal()}.zip` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [produtos]);

  const cupons = useMemo(() => juntarCupons([historico, reais], cancelados), [historico, reais, cancelados]);

  const analise = useMemo(() => {
    const porChave = new Map(produtos.filter((p) => p.ean || p.ref).map((p) => [chaveDoItem(p.ean, p.ref), p]));
    return analisarCombos(cupons, { produtoDe: (k) => porChave.get(k) ?? null, cfg: config });
  }, [cupons, produtos, config]);

  const valor = useMemo(
    () => ({
      cupons,
      analise,
      historicoSimulado: historico.length,
      cuponsLidos: reais.filter((c) => !cancelados.includes(c.chave)).length,
      pasta,
      leitura,
      suportaPasta: suportaPasta(),
      podeBaixarExemplo: produtos.some((p) => p.ref),
      conectarPasta,
      lerAgora,
      importarArquivos,
      desconectar,
      baixarExemplo,
    }),
    [cupons, analise, historico.length, reais, cancelados, pasta, leitura, produtos, conectarPasta, lerAgora, importarArquivos, desconectar, baixarExemplo],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCupons() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useCupons precisa estar dentro de <ProvedorCupons>');
  return c;
}
