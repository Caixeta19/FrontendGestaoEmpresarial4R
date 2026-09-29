import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  Headphones, 
  Smartphone, 
  Bell, 
  MessageCircle 
} from 'lucide-react';

export default function HeaderVivoGO({ sidebarAberta, setSidebarAberta, session }) {
  const navigate = useNavigate();

  const nomeExibicao = (session?.nome || 'GUILHERME DE QUEIROZ').toUpperCase();
  const nomeTruncado = nomeExibicao.length > 17 ? nomeExibicao.slice(0, 17) + '...' : nomeExibicao;

  // Abre a janela limpa do WhatsApp Chat independente
  const abrirJanelaChat = () => {
    const largura = Math.min(1360, window.screen.availWidth * 0.9);
    const altura = Math.min(850, window.screen.availHeight * 0.9);
    const esquerda = (window.screen.availWidth - largura) / 2;
    const topo = (window.screen.availHeight - altura) / 2;

    const popup = window.open(
      '/#/whatsapp-chat',
      'SyscorChatWhats',
      `width=${largura},height=${altura},top=${topo},left=${esquerda},directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (popup) {
      popup.focus();
    } else {
      navigate('/whatsapp-chat');
    }
  };

  return (
    <header style={{
      height: 54,
      background: '#0c0a10',
      borderBottom: '1px solid #1f1a29',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      color: '#ffffff',
      userSelect: 'none',
      zIndex: 50
    }}>
      {/* Esquerda: Botão recolher + Logo 4R Solutions + Busca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={() => setSidebarAberta(!sidebarAberta)}
          title={sidebarAberta ? "Recolher menu lateral" : "Expandir menu lateral"}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {sidebarAberta ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {/* Logo 4R Solutions */}
        <div 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: '#ffffff' }}>4R</span>
          <span style={{
            color: '#a855f7',
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: -0.5
          }}>
            Solutions
          </span>
        </div>

        {/* Campo de Busca Central */}
        <div style={{
          marginLeft: 24,
          background: '#15111f',
          border: '1px solid #2e263d',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          width: 260,
          height: 32
        }}>
          <Search size={14} color="#a855f7" />
          <input
            type="text"
            placeholder="Digite para buscar um módulo"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f3e8ff',
              fontSize: 12,
              paddingLeft: 8,
              width: '100%',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Direita: Ações Rápidas (sem o botão de tema) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        
        {/* Assistente IA */}
        <button 
          type="button" 
          title="Assistente IA"
          style={{ background: 'transparent', border: 'none', color: '#c084fc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Sparkles size={17} />
        </button>

        {/* Seletor de Filial / UF */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#161220',
          border: '1px solid #2e263d',
          borderRadius: 16,
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          color: '#ffffff'
        }}>
          <MapPin size={13} color="#a855f7" />
          <span>MT</span>
          <ChevronDown size={13} color="#94a3b8" />
        </div>

        {/* Suporte */}
        <button 
          type="button" 
          title="Atendimento & Suporte"
          style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Headphones size={18} />
        </button>

        {/* Aparelhos / SIM */}
        <button 
          type="button" 
          title="Linhas e Aparelhos"
          style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Smartphone size={18} />
        </button>

        {/* Notificações com Badge 12 */}
        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Bell size={18} color="#e2e8f0" />
          <span style={{
            position: 'absolute',
            top: -6,
            right: -8,
            background: '#c084fc',
            color: '#120c1a',
            fontSize: 9.5,
            fontWeight: 900,
            borderRadius: 10,
            padding: '1px 4px',
            lineHeight: 1
          }}>
            12
          </span>
        </div>

        {/* Atalho WhatsApp com Badge 4 (Abre janela independente) */}
        <div 
          onClick={abrirJanelaChat}
          title="Abrir WhatsApp Chat em nova janela"
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <MessageCircle size={19} color="#a855f7" />
          <span style={{
            position: 'absolute',
            top: -6,
            right: -8,
            background: '#a855f7',
            color: '#ffffff',
            fontSize: '9.5px',
            fontWeight: 900,
            borderRadius: '10px',
            padding: '1px 5px',
            lineHeight: 1,
            boxShadow: '0 2px 5px rgba(168, 85, 247, 0.4)'
          }}>
            4
          </span>
        </div>

        {/* Card do Usuário Logado */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#161220',
          border: '1px solid #2e263d',
          borderRadius: 20,
          padding: '2px 10px 2px 2px',
          cursor: 'pointer'
        }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 800
          }}>
            GC
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#ffffff' }}>{nomeTruncado}</div>
            <div style={{ fontSize: 9, color: '#a855f7', fontWeight: 600 }}>4 REDES</div>
          </div>
          <ChevronDown size={13} color="#94a3b8" />
        </div>

      </div>
    </header>
  );
}