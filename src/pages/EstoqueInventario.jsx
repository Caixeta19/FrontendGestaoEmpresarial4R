import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  RotateCcw,
  ScanBarcode,
  Search,
  Sparkles,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import * as api from '../services/inventarioApi';
import { listarFiliais } from '../services/vendasApi';
import { useToast } from '../components/ToastContext.jsx';
import LeitorCamera from '../components/inventario/LeitorCamera.jsx';
import ModalFechamento from '../components/inventario/ModalFechamento.jsx';
import { beep } from '../components/inventario/beep';

const CHAVE_FILIAL = 'syscor_inventario_filial';
const TAMANHO_PAGINA = 50;
const ATUALIZACAO_MS = 15000;

/** Abas da tabela: rótulo e resultados que cada uma mostra. */
const ABAS = [
  { id: 'PENDENTES', rotulo: 'Pendentes', resultados: ['PENDENTE'] },
  { id: 'CONFERIDOS', rotulo: 'Conferido', resultados: ['CONFERIDO'] },
  { id: 'SOBRAS', rotulo: 'Sobra física', resultados: ['SOBRA_FISICA'] },
  { id: 'SEM_ENTRADA', rotulo: 'Sem entrada no sistema', resultados: ['SEM_ENTRADA_SISTEMA'] },
  { id: 'VENDIDO', rotulo: 'Vendido em estoque', resultados: ['VENDIDO_EM_ESTOQUE'] },
  { id: 'DIVERGENCIAS', rotulo: 'Divergências', resultados: ['SEM_ENTRADA_SISTEMA', 'VENDIDO_EM_ESTOQUE', 'STATUS_SAP_DIVERGENTE', 'FALTA', 'SO_NO_SISTEMA'] },
  { id: 'FALTA', rotulo: 'Falta', resultados: ['FALTA', 'SO_NO_SISTEMA'], soFechado: true },
  { id: 'TODOS', rotulo: 'Todos', resultados: [] },
];

const TONS = {
  verde: { cor: 'var(--good)', fundo: 'var(--good-soft)' },
  laranja: { cor: 'var(--warn)', fundo: 'var(--warn-soft)' },
  vermelho: { cor: 'var(--bad)', fundo: 'var(--bad-soft)' },
  cinza: { cor: 'var(--text-dim)', fundo: 'var(--panel-2)' },
};

function lerFilialSalva() {
  try { return localStorage.getItem(CHAVE_FILIAL) || ''; } catch { return ''; }
}
function salvarFilial(id) {
  try { localStorage.setItem(CHAVE_FILIAL, id); } catch { /* sem storage: só não lembra */ }
}

export default function EstoqueInventario() {
  const [params, setParams] = useSearchParams();
  const execucaoId = params.get('id');

  const abrirExecucao = (id) => setParams(id ? { id: String(id) } : {});

  return execucaoId
    ? <TelaContagem key={execucaoId} execucaoId={Number(execucaoId)} onVoltar={() => abrirExecucao(null)} />
    : <TelaInicial onAbrir={abrirExecucao} />;
}

// =====================================================================================================================
// Tela inicial: filial, execuções e novo inventário
// =====================================================================================================================

