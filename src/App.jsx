import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastContext';

// Componentes Globais
import Sidebar from './components/Sidebar';

// Páginas existentes
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';           // Geral -> Painel Inicial
import DashboardVendas from './pages/DashboardVendas';
import ModuloVendas from './pages/ModuloVendas';     // Ecrã com os cartões e botões de venda
import Venda from './pages/Venda';                   // Formulário de lançamento de venda
import BuscarVendas from './pages/BuscarVendas';     // Pesquisa de vendas
import VendasDia from './pages/VendasDia';           // Listagem de vendas do dia
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
  Bell,
  Sun,
  Moon
} from 'lucide-react';

function VivoGOLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
      <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: 'var(--text)', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        4R
      </span>
      <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
        Solutions
      </span>
    </div>
  );
}

function ToggleSidebarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d="M6 10l-2 2 2 2" />
    </svg>
  );
}

function WhatsAppOfficialIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function HeaderVivoGOInternal({ sidebarAberta, setSidebarAberta, session, temaEscuro, toggleTema }) {
  const navigate = useNavigate();

  return (
    <header style={{
      height: 56,
      minHeight: 56,
      background: 'var(--panel-topbar)',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      color: 'var(--text)',
      userSelect: 'none',
      zIndex: 50,
      flexShrink: 0,
      boxSizing: 'border-box',
      transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => setSidebarAberta(!sidebarAberta)}
          title={sidebarAberta ? 'Recolher menu lateral' : 'Expandir menu lateral'}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <ToggleSidebarIcon />
        </button>

        <div onClick={() => navigate('/')} style={{ flexShrink: 0 }}>
          <VivoGOLogo />
        </div>

        <div style={{
          marginLeft: 18,
          background: 'var(--input-bg)',
          border: '1px solid var(--line)',
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          width: 320,
          minWidth: 0,
          height: 38,
          boxSizing: 'border-box'
        }}>
          <Search size={16} color="var(--text-faint)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Digite para buscar um módulo"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text)', 
              fontSize: 13, 
              paddingLeft: 10, 
              width: '100%', 
              minWidth: 0, 
              outline: 'none', 
              fontFamily: 'inherit' 
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        
        {/* BOTÃO ALTERNAR TEMA */}
        <button
          type="button"
          onClick={toggleTema}
          title={temaEscuro ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 700
          }}
        >
          {temaEscuro ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#818cf8" />}
          <span>{temaEscuro ? 'Claro' : 'Escuro'}</span>
        </button>

        <button type="button" title="Assistente IA" style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', padding: 0 }}>
          <Sparkles size={18} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--input-bg)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '4px 12px',
          fontSize: 13,
          fontWeight: 800,
          cursor: 'pointer',
          color: 'var(--text)'
        }}>
          <MapPin size={15} color="#c084fc" />
          <span>{session?.filial === 'Matriz' ? 'MT' : 'MT'}</span>
          <ChevronDown size={14} color="var(--text-faint)" />
        </div>

        <button type="button" title="Atendimento & Suporte" style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', padding: 0 }}>
          <Headphones size={19} />
        </button>

        <button type="button" title="Linhas e Aparelhos" style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', padding: 0 }}>
          <Smartphone size={19} />
        </button>

        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Bell size={19} color="var(--text)" />
          <span style={{ position: 'absolute', top: -6, right: -8, background: '#a855f7', color: '#ffffff', fontSize: 9.5, fontWeight: 800, borderRadius: 10, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: 1 }}>
            12
          </span>
        </div>

        <div
          onClick={() => navigate('/whatsapp-chat')}
          title="Abrir Chat WhatsApp Web"
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <WhatsAppOfficialIcon />
          <span style={{ position: 'absolute', top: -6, right: -8, background: '#a855f7', color: '#ffffff', fontSize: 9.5, fontWeight: 800, borderRadius: 10, padding: '1px 5px', minWidth: 14, textAlign: 'center', lineHeight: 1 }}>
            4
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--input-bg)',
          border: '1px solid var(--line)',
          borderRadius: 24,
          padding: '3px 12px 3px 4px',
          cursor: 'pointer'
        }}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Usuário"
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid #a855f7' }}
          />
          <div style={{ textAlign: 'left', lineHeight: 1.15, maxWidth: 150 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {(session?.nome || 'Usuário').toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: '#c084fc', fontWeight: 600 }}>
              4 REDES
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-faint)" />
        </div>
      </div>
    </header>
  );
}

