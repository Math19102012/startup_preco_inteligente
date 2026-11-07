// Armazenamento local dos cupons de venda e da pasta conectada (IndexedDB do navegador).
// São milhares de cupons por mês: não cabem no localStorage, que guarda o resto do painel.
// Sem IndexedDB (aba anônima em alguns navegadores), tudo funciona só durante a visita.

const BANCO = 'preco-inteligente-painel';
const LOJAS = ['cupons', 'arquivos', 'cancelados', 'ajustes'];

let conexao = null;

function abrir() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('sem IndexedDB'));
  conexao ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(BANCO, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('cupons')) db.createObjectStore('cupons', { keyPath: 'chave' });
      if (!db.objectStoreNames.contains('arquivos')) db.createObjectStore('arquivos');
      if (!db.objectStoreNames.contains('cancelados')) db.createObjectStore('cancelados');
      if (!db.objectStoreNames.contains('ajustes')) db.createObjectStore('ajustes');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return conexao;
}

function transacao(lojas, modo, acao) {
  return abrir().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(lojas, modo);
        const resultado = acao(tx);
        // leituras devolvem a requisição: o valor é o result dela (undefined quando não há nada)
        tx.oncomplete = () => resolve(resultado instanceof IDBRequest ? resultado.result : resultado);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

export const todosOsCupons = () => transacao(['cupons'], 'readonly', (tx) => tx.objectStore('cupons').getAll());
export const todosOsCancelados = () => transacao(['cancelados'], 'readonly', (tx) => tx.objectStore('cancelados').getAllKeys());
export const assinaturasLidas = () => transacao(['arquivos'], 'readonly', (tx) => tx.objectStore('arquivos').getAllKeys());

// Grava o resultado de uma leitura da pasta numa única transação.
export function gravarLeitura({ cupons, cancelados, assinaturas }) {
  return transacao(['cupons', 'cancelados', 'arquivos'], 'readwrite', (tx) => {
    const c = tx.objectStore('cupons');
    for (const cupom of cupons) c.put(cupom);
    const x = tx.objectStore('cancelados');
    for (const chave of cancelados) x.put(true, chave);
    const a = tx.objectStore('arquivos');
    for (const s of assinaturas) a.put(true, s);
  });
}

export const lerAjuste = (chave) => transacao(['ajustes'], 'readonly', (tx) => tx.objectStore('ajustes').get(chave));
export const gravarAjuste = (chave, valor) =>
  transacao(['ajustes'], 'readwrite', (tx) => {
    tx.objectStore('ajustes').put(valor, chave);
  });

export const apagarTudo = () =>
  transacao(LOJAS, 'readwrite', (tx) => {
    for (const l of LOJAS) tx.objectStore(l).clear();
  });
