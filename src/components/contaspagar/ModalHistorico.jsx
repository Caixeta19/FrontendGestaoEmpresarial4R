import { useEffect, useState } from 'react';
import Modal, { AlertaErro } from './Modal.jsx';
import { detalheContaPagar } from '../../services/financeiroApi';
import { dataHoraBR, mensagemErro } from './utilContasPagar.js';

const ACAO = {
  CRIOU: 'Cadastrada', EDITOU: 'Editada', CANCELOU: 'Cancelada', BAIXA_AUTOMATICA: 'Baixa automática',
  BAIXA_MANUAL: 'Baixa manual', REABRIU: 'Reaberta', VINCULOU: 'Lançamento vinculado', COMPROVANTE: 'Comprovante gerado',
};

/** Linha do tempo da conta (GET /contas-pagar/{id}): quem fez o quê e quando. */
export default function ModalHistorico({ conta, onFechar }) {
  const [detalhe, setDetalhe] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let vivo = true;
    detalheContaPagar(conta.id)
      .then((d) => { if (vivo) setDetalhe(d); })
      .catch((e) => { if (vivo) setErro(mensagemErro(e)); });
    return () => { vivo = false; };
  }, [conta.id]);

  const historico = detalhe?.historico || [];

  return (
    <Modal titulo="Histórico da conta" subtitulo={`${conta.descricao} · ${conta.fornecedor}`} onFechar={onFechar} largura={560}>
      {erro ? <AlertaErro>{erro}</AlertaErro>
        : !detalhe ? <div style={{ color: 'var(--text-faint)' }}>Carregando…</div>
          : historico.length === 0 ? <div style={{ color: 'var(--text-faint)' }}>Nenhum registro.</div>
            : (
              <ol style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'grid', gap: 10 }}>
                {historico.map((h, i) => (
                  <li key={`${h.em}-${i}`} style={{ borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
                    <div><b>{ACAO[h.acao] || h.acao}</b> <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>· {h.usuario || 'sistema'} · {dataHoraBR(h.em)}</span></div>
                    {h.texto && <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{h.texto}</div>}
                  </li>
                ))}
              </ol>
            )}
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onFechar}>Fechar</button>
      </div>
    </Modal>
  );
}
