import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  Radio 
} from 'lucide-react';

export default function Dashboard() {
  const [dados, setDados] = useState({
    faturamentoMesAtual: 87954.90,
    metaOperacao: 85000.00,
    percentualAtingimentoMeta: 103.4,
    volumeVendasTransacoes: 188,
    ticketMedio: 467.85,
    skusCriticosOuRuptura: 10,
    evolucaoVendas: [
      { mesRotulo: 'Mar', valor: 48000, valorFormatadoK: '48k' },
      { mesRotulo: 'Abr', valor: 53000, valorFormatadoK: '53k' },
      { mesRotulo: 'Mai', valor: 44000, valorFormatadoK: '44k' },
      { mesRotulo: 'Jun', valor: 61000, valorFormatadoK: '61k' },
      { mesRotulo: 'Jul', valor: 58000, valorFormatadoK: '58k' },
      { mesRotulo: 'Ago', valor: 88000, valorFormatadoK: '88k' }
    ],
    atividadesRecentes: [
      { numeroPedido: '#000487', status: 'finalizada', clienteNome: 'Ana Beatriz Souza', vendedorNome: 'Rafael Lima', valorTotal: 1899.00, dataHora: '16:03' },
      { numeroPedido: '#000486', status: 'finalizada', clienteNome: 'Ana Beatriz Souza', vendedorNome: 'Lucas Andrade', valorTotal: 1899.00, dataHora: '16:01' },
      { numeroPedido: '#000485', status: 'finalizada', clienteNome: 'Carlos Eduardo Lima', vendedorNome: 'Marina Ferreira', valorTotal: 3299.00, dataHora: '15:58' }
    ]
  });

  const [regional, setRegional] = useState('TODAS');
  const [filial, setFilial] = useState('TODAS');
  const [periodo, setPeriodo] = useState('MES_ATUAL');
  const [categoria, setCategoria] = useState('TODAS');

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/dashboard/executivo')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setDados(data); })
      .catch(() => console.log('Carregando base demonstrativa executiva.'));
  }, [regional, filial, periodo, categoria]);

  const valorMaximoEvolucao = Math.max(...dados.evolucaoVendas.map(m => m.valor), 90000);

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 30 }}>
      
      {/* Topbar / Cabeçalho */}
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)' }}>
            Painel Geral Executivo
          </h1>
          <div className="sub" style={{ marginTop: 4, color: 'var(--text-faint, #8c85a6)', fontSize: 13 }}>
            Visão consolidada da operação · 8 de setembro de 2026
          </div>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="panel" style={{
        background: 'var(--panel, #181329)',
        border: '1px solid var(--line, #2c2445)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text, #fff)', fontSize: 13, fontWeight: 700 }}>
          <Filter size={15} color="var(--accent, #c026d3)" />
          Filtros do Painel:
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 14
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>Regional:</span>
            <select
              value={regional}
              onChange={e => setRegional(e.target.value)}
              style={{
                height: 38,
                borderRadius: 8,
                background: 'var(--panel-2, #211c38)',
                border: '1px solid var(--line, #382d54)',
                color: 'var(--text, #fff)',
                padding: '0 10px',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="TODAS">Todas as Regionais</option>
              <option value="MT">Regional MT</option>
              <option value="SP">Regional SP</option>
              <option value="RJ">Regional RJ</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>Filial / PDV:</span>
            <select
              value={filial}
              onChange={e => setFilial(e.target.value)}
              style={{
                height: 38,
                borderRadius: 8,
                background: 'var(--panel-2, #211c38)',
                border: '1px solid var(--line, #382d54)',
                color: 'var(--text, #fff)',
                padding: '0 10px',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="TODAS">Todas as Lojas / PDVs</option>
              <option value="0142">0142 — Shopping Centro</option>
              <option value="0198">0198 — Bairro Industrial</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>Período:</span>
            <select
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              style={{
                height: 38,
                borderRadius: 8,
                background: 'var(--panel-2, #211c38)',
                border: '1px solid var(--line, #382d54)',
                color: 'var(--text, #fff)',
                padding: '0 10px',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="MES_ATUAL">Mês Atual</option>
              <option value="ULTIMOS_30">Últimos 30 Dias</option>
              <option value="ANO_ATUAL">Ano Atual</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>Categoria:</span>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              style={{
                height: 38,
                borderRadius: 8,
                background: 'var(--panel-2, #211c38)',
                border: '1px solid var(--line, #382d54)',
                color: 'var(--text, #fff)',
                padding: '0 10px',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="TODAS">Todas as Categorias</option>
              <option value="PRODUTO_VIVO">Produto Vivo</option>
              <option value="SERVICO_VIVO">Serviço Vivo</option>
              <option value="ACESSORIO">Acessório</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de 4 Cards KPIs */}
      <div className="kpi-row" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16
      }}>
        
        {/* Card 1: Faturamento */}
        <div className="kpi" style={{
          background: 'var(--panel, #181329)',
          border: '1px solid var(--line, #2c2445)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lbl" style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>Faturamento (Mês Atual)</span>
            <span style={{ color: 'var(--accent, #c026d3)' }}><DollarSign size={16} /></span>
          </div>
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)', margin: '12px 0 6px 0' }}>
            R$ {dados.faturamentoMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="delta up" style={{ fontSize: 12, color: 'var(--good, #22c55e)', fontWeight: 600 }}>
            Consolidado total
          </div>
        </div>

        {/* Card 2: Meta */}
        <div className="kpi" style={{
          background: 'var(--panel, #181329)',
          border: '1px solid var(--line, #2c2445)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lbl" style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>
              Meta da Operação ({dados.percentualAtingimentoMeta.toFixed(1)}%)
            </span>
            <span style={{ color: 'var(--good, #22c55e)' }}><TrendingUp size={16} /></span>
          </div>
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)', margin: '12px 0 10px 0' }}>
            R$ {dados.metaOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ width: '100%', background: 'var(--panel-2, #211c38)', height: 6, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--good, #22c55e)',
              height: '100%',
              width: `${Math.min(dados.percentualAtingimentoMeta, 100)}%`,
              borderRadius: 4
            }} />
          </div>
        </div>

        {/* Card 3: Volume */}
        <div className="kpi" style={{
          background: 'var(--panel, #181329)',
          border: '1px solid var(--line, #2c2445)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lbl" style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>Volume de Vendas</span>
            <span style={{ color: 'var(--accent, #c026d3)' }}><ShoppingCart size={16} /></span>
          </div>
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)', margin: '12px 0 6px 0' }}>
            {dados.volumeVendasTransacoes} vendas
          </div>
          <div className="delta up" style={{ fontSize: 12, color: 'var(--good, #22c55e)', fontWeight: 600 }}>
            Ticket médio: ~R$ {dados.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 4: Alertas de Estoque */}
        <div className="kpi" style={{
          background: 'var(--panel, #181329)',
          border: '1px solid var(--line, #2c2445)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lbl" style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>Alertas de Estoque</span>
            <span style={{ color: 'var(--bad, #ef4444)' }}><AlertTriangle size={16} /></span>
          </div>
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--bad, #ef4444)', margin: '12px 0 6px 0' }}>
            {dados.skusCriticosOuRuptura} SKUs críticos
          </div>
          <div style={{ fontSize: 12, color: 'var(--bad, #ef4444)', fontWeight: 600, cursor: 'pointer' }}>
            Ver no estoque →
          </div>
        </div>
      </div>

      {/* Grid Inferior: Evolução de Vendas + Atividades Recentes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20
      }}>
        
        {/* Evolução de Vendas */}
        <div className="panel" style={{
          background: 'var(--panel, #181329)',
          border: '1px solid var(--line, #2c2445)',
          borderRadius: 12,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text, #fff)' }}>Evolução de Vendas</h2>
              <span style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)' }}>Filtro: Todas as Categorias</span>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              background: 'var(--panel-2, #211c38)',
              border: '1px solid var(--line, #382d54)',
              color: 'var(--text, #fff)'
            }}>
              Histórico 6M
            </span>
          </div>

          {/* Gráfico de Barras */}
          <div style={{
            height: 220,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
            paddingTop: 20,
            borderBottom: '1px solid var(--line, #2c2445)',
            paddingBottom: 8
          }}>
            {dados.evolucaoVendas.map((item, idx) => {
              const alturaPercent = (item.valor / valorMaximoEvolucao) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>{item.valorFormatadoK}</span>
                  <div
                    style={{
                      width: '100%',
                      height: `${alturaPercent}%`,
                      background: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    title={`R$ ${item.valor.toLocaleString('pt-BR')}`}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>{item.mesRotulo}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="panel" style={{
          background: 'var(--panel, #181329)',
          border: '1px solid var(--line, #2c2445)',
          borderRadius: 12,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text, #fff)' }}>Atividades Recentes</h2>
              <span style={{ fontSize: 12, color: 'var(--text-faint, #8c85a6)' }}>Feed de transações e contratos</span>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid var(--good, #22c55e)',
              color: 'var(--good, #22c55e)'
            }}>
              <Radio size={12} /> Ao vivo
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dados.atividadesRecentes.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--panel-2, #211c38)',
                  border: '1px solid var(--line-soft, #2c2445)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #fff)' }}>
                    Venda {item.numeroPedido} {item.status}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint, #8c85a6)', marginTop: 2 }}>
                    {item.clienteNome} · {item.vendedorNome}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #fff)' }}>
                    R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint, #8c85a6)', marginTop: 2 }}>
                    {item.dataHora}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}