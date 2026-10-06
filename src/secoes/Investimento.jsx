import { useMemo, useState } from 'react';
import fotoCandles from '../assets/img/candles.webp';
import fotoCelular from '../assets/img/celular-investimento.webp';
import fotoEscolha from '../assets/img/dinheiro-ou-ideia.webp';
import { Controle, Escolha } from '../components/Controle.jsx';
import { BarrasCenarios } from '../components/graficos/BarrasCenarios.jsx';
import { Colunas } from '../components/graficos/Colunas.jsx';
import { LinhaInvestimento } from '../components/graficos/LinhaInvestimento.jsx';
import { Subtitulo } from '../components/Secao.jsx';
import { LOJAS_BRASIL, RISCOS } from '../data/conteudo.js';
import {
  ANO_PRIMEIRA_AVALIACAO,
  CDI_ANUAL,
  CENARIO_PADRAO,
  CENARIOS,
  CUSTOS,
  HORIZONTE_ANOS,
  MIX_PLANOS,
  RODADA,
} from '../data/premissas.js';
import { multiplo, numero, pct, reais0, reaisCompacto } from '../lib/formato.js';
import { projetarCenario, simularInvestidor } from '../lib/modelo.js';

const pct0 = (v) => pct(v, 0);
const pct2 = (v) => pct(v, 2);

