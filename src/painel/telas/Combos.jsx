// Combos da semana: produtos que os clientes levam juntos, por dia e horário, tirados dos
// cupons de venda da própria loja (NFC-e). A pasta do caixa fica conectada e é lida sozinha.
import { useRef } from 'react';
import { Icone } from '../../components/Icone.jsx';
import { numero, pct, reais } from '../../lib/formato.js';
import { Aviso, Cabecalho, dataHora } from '../componentes/base.jsx';
import { useCupons } from '../estado/cupons.jsx';
import { useLoja } from '../estado/loja.jsx';
import { idMomento, medirCombo, nomeNaFrase } from '../lib/combos.js';
import { DIAS, PERIODOS } from '../lib/cupons.js';

const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]; // segunda a domingo
const curto = (dia) => DIAS[dia].slice(0, 3);


// Mapa de calor dia × período: de quem leva A, quantos levam B. Uma cor só, do claro ao escuro;
// o número está escrito em cada célula, então a cor nunca é a única pista.
function MapaCalor({ sugestao }) {
  const maior = Math.max(...sugestao.mapa.map((c) => c.taxa ?? 0), 0.01);
  const destaque = new Set(sugestao.janela.momentos);
  return (
    <table className="p-calor">
      <caption>
        De quem leva {nomeNaFrase(sugestao.a.nome)}, quantos também levam {nomeNaFrase(sugestao.b.nome)}. Contorno laranja: quando
        fazer a promoção. Ponto: poucos cupons.
      </caption>
      <thead>
        <tr>
          <th />
          {PERIODOS.map((p) => (
            <th key={p.id} scope="col">
              {p.rotulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ORDEM_DIAS.map((dia) => (
          <tr key={dia}>
            <th scope="row">{curto(dia)}</th>
            {PERIODOS.map((p) => {
              const c = sugestao.mapa.find((x) => x.dia === dia && x.periodo === p.id);
              const poucos = c.cuponsComA < 8;
              const forca = poucos ? 0 : (c.taxa ?? 0) / maior;
              const classe = [
                'p-calor__celula',
                poucos && 'p-calor__celula--poucos',
                forca > 0.55 && 'p-calor__celula--escura',
                destaque.has(idMomento(dia, p.id)) && 'p-calor__celula--janela',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <td
                  key={p.id}
                  className={classe}
                  style={{ '--forca': forca }}
                  title={`${DIAS[dia]} ${p.quando}: ${c.juntos} de ${c.cuponsComA} cupons com ${sugestao.a.nome}`}
                >
                  {poucos ? '·' : pct(c.taxa, 0)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Oferta({ s }) {
  const p = s.preco;
  if (!s.a.produto || !s.b.produto) {
    return <p className="p-nota">Cadastre os dois produtos em Produtos para o painel calcular o preço do combo.</p>;
  }
  if (!p?.viavel) {
    return <p className="p-combo__oferta">Sem margem para desconto: deixe os dois lado a lado na gôndola.</p>;
  }
  if (p.tipo === 'complemento') {
    return (
      <p className="p-combo__oferta">
        <span>
          <b>{s.b.nome.split(',')[0]}</b> por <b className="num">{reais(p.preco)}/kg</b> para quem leva {nomeNaFrase(s.a.nome)}
        </span>
        <small>
          de {reais(p.precoOriginal)}/kg · margem de {pct(p.margem, 0)} nesse preço
        </small>
      </p>
    );
  }
  return (
    <p className="p-combo__oferta">
      <span>
        Leve os dois por <b className="num">{reais(p.preco)}</b>
      </span>
      <small>
        de {reais(p.precoOriginal)} · economia de {reais(p.economia)} · margem de {pct(p.margem, 0)}
      </small>
    </p>
  );
}

function CartaoSugestao({ s, semanas, onCriar, onDispensar }) {
  const momentoTexto = s.janela.tipo === 'semana' ? 'em qualquer dia' : s.quando.toLowerCase();
  return (
    <article className="p-combo">
      <header className="p-combo__topo">
        <span className="p-combo__quando">
          <Icone nome="relogio" tamanho={15} />
          {s.quando}
        </span>
        <h3>
          {s.a.nome} <span aria-hidden="true">+</span>
          <span className="sr-only">e</span> {s.b.nome}
        </h3>
      </header>
      <p className="p-combo__fato">
        <b className="num">{pct(s.taxaCom, 0)}</b> de quem leva {nomeNaFrase(s.a.nome)} também leva {nomeNaFrase(s.b.nome)}.{' '}
        {s.fora
          ? `Nos outros dias e horários, só ${pct(s.fora.taxa, 0)}.`
          : `Entre os clientes que não levam ${nomeNaFrase(s.a.nome)}, só ${pct(s.taxaSem, 0)}.`}
      </p>
      <div className="p-combo__corpo">
        <MapaCalor sugestao={s} />
        <div className="p-combo__lado">
          <p className="p-nota">
            {numero(s.juntos)} cupons com os dois em {numero(semanas)} semanas. Por semana, cerca de{' '}
            <b>{numero(s.oportunidadeSemana)} clientes</b> levam {nomeNaFrase(s.a.nome)} {momentoTexto} sem levar{' '}
            {nomeNaFrase(s.b.nome)}: é o público da promoção.
          </p>
          <Oferta s={s} />
          <div className="p-acoes p-acoes--inicio">
            <button type="button" className="p-botao p-botao--tag" onClick={() => onCriar(s)}>
              <Icone nome="check" tamanho={17} />
              {s.preco?.viavel ? 'Criar combo' : 'Marcar como feito'}
            </button>
            <button type="button" className="p-botao p-botao--contorno" onClick={() => onDispensar(s)}>
              Dispensar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function FonteDosCupons() {
  const { estado } = useLoja();
  const c = useCupons();
  const seletor = useRef(null);
  const l = c.leitura;

  return (
    <section className="p-cartao p-fonte">
      <header className="p-cartao__topo">
        <h2>Cupons de venda (NFC-e)</h2>
        <Icone nome="pasta" tamanho={22} />
      </header>

      <div className="p-fonte__numeros">
        {c.historicoSimulado > 0 && (
          <div>
            <strong className="num">{numero(c.historicoSimulado)}</strong>
            <span>cupons simulados da loja de demonstração (8 semanas)</span>
          </div>
        )}
        <div>
          <strong className="num">{numero(c.cuponsLidos)}</strong>
          <span>cupons lidos da pasta do caixa</span>
        </div>
      </div>

      {c.pasta?.permissao === 'granted' && (
        <div className="p-fonte__pasta">
          <span>
            <Icone nome="pasta" tamanho={18} /> Pasta conectada: <b>{c.pasta.nome}</b>. O painel lê os cupons novos sozinho
            toda vez que é aberto neste computador.
          </span>
          <div className="p-acoes p-acoes--inicio">
            <button type="button" className="p-botao p-botao--contorno p-botao--pequeno" onClick={c.lerAgora} disabled={l.estado === 'lendo'}>
              {l.estado === 'lendo' ? 'Lendo…' : 'Ler agora'}
            </button>
            <button type="button" className="p-link" onClick={c.desconectar}>
              Desconectar
            </button>
          </div>
        </div>
      )}

      {c.pasta && c.pasta.permissao !== 'granted' && (
        <Aviso tipo="info">
          O navegador pediu para confirmar o acesso à pasta <b>{c.pasta.nome}</b>.{' '}
          <button type="button" className="p-link" onClick={c.lerAgora}>
            Permitir e ler os cupons novos
          </button>
        </Aviso>
      )}

      {!c.pasta && (
        <div className="p-fonte__conectar">
          <p>
            O programa de caixa grava o XML de cada cupom numa pasta do computador. Conecte essa pasta uma vez e o painel passa
            a ler os cupons novos sozinho.
          </p>
          {c.suportaPasta ? (
            <button type="button" className="p-botao p-botao--escuro" onClick={c.conectarPasta} disabled={l.estado === 'lendo'}>
              <Icone nome="pasta" tamanho={18} />
              Conectar a pasta do caixa
            </button>
          ) : (
            <>
              <p className="p-nota">
                Este navegador não permite deixar uma pasta conectada. Use o Chrome ou o Edge no computador do caixa, ou importe
                a pasta agora:
              </p>
              <button type="button" className="p-botao p-botao--escuro" onClick={() => seletor.current?.click()}>
                <Icone nome="enviar" tamanho={18} />
                Importar a pasta de cupons
              </button>
              <input
                ref={seletor}
                type="file"
                hidden
                multiple
                webkitdirectory=""
                onChange={(e) => {
                  // copia a lista antes de limpar o campo: limpar esvazia a FileList original
                  c.importarArquivos([...e.target.files]);
                  e.target.value = '';
                }}
              />
            </>
          )}
        </div>
      )}

      {l.estado === 'lendo' && <Aviso tipo="info">Lendo os cupons da pasta…</Aviso>}
      {l.estado === 'ok' && (
        <Aviso tipo="ok">
          Leitura de {dataHora(l.quando)}: {numero(l.novos)} {l.novos === 1 ? 'cupom novo' : 'cupons novos'}
          {l.cancelados > 0 && `, ${l.cancelados} cancelado${l.cancelados > 1 ? 's' : ''}`}
          {l.notasDeCompra > 0 && `, ${l.notasDeCompra} nota${l.notasDeCompra > 1 ? 's' : ''} de compra (importe em Nota fiscal)`}
          {l.ignorados > 0 && `, ${l.ignorados} arquivo${l.ignorados > 1 ? 's' : ''} que não são cupom`}.
        </Aviso>
      )}
      {l.estado === 'erro' && <Aviso tipo="erro">Não foi possível ler a pasta: {l.mensagem}</Aviso>}

      {estado.loja.demonstracao && c.podeBaixarExemplo && (
        <p className="p-nota">
          Para testar a conexão:{' '}
          <button type="button" className="p-link" onClick={c.baixarExemplo}>
            <Icone nome="baixar" tamanho={15} /> baixe a pasta de exemplo com os cupons de hoje
          </button>
          , descompacte e conecte a pasta <b>cupons-exemplo</b>.
        </p>
      )}
    </section>
  );
}

function CombosAtivos() {
  const { estado, despachar } = useLoja();
  const { cupons } = useCupons();
  if (estado.combos.length === 0) return null;
  return (
    <section className="p-cartao">
      <header className="p-cartao__topo">
        <h2>Combos ativos</h2>
        <a className="p-micro" href="#/etiquetas">
          Imprimir cartazes
        </a>
      </header>
      <ul className="p-ativos">
        {estado.combos.map((c) => {
          const m = medirCombo(cupons, c);
          return (
            <li key={c.id}>
              <div>
                <strong>
                  {c.nomeA} + {c.nomeB}
                </strong>
                <span className="p-nota">
                  {c.quando} · criado em {dataHora(c.criadoEm)}
                  {c.oferta && ` · ${c.oferta}`}
                </span>
              </div>
              <div className="p-ativos__medida">
                <span>
                  Antes: <b className="num">{m.antes.taxa === null ? '—' : pct(m.antes.taxa, 0)}</b> de quem levava{' '}
                  {nomeNaFrase(c.nomeA)} levava {nomeNaFrase(c.nomeB)}.
                </span>
                <span>
                  {m.depois.na >= 10 ? (
                    <>
                      Com o combo: <b className="num">{pct(m.depois.taxa, 0)}</b> ({m.depois.na} cupons com {nomeNaFrase(c.nomeA)}).
                    </>
                  ) : (
                    <>Com o combo: aguardando cupons ({m.depois.na} até agora no horário do combo).</>
                  )}
                </span>
              </div>
              <button type="button" className="p-link" onClick={() => despachar({ tipo: 'encerrar-combo', id: c.id })}>
                Encerrar
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Combos() {
  const { estado, despachar } = useLoja();
  const { analise } = useCupons();
  const usados = new Set([...estado.combosDispensados, ...estado.combos.map((c) => `${c.a}|${c.b}`)]);
  const sugestoes = analise.sugestoes.filter((s) => !usados.has(s.id));

  function criar(s) {
    const p = s.preco;
    const oferta = !p?.viavel
      ? 'lado a lado na gôndola'
      : p.tipo === 'complemento'
        ? `${s.b.nome.split(',')[0]} a ${reais(p.preco)}/kg levando ${nomeNaFrase(s.a.nome)}`
        : `os dois por ${reais(p.preco)}`;
    despachar({
      tipo: 'criar-combo',
      combo: {
        a: s.a.chave,
        b: s.b.chave,
        nomeA: s.a.nome,
        nomeB: s.b.nome,
        janela: s.janela,
        quando: s.quando,
        oferta,
        preco: p?.viavel ? p.preco : null,
        tipoOferta: p?.viavel ? p.tipo : 'vitrine',
      },
    });
  }

  return (
    <>
      <Cabecalho titulo="Combos da semana">
        Produtos que os seus clientes levam juntos, por dia e horário, tirados dos cupons de venda da loja. O preço do combo já
        respeita a sua margem mínima.
      </Cabecalho>

      <FonteDosCupons />

      {analise.cupons > 0 && analise.semanas < 4 && (
        <Aviso tipo="info">
          Ainda há pouco histórico ({numero(analise.cupons)} cupons). Com cerca de 8 semanas de cupons as sugestões ficam mais
          confiáveis.
        </Aviso>
      )}

      {sugestoes.length > 0 ? (
        <div className="p-combos">
          {sugestoes.map((s) => (
            <CartaoSugestao
              key={s.id}
              s={s}
              semanas={analise.semanas}
              onCriar={criar}
              onDispensar={() => despachar({ tipo: 'dispensar-combo', par: s.id })}
            />
          ))}
        </div>
      ) : (
        <div className="p-cartao p-vazio">
          {analise.cupons === 0
            ? 'Conecte a pasta do caixa para o painel encontrar os produtos que saem juntos.'
            : 'Nenhum padrão forte o bastante nos cupons até agora. O painel volta a procurar a cada leitura da pasta.'}
        </div>
      )}

      <CombosAtivos />

      <details className="p-cartao p-como">
        <summary>Como o painel encontra os combos</summary>
        <p>
          Para cada par de produtos, e para cada dia da semana e período do dia, o painel conta em quantos cupons os dois saíram
          juntos e compara com os outros cupons do mesmo horário. Um par só vira sugestão se aparecer junto em pelo menos 20
          cupons, se pelo menos 25% de quem leva o primeiro levar o segundo, e se isso for pelo menos 1,5 vez o normal.
        </p>
        <p>
          Como muitos pares são testados ao mesmo tempo, sempre aparece algum padrão por acaso. Para evitar isso, cada par passa
          por um teste estatístico (teste exato de Fisher), com a correção de Benjamini-Hochberg para muitos testes. Um segundo
          teste diz se o padrão é de um horário específico ou vale a semana toda.
        </p>
        <p>
          O preço do combo parte de 10% de desconto no segundo produto e nunca deixa a margem abaixo da margem mínima definida
          em Minha loja. O CPF que o consumidor pede na nota não é lido.
        </p>
      </details>
    </>
  );
}
