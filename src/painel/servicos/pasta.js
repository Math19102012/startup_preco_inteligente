// "Pasta conectada": o painel lê sozinho a pasta onde o programa de caixa grava os XMLs dos
// cupons. Usa a File System Access API (Chrome e Edge no computador): o lojista escolhe a pasta
// uma vez, o navegador guarda a autorização e, nas próximas aberturas, o painel lê os cupons
// novos sem ninguém enviar nada. Nos outros navegadores, a pasta é importada à mão.
import { gravarAjuste, lerAjuste } from './armazem.js';

export const suportaPasta = () => typeof window !== 'undefined' && 'showDirectoryPicker' in window;

export async function escolherPasta() {
  const pasta = await window.showDirectoryPicker({ id: 'cupons-nfce', mode: 'read' });
  await gravarAjuste('pasta', pasta).catch(() => {});
  return pasta;
}

export const pastaSalva = () => lerAjuste('pasta').catch(() => null);
export const esquecerPasta = () => gravarAjuste('pasta', null).catch(() => {});

// 'granted' | 'prompt' | 'denied'. Pedir permissão só funciona a partir de um clique.
export async function permissao(pasta, pedir = false) {
  const opcoes = { mode: 'read' };
  if ((await pasta.queryPermission(opcoes)) === 'granted') return 'granted';
  return pedir ? pasta.requestPermission(opcoes) : pasta.queryPermission(opcoes);
}

// Todos os .xml da pasta e das subpastas (o caixa costuma separar por ano e mês).
export async function arquivosDaPasta(pasta, caminho = '', profundidade = 0, saida = []) {
  for await (const [nome, item] of pasta.entries()) {
    const aqui = caminho ? `${caminho}/${nome}` : nome;
    if (item.kind === 'directory') {
      if (profundidade < 5) await arquivosDaPasta(item, aqui, profundidade + 1, saida);
    } else if (/\.xml$/i.test(nome)) {
      const arquivo = await item.getFile();
      saida.push({ caminho: aqui, assinatura: `${aqui}|${arquivo.size}|${arquivo.lastModified}`, ler: () => arquivo.text() });
    }
  }
  return saida;
}

// Arquivos vindos de <input type="file" webkitdirectory> (navegadores sem a API de pastas).
export function arquivosDoSeletor(lista) {
  return [...lista]
    .filter((f) => /\.xml$/i.test(f.name))
    .map((f) => {
      const caminho = f.webkitRelativePath || f.name;
      return { caminho, assinatura: `${caminho}|${f.size}|${f.lastModified}`, ler: () => f.text() };
    });
}
