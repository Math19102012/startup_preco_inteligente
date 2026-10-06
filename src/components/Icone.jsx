// Ícones simples em traço (24×24).
const CAMINHOS = {
  seta: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alerta: 'M12 4l9 16H3L12 4zM12 10v4M12 17.5v.01',
  subir: 'M12 19V5M6 11l6-6 6 6',
  descer: 'M12 5v14M6 13l6 6 6-6',
  igual: 'M5 9h14M5 15h14',
  tarefa: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  dor: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 16s1.5-2 4-2 4 2 4 2M9 9.5h.01M15 9.5h.01',
  ganho: 'M4 17l6-6 4 4 6-7M14 8h6v6',
  loja: 'M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18M9 20v-6h6v6',
  estrela: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5z',
  interrogacao: 'M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4M12 17.5v.01',
  cifrao: 'M12 3v18M16.5 7.5C16 6 14.3 5 12 5 9.5 5 7.5 6.3 7.5 8.3c0 4.4 9 2.6 9 7.2 0 2-2 3.5-4.5 3.5-2.4 0-4.2-1-4.8-2.6',
  xis: 'M6 6l12 12M18 6L6 18',
  escudo: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
  alvo: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11v2h.01',
  // usados no painel do lojista
  casa: 'M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5',
  etiqueta: 'M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01',
  documento: 'M7 3h7l5 5v13H7V3zM14 3v5h5M10 13h6M10 17h6',
  caixa: 'M4 7l8-4 8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10',
  plugue: 'M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8zM12 16v5',
  ajuste: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4.5v5M8 14.5v5',
  barras: 'M4 5v14M7 5v14M10 5v14M14 5v14M16 5v14M20 5v14',
  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  mais: 'M12 5v14M5 12h14',
  enviar: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  baixar: 'M12 4v12M7 11l5 5 5-5M5 20h14',
  imprimir: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7v-7z',
  lixeira: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  lapis: 'M4 20l4-1L19 8l-3-3L5 16l-1 4zM14 7l3 3',
  sair: 'M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10',
  relogio: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
};

export function Icone({ nome, tamanho = 18, titulo }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : 'true'}
      role={titulo ? 'img' : undefined}
    >
      {titulo && <title>{titulo}</title>}
      <path d={CAMINHOS[nome]} />
    </svg>
  );
}

// Marca: etiqueta de preço com um traço de gráfico subindo.
export function Marca({ tamanho = 30 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 6.5A3.5 3.5 0 0 1 6.5 3H17l12 12-12 13L3 16.5V6.5z" fill="#ffd84a" />
      <circle cx="9" cy="9" r="2.2" fill="#0b3b3e" />
      <path d="M8 21l4.5-4.5 3 3L22 13" fill="none" stroke="#0b3b3e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
