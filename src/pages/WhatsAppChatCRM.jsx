import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Paperclip, 
  Send, 
  Clock, 
  CheckCheck, 
  FileText, 
  ChevronDown,
  Tag,
  Plus,
  LogOut,
  MoreHorizontal,
  Filter,
  Headphones,
  ShieldAlert
} from 'lucide-react';
import { useTema } from '../context/ThemeContext';

export default function WhatsAppChatCRM({ session: propSession }) {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const { tema } = useTema();
  const isDark = tema === 'dark';

  const session = propSession || outletContext?.session || {
    nome: 'Guilherme Caixeta',
    role: 'Admin · Matriz',
    filial: 'Matriz'
  };

  const temPermissaoCRM = useMemo(() => {
    const cargo = (session?.role || '').toLowerCase();
    return (
      cargo.includes('admin') || 
      cargo.includes('vendedor') || 
      cargo.includes('atendente') || 
      cargo.includes('gerente') ||
      cargo.includes('comercial')
    );
  }, [session]);

  const nomeVendedorLogado = session?.nome || 'Guilherme Caixeta';
  const primeiroNome = nomeVendedorLogado.split(' ')[0].toUpperCase();

  const [conversas, setConversas] = useState(() => {
    const salvos = localStorage.getItem('syscor_convy_chats');
    if (salvos) {
      try { return JSON.parse(salvos); } catch (e) { console.error(e); }
    }
    return [
      {
        id: '558589975663',
        nome: 'Adriana santos ❤️',
        tag: 'FATURA',
        naoLidas: 0,
        filial: 'CE - FORTALEZA',
        campanha: 'CONVY',
        horario: '17:18',
        ultimaMsg: 'Quero minha fatura',
        online: true,
        emAtendimento: false,
        mensagens: [
          { 
            id: 1, 
            autor: 'bot', 
            tipo: 'template', 
            texto: 'Olá Adriana santos ❤️, sua fatura/oferta do Vivo Pós Individual no valor de R$ 119,90 está disponível. Deseja conferir?', 
            hora: '17:18' 
          },
          { 
            id: 2, 
            autor: 'cliente', 
            tipo: 'texto', 
            texto: 'Quero minha fatura', 
            hora: '17:18' 
          }
        ]
      },
      {
        id: '559493086582',
        nome: 'Yasmin.',
        tag: '',
        naoLidas: 6,
        filial: 'PA - MARABA LOJA 01',
        campanha: 'RESGATE FATURA',
        horario: '16:12',
        ultimaMsg: 'Vai prestar só quando eu pagar?',
        online: true,
        emAtendimento: false,
        mensagens: [
          { id: 1, autor: 'bot', tipo: 'template', texto: 'Olá Yasmin, identificamos sua fatura em aberto.', hora: '16:10' },
          { id: 2, autor: 'cliente', tipo: 'texto', texto: 'Vai prestar só quando eu pagar?', hora: '16:12' }
        ]
      },
      {
        id: '558581404435',
        nome: 'Robson ar',
        tag: '',
        naoLidas: 2,
        filial: 'CE - FORTALEZA',
        campanha: 'OFERTA CONTROLE',
        horario: '16:11',
        ultimaMsg: '?',
        online: false,
        emAtendimento: false,
        mensagens: [
          { id: 1, autor: 'cliente', tipo: 'texto', texto: '?', hora: '16:11' }
        ]
      }
    ];
  });

  const [chatAtivoId, setChatAtivoId] = useState('558589975663');
  const [buscaConversas, setBuscaConversas] = useState('');
  const [filialFiltro, setFilialFiltro] = useState('');
  const [textoInput, setTextoInput] = useState('');
  const [segundosAtendimento, setSegundosAtendimento] = useState(26);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  const chatAtivo = conversas.find(c => c.id === chatAtivoId) || conversas[0];

  useEffect(() => {
    localStorage.setItem('syscor_convy_chats', JSON.stringify(conversas));
  }, [conversas]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatAtivo?.mensagens]);

  useEffect(() => {
    const timer = setInterval(() => setSegundosAtendimento(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [chatAtivoId]);

  const formatarTimer = (totalSeg) => {
    const h = String(Math.floor(totalSeg / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeg % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const handleSelecionarChat = (id) => {
    setChatAtivoId(id);
    setSegundosAtendimento(0);
    setConversas(prev => prev.map(c => c.id === id ? { ...c, naoLidas: 0 } : c));
  };

  const handleIniciarAtendimento = () => {
    if (!chatAtivo) return;
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const msgApresentacao = {
      id: Date.now(),
      autor: 'user',
      tipo: 'texto',
      texto: `Olá! Eu sou ${primeiroNome} e irei continuar o seu atendimento a partir de agora.`,
      hora: horaAtual
    };

    setConversas(prev => prev.map(c => {
      if (c.id === chatAtivoId) {
        return {
          ...c,
          emAtendimento: true,
          atendente: nomeVendedorLogado,
          mensagens: [...c.mensagens, msgApresentacao]
        };
      }
      return c;
    }));
  };

  const handleEnviarTexto = (e) => {
    e?.preventDefault();
    if (!textoInput.trim() || !chatAtivo) return;

    const novaMsg = {
      id: Date.now(),
      autor: 'user',
      tipo: 'texto',
      texto: textoInput,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setConversas(prev => prev.map(c => {
      if (c.id === chatAtivoId) {
        return { 
          ...c, 
          mensagens: [...c.mensagens, novaMsg],
          horario: novaMsg.hora,
          ultimaMsg: novaMsg.texto
        };
      }
      return c;
    }));

    setTextoInput('');
  };

  const handleEnviarPDF = (e) => {
    const arq = e.target.files?.[0];
    if (!arq || !chatAtivo) return;

    const novaMsg = {
      id: Date.now(),
      autor: 'user',
      tipo: 'pdf',
      nome: arq.name,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setConversas(prev => prev.map(c => {
      if (c.id === chatAtivoId) {
        return { ...c, mensagens: [...c.mensagens, novaMsg] };
      }
      return c;
    }));

    e.target.value = '';
  };

  const conversasFiltradas = useMemo(() => {
    return conversas.filter(c => {
      const matchBusca = !buscaConversas || 
        c.nome.toLowerCase().includes(buscaConversas.toLowerCase()) || 
        c.id.includes(buscaConversas) ||
        c.ultimaMsg.toLowerCase().includes(buscaConversas.toLowerCase());

      const matchFilial = !filialFiltro || c.filial.toLowerCase().includes(filialFiltro.toLowerCase());
      return matchBusca && matchFilial;
    });
  }, [conversas, buscaConversas, filialFiltro]);

  if (!temPermissaoCRM) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#fff'
      }}>
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2>Acesso Restrito ao Atendimento</h2>
        <p style={{ color: '#94a3b8' }}>O usuário não possui perfil de atendente.</p>
        <button
          onClick={() => navigate('/convy')}
          style={{
            marginTop: 12,
            background: '#6b21a8',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Voltar para Convy
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      background: '#0d0914',
      color: '#fff',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <input type="file" ref={fileInputRef} accept="application/pdf,image/*" style={{ display: 'none' }} onChange={handleEnviarPDF} />

      {/* ========================================================================= */}
      {/* COLUNA ESQUERDA: LISTA DE CONVERSAS (LARGURA FIXA E CORRETA)              */}
      {/* ========================================================================= */}
      <div style={{
        width: 380,
        minWidth: 380,
        height: '100%',
        background: '#231535',
        borderRight: '1px solid #190e26',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        
        {/* Topo do WhatsApp API e Atalhos */}
        <div style={{
          padding: '14px 16px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Número WhatsApp API */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.222-.559-1.828-.758-3.003-2.614-3.095-2.736-.092-.122-.738-.981-.738-1.872 0-.891.468-1.33.635-1.512.167-.182.365-.228.487-.228.122 0 .243.001.35.006.113.005.263-.043.412.316.152.365.518 1.264.564 1.355.046.091.076.198.015.32-.061.122-.091.198-.182.304-.091.106-.192.237-.274.318-.092.091-.188.19-.081.374.107.184.475.786 1.021 1.272.704.628 1.297.823 1.48.914.183.091.29.076.397-.046.106-.122.456-.532.578-.715.122-.182.244-.152.411-.091.167.061 1.066.503 1.249.594.183.091.305.137.35.213.045.076.045.441-.099.846z"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>5561999866400</span>
                <ChevronDown size={14} color="#94a3b8" />
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>WhatsApp API</div>
            </div>
          </div>

          {/* Ícones de ação no topo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              type="button" 
              title="Campanhas" 
              onClick={() => navigate('/convy')}
              style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}
            >
              <Tag size={16} />
            </button>
            <button 
              type="button" 
              title="Novo Atendimento" 
              onClick={() => {
                const tel = prompt('Informe o telefone com DDD:');
                if (tel && tel.length >= 10) {
                  const novo = {
                    id: tel,
                    nome: 'Novo Contato',
                    tag: 'AVULSO',
                    naoLidas: 0,
                    filial: 'Matriz',
                    campanha: 'MANUAL',
                    horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    ultimaMsg: 'Início',
                    online: true,
                    emAtendimento: true,
                    mensagens: []
                  };
                  setConversas([novo, ...conversas]);
                  handleSelecionarChat(tel);
                }
              }}
              style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}
            >
              <Plus size={18} />
            </button>
            <button 
              type="button" 
              title="Voltar para Gestão de Campanhas" 
              onClick={() => navigate('/convy')}
              style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Barra de Filtros: Busca + Filial */}
        <div style={{ padding: '0 16px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            flex: 1,
            background: '#1a0e28',
            border: '1px solid #362252',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            height: 34
          }}>
            <input
              type="text"
              placeholder="Buscar nas conversas..."
              value={buscaConversas}
              onChange={(e) => setBuscaConversas(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                width: '100%',
                outline: 'none'
              }}
            />
            <Search size={14} color="#94a3b8" />
          </div>

          <div style={{ width: 110 }}>
            <select
              value={filialFiltro}
              onChange={(e) => setFilialFiltro(e.target.value)}
              style={{
                width: '100%',
                height: 34,
                background: '#1a0e28',
                border: '1px solid #362252',
                borderRadius: 6,
                color: '#94a3b8',
                padding: '0 6px',
                fontSize: 12,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Filial...</option>
              <option value="FORTALEZA">FORTALEZA</option>
              <option value="TERESINA">TERESINA</option>
              <option value="ANAPOLIS">ANAPOLIS</option>
              <option value="MARABA">MARABA</option>
            </select>
          </div>
        </div>

        {/* Ícone ••• e Filtro Funil */}
        <div style={{
          padding: '0 16px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #2d1a45'
        }}>
          <MoreHorizontal size={18} color="#cbd5e1" style={{ cursor: 'pointer' }} />
          <Filter size={15} color="#cbd5e1" style={{ cursor: 'pointer' }} />
        </div>

        {/* Lista de Contatos */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversasFiltradas.map((c) => {
            const ativo = c.id === chatAtivoId;

            return (
              <div
                key={c.id}
                onClick={() => handleSelecionarChat(c.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #2d1a45',
                  background: ativo ? '#351d52' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#d8b4fe' }}>
                      {c.nome}
                    </span>
                    {c.tag && (
                      <span style={{
                        background: '#38bdf8',
                        color: '#0f172a',
                        fontSize: 9,
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: 8
                      }}>
                        {c.tag}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {c.horario}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 4
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: '#e2e8f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '85%'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#22c55e" style={{ flexShrink: 0 }}>
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.222-.559-1.828-.758-3.003-2.614-3.095-2.736-.092-.122-.738-.981-.738-1.872 0-.891.468-1.33.635-1.512.167-.182.365-.228.487-.228.122 0 .243.001.35.006.113.005.263-.043.412.316.152.365.518 1.264.564 1.355.046.091.076.198.015.32-.061.122-.091.198-.182.304-.091.106-.192.237-.274.318-.092.091-.188.19-.081.374.107.184.475.786 1.021 1.272.704.628 1.297.823 1.48.914.183.091.29.076.397-.046.106-.122.456-.532.578-.715.122-.182.244-.152.411-.091.167.061 1.066.503 1.249.594.183.091.305.137.35.213.045.076.045.441-.099.846z"/>
                    </svg>
                    <span style={{ fontWeight: 700 }}>{c.id}:</span>
                    <span style={{ color: '#cbd5e1' }}>{c.ultimaMsg}</span>
                  </div>

                  {c.naoLidas > 0 && (
                    <span style={{
                      background: '#22c55e',
                      color: '#052e16',
                      fontSize: 10,
                      fontWeight: 900,
                      width: 17,
                      height: 17,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {c.naoLidas}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  {nomeVendedorLogado}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COLUNA DIREITA: CONTEÚDO DO CHAT (PREENCHE O RESTO DA TELA SEM OVERFLOW) */}
      {/* ========================================================================= */}
      <div style={{
        flex: 1,
        height: '100%',
        background: '#110c18',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Topbar do Chat Selecionado */}
        <div style={{
          background: '#190a28',
          borderBottom: '1px solid #2d1645',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#d8b4fe' }}>
              {chatAtivo.nome} <span style={{ fontSize: 12, color: '#94a3b8' }}>({chatAtivo.id})</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Filial: <b>{chatAtivo.filial}</b> · Atendente: <b>{nomeVendedorLogado}</b>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!chatAtivo.emAtendimento && (
              <button
                onClick={handleIniciarAtendimento}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 14px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Headphones size={15} /> Iniciar Atendimento
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c084fc', fontSize: 13, fontWeight: 700 }}>
              <Clock size={15} />
              {formatarTimer(segundosAtendimento)}
            </div>

            <button
              onClick={() => alert(`Atendimento com ${chatAtivo.nome} finalizado!`)}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Finalizar atendimento
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {chatAtivo.mensagens.map((msg) => {
            const ehCliente = msg.autor === 'cliente';

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: ehCliente ? 'flex-start' : 'flex-end',
                  maxWidth: '65%',
                  background: ehCliente ? '#1a1824' : '#2b104a',
                  border: ehCliente ? '1px solid #2b283a' : 'none',
                  borderRadius: 8,
                  padding: '10px 14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  color: '#ffffff'
                }}
              >
                {msg.tipo === 'template' && (
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                    <div style={{ fontSize: 9.5, color: '#c084fc', fontWeight: 800, marginBottom: 4 }}>CAMPANHA CONVY</div>
                    {msg.texto}
                  </div>
                )}

                {msg.tipo === 'texto' && (
                  <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{msg.texto}</div>
                )}

                {msg.tipo === 'pdf' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: 6 }}>
                    <FileText size={24} color="#ef4444" />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fca5a5' }}>{msg.nome}</div>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Documento PDF</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, fontSize: 9.5, color: '#a855f7', marginTop: 4 }}>
                  <span>{msg.hora}</span>
                  {!ehCliente && <CheckCheck size={12} color="#a855f7" />}
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Badge do Atendente Online */}
        <div style={{
          position: 'absolute',
          bottom: 64,
          right: 20,
          background: '#1f132e',
          border: '1px solid #4a1d80',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>{primeiroNome} está online! 🔥</span>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓</span>
        </div>

        {/* Rodapé de Envio */}
        <div style={{
          padding: '10px 16px',
          background: '#160a22',
          borderTop: '1px solid #2d1645',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0
        }}>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ background: 'transparent', border: 'none', color: '#a855f7', cursor: 'pointer' }}
            title="Anexar Documento"
          >
            <Paperclip size={18} />
          </button>

          <form onSubmit={handleEnviarTexto} style={{ flex: 1 }}>
            <input
              type="text"
              placeholder={chatAtivo.emAtendimento ? `Responder como ${nomeVendedorLogado}...` : "Clique em 'Iniciar Atendimento' para responder..."}
              disabled={!chatAtivo.emAtendimento}
              value={textoInput}
              onChange={(e) => setTextoInput(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                background: '#241038',
                border: '1px solid #3c1c5e',
                borderRadius: 6,
                padding: '0 12px',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
                opacity: chatAtivo.emAtendimento ? 1 : 0.6
              }}
            />
          </form>

          <button 
            type="button"
            onClick={handleEnviarTexto}
            disabled={!chatAtivo.emAtendimento}
            style={{
              background: chatAtivo.emAtendimento ? '#7c3aed' : '#475569',
              border: 'none',
              color: '#fff',
              borderRadius: 6,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: chatAtivo.emAtendimento ? 'pointer' : 'not-allowed'
            }}
          >
            <Send size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}