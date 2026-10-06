import { MapaPosicionamento } from '../components/graficos/MapaPosicionamento.jsx';
import { Icone } from '../components/Icone.jsx';
import { Secao, Subtitulo } from '../components/Secao.jsx';
import { ESTRATEGIAS, MAPAS, MERCADO, SWOT } from '../data/conteudo.js';

function Quadrante({ tipo, titulo, itens, icone }) {
  return (
    <div className={`quadrante quadrante--${tipo}`}>
      <h4>
        <Icone nome={icone} tamanho={18} />
        {titulo}
      </h4>
      <ul>
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

export function Mercado() {
  return (
    <Secao
      id="mercado"
      n="06"
      rotulo="Mercado e concorrência"
      titulo="Um mercado enorme, e um espaço que ninguém ocupa"
      lead="As ferramentas de precificação que existem no Brasil miram o varejo de médio e grande porte e o comércio eletrônico. O mercadinho de bairro, que é a maior parte das lojas, ficou com a planilha e a intuição."
      variante="alt"
    >
      <div className="mercado-numeros">
        {MERCADO.map((m) => (
          <div key={m.valor}>
            <strong>{m.valor}</strong>
            <span>{m.rotulo}</span>
            <a href={m.url} target="_blank" rel="noreferrer">
              Fonte: {m.fonte}
            </a>
          </div>
        ))}
      </div>

      <div className="bloco">
        <Subtitulo titulo="Onde estamos em relação aos concorrentes">
          Três mapas de posicionamento com concorrentes reais do mercado brasileiro de precificação.
        </Subtitulo>
        <div className="mapas">
          {MAPAS.map((m) => (
            <MapaPosicionamento key={m.id} mapa={m} />
          ))}
        </div>
        <p className="nota leitura">
          <strong>Leitura:</strong> nos três mapas o Preço Inteligente ocupa um espaço vazio. Ninguém entrega análise
          profunda a preço baixo, com implantação rápida, para loja pequena. Posicionamento estimado pelo grupo a partir
          do material público de cada empresa.
        </p>
      </div>

      <div className="bloco">
        <Subtitulo titulo="Diagnóstico: forças, fraquezas, oportunidades e ameaças" />
        <div className="swot">
          <span />
          <span className="swot__cabeca">Ajuda</span>
          <span className="swot__cabeca">Atrapalha</span>
          <span className="swot__rotulo">Ambiente interno</span>
          <Quadrante tipo="forcas" titulo="Forças" itens={SWOT.forcas} icone="escudo" />
          <Quadrante tipo="fraquezas" titulo="Fraquezas" itens={SWOT.fraquezas} icone="alerta" />
          <span className="swot__rotulo">Ambiente externo</span>
          <Quadrante tipo="oportunidades" titulo="Oportunidades" itens={SWOT.oportunidades} icone="alvo" />
          <Quadrante tipo="ameacas" titulo="Ameaças" itens={SWOT.ameacas} icone="alerta" />
        </div>
      </div>

      <div className="bloco">
        <Subtitulo titulo="O que fazemos com esse diagnóstico">
          SWOT cruzada: cada combinação de quadrantes virou uma decisão.
        </Subtitulo>
        <div className="estrategias">
          {ESTRATEGIAS.map((e) => (
            <article key={e.nome} className="estrategia">
              <h4>{e.nome}</h4>
              <small>{e.cruzamento}</small>
              <p>{e.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </Secao>
  );
}
