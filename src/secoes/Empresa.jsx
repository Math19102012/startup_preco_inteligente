import canvasImg from '../assets/img/business-model-canvas.webp';
import { Icone } from '../components/Icone.jsx';
import { Secao, Subtitulo } from '../components/Secao.jsx';
import { BLOCOS_MODELO, EQUIPE, TRES_PERGUNTAS } from '../data/conteudo.js';
import { PLANOS } from '../data/premissas.js';

const iniciais = (nome) =>
  nome
    .split(' ')
    .filter((p) => p.length > 2)
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

export function Empresa() {
  return (
    <Secao
      id="empresa"
      n="05"
      rotulo="A empresa"
      titulo="Assinatura mensal, produto digital, custo baixo"
      lead="O Preço Inteligente é uma startup de software como serviço. A loja paga uma mensalidade, sem taxa de instalação, sem fidelidade e sem equipamento. Não temos estoque nem logística: o custo é nuvem e hora da equipe."
    >
      <blockquote className="citacao">
        A inteligência de preço das grandes redes <span>no bolso do mercado de bairro.</span>
      </blockquote>

      <div className="bloco">
        <Subtitulo titulo="Os quatro blocos que decidem o negócio">
          Do Business Model Canvas, os blocos que respondem se o negócio para em pé.
        </Subtitulo>
        <div className="grade-2">
          {BLOCOS_MODELO.map((b) => (
            <article key={b.titulo} className="cartao bloco-modelo">
              <h4>{b.titulo}</h4>
              <p>{b.texto}</p>
            </article>
          ))}
        </div>
        <div className="perguntas">
          {TRES_PERGUNTAS.map((p) => (
            <div key={p.pergunta}>
              <small>{p.pergunta}</small>
              <strong>{p.resposta}</strong>
              <span>{p.prova}</span>
            </div>
          ))}
        </div>
        <details className="canvas-completo">
          <summary>Ver o Business Model Canvas completo</summary>
          <img
            src={canvasImg}
            alt="Business Model Canvas do Preço Inteligente com os nove blocos preenchidos"
            width="2000"
            height="1091"
            loading="lazy"
          />
        </details>
      </div>

      <div className="bloco">
        <Subtitulo titulo="Planos">
          Valores de referência para o primeiro ano, a revisar depois do piloto. O plano gratuito é a porta de entrada.
        </Subtitulo>
        <div className="planos">
          {PLANOS.map((p) => (
            <article key={p.id} className={p.destaque ? 'plano plano--destaque' : 'plano'}>
              <div className="plano__topo">
                <h4>{p.nome}</h4>
                {p.destaque ? <span className="selo">Recomendado</span> : <span className="selo">{p.limite}</span>}
              </div>
              <div className="plano__preco">
                <strong>{p.preco === 0 ? 'Grátis' : `R$ ${p.preco}`}</strong>
                {p.preco > 0 && <span>por mês · {p.limite.toLowerCase()}</span>}
              </div>
              <p>{p.descricao}</p>
              <ul>
                {p.recursos.map((r) => (
                  <li key={r}>
                    <Icone nome="check" tamanho={16} />
                    {r}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="bloco">
        <Subtitulo titulo="Quem faz">
          Quatro integrantes do curso de Análise e Desenvolvimento de Sistemas, divididos entre dados, desenvolvimento e
          contato com as lojas.
        </Subtitulo>
        <div className="equipe">
          {EQUIPE.map((p) => (
            <div key={p.nome} className="pessoa">
              <span className="pessoa__iniciais" aria-hidden="true">
                {iniciais(p.nome)}
              </span>
              <div>
                <strong>{p.nome}</strong>
                <span className="pessoa__papel">{p.papel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Secao>
  );
}
