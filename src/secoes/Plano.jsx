import { Secao, Subtitulo } from '../components/Secao.jsx';
import { EQUIPE, FONTES, MARCOS, PLANO_5W2H, PROMESSA, RESGATE } from '../data/conteudo.js';

export function Plano() {
  return (
    <>
      <Secao
        id="plano"
        n="09"
        rotulo="Plano de ação"
        titulo="Do plano ao que vai ser feito"
        lead="O primeiro ciclo do produto responde uma pergunta: o comerciante muda o preço quando vê o dado? E quanto de margem isso recupera?"
      >
        <ol className="linha-tempo">
          {MARCOS.map((m) => (
            <li key={m.titulo}>
              <small>{m.quando}</small>
              <strong>{m.titulo}</strong>
              <p>{m.texto}</p>
            </li>
          ))}
        </ol>

        <div className="bloco">
          <Subtitulo titulo="5W2H do primeiro ciclo" />
          <dl className="w2h">
            {PLANO_5W2H.map((l) => (
              <div key={l.sigla}>
                <dt>
                  <b>{l.sigla}</b>
                  <span>{l.pergunta}</span>
                </dt>
                <dd>{l.resposta}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Secao>

      <section className="secao secao--escura" aria-labelledby="resgate-titulo">
        <div className="largura">
          <header className="cabecalho">
            <span className="sobretitulo">Resgate da promessa</span>
            <h2 id="resgate-titulo">{PROMESSA}</h2>
          </header>
          <ol className="resgate">
            {RESGATE.map((r) => (
              <li key={r.titulo}>
                <span>
                  <b>{r.titulo}:</b> {r.texto}
                </span>
              </li>
            ))}
          </ol>
          <p className="fecho">A promessa não é aspiração. É um compromisso com prazo, responsável e orçamento.</p>
        </div>
      </section>

      <footer className="rodape">
        <div className="largura">
          <p>
            <strong style={{ color: 'var(--on-dark)' }}>Preço Inteligente</strong> · Trabalho de Conclusão de Curso,
            Análise e Desenvolvimento de Sistemas · São Paulo, 2026
            <br />
            {EQUIPE.map((p) => p.nome).join(' · ')}
          </p>
          <div>
            <p style={{ marginBottom: 6 }}>Fontes de dados</p>
            <ul>
              {FONTES.map((f) => (
                <li key={f.url}>
                  <a href={f.url} target="_blank" rel="noreferrer">
                    {f.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
