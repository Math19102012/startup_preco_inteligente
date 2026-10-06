// Etiquetas de gôndola prontas para imprimir (folha A4, 3 por linha).
import { useState } from 'react';
import { Etiqueta } from '../../components/Etiqueta.jsx';
import { Icone } from '../../components/Icone.jsx';
import { Aviso, Cabecalho } from '../componentes/base.jsx';
import { useLoja } from '../estado/loja.jsx';

export function Etiquetas() {
  const { estado, despachar } = useLoja();
  const pendentes = estado.produtos.filter((p) => p.etiquetaPendente);
  const [todas, setTodas] = useState(pendentes.length === 0);
  const [impressas, setImpressas] = useState(false);
  const lista = (todas ? estado.produtos : pendentes).slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  function imprimir() {
    window.print();
    setImpressas(true);
  }

  return (
    <>
      <Cabecalho
        titulo="Etiquetas"
        acoes={
          <>
            <button type="button" className="p-botao p-botao--tag" onClick={imprimir} disabled={lista.length === 0}>
              <Icone nome="imprimir" tamanho={18} />
              Imprimir {lista.length}
            </button>
          </>
        }
      >
        Toda vez que um preço muda, a etiqueta nova entra nesta fila. Imprima, troque na gôndola e marque como feito.
      </Cabecalho>

      <div className="p-filtros p-sem-impressao">
        <div className="p-chips" role="group" aria-label="Quais etiquetas">
          <button type="button" aria-pressed={!todas} onClick={() => setTodas(false)}>
            Preço mudou <span className="num">{pendentes.length}</span>
          </button>
          <button type="button" aria-pressed={todas} onClick={() => setTodas(true)}>
            Todos os produtos <span className="num">{estado.produtos.length}</span>
          </button>
        </div>
      </div>

      {impressas && pendentes.length > 0 && !todas && (
        <div className="p-sem-impressao">
          <Aviso tipo="info">
            Já trocou na gôndola?{' '}
            <button
              type="button"
              className="p-link"
              onClick={() => {
                despachar({ tipo: 'etiquetas-impressas', ids: pendentes.map((p) => p.id) });
                setImpressas(false);
              }}
            >
              Marcar as {pendentes.length} como trocadas
            </button>
          </Aviso>
        </div>
      )}

      {lista.length === 0 ? (
        <div className="p-cartao p-vazio">
          Nenhuma etiqueta na fila. Quando você aplicar uma sugestão em <a href="#/precos">Preços da semana</a>, ela aparece aqui.
        </div>
      ) : (
        <div className="p-folha" aria-label="Prévia da folha de etiquetas">
          {lista.map((p) => (
            <Etiqueta key={p.id} valor={p.preco} produto={p.nome} rodape={`${p.ean ?? p.categoria} · ${hoje}`} />
          ))}
        </div>
      )}
    </>
  );
}
