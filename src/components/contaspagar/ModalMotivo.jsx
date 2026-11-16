import { useState } from 'react';
import Modal, { AlertaErro } from './Modal.jsx';
import { MINIMO_JUSTIFICATIVA, mensagemErro } from './utilContasPagar.js';

/**
 * Pede um motivo/justificativa (mín. 10) e chama `onConfirmar(texto)`. Serve para cancelar, reabrir e ignorar.
 * `onConfirmar` deve lançar erro se falhar; o modal mostra a mensagem do backend e continua aberto.
 */
export default function ModalMotivo({ titulo, subtitulo, rotulo = 'Motivo', botao = 'Confirmar', perigo = false, onConfirmar, onFechar }) {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (texto.trim().length < MINIMO_JUSTIFICATIVA) {
      setErro(`${rotulo}: informe pelo menos ${MINIMO_JUSTIFICATIVA} caracteres.`);
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await onConfirmar(texto.trim());
    } catch (err) {
      setErro(mensagemErro(err));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={titulo} subtitulo={subtitulo} onFechar={onFechar} bloqueado={enviando}>
      <form onSubmit={enviar}>
        <div className="field">
          <label htmlFor="cp-motivo">{rotulo} (mín. {MINIMO_JUSTIFICATIVA} caracteres)</label>
          <textarea id="cp-motivo" rows={3} maxLength={300} value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <AlertaErro>{erro}</AlertaErro>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onFechar} disabled={enviando}>Voltar</button>
          <button type="submit" className={'btn ' + (perigo ? 'danger' : 'solid')} disabled={enviando}>
            {enviando ? 'Enviando…' : botao}
          </button>
        </div>
      </form>
    </Modal>
  );
}
