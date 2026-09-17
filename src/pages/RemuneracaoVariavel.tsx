import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  UploadCloud, 
  Search, 
  RotateCcw 
} from 'lucide-react';
import { documentalDemo, consolidadoVivoDemo } from '../data/demoData';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export default function RemuneracaoVariavel() {
  const [arquivoCarregado, setArquivoCarregado] = useState(false);
  const [processandoIa, setProcessandoIa] = useState(false);
  const [dadosConsolidado, setDadosConsolidado] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [abaFiltro, setAbaFiltro] = useState('TODOS');

  const handleUploadArquivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessandoIa(true);
    setTimeout(() => {
      setDadosConsolidado(consolidadoVivoDemo);
      setArquivoCarregado(true);
      setProcessandoIa(false);
    }, 900);
  };

  const handleUsarDemoConsolidado = () => {
    setProcessandoIa(true);
    setTimeout(() => {
      setDadosConsolidado(consolidadoVivoDemo);
      setArquivoCarregado(true);
      setProcessandoIa(false);
    }, 600);
  };

  const resultadoAuditoria = useMemo(() => {
    if (!dadosConsolidado.length) {
      return { liberados: [], glosadosGed: [], pendentesVivo: [] };
    }

    const baseGed = (documentalDemo || []).map((d) => ({
      vinculo: d.vinc || '',
      tipo: d.tipo || '',
      nomeArquivo: d.nome || '',
      statusGed: 'APROVADO'
    }));

    const liberados = [];
    const glosadosGed = [];
    const pendentesVivo = [];

    dadosConsolidado.forEach((itemVivo) => {
      const temDocumentoValido = baseGed.some((g) => 
        g.vinculo.toLowerCase().includes((itemVivo.cliente || '').toLowerCase()) || 
        (itemVivo.acesso && g.vinculo.includes(itemVivo.acesso)) ||
        g.nomeArquivo.toLowerCase().includes((itemVivo.cliente || '').split(' ')[0].toLowerCase())
      );

      if (temDocumentoValido) {
        liberados.push({
          id: itemVivo.idTransacao,
          acesso: itemVivo.acesso,
          cliente: itemVivo.cliente,
          cpf: itemVivo.cpf,
          plano: itemVivo.plano,
          comissao: itemVivo.valorComissao,
          status: 'LIBERADO',
          diagnosticoIa: 'Contrato GED auditado e elegível para comissão integral (100% Match)'
        });
      } else {
        glosadosGed.push({
          id: itemVivo.idTransacao,
          acesso: itemVivo.acesso,
          cliente: itemVivo.cliente,
          cpf: itemVivo.cpf,
          plano: itemVivo.plano,
          comissao: itemVivo.valorComissao,
          status: 'GLOSADO_GED',
          diagnosticoIa: 'Glosado/Bloqueado: Termo de adesão ou documento obrigatório não encontrado no GED'
        });
      }
    });

    baseGed.forEach((ged) => {
      const constaNoConsolidado = dadosConsolidado.some((v) => 
        ged.vinculo.toLowerCase().includes((v.cliente || '').toLowerCase()) || 
        (v.acesso && ged.vinculo.includes(v.acesso))
      );

      if (!constaNoConsolidado && ged.vinculo) {
        pendentesVivo.push({
          id: 'PROD-LOCAL',
          acesso: '—',
          cliente: ged.vinculo,
          cpf: '—',
          plano: 'Serviço Vivo Padrão',
          comissao: 59.90,
          status: 'PENDENTE_VIVO',
          diagnosticoIa: 'Documento assinado no GED, mas não consta remunerado no consolidado Vivo'
        });
      }
    });

    return { liberados, glosadosGed, pendentesVivo };
  }, [dadosConsolidado]);

  const totalLiberado = useMemo(() => {
    return resultadoAuditoria.liberados.reduce((acc, i) => acc + i.comissao, 0);
  }, [resultadoAuditoria]);

  const totalGlosado = useMemo(() => {
    return resultadoAuditoria.glosadosGed.reduce((acc, i) => acc + i.comissao, 0);
  }, [resultadoAuditoria]);

  const totalPendente = useMemo(() => {
    return resultadoAuditoria.pendentesVivo.reduce((acc, i) => acc + i.comissao, 0);
  }, [resultadoAuditoria]);

  const listaFiltrada = useMemo(() => {
    let unificados = [];
    if (abaFiltro === 'TODOS') {
      unificados = [
        ...resultadoAuditoria.liberados,
        ...resultadoAuditoria.glosadosGed,
        ...resultadoAuditoria.pendentesVivo
      ];
    } else if (abaFiltro === 'LIBERADOS') {
      unificados = resultadoAuditoria.liberados;
    } else if (abaFiltro === 'GLOSADOS') {
      unificados = resultadoAuditoria.glosadosGed;
    } else if (abaFiltro === 'PENDENTES_VIVO') {
      unificados = resultadoAuditoria.pendentesVivo;
    }

    if (!termoBusca.trim()) return unificados;
    const t = termoBusca.toLowerCase();
    return unificados.filter(
      (item) =>
        item.cliente.toLowerCase().includes(t) ||
        item.acesso.includes(t) ||
        item.plano.toLowerCase().includes(t)
    );
  }, [resultadoAuditoria, abaFiltro, termoBusca]);

  const totalGeral = resultadoAuditoria.liberados.length + resultadoAuditoria.glosadosGed.length + resultadoAuditoria.pendentesVivo.length;

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Remuneração Variável & Auditoria GED</h1>
          <div className="sub">Cruzamento automatizado com o Consolidado de Remuneração da Vivo</div>
        </div>

        {arquivoCarregado && (
          <div className="topbar-actions">
            <button 
              type="button" 
              className="btn sm" 
              onClick={() => { setArquivoCarregado(false); setDadosConsolidado([]); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={14} /> Novo Cruzamento
            </button>
          </div>
        )}
      </div>

      {!arquivoCarregado && (
        <div className="panel" style={{ padding: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: 16, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <UploadCloud size={36} />
          </div>
          
          <h3 style={{ margin: 0, fontSize: 18 }}>Importar Consolidado de Vendas / Remuneração Vivo</h3>
          <p style={{ maxWidth: 540, margin: 0, color: 'var(--text-faint)', fontSize: 13.5 }}>
            Faça o upload da planilha oficial de produção ou extrato de comissões Vivo em <code>.CSV</code> ou <code>.XLSX</code> para cruzar os acessos com os contratos do <b>Gestão Documental (GED)</b>.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <label className="btn solid" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FileSpreadsheet size={16} />
              {processandoIa ? 'Auditando com I.A...' : 'Selecionar Consolidado Vivo'}
              <input type="file" accept=".csv,.xlsx,.txt" style={{ display: 'none' }} onChange={handleUploadArquivo} />
            </label>

            <button type="button" className="btn ghost" onClick={handleUsarDemoConsolidado} disabled={processandoIa}>
              Carregar Base Vivo Demo
            </button>
          </div>
        </div>
      )}

      {arquivoCarregado && (
        <>
          <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            
            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Comissão Liberada (100% GED)</div>
                <CheckCircle2 size={16} color="var(--good)" />
              </div>
              <div className="val mono" style={{ color: 'var(--good)' }}>{formatadorMoeda.format(totalLiberado)}</div>
              <div className="delta up">{resultadoAuditoria.liberados.length} contratos auditados</div>
            </div>

            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Comissão Glosada (Falta GED)</div>
                <XCircle size={16} color="var(--bad)" />
              </div>
              <div className="val mono" style={{ color: 'var(--bad)' }}>{formatadorMoeda.format(totalGlosado)}</div>
              <div className="delta down">{resultadoAuditoria.glosadosGed.length} pendências documentais</div>
            </div>

            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Pendente Vivo (A Cobrar)</div>
                <AlertTriangle size={16} color="var(--warn)" />
              </div>
              <div className="val mono" style={{ color: 'var(--warn)' }}>{formatadorMoeda.format(totalPendente)}</div>
              <div className="delta down">{resultadoAuditoria.pendentesVivo.length} no GED, não pagos</div>
            </div>

            <div className="kpi">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="lbl">Taxa de Conformidade GED</div>
                <Sparkles size={16} color="var(--accent)" />
              </div>
              <div className="val mono">
                {(
                  (resultadoAuditoria.liberados.length /
                    Math.max(1, resultadoAuditoria.liberados.length + resultadoAuditoria.glosadosGed.length)) *
                  100
                ).toFixed(1)}%
              </div>
              <div className="delta up">Auditoria documental</div>
            </div>

          </div>

          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            
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
                  className={`btn sm ${abaFiltro === 'LIBERADOS' ? 'solid' : 'ghost'}`}
                  onClick={() => setAbaFiltro('LIBERADOS')}
                  style={{ color: abaFiltro === 'LIBERADOS' ? '#fff' : 'var(--good)' }}
                >
                  Liberados ({resultadoAuditoria.liberados.length})
                </button>
                <button
                  type="button"
                  className={`btn sm ${abaFiltro === 'GLOSADOS' ? 'solid' : 'ghost'}`}
                  onClick={() => setAbaFiltro('GLOSADOS')}
                  style={{ color: abaFiltro === 'GLOSADOS' ? '#fff' : 'var(--bad)' }}
                >
                  Glosados por GED ({resultadoAuditoria.glosadosGed.length})
                </button>
                <button
                  type="button"
                  className={`btn sm ${abaFiltro === 'PENDENTES_VIVO' ? 'solid' : 'ghost'}`}
                  onClick={() => setAbaFiltro('PENDENTES_VIVO')}
                  style={{ color: abaFiltro === 'PENDENTES_VIVO' ? '#fff' : 'var(--warn)' }}
                >
                  Pendente Vivo ({resultadoAuditoria.pendentesVivo.length})
                </button>
              </div>

              <div style={{ position: 'relative', width: 260 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Filtrar por linha, cliente ou plano..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  style={{ paddingLeft: 32, height: 34, fontSize: 12.5 }}
                />
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Status Auditoria</th>
                    <th>Nº Acesso / Linha</th>
                    <th>Cliente / Titular</th>
                    <th>Plano Contratado</th>
                    <th style={{ textAlign: 'right' }}>Comissão</th>
                    <th>Diagnóstico I.A</th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-faint)' }}>
                        Nenhum registro encontrado no filtro selecionado.
                      </td>
                    </tr>
                  ) : (
                    listaFiltrada.map((item, idx) => (
                      <tr key={item.id + idx}>
                        <td>
                          {item.status === 'LIBERADO' && (
                            <span className="badge good" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} /> Liberado
                            </span>
                          )}
                          {item.status === 'GLOSADO_GED' && (
                            <span className="badge bad" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <XCircle size={12} /> Glosa GED
                            </span>
                          )}
                          {item.status === 'PENDENTE_VIVO' && (
                            <span className="badge warn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={12} /> Pendente Vivo
                            </span>
                          )}
                        </td>
                        <td className="mono"><b>{item.acesso}</b></td>
                        <td>
                          <b>{item.cliente}</b>
                          {item.cpf && item.cpf !== '—' && (
                            <small style={{ color: 'var(--text-faint)', display: 'block', fontSize: 11 }}>
                              CPF: {item.cpf}
                            </small>
                          )}
                        </td>
                        <td>{item.plano}</td>
                        <td style={{ textAlign: 'right' }} className="mono">
                          <b>{formatadorMoeda.format(item.comissao)}</b>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                          {item.diagnosticoIa}
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