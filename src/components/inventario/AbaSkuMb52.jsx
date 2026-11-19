import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, RotateCcw, Search } from 'lucide-react';
import * as api from '../../services/inventarioApi';
import { useToast } from '../ToastContext.jsx';
import { BadgeResultado, Kpi } from './comuns.jsx';

const TAMANHO_PAGINA = 50;

/** Filtros da tabela por SKU: rótulo e resultados de cada um. */
const FILTROS = [
  { id: 'TODOS', rotulo: 'Todos', resultados: [] },
  { id: 'CONFERIDO', rotulo: 'Conferidos', resultados: ['CONFERIDO'] },
  { id: 'CONTAGEM_DIVERGENTE', rotulo: 'Contagem divergente', resultados: ['CONTAGEM_DIVERGENTE'] },
  { id: 'SAP_X_SISTEMA', rotulo: 'SAP × sistema', resultados: ['SAP_ACIMA_SISTEMA', 'SAP_ABAIXO_SISTEMA'] },
  { id: 'MB52_DIFERE_IQ09', rotulo: 'MB52 × IQ09', resultados: ['MB52_DIFERE_IQ09'] },
  { id: 'SO_NO_SAP', rotulo: 'Só no SAP', resultados: ['SO_NO_SAP'] },
  { id: 'SO_NO_SISTEMA', rotulo: 'Só no sistema', resultados: ['SO_NO_SISTEMA'] },
  { id: 'SKU_NAO_IDENTIFICADO', rotulo: 'Não identificados', resultados: ['SKU_NAO_IDENTIFICADO'] },
];

const ORDENACOES = [
  { id: 'sku', rotulo: 'SKU' },
  { id: 'valor', rotulo: 'Maior valor da diferença' },
  { id: 'quantidade', rotulo: 'Maior diferença SAP × sistema' },
];

const ROTULO_ORIGEM = {
  ACESSORIO: 'Acessório (código do estoque)',
  IQ09: 'Material da IQ09',
  TABELA_PRECO: 'Estimado pela tabela de preços',
};

/**
 * Conferência por SKU com a MB52 (informativa): MB52 (utilização livre) × IQ09 × sistema × contagem.
 * Recarrega quando {@code versao} muda (a tela de contagem incrementa a cada bipagem/atualização).
 */
