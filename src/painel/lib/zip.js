// Arquivo .zip mínimo (sem compressão), para baixar a pasta de cupons de exemplo.
// Formato: PKWARE APPNOTE, entradas "stored" com nomes em UTF-8.

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dataDos(d) {
  const hora = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const data = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { hora, data };
}

// arquivos: [{ nome: 'pasta/arquivo.xml', conteudo: string }]
export function criarZip(arquivos, quando = new Date()) {
  const cod = new TextEncoder();
  const { hora, data } = dataDos(quando);
  const locais = [];
  const centrais = [];
  let deslocamento = 0;

  for (const arq of arquivos) {
    const nome = cod.encode(arq.nome);
    const dados = cod.encode(arq.conteudo);
    const crc = crc32(dados);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // versão necessária
    local.setUint16(6, 0x0800, true); // nomes em UTF-8
    local.setUint16(8, 0, true); // sem compressão
    local.setUint16(10, hora, true);
    local.setUint16(12, data, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, dados.length, true);
    local.setUint32(22, dados.length, true);
    local.setUint16(26, nome.length, true);
    local.setUint16(28, 0, true);
    locais.push(new Uint8Array(local.buffer), nome, dados);

    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, hora, true);
    central.setUint16(14, data, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, dados.length, true);
    central.setUint32(24, dados.length, true);
    central.setUint16(28, nome.length, true);
    central.setUint32(42, deslocamento, true);
    centrais.push(new Uint8Array(central.buffer), nome);

    deslocamento += 30 + nome.length + dados.length;
  }

  const tamanhoCentral = centrais.reduce((s, b) => s + b.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true);
  fim.setUint16(8, arquivos.length, true);
  fim.setUint16(10, arquivos.length, true);
  fim.setUint32(12, tamanhoCentral, true);
  fim.setUint32(16, deslocamento, true);

  const partes = [...locais, ...centrais, new Uint8Array(fim.buffer)];
  const total = partes.reduce((s, b) => s + b.length, 0);
  const saida = new Uint8Array(total);
  let i = 0;
  for (const b of partes) {
    saida.set(b, i);
    i += b.length;
  }
  return saida;
}
