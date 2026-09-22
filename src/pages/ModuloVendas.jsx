import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  UserCheck 
} from 'lucide-react';

export default function ModuloVendas() {
  const navigate = useNavigate();
  const [vendaAberta, setVendaAberta] = useState(true);
  const [clienteAberto, setClienteAberto] = useState(false);

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxSizing: 'border-box',
      color: 'var(--text)'
    }}>

      {/* ========================================================= */}
      {/* 1. CARD: CLIENTE / LEAD                                   */}
      {/* ========================================================= */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '18px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: clienteAberto ? 18 : 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'background 0.2s ease, border-color 0.2s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: 'var(--accent, #c026d3)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Cliente / Lead
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 12px', color: 'var(--text-faint)', fontSize: 13 }}>
              Inclusão e alteração das informações dos clientes e leads.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setClienteAberto(!clienteAberto)}
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              color: 'var(--text)',
              padding: '6px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <span>Avaliar</span>
            {clienteAberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {clienteAberto && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 200px))',
            gap: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--line)'
          }}>
            <button
              type="button"
              onClick={() => navigate('/clientes')}
              style={{
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                color: 'var(--text)',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(192, 38, 211, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}>
                <UserCheck size={22} />
              </div>
              <b style={{ fontSize: 13.5, color: 'var(--text)' }}>Gerenciar Clientes</b>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. CARD: VENDA (SOMENTE OS 3 BOTÕES DE AÇÃO)               */}
      {/* ========================================================= */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '18px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: vendaAberta ? 20 : 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'background 0.2s ease, border-color 0.2s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: 'var(--accent, #c026d3)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Venda
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 12px', color: 'var(--text-faint)', fontSize: 13 }}>
              Venda de produtos e serviços.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setVendaAberta(!vendaAberta)}
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              color: 'var(--text)',
              padding: '6px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <span>Avaliar</span>
            {vendaAberta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {vendaAberta && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--line)'
          }}>
            {/* Botão 1: Inserir Registro */}
            <button
              type="button"
              onClick={() => navigate('/venda/lancar')}
              style={{
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '30px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                color: 'var(--text)',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = 'var(--accent)'; 
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = 'var(--line)'; 
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(192, 38, 211, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}>
                <Plus size={24} />
              </div>
              <b style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Inserir Registro</b>
            </button>

            {/* Botão 2: Buscar Registro */}
            <button
              type="button"
              onClick={() => navigate('/venda/busca')}
              style={{
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '30px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                color: 'var(--text)',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = 'var(--accent)'; 
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = 'var(--line)'; 
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(192, 38, 211, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}>
                <Search size={22} />
              </div>
              <b style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Buscar Registro</b>
            </button>

            {/* Botão 3: Ver Vendas de Hoje */}
            <button
              type="button"
              onClick={() => navigate('/venda/hoje')}
              style={{
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '30px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                color: 'var(--text)',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = 'var(--accent)'; 
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = 'var(--line)'; 
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(192, 38, 211, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}>
                <Eye size={22} />
              </div>
              <b style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Ver Vendas de Hoje</b>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}