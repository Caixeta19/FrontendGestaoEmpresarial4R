import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye } from 'lucide-react';

export default function PainelVendaAcoes() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#13111e',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 12,
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }}>
      {/* Título da Seção */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 5,
            height: 18,
            backgroundColor: '#c084fc',
            borderRadius: 3,
            display: 'inline-block'
          }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
            Venda
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 15px', color: '#94a3b8', fontSize: 13 }}>
          Venda de produtos e serviços.
        </p>
      </div>

      <div style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', margin: '0 -4px' }} />

      {/* Grade com os 3 botões de ação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 200px))', gap: 16 }}>
        {/* 1. Inserir Registro */}
        <button
          type="button"
          onClick={() => navigate('/vendas/lancar')}
          style={cardBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={iconBoxStyle}>
            <PlusCircle size={24} color="#c084fc" />
          </div>
          <span style={btnLabelStyle}>Inserir Registro</span>
        </button>

        {/* 2. Buscar Registro */}
        <button
          type="button"
          onClick={() => navigate('/vendas/busca')}
          style={cardBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={iconBoxStyle}>
            <Search size={24} color="#c084fc" />
          </div>
          <span style={btnLabelStyle}>Buscar Registro</span>
        </button>

        {/* 3. Ver Vendas de Hoje */}
        <button
          type="button"
          onClick={() => navigate('/vendas/hoje')}
          style={cardBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={iconBoxStyle}>
            <Eye size={24} color="#c084fc" />
          </div>
          <span style={btnLabelStyle}>Ver Vendas de Hoje</span>
        </button>
      </div>
    </div>
  );
}

const cardBtnStyle = {
  background: '#181625',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: 12,
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  cursor: 'pointer',
  transition: 'transform 0.15s ease, border-color 0.15s ease',
  outline: 'none'
};

const iconBoxStyle = {
  background: 'rgba(168, 85, 247, 0.16)',
  borderRadius: 12,
  padding: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const btnLabelStyle = {
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14.5,
  textAlign: 'center'
};