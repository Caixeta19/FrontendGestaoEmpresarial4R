import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { conferirCaixa, detalharCaixa, movimentoDetalhadoCaixa } from '../../services/financeiroApi';
import LancamentosCaixa from './LancamentosCaixa';
import ModalReabrir from './ModalReabrir';
import { useToast } from '../ToastContext';
import {
  formatarData, formatarDataHora, formatarMoeda, mensagemErro, rotuloForma, usePermissoesCaixa,
} from './utilCaixa';

const ROTULO_ACAO = { ABRIU: 'Abriu', FECHOU: 'Fechou', CONFEROU: 'Conferiu', REABRIU: 'Reabriu' };
const ROTULO_MOVIMENTO = { SANGRIA: 'Sangria', SUPRIMENTO: 'Suprimento', ESTORNO: 'Estorno' };
const ROTULO_STATUS_VENDA = { CONCLUIDA: 'Concluída', CANCELADA: 'Cancelada', ABERTA: 'Aberta' };
const reais = (n) => formatarMoeda(n).replace(/^R\$\s?/, '');

/** Detalhe de um caixa: quem fechou, baixa, tabela por forma, conferência, histórico e o movimento detalhado. */
export default function DetalheCaixa({ id, onVoltar }) {
  const showToast = useToast();
  const permissoes = usePermissoesCaixa();
  const [caixa, setCaixa] = useState(null);
  const [erro, setErro] = useState('');
  const [movimento, setMovimento] = useState(null); // null = fechado; [] = aberto sem linhas
  const [carregandoMov, setCarregandoMov] = useState(false);
  const [reabrindo, setReabrindo] = useState(false);
  const [conferindo, setConferindo] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCaixa(await detalharCaixa(id));
      setErro('');
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const alternarMovimento = async () => {
    if (movimento) {
      setMovimento(null);
      return;
    }
    setCarregandoMov(true);
    try {
      setMovimento(await movimentoDetalhadoCaixa(id));
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setCarregandoMov(false);
    }
  };

  const conferir = async () => {
    setConferindo(true);
    setErro('');
    try {
      setCaixa(await conferirCaixa(id));
      showToast(`Caixa nº ${id} marcado como conferido.`, false);
      carregar();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setConferindo(false);
    }
  };

  const fechado = caixa?.status === 'FECHADO';
  const aguardando = caixa?.conferencia === 'AGUARDANDO';
  const podeConferir = permissoes.conferirReabrir && fechado && aguardando;
  const podeReabrir = permissoes.conferirReabrir && fechado;

  const botao = { border: '1px solid var(--line)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };
  const link = { background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--accent)', textAlign: 'left' };
  const emBreve = { ...link, color: 'var(--text-faint)', cursor: 'not-allowed' };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px 28px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={onVoltar} title="Voltar"
            style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0 }}>
            Caixa nº {id}{caixa ? ` — ${caixa.filialNome} · ${caixa.caixaPdv} · ${formatarData(caixa.dataAbertura)}` : ''}
          </h1>
        </div>

        {erro && (
          <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {erro}
          </div>
        )}

        {!caixa && !erro && <p style={{ margin: 0, color: 'var(--text-faint)' }}>Carregando…</p>}

        {caixa && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 28px', fontSize: 13.5 }}>
              <span>Aberto por <b>{caixa.abertoPor || '—'}</b> em {formatarDataHora(caixa.abertoEm)}</span>
              {fechado && <span>Fechado por <b>{caixa.fechadoPor || '—'}</b></span>}
              {fechado && <span>Baixa em <b>{formatarDataHora(caixa.fechadoEm)}</b></span>}
              <span>
                Conferência:{' '}
                <b style={{ color: aguardando ? '#f97316' : 'var(--good, #22c55e)' }}>
                  {aguardando ? 'Aguardando' : `Conferido por ${caixa.conferidoPor || '—'} em ${formatarDataHora(caixa.conferidoEm)}`}
                </b>
              </span>
            </div>

            {caixa.fechadoComDivergencia && (
              <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                Fechado com divergência por {caixa.fechadoPor || '—'}: {caixa.justificativaDivergencia || 'sem justificativa registrada'}
              </div>
            )}
            {caixa.justificativaAbertura && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)' }}><b>Justificativa da abertura:</b> {caixa.justificativaAbertura}</p>}
            {caixa.observacao && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)' }}><b>Observação do fechamento:</b> {caixa.observacao}</p>}
            {caixa.justificativaReabertura && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)' }}>
                <b>Reaberto por {caixa.reabertoPor || '—'}:</b> {caixa.justificativaReabertura}
              </p>
            )}

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: 'var(--text-dim)', fontSize: 12.5, fontWeight: 700 }}>
                    <th style={{ paddingBottom: 10 }}>Forma de Pagamento</th>
                    <th style={{ paddingBottom: 10, textAlign: 'right' }}>Abertura</th>
                    <th style={{ paddingBottom: 10, textAlign: 'right' }}>Movimento</th>
                    <th style={{ paddingBottom: 10, textAlign: 'right' }}>Entradas</th>
                    <th style={{ paddingBottom: 10, textAlign: 'right' }}>Saídas</th>
                    <th style={{ paddingBottom: 10, textAlign: 'right' }}>Valor informado</th>
                    <th style={{ paddingBottom: 10, textAlign: 'right' }}>Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  {caixa.formas.map((f) => {
                    const dif = f.diferenca === null || f.diferenca === undefined ? null : Number(f.diferenca);
                    return (
                      <tr key={f.forma} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '10px 0', fontWeight: 600 }}>{rotuloForma(f.forma)}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right' }}>{reais(f.abertura)}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right' }}>{reais(f.movimento)}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right' }}>{reais(f.entradas)}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right' }}>{reais(f.saidas)}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right' }}>{reais(f.valorConferido)}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: dif ? 'var(--bad, #ef4444)' : 'inherit' }}>
                          {dif === null ? '—' : reais(dif)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: '2px solid var(--line)', fontWeight: 700 }}>
                    <td style={{ padding: '10px 0' }}>Total</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>{reais(caixa.totalAbertura)}</td>
                    <td colSpan={3} />
                    <td title="O que fica no caixa: só o dinheiro contado" style={{ padding: '10px 0', textAlign: 'right' }}>
                      {caixa.totalContabilizado === null ? '—' : reais(caixa.totalContabilizado)}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>{caixa.totalDiferenca === null ? '—' : reais(caixa.totalDiferenca)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <LancamentosCaixa caixaId={id} somenteLeitura />

            {caixa.tentativasFechamento?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                <b style={{ fontSize: 13.5 }}>Tentativas de fechamento recusadas por diferença</b>
                {caixa.tentativasFechamento.map((t, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                    {formatarDataHora(t.em)} — <b>{t.usuario || '—'}</b>:{' '}
                    {t.formas.map((l) => `${rotuloForma(l.forma)}: digitado ${formatarMoeda(l.digitado)}, esperado ${formatarMoeda(l.esperado)}, diferença ${formatarMoeda(l.diferenca)}`).join(' · ')}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button type="button" disabled style={emBreve} title="Em breve">Movimentação de valores (em breve)</button>
              <button type="button" onClick={alternarMovimento} style={link}>
                {carregandoMov ? 'Carregando…' : movimento ? 'Ocultar movimento detalhado do caixa' : 'Movimento detalhado do caixa'}
              </button>
              <button type="button" disabled style={emBreve} title="Em breve">Movimento resumido do dia (em breve)</button>
              <button type="button" disabled style={emBreve} title="Em breve">Formas de pagamento do PDV (em breve)</button>
            </div>

            {movimento && (
              <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: 'var(--panel-2)', color: 'var(--text-faint)' }}>
                      <th style={{ padding: '10px 12px' }}>Movimento</th>
                      <th style={{ padding: '10px 12px' }}>Hora</th>
                      <th style={{ padding: '10px 12px' }}>Vendedor / quem lançou</th>
                      <th style={{ padding: '10px 12px' }}>Forma</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Valor</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimento.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '18px 12px', textAlign: 'center', color: 'var(--text-faint)' }}>Nenhum pagamento lançado neste caixa.</td></tr>
                    ) : movimento.map((m, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--line)', opacity: m.statusVenda === 'CANCELADA' ? 0.6 : 1 }}>
                        <td style={{ padding: '9px 12px', fontWeight: 600 }}>
                          {m.tipo === 'PAGAMENTO' || !m.tipo
                            ? `#${String(m.numeroVenda).padStart(6, '0')}`
                            : `${ROTULO_MOVIMENTO[m.tipo] || m.tipo}${m.conta || m.descricao ? ` · ${m.conta || m.descricao}` : ''}`}
                        </td>
                        <td style={{ padding: '9px 12px' }}>{formatarDataHora(m.hora)}</td>
                        <td style={{ padding: '9px 12px' }}>{m.vendedor}</td>
                        <td style={{ padding: '9px 12px' }}>{rotuloForma(m.forma)}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'right' }}>{formatarMoeda(m.valor)}</td>
                        <td style={{ padding: '9px 12px' }}>{m.statusVenda ? (ROTULO_STATUS_VENDA[m.statusVenda] || m.statusVenda) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(podeConferir || podeReabrir) && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {podeConferir && (
                  <button type="button" onClick={conferir} disabled={conferindo}
                    style={{ ...botao, background: '#16a34a', color: '#fff', border: 'none', opacity: conferindo ? 0.7 : 1 }}>
                    <Check size={15} /> {conferindo ? 'Conferindo…' : 'Marcar como conferido'}
                  </button>
                )}
                {podeReabrir && (
                  <button type="button" onClick={() => setReabrindo(true)} style={{ ...botao, background: 'transparent', color: '#f87171' }}>
                    <RotateCcw size={15} /> Reabrir
                  </button>
                )}
              </div>
            )}

            {caixa.historico?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                <b style={{ fontSize: 13.5 }}>Histórico</b>
                {caixa.historico.map((h, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                    {formatarDataHora(h.em)} — <b>{ROTULO_ACAO[h.acao] || h.acao}</b> por {h.usuario || '—'}{h.texto ? ` · ${h.texto}` : ''}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {reabrindo && caixa && (
        <ModalReabrir
          caixa={caixa}
          onFechar={() => setReabrindo(false)}
          onReaberto={() => {
            setReabrindo(false);
            showToast(`Caixa nº ${id} reaberto: voltou para os caixas abertos.`, false);
            onVoltar();
          }}
        />
      )}
    </div>
  );
}
