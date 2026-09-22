import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  UserCheck,
  FileEdit,
  Printer,
  FileText,
  XCircle
} from 'lucide-react';

export default function ModuloVendas() {
  const navigate = useNavigate();
  const [vendaAberta, setVendaAberta] = useState(true);
  const [clienteAberto, setClienteAberto] = useState(false);
  const [ultimasVendas, setUltimasVendas] = useState([]);

  useEffect(() => {
    const vendasSalvas = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
    if (vendasSalvas.length > 0) {
      setUltimasVendas(vendasSalvas.slice(0, 5));
    } else {
      setUltimasVendas([
        {
          id: '000499',
          data: '22/09/2026 16:35',
          filial: '0142 - LOJA SHOPPING CENTRO',
          vendedor: 'MARINA FERREIRA',
          cliente: 'JOÃO PEDRO MARTINS',
          nf: '—'
        }
      ]);
    }
  }, []);

  // Redireciona para a tela de venda com o objeto carregado
  const handleAbrirVendaRegistrada = (venda) => {
    sessionStorage.setItem('syscor_venda_edicao', JSON.stringify(venda));
    navigate('/venda/lancar', {
      state: {
        vendaId: venda.id || venda.numeroVenda,
        clienteNome: venda.cliente,
        vendedorNome: venda.vendedor,
        vendaCarregada: venda,
        modoEdicao: true
      }
    });
  };

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
      {/* 2. CARD: VENDA                                            */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            
            {/* 3 Botões de Ação */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16
            }}>
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
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'var(--line)'; 
                  e.currentTarget.style.transform = 'translateY(0)';
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
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'var(--line)'; 
                  e.currentTarget.style.transform = 'translateY(0)';
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
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = 'var(--line)'; 
                  e.currentTarget.style.transform = 'translateY(0)';
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

            {/* Listagem Rápida com o Botão Azul de Edição */}
            <div style={{
              overflowX: 'auto',
              borderRadius: 8,
              border: '1px solid var(--line)',
              background: 'var(--panel)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{
                    background: 'var(--panel-2)',
                    borderBottom: '1px solid var(--line)',
                    color: 'var(--text-faint)',
                    textTransform: 'uppercase',
                    fontSize: 11
                  }}>
                    <th style={{ padding: '10px 14px' }}>Nº</th>
                    <th style={{ padding: '10px 14px', color: 'var(--good, #22c55e)' }}>Data</th>
                    <th style={{ padding: '10px 14px' }}>Vendedor</th>
                    <th style={{ padding: '10px 14px' }}>Cliente</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasVendas.map((venda, idx) => (
                    <tr
                      key={venda.id || idx}
                      style={{
                        borderBottom: '1px solid var(--line)',
                        color: 'var(--text)'
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{venda.id || venda.numeroVenda}</td>
                      <td style={{ padding: '10px 14px' }}>{venda.data || '22/09/2026 16:35'}</td>
                      <td style={{ padding: '10px 14px', textTransform: 'uppercase' }}>{venda.vendedor || 'MARINA FERREIRA'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, textTransform: 'uppercase' }}>{venda.cliente}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {/* Botão Azul FileEdit */}
                        <button
                          type="button"
                          onClick={() => handleAbrirVendaRegistrada(venda)}
                          title="Abrir Venda Registrada"
                          style={{
                            background: 'transparent',
                            border: '1px solid #38bdf8',
                            borderRadius: 6,
                            color: '#38bdf8',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <FileEdit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}