function TelaInicial({ onAbrir }) {
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Inventário Estoque</h1>
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

function BadgeStatus({ status }) {
  const cor = status === 'FECHADO' ? 'good' : status === 'CANCELADO' ? 'neutral' : 'warn';
  return <span className={`badge ${cor}`}>{api.STATUS_EXECUCAO[status] || status}</span>;
}

// =====================================================================================================================
// Tela de contagem (e resultado depois de fechar)
// =====================================================================================================================

function TelaContagem({ execucaoId, onVoltar }) {
  const showToast = useToast();
  const [resumo, setResumo] = useState(null);
  const [aba, setAba] = useState('PENDENTES');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [pagina, setPagina] = useState(0);
  const [erro, setErro] = useState('');
  const [serial, setSerial] = useState('');
  const [retorno, setRetorno] = useState(null);
  const [camera, setCamera] = useState(false);
  const [fechando, setFechando] = useState(false);
  const [diagnosticando, setDiagnosticando] = useState(false);
  const campoRef = useRef(null);
  const recarregarTimer = useRef(null);
  const primeiraCarga = useRef(true);

  const contando = resumo ? api.emAndamento(resumo.status) : false;
  const abaAtual = ABAS.find((a) => a.id === aba) || ABAS[0];

  const carregar = useCallback(async () => {
    try {
      const r = await api.buscar(execucaoId, { resultados: abaAtual.resultados, busca: buscaAplicada, pagina, tamanho: TAMANHO_PAGINA });
      setResumo(r);
      setErro('');
      // Inventário já fechado: abre direto nas divergências.
      if (primeiraCarga.current) {
        primeiraCarga.current = false;
        if (!api.emAndamento(r.status) && abaAtual.id === 'PENDENTES') setAba('DIVERGENCIAS');
      }
    } catch (e) {
      setErro(e.mensagem || 'Falha ao carregar o inventário.');
    }
  }, [execucaoId, abaAtual, buscaAplicada, pagina]);

  useEffect(() => { carregar(); }, [carregar]);

  // Várias pessoas contando ao mesmo tempo: atualiza contadores e tabela de tempos em tempos.
  useEffect(() => {
    if (!contando) return undefined;
    const t = setInterval(carregar, ATUALIZACAO_MS);
    return () => clearInterval(t);
  }, [contando, carregar]);

  // Busca com espera: digitar não dispara uma consulta por tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaAplicada((anterior) => {
        if (anterior !== busca) setPagina(0);
        return busca;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [busca]);

  const focarCampo = () => setTimeout(() => campoRef.current?.focus(), 0);
  useEffect(() => { if (contando) focarCampo(); }, [contando]);

  const recarregarEmBreve = () => {
    clearTimeout(recarregarTimer.current);
    recarregarTimer.current = setTimeout(carregar, 700);
  };
  useEffect(() => () => clearTimeout(recarregarTimer.current), []);

  const registrarLeitura = async (texto) => {
    const lido = String(texto || '').trim();
    if (!lido) return;
    try {
      const r = await api.bipar(execucaoId, lido);
      const tom = api.tomDaBipagem(r);
      beep(tom);
      setRetorno({ ...r, tom });
      setResumo((atual) => (atual ? { ...atual, totais: r.totais } : atual));
      recarregarEmBreve();
    } catch (e) {
      beep('vermelho');
      setRetorno({ tom: 'vermelho', serial: lido, resultado: null, mensagem: e.mensagem || 'Falha ao registrar a bipagem.' });
    }
  };

  // O leitor (USB/Bluetooth) digita o serial e manda Enter.
  const onSubmitLeitura = (e) => {
    e.preventDefault();
    const lido = serial;
    setSerial('');
    focarCampo();
    registrarLeitura(lido);
  };

  const desfazer = async (itemId) => {
    try {
      const totais = await api.desfazerBipagem(execucaoId, itemId);
      setResumo((atual) => (atual ? { ...atual, totais } : atual));
      showToast('Bipagem desfeita.');
      carregar();
    } catch (e) {
      showToast(e.mensagem || 'Falha ao desfazer a bipagem.', true);
    } finally {
      focarCampo();
    }
  };

  const cancelarInventario = async () => {
    if (!window.confirm('Cancelar este inventário? A contagem não poderá ser retomada.')) return;
    try {
      await api.cancelar(execucaoId);
      showToast('Inventário cancelado.');
      onVoltar();
    } catch (e) {
      showToast(e.mensagem || 'Falha ao cancelar.', true);
    }
  };

  const refazerDiagnostico = async () => {
    setDiagnosticando(true);
    try {
      await api.diagnosticar(execucaoId);
      showToast('Diagnóstico atualizado.');
    } catch (e) {
      showToast(e.mensagem || 'Falha no diagnóstico.', true);
    } finally {
      await carregar();
      setDiagnosticando(false);
    }
  };

  const exportar = async () => {
    try {
      await api.exportarCsv(execucaoId);
    } catch (e) {
      showToast(e.mensagem || 'Falha ao exportar.', true);
    }
  };

  if (!resumo) {
    return (
      <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button type="button" className="btn sm ghost" onClick={onVoltar} style={{ alignSelf: 'flex-start' }}>
          <ArrowLeft size={14} /> Voltar
        </button>
        <span style={{ color: erro ? 'var(--bad)' : 'var(--text-faint)' }}>{erro || 'Carregando o inventário...'}</span>
      </section>
    );
  }

  const totais = resumo.totais;
  const contagemAba = (a) => {
    if (!a.resultados.length) return Object.values(totais.porResultado).reduce((s, v) => s + v, 0);
    return a.resultados.reduce((s, r) => s + (totais.porResultado[r] || 0), 0);
  };
  const abasVisiveis = ABAS.filter((a) => !a.soFechado || !contando);
  const progresso = totais.esperados > 0 ? Math.round(((totais.esperados - totais.pendentes) / totais.esperados) * 100) : 0;

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Cabeçalho */}
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Inventário #{resumo.execucaoId}</h1>
            <BadgeStatus status={resumo.status} />
          </div>
          <div className="sub">
            {resumo.filialNome}{resumo.centroSap ? ` · centro ${resumo.centroSap}` : ''} · aberto em {api.formatarDataHora(resumo.abertoEm)}
            {resumo.abertoPor ? ` por ${resumo.abertoPor}` : ''}
            {resumo.fechadoEm ? ` · ${resumo.status === 'CANCELADO' ? 'cancelado' : 'fechado'} em ${api.formatarDataHora(resumo.fechadoEm)}` : ''}
          </div>
        </div>
        <div className="topbar-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn sm ghost" onClick={onVoltar}><ArrowLeft size={14} /> Voltar</button>
          {contando ? (
            <>
              <button type="button" className="btn sm ghost" onClick={cancelarInventario}>Cancelar inventário</button>
              <button type="button" className="btn sm solid" onClick={() => setFechando(true)}>Fechar inventário</button>
            </>
          ) : (
            <button type="button" className="btn sm solid" onClick={exportar}><Download size={14} /> Exportar CSV</button>
          )}
        </div>
      </div>

      {/* Resumo da importação */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-dim)' }}>
        <span>IQ09: <b>{resumo.nomeArquivo || '—'}</b> ({resumo.totalLinhasSap} linhas)</span>
        <span>De outro centro: <b>{resumo.linhasIgnoradasOutroCentro}</b></span>
        <span>Sem serial: <b>{resumo.linhasSemSerial}</b></span>
        {resumo.centrosSemFilial?.length > 0 && (
          <span title={resumo.centrosSemFilial.join(', ')}>
            Centros sem filial: <b>{resumo.centrosSemFilial.length}</b> ({resumo.centrosSemFilial.slice(0, 6).join(', ')}{resumo.centrosSemFilial.length > 6 ? '…' : ''})
          </span>
        )}
      </div>

      {/* Bipagem */}
      {contando && (
        <div className="panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <form onSubmit={onSubmitLeitura} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              ref={campoRef}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="Bipe ou digite o IMEI/serial e tecle Enter"
              aria-label="IMEI ou serial bipado"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              onBlur={(e) => {
                const destino = e.relatedTarget;
                if (!destino || !['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(destino.tagName)) focarCampo();
              }}
              className="mono"
              style={{ flex: '1 1 240px', minWidth: 0, height: 52, fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}
            />
            <button type="button" className="btn ghost" onClick={() => setCamera(true)} style={{ height: 52 }}>
              <Camera size={18} /> Câmera
            </button>
          </form>

          {retorno && (
            <div
              role="status"
              aria-live="polite"
              style={{
                padding: '10px 14px', borderRadius: 8, border: `1px solid ${TONS[retorno.tom].cor}`,
                background: TONS[retorno.tom].fundo, color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: 2,
              }}
            >
              <span style={{ color: TONS[retorno.tom].cor, fontWeight: 700, wordBreak: 'break-all' }}>
                {retorno.jaBipado ? 'Já bipado' : retorno.resultado ? api.rotuloResultado(retorno.resultado) : 'Erro'}
                <span className="mono" style={{ fontWeight: 600, marginLeft: 8, color: 'var(--text)' }}>{retorno.serial}</span>
              </span>
              {retorno.modelo && <span style={{ fontSize: 13 }}>{retorno.modelo}</span>}
              {retorno.mensagem && <span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{retorno.mensagem}</span>}
            </div>
          )}
        </div>
      )}

      {/* Contadores */}
      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        <Kpi rotulo="Esperados" valor={totais.esperados} />
        <Kpi rotulo="Bipados" valor={totais.bipados} cor="var(--accent)" />
        <Kpi rotulo="Pendentes" valor={totais.pendentes} cor={totais.pendentes ? 'var(--warn)' : 'var(--good)'} />
        <Kpi rotulo="Sobras" valor={totais.sobras} cor={totais.sobras ? 'var(--warn)' : undefined} />
        <Kpi rotulo="Divergências" valor={totais.divergencias} cor={totais.divergencias ? 'var(--bad)' : undefined} />
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progresso}
        style={{ height: 8, borderRadius: 99, background: 'var(--panel-2)', overflow: 'hidden' }}>
        <div style={{ width: `${progresso}%`, height: '100%', background: 'var(--good)', transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: -8 }}>{progresso}% dos esperados bipados ou já fora da contagem</span>

      {/* Diagnóstico da IA (depois de fechar) */}
      {resumo.status === 'FECHADO' && (
        <div className="panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <b style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Sparkles size={16} color="var(--accent)" /> Diagnóstico da IA</b>
            <button type="button" className="btn sm ghost" onClick={refazerDiagnostico} disabled={diagnosticando}>
              <RotateCcw size={14} /> {diagnosticando ? 'Diagnosticando...' : 'Refazer diagnóstico'}
            </button>
          </div>
          <span style={{ fontSize: 13.5, whiteSpace: 'pre-line' }}>{resumo.resumoIa || 'Ainda sem diagnóstico.'}</span>
          {resumo.diagnosticadoEm && (
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
              Diagnosticado em {api.formatarDataHora(resumo.diagnosticadoEm)}. A IA sugere a causa; quem decide se o IMEI bate é o cruzamento exato.
            </span>
          )}
        </div>
      )}

      {/* Últimas bipagens */}
      {contando && resumo.ultimasBipagens?.length > 0 && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 13 }}>Últimas bipagens</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {resumo.ultimasBipagens.map((b) => (
              <li key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-faint)', minWidth: 42 }}>{api.formatarHora(b.bipadoEm)}</span>
                <BadgeResultado resultado={b.resultado} />
                <span className="mono" style={{ fontSize: 12.5, wordBreak: 'break-all' }}>{b.serial}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', flex: 1, minWidth: 120 }}>{b.descricao || ''}{b.bipadoPor ? ` · ${b.bipadoPor}` : ''}</span>
                <button type="button" className="btn sm ghost" onClick={() => desfazer(b.id)}>Desfazer</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabela */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {abasVisiveis.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`btn sm ${aba === a.id ? 'solid' : 'ghost'}`}
                onClick={() => { setAba(a.id); setPagina(0); }}
              >
                {a.rotulo} ({contagemAba(a)})
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Filtrar por IMEI, SKU ou Nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ paddingLeft: 32, height: 34, fontSize: 12.5, width: '100%' }}
            />
          </div>
        </div>

        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Resultado</th>
                <th>Material / SKU</th>
                <th>Serial</th>
                <th>Descrição</th>
                <th>Status no SAP</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {resumo.itens.conteudo.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '28px 10px', color: 'var(--text-faint)' }}>
                    Nenhum item nesta aba.
                  </td>
                </tr>
              ) : resumo.itens.conteudo.map((item) => (
                <tr key={item.id}>
                  <td><BadgeResultado resultado={item.resultado} /></td>
                  <td className="mono"><b>{item.materialSap || '—'}</b></td>
                  <td className="mono">{item.serial}</td>
                  <td>{item.descricao || '—'}</td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {item.statusSistemaSap || item.statusUsuarioSap ? (
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                        {item.statusSistemaSap && <span className="badge neutral">{item.statusSistemaSap}</span>}
                        {item.statusUsuarioSap && <span className={`badge ${item.statusUsuarioSap === 'ADEP' ? 'good' : 'warn'}`}>{item.statusUsuarioSap}</span>}
                      </span>
                    ) : <span style={{ color: 'var(--text-faint)' }}>Fora da IQ09</span>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-dim)', minWidth: 200 }}>
                    <div>{item.observacao}</div>
                    {item.statusEstoque && (
                      <div style={{ color: 'var(--text-faint)' }}>Sistema: {item.statusEstoque}{item.filialEstoque ? ` · ${item.filialEstoque}` : ''}</div>
                    )}
                    {item.justificativa && <div style={{ fontStyle: 'italic' }}>Justificativa: {item.justificativa}</div>}
                    {item.causaProvavel && (
                      <div style={{ marginTop: 4, color: 'var(--text)' }}>
                        <Sparkles size={11} color="var(--accent)" /> <b>{item.causaProvavelRotulo}</b>
                        {item.confiancaIa ? ` (confiança ${item.confiancaIa.toLowerCase()})` : ''}
                        {item.acaoSugerida ? ` — ${item.acaoSugerida}` : ''}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resumo.itens.totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 12.5, flexWrap: 'wrap' }}>
            <button type="button" className="btn sm ghost" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>Anterior</button>
            <span>Página {pagina + 1} de {resumo.itens.totalPaginas} · {resumo.itens.totalItens} itens</span>
            <button type="button" className="btn sm ghost" disabled={pagina + 1 >= resumo.itens.totalPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima</button>
          </div>
        )}
      </div>

      {erro && <span role="alert" style={{ color: 'var(--bad)', fontSize: 13 }}>{erro}</span>}

      {camera && (
        <LeitorCamera
          onLeitura={registrarLeitura}
          onFechar={() => { setCamera(false); focarCampo(); }}
        />
      )}

      {fechando && (
        <ModalFechamento
          execucaoId={execucaoId}
          onCancelar={() => { setFechando(false); focarCampo(); }}
          onFechado={() => {
            setFechando(false);
            setAba('DIVERGENCIAS');
            setPagina(0);
            showToast('Inventário fechado.');
          }}
        />
      )}
    </section>
  );
}

function Kpi({ rotulo, valor, cor }) {
  return (
    <div className="kpi" style={{ padding: '10px 12px' }}>
      <div className="lbl">{rotulo}</div>
      <div className="val mono" style={{ color: cor, fontSize: 22 }}>{valor}</div>
    </div>
  );
}

function BadgeResultado({ resultado }) {
  const cor = api.corResultado(resultado);
  const Icone = cor === 'good' ? CheckCircle2 : cor === 'bad' ? XCircle : cor === 'warn' ? AlertTriangle : null;
  return (
    <span className={`badge ${cor}`} style={{ whiteSpace: 'nowrap' }}>
      {Icone && <Icone size={12} />} {api.rotuloResultado(resultado)}
    </span>
  );
}
