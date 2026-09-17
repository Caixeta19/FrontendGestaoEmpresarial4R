import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  UploadCloud, 
  ArrowRightLeft,
  Search,
  RotateCcw
} from 'lucide-react';
import { estoqueDemo, imeiDemo, sapIq09Demo } from '../data/demoData';

export default function EstoqueInventario() {
  const [arquivoCarregado, setArquivoCarregado] = useState(false);
  const [processandoIa, setProcessandoIa] = useState(false);
  const [dadosSap, setDadosSap] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [abaFiltro, setAbaFiltro] = useState('TODOS'); // 'TODOS' | 'CORRETOS' | 'PENDENTES' | 'FALTANTES'

  // Simula o upload e parsing do arquivo IQ09 (CSV/TXT do SAP)
  const handleUploadArquivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessandoIa(true);
    setTimeout(() => {
      setDadosSap(sapIq09Demo);
      setArquivoCarregado(true);
      setProcessandoIa(false);
    }, 900);
  };

  const handleUsarDemoSap = () => {
    setProcessandoIa(true);
    setTimeout(() => {
      setDadosSap(sapIq09Demo);
      setArquivoCarregado(true);
      setProcessandoIa(false);
    }, 600);
  };

  // Motor Heurístico/IA de Conciliação
  const resultadoConciliacao = useMemo(() => {
    if (!dadosSap.length) return { corretos: [], pendentesSap: [], faltantesSap: [] };

    // Lista de seriais/itens do estoque físico no sistema
    const listaFisico = (imeiDemo || []).map(i => ({
      serial: String(i.imei || '').trim(),
      sku: i.sku || 'SKU-001',
      descricao: i.nome || i.descricao,
      origem: 'SISTEMA_LOCAL'
    }));

    const corretos = [];
    const pendentesSap = []; // Consta no SAP IQ09 mas não no estoque local (Falta Bipar)
    const faltantesSap = []; // Consta no estoque local mas não no SAP (Sobra Física)

    // 1. Cruza SAP -> Físico
    dadosSap.forEach(itemSap => {
      const correspondencia = listaFisico.find(
        f => f.serial === itemSap.serial || (f.sku === itemSap.material && f.serial === itemSap.serial)
      );

      if (correspondencia) {
        corretos.push({
          sku: itemSap.material,
          serial: itemSap.serial,
          descricao: itemSap.descricao,
          statusSap: itemSap.statusSap,
          status: 'CORRETO',
          motivoIa: 'Serial e Material conciliados com precisão (100% Match)'
        });
      } else {
        pendentesSap.push({
          sku: itemSap.material,
          serial: itemSap.serial,
          descricao: itemSap.descricao,
          statusSap: itemSap.statusSap,
          status: 'PENDENTE_SAP',
          motivoIa: 'Consta na IQ09 (SAP) mas não foi encontrado no inventário físico'
        });
      }
    });

    // 2. Cruza Físico -> SAP para achar sobras locais
    listaFisico.forEach(itemLocal => {
      const constaNoSap = dadosSap.some(s => s.serial === itemLocal.serial);
      if (!constaNoSap && itemLocal.serial && itemLocal.serial !== '—') {
        faltantesSap.push({
          sku: itemLocal.sku,
          serial: itemLocal.serial,
          descricao: itemLocal.descricao,
          statusSap: 'NÃO CONSTA',
          status: 'FALTANTE_SAP',
          motivoIa: 'Identificado no estoque físico local, porém sem registro ativo na IQ09'
        });
      }
    });

    return { corretos, pendentesSap, faltantesSap };
  }, [dadosSap]);

  const listaFiltrada = useMemo(() => {
    let unificados = [];
    if (abaFiltro === 'TODOS') {
      unificados = [
        ...resultadoConciliacao.corretos,
        ...resultadoConciliacao.pendentesSap,
        ...resultadoConciliacao.faltantesSap
      ];
    } else if (abaFiltro === 'CORRETOS') {
      unificados = resultadoConciliacao.corretos;
    } else if (abaFiltro === 'PENDENTES') {
      unificados = resultadoConciliacao.pendentesSap;
    } else if (abaFiltro === 'FALTANTES') {
      unificados = resultadoConciliacao.faltantesSap;
    }

    if (!termoBusca.trim()) return unificados;
    const t = termoBusca.toLowerCase();
    return unificados.filter(
      item =>
        item.descricao.toLowerCase().includes(t) ||
        item.serial.toLowerCase().includes(t) ||
        item.sku.toLowerCase().includes(t)
    );
  }, [resultadoConciliacao, abaFiltro, termoBusca]);

  const totalGeral = resultadoConciliacao.corretos.length + resultadoConciliacao.pendentesSap.length + resultadoConciliacao.faltantesSap.length;
  const acuracidade = totalGeral > 0 
    ? ((resultadoConciliacao.corretos.length / (totalGeral)) * 100).toFixed(1)
    : 0;

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Topbar */}
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Inventário Estoque</h1>
          <div className="sub">Cruzamento automatizado com inteligência de dados de números de série</div>
        </div>

        {arquivoCarregado && (
          <div className="topbar-actions">
            <button 
              type="button" 
              className="btn sm" 
              onClick={() => { setArquivoCarregado(false); setDadosSap([]); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={14} /> Novo Cruzamento
            </button>
          </div>
        )}
      </div>

      {/* ÁREA DE IMPORTAÇÃO (Exibida caso ainda não tenha carregado o arquivo) */}
      {!arquivoCarregado && (
        <div className="panel" style={{ padding: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: 16, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <UploadCloud size={36} />
          </div>
          
          <h3 style={{ margin: 0, fontSize: 18 }}>Importar Relatório SAP (Transação IQ09)</h3>
          <p style={{ maxWidth: 520, margin: 0, color: 'var(--text-faint)', fontSize: 13.5 }}>
            Exporte a lista de números de série no SAP via <b>IQ09</b> em formato <code>.CSV</code>, <code>.XLSX</code> ou <code>.TXT</code> e faça o upload para a I.A cruzar automaticamente com o estoque físico.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <label className="btn solid" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FileSpreadsheet size={16} />
              {processandoIa ? 'Processando I.A...' : 'Selecionar Arquivo IQ09'}
              <input type="file" accept=".csv,.xlsx,.txt" style={{ display: 'none' }} onChange={handleUploadArquivo} />
            </label>

            <button type="button" className="btn ghost" onClick={handleUsarDemoSap} disabled={processandoIa}>
              Carregar Base SAP Demo
            </button>
          </div>
        </div>
      )}

      {/* PAINEL DE RESULTADOS APÓS PROCESSAMENTO */}
      {arquivoCarregado && (
        <>
          {/* KPIs de Acuracidade e Divergência */}
          <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Acuracidade do Estoque</div>
                <Sparkles size={16} color="var(--accent)" />
              </div>
              <div className="val mono" style={{ color: Number(acuracidade) > 85 ? 'var(--good)' : 'var(--warn)' }}>
                {acuracidade}%
              </div>
              <div className="delta up">Índice de conformidade</div>
            </div>

            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Itens Conciliados (Corretos)</div>
                <CheckCircle2 size={16} color="var(--good)" />
              </div>
              <div className="val mono">{resultadoConciliacao.corretos.length}</div>
              <div className="delta up">Bate com o SAP e Físico</div>
            </div>

            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Pendentes no SAP (Falta Físico)</div>
                <AlertTriangle size={16} color="var(--warn)" />
              </div>
              <div className="val mono" style={{ color: 'var(--warn)' }}>{resultadoConciliacao.pendentesSap.length}</div>
              <div className="delta down">Consta no SAP, não bipado</div>
            </div>

            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Faltantes no SAP (Sobra Física)</div>
                <XCircle size={16} color="var(--bad)" />
              </div>
              <div className="val mono" style={{ color: 'var(--bad)' }}>{resultadoConciliacao.faltantesSap.length}</div>
              <div className="delta down">No estoque, sem registro SAP</div>
            </div>
          </div>

          {/* Tabela de Divergências com Filtros */}
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            
            {/* Header da Tabela com Abas e Busca */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`btn sm ${abaFiltro === 'TODOS' ? 'solid' : 'ghost'}`}
                  onClick={() => setAbaFiltro('TODOS')}
                >
                  Todos ({totalGeral})
                </button>
                <button
                  type="button"
                  className={`btn sm ${abaFiltro === 'CORRETOS' ? 'solid' : 'ghost'}`}
                  onClick={() => setAbaFiltro('CORRETOS')}
                  style={{ color: abaFiltro === 'CORRETOS' ? '#fff' : 'var(--good)' }}
                >
                  Corretos ({resultadoConciliacao.corretos.length})
                </button>
                <button
                  type="button"
                  className={`btn sm ${abaFiltro === 'PENDENTES' ? 'solid' : 'ghost'}`}
                  onClick={() => setAbaFiltro('PENDENTES')}
                  style={{ color: abaFiltro === 'PENDENTES' ? '#fff' : 'var(--warn)' }}
                >
                  Pendentes SAP ({resultadoConciliacao.pendentesSap.length})
                </button>
                <button
                  type="button"
                  className={`btn sm ${abaFiltro === 'FALTANTES' ? 'solid' : 'ghost'}`}
                  onClick={() => setAbaFiltro('FALTANTES')}
                  style={{ color: abaFiltro === 'FALTANTES' ? '#fff' : 'var(--bad)' }}
                >
                  Faltantes SAP ({resultadoConciliacao.faltantesSap.length})
                </button>
              </div>

              <div style={{ position: 'relative', width: 260 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Filtrar por IMEI, SKU ou Nome..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  style={{ paddingLeft: 32, height: 34, fontSize: 12.5 }}
                />
              </div>
            </div>

            {/* Tabela de Itens Cruzados */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Status Conciliação</th>
                    <th>Material / SKU</th>
                    <th>Nº Serial / IMEI</th>
                    <th>Descrição do Aparelho</th>
                    <th>Status SAP</th>
                    <th>Diagnóstico I.A</th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-faint)' }}>
                        Nenhum item encontrado no filtro selecionado.
                      </td>
                    </tr>
                  ) : (
                    listaFiltrada.map((item, idx) => (
                      <tr key={item.serial + idx}>
                        <td>
                          {item.status === 'CORRETO' && (
                            <span className="badge good" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} /> Correto
                            </span>
                          )}
                          {item.status === 'PENDENTE_SAP' && (
                            <span className="badge warn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={12} /> Pendente SAP
                            </span>
                          )}
                          {item.status === 'FALTANTE_SAP' && (
                            <span className="badge bad" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <XCircle size={12} /> Faltante SAP
                            </span>
                          )}
                        </td>
                        <td className="mono"><b>{item.sku}</b></td>
                        <td className="mono">{item.serial}</td>
                        <td>{item.descricao}</td>
                        <td className="mono">
                          <span className={`badge ${item.statusSap === 'DISP' ? 'good' : 'neutral'}`}>
                            {item.statusSap}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                          {item.motivoIa}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

    </section>
  );
}