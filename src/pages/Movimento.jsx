import React, { useState } from 'react';
import { 
  BarChart3, 
  ChevronDown, 
  ArrowLeft, 
  FileSpreadsheet, 
  FileText 
} from 'lucide-react';
import TelaFormasPagamento from '../components/movimento/TelaFormasPagamento.jsx';

export default function Movimento() {
  const [telaAtiva, setTelaAtiva] = useState('lista');

  // Estados dos Filtros do Relatório de Movimento de Caixa
  const [caixaFilial, setCaixaFilial] = useState('Todas');
  const [caixaDoCaixa, setCaixaDoCaixa] = useState('Todos');
  const [caixaMovimentos, setCaixaMovimentos] = useState('Todos');
  const [caixaModo, setCaixaModo] = useState('Sintético');
  const [caixaDataInicio, setCaixaDataInicio] = useState('2026-10-06');
  const [caixaDataFim, setCaixaDataFim] = useState('2026-10-06');

  // ----------------------------------------------------
  // TELA 1: LISTAGEM DE CARTÕES DE RELATÓRIOS
  // ----------------------------------------------------
  if (telaAtiva === 'lista') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
        
        {/* Cartão 1: Forma de Pagamento */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 4, width: 5, height: 14, borderRadius: 2, background: '#a855f7' }} />
            <h3 style={{ margin: 0 }}>
              Forma de Pagamento
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
              Relatório das movimentações por forma de pagamento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTelaAtiva('forma-pagamento')}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              outline: 'none'
            }}
          >
            <span>Avaliar</span>
            <ChevronDown size={14} color="var(--text-faint)" />
          </button>
        </div>

        {/* Cartão 2: Movimento Caixa */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 4, width: 5, height: 14, borderRadius: 2, background: '#a855f7' }} />
            <h3 style={{ margin: 0 }}>
              Movimento Caixa
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
              Visualizar o relatório da movimentação de caixa da revenda ou das filiais.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTelaAtiva('movimento-caixa')}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              outline: 'none'
            }}
          >
            <span>Avaliar</span>
            <ChevronDown size={14} color="var(--text-faint)" />
          </button>
        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // TELA 2: TELA CHEIA - RELATÓRIO DE FORMAS DE PAGAMENTO
  // ----------------------------------------------------
  if (telaAtiva === 'forma-pagamento') {
    return <TelaFormasPagamento onVoltar={() => setTelaAtiva('lista')} />;
  }

  // ----------------------------------------------------
  // TELA 3: TELA CHEIA - RELATÓRIO DE MOVIMENTO DE CAIXA
  // ----------------------------------------------------
  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', color: 'var(--text)' }}>
      
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setTelaAtiva('lista')}
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <ArrowLeft size={14} /> Voltar aos Relatórios
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={24} color="#c084fc" />
        </div>
        <div>
          <h1 style={{ margin: 0 }}>
            Relatório de Movimento de Caixa
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '2px 0 0 0' }}>
            Entradas e retiradas dos caixas, por PDV e por dia.
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, width: '100%', boxSizing: 'border-box' }}>
        
        <div>
          <div className="section-label" style={{ marginBottom: 14 }}>
            Filtros Principais
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Filial:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaFilial}
                  onChange={(e) => setCaixaFilial(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todas">Todas</option>
                  <option value="Matriz">Matriz</option>
                  <option value="Filial 1">Filial 1</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Caixa da Filial:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaDoCaixa}
                  onChange={(e) => setCaixaDoCaixa(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Caixa Principal">Caixa Principal</option>
                  <option value="PDV 1">PDV 1</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Movimentos:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaMovimentos}
                  onChange={(e) => setCaixaMovimentos(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Entradas">Entradas</option>
                  <option value="Retiradas">Retiradas</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Período:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="date"
                  value={caixaDataInicio}
                  onChange={(e) => setCaixaDataInicio(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>até</span>
                <input
                  type="date"
                  value={caixaDataFim}
                  onChange={(e) => setCaixaDataFim(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Modo:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaModo}
                  onChange={(e) => setCaixaModo(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Sintético">Sintético</option>
                  <option value="Analítico">Analítico</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => alert('A exportar dados para CSV...')}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FileSpreadsheet size={16} color="#c084fc" /> Exportar CSV
          </button>

          <button
            type="button"
            onClick={() => alert('A gerar relatório de movimento de caixa...')}
            style={{
              background: '#9333ea',
              border: 'none',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)'
            }}
          >
            <FileText size={16} color="#ffffff" /> Gerar relatório
          </button>
        </div>

      </div>
    </div>
  );
}