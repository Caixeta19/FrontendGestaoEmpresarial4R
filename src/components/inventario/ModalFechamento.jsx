import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import * as api from '../../services/inventarioApi';

const PADRAO = 'Não localizado fisicamente';

/**
 * Fechar o inventário: lista os pendentes para justificar ("Não localizado fisicamente" ou texto livre), grava as
 * justificativas e fecha. O backend recusa (422) se algum pendente ficar sem justificativa.
 */
export default function ModalFechamento({ execucaoId, onFechado, onCancelar }) {
  const [pendentes, setPendentes] = useState(null);
  const [textos, setTextos] = useState({});
  const [erro, setErro] = useState('');
  const [progresso, setProgresso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = [];
        for (let pagina = 0; ; pagina++) {
          const r = await api.buscar(execucaoId, { resultados: ['PENDENTE'], pagina, tamanho: 500 });
          lista.push(...r.itens.conteudo);
          if (pagina + 1 >= r.itens.totalPaginas) break;
        }
        if (!ativo) return;
        setPendentes(lista);
        setTextos(Object.fromEntries(lista.map((i) => [i.id, i.justificativa || PADRAO])));
      } catch (e) {
        if (ativo) setErro(e.mensagem || 'Falha ao carregar os pendentes.');
      }
    })();
    return () => { ativo = false; };
  }, [execucaoId]);

  const confirmar = async () => {
    setErro('');
    const vazios = pendentes.filter((i) => !String(textos[i.id] || '').trim());
    if (vazios.length) {
      setErro(`Justifique os ${vazios.length} pendentes que estão sem texto.`);
      return;
    }
    setEnviando(true);
    try {
      const aGravar = pendentes.filter((i) => (i.justificativa || '') !== textos[i.id].trim());
      for (let k = 0; k < aGravar.length; k++) {
        setProgresso(`Gravando justificativas ${k + 1}/${aGravar.length}...`);
        await api.justificar(execucaoId, aGravar[k].id, textos[aGravar[k].id].trim());
      }
      setProgresso('Fechando o inventário e rodando o diagnóstico...');
      onFechado(await api.fechar(execucaoId));
    } catch (e) {
      setErro(e.mensagem || 'Falha ao fechar o inventário.');
      setProgresso('');
      setEnviando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fechar inventário"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}
    >
      <div className="panel" style={{ width: '100%', maxWidth: 760, maxHeight: '90vh', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0 }}>Fechar inventário</h3>
          <button type="button" className="btn sm ghost" onClick={onCancelar} disabled={enviando} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {pendentes === null && !erro && <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>Carregando pendentes...</span>}

        {pendentes && pendentes.length === 0 && (
          <span style={{ fontSize: 13 }}>Nenhum pendente: todos os esperados foram bipados. Confirme para fechar.</span>
        )}

        {pendentes && pendentes.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 13 }}>
              <span>
                <b>{pendentes.length}</b> {pendentes.length === 1 ? 'item não foi bipado' : 'itens não foram bipados'}.
                Cada um precisa de justificativa; os da IQ09 viram <b>Falta</b> e os só do sistema, <b>Só no sistema</b>.
              </span>
              <button type="button" className="btn sm ghost" disabled={enviando}
                onClick={() => setTextos(Object.fromEntries(pendentes.map((i) => [i.id, PADRAO])))}>
                Todos: "{PADRAO}"
              </button>
            </div>
            <div className="table-wrap" style={{ overflow: 'auto', flex: 1, border: '1px solid var(--line)', borderRadius: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Serial</th>
                    <th>Descrição</th>
                    <th>Origem</th>
                    <th style={{ minWidth: 220 }}>Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  {pendentes.map((i) => (
                    <tr key={i.id}>
                      <td className="mono">{i.serial}</td>
                      <td>{i.descricao || '—'}</td>
                      <td style={{ fontSize: 12 }}>{i.esperadoIq09 ? 'IQ09' : 'Sistema'}</td>
                      <td>
                        <input
                          type="text"
                          maxLength={300}
                          value={textos[i.id] || ''}
                          disabled={enviando}
                          onChange={(e) => setTextos((t) => ({ ...t, [i.id]: e.target.value }))}
                          style={{ width: '100%', height: 32, fontSize: 12.5 }}
                          aria-label={`Justificativa do serial ${i.serial}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {erro && <span role="alert" style={{ color: 'var(--bad)', fontSize: 13 }}>{erro}</span>}
        {progresso && <span style={{ color: 'var(--text-dim)', fontSize: 12.5 }}>{progresso}</span>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost" onClick={onCancelar} disabled={enviando}>Voltar à contagem</button>
          <button type="button" className="btn solid" onClick={confirmar} disabled={enviando || pendentes === null}>
            {pendentes?.length ? 'Justificar e fechar' : 'Fechar inventário'}
          </button>
        </div>
      </div>
    </div>
  );
}
