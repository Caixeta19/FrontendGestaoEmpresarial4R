import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Search, 
  Eye, 
  HelpCircle, 
  Upload, 
  Users, 
  ArrowLeft, 
  Edit, 
  FileText, 
  MessageCircle, 
  Check, 
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Play,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useTema } from '../context/ThemeContext';

export default function Mailing() {
  const navigate = useNavigate();
  const fileImportRef = useRef(null);
  const { tema } = useTema();
  const isDark = tema === 'dark';

  const [telaAtiva, setTelaAtiva] = useState('HUB'); // 'HUB', 'LISTA_CAMPANHAS', 'NOVA_CAMPANHA'
  const [disparandoId, setDisparandoId] = useState(null);

  // Campanhas oficiais com histórico
  const [campanhas, setCampanhas] = useState([
    { 
      id: 65, 
      nome: 'CLIENTES QUE REALIZARAM COMPRAS PRÉ DE 01/01/2026 A 23/03/2026', 
      data: '23/04/2026 10:44:57', 
      clientes: 17484,
      contatosDemo: [
        { nome: 'Andreza Pereira', telefone: '558681753758', filial: 'PI - TERESINA LOJA 02', valor: 'R$ 67,90', plano: 'Vivo Controle 30GB' },
        { nome: 'Adriana santos ❤️', telefone: '558589975663', filial: 'CE - FORTALEZA', valor: 'R$ 119,90', plano: 'Vivo Pós Individual' }
      ]
    },
    { 
      id: 73, 
      nome: 'Clientes que realizaram compras pré de 01/05/2026 a 06/05/2026', 
      data: '06/05/2026 16:56:49', 
      clientes: 1160,
      contatosDemo: [
        { nome: 'Joao victor', telefone: '556298015524', filial: 'GO - ANAPOLIS', valor: 'R$ 59,90', plano: 'Vivo Controle 20GB' }
      ]
    },
    { 
      id: 135, 
      nome: 'CONVY - CAMPANHA IPHONE 18', 
      data: '11/09/2026 14:39:04', 
      clientes: 3795,
      contatosDemo: [
        { nome: 'Fatima santiago', telefone: '558587442426', filial: 'CE - FORTALEZA', valor: 'R$ 180,00', plano: 'Vivo Família 2' }
      ]
    },
    { 
      id: 114, 
      nome: 'CONVY - OFERTA CONTROLE', 
      data: '06/07/2026 15:03:29', 
      clientes: 2795,
      contatosDemo: [
        { nome: 'Renato', telefone: '553898744044', filial: 'MG - MONTES CLAROS', valor: 'R$ 67,90', plano: 'Vivo Controle' }
      ]
    },
    { id: 126, nome: 'CONVY - OFERTA GALAXY 26 ULTRA', data: '05/08/2026 07:37:01', clientes: 1675 },
    { id: 125, nome: 'CONVY - OFERTA GALAXY 26+', data: '04/08/2026 19:34:41', clientes: 2420 },
    { id: 72, nome: 'CONVY - OFERTA IPHONE 17', data: '05/05/2026 18:19:11', clientes: 1956 },
    { id: 127, nome: 'CONVY - OFERTA IPHONE 17 DIA DOS PAIS', data: '05/08/2026 10:01:21', clientes: 4212 }
  ]);

  const [formCampanha, setFormCampanha] = useState({
    tipo: '',
    codigo: '',
    nome: '',
    vendaConversao: 'Todas',
    descricao: '',
    numeroWhats: '5561999866400',
    templateWhats: 'oferta_upgrade',
    substituirNome: true,
    tagContatos: 'FATURA'
  });

  const [totalLeadsImportados, setTotalLeadsImportados] = useState(0);

  // Disparo pelo botão verde do WhatsApp (print image_745361.png)
  const handleDispararPelaTela = (campanha) => {
    setDisparandoId(campanha.id);

    const contatosParaEnvio = campanha.contatosDemo || [
      { nome: 'Cliente Campanha', telefone: '558699999999', filial: 'PI - TERESINA', valor: 'R$ 67,90', plano: 'Controle' }
    ];

    setTimeout(() => {
      // Carrega os chats existentes no localStorage
      const chatsSalvos = JSON.parse(localStorage.getItem('syscor_convy_chats') || '[]');

      contatosParaEnvio.forEach((contato) => {
        const horaEnvio = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Verifica se o lead já está no CRM
        const idx = chatsSalvos.findIndex(c => c.id === contato.telefone);

        const novaConversa = {
          id: contato.telefone,
          nome: contato.nome,
          tag: 'FATURA',
          filial: contato.filial,
          campanha: campanha.nome,
          horario: horaEnvio,
          online: true,
          emAtendimento: false,
          mensagens: [
            {
              id: Date.now() + Math.random(),
              autor: 'bot',
              tipo: 'template',
              texto: `Olá ${contato.nome}, sua fatura/oferta do ${contato.plano} no valor de ${contato.valor} está disponível. Deseja conferir?`,
              hora: horaEnvio
            },
            {
              id: Date.now() + Math.random() + 1,
              autor: 'cliente',
              tipo: 'texto',
              texto: 'Quero minha fatura',
              hora: horaEnvio
            }
          ]
        };

        if (idx !== -1) {
          chatsSalvos[idx] = novaConversa;
        } else {
          chatsSalvos.unshift(novaConversa);
        }
      });

      localStorage.setItem('syscor_convy_chats', JSON.stringify(chatsSalvos));
      setDisparandoId(null);

      // Leva o atendente diretamente para a interface do WhatsApp Chat
      navigate('/whatsapp-chat');
    }, 900);
  };

  const handleImportarLeads = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    try {
      const buffer = await arquivo.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const aba = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(aba, { defval: '' });
      setTotalLeadsImportados(json.length);
      alert(`${json.length} leads carregados para a campanha!`);
    } catch (err) {
      alert('Erro ao processar planilha: ' + err.message);
    }
    e.target.value = '';
  };

  const handleSalvarCampanha = () => {
    if (!formCampanha.nome) {
      alert('Preencha o nome da campanha.');
      return;
    }

    const nova = {
      id: Math.floor(Math.random() * 900) + 100,
      nome: formCampanha.nome,
      data: new Date().toLocaleString('pt-BR'),
      clientes: totalLeadsImportados || 1
    };

    setCampanhas([nova, ...campanhas]);
    setTelaAtiva('LISTA_CAMPANHAS');
  };

  const estiloInputDinamico = {
    width: '100%',
    height: 38,
    background: isDark ? 'var(--panel-2, #181329)' : '#ffffff',
    border: '1px solid var(--line, #e2e8f0)',
    borderRadius: 6,
    color: 'var(--text, #0f172a)',
    padding: '0 12px',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 48px)',
      background: 'var(--bg, #0d0d12)',
      color: 'var(--text, #ffffff)',
      padding: '24px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      fontFamily: 'Segoe UI, Tahoma, sans-serif'
    }}>

      <input
        type="file"
        ref={fileImportRef}
        onChange={handleImportarLeads}
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
      />

      {/* =================================================================== */}
      {/* 1. TELA: HUB CONVY                                                  */}
      {/* =================================================================== */}
      {telaAtiva === 'HUB' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          
          {/* Seção 1: Campanhas */}
          <div style={{
            background: 'var(--panel, #13131a)',
            border: '1px solid var(--line, #23232f)',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent, #a855f7)' }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #f3e8ff)' }}>Campanhas</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-faint, #94a3b8)', display: 'block', marginTop: 3 }}>
                  Crie campanhas para seus clientes/leads
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint, #94a3b8)' }}>
                <span style={{ fontSize: 12.5, cursor: 'pointer' }}>Avaliar</span>
                <ChevronDown size={14} />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 14,
              width: '100%'
            }}>
              <BotaoCardIcone 
                icone={<Plus size={20} />} 
                titulo="Inserir Registro" 
                onClick={() => setTelaAtiva('NOVA_CAMPANHA')} 
                isDark={isDark}
              />
              <BotaoCardIcone 
                icone={<Search size={20} />} 
                titulo="Buscar Registro" 
                onClick={() => setTelaAtiva('LISTA_CAMPANHAS')} 
                isDark={isDark}
              />
              <BotaoCardIcone 
                icone={<Eye size={20} />} 
                titulo="Ver Todos" 
                onClick={() => setTelaAtiva('LISTA_CAMPANHAS')} 
                isDark={isDark}
              />
              <BotaoCardIcone 
                icone={<HelpCircle size={20} />} 
                titulo="Ajuda" 
                onClick={() => alert('Suporte Convy: Importe listas .xlsx com DDD e dispare com templates Meta aprovados.')} 
                isDark={isDark}
              />
              <BotaoCardIcone 
                icone={<Upload size={20} />} 
                titulo="Importar Leads" 
                onClick={() => fileImportRef.current?.click()} 
                isDark={isDark}
              />
              <BotaoCardIcone 
                icone={<Users size={20} />} 
                titulo="Gerar Campanha" 
                onClick={() => setTelaAtiva('NOVA_CAMPANHA')} 
                isDark={isDark}
              />
            </div>
          </div>

          {/* Seção 2: Atendimento */}
          <div style={{
            background: 'var(--panel, #13131a)',
            border: '1px solid var(--line, #23232f)',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent, #a855f7)' }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #f3e8ff)' }}>Atendimento</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-faint, #94a3b8)', display: 'block', marginTop: 3 }}>
                  Acompanhe os atendimentos realizados ou inicie um novo contato
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint, #94a3b8)' }}>
                <span style={{ fontSize: 12.5, cursor: 'pointer' }}>Avaliar</span>
                <ChevronDown size={14} />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 14,
              width: '100%'
            }}>
              <BotaoCardIcone 
                icone={<Plus size={20} />} 
                titulo="Iniciar atendimento" 
                onClick={() => navigate('/whatsapp-chat')} 
                isDark={isDark}
              />
              <BotaoCardIcone 
                icone={<Search size={20} />} 
                titulo="Buscar Registro" 
                onClick={() => navigate('/whatsapp-chat')} 
                isDark={isDark}
              />
              <BotaoCardIcone 
                icone={<Eye size={20} />} 
                titulo="Ver Todos" 
                onClick={() => navigate('/whatsapp-chat')} 
                isDark={isDark}
              />
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* 2. TELA: LISTA DE CAMPANHAS COM BOTÕES DO PRINT                    */}
      {/* =================================================================== */}
      {telaAtiva === 'LISTA_CAMPANHAS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => setTelaAtiva('HUB')}
                style={{
                  background: 'var(--panel, #1c1c27)',
                  border: '1px solid var(--line, #2e2e3e)',
                  color: 'var(--text, #fff)',
                  borderRadius: 8,
                  padding: 8,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--accent, #a855f7)' }}>
                Lista de Campanhas
              </h2>
            </div>

            <button
              onClick={() => setTelaAtiva('NOVA_CAMPANHA')}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}
            >
              <Plus size={16} /> Inserir Registro
            </button>
          </div>

          <div style={{
            background: 'var(--panel, #13131a)',
            border: '1px solid var(--line, #23232f)',
            borderRadius: 12,
            overflow: 'hidden',
            width: '100%'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{
                  background: isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.04)',
                  borderBottom: '1px solid var(--line, #23232f)',
                  color: 'var(--accent, #c084fc)',
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '14px 18px', width: 70 }}>Nº</th>
                  <th style={{ padding: '14px 18px' }}>NOME DA CAMPANHA ▲</th>
                  <th style={{ padding: '14px 18px' }}>DATA DA CAMPANHA</th>
                  <th style={{ padding: '14px 18px' }}>QTDE. CLIENTES</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', width: 150 }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--line, #1c1c26)' }}>
                    <td style={{ padding: '14px 18px', color: 'var(--text-faint, #94a3b8)' }}>{c.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{c.nome}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-dim, #cbd5e1)' }}>{c.data}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{c.clientes}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {/* Três botões fiéis à imagem: Editar, Arquivo e Disparar WhatsApp */}
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button 
                          title="Editar Campanha"
                          style={{
                            background: isDark ? '#1a1824' : '#f1f5f9',
                            border: '1px solid #332d4a',
                            color: '#60a5fa',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={14} />
                        </button>

                        <button 
                          title="Arquivo / Base"
                          style={{
                            background: isDark ? '#1a1824' : '#f1f5f9',
                            border: '1px solid #332d4a',
                            color: 'var(--text-faint, #94a3b8)',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                        >
                          <FileText size={14} />
                        </button>

                        {/* Botão Verde de Disparo e Entrada no Chat */}
                        <button 
                          onClick={() => handleDispararPelaTela(c)}
                          disabled={disparandoId === c.id}
                          title="Disparar no WhatsApp e Carregar no Chat"
                          style={{
                            background: isDark ? '#1a1824' : '#f1f5f9',
                            border: '1px solid #332d4a',
                            color: '#22c55e',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {disparandoId === c.id ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <MessageCircle size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* 3. TELA: CADASTRO DE CAMPANHA                                      */}
      {/* =================================================================== */}
      {telaAtiva === 'NOVA_CAMPANHA' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => setTelaAtiva('HUB')}
              style={{
                background: 'var(--panel, #1c1c27)',
                border: '1px solid var(--line, #2e2e3e)',
                color: 'var(--text, #fff)',
                borderRadius: 8,
                padding: 8,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--accent, #a855f7)' }}>
                Cadastro de Campanha
              </h2>
              <span style={{ fontSize: 13, color: 'var(--text-faint, #94a3b8)' }}>
                Preencha os dados e salve para aplicar as alterações.
              </span>
            </div>
          </div>

          <div style={{
            background: 'var(--panel, #13131a)',
            border: '1px solid var(--line, #23232f)',
            borderRadius: 12,
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent, #a855f7)' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent, #e9d5ff)', textTransform: 'uppercase' }}>CADASTRO</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Tipo:</label>
                  <select 
                    value={formCampanha.tipo}
                    onChange={(e) => setFormCampanha({ ...formCampanha, tipo: e.target.value })}
                    style={estiloInputDinamico}
                  >
                    <option value="">Escolha...</option>
                    <option value="PRE">PRÉ-PAGO</option>
                    <option value="CONTROLE">CONTROLE</option>
                    <option value="POS">PÓS-PAGO</option>
                    <option value="FIBRA">VIVO FIBRA</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Código:</label>
                  <input 
                    type="text" 
                    value={formCampanha.codigo}
                    onChange={(e) => setFormCampanha({ ...formCampanha, codigo: e.target.value })}
                    style={estiloInputDinamico} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Nome:</label>
                  <input 
                    type="text" 
                    value={formCampanha.nome}
                    onChange={(e) => setFormCampanha({ ...formCampanha, nome: e.target.value })}
                    placeholder="Ex: CONVY - OFERTA IPHONE 18"
                    style={estiloInputDinamico} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                    Venda conversão: <HelpCircle size={13} color="var(--accent, #a855f7)" style={{ verticalAlign: 'middle' }} />
                  </label>
                  <select 
                    value={formCampanha.vendaConversao}
                    onChange={(e) => setFormCampanha({ ...formCampanha, vendaConversao: e.target.value })}
                    style={estiloInputDinamico}
                  >
                    <option value="Todas">Todas</option>
                    <option value="Movel">Móvel</option>
                    <option value="Fixa">Fixa</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Descrição:</label>
                  <textarea 
                    rows={3}
                    value={formCampanha.descricao}
                    onChange={(e) => setFormCampanha({ ...formCampanha, descricao: e.target.value })}
                    style={{ ...estiloInputDinamico, height: 'auto', padding: '12px' }} 
                  />
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent, #a855f7)' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent, #e9d5ff)', textTransform: 'uppercase' }}>WHATSAPP</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Número:</label>
                  <select 
                    value={formCampanha.numeroWhats}
                    onChange={(e) => setFormCampanha({ ...formCampanha, numeroWhats: e.target.value })}
                    style={estiloInputDinamico}
                  >
                    <option value="5561999866400">5561999866400 (Instância Oficial 4R)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Template:</label>
                  <select 
                    value={formCampanha.templateWhats}
                    onChange={(e) => setFormCampanha({ ...formCampanha, templateWhats: e.target.value })}
                    style={estiloInputDinamico}
                  >
                    <option value="oferta_upgrade">oferta_upgrade (Aprovado)</option>
                    <option value="aviso_fatura">aviso_fatura (Aprovado)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Parâmetro:</label>
                  <div style={{
                    ...estiloInputDinamico,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                  onClick={() => setFormCampanha({ ...formCampanha, substituirNome: !formCampanha.substituirNome })}
                  >
                    <input 
                      type="checkbox" 
                      checked={formCampanha.substituirNome}
                      onChange={(e) => setFormCampanha({ ...formCampanha, substituirNome: e.target.checked })}
                    />
                    <span style={{ fontSize: 13 }}>Substituir pelo nome do cliente</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                    Tag p/ contatos: <HelpCircle size={13} color="var(--accent, #a855f7)" style={{ verticalAlign: 'middle' }} />
                  </label>
                  <select 
                    value={formCampanha.tagContatos}
                    onChange={(e) => setFormCampanha({ ...formCampanha, tagContatos: e.target.value })}
                    style={estiloInputDinamico}
                  >
                    <option value="FATURA">FATURA</option>
                    <option value="LEAD_NOVO">LEAD_NOVO</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => fileImportRef.current?.click()}
                style={{
                  background: 'var(--panel-2, #1f1f2e)',
                  border: '1px solid var(--line, #38384f)',
                  color: 'var(--text, #fff)',
                  borderRadius: 8,
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Upload size={16} /> Importar Planilha de Leads
              </button>

              <button
                type="button"
                onClick={handleSalvarCampanha}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)'
                }}
              >
                <Check size={16} /> Salvar Campanha
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function BotaoCardIcone({ icone, titulo, onClick, isDark }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isDark ? 'var(--panel-2, #171722)' : '#ffffff',
        border: '1px solid var(--line, #282837)',
        borderRadius: 10,
        padding: '18px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent, #a855f7)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line, #282837)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 10,
        background: 'rgba(168, 85, 247, 0.15)',
        color: 'var(--accent, #f472b6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icone}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text, #e2e8f0)', lineHeight: 1.2 }}>
        {titulo}
      </span>
    </div>
  );
}