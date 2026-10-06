// Minha loja: cadastro (CNPJ e CEP pelas APIs), custos que entram no preço e plano.
import { useState } from 'react';
import { Icone } from '../../components/Icone.jsx';
import { PLANOS } from '../../data/premissas.js';
import { pct, reais } from '../../lib/formato.js';
import { Aviso, Cabecalho, Campo } from '../componentes/base.jsx';
import { useLoja } from '../estado/loja.jsx';
import { FINAIS, precoMinimo } from '../lib/precificacao.js';
import { formatarCep, formatarCnpj, soDigitos } from '../lib/validacao.js';
import { buscarCep, buscarCnpj } from '../servicos/apis.js';

const CUSTOS = [
  { id: 'imposto', rotulo: 'Imposto sobre a venda', ajuda: 'Simples Nacional do comércio começa em 4%.', max: 0.2, passo: 0.005 },
  { id: 'taxaCartao', rotulo: 'Taxa da maquininha', ajuda: 'Média entre débito e crédito.', max: 0.06, passo: 0.001 },
  { id: 'fatiaCartao', rotulo: 'Vendas no cartão', ajuda: 'O resto é dinheiro ou Pix, sem taxa.', max: 1, passo: 0.05 },
  { id: 'perdas', rotulo: 'Perdas', ajuda: 'Quebra, validade e furto, sobre o custo.', max: 0.15, passo: 0.005 },
  { id: 'margemMinima', rotulo: 'Margem mínima por item', ajuda: 'Abaixo disso, o painel sugere subir.', max: 0.3, passo: 0.01 },
];

