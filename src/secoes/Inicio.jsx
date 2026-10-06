import { Etiqueta } from '../components/Etiqueta.jsx';
import { CASO_EXTREMO, PROBLEMA_NUMEROS } from '../data/conteudo.js';
import { pct, reais } from '../lib/formato.js';

export function Inicio() {
  const diferenca = CASO_EXTREMO.maior - CASO_EXTREMO.menor;
  return (
    <header id="inicio" className="inicio">
      <div className="inicio__grade">
        <div className="inicio__texto">
          <span className="sobretitulo">
            <span className="sobretitulo__n">01</span>
            Apoio à definição de preços no pequeno varejo
          </span>
          <h1>
            Mesmo botijão. Mesma cidade. Mesma semana. <em>R$ {Math.round(diferenca)} de diferença.</em>
          </h1>
          <p className="inicio__promessa">
            O dono do mercadinho não sabe por quanto o vizinho vende, nem quanto cada produto custa para ele de verdade.{' '}
            <strong>
              O Preço Inteligente mostra, em uma semana, quais produtos ele vende fora do preço da região e quanto isso
              custa por mês.
            </strong>
          </p>
          <div className="botoes">
            <a className="botao botao--tag" href="#investimento">
              Ver quanto rende investir
            </a>
            <a className="botao botao--contorno" href="#produto">
              Ver o produto funcionando
            </a>
          </div>
        </div>

        <div className="inicio__etiquetas">
          <Etiqueta valor={CASO_EXTREMO.menor} produto="Botijão 13 kg" rodape="Revenda A" />
          <Etiqueta valor={CASO_EXTREMO.maior} produto="Botijão 13 kg" rodape="Revenda B" />
          <p className="inicio__legenda">
            <span className="inicio__diferenca">+{pct(CASO_EXTREMO.maior / CASO_EXTREMO.menor - 1)}</span>
            {CASO_EXTREMO.cidade} (SP), {CASO_EXTREMO.periodo}. {CASO_EXTREMO.revendas} revendas pesquisadas pela ANP,
            de {reais(CASO_EXTREMO.menor)} a {reais(CASO_EXTREMO.maior)}.
          </p>
        </div>
      </div>

      <div className="numeros">
        {PROBLEMA_NUMEROS.map((n) => (
          <div key={n.rotulo}>
            <strong>{n.valor}</strong>
            <span>{n.rotulo}</span>
            <small>{n.detalhe}</small>
          </div>
        ))}
      </div>
      <p className="inicio__fonte">
        Fonte: Série Histórica de Preços da ANP, gás de cozinha, estado de São Paulo, janeiro a agosto de 2026. Dados
        tratados pelo grupo na 1ª entrega do projeto.
      </p>
    </header>
  );
}
