import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTema } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  PlusCircle, 
  Users, 
  FileText, 
  Package, 
  Boxes, 
  ArrowDownToLine, 
  ArrowRightLeft,
  DollarSign, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  UserCheck, 
  LayoutGrid, 
  Sun, 
  Moon,
  ChevronRight,
  Power,
  Mail,
  WalletCards,
  Receipt
} from 'lucide-react';

const navGroups = [
  {
    label: 'Geral',
    icon: <LayoutDashboard size={17} />,
    items: [
      { to: '/', label: 'Painel Inicial', icon: <LayoutGrid size={15} /> }
    ],
  },
  {
    label: 'Venda',
    icon: <ShoppingCart size={17} />,
    items: [
      { to: '/venda', label: 'Venda', icon: <PlusCircle size={15} /> },
      { to: '/clientes', label: 'Clientes', icon: <Users size={15} /> },
      { to: '/documental', label: 'Gestão documental', icon: <FileText size={15} /> },
    ],
  },
  {
    label: 'Mailing',
    icon: <Mail size={17} />,
    items: [
      { to: '/mailing', label: 'Gestão de Campanhas', icon: <Mail size={15} /> },
    ],
  },
  {
    label: 'Estoque',
    icon: <Package size={17} />,
    items: [
      { to: '/estoque', label: 'Produtos', icon: <Boxes size={15} /> },
      { to: '/estoque/inventario', label: 'Inventário', icon: <ArrowRightLeft size={15} /> },
      { to: '/entrada', label: 'Entrada de estoque', icon: <ArrowDownToLine size={15} /> },
    ],
  },
  {
    label: 'Financeiro',
    icon: <DollarSign size={17} />,
    items: [
      { to: '/financeiro/caixa', label: 'Caixa', icon: <WalletCards size={15} /> },
      { to: '/financeiro', label: 'Contas a Pagar', icon: <CreditCard size={15} /> },
      { to: '/financeiro/remuneracao', label: 'Remuneração Variável', icon: <TrendingUp size={15} /> },
    ],
  },
  {
    label: 'Dashboards',
    icon: <BarChart3 size={17} />,
    items: [
      { to: '/dashboard', label: 'Vendas', icon: <TrendingUp size={15} /> },
    ],
  },
  {
    label: 'Relatórios',
    icon: <FileText size={17} />,
    items: [
      { to: '/relatorios/vendas', label: 'Vendas', icon: <TrendingUp size={15} /> },
      { to: '/relatorios/estoque', label: 'Estoque', icon: <Boxes size={15} /> },
      { to: '/relatorios/financeiro', label: 'Financeiro', icon: <DollarSign size={15} /> },
      { to: '/relatorios/usuarios', label: 'Usuários', icon: <UserCheck size={15} /> },
    ],
  },
  {
    label: 'Power BI',
    icon: <BarChart3 size={17} />,
    items: [
      { to: '/power-bi', label: 'Painel Geral', icon: <LayoutDashboard size={15} /> }
    ],
  },
];

interface SidebarProps {
  setSession?: (session: any) => void;
}

export default function Sidebar({ setSession }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tema, alternarTema } = useTema();

  const grupoAtivoInicial = navGroups.find((g) =>
    g.items.some((item) => item.to !== '/' && location.pathname.startsWith(item.to))
  )?.label;

  const [abertos, setAbertos] = useState<Set<string>>(() =>
    new Set(grupoAtivoInicial ? [grupoAtivoInicial] : ['Venda', 'Financeiro'])
  );

  const alternarGrupo = (label: string) => {
    setAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(label)) novo.delete(label);
      else novo.add(label);
      return novo;
    });
  };

  const sair = () => {
    if (setSession) setSession(null);
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Navegação dos Módulos */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {navGroups.map((group) => {
          const aberto = abertos.has(group.label);
          return (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-header" onClick={() => alternarGrupo(group.label)}>
                <span className="left">
                  <span className="ic" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {group.icon}
                  </span>
                  {group.label}
                </span>
                <span className={'chevron' + (aberto ? ' open' : '')} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ChevronRight size={15} />
                </span>
              </div>

              <div className={'nav-group-items' + (aberto ? ' open' : '')}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/financeiro' || item.to === '/dashboard' || item.to === '/estoque'}
                    className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
                  >
                    <span className="ic" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}

        {/* Divisor e Controles de Sistema */}
        <div style={{
          padding: '14px 12px 16px',
          borderTop: '1px solid var(--line)',
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          {/* Alternador de Tema */}
          <button
            type="button"
            className="nav-item"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              border: '1px solid var(--line)',
              background: 'var(--panel-2, rgba(255, 255, 255, 0.03))',
              borderRadius: 6,
              padding: '8px 12px',
              margin: 0
            }}
            onClick={alternarTema}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="ic" style={{ display: 'inline-flex', alignItems: 'center' }}>
                {tema === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
              </span>
              Tema {tema === 'dark' ? 'Escuro' : 'Claro'}
            </span>
            <span
              style={{
                fontSize: '10.5px',
                color: 'var(--text-faint)',
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              Trocar
            </span>
          </button>

          {/* Botão Sair */}
          <div 
            className="logout-link" 
            onClick={sair}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: '13px',
              color: 'var(--bad, #ef4444)',
              transition: 'background 0.15s ease'
            }}
          >
            <Power size={15} />
            <span>Sair do sistema</span>
          </div>
        </div>
      </div>
    </aside>
  );
}