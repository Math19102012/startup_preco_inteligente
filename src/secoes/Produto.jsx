import { useState } from 'react';
import { Icone } from '../components/Icone.jsx';
import { Secao, Subtitulo } from '../components/Secao.jsx';
import celular from '../assets/img/painel/celular.webp';
import custoReal from '../assets/img/painel/custo-real.webp';
import etiquetas from '../assets/img/painel/etiquetas.webp';
import notaFiscal from '../assets/img/painel/nota-fiscal.webp';
import precos from '../assets/img/painel/precos.webp';
import visaoGeral from '../assets/img/painel/visao-geral.webp';

// Endereço do painel do lojista (outra página deste mesmo projeto: painel/index.html).
// ?demo=1 abre direto a loja de demonstração.
const PAINEL = './painel/index.html';
const PAINEL_DEMO = `${PAINEL}?demo=1`;

const TELAS = [
  {
    id: 'inicio',
    rotulo: 'Visão geral',
    img: visaoGeral,
    endereco: '#/inicio',
    texto: 'Quanto a loja deixa na mesa por mês, quais itens estão fora da faixa e quanto os ajustes já recuperaram.',
  },
  {
    id: 'precos',
    rotulo: 'Preços da semana',
    img: precos,
    endereco: '#/precos',
    texto: 'Cada produto comparado com a região e com o custo real. A sugestão já vem em número de etiqueta e é aplicada com um clique.',
  },
  {
    id: 'custo',
    rotulo: 'Custo real',
    img: custoReal,
    endereco: '#/precos?item=arroz-5',
    texto: 'Compra, perdas, imposto e maquininha somados. O dono vê a partir de quanto o item para de dar prejuízo e a justificativa em uma linha.',
  },
  {
    id: 'nota',
    rotulo: 'Nota fiscal',
    img: notaFiscal,
    endereco: '#/nota',
    texto: 'O XML da NF-e do fornecedor atualiza o custo de cada item e cadastra os produtos novos. Sem digitar nada.',
  },
  {
    id: 'etiquetas',
    rotulo: 'Etiquetas',
    img: etiquetas,
    endereco: '#/etiquetas',
    texto: 'Todo preço que muda vira etiqueta de gôndola pronta para imprimir em folha A4.',
  },
];

const INTEGRACOES = [
  { nome: 'NF-e (XML da Sefaz)', texto: 'Custo de compra de cada item, com frete, desconto, IPI e ST.' },
  { nome: 'BrasilAPI', texto: 'Cadastro da loja pelo CNPJ (Receita Federal) e região pelo CEP.' },
  { nome: 'Open Food Facts', texto: 'Nome, marca e foto do produto pelo código de barras.' },
  { nome: 'ANP', texto: '23.880 preços reais de gás de cozinha, por cidade.' },
];

export function Produto() {
  const [ativa, setAtiva] = useState(TELAS[0].id);
  const tela = TELAS.find((t) => t.id === ativa);

  return (
    <Secao
      id="produto"
      n="04"
      rotulo="O produto"
      titulo="O painel do lojista já funciona. Abra e teste."
      lead="Não é maquete: é a plataforma que o dono do mercadinho usa, rodando no navegador, com uma loja de demonstração pronta. Calcula o diagnóstico, lê a nota fiscal do fornecedor e consulta APIs públicas de verdade."
      variante="escura"
    >
      <div className="vitrine">
        <div className="vitrine__abas" role="tablist" aria-label="Telas do painel">
          {TELAS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`aba-${t.id}`}
              aria-selected={t.id === ativa}
              aria-controls="vitrine-tela"
              onClick={() => setAtiva(t.id)}
            >
              {t.rotulo}
            </button>
          ))}
        </div>

        <div className="vitrine__palco">
          <figure className="navegador" id="vitrine-tela" role="tabpanel" aria-labelledby={`aba-${tela.id}`}>
            <div className="navegador__barra" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>Preço Inteligente · painel do lojista</span>
            </div>
            <a href={`${PAINEL_DEMO}${tela.endereco}`} target="_blank" rel="noreferrer" aria-label={`Abrir a tela ${tela.rotulo} no painel`}>
              <img src={tela.img} alt={`Tela "${tela.rotulo}" do painel do lojista`} width="2160" height="1350" loading="lazy" />
            </a>
            <figcaption>{tela.texto}</figcaption>
          </figure>

          <figure className="celular">
            <div className="celular__moldura">
              <img src={celular} alt="Visão geral do painel no celular" width="780" height="1688" loading="lazy" />
            </div>
            <figcaption>Funciona no celular, no balcão da loja.</figcaption>
          </figure>
        </div>

        <div className="botoes vitrine__botoes">
          <a className="botao botao--tag" href={PAINEL_DEMO} target="_blank" rel="noreferrer">
            Abrir o painel do lojista
            <Icone nome="seta" tamanho={18} />
          </a>
          <a className="botao botao--contorno" href={PAINEL} target="_blank" rel="noreferrer">
            Cadastrar uma loja pelo CNPJ
          </a>
        </div>
      </div>

      <div className="bloco">
        <Subtitulo titulo="Integrações que já funcionam">
          Nesta versão tudo roda no navegador do lojista: as consultas vão direto às fontes públicas e a nota fiscal é lida no próprio computador da loja.
        </Subtitulo>
        <ul className="integracoes">
          {INTEGRACOES.map((i) => (
            <li key={i.nome}>
              <Icone nome="check" tamanho={18} />
              <div>
                <strong>{i.nome}</strong>
                <span>{i.texto}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Secao>
  );
}
