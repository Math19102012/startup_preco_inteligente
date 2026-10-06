// Visão geral: quanto a loja deixa na mesa, onde está o dinheiro e o que já foi recuperado.
import { useState } from 'react';
import { Icone } from '../../components/Icone.jsx';
import { PLANOS } from '../../data/premissas.js';
import { multiplo, reais, reais0 } from '../../lib/formato.js';
import { Cabecalho, dataCurta, irPara, SeloStatus } from '../componentes/base.jsx';
import { recuperadoPorMes, useLoja } from '../estado/loja.jsx';

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

// Barras horizontais dos itens que mais rendem se corrigidos (uma série só, valor escrito na ponta).
function OndeEstaODinheiro({ linhas }) {
  const [ativo, setAtivo] = useState(null);
  const itens = linhas
    .filter((l) => l.diagnostico.impactoMes > 0)
    .sort((a, b) => b.diagnostico.impactoMes - a.diagnostico.impactoMes)
    .slice(0, 6);
  if (itens.length === 0) {
    return <p className="p-nota">Nenhum item abaixo da região ou no prejuízo. Bom trabalho!</p>;
  }
  const maximo = itens[0].diagnostico.impactoMes;
  return (
    <ol className="p-barras" aria-label="Itens que mais rendem por mês se corrigidos">
      {itens.map((l) => {
        const d = l.diagnostico;
        const aberto = ativo === l.produto.id;
        return (
          <li key={l.produto.id}>
            <button
              type="button"
              className="p-barras__linha"
              onMouseEnter={() => setAtivo(l.produto.id)}
              onMouseLeave={() => setAtivo(null)}
              onFocus={() => setAtivo(l.produto.id)}
              onBlur={() => setAtivo(null)}
              onClick={() => irPara('precos', { item: l.produto.id })}
            >
              <span className="p-barras__nome">{l.produto.nome}</span>
              <span className="p-barras__trilho">
                <i style={{ width: `${(d.impactoMes / maximo) * 100}%` }} />
              </span>
              <strong className="num">+{reais0(d.impactoMes)}</strong>
            </button>
            {aberto && (
              <div className="p-dica" role="tooltip">
                <SeloStatus status={d.status} />
                <span>
                  {reais(l.produto.preco)} → <b>{reais(d.sugestao)}</b> × {l.produto.vendasMes} vendas/mês
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function VisaoGeral() {
  const { estado, linhas, resumo } = useLoja();
  const { loja, alteracoes, produtos, notas } = estado;
  const plano = PLANOS.find((p) => p.id === loja.plano) ?? PLANOS[1];
  const recuperado = recuperadoPorMes(alteracoes, produtos);
  const pendentes = produtos.filter((p) => p.etiquetaPendente).length;
  const comFaixa = linhas.filter((l) => l.faixa);
  const amostras = comFaixa.length ? Math.round(comFaixa.reduce((s, l) => s + l.faixa.amostras, 0) / comFaixa.length) : 0;
  const itensComGanho = linhas.filter((l) => l.diagnostico.impactoMes > 0).length;
  const regiao = [loja.bairro, loja.cidade].filter(Boolean).join(', ');

  const blocos = [
    { status: 'prejuizo', texto: 'vendidos abaixo do custo real' },
    { status: 'abaixo', texto: 'mais baratos que toda a região' },
    { status: 'acima', texto: 'mais caros que toda a região' },
    { status: 'faixa', texto: 'dentro da faixa da região' },
  ];

  return (
    <>
      <Cabecalho titulo={`${saudacao()}, ${loja.nome}`}>
        Diagnóstico da semana de {dataCurta(new Date().toISOString())}. Seus {produtos.length} produtos comparados com, em
        média, {amostras} lojas{regiao ? ` perto de ${regiao}` : ''}.
      </Cabecalho>

      <section className="p-destaque">
        <div className="p-destaque__texto">
          <small>Você deixa na mesa</small>
          <strong className="num">
            {reais0(resumo.recuperavel)}
            <span>/mês</span>
          </strong>
          <p>
            em {itensComGanho} {itensComGanho === 1 ? 'item vendido' : 'itens vendidos'} abaixo da região ou no prejuízo.
            {plano.preco > 0 && resumo.recuperavel >= plano.preco && (
              <>
                {' '}
                Corrigindo, a assinatura de {reais0(plano.preco)} se paga <b>{multiplo(resumo.recuperavel / plano.preco)}</b>.
              </>
            )}
          </p>
        </div>
        <button type="button" className="p-botao p-botao--escuro p-botao--grande" onClick={() => irPara('precos')}>
          Ver e corrigir os preços
          <Icone nome="seta" tamanho={18} />
        </button>
      </section>

      <section className="p-situacoes" aria-label="Itens por situação">
        {blocos.map((b) => (
          <a key={b.status} className={`p-situacao p-situacao--${b.status}`} href={`#/precos?filtro=${b.status}`}>
            <SeloStatus status={b.status} />
            <strong className="num">{resumo.contagem[b.status]}</strong>
            <span>{b.texto}</span>
          </a>
        ))}
      </section>

      <div className="p-grade-2">
        <section className="p-cartao">
          <header className="p-cartao__topo">
            <h2>Onde está o dinheiro</h2>
            <span className="p-nota">ganho por mês ao ajustar cada item</span>
          </header>
          <OndeEstaODinheiro linhas={linhas} />
        </section>

        <div className="p-coluna">
          <section className="p-cartao p-recuperado">
            <header className="p-cartao__topo">
              <h2>Já recuperado</h2>
              <Icone nome="ganho" tamanho={22} />
            </header>
            <strong className="num">
              +{reais0(recuperado)}
              <span>/mês</span>
            </strong>
            <p className="p-nota">
              {alteracoes.length === 0
                ? 'Nenhum preço ajustado ainda. Aplique as sugestões da semana e o ganho aparece aqui.'
                : `${alteracoes.length} ${alteracoes.length === 1 ? 'preço ajustado' : 'preços ajustados'} desde ${dataCurta(loja.desde)}.`}
            </p>
            {pendentes > 0 && (
              <a className="p-botao p-botao--contorno" href="#/etiquetas">
                <Icone nome="imprimir" tamanho={18} />
                Imprimir {pendentes} {pendentes === 1 ? 'etiqueta nova' : 'etiquetas novas'}
              </a>
            )}
          </section>

          <section className="p-cartao">
            <header className="p-cartao__topo">
              <h2>Custos</h2>
              <Icone nome="documento" tamanho={22} />
            </header>
            {notas.length > 0 ? (
              <p className="p-nota">
                Última nota: <b>{notas[0].fornecedor}</b>, nº {notas[0].numero}, importada em {dataCurta(notas[0].importadaEm)}.{' '}
                {notas[0].atualizados} custos atualizados e {notas[0].criados} produtos novos.
              </p>
            ) : (
              <p className="p-nota">
                Importe o XML da nota do fornecedor para manter o custo de cada item em dia. Leva menos de um minuto.
              </p>
            )}
            <a className="p-botao p-botao--contorno" href="#/nota">
              <Icone nome="enviar" tamanho={18} />
              Importar nota fiscal
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