function LayoutPrivado({ session, setSession, temaEscuro, toggleTema }) {
  const [sidebarAberta, setSidebarAberta] = useState(true);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg)',
      color: 'var(--text)',
      transition: 'background 0.2s ease, color 0.2s ease'
    }}>
      <HeaderVivoGOInternal
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
        session={session}
        temaEscuro={temaEscuro}
        toggleTema={toggleTema}
      />

      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden'
      }}>
        {sidebarAberta && (
          <aside style={{
            width: 240,
            minWidth: 240,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            flexShrink: 0,
            background: 'var(--panel-sidebar)',
            borderRight: '1px solid var(--line)',
            transition: 'background 0.2s ease, border-color 0.2s ease'
          }}>
            <Sidebar setSession={setSession} />
          </aside>
        )}

        <main style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 32px 40px',
          boxSizing: 'border-box',
          transition: 'background 0.2s ease'
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

  const [temaEscuro, setTemaEscuro] = useState(() => {
    const salvo = localStorage.getItem('syscor_tema');
    return salvo ? salvo === 'escuro' : true;
  });

  const toggleTema = () => {
    setTemaEscuro((prev) => {
      const novo = !prev;
      localStorage.setItem('syscor_tema', novo ? 'escuro' : 'claro');
      return novo;
    });
  };

  // Garante a aplicação do tema nas classes e no seletor HTML global
  useEffect(() => {
    const root = document.documentElement;
    if (temaEscuro) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [temaEscuro]);

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/login"
          element={
            session
              ? <Navigate to="/" replace />
              : <Login setSession={setSession} onLogin={setSession} />
          }
        />

        <Route element={
          <LayoutPrivado 
            session={session} 
            setSession={setSession} 
            temaEscuro={temaEscuro} 
            toggleTema={toggleTema} 
          />
        }>
          {/* ========================================================= */}
          {/* 1. GERAL -> PAINEL INICIAL (PRIMEIRO ECRÃ ACEDIDO)        */}
          {/* ========================================================= */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/geral" element={<Dashboard />} />
          <Route path="/geral/painel-inicial" element={<Dashboard />} />

          {/* Dashboards analíticos */}
          <Route path="/dashboard" element={<DashboardVendas />} />
          <Route path="/dashboard/vendas" element={<DashboardVendas />} />

          {/* ========================================================= */}
          {/* 2. MÓDULO DE VENDA E OS RESPETIVOS BOTÕES                */}
          {/* ========================================================= */}
          <Route path="/venda" element={<ModuloVendas />} />
          <Route path="/venda/documental" element={<ModuloVendas />} />

          {/* Ações individuais dos 3 botões */}
          <Route path="/venda/lancar" element={<Venda />} />
          <Route path="/venda/documental/lancar" element={<Venda />} />

          <Route path="/venda/busca" element={<BuscarVendas />} />
          <Route path="/venda/documental/busca" element={<BuscarVendas />} />

          <Route path="/venda/hoje" element={<VendasDia />} />
          <Route path="/venda/documental/hoje" element={<VendasDia />} />

          {/* ========================================================= */}
          {/* 3. DEMAIS MÓDULOS                                         */}
          {/* ========================================================= */}
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/documental" element={<Documental />} />

          {/* Convy & WhatsApp */}
          <Route path="/convy" element={<Mailing />} />
          <Route path="/mailing" element={<Navigate to="/convy" replace />} />
          <Route path="/whatsapp-chat" element={<WhatsAppChatCRM session={session} />} />

          {/* Estoque */}
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/estoque/inventario" element={<EstoqueInventario />} />
          <Route path="/entrada" element={<EntradaEstoque />} />

          {/* Financeiro */}
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/financeiro/remuneracao" element={<RemuneracaoVariavel />} />

          {/* Relatórios */}
          <Route path="/relatorios/vendas" element={<Relatorios />} />
          <Route path="/relatorios/documental" element={<Documental />} />
          <Route path="/relatorios/estoque" element={<Estoque />} />
          <Route path="/relatorios/financeiro" element={<Financeiro />} />
          <Route path="/relatorios/usuarios" element={<Relatorios />} />

          <Route path="/power-bi" element={<PowerBI />} />
        </Route>
      </Routes>

      {/* DEFINIÇÃO DAS VARIÁVEIS CSS DE TEMA UNIFICADAS */}
      <style>{`
        :root[data-theme="dark"], :root {
          --bg: #0d0a14;
          --panel-topbar: #110d17;
          --panel-sidebar: #171124;
          --panel: #161129;
          --panel-2: #1e1633;
          --input-bg: #1b1425;
          --line: #281d38;
          --line-soft: #20172e;
          --text: #ffffff;
          --text-dim: #cbd5e1;
          --text-faint: #94a3b8;
          --accent: #c026d3;
          --good: #22c55e;
          --bad: #ef4444;
          --warn: #f59e0b;
        }

        :root[data-theme="light"] {
          --bg: #f8fafc;
          --panel-topbar: #ffffff;
          --panel-sidebar: #f1f5f9;
          --panel: #ffffff;
          --panel-2: #f8fafc;
          --input-bg: #f1f5f9;
          --line: #e2e8f0;
          --line-soft: #cbd5e1;
          --text: #0f172a;
          --text-dim: #334155;
          --text-faint: #64748b;
          --accent: #9333ea;
          --good: #16a34a;
          --bad: #dc2626;
          --warn: #d97706;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: var(--bg);
          color: var(--text);
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
      `}</style>
    </ToastProvider>
  );
}