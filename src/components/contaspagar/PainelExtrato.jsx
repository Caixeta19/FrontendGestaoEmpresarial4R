import { useRef, useState } from 'react';
import Modal, { AlertaErro } from './Modal.jsx';
import ModalMotivo from './ModalMotivo.jsx';
import { ignorarLancamento, sincronizarExtrato, vincularLancamento } from '../../services/financeiroApi';
import {
  MINIMO_JUSTIFICATIVA, SITUACOES_EXTRATO, dataBR, formatarMoeda, mensagemErro,
} from './utilContasPagar.js';

const idSugestao = (s) => s.tituloId ?? s.id;

const historicoDe = (l) => [l.subHistorico, l.infoComplementar].filter(Boolean).join(' · ') || '—';
const REFORCO = { DOCUMENTO: 'CPF/CNPJ confere', NOME: 'nome no histórico', HISTORICO: 'histórico de pagamento' };

/** Confirmação de vínculo; se o valor do banco difere da conta, exige justificativa. */
function ModalVincular({ lancamento, titulo, onFechar, onConcluido }) {
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const difere = Math.abs(Number(lancamento.valor) - Number(titulo.valor)) >= 0.005;

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (difere && justificativa.trim().length < MINIMO_JUSTIFICATIVA) {
      return setErro(`O valor do banco difere da conta: informe a justificativa (mín. ${MINIMO_JUSTIFICATIVA} caracteres).`);
    }
    setEnviando(true);
    setErro('');
    try {
      await vincularLancamento(lancamento.id, { tituloId: idSugestao(titulo), justificativa: difere ? justificativa.trim() : undefined });
      onConcluido('Lançamento vinculado.');
    } catch (err) {
      setErro(mensagemErro(err));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Vincular lançamento" onFechar={onFechar} bloqueado={enviando}>
      <form onSubmit={enviar}>
        <p style={{ marginBottom: 6 }}>Extrato: <b>{formatarMoeda(lancamento.valor)}</b> em {dataBR(lancamento.dataLancamento)} — {historicoDe(lancamento)}</p>
        <p>Conta: <b>{titulo.descricao}</b> · {titulo.fornecedor} · {formatarMoeda(titulo.valor)}</p>
        {difere && (
          <div className="field">
            <label htmlFor="vl-just">Justificativa (valor diferente, mín. {MINIMO_JUSTIFICATIVA} caracteres)</label>
            <textarea id="vl-just" rows={3} maxLength={300} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </div>
        )}
        <AlertaErro>{erro}</AlertaErro>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onFechar} disabled={enviando}>Voltar</button>
          <button type="submit" className="btn solid" disabled={enviando}>{enviando ? 'Vinculando…' : 'Vincular'}</button>
        </div>
      </form>
    </Modal>
  );
}

/** Escolhe, entre as contas pendentes, a que recebe o lançamento sem candidata. */
function ModalEscolherConta({ lancamento, contasPendentes, onFechar, onEscolher }) {
  const [id, setId] = useState('');
  return (
    <Modal titulo="Vincular a uma conta" subtitulo={`${formatarMoeda(lancamento.valor)} em ${dataBR(lancamento.dataLancamento)} — ${historicoDe(lancamento)}`} onFechar={onFechar}>
      <div className="field">
        <label htmlFor="ec-conta">Conta pendente</label>
        <select id="ec-conta" value={id} onChange={(e) => setId(e.target.value)}>
          <option value="">Selecione…</option>
          {contasPendentes.map((c) => (
            <option key={c.id} value={c.id}>{c.descricao} · {c.fornecedor} · {formatarMoeda(c.valor)} · {dataBR(c.vencimento)}</option>
          ))}
        </select>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onFechar}>Voltar</button>
        <button type="button" className="btn solid" disabled={!id} onClick={() => onEscolher(contasPendentes.find((c) => String(c.id) === id))}>Continuar</button>
      </div>
    </Modal>
  );
}

