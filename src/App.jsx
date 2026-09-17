import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastContext';

// Componentes Globais
import Sidebar from './components/Sidebar';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardVendas from './pages/DashboardVendas';
import Venda from './pages/ModuloVendas';
import Clientes from './pages/Clientes';
import EntradaEstoque from './pages/EntradaEstoque';
import Estoque from './pages/Estoque';
import EstoqueInventario from './pages/EstoqueInventario';
import Financeiro from './pages/Financeiro';
import RemuneracaoVariavel from './pages/RemuneracaoVariavel';
import Documental from './pages/Documental';
import Relatorios from './pages/Relatorios';
import PowerBI from './pages/PowerBI';
import Mailing from './pages/Mailing';
import WhatsAppChatCRM from './pages/WhatsAppChatCRM';

// Ícones da Topbar
import { 
  Search, 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  Headphones, 
  Smartphone, 
  Bell 
} from 'lucide-react';

// ---------------------------------------------------------------------------
// LOGO 4R SOLUTIONS
// ---------------------------------------------------------------------------
function VivoGOLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
      <span style={{
        fontSize: 24,
        fontWeight: 900,
        letterSpacing: -0.5,
        color: '#ffffff',
        fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}>
        4R
      </span>
      <span style={{
        fontSize: 24,
        fontWeight: 800,
        letterSpacing: -0.5,
        background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}>
        Solutions
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOTÃO TOGGLE SIDEBAR
// ---------------------------------------------------------------------------
function ToggleSidebarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f1f5f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d="M6 10l-2 2 2 2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ÍCONE OFICIAL WHATSAPP
// ---------------------------------------------------------------------------
function WhatsAppOfficialIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TOPBAR SUPERIOR COM BUSCA E ATALHOS
// ---------------------------------------------------------------------------
function HeaderVivoGOInternal({ sidebarAberta, setSidebarAberta, session }) {
  const navigate = useNavigate();

  return (
    <header style={{
      height: 56,
      background: '#110d17',
      borderBottom: '1px solid #231b2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      color: '#ffffff',
      userSelect: 'none',
      zIndex: 50,
      flexShrink: 0,
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button
          type="button"
          onClick={() => setSidebarAberta(!sidebarAberta)}
          title={sidebarAberta ? "Recolher menu lateral" : "Expandir menu lateral"}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ToggleSidebarIcon />
        </button>

        <div onClick={() => navigate('/')}>
          <VivoGOLogo />
        </div>

        <div style={{
          marginLeft: 18,
          background: '#1b1425',
          border: '1px solid #352849',
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          width: 320,
          height: 38,
          boxSizing: 'border-box'
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Digite para buscar um módulo"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d8b4fe',
              fontSize: 13,
              paddingLeft: 10,
              width: '100%',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button 
          type="button" 
          title="Assistente IA"
          style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          <Sparkles size={18} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#1b1425',
          border: '1px solid #352849',
          borderRadius: 18,
          padding: '4px 12px',
          fontSize: 13,
          fontWeight: 800,
          cursor: 'pointer',
          color: '#ffffff'
        }}>
          <MapPin size={15} color="#c084fc" />
          <span>MT</span>
          <ChevronDown size={14} color="#94a3b8" />
        </div>

        <button 
          type="button" 
          title="Atendimento & Suporte"
          style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          <Headphones size={19} />
        </button>

        <button 
          type="button" 
          title="Linhas e Aparelhos"
          style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          <Smartphone size={19} />
        </button>

        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Bell size={19} color="#e2e8f0" />
          <span style={{
            position: 'absolute',
            top: -6,
            right: -8,
            background: '#a855f7',
            color: '#ffffff',
            fontSize: 9.5,
            fontWeight: 800,
            borderRadius: 10,
            padding: '1px 4px',
            minWidth: 14,
            textAlign: 'center',
            lineHeight: 1
          }}>
            12
          </span>
        </div>

        <div 
          onClick={() => navigate('/whatsapp-chat')}
          title="Abrir Chat WhatsApp Web"
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <WhatsAppOfficialIcon />
          <span style={{
            position: 'absolute',
            top: -6,
            right: -8,
            background: '#a855f7',
            color: '#ffffff',
            fontSize: 9.5,
            fontWeight: 800,
            borderRadius: 10,
            padding: '1px 5px',
            minWidth: 14,
            textAlign: 'center',
            lineHeight: 1
          }}>
            4
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#1b1425',
          border: '1px solid #352849',
          borderRadius: 24,
          padding: '3px 12px 3px 4px',
          cursor: 'pointer'
        }}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Usuário"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid #a855f7'
            }}
          />

          <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 0.3
            }}>
              GUILHERME DE QUEIR...
            </div>
            <div style={{ fontSize: 10, color: '#c084fc', fontWeight: 600 }}>
              4 REDES
            </div>
          </div>

          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// LAYOUT PRIVADO (ESTRUTURA DE TELA CHEIA SEM ROLAGEM DUPLA)
// ---------------------------------------------------------------------------
function LayoutPrivado({ session, setSession }) {
  const [sidebarAberta, setSidebarAberta] = useState(true);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#0d0a14'
    }}>
      <HeaderVivoGOInternal 
        sidebarAberta={sidebarAberta} 
        setSidebarAberta={setSidebarAberta} 
        session={session} 
      />

      <div style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden'
      }}>
        {sidebarAberta && (
          <div style={{
            width: 240,
            minWidth: 240,
            height: '100%',
            overflowY: 'auto',
            flexShrink: 0,
            background: '#171124',
            borderRight: '1px solid #281d38'
          }}>
            <Sidebar setSession={setSession} />
          </div>
        )}

        <main style={{
          flex: 1,
          width: 0,
          height: '100%',
          overflow: 'hidden',
          background: 'var(--bg, #0d0914)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 32px 40px',
        }}>
          <Outlet context={{ session }} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState({
    filial: 'Matriz',
    user: 'GC',
    nome: 'Guilherme de Queiroz Caixeta',
    role: 'Admin · Matriz'
  });

  return (
    <ToastProvider>
      <Routes>
        <Route 
          path="/login" 
          element={<Login setSession={setSession} onLogin={setSession} />} 
        />

        <Route element={<LayoutPrivado session={session} setSession={setSession} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<DashboardVendas />} />
          <Route path="/dashboard/vendas" element={<DashboardVendas />} />

          <Route path="/venda" element={<Venda />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/documental" element={<Documental />} />

          {/* Módulo Convy & WhatsApp */}
          <Route path="/convy" element={<Mailing />} />
          <Route path="/mailing" element={<Navigate to="/convy" replace />} />
          <Route path="/whatsapp-chat" element={<WhatsAppChatCRM session={session} />} />

          <Route path="/estoque" element={<Estoque />} />
          <Route path="/estoque/inventario" element={<EstoqueInventario />} />
          <Route path="/entrada" element={<EntradaEstoque />} />

          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/financeiro/remuneracao" element={<RemuneracaoVariavel />} />

          <Route path="/relatorios/vendas" element={<Relatorios />} />
          <Route path="/relatorios/documental" element={<Documental />} />
          <Route path="/relatorios/estoque" element={<Estoque />} />
          <Route path="/relatorios/financeiro" element={<Financeiro />} />
          <Route path="/relatorios/usuarios" element={<Relatorios />} />

          <Route path="/power-bi" element={<PowerBI />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  );
}