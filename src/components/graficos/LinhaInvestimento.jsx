import { useState } from 'react';
import { useLargura } from '../../hooks/useLargura.js';
import { reais0, reaisCompacto } from '../../lib/formato.js';

function passoRedondo(maximo, alvo = 5) {
  const bruto = maximo / alvo;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const n = bruto / potencia;
  const fator = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return fator * potencia;
}

const rotuloAno = (a) => (a === 0 ? 'Hoje' : `Ano ${a}`);

// Evolução do mesmo valor no CDI, ano a ano, e o valor da participação na startup nos anos
// em que ela tem preço. Antes da primeira avaliação não há negociação, então o gráfico não
// desenha um valor inventado para a startup nesses anos.
export function LinhaInvestimento({ serie, anoPrimeiraAvaliacao }) {
  const [ref, w] = useLargura(720);
  const [ano, setAno] = useState(null);

  const compacto = w < 560;
  const m = { topo: 28, direita: compacto ? 92 : 132, base: 34, esquerda: compacto ? 58 : 70 };
  const altura = compacto ? 280 : 340;
  const ultimo = serie[serie.length - 1];

  const maior = Math.max(...serie.map((p) => Math.max(p.cdi, p.startup)));
  const passo = passoRedondo(maior * 1.08);
  const teto = Math.ceil((maior * 1.08) / passo) * passo;
  const marcas = [];
  for (let v = 0; v <= teto + 1e-6; v += passo) marcas.push(v);

  const x = (a) => m.esquerda + (a / ultimo.ano) * (w - m.esquerda - m.direita);
  const y = (v) => m.topo + (1 - v / teto) * (altura - m.topo - m.base);
  const caminho = (chave, pontos = serie) => pontos.map((p, i) => `${i ? 'L' : 'M'}${x(p.ano)},${y(p[chave])}`).join(' ');
  const avaliados = serie.filter((p) => p.avaliado);
  const temPreco = (p) => p.ano === 0 || p.avaliado;

  // rótulos no fim das linhas; se ficarem próximos demais, afasta e liga com um traço
  const fins = [
    { chave: 'startup', nome: 'Preço Inteligente', valor: ultimo.startup, cor: 'var(--amber)' },
    { chave: 'cdi', nome: 'CDI', valor: ultimo.cdi, cor: 'var(--slate)' },
  ]
    .map((f) => ({ ...f, yPonto: y(f.valor), yRotulo: y(f.valor) }))
    .sort((a, b) => a.yPonto - b.yPonto);
  const distancia = 40;
  if (fins[1].yRotulo - fins[0].yRotulo < distancia) {
    const meio = (fins[0].yPonto + fins[1].yPonto) / 2;
    fins[0].yRotulo = meio - distancia / 2;
    fins[1].yRotulo = meio + distancia / 2;
  }

  const aoMover = (e) => {
    const caixa = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - caixa.left;
    const a = Math.round(((px - m.esquerda) / (w - m.esquerda - m.direita)) * ultimo.ano);
    setAno(Math.max(0, Math.min(ultimo.ano, a)));
  };

  const pontoAtivo = ano === null ? null : serie[ano];
  const fimFaixa = anoPrimeiraAvaliacao - 1;

  return (
    <div className="grafico" ref={ref}>
      <div className="legenda" aria-hidden="true">
        <span>
          <i className="linha" style={{ background: 'var(--amber)' }} />
          Investido no Preço Inteligente
        </span>
        <span>
          <i className="linha" style={{ background: 'var(--slate)' }} />
          Aplicado no CDI
        </span>
      </div>
      <svg
        width={w}
        height={altura}
        role="img"
        aria-label={`Em ${ultimo.ano} anos: ${reais0(ultimo.startup)} na startup contra ${reais0(ultimo.cdi)} no CDI.`}
        onMouseMove={aoMover}
        onMouseLeave={() => setAno(null)}
        onTouchStart={(e) => aoMover(e.touches[0] ? { currentTarget: e.currentTarget, clientX: e.touches[0].clientX } : e)}
      >
        {fimFaixa > 0 && (
          <g>
            <rect
              x={x(0)}
              y={m.topo}
              width={x(fimFaixa) - x(0)}
              height={altura - m.topo - m.base}
              fill="var(--paper-2)"
            />
            <text x={x(0) + 8} y={m.topo + 16} fontSize="11.5" fontWeight="600" fill="var(--muted)">
              {compacto ? 'Sem preço até a saída' : 'Participação sem preço de mercado até a saída'}
            </text>
          </g>
        )}
        {marcas.map((v) => (
          <g key={v}>
            <line x1={m.esquerda} x2={w - m.direita} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={m.esquerda - 10} y={y(v) + 4} textAnchor="end" fontSize="12" fill="var(--muted)" className="num">
              {reaisCompacto(v)}
            </text>
          </g>
        ))}
        {serie.map((p) => (
          <text
            key={p.ano}
            x={x(p.ano)}
            y={altura - 10}
            textAnchor="middle"
            fontSize="12"
            fill={ano === p.ano ? 'var(--ink)' : 'var(--muted)'}
            fontWeight={ano === p.ano ? 700 : 400}
          >
            {compacto && p.ano > 0 ? p.ano : rotuloAno(p.ano)}
          </text>
        ))}

        {pontoAtivo && (
          <line
            x1={x(pontoAtivo.ano)}
            x2={x(pontoAtivo.ano)}
            y1={m.topo}
            y2={altura - m.base}
            stroke="var(--ink-2)"
            strokeWidth="1"
          />
        )}

        <path d={caminho('cdi')} fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {avaliados.length > 1 && (
          <path d={caminho('startup', avaliados)} fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {/* distância entre o CDI e a startup na saída */}
        <line
          x1={x(ultimo.ano)}
          x2={x(ultimo.ano)}
          y1={y(ultimo.cdi)}
          y2={y(ultimo.startup)}
          stroke="var(--amber)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <circle cx={x(0)} cy={y(serie[0].startup)} r="5" fill="var(--amber)" stroke="var(--paper)" strokeWidth="2" />

        {pontoAtivo &&
          ['cdi', 'startup']
            .filter((k) => k === 'cdi' || temPreco(pontoAtivo))
            .map((k) => (
            <circle
              key={k}
              cx={x(pontoAtivo.ano)}
              cy={y(pontoAtivo[k])}
              r="5"
              fill={k === 'cdi' ? 'var(--slate)' : 'var(--amber)'}
              stroke="var(--paper)"
              strokeWidth="2"
            />
          ))}

        {fins.map((f) => (
          <g key={f.chave}>
            <circle cx={x(ultimo.ano)} cy={f.yPonto} r="5" fill={f.cor} stroke="var(--paper)" strokeWidth="2" />
            {Math.abs(f.yRotulo - f.yPonto) > 2 && (
              <line x1={x(ultimo.ano) + 7} x2={x(ultimo.ano) + 14} y1={f.yPonto} y2={f.yRotulo} stroke="var(--muted)" strokeWidth="1" />
            )}
            <text x={x(ultimo.ano) + 16} y={f.yRotulo - 3} fontSize="12" fill="var(--ink-2)">
              {f.nome}
            </text>
            <text x={x(ultimo.ano) + 16} y={f.yRotulo + 14} fontSize="15" fontWeight="700" fill="var(--ink)" className="num">
              {reaisCompacto(f.valor)}
            </text>
          </g>
        ))}
      </svg>

      {pontoAtivo && (
        <div
          className="dica"
          style={{
            left: x(pontoAtivo.ano) > w / 2 ? Math.max(0, x(pontoAtivo.ano) - 262) : x(pontoAtivo.ano) + 12,
            top: m.topo + 8,
          }}
        >
          <strong>{rotuloAno(pontoAtivo.ano)}</strong>
          <dl>
            <dt>Preço Inteligente</dt>
            <dd>{temPreco(pontoAtivo) ? reais0(pontoAtivo.startup) : 'sem preço até a saída'}</dd>
            <dt>CDI</dt>
            <dd>{reais0(pontoAtivo.cdi)}</dd>
            {pontoAtivo.ano > 0 && temPreco(pontoAtivo) && (
              <>
                <dt>Diferença</dt>
                <dd>{reais0(pontoAtivo.startup - pontoAtivo.cdi)}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