/** Seção "Extrato do Banco do Brasil" da aba Retorno bancário. */
export default function PainelExtrato({ lancamentos, situacao, onSituacao, contasPendentes, permissoes, carregando, erro, onTentar, onMudou, showToast }) {
  const [sincronizando, setSincronizando] = useState(false);
  const emAndamento = useRef(false); // trava síncrona: o estado só muda no próximo render, e dois cliques seguidos passariam
  const [modal, setModal] = useState(null); // { tipo: 'vincular' | 'escolher' | 'ignorar', lancamento, titulo? }

  const sincronizar = async () => {
    if (emAndamento.current) return;
    emAndamento.current = true;
    setSincronizando(true);
    try {
      const r = await sincronizarExtrato();
      // O backend responde 200 também quando o banco falha: o resultado vem em `status`.
      if (r?.status === 'ERRO') showToast(r.erro || 'Não foi possível consultar o extrato do banco.', true);
      else {
        showToast(`Extrato sincronizado: ${r?.lancamentosNovos ?? 0} importado(s), ${r?.conciliados ?? 0} conciliado(s), `
          + `${r?.ambiguos ?? 0} ambíguo(s), ${r?.semCorrespondencia ?? 0} sem correspondência.`);
      }
      onMudou();
    } catch (e) {
      showToast(mensagemErro(e), true);
    } finally {
      emAndamento.current = false;
      setSincronizando(false);
    }
  };

  const concluido = (msg) => { setModal(null); showToast(msg); onMudou(); };

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <h3 style={{ margin: 0, flex: 1 }}>Extrato do Banco do Brasil</h3>
        <select aria-label="Situação do lançamento" value={situacao} onChange={(e) => onSituacao(e.target.value)}>
          {SITUACOES_EXTRATO.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        {permissoes.sincronizar && (
          <button type="button" className="btn solid" onClick={sincronizar} disabled={sincronizando}>
            {sincronizando ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        )}
      </div>

      {erro ? (
        <div style={{ color: 'var(--bad)' }}>{erro} <button type="button" className="btn sm" onClick={onTentar}>Tentar de novo</button></div>
      ) : carregando ? (
        <div style={{ color: 'var(--text-faint)' }}>Carregando…</div>
      ) : lancamentos.length === 0 ? (
        <div style={{ color: 'var(--text-faint)' }}>Nenhum lançamento nesta situação.</div>
      ) : (
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Data</th><th>Valor</th><th>Histórico</th><th>{situacao === 'AMBIGUO' ? 'Sugestões' : 'Detalhe'}</th><th></th></tr></thead>
            <tbody>
              {lancamentos.map((l) => {
                const aberto = situacao === 'AMBIGUO' || situacao === 'SEM_CORRESPONDENCIA';
                return (
                  <tr key={l.id}>
                    <td className="mono">{dataBR(l.dataLancamento)}</td>
                    <td className="mono">{formatarMoeda(l.valor)}</td>
                    <td>{historicoDe(l)}</td>
                    <td>
                      {situacao === 'AMBIGUO' && (l.sugestoes || []).map((s) => (
                        <div key={idSugestao(s)} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <span>
                            {s.descricao} · {s.fornecedor} · <span className="mono">{formatarMoeda(s.valor)}</span> · {dataBR(s.vencimento)}
                            {s.divergenciaValor && <span className="badge bad" style={{ marginLeft: 6 }}>valor diferente</span>}
                            {(s.reforcos || []).map((r) => <span key={r} className="badge good" style={{ marginLeft: 6 }}>{REFORCO[r] || r}</span>)}
                          </span>
                          {permissoes.baixaManual && (
                            <button type="button" className="btn sm" onClick={() => setModal({ tipo: 'vincular', lancamento: l, titulo: s })}>Vincular</button>
                          )}
                        </div>
                      ))}
                      {(situacao !== 'AMBIGUO' || !(l.sugestoes || []).length) && (l.motivo || '—')}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {aberto && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {situacao === 'SEM_CORRESPONDENCIA' && permissoes.baixaManual && (
                            <button type="button" className="btn sm" onClick={() => setModal({ tipo: 'escolher', lancamento: l })}>Vincular a uma conta…</button>
                          )}
                          {permissoes.baixaManual && (
                            <button type="button" className="btn sm" onClick={() => setModal({ tipo: 'ignorar', lancamento: l })}>Ignorar</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo === 'escolher' && (
        <ModalEscolherConta lancamento={modal.lancamento} contasPendentes={contasPendentes} onFechar={() => setModal(null)}
          onEscolher={(titulo) => setModal({ tipo: 'vincular', lancamento: modal.lancamento, titulo })} />
      )}
      {modal?.tipo === 'vincular' && (
        <ModalVincular lancamento={modal.lancamento} titulo={modal.titulo} onFechar={() => setModal(null)} onConcluido={concluido} />
      )}
      {modal?.tipo === 'ignorar' && (
        <ModalMotivo titulo="Ignorar lançamento" subtitulo={`${formatarMoeda(modal.lancamento.valor)} — ${historicoDe(modal.lancamento)}`}
          botao="Ignorar" onFechar={() => setModal(null)}
          onConfirmar={async (motivo) => { await ignorarLancamento(modal.lancamento.id, motivo); concluido('Lançamento ignorado.'); }} />
      )}
    </div>
  );
}
