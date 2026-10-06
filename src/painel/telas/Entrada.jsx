// Primeiro acesso: cadastro da loja pelo CNPJ (BrasilAPI) ou entrada na loja de demonstração.
import { useState } from 'react';
import { Etiqueta } from '../../components/Etiqueta.jsx';
import { Icone, Marca } from '../../components/Icone.jsx';
import { Aviso, Campo } from '../componentes/base.jsx';
import { useLoja } from '../estado/loja.jsx';
import { formatarCep, formatarCnpj, soDigitos } from '../lib/validacao.js';
import { buscarCep, buscarCnpj } from '../servicos/apis.js';

const LOJA_EM_BRANCO = { cnpj: '', nome: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: 'SP', cep: '' };

export function Entrada() {
  const { despachar } = useLoja();
  const [cnpj, setCnpj] = useState('');
  const [loja, setLoja] = useState(null);
  const [comCatalogo, setComCatalogo] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  async function consultar(e) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);
    try {
      const { ms, ...dados } = await buscarCnpj(cnpj);
      setLoja(dados);
      setMensagem({
        tipo: 'ok',
        texto: `Encontramos ${dados.razaoSocial} na Receita Federal (BrasilAPI, ${ms} ms). Confira os dados abaixo.`,
      });
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      if (erro.tipo !== 'invalido') setLoja({ ...LOJA_EM_BRANCO, cnpj: soDigitos(cnpj) });
    } finally {
      setCarregando(false);
    }
  }

  async function completarCep() {
    if (soDigitos(loja.cep).length !== 8) return;
    try {
      const c = await buscarCep(loja.cep);
      setLoja((l) => ({ ...l, logradouro: l.logradouro || c.logradouro, bairro: c.bairro || l.bairro, cidade: c.cidade, uf: c.uf }));
    } catch {
      // segue com o que a pessoa digitou
    }
  }

  const muda = (campo) => (e) => setLoja((l) => ({ ...l, [campo]: e.target.value }));
  const pronto = loja && loja.nome.trim() && loja.cidade.trim();

  return (
    <div className="p-entrada">
      <section className="p-entrada__vitrine">
        <a className="p-marca p-marca--clara" href="../index.html">
          <Marca tamanho={32} />
          <span>
            Preço Inteligente
            <small>Painel do lojista</small>
          </span>
        </a>
        <div>
          <h1>Descubra em minutos quais produtos você vende fora do preço da região.</h1>
          <p>
            Compare cada item com o que a vizinhança cobra, veja o custo real com imposto, cartão e perdas, e imprima as
            etiquetas novas. Sem instalar nada.
          </p>
        </div>
        <div className="p-entrada__etiquetas" aria-hidden="true">
          <Etiqueta valor={24.9} produto="Arroz 5 kg" rodape="Hoje" />
          <span className="p-entrada__seta">
            <Icone nome="seta" tamanho={28} />
          </span>
          <Etiqueta valor={27.49} produto="Arroz 5 kg" rodape="Sugestão" />
        </div>
        <ul className="p-entrada__lista">
          <li>
            <Icone nome="check" tamanho={18} /> Preço da região atualizado toda semana
          </li>
          <li>
            <Icone nome="check" tamanho={18} /> Custo atualizado pelo XML da nota do fornecedor
          </li>
          <li>
            <Icone nome="check" tamanho={18} /> Etiquetas prontas para imprimir
          </li>
        </ul>
      </section>

      <section className="p-entrada__formulario" aria-labelledby="entrada-titulo">
        <div className="p-cartao p-entrada__cartao">
          <h2 id="entrada-titulo">Ver o painel funcionando</h2>
          <p className="p-nota">Uma loja de exemplo, com 25 produtos e o diagnóstico da semana já pronto.</p>
          <button type="button" className="p-botao p-botao--tag p-botao--grande" onClick={() => despachar({ tipo: 'entrar-demonstracao' })}>
            Entrar na loja de demonstração
            <Icone nome="seta" tamanho={18} />
          </button>
        </div>

        <div className="p-ou">
          <span>ou cadastre a sua</span>
        </div>

        <form className="p-cartao p-entrada__cartao" onSubmit={consultar}>
          <h2>Cadastrar minha loja</h2>
          <Campo id="cnpj" rotulo="CNPJ da loja" ajuda="Buscamos nome e endereço na Receita Federal, pela BrasilAPI.">
            <div className="p-linha">
              <input
                id="cnpj"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(formatarCnpj(e.target.value))}
                autoComplete="off"
              />
              <button type="submit" className="p-botao p-botao--escuro" disabled={carregando || soDigitos(cnpj).length !== 14}>
                {carregando ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
          </Campo>
          {mensagem && <Aviso tipo={mensagem.tipo}>{mensagem.texto}</Aviso>}
          {!loja && (
            <button type="button" className="p-link" onClick={() => setLoja({ ...LOJA_EM_BRANCO, cnpj: soDigitos(cnpj) })}>
              Prefiro preencher à mão
            </button>
          )}

          {loja && (
            <div className="p-grade-form">
              <Campo id="nome" rotulo="Nome da loja">
                <input id="nome" value={loja.nome} onChange={muda('nome')} required />
              </Campo>
              <Campo id="cep" rotulo="CEP" ajuda="Define com quais lojas você é comparado.">
                <input
                  id="cep"
                  inputMode="numeric"
                  value={formatarCep(loja.cep)}
                  onChange={(e) => setLoja((l) => ({ ...l, cep: soDigitos(e.target.value) }))}
                  onBlur={completarCep}
                />
              </Campo>
              <Campo id="bairro" rotulo="Bairro">
                <input id="bairro" value={loja.bairro} onChange={muda('bairro')} />
              </Campo>
              <Campo id="cidade" rotulo="Cidade">
                <input id="cidade" value={loja.cidade} onChange={muda('cidade')} required />
              </Campo>
              <label className="p-check p-grade-form__inteiro">
                <input type="checkbox" checked={comCatalogo} onChange={(e) => setComCatalogo(e.target.checked)} />
                Começar com o catálogo de exemplo (25 produtos). Desmarque para começar vazio e importar a sua nota.
              </label>
              <button
                type="button"
                className="p-botao p-botao--tag p-grade-form__inteiro"
                disabled={!pronto}
                onClick={() => despachar({ tipo: 'criar-loja', loja, comCatalogo })}
              >
                Criar meu painel
                <Icone nome="seta" tamanho={18} />
              </button>
            </div>
          )}
        </form>
        <p className="p-nota p-entrada__rodape">
          Protótipo acadêmico. Os dados ficam só neste navegador; nada é enviado para um servidor nosso.
        </p>
      </section>
    </div>
  );
}
