import { useState } from 'react';
import fotoGrafico from '../assets/img/grafico-lucro.webp';
import { Controle, Escolha } from '../components/Controle.jsx';
import { Secao } from '../components/Secao.jsx';
import { MERCADINHO, PLANOS } from '../data/premissas.js';
import { pct, reais, reais0 } from '../lib/formato.js';
import { precoDoPlano, simularMercadinho } from '../lib/modelo.js';

const pct0 = (v) => pct(v, 0);
const pct1 = (v) => pct(v, 1);

export function Mercadinho() {
  const [faturamento, setFaturamento] = useState(MERCADINHO.faturamentoMensal);
  const [margemLiquida, setMargemLiquida] = useState(MERCADINHO.margemLiquida);
  const [fatia, setFatia] = useState(MERCADINHO.fatiaAbaixoDoMercado);
  const [ajuste, setAjuste] = useState(MERCADINHO.ajustePreco);
  const [perda, setPerda] = useState(MERCADINHO.perdaVolume);
  const [plano, setPlano] = useState(MERCADINHO.plano);

  const r = simularMercadinho({
    faturamentoMensal: faturamento,
    margemBruta: MERCADINHO.margemBruta,
    margemLiquida,
    fatiaAbaixoDoMercado: fatia,
    ajustePreco: ajuste,
    perdaVolume: perda,
    mensalidade: precoDoPlano(plano),
  });

  const compensa = r.ganhoLiquido > 0;
  const maiorBarra = Math.max(r.lucroAtual, r.lucroNovo, 1);
  const planosPagos = PLANOS.filter((p) => p.preco > 0);

  return (
    <Secao
      id="mercadinho"
      n="07"
      rotulo="Lucro do mercadinho"
      titulo="Quanto o dono do mercadinho ganha"
      lead="A assinatura só se sustenta se o cliente ganhar bem mais do que paga. Os valores iniciais descrevem um minimercado típico de 1 a 3 caixas. Mexa nos controles para testar outras lojas."
    >
      <div className="simulador">
        <div className="controles">
          <h4>A loja</h4>
          <Controle
            id="merc-faturamento"
            rotulo="Faturamento por mês"
            valor={faturamento}
            min={20000}
            max={300000}
            passo={5000}
            formatar={reais0}
            onChange={setFaturamento}
          />
          <Controle
            id="merc-lucro"
            rotulo="Lucro líquido hoje"
            valor={margemLiquida}
            min={0.01}
            max={0.1}
            passo={0.005}
            formatar={pct1}
            onChange={setMargemLiquida}
            ajuda="Parte do faturamento que sobra depois de todas as contas. No pequeno varejo fica entre 2% e 5%."
          />
          <Controle
            id="merc-fatia"
            rotulo="Vendas em itens abaixo da região"
            valor={fatia}
            min={0.05}
            max={0.4}
            passo={0.01}
            formatar={pct0}
            onChange={setFatia}
            ajuda="Parte do faturamento que vem de produtos vendidos mais barato que a faixa da vizinhança."
          />
          <Controle
            id="merc-ajuste"
            rotulo="Aumento aplicado nesses itens"
            valor={ajuste}
            min={0.01}
            max={0.08}
            passo={0.005}
            formatar={pct1}
            onChange={setAjuste}
            ajuda="Conservador: a diferença típica na mesma cidade é de 16,6%."
          />
          <Controle
            id="merc-perda"
            rotulo="Vendas perdidas por causa do aumento"
            valor={perda}
            min={0}
            max={0.1}
            passo={0.005}
            formatar={pct1}
            onChange={setPerda}
          />
          <Escolha
            rotulo="Plano"
            valor={plano}
            onChange={setPlano}
            opcoes={planosPagos.map((p) => ({ id: p.id, rotulo: `${p.nome} · R$ ${p.preco}` }))}
          />
        </div>

        <div className="resultado">
          <div className="tiles">
            <div className={compensa ? 'tile tile--destaque' : 'tile tile--bad'}>
              <small>Sobra a mais no mês</small>
              <strong>{reais0(r.ganhoLiquido)}</strong>
              <span>já descontada a assinatura</span>
            </div>
            <div className="tile">
              <small>Lucro do mês</small>
              <strong>{r.aumentoLucro >= 0 ? '+' : ''}{pct(r.aumentoLucro)}</strong>
              <span>
                de {reais0(r.lucroAtual)} para {reais0(r.lucroNovo)}
              </span>
            </div>
            <div className="tile">
              <small>Cada R$ 1 de assinatura</small>
              <strong>{r.retornoPorReal > 0 ? reais(r.retornoPorReal) : 'R$ 0,00'}</strong>
              <span>volta em margem recuperada</span>
            </div>
            <div className="tile">
              <small>A assinatura se paga em</small>
              <strong>{r.diasParaPagar ? `${Math.ceil(r.diasParaPagar)} dias` : 'não se paga'}</strong>
              <span>custa {reais(r.custoPorDia)} por dia</span>
            </div>
          </div>

          <div className="cartao">
            <div className="grafico__titulo">
              <strong>Lucro do dono por mês</strong>
              <span>Antes e depois de corrigir os preços abaixo da região</span>
            </div>
            <div className="barras">
              <div className="barra">
                <div className="barra__rotulo">
                  <span>Hoje</span>
                  <strong>{reais0(r.lucroAtual)}</strong>
                </div>
                <div className="barra__trilho">
                  <i style={{ width: `${(r.lucroAtual / maiorBarra) * 100}%`, background: 'var(--teal)' }} />
                </div>
              </div>
              <div className="barra">
                <div className="barra__rotulo">
                  <span>Com o Preço Inteligente</span>
                  <strong>{reais0(r.lucroNovo)}</strong>
                </div>
                <div className="barra__trilho">
                  <i
                    style={{
                      width: `${(Math.min(r.lucroAtual, r.lucroNovo) / maiorBarra) * 100}%`,
                      background: 'var(--teal)',
                    }}
                  />
                  {compensa && (
                    <i style={{ width: `${(r.ganhoLiquido / maiorBarra) * 100}%`, background: 'var(--amber)' }} />
                  )}
                </div>
              </div>
            </div>
            <div className="legenda" style={{ marginTop: 14, marginBottom: 0 }}>
              <span>
                <i style={{ background: 'var(--teal)' }} />
                Lucro que a loja já tem
              </span>
              <span>
                <i style={{ background: 'var(--amber)' }} />
                Ganho com o Preço Inteligente
              </span>
            </div>
          </div>

          <div className="foto-lateral">
            <div className="bloco" style={{ gap: 10 }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>De onde vem o ganho</strong>
              <p>
                A loja vende {reais0(r.receitaItens)} por mês em itens abaixo da faixa da região. Subir {pct1(ajuste)} o
                preço desses itens, perdendo {pct1(perda)} das vendas deles, rende {reais0(r.ganhoBruto)} a mais de
                lucro bruto. Descontada a assinatura de {reais0(r.mensalidade)}, sobram{' '}
                <strong>{reais0(r.ganhoLiquido)} por mês</strong>, ou <strong>{reais0(r.ganhoLiquidoAno)} por ano</strong>.
              </p>
              <p className="nota">
                Para a mensalidade se pagar, basta recuperar {reais(r.custoPorDia)} de margem por dia. O cálculo considera
                só os itens abaixo da região. Os itens acima, que espantam cliente, e os vendidos no vermelho são ganho
                extra que não entrou na conta. Margem bruta média considerada: {pct0(MERCADINHO.margemBruta)}.
              </p>
            </div>
            <img src={fotoGrafico} alt="Gráfico de linha verde subindo na tela de um notebook" loading="lazy" width="1400" height="933" />
          </div>
        </div>
      </div>
    </Secao>
  );
}
