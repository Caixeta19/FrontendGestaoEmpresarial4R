import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Eye, 
  HelpCircle, 
  ArrowLeft, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Play, 
  UserCheck, 
  ShoppingCart,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../components/ToastContext.jsx';
import { clientesDemo, PDVS } from '../data/demoData';

export default function Clientes({ onVoltar, etapaInicial = 'MENU' }) {
  const navigate = useNavigate();
  const showToast = useToast();

  // 'HUB' | 'CADASTRO' | 'BUSCA' | 'LISTA'
  const [visualizacaoAtual, setVisualizacaoAtual] = useState(() => {
    if (etapaInicial === 'INSERIR') return 'CADASTRO';
    if (etapaInicial === 'BUSCAR') return 'BUSCA';
    return 'HUB';
  });

  const [seccaoAberta, setSeccaoAberta] = useState(true);
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [docFeedback, setDocFeedback] = useState({ text: '', color: '' });

  // Base Dinâmica de Clientes
  const [listaClientes, setListaClientes] = useState(() => {
    const salvos = localStorage.getItem('syscor_clientes');
    if (salvos) {
      try { return JSON.parse(salvos); } catch {}
    }
    return (clientesDemo || []).map(c => ({
      id: String(c.id || Math.floor(Math.random() * 90000) + 10000),
      nome: c.nome || '',
      doc: c.doc || c.documento || c.cpf || c.cnpj || '—',
      celular: c.celular || c.telefone || '—',
      telefone: c.telefone || '—',
      email: c.email || '—',
      pdv: c.pdv || 'CE - CANINDE',
      cidade: c.cidade || 'Luziânia',
      estado: c.estado || 'GO',
      dataCadastro: c.data || '25/09/2026'
    }));
  });

  // Formulário de Cadastro / Edição
  const [clienteEdicaoId, setClienteEdicaoId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    doc: '',
    celular: '',
    telefone: '',
    email: '',
    pdv: 'CE - CANINDE',
    // Endereço Principal
    cep: '',
    estado: 'GO',
    cidade: 'Luziânia',
    rua: '',
    bairro: '',
    numero: '',
    semNumero: false,
    complemento: '',
    zonaRural: false,
    // Dados Complementares
    contatoNome: '',
    contatoEmail: '',
    observacao: '',
    restricao: 'Não',
    receberMensagens: 'Sim',
    origemCadastro: 'Loja Física',
    scoreCliente: '',
    vencimentoFatura: 'Dia 01'
  });

  // Formulário de Busca
  const [filtrosBusca, setFiltrosBusca] = useState({
    nome: '',
    documento: '',
    telefone: '',
    pdv: 'Todos'
  });

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 10;

  function validarDoc(value) {
    setFormData(prev => ({ ...prev, doc: value }));
    const v = value.replace(/\D/g, '');
    if (v.length === 0) setDocFeedback({ text: '', color: '' });
    else if (v.length === 11) setDocFeedback({ text: 'CPF em formato válido.', color: 'var(--good, #22c55e)' });
    else if (v.length === 14) setDocFeedback({ text: 'CNPJ em formato válido.', color: 'var(--good, #22c55e)' });
    else setDocFeedback({ text: 'Documento incompleto.', color: 'var(--warn, #eab308)' });
  }

  // Filtragem Dinâmica
  const clientesFiltrados = useMemo(() => {
    return listaClientes.filter(c => {
      if (filtrosBusca.pdv !== 'Todos' && c.pdv && c.pdv.toUpperCase() !== filtrosBusca.pdv.toUpperCase()) {
        return false;
      }
      if (filtrosBusca.documento) {
        const docBusca = filtrosBusca.documento.replace(/\D/g, '');
        const docItem = String(c.doc || '').replace(/\D/g, '');
        if (docBusca && !docItem.includes(docBusca)) return false;
      }
      if (filtrosBusca.nome) {
        const nomeBusca = filtrosBusca.nome.toLowerCase().trim();
        if (!String(c.nome || '').toLowerCase().includes(nomeBusca)) return false;
      }
      if (filtrosBusca.telefone) {
        const telBusca = filtrosBusca.telefone.replace(/\D/g, '');
        const telItem = String(c.celular || c.telefone || '').replace(/\D/g, '');
        if (telBusca && !telItem.includes(telBusca)) return false;
      }
      return true;
    });
  }, [listaClientes, filtrosBusca]);

  const totalRegistos = clientesFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistos / ITENS_POR_PAGINA) || 1;
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = Math.min(indiceInicial + ITENS_POR_PAGINA, totalRegistos);
  const itensPaginaAtual = clientesFiltrados.slice(indiceInicial, indiceFinal);

  const handleIniciarNovoCliente = () => {
    setClienteEdicaoId(null);
    setFormData({
      nome: '',
      doc: '',
      celular: '',
      telefone: '',
      email: '',
      pdv: 'CE - CANINDE',
      cep: '',
      estado: 'GO',
      cidade: 'Luziânia',
      rua: '',
      bairro: '',
      numero: '',
      semNumero: false,
      complemento: '',
      zonaRural: false,
      contatoNome: '',
      contatoEmail: '',
      observacao: '',
      restricao: 'Não',
      receberMensagens: 'Sim',
      origemCadastro: 'Loja Física',
      scoreCliente: '',
      vencimentoFatura: 'Dia 01'
    });
    setDocFeedback({ text: '', color: '' });
    setVisualizacaoAtual('CADASTRO');
  };

  const handleEditarCliente = (c) => {
    setClienteEdicaoId(c.id);
    setFormData({
      nome: c.nome || '',
      doc: c.doc || '',
      celular: c.celular !== '—' ? c.celular : '',
      telefone: c.telefone !== '—' ? c.telefone : '',
      email: c.email !== '—' ? c.email : '',
      pdv: c.pdv || 'CE - CANINDE',
      cep: c.cep || '',
      estado: c.estado || 'GO',
      cidade: c.cidade || 'Luziânia',
      rua: c.rua || '',
      bairro: c.bairro || '',
      numero: c.numero || '',
      semNumero: c.semNumero || false,
      complemento: c.complemento || '',
      zonaRural: c.zonaRural || false,
      contatoNome: c.contatoNome || '',
      contatoEmail: c.contatoEmail || '',
      observacao: c.observacao || '',
      restricao: c.restricao || 'Não',
      receberMensagens: c.receberMensagens || 'Sim',
      origemCadastro: c.origemCadastro || 'Loja Física',
      scoreCliente: c.scoreCliente || '',
      vencimentoFatura: c.vencimentoFatura || 'Dia 01'
    });
    validarDoc(c.doc || '');
    setVisualizacaoAtual('CADASTRO');
  };

  const handleSalvarCliente = (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.doc.trim()) {
      alert('Preencha ao menos o Nome completo e o CPF/CNPJ.');
      return;
    }

    let novaLista = [...listaClientes];

    if (clienteEdicaoId) {
      novaLista = novaLista.map(item => {
        if (item.id === clienteEdicaoId) {
          return {
            ...item,
            ...formData,
            id: clienteEdicaoId
          };
        }
        return item;
      });
      if (showToast) showToast('Cliente atualizado com sucesso.');
      else alert('Cliente atualizado com sucesso!');
    } else {
      const novoReg = {
        ...formData,
        id: String(Math.floor(Math.random() * 90000) + 10000),
        dataCadastro: new Date().toLocaleDateString('pt-BR')
      };
      novaLista = [novoReg, ...novaLista];
      if (showToast) showToast('Cliente cadastrado com sucesso.');
      else alert(`Cliente ${novoReg.nome} cadastrado com sucesso!`);
    }

    setListaClientes(novaLista);
    localStorage.setItem('syscor_clientes', JSON.stringify(novaLista));
    setVisualizacaoAtual('LISTA');
  };

  const handleRemoverCliente = (id) => {
    if (window.confirm('Tem certeza que deseja excluir o cadastro deste cliente?')) {
      const novaLista = listaClientes.filter(c => c.id !== id);
      setListaClientes(novaLista);
      localStorage.setItem('syscor_clientes', JSON.stringify(novaLista));
      if (showToast) showToast('Cliente removido com sucesso.');
    }
  };

  const handleLancarVendaComCliente = (c) => {
    sessionStorage.setItem('syscor_venda_edicao', JSON.stringify({
      cliente: c.nome,
      clienteDoc: c.doc
    }));
    navigate('/venda');
  };

  const handleExecutarBusca = (e) => {
    e.preventDefault();
    setMensagemErro('');

    const docLimpo = filtrosBusca.documento.trim().replace(/\D/g, '');
    const nomeBusca = filtrosBusca.nome.trim();

    if (!docLimpo && !nomeBusca && !filtrosBusca.telefone && filtrosBusca.pdv === 'Todos') {
      setMensagemErro('Preencha ao menos um filtro para pesquisar.');
      return;
    }

    setPaginaAtual(1);
    setVisualizacaoAtual('LISTA');
  };

  // =========================================================================
  // 1. TELA: HUB PRINCIPAL (PADRÃO DOS CARDS COLAPSÁVEIS COM 4 BOTÕES)
  // =========================================================================
  if (visualizacaoAtual === 'HUB') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={cardEstilo}>
          <div style={topoCardEstilo}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>
                  Clientes / Leads
                </h2>
              </div>
              <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>
                Inclusão e alteração das informações dos clientes e leads.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSeccaoAberta(!seccaoAberta)}
              style={botaoAvaliarEstilo}
            >
              <span>Avaliar</span>
              {seccaoAberta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {seccaoAberta && (
            <div style={conteudoAbertoEstilo}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                
                {/* Botão 1: Inserir Registro */}
                <button
                  type="button"
                  onClick={handleIniciarNovoCliente}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <PlusCircle size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Inserir Registro</b>
                </button>

                {/* Botão 2: Buscar Registro */}
                <button
                  type="button"
                  onClick={() => { setMensagemErro(''); setVisualizacaoAtual('BUSCA'); }}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <Search size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Buscar Registro</b>
                </button>

                {/* Botão 3: Ver Todos */}
                <button
                  type="button"
                  onClick={() => {
                    setFiltrosBusca({ nome: '', documento: '', telefone: '', pdv: 'Todos' });
                    setPaginaAtual(1);
                    setVisualizacaoAtual('LISTA');
                  }}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <Eye size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Ver Todos</b>
                </button>

                {/* Botão 4: Ajuda */}
                <button
                  type="button"
                  onClick={() => setModalAjudaAberto(true)}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <HelpCircle size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Ajuda</b>
                </button>

              </div>
            </div>
          )}
        </div>

        {/* Modal Ajuda */}
        {modalAjudaAberto && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, maxWidth: 460, width: '90%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ margin: 0, color: 'var(--text)' }}>Ajuda — Módulo de Clientes</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
                Cadastre e consulte os dados completos de clientes e leads (Pessoa Física ou Jurídica). Ao localizar um cliente na listagem, você pode acionar diretamente o lançamento de venda associado ou editar os dados cadastrais.
              </p>
              <button
                type="button"
                onClick={() => setModalAjudaAberto(false)}
                style={{ alignSelf: 'flex-end', background: 'var(--accent, #c026d3)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. TELA: BUSCAR REGISTRO
  // =========================================================================
  if (visualizacaoAtual === 'BUSCA') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '24px 28px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('HUB')}
                title="Voltar ao Painel"
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f472b6' }}>
                Busca de Clientes / Leads
              </h1>
            </div>
          </div>

          {mensagemErro && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
              borderRadius: 8, fontSize: 13.5, fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.15)', color: 'var(--bad, #ef4444)', border: '1px solid var(--bad, #ef4444)'
            }}>
              <AlertTriangle size={18} />
              <span>{mensagemErro}</span>
            </div>
          )}

          <form onSubmit={handleExecutarBusca} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640 }}>
            {/* Nome */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Nome Completo:</label>
              <input
                type="text"
                placeholder="Digite o nome do cliente..."
                value={filtrosBusca.nome}
                onChange={(e) => setFiltrosBusca({ ...filtrosBusca, nome: e.target.value })}
                style={inputEstiloFormulario}
              />
            </div>

            {/* CPF / CNPJ */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>CPF / CNPJ:</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={filtrosBusca.documento}
                onChange={(e) => setFiltrosBusca({ ...filtrosBusca, documento: e.target.value })}
                style={{ ...inputEstiloFormulario, maxWidth: 280 }}
              />
            </div>

            {/* Telefone */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Telefone / Celular:</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={filtrosBusca.telefone}
                onChange={(e) => setFiltrosBusca({ ...filtrosBusca, telefone: e.target.value })}
                style={{ ...inputEstiloFormulario, maxWidth: 280 }}
              />
            </div>

            {/* PDV */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>PDV / Loja:</label>
              <select
                value={filtrosBusca.pdv}
                onChange={(e) => setFiltrosBusca({ ...filtrosBusca, pdv: e.target.value })}
                style={{ ...inputEstiloFormulario, maxWidth: 300 }}
              >
                <option value="Todos">Todos</option>
                {(PDVS || []).map(p => (
                  <option key={p.id} value={p.codigo}>{p.codigo} — {p.nome}</option>
                ))}
              </select>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('HUB')}
                style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Search size={15} /> Pesquisar Clientes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. TELA: LISTA GERAL ("VER TODOS")
  // =========================================================================
  if (visualizacaoAtual === 'LISTA') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '20px 24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Topo com os 5 botões de navegação */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#f472b6' }}>
                Lista de Clientes / Leads
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setVisualizacaoAtual('HUB')} style={botaoBarraSuperior}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Voltar</span>
                <ArrowLeft size={18} />
              </button>

              <button type="button" onClick={() => setModalAjudaAberto(true)} style={{ ...botaoBarraSuperior, background: '#7e22ce', color: '#fff' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ajuda</span>
                <HelpCircle size={18} />
              </button>

              <button 
                type="button" 
                onClick={() => { setFiltrosBusca({ nome: '', documento: '', telefone: '', pdv: 'Todos' }); setPaginaAtual(1); }}
                style={{ ...botaoBarraSuperior, background: '#581c87', color: '#fff' }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ver Todos</span>
                <Eye size={18} />
              </button>

              <button type="button" onClick={() => setVisualizacaoAtual('BUSCA')} style={{ ...botaoBarraSuperior, background: 'var(--panel-2)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Buscar Registro</span>
                <Search size={18} color="var(--accent)" />
              </button>

              <button type="button" onClick={handleIniciarNovoCliente} style={{ ...botaoBarraSuperior, background: '#4d7c0f', color: '#fff' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Inserir Registro</span>
                <PlusCircle size={18} />
              </button>
            </div>
          </div>

          {/* Tabela de Clientes */}
          <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 11.5 }}>
                  <th style={{ padding: '12px 14px', width: '8%' }}>Nº</th>
                  <th style={{ padding: '12px 14px', width: '28%' }}>Nome / Razão Social</th>
                  <th style={{ padding: '12px 14px', width: '18%' }}>CPF / CNPJ</th>
                  <th style={{ padding: '12px 14px', width: '15%' }}>Telefone / Celular</th>
                  <th style={{ padding: '12px 14px', width: '18%' }}>PDV / Cidade</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', width: '13%' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensPaginaAtual.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px 14px', color: 'var(--text-faint)' }}>
                      Nenhum cliente encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  itensPaginaAtual.map((c) => (
                    <tr 
                      key={c.id} 
                      style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--panel)'}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{c.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{c.nome}</td>
                      <td style={{ padding: '12px 14px' }} className="mono">{c.doc}</td>
                      <td style={{ padding: '12px 14px' }}>{c.celular || c.telefone}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-faint)' }}>
                        {c.pdv || `${c.cidade || '—'} / ${c.estado || '—'}`}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleLancarVendaComCliente(c)}
                            title="Iniciar Venda com este Cliente"
                            style={{ background: 'transparent', border: 'none', color: '#22c55e', cursor: 'pointer', padding: 4 }}
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditarCliente(c)}
                            title="Editar Cliente"
                            style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 4 }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoverCliente(c.id)}
                            title="Excluir Cliente"
                            style={{ background: 'transparent', border: 'none', color: 'var(--bad, #ef4444)', cursor: 'pointer', padding: 4 }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação Roxa Oficial */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#581c87', color: '#ffffff', borderRadius: 4, overflow: 'hidden', fontSize: 12.5 }}>
              <span style={{ padding: '6px 14px', fontWeight: 600 }}>
                total: {totalRegistos} registro(s), visualizando de {totalRegistos === 0 ? 0 : indiceInicial + 1} até {indiceFinal}.
              </span>
              <button
                type="button"
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 10px' }}
              >
                <Play size={10} style={{ transform: 'rotate(180deg)', fill: 'currentColor' }} />
              </button>
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  onClick={() => setPaginaAtual(i + 1)}
                  style={{ background: paginaAtual === i + 1 ? '#7e22ce' : 'transparent', border: 'none', color: '#fff', fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 10px' }}
              >
                <Play size={10} style={{ fill: 'currentColor' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. TELA: INSERIR / EDITAR REGISTRO COMPLETO (DETALHE)
  // =========================================================================
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '24px 28px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}>
        {/* Topo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => setVisualizacaoAtual('HUB')}
              title="Voltar ao Painel"
              style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f472b6' }}>
              {clienteEdicaoId ? `Editar Cliente #${clienteEdicaoId}` : 'Cadastro de Cliente / Lead'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSalvarCliente} style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', boxSizing: 'border-box' }}>
          
          {/* DADOS PRINCIPAIS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nome completo / Razão Social:</label>
              <input 
                type="text" 
                placeholder="Nome do cliente" 
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                style={inputEstiloFormulario}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>CPF / CNPJ:</label>
              <input 
                type="text" 
                placeholder="000.000.000-00" 
                value={formData.doc} 
                onChange={(e) => validarDoc(e.target.value)} 
                style={inputEstiloFormulario}
                required
              />
              <small style={{ fontSize: 11.5, color: docFeedback.color || 'var(--text-faint)', marginTop: 2 }}>
                {docFeedback.text}
              </small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>E-mail:</label>
              <input 
                type="email" 
                placeholder="cliente@email.com" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={inputEstiloFormulario}
              />
            </div>
          </div>

          {/* SEÇÃO: ENDEREÇO PRINCIPAL */}
          <div style={{ background: 'var(--panel-2)', padding: 18, borderRadius: 8, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 14, margin: 0, color: 'var(--text)', fontWeight: 700, borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
              Endereço Principal
            </h3>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>CEP:</label>
                <input 
                  type="text" 
                  placeholder="00000-000" 
                  value={formData.cep}
                  onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                  style={inputEstiloFormulario}
                />
              </div>
              <button 
                type="button" 
                onClick={() => alert('Consulta de CEP simulada!')}
                style={{ background: 'var(--accent, #c026d3)', color: '#fff', border: 'none', height: 36, padding: '0 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Procurar CEP
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Estado (UF):</label>
                <select 
                  value={formData.estado}
                  onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                  style={inputEstiloFormulario}
                >
                  <option value="GO">GO</option>
                  <option value="DF">DF</option>
                  <option value="SP">SP</option>
                  <option value="CE">CE</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Cidade:</label>
                <input 
                  type="text" 
                  value={formData.cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  style={inputEstiloFormulario}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Rua:</label>
                <input 
                  type="text" 
                  placeholder="Nome da rua / avenida" 
                  value={formData.rua}
                  onChange={(e) => setFormData(prev => ({ ...prev, rua: e.target.value }))}
                  style={inputEstiloFormulario}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Bairro:</label>
                <input 
                  type="text" 
                  placeholder="Bairro" 
                  value={formData.bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  style={inputEstiloFormulario}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Nº:</label>
                <input 
                  type="text" 
                  placeholder="Nº" 
                  disabled={formData.semNumero}
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                  style={{ ...inputEstiloFormulario, opacity: formData.semNumero ? 0.5 : 1 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, margin: 0, color: 'var(--text)' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.semNumero}
                    onChange={(e) => setFormData(prev => ({ ...prev, semNumero: e.target.checked }))}
                  />
                  <span>Sem número</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Complemento:</label>
              <input 
                type="text" 
                placeholder="Apto, Bloco, Quadra..." 
                value={formData.complemento}
                onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                style={inputEstiloFormulario}
              />
            </div>
          </div>

          {/* SEÇÃO: DADOS COMPLEMENTARES */}
          <div style={{ background: 'var(--panel-2)', padding: 18, borderRadius: 8, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 14, margin: 0, color: 'var(--text)', fontWeight: 700, borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
              Dados Complementares
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Celular:</label>
                <input 
                  type="text" 
                  placeholder="(61) 90000-0000" 
                  value={formData.celular}
                  onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                  style={inputEstiloFormulario}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Telefone:</label>
                <input 
                  type="text" 
                  placeholder="(61) 3000-0000" 
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  style={inputEstiloFormulario}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Observações:</label>
              <textarea 
                rows={3}
                placeholder="Observações adicionais sobre o cliente..."
                value={formData.observacao}
                onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                style={{ ...inputEstiloFormulario, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Rodapé de Ações */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <button 
              type="button" 
              onClick={() => setVisualizacaoAtual('HUB')}
              style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar
            </button>

            <button 
              type="submit" 
              style={{ 
                background: '#84cc16', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '8px 24px', 
                fontWeight: 700, 
                fontSize: 13.5, 
                cursor: 'pointer' 
              }}
            >
              Salvar cliente <Check size={16} strokeWidth={3} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Estilos Reutilizáveis
const cardEstilo = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: '16px 24px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  transition: 'background 0.2s ease, border-color 0.2s ease'
};

const topoCardEstilo = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const botaoAvaliarEstilo = {
  background: 'var(--input-bg)',
  border: '1px solid var(--line)',
  borderRadius: 20,
  color: 'var(--text)',
  padding: '6px 16px',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s ease'
};

const conteudoAbertoEstilo = {
  paddingTop: 16,
  marginTop: 14,
  borderTop: '1px solid var(--line)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12
};

const botaoQuadradoEstilo = {
  background: 'var(--panel-2)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '24px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  cursor: 'pointer',
  color: 'var(--text)',
  minWidth: 125,
  transition: 'transform 0.15s ease, border-color 0.15s ease'
};

const iconeWrapperEstilo = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: 'rgba(192, 38, 211, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--accent, #c026d3)'
};

const botaoBarraSuperior = {
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '8px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  cursor: 'pointer',
  minWidth: 85,
  background: 'var(--panel)',
  color: 'var(--text)',
  transition: 'all 0.15s ease'
};

const inputEstiloFormulario = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #382b4f)',
  color: 'var(--text, #ffffff)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};