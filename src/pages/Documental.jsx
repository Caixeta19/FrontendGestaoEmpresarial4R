import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  ChevronRight, 
  XSquare, 
  ArrowLeft, 
  Check, 
  AlertTriangle,
  FileEdit
} from 'lucide-react';
import { VENDEDORES, PDVS } from '../data/demoData';

const LISTA_MOTIVOS_CANCELAMENTO = [
  'Acesso incorreto',
  'Duplicidade',
  'Fluxo com aquisição',
  'Lançamento incorreto',
  'Prazo na habilitação',
  'Venda não encontrada',
  'Outro',
  'Baixa Prematura',
  'Cliente Inelegível',
  'Downgrade',
  'Inversão de Titularidade',
  'MD',
  'Abaixo do Piso',
  'Serviço não remunerado',
  'MN',
  'SVA não ativo',
  'Desconto Indevido',
  'Submetida/Enviada',
  'Motivo Cliente',
  'Motivo Erro na Venda',
  'Técnico',
  'Operacional'
];

const LISTA_DIAS_VENCIMENTO = ['01', '06', '10', '15', '17', '21', '26', '28'];

const inputStyleVisivel = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #475569)',
  color: 'var(--text, #f1eef7)',
  borderRadius: '6px',
  outline: 'none',
  padding: '8px 12px',
  transition: 'border-color 0.15s ease',
  boxSizing: 'border-box'
};

