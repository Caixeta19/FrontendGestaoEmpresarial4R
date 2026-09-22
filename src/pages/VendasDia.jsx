import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  FileEdit, 
  Printer, 
  FileText, 
  XCircle 
} from 'lucide-react';

export default function VendasDia() {
  const navigate = useNavigate();
  const [dataHoje, setDataHoje] = useState('');
  const [vendas, setVendas] = useState([]);

  // Carrega e formata a data atual e as vendas salvas
  const carregarVendas = () => {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');
    setDataHoje(dataFormatada);

    const vendasSalvas = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
    
    if (vendasSalvas.length > 0) {
      setVendas(vendasSalvas);
    } else {
      // Dados de demonstração padrão
      setVendas([
        {
          id: '000499',
          data: `${dataFormatada} 16:35`,
          filial: '0142 - LOJA SHOPPING CENTRO',
          vendedor: 'MARINA FERREIRA',
          cliente: 'JOÃO PEDRO MARTINS',
          nf: '—'
        }
      ]);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  // Redireciona para o formulário de venda com os dados carregados
  const handleAcessarVenda = (venda) => {
    navigate('/venda', {
      state: {
        vendaId: venda.id || venda.numeroVenda,
        clienteNome: venda.cliente,
        vendedorNome: venda.vendedor,
        vendaCarregada: venda
      }
    });
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxSizing: 'border-box'
    }}>
      {/* CARD PRINCIPAL */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '24px 28px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'background 0.2s ease, border-color 0.2s ease'
      }}>
        {/* CABEÇALHO */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--line)',
          paddingBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/venda')}
              title="Voltar ao Módulo de Vendas"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--text)',
              margin: 0
            }}>
              Vendas do Dia ({dataHoje})
            </h1>
          </div>

          <button
            type="button"
            onClick={carregarVendas}
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              color: 'var(--text)',
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} color="var(--accent)" />
            <span>Atualizar</span>
          </button>
        </div>

        {/* TABELA DE VENDAS */}
        <div style={{
          overflowX: 'auto',
          width: '100%',
          borderRadius: 8,
          border: '1px solid var(--line)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: 13
          }}>
            <thead>
              <tr style={{
                background: 'var(--panel-2)',
                borderBottom: '1px solid var(--line)',
                color: 'var(--text-faint)',
                textTransform: 'uppercase',
                fontSize: 11,
                letterSpacing: 0.5
              }}>
                <th style={{ padding: '14px 16px' }}>Nº</th>
                <th style={{ padding: '14px 16px', color: 'var(--good, #22c55e)' }}>Data</th>
                <th style={{ padding: '14px 16px' }}>Filial</th>
                <th style={{ padding: '14px 16px' }}>Vendedor</th>
                <th style={{ padding: '14px 16px' }}>Cliente</th>
                <th style={{ padding: '14px 16px' }}>NF</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda, idx) => (
                <tr 
                  key={venda.id || idx}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--panel)'}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                    {venda.id || venda.numeroVenda}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {venda.data || venda.criadoEm || dataHoje}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {venda.filial || '0142 - LOJA SHOPPING CENTRO'}
                  </td>
                  <td style={{ padding: '14px 16px', textTransform: 'uppercase' }}>
                    {venda.vendedor || venda.vendedorNome || 'MARINA FERREIRA'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {venda.cliente}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {venda.nf || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12
                    }}>
                      {/* BOTÃO EDITAR / ACESSAR VENDA */}
                      <button
                        type="button"
                        onClick={() => handleAcessarVenda(venda)}
                        title="Acessar e Editar Venda"
                        style={{
                          background: 'transparent',
                          border: '1px solid #38bdf8',
                          borderRadius: 6,
                          color: '#38bdf8',
                          cursor: 'pointer',
                          padding: '5px 7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <FileEdit size={16} />
                      </button>

                      {/* BOTÃO IMPRIMIR */}
                      <button
                        type="button"
                        onClick={() => window.print()}
                        title="Imprimir Cupom"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-faint)',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Printer size={16} />
                      </button>

                      {/* BOTÃO DOCUMENTAL */}
                      <button
                        type="button"
                        onClick={() => navigate('/documental')}
                        title="Ir para Gestão Documental"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent, #c026d3)',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <FileText size={16} />
                      </button>

                      {/* BOTÃO NOTA FISCAL */}
                      <button
                        type="button"
                        title="Segunda Via DANFE"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-faint)',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Printer size={16} />
                      </button>

                      {/* BOTÃO CANCELAR */}
                      <button
                        type="button"
                        onClick={() => alert(`Solicitação de cancelamento da venda ${venda.id || venda.numeroVenda}`)}
                        title="Cancelar Venda"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--bad, #ef4444)',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}