export function MinhaLoja() {
  const { estado, despachar } = useLoja();
  const { loja, config } = estado;
  const [rascunho, setRascunho] = useState(loja);
  const [mensagem, setMensagem] = useState(null);
  const [buscando, setBuscando] = useState(null);

  const muda = (campo) => (e) => setRascunho((l) => ({ ...l, [campo]: e.target.value }));

  async function porCnpj() {
    setBuscando('cnpj');
    setMensagem(null);
    try {
      const { ms, ...d } = await buscarCnpj(rascunho.cnpj);
      setRascunho((l) => ({ ...l, ...d, nome: d.nome || l.nome }));
      setMensagem({ tipo: 'ok', texto: `Dados da Receita Federal carregados pela BrasilAPI em ${ms} ms. Clique em salvar.` });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setBuscando(null);
    }
  }

  async function porCep() {
    setBuscando('cep');
    setMensagem(null);
    try {
      const c = await buscarCep(rascunho.cep);
      setRascunho((l) => ({ ...l, logradouro: c.logradouro || l.logradouro, bairro: c.bairro, cidade: c.cidade, uf: c.uf }));
      setMensagem({ tipo: 'ok', texto: `Endereço encontrado pelo ${c.fonte} em ${c.ms} ms. Clique em salvar.` });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setBuscando(null);
    }
  }

  const exemplo = precoMinimo(10, config, 0);
  const alterado = JSON.stringify(rascunho) !== JSON.stringify(loja);

  return (
    <>
      <Cabecalho titulo="Minha loja">Cadastro, custos que entram no preço e plano de assinatura.</Cabecalho>

      <div className="p-grade-2">
        <section className="p-cartao">
          <header className="p-cartao__topo">
            <h2>Cadastro</h2>
            <Icone nome="loja" tamanho={22} />
          </header>
          {mensagem && <Aviso tipo={mensagem.tipo}>{mensagem.texto}</Aviso>}
          <form
            className="p-grade-form"
            onSubmit={(e) => {
              e.preventDefault();
              despachar({ tipo: 'atualizar-loja', dados: rascunho });
              setMensagem({ tipo: 'ok', texto: 'Cadastro salvo. O diagnóstico já usa a região nova.' });
            }}
          >
            <div className="p-grade-form__inteiro">
              <Campo id="cnpj-loja" rotulo="CNPJ">
                <div className="p-linha">
                  <input
                    id="cnpj-loja"
                    inputMode="numeric"
                    value={formatarCnpj(rascunho.cnpj ?? '')}
                    placeholder="00.000.000/0000-00"
                    onChange={(e) => setRascunho((l) => ({ ...l, cnpj: soDigitos(e.target.value) }))}
                  />
                  <button type="button" className="p-botao p-botao--escuro" onClick={porCnpj} disabled={buscando !== null || soDigitos(rascunho.cnpj).length !== 14}>
                    {buscando === 'cnpj' ? 'Buscando…' : 'Buscar na Receita'}
                  </button>
                </div>
              </Campo>
            </div>
            <div className="p-grade-form__inteiro">
              <Campo id="nome-loja" rotulo="Nome da loja">
                <input id="nome-loja" value={rascunho.nome} onChange={muda('nome')} required />
              </Campo>
            </div>
            <Campo id="cep-loja" rotulo="CEP">
              <div className="p-linha">
                <input
                  id="cep-loja"
                  inputMode="numeric"
                  value={formatarCep(rascunho.cep ?? '')}
                  onChange={(e) => setRascunho((l) => ({ ...l, cep: soDigitos(e.target.value) }))}
                />
                <button type="button" className="p-botao p-botao--escuro" onClick={porCep} disabled={buscando !== null || soDigitos(rascunho.cep).length !== 8}>
                  {buscando === 'cep' ? '…' : 'Buscar'}
                </button>
              </div>
            </Campo>
            <Campo id="caixas" rotulo="Caixas (checkouts)">
              <input id="caixas" type="number" min="1" max="10" value={rascunho.caixas ?? 1} onChange={(e) => setRascunho((l) => ({ ...l, caixas: Number(e.target.value) }))} />
            </Campo>
            <Campo id="bairro-loja" rotulo="Bairro">
              <input id="bairro-loja" value={rascunho.bairro ?? ''} onChange={muda('bairro')} />
            </Campo>
            <Campo id="cidade-loja" rotulo="Cidade" ajuda="Define com quais lojas você é comparado.">
              <input id="cidade-loja" value={rascunho.cidade ?? ''} onChange={muda('cidade')} required />
            </Campo>
            <div className="p-grade-form__inteiro p-acoes">
              <button type="submit" className="p-botao p-botao--tag" disabled={!alterado}>
                Salvar cadastro
              </button>
            </div>
          </form>
        </section>

        <section className="p-cartao">
          <header className="p-cartao__topo">
            <h2>Custos que entram no preço</h2>
            <Icone nome="cifrao" tamanho={22} />
          </header>
          <div className="p-custos">
            {CUSTOS.map((c) => (
              <div key={c.id} className="p-controle">
                <div className="p-controle__topo">
                  <label htmlFor={`cfg-${c.id}`}>{c.rotulo}</label>
                  <output htmlFor={`cfg-${c.id}`} className="num">
                    {pct(config[c.id], c.passo < 0.01 ? 1 : 0)}
                  </output>
                </div>
                <input
                  id={`cfg-${c.id}`}
                  type="range"
                  min="0"
                  max={c.max}
                  step={c.passo}
                  value={config[c.id]}
                  style={{ '--p': `${(config[c.id] / c.max) * 100}%` }}
                  onChange={(e) => despachar({ tipo: 'atualizar-config', dados: { [c.id]: Number(e.target.value) } })}
                />
                <small>{c.ajuda}</small>
              </div>
            ))}
            <div className="p-campo">
              <label htmlFor="finais">Final dos preços sugeridos</label>
              <select id="finais" value={config.finais} onChange={(e) => despachar({ tipo: 'atualizar-config', dados: { finais: e.target.value } })}>
                {FINAIS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.rotulo}
                  </option>
                ))}
              </select>
            </div>
            <p className="p-exemplo">
              Com esses custos, um item comprado a <b>{reais(10)}</b> só deixa de dar prejuízo a partir de <b className="num">{reais(exemplo)}</b>.
            </p>
          </div>
        </section>
      </div>

      <section className="p-cartao">
        <header className="p-cartao__topo">
          <h2>Plano</h2>
          <span className="p-nota">sem fidelidade, sem taxa de instalação</span>
        </header>
        <div className="p-planos">
          {PLANOS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="p-plano"
              aria-pressed={loja.plano === p.id}
              onClick={() => despachar({ tipo: 'atualizar-loja', dados: { plano: p.id } })}
            >
              <span className="p-plano__nome">
                {p.nome}
                {loja.plano === p.id && <small>seu plano</small>}
              </span>
              <strong className="num">{p.preco ? `${reais(p.preco)}/mês` : 'Grátis'}</strong>
              <span>{p.limite}</span>
              <ul>
                {p.recursos.map((r) => (
                  <li key={r}>
                    <Icone nome="check" tamanho={15} /> {r}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </section>

      <section className="p-cartao p-perigo">
        <div>
          <h2>Apagar dados deste navegador</h2>
          <p className="p-nota">Remove loja, produtos e histórico e volta para a tela de cadastro.</p>
        </div>
        <button
          type="button"
          className="p-botao p-botao--perigo"
          onClick={() => {
            if (window.confirm('Apagar todos os dados da loja neste navegador?')) despachar({ tipo: 'sair' });
          }}
        >
          <Icone nome="sair" tamanho={18} />
          Apagar e sair
        </button>
      </section>
    </>
  );
}
