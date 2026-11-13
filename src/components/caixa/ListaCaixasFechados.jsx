import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Check, Clock, Eye, HelpCircle, RotateCcw, Search } from 'lucide-react';
import { listarCaixasFechados } from '../../services/financeiroApi';
import ModalReabrir from './ModalReabrir';
import Paginacao from './Paginacao';
import { botaoBarraSuperior } from './estilos';
import { useToast } from '../ToastContext';
import { formatarData, formatarMoeda, mensagemErro, usePermissoesCaixa } from './utilCaixa';

const TAMANHO = 20;

/** Soma do contabilizado esperado de todas as formas: o que o sistema calculou para o caixa. */
const esperadoTotal = (cx) => cx.formas.reduce((s, f) => s + Number(f.contabilizadoEsperado || 0), 0);

/** Lista de caixas fechados (do servidor), com conferência, "Ver" e "Reabrir" (só para quem pode). */
export default function ListaCaixasFechados({ filiais, filtros, onVoltar, onBuscar, onVer, onAjuda }) {
  const showToast = useToast();
  const permissoes = usePermissoesCaixa();
  const [pagina, setPagina] = useState(0);
  const [dados, setDados] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [reabrindo, setReabrindo] = useState(null);

  const nomePdv = filiais.find((f) => String(f.id) === String(filtros.filialId))?.nome;

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setDados(await listarCaixasFechados({
        filialId: filtros.filialId || undefined,
        dataInicio: filtros.dataInicio || undefined,
        dataFim: filtros.dataFim || undefined,
        conferencia: filtros.conferencia || undefined,
        ordenar: 'data', direcao: 'desc', page: pagina, size: TAMANHO,
      }));
    } catch (e) {
      setErro(mensagemErro(e));
      setDados({ content: [], totalElements: 0, totalPages: 0 });
    } finally {
      setCarregando(false);
    }
  }, [filtros, pagina]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { setPagina(0); }, [filtros]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
              <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#f472b6' }}>
              Caixas fechados{nomePdv ? ` — ${nomePdv}` : ''}{filtros.dataInicio ? ` a partir de ${formatarData(filtros.dataInicio)}` : ''}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onVoltar} style={botaoBarraSuperior}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Voltar</span>
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={onAjuda} style={{ ...botaoBarraSuperior, background: '#7e22ce', color: '#fff' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ajuda</span>
              <HelpCircle size={18} />
            </button>
            <button type="button" onClick={onBuscar} style={{ ...botaoBarraSuperior, background: 'var(--panel-2)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Buscar Registro</span>
              <Search size={18} color="var(--accent)" />
            </button>
          </div>
        </div>

        {erro && (
          <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {erro}
          </div>
        )}

        <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 11.5, letterSpacing: 0.3 }}>
                <th style={{ padding: '12px 14px' }}>Nº</th>
                <th style={{ padding: '12px 14px', color: 'var(--good, #22c55e)' }}>Data</th>
                <th style={{ padding: '12px 14px' }}>PDV</th>
                <th style={{ padding: '12px 14px' }}>Caixa do PDV</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Valor de Abertura</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Valor Contabilizado</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Valor de Fechamento</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Diferença</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Conferência</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Ver</th>
                {permissoes.conferirReabrir && <th style={{ padding: '12px 14px', textAlign: 'center' }}>Reabrir</th>}
              </tr>
            </thead>
            <tbody>
              {dados.content.length === 0 ? (
                <tr>
                  <td colSpan={permissoes.conferirReabrir ? 11 : 10} style={{ textAlign: 'center', padding: '30px 14px', color: 'var(--text-faint)' }}>
                    {carregando ? 'Carregando…' : 'Nenhum caixa fechado encontrado para os filtros selecionados.'}
                  </td>
                </tr>
              ) : (
                dados.content.map((cx) => {
                  const dif = Number(cx.totalDiferenca || 0);
                  const conferido = cx.conferencia === 'CONFERIDO';
                  return (
                    <tr key={cx.id} style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {cx.id}
                        {cx.fechadoComDivergencia && (
                          <span title={`Fechado com divergência: ${cx.justificativaDivergencia || ''}`}
                            style={{ marginLeft: 6, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 3, padding: '1px 5px' }}>
                            Divergência
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>{formatarData(cx.dataAbertura)}</td>
                      <td style={{ padding: '12px 14px' }}>{cx.filialNome}</td>
                      <td style={{ padding: '12px 14px' }}>{cx.caixaPdv}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{formatarMoeda(cx.totalAbertura)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{formatarMoeda(esperadoTotal(cx))}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{formatarMoeda(cx.totalContabilizado)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: dif === 0 ? 'inherit' : 'var(--bad, #ef4444)' }}>{formatarMoeda(dif)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span title={conferido ? `Conferido por ${cx.conferidoPor || '—'}` : 'Aguardando conferência'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {conferido ? (
                            <Check size={20} color="var(--good, #22c55e)" strokeWidth={3} />
                          ) : (
                            <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #f97316', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Clock size={13} color="#f97316" strokeWidth={2.5} />
                            </span>
                          )}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button type="button" onClick={() => onVer(cx.id)} title="Ver detalhes do caixa"
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 4 }}>
                          <Eye size={17} />
                        </button>
                      </td>
                      {permissoes.conferirReabrir && (
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button type="button" onClick={() => setReabrindo(cx)} title="Reabrir caixa"
                            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4 }}>
                            <RotateCcw size={17} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginacao pagina={pagina} totalPaginas={dados.totalPages || 0} total={dados.totalElements || 0} tamanho={TAMANHO} onMudar={setPagina} />
      </div>

      {reabrindo && (
        <ModalReabrir
          caixa={reabrindo}
          onFechar={() => setReabrindo(null)}
          onReaberto={(caixa) => {
            setReabrindo(null);
            showToast(`Caixa nº ${caixa.id} reaberto: voltou para os caixas abertos.`, false);
            carregar();
          }}
        />
      )}
    </div>
  );
}
