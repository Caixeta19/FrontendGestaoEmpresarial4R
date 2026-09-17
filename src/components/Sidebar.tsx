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
  Power
} from 'lucide-react';

function ConvyIcon() {
  return (
    <div style={{
      width: 22,
      height: 22,
      borderRadius: 6,
      background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(168, 85, 247, 0.4)'
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.222-.559-1.828-.758-3.003-2.614-3.095-2.736-.092-.122-.738-.981-.738-1.872 0-.891.468-1.33.635-1.512.167-.182.365-.228.487-.228.122 0 .243.001.35.006.113.005.263-.043.412.316.152.365.518 1.264.564 1.355.046.091.076.198.015.32-.061.122-.091.198-.182.304-.091.106-.192.237-.274.318-.092.091-.188.19-.081.374.107.184.475.786 1.021 1.272.704.628 1.297.823 1.48.914.183.091.29.076.397-.046.106-.122.456-.532.578-.715.122-.182.244-.152.411-.091.167.061 1.066.503 1.249.594.183.091.305.137.35.213.045.076.045.441-.099.846z"/>
      </svg>
    </div>
  );
}

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
    icon: <ConvyIcon />,
    items: [
      { to: '/mailing', label: 'Gestão de Campanhas', icon: <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7' }} /> },
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
      { to: '/financeiro', label: 'Contas', icon: <CreditCard size={15} /> },
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
    new Set(grupoAtivoInicial ? [grupoAtivoInicial] : ['Venda', 'Convy'])
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
                    end={item.to === '/' || item.to === '/dashboard' || item.to === '/estoque'}
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

        {/* Divisor e Itens de Sistema (Posicionados logo abaixo do Power BI) */}
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