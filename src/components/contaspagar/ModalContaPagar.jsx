import { useEffect, useState } from 'react';
import Modal, { AlertaErro } from './Modal.jsx';
import { criarContaPagar, editarContaPagar } from '../../services/financeiroApi';
import { listarFiliais } from '../../services/vendasApi';
import {
  FORMAS_PAGAMENTO, codigoErro, duasCasas, lerValorBR, mascararDocumento, mensagemErro, soDigitos, valorParaCampo,
} from './utilContasPagar.js';

/** Cadastro e edição (quando `conta` vem preenchida) de conta a pagar. */
export default function ModalContaPagar({ conta, onFechar, onConcluido }) {
  const editando = !!conta;
  const [f, setF] = useState({
    descricao: conta?.descricao || '',
    fornecedor: conta?.fornecedor || '',
    documentoFornecedor: mascararDocumento(conta?.documentoFornecedor || ''),
    vencimento: conta?.vencimento || '',
    valor: valorParaCampo(conta?.valor),
    formaPagamento: conta?.formaPagamento || 'BOLETO',
    codigoBarras: conta?.codigoBarras || '', // o PUT grava o que vem: sem reenviar, editar apagaria o código
    filialId: conta?.filialId ?? '',
    categoria: conta?.categoria || '',
    observacao: conta?.observacao || '',
  });
  const [filiais, setFiliais] = useState([]);
  const [erro, setErro] = useState('');
  const [duplicada, setDuplicada] = useState(false); // aguardando "cadastrar mesmo assim?"
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vivo = true;
    listarFiliais().then((l) => { if (vivo) setFiliais(Array.isArray(l) ? l : l?.content || []); }).catch(() => {});
    return () => { vivo = false; };
  }, []);

  const set = (campo) => (e) => {
    setDuplicada(false);
    setF((a) => ({ ...a, [campo]: e.target.value }));
  };

  const montar = (confirmarDuplicada) => {
    const corpo = {
      descricao: f.descricao.trim(),
      fornecedor: f.fornecedor.trim(),
      documentoFornecedor: soDigitos(f.documentoFornecedor) || undefined,
      vencimento: f.vencimento,
      valor: duasCasas(lerValorBR(f.valor)),
      formaPagamento: f.formaPagamento,
      codigoBarras: soDigitos(f.codigoBarras) || undefined,
      filialId: f.filialId === '' ? undefined : Number(f.filialId),
      categoria: f.categoria.trim() || undefined,
      observacao: f.observacao.trim() || undefined,
    };
    if (confirmarDuplicada) corpo.confirmarDuplicada = true;
    return corpo;
  };

  const validar = () => {
    if (!f.descricao.trim()) return 'Informe a descrição.';
    if (!f.fornecedor.trim()) return 'Informe o fornecedor.';
    const doc = soDigitos(f.documentoFornecedor);
    if (doc && doc.length !== 11 && doc.length !== 14) return 'CPF/CNPJ incompleto.';
    if (!f.vencimento) return 'Informe o vencimento.';
    if (!(lerValorBR(f.valor) > 0)) return 'Informe um valor maior que zero.';
    return '';
  };

  const salvar = async (confirmarDuplicada = false) => {
    if (enviando) return;
    const msg = validar();
    if (msg) return setErro(msg);
    setEnviando(true);
    setErro('');
    try {
      if (editando) await editarContaPagar(conta.id, montar(false));
      else await criarContaPagar(montar(confirmarDuplicada));
      onConcluido(editando ? 'Conta atualizada.' : 'Conta cadastrada.');
    } catch (err) {
      if (codigoErro(err) === 'CONTA_PROVAVEL_DUPLICADA') setDuplicada(true);
      else setErro(mensagemErro(err));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={editando ? 'Editar conta a pagar' : 'Nova conta a pagar'} onFechar={onFechar} bloqueado={enviando} largura={560}>
      <form onSubmit={(e) => { e.preventDefault(); salvar(false); }}>
        <div className="field"><label htmlFor="cp-desc">Descrição *</label><input id="cp-desc" maxLength={200} value={f.descricao} onChange={set('descricao')} /></div>
        <div className="field"><label htmlFor="cp-forn">Fornecedor *</label><input id="cp-forn" maxLength={150} value={f.fornecedor} onChange={set('fornecedor')} /></div>
        <div className="field">
          <label htmlFor="cp-doc">CPF/CNPJ do fornecedor</label>
          <input id="cp-doc" inputMode="numeric" value={f.documentoFornecedor}
            onChange={(e) => { setDuplicada(false); setF((a) => ({ ...a, documentoFornecedor: mascararDocumento(e.target.value) })); }} />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: 1, minWidth: 150 }}><label htmlFor="cp-venc">Vencimento *</label><input id="cp-venc" type="date" value={f.vencimento} onChange={set('vencimento')} /></div>
          <div className="field" style={{ flex: 1, minWidth: 150 }}><label htmlFor="cp-valor">Valor (R$) *</label><input id="cp-valor" inputMode="decimal" placeholder="0,00" value={f.valor} onChange={set('valor')} /></div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: 1, minWidth: 150 }}>
            <label htmlFor="cp-forma">Forma de pagamento *</label>
            <select id="cp-forma" value={f.formaPagamento} onChange={set('formaPagamento')}>
              {FORMAS_PAGAMENTO.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 150 }}>
            <label htmlFor="cp-filial">Filial</label>
            <select id="cp-filial" value={f.filialId} onChange={set('filialId')}>
              <option value="">—</option>
              {filiais.map((x) => <option key={x.id} value={x.id}>{x.nome || x.nomeFantasia || x.id}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="cp-cod">Código de barras / linha digitável</label>
          <input id="cp-cod" inputMode="numeric" placeholder="Pode colar com pontos e espaços" value={f.codigoBarras} onChange={set('codigoBarras')} />
        </div>
        <div className="field"><label htmlFor="cp-cat">Categoria</label><input id="cp-cat" maxLength={60} value={f.categoria} onChange={set('categoria')} /></div>
        <div className="field"><label htmlFor="cp-obs">Observação</label><textarea id="cp-obs" rows={2} maxLength={500} value={f.observacao} onChange={set('observacao')} /></div>

        <AlertaErro>{erro}</AlertaErro>
        {duplicada && (
          <div role="alert" style={{ border: '1px solid var(--warn)', color: 'var(--warn)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginTop: 12 }}>
            Parece haver uma conta igual (fornecedor, valor e vencimento). Cadastrar mesmo assim?
            <div style={{ marginTop: 8 }}>
              <button type="button" className="btn sm solid" disabled={enviando} onClick={() => salvar(true)}>Cadastrar mesmo assim</button>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onFechar} disabled={enviando}>Cancelar</button>
          <button type="submit" className="btn solid" disabled={enviando}>{enviando ? 'Salvando…' : editando ? 'Salvar' : 'Cadastrar'}</button>
        </div>
      </form>
    </Modal>
  );
}