function TabelaProjecao({ projecao }) {
  const linhas = [
    { rotulo: 'Lojas pagantes no fim do ano', chave: 'lojasFim', fmt: numero },
    { rotulo: 'Receita', chave: 'receita', fmt: reaisCompacto },
    { rotulo: 'Impostos (Simples Nacional)', chave: 'impostos', fmt: (v) => reaisCompacto(-v) },
    { rotulo: 'Nuvem, dados e suporte', chave: 'infraestrutura', fmt: (v) => reaisCompacto(-v) },
    { rotulo: 'Conquista de lojas novas', chave: 'aquisicao', fmt: (v) => reaisCompacto(-v) },
    { rotulo: 'Equipe', chave: 'equipe', fmt: (v) => reaisCompacto(-v) },
    { rotulo: 'Administrativo e jurídico', chave: 'administrativo', fmt: (v) => reaisCompacto(-v) },
    { rotulo: 'Resultado do ano', chave: 'resultado', fmt: reaisCompacto, destaque: true },
    { rotulo: 'Caixa no fim do ano', chave: 'caixa', fmt: reaisCompacto },
    { rotulo: 'Valor estimado da empresa', chave: 'valorEmpresa', fmt: reaisCompacto },
  ];
  return (
    <div className="tabela-rolagem">
      <table className="tabela">
        <thead>
          <tr>
            <th>Cenário {projecao.cenario.nome.toLowerCase()}</th>
            {projecao.anos.map((a) => (
              <th key={a.ano} className="n">
                Ano {a.ano}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.chave} className={l.destaque ? 'destaque' : undefined}>
              <td>{l.rotulo}</td>
              {projecao.anos.map((a) => (
                <td key={a.ano} className="n">
                  {l.fmt(a[l.chave])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Investimento() {
  const [valor, setValor] = useState(100_000);
  const [cdi, setCdi] = useState(CDI_ANUAL);
  const [cenarioId, setCenarioId] = useState(CENARIO_PADRAO);

  const projecoes = useMemo(
    () => Object.fromEntries(Object.values(CENARIOS).map((c) => [c.id, projetarCenario(c)])),
    [],
  );
  const projecao = projecoes[cenarioId];
  const sim = simularInvestidor({ valor, projecao, cdi });
  const todos = Object.values(projecoes).map((p) => ({
    projecao: p,
    sim: simularInvestidor({ valor, projecao: p, cdi }),
  }));

  const startupGanha = sim.startupFinal > sim.cdiFinal;
  const ultimoAno = projecao.anos[HORIZONTE_ANOS - 1];
  const ticket = projecao.ticket;
  const maiorUso = Math.max(...RODADA.usoDosRecursos.map((u) => u.pct));

  return (
    <>
      <section id="investimento" className="invest-topo" aria-labelledby="investimento-titulo">
        <img className="invest-topo__img" src={fotoCandles} alt="" aria-hidden="true" width="1800" height="1200" />
        <div className="largura">
          <header className="cabecalho">
            <span className="sobretitulo" style={{ color: 'var(--on-dark-2)' }}>
              <span className="sobretitulo__n">08</span>
              Investimento
            </span>
            <h2 id="investimento-titulo">Quanto rende investir no Preço Inteligente</h2>
            <p className="lead" style={{ color: 'var(--on-dark-2)' }}>
              Comparamos o mesmo dinheiro em dois caminhos: aplicado no CDI a {pct0(CDI_ANUAL)} ao ano, com segurança e
              liquidez, ou investido na startup por {HORIZONTE_ANOS} anos. O CDI é o piso: um investimento com risco só
              faz sentido se render bem mais do que ele.
            </p>
          </header>
          <div className="proposta">
            <div>
              <small>Captação</small>
              <strong>{reaisCompacto(RODADA.valorCaptado)}</strong>
              <span>rodada de investimento-anjo</span>
            </div>
            <div>
              <small>Participação oferecida</small>
              <strong>{pct0(RODADA.participacao)}</strong>
              <span>da empresa para quem entra agora</span>
            </div>
            <div>
              <small>Valor da empresa</small>
              <strong>{reaisCompacto(projecao.posMoney)}</strong>
              <span>depois do aporte ({reaisCompacto(projecao.preMoney)} antes)</span>
            </div>
            <div>
              <small>Horizonte</small>
              <strong>{HORIZONTE_ANOS} anos</strong>
              <span>até a venda ou avaliação da participação</span>
            </div>
          </div>
          <p className="nota">Instrumento: {RODADA.instrumento}.</p>
        </div>
      </section>

      <section className="secao secao--alt" aria-label="Simulador do investidor" style={{ borderTop: 0 }}>
        <div className="largura">
          <div className="escolha-investidor">
            <img src={fotoEscolha} alt="Ilustração de um homem de terno segurando um saco de dinheiro em uma mão e uma lâmpada acesa na outra" width="442" height="626" />
            <Subtitulo titulo="Dinheiro no CDI ou na ideia?">
              Escolha quanto investir e em qual cenário acreditar. O resultado mostra quanto o mesmo valor vira em{' '}
              {HORIZONTE_ANOS} anos em cada caminho.
            </Subtitulo>
          </div>

          <div className="simulador">
            <div className="controles">
              <h4>O investimento</h4>
              <Controle
                id="inv-valor"
                rotulo="Quanto você investe"
                valor={valor}
                min={5000}
                max={RODADA.valorCaptado}
                passo={5000}
                formatar={reais0}
                onChange={setValor}
                ajuda={`Com esse valor você compra ${pct2(sim.participacaoInicial)} da empresa.`}
              />
              <Controle
                id="inv-cdi"
                rotulo="CDI ao ano"
                valor={cdi}
                min={0.08}
                max={0.2}
                passo={0.0025}
                formatar={pct2}
                onChange={setCdi}
              />
              <Escolha
                rotulo="Cenário da startup"
                valor={cenarioId}
                onChange={setCenarioId}
                opcoes={Object.values(CENARIOS).map((c) => ({ id: c.id, rotulo: c.nome }))}
              />
              <p className="nota">{CENARIOS[cenarioId].resumo}</p>
            </div>

            <div className="resultado">
              <div className="tiles">
                <div className="tile">
                  <small>No CDI</small>
                  <strong>{reaisCompacto(sim.cdiFinal)}</strong>
                  <span>lucro de {reaisCompacto(sim.lucroCdi)}</span>
                </div>
                <div className={startupGanha ? 'tile tile--destaque' : 'tile tile--bad'}>
                  <small>No Preço Inteligente</small>
                  <strong>{reaisCompacto(sim.startupFinal)}</strong>
                  <span>
                    {sim.lucroStartup >= 0 ? 'lucro' : 'perda'} de {reaisCompacto(Math.abs(sim.lucroStartup))}
                  </span>
                </div>
                <div className="tile">
                  <small>Rende por ano</small>
                  <strong>{pct(sim.taxaAnualStartup)}</strong>
                  <span>contra {pct(cdi)} do CDI</span>
                </div>
                <div className="tile">
                  <small>Multiplica o dinheiro</small>
                  <strong>{multiplo(sim.multiploStartup)}</strong>
                  <span>contra {multiplo(sim.multiploCdi, 2)} do CDI</span>
                </div>
              </div>

              <div className={startupGanha ? 'veredito' : 'veredito veredito--alerta'}>
                {startupGanha ? (
                  <p>
                    Em {HORIZONTE_ANOS} anos, {reaisCompacto(valor)} viram <b>{reaisCompacto(sim.startupFinal)}</b> no Preço
                    Inteligente e {reaisCompacto(sim.cdiFinal)} no CDI. O lucro é{' '}
                    <b>{sim.vezesOLucroDoCdi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} vezes</b> o do CDI.
                  </p>
                ) : (
                  <p>
                    Neste cenário o CDI ganha: {reaisCompacto(sim.cdiFinal)} contra <b>{reaisCompacto(sim.startupFinal)}</b>{' '}
                    na startup. É o risco de investir cedo, e por isso o cenário base precisa render muito mais que o CDI.
                  </p>
                )}
                <small>
                  Para empatar com o CDI, a empresa precisa ter {numero(sim.lojasEmpate)} lojas pagantes no ano{' '}
                  {HORIZONTE_ANOS}, ou {pct(sim.lojasEmpate / LOJAS_BRASIL, 2)} das lojas do varejo alimentar do país. O
                  cenário {CENARIOS[cenarioId].nome.toLowerCase()} prevê {numero(sim.lojasFinais)}.
                </small>
              </div>

              <div className="cartao">
                <div className="grafico__titulo">
                  <strong>
                    {reaisCompacto(valor)} ao longo de {HORIZONTE_ANOS} anos
                  </strong>
                  <span>
                    Cenário {CENARIOS[cenarioId].nome.toLowerCase()}. Passe o mouse no gráfico para ver cada ano.
                  </span>
                </div>
                <LinhaInvestimento serie={sim.serie} anoPrimeiraAvaliacao={ANO_PRIMEIRA_AVALIACAO} />
                <p className="nota" style={{ marginTop: 12 }}>
                  Nos primeiros anos a participação não tem com quem ser negociada, então vale o que foi pago. A partir do
                  ano {ANO_PRIMEIRA_AVALIACAO}, vale a sua fatia do valor da empresa, estimado em{' '}
                  {CENARIOS[cenarioId].multiploReceita} vezes a receita recorrente anual.
                </p>
              </div>
            </div>
          </div>

          <div className="bloco">
            <Subtitulo titulo="Os três cenários lado a lado">
              Quanto {reaisCompacto(valor)} viram em {HORIZONTE_ANOS} anos em cada caminho.
            </Subtitulo>
            <div className="cartao">
              <BarrasCenarios
                investido={valor}
                itens={[
                  { rotulo: `CDI ${pct(cdi)} a.a.`, valor: sim.cdiFinal, tipo: 'cdi' },
                  ...todos.map((t) => ({
                    rotulo: t.projecao.cenario.nome,
                    valor: t.sim.startupFinal,
                    tipo: 'cenario',
                    ativo: t.projecao.cenario.id === cenarioId,
                  })),
                ]}
              />
            </div>
            <div className="cenarios">
              {todos.map(({ projecao: p, sim: s }) => {
                const ano5 = p.anos[HORIZONTE_ANOS - 1];
                return (
                  <article key={p.cenario.id} className="cenario" data-ativo={p.cenario.id === cenarioId}>
                    <h4>{p.cenario.nome}</h4>
                    <p>{p.cenario.resumo}</p>
                    <dl>
                      <dt>Lojas no ano {HORIZONTE_ANOS}</dt>
                      <dd>{numero(ano5.lojasFim)}</dd>
                      <dt>Receita no ano {HORIZONTE_ANOS}</dt>
                      <dd>{reaisCompacto(ano5.receita)}</dd>
                      <dt>Lucro no ano {HORIZONTE_ANOS}</dt>
                      <dd>{reaisCompacto(ano5.resultado)}</dd>
                      <dt>Valor da empresa</dt>
                      <dd>{reaisCompacto(ano5.valorEmpresa)}</dd>
                      <dt>Retorno do investidor</dt>
                      <dd>
                        {multiplo(s.multiploStartup)} · {pct(s.taxaAnualStartup)} a.a.
                      </dd>
                    </dl>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="bloco">
            <Subtitulo titulo={`Projeção do cenário ${CENARIOS[cenarioId].nome.toLowerCase()}`}>
              A empresa queima caixa nos primeiros anos para conquistar lojas e passa a dar lucro no ano{' '}
              {projecao.anoLucro}. O caixa mais baixo fica em {reaisCompacto(projecao.caixaMinimo)}
              {projecao.aporteExtra > 0
                ? `, o que exigiria um aporte extra de ${reaisCompacto(projecao.aporteExtra)}.`
                : ', coberto pela reserva da captação.'}
            </Subtitulo>
            <div className="grade-2">
              <div className="cartao">
                <div className="grafico__titulo">
                  <strong>Lojas pagantes no fim de cada ano</strong>
                  <span>Já descontados os cancelamentos</span>
                </div>
                <Colunas
                  rotulo="Lojas pagantes"
                  dados={projecao.anos.map((a) => ({ rotulo: `Ano ${a.ano}`, valor: a.lojasFim }))}
                  cor="var(--teal)"
                  formatar={numero}
                />
              </div>
              <div className="cartao">
                <div className="grafico__titulo">
                  <strong>Resultado de cada ano</strong>
                  <span>Receita menos todos os custos. Abaixo da linha, prejuízo</span>
                </div>
                <Colunas
                  rotulo="Resultado do ano"
                  dados={projecao.anos.map((a) => ({ rotulo: `Ano ${a.ano}`, valor: a.resultado }))}
                  cor={(v) => (v >= 0 ? 'var(--good)' : 'var(--bad)')}
                  formatar={reaisCompacto}
                />
              </div>
            </div>
            <details className="numeros-grafico">
              <summary>Ver a projeção completa, ano a ano</summary>
              <TabelaProjecao projecao={projecao} />
            </details>
          </div>

          <div className="foto-lateral">
            <div className="bloco" style={{ gap: 20 }}>
              <Subtitulo titulo="Como o investidor ganha dinheiro" />
              <ol className="passos" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                <li>
                  <h4>A participação se valoriza</h4>
                  <p>
                    Quem entra com {reaisCompacto(RODADA.valorCaptado)} fica com {pct0(RODADA.participacao)} de uma empresa
                    que vale {reaisCompacto(projecao.posMoney)} hoje e {reaisCompacto(ultimoAno.valorEmpresa)} no ano{' '}
                    {HORIZONTE_ANOS} do cenário {CENARIOS[cenarioId].nome.toLowerCase()}.
                  </p>
                </li>
                <li>
                  <h4>Venda da participação</h4>
                  <p>
                    O retorno se realiza numa próxima rodada, na venda para um fundo ou para uma empresa do setor, como um
                    sistema de gestão do varejo que queira o módulo de preço.
                  </p>
                </li>
                <li>
                  <h4>Dividendos depois do lucro</h4>
                  <p>Quando o lucro acumulado ficar positivo, parte dele pode ser distribuída aos sócios.</p>
                </li>
              </ol>
            </div>
            <img src={fotoCelular} alt="Celular mostrando um aplicativo de investimentos com a carteira em alta, sobre gráficos impressos" width="900" height="1350" loading="lazy" />
          </div>

          <div className="bloco">
            <Subtitulo titulo="Para onde vai o dinheiro">
              Uso dos {reaisCompacto(RODADA.valorCaptado)} captados. A reserva cobre o ponto mais baixo do caixa no cenário
              base.
            </Subtitulo>
            <div className="cartao">
              <div className="barras">
                {RODADA.usoDosRecursos.map((u) => (
                  <div key={u.item} className="barra">
                    <div className="barra__rotulo">
                      <span>
                        <strong style={{ color: 'var(--ink)' }}>{u.item}</strong> · {u.detalhe}
                      </span>
                      <strong>
                        {pct0(u.pct)} · {reaisCompacto(u.pct * RODADA.valorCaptado)}
                      </strong>
                    </div>
                    <div className="barra__trilho">
                      <i style={{ width: `${(u.pct / maiorUso) * 100}%`, background: 'var(--teal)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bloco">
            <Subtitulo titulo="Riscos e como reduzimos cada um" />
            <div className="riscos">
              {RISCOS.map((r) => (
                <article key={r.risco} className="risco">
                  <h4>{r.risco}</h4>
                  <p>{r.resposta}</p>
                </article>
              ))}
            </div>
          </div>

          <p className="nota">
            Premissas do modelo: mensalidade média de {reaisCompacto(ticket)} por loja ({pct0(MIX_PLANOS.essencial)} no
            plano Essencial e {pct0(MIX_PLANOS.completo)} no Completo), cancelamento de{' '}
            {pct(CUSTOS.cancelamentoMensal)} das lojas por mês, {reaisCompacto(CUSTOS.custoAquisicaoPorLoja)} para
            conquistar cada loja, impostos de {pct0(CUSTOS.impostosSobreReceita)} sobre a receita e{' '}
            {reaisCompacto(CUSTOS.infraPorLojaMes)} de nuvem por loja ao mês. Valores brutos, antes do imposto de renda: no
            CDI o IR é de 15% após dois anos, e o ganho com a venda de participação também paga 15% até R$ 5 milhões de
            lucro. São estimativas do grupo para fins acadêmicos, não recomendação de investimento.
          </p>
        </div>
      </section>
    </>
  );
}
