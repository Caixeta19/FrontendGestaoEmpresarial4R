import { useState } from 'react';
import Modal, { AlertaErro } from './Modal.jsx';
import { baixaManualContaPagar } from '../../services/financeiroApi';
import { MINIMO_JUSTIFICATIVA, duasCasas, formatarMoeda, hojeISO, lerValorBR, mensagemErro, valorParaCampo } from './utilContasPagar.js';

/** Baixa manual: data, valor pago, banco e justificativa (≥ 10). O backend confere a permissão de novo. */
export default function ModalBaixaManual({ conta, onFechar, onConcluido }) {
  const [dataPagamento, setData] = useState(hojeISO());
  const [valor, setValor] = useState(valorParaCampo(conta.valor));
  const [banco, setBanco] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    const valorPago = lerValorBR(valor);
    if (!dataPagamento) return setErro('Informe a data do pagamento.');
    if (!(valorPago > 0)) return setErro('Informe um valor pago maior que zero.');
    if (!banco.trim()) return setErro('Informe o banco.');
    if (justificativa.trim().length < MINIMO_JUSTIFICATIVA) {
      return setErro(`Justificativa: informe pelo menos ${MINIMO_JUSTIFICATIVA} caracteres.`);
    }
    setEnviando(true);
    setErro('');
    try {
      await baixaManualContaPagar(conta.id, {
        dataPagamento,
        valorPago: duasCasas(valorPago),
        banco: banco.trim(),
        justificativa: justificativa.trim(),
      });
      onConcluido('Baixa manual registrada.');
    } catch (err) {
      setErro(mensagemErro(err));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Baixa manual" subtitulo={`${conta.descricao} · ${conta.fornecedor} · ${formatarMoeda(conta.valor)}`} onFechar={onFechar} bloqueado={enviando}>
      <form onSubmit={enviar}>
        <div className="field"><label htmlFor="bm-data">Data do pagamento</label><input id="bm-data" type="date" value={dataPagamento} onChange={(e) => setData(e.target.value)} /></div>
        <div className="field"><label htmlFor="bm-valor">Valor pago (R$)</label><input id="bm-valor" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
        <div className="field"><label htmlFor="bm-banco">Banco</label><input id="bm-banco" maxLength={30} value={banco} onChange={(e) => setBanco(e.target.value)} /></div>
        <div className="field">
          <label htmlFor="bm-just">Justificativa (mín. {MINIMO_JUSTIFICATIVA} caracteres)</label>
          <textarea id="bm-just" rows={3} maxLength={300} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
        </div>
        <AlertaErro>{erro}</AlertaErro>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onFechar} disabled={enviando}>Voltar</button>
          <button type="submit" className="btn solid" disabled={enviando}>{enviando ? 'Salvando…' : 'Registrar baixa'}</button>
        </div>
      </form>
    </Modal>
  );
}
