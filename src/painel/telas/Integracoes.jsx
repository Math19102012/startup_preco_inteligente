// Integrações: o que já está ligado, teste de conexão ao vivo e registro das últimas chamadas.
import { useEffect, useState } from 'react';
import { Icone } from '../../components/Icone.jsx';
import { Cabecalho, dataHora } from '../componentes/base.jsx';
import { chamadasRecentes, ouvirChamadas, SERVICOS, testarServico } from '../servicos/apis.js';

const OUTRAS = [
  {
    nome: 'Nota fiscal eletrônica (XML da NF-e)',
    descricao: 'Custo de compra de cada item, lido do XML que o fornecedor envia. Layout 4.00 da Sefaz.',
    situacao: 'Ativa',
    tipo: 'ok',
    link: '#/nota',
  },
  {
    nome: 'ANP · preços de GLP',
    descricao: '23.880 preços de botijão de 13 kg em 101 cidades paulistas (jan a ago/2026), tratados pelo grupo.',
    situacao: 'Base embutida',
    tipo: 'ok',
  },
  {
    nome: 'Sistema de caixa (PDV)',
    descricao: 'Catálogo, preço praticado e vendas por item direto do caixa da loja. Depende de parceria com o fornecedor do sistema.',
    situacao: 'Próxima etapa',
    tipo: 'futuro',
  },
];

function CartaoServico({ id, servico }) {
  const [teste, setTeste] = useState({ estado: 'parado' });
  async function testar() {
    setTeste({ estado: 'testando' });
    const r = await testarServico(id);
    setTeste({ estado: r.ok ? 'ok' : 'erro', ...r });
  }
  return (
    <article className="p-integracao">
      <header>
        <h3>{servico.nome}</h3>
        <span className="p-integracao__selo p-integracao__selo--ok">API pública</span>
      </header>
      <p>{servico.descricao}</p>
      <div className="p-integracao__teste">
        <button type="button" className="p-botao p-botao--contorno p-botao--pequeno" onClick={testar} disabled={teste.estado === 'testando'}>
          <Icone nome="plugue" tamanho={16} />
          {teste.estado === 'testando' ? 'Testando…' : 'Testar conexão'}
        </button>
        {(teste.estado === 'ok' || teste.estado === 'erro') && (
          <span className={teste.estado === 'ok' ? 'p-ganho' : 'p-negativo'} role="status">
            <Icone nome={teste.estado === 'ok' ? 'check' : 'alerta'} tamanho={16} /> {teste.estado === 'ok' ? `Respondeu em ${teste.ms} ms` : 'Falhou'}
            {teste.detalhe && <small>{teste.detalhe}</small>}
          </span>
        )}
      </div>
      <a className="p-micro" href={servico.url} target="_blank" rel="noreferrer">
        Documentação
      </a>
    </article>
  );
}

export function Integracoes() {
  const [chamadas, setChamadas] = useState(chamadasRecentes);
  useEffect(() => ouvirChamadas((c) => setChamadas([...c])), []);

  return (
    <>
      <Cabecalho titulo="Integrações">
        O painel conversa com serviços públicos direto do navegador, sem chave de acesso. Teste cada um ao vivo.
      </Cabecalho>

      <section className="p-integracoes">
        {Object.entries(SERVICOS).map(([id, s]) => (
          <CartaoServico key={id} id={id} servico={s} />
        ))}
        {OUTRAS.map((o) => (
          <article key={o.nome} className="p-integracao">
            <header>
              <h3>{o.nome}</h3>
              <span className={`p-integracao__selo p-integracao__selo--${o.tipo}`}>{o.situacao}</span>
            </header>
            <p>{o.descricao}</p>
            {o.link && (
              <a className="p-micro" href={o.link}>
                Importar uma nota
              </a>
            )}
          </article>
        ))}
      </section>

      <section className="p-cartao p-cartao--tabela">
        <header className="p-cartao__topo p-cartao__topo--tabela">
          <h2>Últimas chamadas</h2>
          <span className="p-nota">registradas neste navegador</span>
        </header>
        <div className="p-rolagem">
          <table className="p-tabela">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Serviço</th>
                <th>Endereço</th>
                <th>Resultado</th>
                <th className="n">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {chamadas.map((c, i) => (
                <tr key={`${c.quando}-${i}`}>
                  <td className="num">{dataHora(c.quando)}</td>
                  <td>{SERVICOS[c.servico]?.nome ?? c.servico}</td>
                  <td className="p-micro p-url">{c.url}</td>
                  <td>
                    <span className={c.ok ? 'p-ganho' : 'p-negativo'}>
                      {c.ok ? 'OK' : 'Falha'} · {c.status}
                    </span>
                  </td>
                  <td className="n num">{c.ms} ms</td>
                </tr>
              ))}
              {chamadas.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-vazio">
                    Nenhuma chamada ainda. Clique em “Testar conexão” acima.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
