import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, FileSpreadsheet, ScanBarcode, UploadCloud } from 'lucide-react';
import * as api from '../../services/inventarioApi';
import { listarFiliais } from '../../services/vendasApi';
import { useToast } from '../ToastContext.jsx';
import { BadgeStatus } from './comuns.jsx';

const CHAVE_FILIAL = 'syscor_inventario_filial';

function lerFilialSalva() {
  try { return localStorage.getItem(CHAVE_FILIAL) || ''; } catch { return ''; }
}
function salvarFilial(id) {
  try { localStorage.setItem(CHAVE_FILIAL, id); } catch { /* sem storage: só não lembra */ }
}

/** Tela inicial do inventário: filial, execuções e novo inventário. */
export default function TelaInicial({ onAbrir }) {
  const showToast = useToast();
  const [filiais, setFiliais] = useState([]);
  const [filialId, setFilialId] = useState(lerFilialSalva);
  const [execucoes, setExecucoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const inputArquivo = useRef(null);
  const inputCentros = useRef(null);

  const carregarFiliais = useCallback(() => {
    listarFiliais().then(setFiliais).catch((e) => setErro(e.mensagem || 'Falha ao carregar as filiais.'));
  }, []);
  useEffect(carregarFiliais, [carregarFiliais]);

  const filial = filiais.find((f) => String(f.id) === String(filialId));
  const aberta = execucoes.find((e) => api.emAndamento(e.status));

  useEffect(() => {
    if (!filialId) { setExecucoes([]); return undefined; }
    let ativo = true;
    setCarregando(true);
    api.listar({ filialId })
      .then((r) => ativo && setExecucoes(r))
      .catch((e) => ativo && setErro(e.mensagem || 'Falha ao carregar os inventários.'))
      .finally(() => ativo && setCarregando(false));
    return () => { ativo = false; };
  }, [filialId]);

  const escolherFilial = (id) => {
    setErro('');
    setFilialId(id);
    salvarFilial(id);
  };

  const novoInventario = async (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setErro('');
    setEnviando(true);
    try {
      const resumo = await api.abrir(filialId, arquivo);
      showToast(`Inventário #${resumo.execucaoId} aberto: ${resumo.totais.esperados} seriais esperados.`);
      onAbrir(resumo.execucaoId);
    } catch (err) {
      setErro(err.mensagem || 'Falha ao abrir o inventário.');
    } finally {
      setEnviando(false);
    }
  };

  const carregarCentros = async (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setErro('');
    try {
      const r = await api.carregarCentrosSap(arquivo);
      const avisos = [
        r.codigosNaoEncontrados.length ? `${r.codigosNaoEncontrados.length} código(s) Adabas não encontrado(s)` : '',
        r.erros.length ? `${r.erros.length} linha(s) com erro` : '',
      ].filter(Boolean).join('; ');
      showToast(`Centros SAP: ${r.filiaisAtualizadas} filial(is) atualizada(s)${avisos ? ` (${avisos})` : ''}.`, Boolean(avisos));
      if (r.erros.length) setErro(r.erros.slice(0, 5).join(' '));
      carregarFiliais();
    } catch (err) {
      setErro(err.mensagem || 'Falha ao carregar os centros SAP.');
    }
  };

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0 }}>Inventário Estoque</h1>
          <div className="sub">IQ09 do SAP × estoque do sistema × contagem física por bipagem</div>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn sm ghost" onClick={() => inputCentros.current?.click()} title="CSV ADABAS;CENTRO_SAP">
            <UploadCloud size={14} /> Carregar centros SAP
          </button>
          <input ref={inputCentros} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={carregarCentros} />
        </div>
      </div>

      <div className="panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, maxWidth: 420 }}>
          Filial
          <select value={filialId} onChange={(e) => escolherFilial(e.target.value)}>
            <option value="">Selecione a filial...</option>
            {filiais.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}{f.centroSap ? ` — centro ${f.centroSap}` : ''}</option>
            ))}
          </select>
        </label>

        {filial && !filial.centroSap && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warn)', fontSize: 13 }}>
            <AlertTriangle size={14} /> Cadastre o centro SAP da filial antes de abrir o inventário (botão "Carregar centros SAP").
          </span>
        )}

        {filial && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {aberta ? (
              <button type="button" className="btn solid" onClick={() => onAbrir(aberta.execucaoId)}>
                <ScanBarcode size={16} /> Continuar contagem (#{aberta.execucaoId})
              </button>
            ) : (
              <button type="button" className="btn solid" disabled={!filial.centroSap || enviando}
                onClick={() => inputArquivo.current?.click()}>
                <FileSpreadsheet size={16} /> {enviando ? 'Importando a IQ09...' : 'Novo inventário (IQ09)'}
              </button>
            )}
            <input ref={inputArquivo} type="file" accept=".xlsx,.xls,.csv,.txt" style={{ display: 'none' }} onChange={novoInventario} />
          </div>
        )}

        {erro && <span role="alert" style={{ color: 'var(--bad)', fontSize: 13 }}>{erro}</span>}
      </div>

      {filial && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <b>Inventários da filial</b>
          </div>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Status</th>
                  <th>Aberto em</th>
                  <th>Por</th>
                  <th>Arquivo</th>
                  <th style={{ textAlign: 'right' }}>Conferidos</th>
                  <th style={{ textAlign: 'right' }}>Pendentes</th>
                  <th style={{ textAlign: 'right' }}>Faltas</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>Carregando...</td></tr>
                ) : execucoes.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>Nenhum inventário desta filial.</td></tr>
                ) : execucoes.map((e) => (
                  <tr key={e.execucaoId} onClick={() => onAbrir(e.execucaoId)} style={{ cursor: 'pointer' }}>
                    <td className="mono">{e.execucaoId}</td>
                    <td><BadgeStatus status={e.status} /></td>
                    <td>{api.formatarDataHora(e.abertoEm)}</td>
                    <td>{e.abertoPor || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-dim)' }}>{e.nomeArquivo || '—'}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{e.totais.conferidos}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{e.totais.pendentes}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>
                      {(e.totais.porResultado.FALTA || 0) + (e.totais.porResultado.SO_NO_SISTEMA || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
