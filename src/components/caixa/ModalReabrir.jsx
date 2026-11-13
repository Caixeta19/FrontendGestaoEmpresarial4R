import { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { reabrirCaixa } from '../../services/financeiroApi';
import { inputEstiloFormulario } from './estilos';
import { formatarData, mensagemErro } from './utilCaixa';

const MINIMO = 10;

/** Reabrir um caixa fechado: a justificativa é obrigatória e fica no histórico do caixa. */
export default function ModalReabrir({ caixa, onFechar, onReaberto }) {
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const reabrir = async () => {
    if (justificativa.trim().length < MINIMO) {
      setErro(`Informe a justificativa da reabertura (mín. ${MINIMO} caracteres).`);
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      onReaberto(await reabrirCaixa(caixa.id, justificativa.trim()));
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label="Reabrir caixa" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--text)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#f472b6' }}>Reabrir caixa nº {caixa.id}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-faint)' }}>
              {caixa.filialNome} · {caixa.caixaPdv} · {formatarData(caixa.dataAbertura)}
            </p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          O caixa volta para a lista de abertos e a conferência é zerada: o valor contado precisa ser informado de novo ao fechar.
        </p>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Justificativa (mín. {MINIMO} caracteres)
          <textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} rows={3} maxLength={300} autoFocus
            style={{ ...inputEstiloFormulario, resize: 'vertical', fontWeight: 400 }} />
        </label>
        {erro && (
          <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {erro}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onFechar} disabled={enviando}
            style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="button" onClick={reabrir} disabled={enviando}
            style={{ background: '#dc2626', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: enviando ? 0.7 : 1 }}>
            <RotateCcw size={15} /> {enviando ? 'Reabrindo…' : 'Reabrir caixa'}
          </button>
        </div>
      </div>
    </div>
  );
}
