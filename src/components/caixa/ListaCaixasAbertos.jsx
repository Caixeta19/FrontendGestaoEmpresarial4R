import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Info, RefreshCw, Search } from 'lucide-react';
import { listarCaixasAbertos } from '../../services/financeiroApi';
import AbrirCaixaBloco from './AbrirCaixaBloco';
import Paginacao from './Paginacao';
import PainelFechamento from './PainelFechamento';
import SeletorPdv from './SeletorPdv';
import { useToast } from '../ToastContext';
import { formatarData, mensagemErro, rotuloDataCaixa, usePermissoesCaixa } from './utilCaixa';

const TAMANHO = 20;

/** Lista de caixas abertos (do servidor), com o bloco "Abrir caixa" e a conferência/fechamento de cada um. */
export default function ListaCaixasAbertos({ filiais, onVoltar }) {
  const showToast = useToast();
  const permissoes = usePermissoesCaixa();
  const [filialId, setFilialId] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [pagina, setPagina] = useState(0);
  const [dados, setDados] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [expandido, setExpandido] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const r = await listarCaixasAbertos({
        filialId: filialId || undefined, busca: buscaAplicada || undefined, ordenar: 'data', direcao: 'desc', page: pagina, size: TAMANHO,
      });
      setDados(r);
    } catch (e) {
      setErro(mensagemErro(e));
      setDados({ content: [], totalElements: 0, totalPages: 0 });
    } finally {
      setCarregando(false);
    }
  }, [filialId, buscaAplicada, pagina]);

  useEffect(() => { carregar(); }, [carregar]);

  // Digitar na busca espera uma pausa antes de consultar o servidor.
  useEffect(() => {
    const t = setTimeout(() => { setBuscaAplicada(busca.trim()); setPagina(0); }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  const aoAbrir = (caixa) => {
    showToast(`Caixa nº ${caixa.id} (${caixa.filialNome}) aberto.`, false);
    setExpandido(null);
    carregar();
  };

  const aoFechar = (fechado) => {
    showToast(`Caixa nº ${fechado.id} (${fechado.filialNome}) fechado${fechado.fechadoComDivergencia ? ' com divergência: aguarda a conferência' : ''}.`, false);
    setExpandido(null);
    carregar();
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px 28px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={onVoltar} title="Voltar ao Painel"
              style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f472b6' }}>Lista de caixas abertos</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Buscar por Nº, PDV ou caixa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '6px 12px 6px 32px', fontSize: 12.5, outline: 'none', width: 240 }}
              />
            </div>
            <button type="button" onClick={() => { setFilialId(''); setBusca(''); setPagina(0); setExpandido(null); carregar(); }}
              style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)', padding: '7px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={13} color="var(--accent)" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        <AbrirCaixaBloco filiais={filiais} onAberto={aoAbrir} />

        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 16, maxWidth: 540 }}>
          <label style={{ fontSize: 13.5, fontWeight: 600 }}>Filtrar PDV:</label>
          <SeletorPdv filiais={filiais} value={filialId} onChange={(id) => { setFilialId(id); setPagina(0); setExpandido(null); }} />
        </div>

        {erro && (
          <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {erro}
          </div>
        )}

        <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px', color: 'var(--good, #22c55e)', width: '10%' }}>Nº</th>
                <th style={{ padding: '12px 16px', width: '33%' }}>PDV</th>
                <th style={{ padding: '12px 16px', width: '27%' }}>Caixa do PDV</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '20%' }}>Data do caixa</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: '10%' }}>Conferir</th>
              </tr>
            </thead>
            <tbody>
              {dados.content.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px 14px', color: 'var(--text-faint)' }}>
                    {carregando ? 'Carregando…' : 'Nenhum caixa aberto encontrado para os filtros selecionados.'}
                  </td>
                </tr>
              ) : (
                dados.content.map((cx) => {
                  const aberto = expandido === cx.id;
                  const data = rotuloDataCaixa(cx.dataAbertura);
                  return (
                    <React.Fragment key={cx.id}>
                      <tr style={{ borderBottom: aberto ? 'none' : '1px solid var(--line)', background: aberto ? 'var(--panel-2)' : 'var(--panel)', color: 'var(--text)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{cx.id}</td>
                        <td style={{ padding: '12px 16px' }}>{cx.filialNome}</td>
                        <td style={{ padding: '12px 16px' }}>{cx.caixaPdv}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span title={formatarData(cx.dataAbertura)} style={{ background: data.cor, color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 700, display: 'inline-block' }}>
                            {data.texto}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button type="button" onClick={() => setExpandido(aberto ? null : cx.id)} title="Abrir conferência e fechamento do caixa"
                            style={{ background: aberto ? 'rgba(245, 158, 11, 0.2)' : 'transparent', border: aberto ? '1px solid #ef4444' : 'none', borderRadius: 4, color: '#f59e0b', cursor: 'pointer', padding: '4px 6px', display: 'inline-flex', alignItems: 'center' }}>
                            <Info size={19} />
                          </button>
                        </td>
                      </tr>
                      {aberto && (
                        <tr style={{ background: 'var(--panel-2)', borderBottom: '2px solid var(--line)' }}>
                          <td colSpan={5} style={{ padding: '16px 24px 28px' }}>
                            <PainelFechamento
                              caixa={cx}
                              permissoes={permissoes}
                              onFechado={aoFechar}
                              onAtualizar={carregar}
                              onCancelar={() => setExpandido(null)}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginacao pagina={pagina} totalPaginas={dados.totalPages || 0} total={dados.totalElements || 0} tamanho={TAMANHO}
          onMudar={(p) => { setPagina(p); setExpandido(null); }} />
      </div>
    </div>
  );
}
