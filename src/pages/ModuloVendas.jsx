import React, { useState } from 'react';
import Venda from './Venda'; // Seu componente completo de PDV e Carrinho
import Clientes from './Clientes'; // O componente de Clientes e Leads
import { 
  ShoppingCart, 
  Users, 
  PlusCircle, 
  Search, 
  Eye, 
  HelpCircle, 
  Smartphone, 
  CreditCard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ModuloVendas() {
  // Controla qual seção está expandida na tela principal ('CLIENTES' | 'VENDA' | null)
  const [secaoExpandida, setSecaoExpandida] = useState(null);

  // Controla se abriu a tela interna de Ação (ex: Inserir ou Buscar)
  const [etapaCliente, setEtapaCliente] = useState('MENU');
  const [modoCaixaVenda, setModoCaixaVenda] = useState(false);

  // 1. Se o usuário entrou no formulário interno de Clientes e Leads
  if (etapaCliente !== 'MENU') {
    return <Clientes etapaInicial={etapaCliente} onVoltar={() => setEtapaCliente('MENU')} />;
  }

  // 2. Se o usuário entrou na Frente de Caixa de Venda ("Inserir Registro")
  if (modoCaixaVenda) {
    return <Venda onVoltar={() => setModoCaixaVenda(false)} />;
  }

  const alternarSecao = (secao) => {
    setSecaoExpandida(atual => (atual === secao ? null : secao));
  };

  return (
    // Antes: margin: '20px auto' — o 'auto' centralizava a section (max-width
    // 1100px) dentro da área de conteúdo, criando aquele espaço enorme entre
    // a sidebar e os cards. Trocado para '20px 0' para o conteúdo ficar
    // alinhado à esquerda, colado à sidebar, mantendo só o respiro vertical.
    <section className="view" style={{ maxWidth: 1100, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* 1. CARTÃO: CLIENTE / LEAD */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--line, #332a4d)', background: 'var(--panel, #181329)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 16, background: 'var(--accent, #c026d3)', borderRadius: 2 }} />
              <b style={{ fontSize: 15, color: 'var(--text, #fff)' }}>Cliente / Lead</b>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-faint, #8c85a6)', marginLeft: 14, display: 'block', marginTop: 3 }}>
              Inclusão e alteração das informações dos clientes e leads.
            </span>
          </div>

          <button
            type="button"
            className="btn sm"
            onClick={() => alternarSecao('CLIENTES')}
            style={{
              background: 'var(--panel-2, #211c38)',
              borderColor: 'var(--line, #332a4d)',
              color: 'var(--text, #fff)',
              borderRadius: 20,
              padding: '6px 18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Avaliar {secaoExpandida === 'CLIENTES' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {/* Grade expandida para Clientes e Leads */}
        {secaoExpandida === 'CLIENTES' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: 16, 
            padding: '20px 24px 24px', 
            background: 'var(--panel-2, #211c38)', 
            borderTop: '1px solid var(--line, #332a4d)' 
          }}>
            <div 
              onClick={() => setEtapaCliente('INSERIR')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '22px 14px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <PlusCircle size={20} />
              </div>
              <b style={{ fontSize: 13, color: 'var(--text, #fff)' }}>Inserir Registro</b>
            </div>

            <div 
              onClick={() => setEtapaCliente('BUSCAR')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '22px 14px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <Search size={20} />
              </div>
              <b style={{ fontSize: 13, color: 'var(--text, #fff)' }}>Buscar Registro</b>
            </div>
          </div>
        )}
      </div>

      {/* 2. CARTÃO: VENDA */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--line, #332a4d)', background: 'var(--panel, #181329)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 16, background: 'var(--accent, #c026d3)', borderRadius: 2 }} />
              <b style={{ fontSize: 15, color: 'var(--text, #fff)' }}>Venda</b>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-faint, #8c85a6)', marginLeft: 14, display: 'block', marginTop: 3 }}>
              Venda de produtos e serviços.
            </span>
          </div>

          <button
            type="button"
            className="btn sm"
            onClick={() => alternarSecao('VENDA')}
            style={{
              background: 'var(--panel-2, #211c38)',
              borderColor: 'var(--line, #332a4d)',
              color: 'var(--text, #fff)',
              borderRadius: 20,
              padding: '6px 18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Avaliar {secaoExpandida === 'VENDA' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {/* Grade expandida para Venda */}
        {secaoExpandida === 'VENDA' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: 16, 
            padding: '20px 24px 24px', 
            background: 'var(--panel-2, #211c38)', 
            borderTop: '1px solid var(--line, #332a4d)' 
          }}>
            <div 
              onClick={() => setModoCaixaVenda(true)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '20px 12px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <PlusCircle size={20} />
              </div>
              <b style={{ fontSize: 12.5, color: 'var(--text, #fff)' }}>Inserir Registro</b>
            </div>

            <div 
              onClick={() => alert('Buscar Registro de Venda')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '20px 12px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <Search size={20} />
              </div>
              <b style={{ fontSize: 12.5, color: 'var(--text, #fff)' }}>Buscar Registro</b>
            </div>

            <div 
              onClick={() => alert('Ver Vendas de Hoje')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '20px 12px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <Eye size={20} />
              </div>
              <b style={{ fontSize: 12.5, color: 'var(--text, #fff)' }}>Ver Vendas de Hoje</b>
            </div>

            <div 
              onClick={() => alert('Ajuda')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '20px 12px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <HelpCircle size={20} />
              </div>
              <b style={{ fontSize: 12.5, color: 'var(--text, #fff)' }}>Ajuda</b>
            </div>

            <div 
              onClick={() => alert('Vivo Renova')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '20px 12px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <Smartphone size={20} />
              </div>
              <b style={{ fontSize: 12.5, color: 'var(--text, #fff)' }}>Vivo Renova</b>
            </div>

            <div 
              onClick={() => alert('Vincular TEF')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '20px 12px', borderRadius: 8, border: '1px solid var(--line, #332a4d)',
                background: 'var(--panel, #181329)', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
                <CreditCard size={20} />
              </div>
              <b style={{ fontSize: 12.5, color: 'var(--text, #fff)' }}>Vincular TEF</b>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}