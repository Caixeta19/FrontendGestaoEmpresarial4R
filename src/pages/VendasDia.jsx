import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Printer, FileText, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { PDVS } from '../data/demoData';

export default function VendasHoje() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const dataHojeStr = useMemo(() => {
    return new Date().toLocaleDateString('pt-BR');
  }, []);

  const carregarVendas = () => {
    setCarregando(true);
    const historico = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');

    const vendasDoDia = historico.filter((v) => {
      if (!v.data) return false;
      return v.data.trim() === dataHojeStr.trim();
    });

    setVendas(vendasDoDia);
    setCarregando(false);
  };

  useEffect(() => {
    carregarVendas();
  }, [dataHojeStr]);

  const handleAcessarVenda = (vendaId) => {
    navigate('/vendas/lancar', { state: { vendaId } });
  };

  const handleImprimirComprovante = (venda) => {
    alert(`Gerando comprovante de venda para o registro #${venda.id}...`);
  };

  const handleImprimirTermo = (venda) => {
    alert(`Gerando termo/contrato para a venda #${venda.id}...`);
  };

  const handleCancelarVenda = (vendaId) => {
    const confirmar = window.confirm(`Deseja realmente estornar/cancelar a venda #${vendaId}?`);
    if (!confirmar) return;

    const historico = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
    const historicoAtualizado = historico.filter((v) => String(v.id) !== String(vendaId));
    localStorage.setItem('syscor_vendas', JSON.stringify(historicoAtualizado));

    carregarVendas();
  };

  const getNomeFilial = (pdvId) => {
    const pdv = (PDVS || []).find((p) => String(p.id) === String(pdvId));
    return pdv ? `${pdv.codigo} - ${pdv.nome}` : 'DF - PLANALTINA';
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      background: '#0a0a0f',
      color: '#e2e8f0',
      borderRadius: 10,
      border: '1px solid #1a1926',
      overflow: 'hidden',
      padding: '24px 28px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
            Vendas do Dia ({dataHojeStr})
          </h2>
        </div>

        <button
          type="button"
          onClick={carregarVendas}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #2a283d',
            color: '#c084fc',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #1e1d2b', borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#13121b', borderBottom: '1px solid #232230', color: '#94a3b8' }}>
              <th style={{ padding: '14px 16px', fontWeight: 600, width: 90 }}>Nº</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, color: '#4ade80', width: 140 }}>Data</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, width: 140 }}>Filial</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, width: 200 }}>Vendedor</th>
              <th style={{ padding: '14px 16px', fontWeight: 600 }}>Cliente</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, width: 80 }}>NF</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, width: 160, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px 12px', textAlign: 'center', color: '#64748b' }}>
                  {carregando ? 'Carregando vendas...' : 'Nenhuma venda registrada até o momento no dia de hoje.'}
                </td>
              </tr>
            ) : (
              vendas.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid #161522', background: '#0d0c14' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#141320')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0d0c14')}
                >
                  <td style={{ padding: '14px 16px', color: '#f8fafc', fontWeight: 600 }}>{item.id}</td>
                  <td style={{ padding: '14px 16px', color: '#f8fafc', whiteSpace: 'nowrap' }}>
                    {item.data} {item.hora || '08:00'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#f8fafc', fontSize: 12.5, textTransform: 'uppercase' }}>
                    {getNomeFilial(item.pdvId)}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#f8fafc', fontSize: 12.5, textTransform: 'uppercase' }}>
                    {item.vendedorNome || 'VENDEDOR PADRÃO'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#f8fafc', fontWeight: 600, fontSize: 12.5, textTransform: 'uppercase' }}>
                    {item.cliente || 'CLIENTE BALCÃO'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{item.nf || ''}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <button
                        type="button"
                        title="Acessar / Editar Venda"
                        onClick={() => handleAcessarVenda(item.id)}
                        style={btnIconStyle}
                      >
                        <Edit size={16} color="#38bdf8" />
                      </button>

                      <button
                        type="button"
                        title="Imprimir Comprovante"
                        onClick={() => handleImprimirComprovante(item)}
                        style={btnIconStyle}
                      >
                        <Printer size={16} color="#cbd5e1" />
                      </button>

                      <button
                        type="button"
                        title="Ver Termo / Contrato"
                        onClick={() => handleImprimirTermo(item)}
                        style={btnIconStyle}
                      >
                        <FileText size={16} color="#a855f7" />
                      </button>

                      <button
                        type="button"
                        title="Imprimir Resumo"
                        onClick={() => handleImprimirComprovante(item)}
                        style={btnIconStyle}
                      >
                        <Printer size={16} color="#cbd5e1" />
                      </button>

                      <button
                        type="button"
                        title="Cancelar Venda"
                        onClick={() => handleCancelarVenda(item.id)}
                        style={{ ...btnIconStyle, marginLeft: 6 }}
                      >
                        <XCircle size={17} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnIconStyle = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};