export default function Documental() {
  const navigate = useNavigate();

  // 'MENU' | 'BUSCA' | 'DETALHE'
  const [etapa, setEtapa] = useState('MENU');
  const [mensagemErro, setMensagemErro] = useState('');
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  const [filtrosBusca, setFiltrosBusca] = useState({
    periodoInicio: '',
    periodoFim: '',
    dataInstalacaoInicio: '',
    dataInstalacaoFim: '',
    pdv: 'TODOS',
    liderEquipe: '',
    vendedor: 'TODOS',
    numeroVenda: '',
    numeroProtocoloGed: '',
    numeroSolicitacao360: '',
    numeroAcesso: '',
    numeroPortabilidade: ''
  });

  const [formData, setFormData] = useState({
    vendaId: '',
    quantidade: 1,
    servico: '',
    plano: '',
    cliente: '',
    vendedor: '',
    dataVenda: '',
    numeroAcesso: '',
    dataAtivacao: '',
    zerarRemuneracao: 'nao',
    gerarPrice: 'sim',
    dataDigitalizacao: '',
    numeroProtocoloGed: '',
    vencimento: '17',
    statusBko: 'Nao avaliado',
    liderEquipe: '',
    observacoes: '',
    observacoesImportacao: '',
    situacaoServico: 'Confirmado',
    gerarComissao: 'Sim',
    motivosCancelamento: []
  });

  const handleFiltroChange = (campo, valor) => {
    setFiltrosBusca(prev => ({ ...prev, [campo]: valor }));
    if (mensagemErro) setMensagemErro('');
  };

  const handleIniciarNovoRegistro = () => {
    setFormData({
      vendaId: String(Date.now()).slice(-6),
      quantidade: 1,
      servico: 'Alta - Controle',
      plano: 'Plano Vivo Controle',
      cliente: 'Consumidor Final',
      vendedor: 'VENDEDOR DA LOJA',
      dataVenda: new Date().toLocaleDateString('pt-BR'),
      numeroAcesso: '',
      dataAtivacao: new Date().toISOString().split('T')[0],
      zerarRemuneracao: 'nao',
      gerarPrice: 'sim',
      dataDigitalizacao: '',
      numeroProtocoloGed: '',
      vencimento: '17',
      statusBko: 'Nao avaliado',
      liderEquipe: '',
      observacoes: '',
      observacoesImportacao: '',
      situacaoServico: 'Confirmado',
      gerarComissao: 'Sim',
      motivosCancelamento: []
    });
    setEtapa('DETALHE');
  };

  // ==========================================================================
  // BUSCA DINÂMICA COM TRATAMENTO PRECISO DE SERVIÇO, PLANO E LINHA
  // ==========================================================================
  const handleExecutarBusca = async (e) => {
    e.preventDefault();
    setMensagemErro('');

    const vendaDigitada = filtrosBusca.numeroVenda.trim();
    const acessoDigitado = filtrosBusca.numeroAcesso.trim().replace(/\D/g, '');

    if (!vendaDigitada && !acessoDigitado && !filtrosBusca.numeroProtocoloGed) {
      setMensagemErro('Informe ao menos o Nº da Venda ou Nº de Acesso para pesquisar.');
      return;
    }

    let vendaEncontrada = null;

    try {
      const res = await fetch('http://localhost:8080/api/v1/vendas');
      if (res.ok) {
        const vendasBackend = await res.json();
        vendaEncontrada = (vendasBackend || []).find(v => {
          const numVendaLimpo = String(v.numeroVenda || v.numeroPedido || v.id || '').replace(/\D/g, '');
          const buscaLimpa = vendaDigitada.replace(/\D/g, '');
          if (buscaLimpa && numVendaLimpo.endsWith(buscaLimpa)) return true;

          if (acessoDigitado && v.itens) {
            return v.itens.some(item =>
              String(item.numeroAcesso || item.telefone || item.msisdn || item.linha || '')
                .replace(/\D/g, '')
                .includes(acessoDigitado)
            );
          }
          return false;
        });
      }
    } catch {
      // Ignora e tenta local
    }

    if (!vendaEncontrada) {
      const vendasLocais = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
      const protocolosSalvos = JSON.parse(localStorage.getItem('syscor_protocolos') || '{}');

      if (vendaDigitada && protocolosSalvos[vendaDigitada]) {
        setFormData(protocolosSalvos[vendaDigitada]);
        setEtapa('DETALHE');
        return;
      }

      vendaEncontrada = vendasLocais.find(v => {
        const numVendaLimpo = String(v.numeroVenda || v.numeroPedido || v.id || '').replace(/\D/g, '');
        const buscaLimpa = vendaDigitada.replace(/\D/g, '');
        return buscaLimpa && (numVendaLimpo === buscaLimpa || numVendaLimpo.endsWith(buscaLimpa));
      });
    }

    if (vendaEncontrada) {
      const itens = vendaEncontrada.itens || [];
      
      // Procura primeiro item de serviço; se não tiver, pega o de produto
      const itemServico = itens.find(it => it.categoria === 'SERVICO_VIVO');
      const itemProduto = itens.find(it => it.categoria === 'PRODUTO_VIVO');
      const itemGenerico = itens[0] || {};

      // 1. Serviço:
      let servicoFormatado = 'Venda Avulsa';
      if (itemServico?.detalhes?.servico) {
        servicoFormatado = itemServico.detalhes.servico;
      } else if (itemProduto) {
        servicoFormatado = itemProduto.detalhes?.servico || 'Venda de Aparelho';
      } else if (itemServico) {
        servicoFormatado = 'Serviço Vivo';
      }

      // 2. Plano:
      let planoFormatado = 'Sem Plano Vinculado';
      if (itemServico?.detalhes?.planoNovo) {
        planoFormatado = itemServico.detalhes.planoNovo;
      } else if (itemProduto?.detalhes?.planoAtivo) {
        planoFormatado = itemProduto.detalhes.planoAtivo;
      } else if (itemProduto) {
        planoFormatado = `Aparelho: ${itemProduto.descricao}`;
      } else if (itemGenerico.descricao) {
        planoFormatado = itemGenerico.descricao;
      }

      // 3. Cliente:
      const clienteNome = vendaEncontrada.cliente || 'Cliente Balcão';
      const clienteDoc = vendaEncontrada.clienteDoc && vendaEncontrada.clienteDoc !== '—' 
        ? ` - CPF: ${vendaEncontrada.clienteDoc}` 
        : '';
      const clienteFormatado = `${clienteNome}${clienteDoc}`;

      // 4. Vendedor:
      const vendedorReal = 
        vendaEncontrada.vendedorNome || 
        vendaEncontrada.usuario?.nome || 
        vendaEncontrada.vendedor || 
        'Vendedor Não Identificado';

      // 5. Número de Acesso:
      let numeroAcessoReal = filtrosBusca.numeroAcesso || '';
      if (!numeroAcessoReal) {
        if (itemServico?.detalhes?.linha) {
          numeroAcessoReal = itemServico.detalhes.linha;
        } else if (itemProduto?.detalhes?.numeroLinha) {
          numeroAcessoReal = itemProduto.detalhes.numeroLinha;
        } else if (itemServico?.numeroLinha) {
          numeroAcessoReal = itemServico.numeroLinha;
        } else if (itemProduto?.numeroLinha && itemProduto.numeroLinha !== 'S/N') {
          numeroAcessoReal = itemProduto.numeroLinha;
        }
      }
      // Se tiver caído valor como "S" ou "S/N", limpa
      if (numeroAcessoReal === 'S' || numeroAcessoReal === 'S/N') {
        numeroAcessoReal = '';
      }

      setFormData({
        vendaId: vendaEncontrada.numeroVenda || vendaEncontrada.numeroPedido || String(vendaEncontrada.id),
        quantidade: itens.length || 1,
        servico: servicoFormatado,
        plano: planoFormatado,
        cliente: clienteFormatado,
        vendedor: vendedorReal,
        dataVenda: vendaEncontrada.criadoEm 
          ? new Date(vendaEncontrada.criadoEm).toLocaleDateString('pt-BR') 
          : (vendaEncontrada.data || new Date().toLocaleDateString('pt-BR')),
        numeroAcesso: numeroAcessoReal,
        dataAtivacao: new Date().toISOString().split('T')[0],
        zerarRemuneracao: 'nao',
        gerarPrice: 'sim',
        dataDigitalizacao: '',
        numeroProtocoloGed: filtrosBusca.numeroProtocoloGed || '',
        vencimento: '17',
        statusBko: 'Nao avaliado',
        liderEquipe: filtrosBusca.liderEquipe || '',
        observacoes: '',
        observacoesImportacao: '',
        situacaoServico: 'Confirmado',
        gerarComissao: 'Sim',
        motivosCancelamento: []
      });

      setEtapa('DETALHE');
      return;
    }

    setMensagemErro(`A venda "${vendaDigitada || filtrosBusca.numeroAcesso}" não foi encontrada no banco de dados.`);
  };

  const toggleMotivoCancelamento = (motivo) => {
    setFormData(prev => {
      const lista = prev.motivosCancelamento || [];
      if (lista.includes(motivo)) {
        return { ...prev, motivosCancelamento: lista.filter(m => m !== motivo) };
      } else {
        return { ...prev, motivosCancelamento: [...lista, motivo] };
      }
    });
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const protocolosSalvos = JSON.parse(localStorage.getItem('syscor_protocolos') || '{}');
    protocolosSalvos[formData.vendaId] = formData;
    localStorage.setItem('syscor_protocolos', JSON.stringify(protocolosSalvos));

    setSalvoComSucesso(true);
    setTimeout(() => setSalvoComSucesso(false), 3000);
  };

  const handleIrParaVenda = () => {
    navigate('/venda', {
      state: {
        vendaId: formData.vendaId,
        clienteNome: formData.cliente,
        vendedorNome: formData.vendedor,
        servico: formData.servico,
        plano: formData.plano,
        numeroAcesso: formData.numeroAcesso
      }
    });
  };

  /* ==========================================================================
     1. TELA INICIAL: CARDS HORIZONTAIS
     ========================================================================== */
  if (etapa === 'MENU') {
    return (
      <div style={{ width: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>
        
        {/* Card 1: Inserir Registro */}
        <div style={{
          background: '#0d0a18',
          border: '1px solid #231b38',
          borderRadius: 12,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: '#c026d3', borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#ffffff' }}>Inserir Registro</h2>
            </div>
            <p style={{ margin: '6px 0 0 12px', color: '#94a3b8', fontSize: 13 }}>
              Inclusão de número de protocolo e validação de contratos de vendas.
            </p>
          </div>

          <button
            type="button"
            onClick={handleIniciarNovoRegistro}
            style={{
              background: '#120c24',
              border: '1px solid #332752',
              borderRadius: 20,
              color: '#ffffff',
              padding: '8px 24px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#281c47'; e.currentTarget.style.borderColor = '#c026d3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#120c24'; e.currentTarget.style.borderColor = '#332752'; }}
          >
            <PlusCircle size={15} color="#22c55e" />
            <span>Inserir</span>
          </button>
        </div>

        {/* Card 2: Buscar Registro */}
        <div style={{
          background: '#0d0a18',
          border: '1px solid #231b38',
          borderRadius: 12,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: '#c026d3', borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#ffffff' }}>Buscar Registro</h2>
            </div>
            <p style={{ margin: '6px 0 0 12px', color: '#94a3b8', fontSize: 13 }}>
              Pesquisa avançada de vendas para conferência e edição de protocolo documental.
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setMensagemErro(''); setEtapa('BUSCA'); }}
            style={{
              background: '#120c24',
              border: '1px solid #332752',
              borderRadius: 20,
              color: '#ffffff',
              padding: '8px 24px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#281c47'; e.currentTarget.style.borderColor = '#c026d3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#120c24'; e.currentTarget.style.borderColor = '#332752'; }}
          >
            <Search size={15} color="#c026d3" />
            <span>Buscar</span>
          </button>
        </div>

      </div>
    );
  }

  /* ==========================================================================
     2. TELA DE BUSCA DE SERVIÇOS
     ========================================================================== */
  if (etapa === 'BUSCA') {
    return (
      <div style={{ width: '100%', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={22} color="var(--accent, #c026d3)" />
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text, #fff)' }}>
              Busca de Serviços - Gestão documental
            </h1>
          </div>

          <button 
            type="button" 
            className="btn sm"
            onClick={() => setEtapa('MENU')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Voltar ao Menu
          </button>
        </div>

        {mensagemErro && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--bad, #ef4444)',
            border: '1px solid var(--bad, #ef4444)'
          }}>
            <AlertTriangle size={18} />
            <span>{mensagemErro}</span>
          </div>
        )}

        <form onSubmit={handleExecutarBusca} className="panel" style={{ padding: 28, width: '100%', boxSizing: 'border-box', border: '1px solid var(--line, #332a4d)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good, #22c55e)', marginBottom: 20 }}>
            <ChevronRight size={18} strokeWidth={3} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Filtros Principais</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Período da Venda:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="date" 
                    value={filtrosBusca.periodoInicio} 
                    onChange={(e) => handleFiltroChange('periodoInicio', e.target.value)} 
                    style={{ ...inputStyleVisivel, flex: 1 }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
                  <input 
                    type="date" 
                    value={filtrosBusca.periodoFim} 
                    onChange={(e) => handleFiltroChange('periodoFim', e.target.value)} 
                    style={{ ...inputStyleVisivel, flex: 1 }}
                  />
                </div>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>PDV:</label>
                <select 
                  value={filtrosBusca.pdv} 
                  onChange={(e) => handleFiltroChange('pdv', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                >
                  <option value="TODOS">Todos</option>
                  {(PDVS || []).map(p => (
                    <option key={p.id} value={p.codigo}>{p.codigo} — {p.nome}</option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Vendedor:</label>
                <select 
                  value={filtrosBusca.vendedor} 
                  onChange={(e) => handleFiltroChange('vendedor', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                >
                  <option value="TODOS">Todos</option>
                  {(VENDEDORES || []).map(v => (
                    <option key={v.id} value={v.nome}>{v.nome}</option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº Venda:</label>
                <input 
                  type="text" 
                  placeholder="Ex: 000487" 
                  value={filtrosBusca.numeroVenda}
                  onChange={(e) => handleFiltroChange('numeroVenda', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº Solicitação 360:</label>
                <input 
                  type="text" 
                  placeholder="Número 360..." 
                  value={filtrosBusca.numeroSolicitacao360}
                  onChange={(e) => handleFiltroChange('numeroSolicitacao360', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Data Agendada de Instalação:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="date" 
                    value={filtrosBusca.dataInstalacaoInicio} 
                    onChange={(e) => handleFiltroChange('dataInstalacaoInicio', e.target.value)} 
                    style={{ ...inputStyleVisivel, flex: 1 }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
                  <input 
                    type="date" 
                    value={filtrosBusca.dataInstalacaoFim} 
                    onChange={(e) => handleFiltroChange('dataInstalacaoFim', e.target.value)} 
                    style={{ ...inputStyleVisivel, flex: 1 }}
                  />
                </div>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Líder de Equipe:</label>
                <input 
                  type="text" 
                  placeholder="Digite o líder de equipe..." 
                  value={filtrosBusca.liderEquipe}
                  onChange={(e) => handleFiltroChange('liderEquipe', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº Protocolo GED:</label>
                <input 
                  type="text" 
                  placeholder="Ex: 472092420" 
                  value={filtrosBusca.numeroProtocoloGed}
                  onChange={(e) => handleFiltroChange('numeroProtocoloGed', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº de acesso (Telefone):</label>
                <input 
                  type="text" 
                  placeholder="DDD + Número" 
                  value={filtrosBusca.numeroAcesso}
                  onChange={(e) => handleFiltroChange('numeroAcesso', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº Portabilidade:</label>
                <input 
                  type="text" 
                  placeholder="Portabilidade..." 
                  value={filtrosBusca.numeroPortabilidade}
                  onChange={(e) => handleFiltroChange('numeroPortabilidade', e.target.value)}
                  style={{ ...inputStyleVisivel, width: '100%', height: 36 }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--line, #332a4d)' }}>
            <button 
              type="button" 
              className="btn sm ghost"
              onClick={() => {
                setMensagemErro('');
                setFiltrosBusca({
                  periodoInicio: '',
                  periodoFim: '',
                  dataInstalacaoInicio: '',
                  dataInstalacaoFim: '',
                  pdv: 'TODOS',
                  liderEquipe: '',
                  vendedor: 'TODOS',
                  numeroVenda: '',
                  numeroProtocoloGed: '',
                  numeroSolicitacao360: '',
                  numeroAcesso: '',
                  numeroPortabilidade: ''
                });
              }}
            >
              Limpar Campos
            </button>

            <button 
              type="submit" 
              className="btn sm solid"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 24px' }}
            >
              <Search size={15} /> Pesquisar Serviços
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ==========================================================================
     3. TELA DE ANÁLISE / EDIÇÃO (SEM LIMITAÇÃO DE ALTURA/LARGURA)
     ========================================================================== */
  return (
    <div style={{ width: '100%', padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box' }}>
      
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileEdit size={22} color="var(--accent, #c026d3)" />
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: 'var(--accent, #c026d3)' }}>
            Análise e Edição de Protocolo - Venda #{formData.vendaId}
          </h1>
        </div>

        <button 
          type="button" 
          className="btn sm ghost"
          onClick={() => setEtapa('BUSCA')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} /> Voltar à Busca
        </button>
      </div>

      <form 
        onSubmit={handleSalvar} 
        className="panel" 
        style={{ 
          padding: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          background: 'var(--panel, #181329)', 
          border: '1px solid var(--line, #332a4d)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Quantidade */}
        <div style={{ 
          padding: '12px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6, 
          fontWeight: 700, 
          fontSize: 15, 
          color: 'var(--good, #22c55e)' 
        }}>
          <ChevronRight size={18} strokeWidth={3} />
          <span>Quantidade ({formData.quantidade})</span>
        </div>

        {/* Faixa Remover Item */}
        <div style={{ 
          background: 'rgba(225, 29, 72, 0.12)', 
          padding: '10px 24px', 
          borderTop: '1px solid rgba(225, 29, 72, 0.3)', 
          borderBottom: '1px solid rgba(225, 29, 72, 0.3)', 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <button 
            type="button" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--bad, #ef4444)', 
              fontWeight: 600, 
              fontSize: 13, 
              cursor: 'pointer' 
            }}
            onClick={() => alert(`Item da venda ${formData.vendaId} removido da conferência.`)}
          >
            <XSquare size={16} />
            Remover item
          </button>
        </div>

        {/* Informações da Venda */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 18, width: '100%', boxSizing: 'border-box' }}>
          
          {/* LINHA 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Serviço:</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                {formData.servico}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Plano:</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                {formData.plano}
              </div>
            </div>
          </div>

          {/* LINHA 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Cliente:</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                {formData.cliente}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Vendedor:</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                {formData.vendedor}
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--line-soft, #2a2340)', margin: '6px 0' }} />

          {/* LINHA 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Data da Venda:</div>
              <div className="mono" style={{ fontSize: 14, color: 'var(--text)', marginTop: 4 }}>
                {formData.dataVenda}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Ativação da Primeira Chamada:</div>
              <div style={{ 
                color: 'var(--bad, #ef4444)', 
                fontSize: 13, 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                marginTop: 4 
              }}>
                Não foi feita a primeira ligação na central SysCor deste serviço
              </div>
            </div>
          </div>

          {/* LINHA 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Número de Acesso:</div>
              <input 
                type="text"
                placeholder="DDD + Número"
                value={formData.numeroAcesso}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroAcesso: e.target.value }))}
                style={{ ...inputStyleVisivel, width: '100%', maxWidth: 360, height: 36, fontSize: 13.5 }}
              />
            </div>
            <div></div>
          </div>

          {/* LINHA 5 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Data de Ativação:</div>
              <input 
                type="date"
                value={formData.dataAtivacao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataAtivacao: e.target.value }))}
                style={{ ...inputStyleVisivel, width: '100%', maxWidth: 360, height: 36, fontSize: 13.5 }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Editar Venda:</div>
              <button 
                type="button" 
                onClick={handleIrParaVenda}
                className="btn sm"
                style={{ 
                  background: 'var(--panel-2)', 
                  border: '1px solid var(--line, #475569)', 
                  height: 36, 
                  padding: '0 20px', 
                  fontSize: 13 
                }}
              >
                Editar Venda no Caixa
              </button>
            </div>
          </div>

          {/* LINHA 6 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 8 }}>Zerar Remuneração:</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="zerarRemuneracao" 
                    value="sim" 
                    checked={formData.zerarRemuneracao === 'sim'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, zerarRemuneracao: e.target.value }))}
                  />
                  <span>Sim</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="zerarRemuneracao" 
                    value="nao" 
                    checked={formData.zerarRemuneracao === 'nao'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, zerarRemuneracao: e.target.value }))}
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 8 }}>Gerar Price:</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="gerarPrice" 
                    value="sim" 
                    checked={formData.gerarPrice === 'sim'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, gerarPrice: e.target.value }))}
                  />
                  <span>Sim</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="gerarPrice" 
                    value="nao" 
                    checked={formData.gerarPrice === 'nao'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, gerarPrice: e.target.value }))}
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>
          </div>

          {/* LINHA 7 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Data Digitalização:</div>
              <input 
                type="date"
                value={formData.dataDigitalizacao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataDigitalizacao: e.target.value }))}
                style={{ ...inputStyleVisivel, width: '100%', maxWidth: 360, height: 36, fontSize: 13.5 }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Nº Protocolo GED:</div>
              <input 
                type="text"
                placeholder="Ex: 472092420"
                value={formData.numeroProtocoloGed}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroProtocoloGed: e.target.value }))}
                style={{ ...inputStyleVisivel, width: '100%', maxWidth: 360, height: 36, fontSize: 13.5 }}
              />
            </div>
          </div>

          {/* LINHA 8 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Vencimento:</div>
              <select 
                value={formData.vencimento} 
                onChange={(e) => setFormData(prev => ({ ...prev, vencimento: e.target.value }))}
                style={{ ...inputStyleVisivel, width: 140, height: 36, fontSize: 13.5 }}
              >
                {LISTA_DIAS_VENCIMENTO.map(dia => (
                  <option key={dia} value={dia}>Dia {dia}</option>
                ))}
              </select>
            </div>
            <div></div>
          </div>

          <hr style={{ borderColor: 'var(--line-soft, #2a2340)', margin: '6px 0' }} />

          {/* LINHA 9: Status BKO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 600 }}>Status BKO:</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
              {['Improcedente', 'Procedente', 'Nao avaliado', 'Em avaliacao pelo BKO'].map((status) => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="statusBko" 
                    value={status} 
                    checked={formData.statusBko === status} 
                    onChange={(e) => setFormData(prev => ({ ...prev, statusBko: e.target.value }))}
                  />
                  <span style={{ fontSize: 13.5, fontWeight: formData.statusBko === status ? 700 : 400 }}>
                    {status === 'Nao avaliado' ? 'Não avaliado' : status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* LINHA 10: Líder de Equipe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 540 }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Líder de Equipe:</span>
            <input 
              type="text" 
              value={formData.liderEquipe || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, liderEquipe: e.target.value }))}
              style={{ ...inputStyleVisivel, height: 36, fontSize: 13.5 }}
            />
          </div>

          {/* LINHA 11: Observações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações:</span>
            <textarea 
              rows={3}
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              style={{ ...inputStyleVisivel, resize: 'vertical', fontSize: 13.5 }}
            />
          </div>

          {/* LINHA 12: Observações da importação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações da importação:</span>
            <textarea 
              rows={3}
              value={formData.observacoesImportacao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoesImportacao: e.target.value }))}
              style={{ ...inputStyleVisivel, resize: 'vertical', fontSize: 13.5 }}
            />
          </div>

          <hr style={{ borderColor: 'var(--line-soft, #2a2340)', margin: '6px 0' }} />

          {/* LINHA 13: Situação do serviço & Comissão */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>Situação do serviço:</div>
              <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="situacaoServico" 
                    value="Confirmado" 
                    checked={formData.situacaoServico === 'Confirmado'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, situacaoServico: e.target.value }))}
                  />
                  <span style={{ fontSize: 13.5 }}>Confirmado</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="situacaoServico" 
                    value="Cancelado" 
                    checked={formData.situacaoServico === 'Cancelado'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, situacaoServico: e.target.value }))}
                  />
                  <span style={{ fontSize: 13.5 }}>Cancelado</span>
                </label>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 8 }}>
                Gerar comissão de serviço do vendedor:
              </div>
              <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="gerarComissao" 
                    value="Sim" 
                    checked={formData.gerarComissao === 'Sim'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, gerarComissao: e.target.value }))}
                  />
                  <span style={{ fontSize: 13.5 }}>Sim</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="gerarComissao" 
                    value="Não" 
                    checked={formData.gerarComissao === 'Não'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, gerarComissao: e.target.value }))}
                  />
                  <span style={{ fontSize: 13.5 }}>Não</span>
                </label>
              </div>
            </div>

            {formData.situacaoServico === 'Cancelado' && (
              <div style={{
                background: 'var(--panel-2)',
                border: '1px solid var(--bad, #ef4444)',
                borderRadius: 8,
                padding: 20,
                maxWidth: 600,
                marginTop: 8
              }}>
                <div style={{ color: 'var(--bad, #ef4444)', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  Motivo do cancelamento:
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxHeight: 280,
                  overflowY: 'auto',
                  paddingRight: 6
                }}>
                  {LISTA_MOTIVOS_CANCELAMENTO.map((motivo) => (
                    <label 
                      key={motivo} 
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text)' }}
                    >
                      <input 
                        type="checkbox" 
                        checked={(formData.motivosCancelamento || []).includes(motivo)} 
                        onChange={() => toggleMotivoCancelamento(motivo)} 
                      />
                      <span>{motivo}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé de Ações */}
        <div style={{ 
          background: 'var(--panel-2)', 
          padding: '16px 32px', 
          borderTop: '1px solid var(--line, #332a4d)', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 14
        }}>
          {salvoComSucesso && (
            <span style={{ color: 'var(--good, #22c55e)', fontSize: 13.5, fontWeight: 600, marginRight: 'auto' }}>
              ✓ Protocolo da venda #{formData.vendaId} atualizado com sucesso!
            </span>
          )}

          <button 
            type="button" 
            className="btn sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 20px' }}
            onClick={() => setEtapa('BUSCA')}
          >
            <ArrowLeft size={15} />
            Voltar
          </button>

          <button 
            type="submit" 
            className="btn sm"
            style={{ 
              background: '#84cc16', 
              color: '#fff', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              height: 36, 
              padding: '0 26px', 
              fontWeight: 700 
            }}
          >
            Salvar
            <Check size={16} strokeWidth={3} />
          </button>
        </div>

      </form>

    </div>
  );
}