// Peças pequenas reaproveitadas pelas telas do painel.
import { useEffect, useRef, useState } from 'react';
import { Icone } from '../../components/Icone.jsx';
import { reais } from '../../lib/formato.js';
import { STATUS } from '../lib/precificacao.js';

// ---------------------------------------------------------------------------
// Rotas por hash (#/precos), que funcionam no GitHub Pages e abrindo o arquivo direto
// ---------------------------------------------------------------------------
const lerRota = () => {
  const [caminho, busca = ''] = window.location.hash.replace(/^#\/?/, '').split('?');
  return { tela: caminho || 'inicio', parametros: new URLSearchParams(busca) };
};

export function useRota() {
  const [rota, setRota] = useState(lerRota);
  useEffect(() => {
    const mudou = () => {
      setRota(lerRota());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', mudou);
    return () => window.removeEventListener('hashchange', mudou);
  }, []);
  return rota;
}

export const irPara = (tela, parametros) => {
  window.location.hash = `/${tela}${parametros ? `?${new URLSearchParams(parametros)}` : ''}`;
};

// ---------------------------------------------------------------------------
// Situação do item (sempre ícone + texto, nunca só cor)
// ---------------------------------------------------------------------------
export function SeloStatus({ status, curto = false }) {
  const s = STATUS[status];
  return (
    <span className={`p-status p-status--${status}`}>
      <Icone nome={s.icone} tamanho={15} />
      {curto ? s.curto : s.rotulo}
    </span>
  );
}

// Faixa da região: barra do menor ao maior preço, traço na mediana e ponto no preço da loja.
export function FaixaRegiao({ faixa, preco, sugestao, status, largura = 168 }) {
  if (!faixa) return <span className="p-nota">Sem coleta na região</span>;
  const valores = [faixa.min, faixa.max, preco, sugestao].filter((v) => v != null);
  const lo = Math.min(...valores);
  const hi = Math.max(...valores);
  const folga = (hi - lo) * 0.08 || 1;
  const x = (v) => 7 + ((v - (lo - folga)) / (hi - lo + folga * 2)) * (largura - 14);
  return (
    <svg
      className="p-faixa"
      width={largura}
      height="24"
      role="img"
      aria-label={`Região de ${reais(faixa.min)} a ${reais(faixa.max)}, mediana ${reais(faixa.mediana)}. Seu preço ${reais(preco)}.`}
    >
      <rect x={x(faixa.min)} y="9" width={Math.max(2, x(faixa.max) - x(faixa.min))} height="6" rx="3" fill="var(--teal-soft)" />
      <rect x={x(faixa.mediana) - 1} y="5" width="2" height="14" rx="1" fill="var(--teal-ink)" />
      {sugestao != null && (
        <circle cx={x(sugestao)} cy="12" r="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="2 2" />
      )}
      <circle cx={x(preco)} cy="12" r="6" className={`p-faixa__ponto p-faixa__ponto--${status}`} stroke="var(--paper)" strokeWidth="2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Janela (diálogo nativo, com Esc e foco preso de graça)
// ---------------------------------------------------------------------------
export function Janela({ aberta, titulo, onFechar, children, largura = 620 }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) d.showModal();
    if (!aberta && d.open) d.close();
  }, [aberta]);
  return (
    <dialog
      ref={ref}
      className="p-janela"
      style={{ '--largura': `${largura}px` }}
      onClose={onFechar}
      onClick={(e) => e.target === ref.current && onFechar()}
    >
      {aberta && (
        <div className="p-janela__corpo">
          <header className="p-janela__topo">
            <h2>{titulo}</h2>
            <button type="button" className="p-icone-botao" onClick={onFechar} aria-label="Fechar">
              <Icone nome="xis" tamanho={20} />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}

// Campo de formulário com rótulo em cima e ajuda embaixo.
export function Campo({ rotulo, ajuda, erro, children, id }) {
  return (
    <div className={erro ? 'p-campo p-campo--erro' : 'p-campo'}>
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {erro ? <small role="alert">{erro}</small> : ajuda && <small>{ajuda}</small>}
    </div>
  );
}

// Campo de dinheiro: digita "12,5" ou "12.50", guarda número.
export function CampoReais({ id, valor, onChange, ...resto }) {
  const [texto, setTexto] = useState(valor ? valor.toFixed(2).replace('.', ',') : '');
  useEffect(() => {
    const atual = Number(texto.replace(/\./g, '').replace(',', '.'));
    if (valor !== atual) setTexto(valor ? valor.toFixed(2).replace('.', ',') : '');
    // só reage quando o valor muda por fora (ex.: botão "usar sugestão"), não a cada tecla
  }, [valor]);
  return (
    <div className="p-reais">
      <span aria-hidden="true">R$</span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={texto}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d,.]/g, '');
          setTexto(t);
          const n = Number(t.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
          onChange(Number.isFinite(n) ? Math.round(n * 100) / 100 : 0);
        }}
        {...resto}
      />
    </div>
  );
}

export function Aviso({ tipo = 'info', children }) {
  const icone = { info: 'interrogacao', ok: 'check', erro: 'alerta' }[tipo];
  return (
    <div className={`p-aviso p-aviso--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <Icone nome={icone} tamanho={18} />
      <div>{children}</div>
    </div>
  );
}

export function Cabecalho({ titulo, children, acoes }) {
  return (
    <header className="p-cabecalho">
      <div>
        <h1>{titulo}</h1>
        {children && <p>{children}</p>}
      </div>
      {acoes && <div className="p-cabecalho__acoes">{acoes}</div>}
    </header>
  );
}

export const dataCurta = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const dataHora = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