export default function AbaSkuMb52({ execucaoId, mb52, contando, versao, onMb52Importada }) {
  const showToast = useToast();
  const [filtro, setFiltro] = useState('TODOS');
  const [somenteDiferenca, setSomenteDiferenca] = useState(false);
  const [ordenacao, setOrdenacao] = useState('sku');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [pagina, setPagina] = useState(0);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [importando, setImportando] = useState(false);
  const [editando, setEditando] = useState(null);
  const inputMb52 = useRef(null);

  const importada = Boolean(mb52?.importada);
  const filtroAtual = FILTROS.find((f) => f.id === filtro) || FILTROS[0];

  const carregar = useCallback(async () => {
    if (!importada) return;
    setCarregando(true);
    try {
      const r = await api.listarSkus(execucaoId, {
        resultados: filtroAtual.resultados, busca: buscaAplicada, somenteDiferenca, ordenacao, pagina, tamanho: TAMANHO_PAGINA,
      });
      setDados(r);
      setErro('');
    } catch (e) {
      setErro(e.mensagem || 'Falha ao carregar a conferência por SKU.');
    } finally {
      setCarregando(false);
    }
  }, [execucaoId, importada, filtroAtual, buscaAplicada, somenteDiferenca, ordenacao, pagina]);

  useEffect(() => { carregar(); }, [carregar, versao]);

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

  const importar = async (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setImportando(true);
    try {
      const r = await api.importarMb52(execucaoId, arquivo);
      showToast(`MB52 importada: ${r.daFilial} linha(s) da filial, ${r.outroCentro} de outro centro, `
        + `${r.ignoradas} ignorada(s); ${r.skusComDiferenca} SKU(s) com diferença.`);
      setPagina(0);
      onMb52Importada?.();
    } catch (err) {
      showToast(err.mensagem || 'Falha ao importar a MB52.', true);
    } finally {
      setImportando(false);
    }
  };

  const exportar = async () => {
    try {
      await api.exportarCsvSku(execucaoId);
    } catch (e) {
      showToast(e.mensagem || 'Falha ao exportar.', true);
    }
  };

  const salvarContagem = async (sku, quantidade, justificativa) => {
    try {
      const r = await api.contarSku(execucaoId, sku.id, quantidade, justificativa);
      showToast(quantidade === null ? 'Contagem manual removida.' : `Contagem de ${sku.sku} registrada: ${api.rotuloResultadoSku(r.resultado)}.`);
      setEditando(null);
      carregar();
      return true;
    } catch (e) {
      showToast(e.mensagem || 'Falha ao registrar a contagem.', true);
      return false;
    }
  };

  const botaoImportar = contando && (
    <>
      <button type="button" className={`btn sm ${importada ? 'ghost' : 'solid'}`} disabled={importando}
        onClick={() => inputMb52.current?.click()} title="MB52 exportada do SAP em .xlsx">
        <FileSpreadsheet size={14} /> {importando ? 'Importando a MB52...' : importada ? 'Reimportar MB52' : 'Importar MB52'}
      </button>
      <input ref={inputMb52} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={importar} />
    </>
  );

  if (!importada) {
    return (
      <div className="panel">
        <div className="empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <FileSpreadsheet size={26} />
          <span style={{ color: 'var(--text)' }}>Importe a MB52 para conferir por SKU</span>
          <span style={{ fontSize: 12.5, maxWidth: 520 }}>
            Compara, por material SAP, a quantidade de utilização livre da MB52 com a IQ09, o estoque do sistema e a contagem.
            É uma conferência informativa: não muda o cruzamento por serial nem o fechamento.
          </span>
          {botaoImportar || <span style={{ fontSize: 12.5 }}>Este inventário não está mais em andamento.</span>}
        </div>
      </div>
    );
  }

  const totais = dados?.totaisPorResultado || {};
  const totalSkus = Object.values(totais).reduce((s, v) => s + v, 0);
  const comDiferenca = totalSkus - (totais.CONFERIDO || 0);
  const linhas = dados?.conteudo || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Resumo da MB52 */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', fontSize: 12.5, color: 'var(--text-dim)' }}>
        <span>MB52: <b>{mb52.arquivo || '—'}</b> ({mb52.linhasDaFilial} linhas da filial)</span>
        <span>De outro centro: <b>{mb52.linhasOutroCentro}</b></span>
        <span>Ignoradas: <b>{mb52.linhasIgnoradas}</b></span>
        <span>Importada em {api.formatarDataHora(mb52.em)}{mb52.por ? ` por ${mb52.por}` : ''}</span>
        <span style={{ flex: 1 }} />
        {botaoImportar}
        <button type="button" className="btn sm ghost" onClick={exportar}><Download size={14} /> Exportar CSV</button>
      </div>

      {/* Cards */}
      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <Kpi rotulo="SKUs conferidos" valor={totais.CONFERIDO ?? '—'} cor="var(--good)" />
        <Kpi rotulo="Com diferença" valor={dados ? comDiferenca : '—'} cor={comDiferenca ? 'var(--warn)' : undefined} />
        <Kpi rotulo="Só no SAP" valor={totais.SO_NO_SAP ?? '—'} cor={totais.SO_NO_SAP ? 'var(--bad)' : undefined} />
        <Kpi rotulo="Só no sistema" valor={totais.SO_NO_SISTEMA ?? '—'} cor={totais.SO_NO_SISTEMA ? 'var(--bad)' : undefined} />
        <Kpi rotulo="Não identificados" valor={totais.SKU_NAO_IDENTIFICADO ?? '—'}
          dica="Itens do sistema sem material na IQ09 nem na tabela de preços" />
        <Kpi rotulo="Valor das diferenças (estimativa)" valor={dados ? api.formatarMoeda(dados.valorEstimadoDiferencas) : '—'}
          dica="Soma de |valor unitário da MB52 × (MB52 − sistema)|" />
      </div>

      {/* Tabela */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTROS.map((f) => {
              const qtd = f.resultados.length ? f.resultados.reduce((s, r) => s + (totais[r] || 0), 0) : totalSkus;
              return (
                <button key={f.id} type="button" className={`btn sm ${filtro === f.id ? 'solid' : 'ghost'}`}
                  onClick={() => { setFiltro(f.id); setPagina(0); }}>
                  {f.rotulo} ({qtd})
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-faint)' }} />
              <input type="text" placeholder="Buscar por SKU ou descrição..." value={busca} aria-label="Buscar SKU"
                onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: 32, height: 34, fontSize: 12.5, width: '100%' }} />
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <input type="checkbox" checked={somenteDiferenca} onChange={(e) => { setSomenteDiferenca(e.target.checked); setPagina(0); }} />
              Somente com diferença
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              Ordenar por
              <select value={ordenacao} onChange={(e) => { setOrdenacao(e.target.value); setPagina(0); }} style={{ height: 34, fontSize: 12.5 }}>
                {ORDENACOES.map((o) => <option key={o.id} value={o.id}>{o.rotulo}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Descrição</th>
                <th style={{ textAlign: 'right' }} title="Utilização livre">MB52 (livre)</th>
                <th style={{ textAlign: 'right' }}>IQ09</th>
                <th style={{ textAlign: 'right' }}>Sistema</th>
                <th style={{ textAlign: 'right' }}>Contagem</th>
                <th style={{ textAlign: 'right' }}>SAP − sistema</th>
                <th style={{ textAlign: 'right' }}>SAP − IQ09</th>
                <th style={{ textAlign: 'right' }}>Contagem − SAP</th>
                <th style={{ textAlign: 'right' }} title="Em controle de qualidade, bloqueado e em trânsito: não entram na conta">Outros estoques SAP</th>
                <th style={{ textAlign: 'right' }}>Valor dif. (est.)</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {erro && !dados ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: 24 }}>
                  <span role="alert" style={{ color: 'var(--bad)', marginRight: 10 }}>{erro}</span>
                  <button type="button" className="btn sm ghost" onClick={carregar}><RotateCcw size={14} /> Tentar de novo</button>
                </td></tr>
              ) : !dados ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>Carregando...</td></tr>
              ) : linhas.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>Nenhum SKU neste filtro.</td></tr>
              ) : linhas.map((s) => (
                <React.Fragment key={s.id}>
                  <LinhaSku sku={s} podeContar={contando && s.permiteContagemManual}
                    onContar={() => setEditando(editando === s.id ? null : s.id)} />
                  {editando === s.id && (
                    <tr>
                      <td colSpan={12} style={{ background: 'var(--panel-2)' }}>
                        <EditorContagem sku={s} onSalvar={salvarContagem} onCancelar={() => setEditando(null)} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {dados && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 12.5, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-faint)' }}>
              {carregando ? 'Atualizando...' : erro ? <span style={{ color: 'var(--bad)' }}>{erro}</span> : 'Valores de diferença são estimativas pelo valor da MB52.'}
            </span>
            {dados.totalPaginas > 1 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <button type="button" className="btn sm ghost" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>Anterior</button>
                <span>Página {pagina + 1} de {dados.totalPaginas} · {dados.totalItens} SKUs</span>
                <button type="button" className="btn sm ghost" disabled={pagina + 1 >= dados.totalPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima</button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Diferença com sinal e cor: zero neutro, positiva/negativa em atenção. */
function Diferenca({ valor }) {
  if (valor === null || valor === undefined) return <span style={{ color: 'var(--text-faint)' }}>—</span>;
  const n = Number(valor);
  return <span style={{ color: n === 0 ? 'var(--text-faint)' : 'var(--warn)', fontWeight: n === 0 ? 400 : 600 }}>{api.formatarQtd(n, true)}</span>;
}

function LinhaSku({ sku: s, podeContar, onContar }) {
  const outros = Number(s.outrosEstoquesSap || 0);
  return (
    <tr>
      <td className="mono">
        {s.sku ? <b>{s.sku}</b> : <span style={{ color: 'var(--text-faint)' }}>Não identificado</span>}
        {s.origemSku && (
          <div style={{ fontSize: 11, color: s.origemSku === 'TABELA_PRECO' ? 'var(--warn)' : 'var(--text-faint)', fontFamily: 'inherit' }}>
            {ROTULO_ORIGEM[s.origemSku] || s.origemSku}
          </div>
        )}
      </td>
      <td style={{ minWidth: 180 }}>
        <div>{s.denominacao || '—'}</div>
        {s.observacao && <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{s.observacao}</div>}
      </td>
      <td className="mono" style={{ textAlign: 'right' }}>{s.temLinhaMb52 ? api.formatarQtd(s.qtdMb52Livre) : '—'}</td>
      <td className="mono" style={{ textAlign: 'right' }}>{s.qtdIq09}</td>
      <td className="mono" style={{ textAlign: 'right' }}>{s.qtdSistema}</td>
      <td className="mono" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div>{api.formatarQtd(s.contagem)}</div>
        {s.qtdContagemManual !== null && s.qtdContagemManual !== undefined && (
          <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'inherit' }}
            title={`${s.contagemJustificativa || ''}${s.contadoPor ? ` — ${s.contadoPor}` : ''}`}>
            manual ({s.qtdBipada} bipado{s.qtdBipada === 1 ? '' : 's'})
          </div>
        )}
        {podeContar && (
          <button type="button" className="btn sm ghost" onClick={onContar} style={{ marginTop: 4 }}>Contar</button>
        )}
      </td>
      <td className="mono" style={{ textAlign: 'right' }}><Diferenca valor={s.diferencaSapSistema} /></td>
      <td className="mono" style={{ textAlign: 'right' }}><Diferenca valor={s.diferencaSapIq09} /></td>
      <td className="mono" style={{ textAlign: 'right' }}><Diferenca valor={s.diferencaContagem} /></td>
      <td className="mono" style={{ textAlign: 'right', fontSize: 12 }}
        title={`Qualidade ${api.formatarQtd(s.qtdMb52Qualidade)} · Bloqueado ${api.formatarQtd(s.qtdMb52Bloqueado)} · Trânsito ${api.formatarQtd(s.qtdMb52Transito)}`}>
        {outros ? api.formatarQtd(outros) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
      </td>
      <td className="mono" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{api.formatarMoeda(s.valorDiferencaEstimado)}</td>
      <td><BadgeResultado rotulo={api.rotuloResultadoSku(s.resultado)} cor={api.corResultadoSku(s.resultado)} /></td>
    </tr>
  );
}

/** Contagem manual do SKU (acessório com quantidade: a bipagem do serial conta 1). */
function EditorContagem({ sku, onSalvar, onCancelar }) {
  const [quantidade, setQuantidade] = useState(sku.qtdContagemManual ?? '');
  const [justificativa, setJustificativa] = useState(sku.contagemJustificativa || '');
  const [salvando, setSalvando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSalvar(sku, quantidade === '' ? null : Number(String(quantidade).replace(',', '.')), justificativa.trim());
    setSalvando(false);
  };

  const remover = async () => {
    setSalvando(true);
    await onSalvar(sku, null, '');
    setSalvando(false);
  };

  return (
    <form onSubmit={enviar} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: '6px 0' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>
        Quantidade contada de {sku.sku}
        <input type="number" min="0" step="any" required value={quantidade} autoFocus
          onChange={(e) => setQuantidade(e.target.value)} style={{ width: 140, height: 34 }} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, flex: '1 1 260px' }}>
        Justificativa
        <input type="text" required maxLength={300} value={justificativa} placeholder="Ex.: contado na prateleira e no estoque"
          onChange={(e) => setJustificativa(e.target.value)} style={{ height: 34 }} />
      </label>
      <button type="submit" className="btn sm solid" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar contagem'}</button>
      {sku.qtdContagemManual !== null && sku.qtdContagemManual !== undefined && (
        <button type="button" className="btn sm ghost" disabled={salvando} onClick={remover}>Remover contagem manual</button>
      )}
      <button type="button" className="btn sm ghost" onClick={onCancelar}>Cancelar</button>
      <span style={{ fontSize: 11.5, color: 'var(--text-faint)', flexBasis: '100%' }}>
        Vale no lugar das bipagens deste SKU ({sku.qtdBipada} bipado{sku.qtdBipada === 1 ? '' : 's'}). Não altera a bipagem por serial.
      </span>
    </form>
  );
}
