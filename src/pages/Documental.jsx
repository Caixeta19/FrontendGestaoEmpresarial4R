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

// Estilo padronizado com bordas visíveis e fundo nítido
const inputStyleVisivel = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #475569)',
  color: 'var(--text, #f1eef7)',
  borderRadius: '6px',
  outline: 'none',
  padding: '6px 10px',
  transition: 'border-color 0.15s ease'
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

  // ==========================================================================
  // BUSCA DINÂMICA: PUXA A VENDA REAL DIGITADA SEM FIXAR NÚMEROS ESTÁTICOS
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

    // 1. Tenta buscar da API do Backend primeiro
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
              // Inclui também o campo real de telefone/MSISDN do item,
              // não apenas serial/IMEI, para que a busca por Nº de Acesso encontre a venda.
              String(item.numeroAcesso || item.telefone || item.msisdn || item.serialImei || item.imeiOuSerial || '')
                .replace(/\D/g, '')
                .includes(acessoDigitado)
            );
          }
          return false;
        });
      }
    } catch {
      // Ignora erro de rede e tenta buscar localmente
    }

    // 2. Se não achou na API, busca no localStorage local (syscor_vendas / syscor_protocolos)
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

    // 3. SE ENCONTROU A VENDA REAL: Mapeia dinamicamente os dados reais dela
    if (vendaEncontrada) {
      // Prioriza o item de SERVICO_VIVO (se existir) para preencher Serviço/Plano/Linha,
      // em vez de assumir que o primeiro item do array é sempre o serviço.
      const itens = vendaEncontrada.itens || [];
      const itemServico = itens.find((it) => it.categoria === 'SERVICO_VIVO') || itens[0] || {};
      const detalhesItem = itemServico.detalhes || {};

      // Serviço: usa o nome limpo salvo em detalhes.servico (ex: "Migração").
      // Antes caía em item.categoria, que é a string interna "SERVICO_VIVO".
      const servicoFormatado = detalhesItem.servico || itemServico.categoria || 'Alta - Pós';

      // Plano: usa SOMENTE o plano novo/contratado (detalhes.planoNovo).
      // Antes caía em item.descricao, que é a string completa da transição
      // "Migração: [Plano Antigo] ➔ [Plano Novo]".
      const planoFormatado = detalhesItem.planoNovo || itemServico.descricao || 'Plano Vivo Oficial';

      // Cliente: em Venda.jsx o campo "cliente" é salvo como STRING (nome), não objeto.
      // Antes o código tentava vendaEncontrada.cliente.nome, que é sempre undefined
      // porque .cliente já É a string — daí caía sempre em "Cliente Não Informado".
      const clienteNome = vendaEncontrada.cliente || null;
      const clienteDocumento =
        vendaEncontrada.clienteDoc && vendaEncontrada.clienteDoc !== '—'
          ? vendaEncontrada.clienteDoc
          : null;

      const clienteFormatado = clienteNome
        ? (clienteDocumento ? `${clienteNome} - CPF: ${clienteDocumento}` : clienteNome)
        : 'Cliente Não Informado';

      // Vendedor: usa o vendedor que efetivamente lançou a venda (usuário logado
      // no momento do lançamento) e nunca é alterado depois — ver campo fixo na tela de detalhe.
      const vendedorReal =
        (vendaEncontrada.usuario && (vendaEncontrada.usuario.nome || vendaEncontrada.usuario.login)) ||
        vendaEncontrada.vendedorNome ||
        vendaEncontrada.vendedorIdentificacao ||
        'VENDEDOR DA FILIAL';

      // Número de acesso: prioriza a linha já formatada salva em detalhes.linha
      // (ex: "(61) 99437-3977"), que é o dado correto gravado no momento da venda.
      // NUNCA usar serialImei/imeiOuSerial aqui — esses são o IMEI do aparelho,
      // não o número de acesso (telefone) da linha.
      const numeroAcessoReal =
        filtrosBusca.numeroAcesso ||
        detalhesItem.linha ||
        itemServico.numeroAcesso ||
        itemServico.telefone ||
        itemServico.msisdn ||
        '';

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

    // 4. Se não encontrar, avisa o operador
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
     1. TELA DE MENU PRINCIPAL (2 CARDS)
     ========================================================================== */
  if (etapa === 'MENU') {
    return (
      <div style={{ maxWidth: 720, margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 8, height: 16, background: 'var(--accent, #c026d3)', borderRadius: 2, marginTop: 4 }} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text, #fff)' }}>
              Gestão Documental
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-faint, #8c85a6)', fontSize: 13.5 }}>
              Preenchimento do número de protocolo de aprovação de contrato.
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 20, 
          padding: 28, 
          background: 'var(--panel, #181329)', 
          border: '1px solid var(--line, #332a4d)', 
          borderRadius: 12 
        }}>
          <div 
            onClick={() => {
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
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: '44px 20px',
              borderRadius: 10,
              border: '1px solid var(--line, #332a4d)',
              background: 'var(--panel-2, #211c38)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(192, 38, 211, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent, #c026d3)'
            }}>
              <PlusCircle size={28} />
            </div>
            <b style={{ fontSize: 15, color: 'var(--text, #fff)' }}>Inserir Registro</b>
          </div>

          <div 
            onClick={() => {
              setMensagemErro('');
              setEtapa('BUSCA');
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: '44px 20px',
              borderRadius: 10,
              border: '1px solid var(--line, #332a4d)',
              background: 'var(--panel-2, #211c38)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(192, 38, 211, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent, #c026d3)'
            }}>
              <Search size={28} />
            </div>
            <b style={{ fontSize: 15, color: 'var(--text, #fff)' }}>Buscar Registro</b>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     2. TELA DE BUSCA DE SERVIÇOS
     ========================================================================== */
  if (etapa === 'BUSCA') {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
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

        <form onSubmit={handleExecutarBusca} className="panel" style={{ padding: 24, border: '1px solid var(--line, #332a4d)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good, #22c55e)', marginBottom: 20 }}>
            <ChevronRight size={18} strokeWidth={3} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Filtros Principais</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                  style={{ ...inputStyleVisivel, width: '100%', height: 34 }}
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
                  style={{ ...inputStyleVisivel, width: '100%', height: 34 }}
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
                  style={{ ...inputStyleVisivel, maxWidth: 260, height: 34 }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº Solicitação 360:</label>
                <input 
                  type="text" 
                  placeholder="Número 360..." 
                  value={filtrosBusca.numeroSolicitacao360}
                  onChange={(e) => handleFiltroChange('numeroSolicitacao360', e.target.value)}
                  style={{ ...inputStyleVisivel, maxWidth: 260, height: 34 }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº Portabilidade:</label>
                <input 
                  type="text" 
                  placeholder="Portabilidade..." 
                  value={filtrosBusca.numeroPortabilidade}
                  onChange={(e) => handleFiltroChange('numeroPortabilidade', e.target.value)}
                  style={{ ...inputStyleVisivel, maxWidth: 260, height: 34 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                  style={{ ...inputStyleVisivel, width: '100%', height: 34 }}
                />
              </div>

              <div style={{ height: 50 }} />

              <div className="field" style={{ margin: 0 }}>
                <label>Nº Protocolo GED:</label>
                <input 
                  type="text" 
                  placeholder="Ex: 472092420" 
                  value={filtrosBusca.numeroProtocoloGed}
                  onChange={(e) => handleFiltroChange('numeroProtocoloGed', e.target.value)}
                  style={{ ...inputStyleVisivel, maxWidth: 260, height: 34 }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Nº de acesso (Telefone):</label>
                <input 
                  type="text" 
                  placeholder="DDD + Número" 
                  value={filtrosBusca.numeroAcesso}
                  onChange={(e) => handleFiltroChange('numeroAcesso', e.target.value)}
                  style={{ ...inputStyleVisivel, maxWidth: 260, height: 34 }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line, #332a4d)' }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px' }}
            >
              <Search size={15} /> Pesquisar Serviços
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ==========================================================================
     3. TELA DE EDIÇÃO DO PROTOCOLO VINCULADO À VENDA REAL
     ========================================================================== */
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
        <FileEdit size={20} color="var(--accent, #c026d3)" />
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: 'var(--accent, #c026d3)' }}>
          Edição de Número de Protocolo - Venda #{formData.vendaId}
        </h1>
      </div>

      <form 
        onSubmit={handleSalvar} 
        className="panel" 
        style={{ 
          padding: 0, 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column', 
          background: 'var(--panel, #181329)', 
          border: '1px solid var(--line, #332a4d)' 
        }}
      >
        {/* Quantidade */}
        <div style={{ 
          padding: '10px 18px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6, 
          fontWeight: 700, 
          fontSize: 14, 
          color: 'var(--good, #22c55e)' 
        }}>
          <ChevronRight size={17} strokeWidth={3} />
          <span>Quantidade ({formData.quantidade})</span>
        </div>

        {/* Faixa Remover Item */}
        <div style={{ 
          background: 'rgba(225, 29, 72, 0.12)', 
          padding: '8px 18px', 
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
              fontSize: 12.5, 
              cursor: 'pointer' 
            }}
            onClick={() => alert(`Item da venda ${formData.vendaId} removido da conferência.`)}
          >
            <XSquare size={15} />
            Remover item
          </button>
        </div>

        {/* Campos em 2 Colunas */}
        <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* LINHA 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Serviço:</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                {formData.servico}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Plano:</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                {formData.plano}
              </div>
            </div>
          </div>

          {/* LINHA 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Cliente:</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                {formData.cliente}
              </div>
            </div>

            {/*
              Vendedor é somente leitura (texto fixo), igual ao Cliente.
              O valor vem de formData.vendedor, preenchido a partir da venda real
              no handleExecutarBusca e nunca mais alterado nesta tela.
            */}
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Vendedor:</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                {formData.vendedor}
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--line-soft, #2a2340)', margin: '4px 0' }} />

          {/* LINHA 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Data da Venda:</div>
              <div className="mono" style={{ fontSize: 13.5, color: 'var(--text)', marginTop: 2 }}>
                {formData.dataVenda}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Ativação da Primeira Chamada:</div>
              <div style={{ 
                color: 'var(--bad, #ef4444)', 
                fontSize: 12.5, 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                marginTop: 2 
              }}>
                Não foi feita a primeira ligação na central SysCor deste serviço
              </div>
            </div>
          </div>

          {/* LINHA 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 4 }}>Número de Acesso:</div>
              <input 
                type="text"
                value={formData.numeroAcesso}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroAcesso: e.target.value }))}
                style={{ ...inputStyleVisivel, width: 240, height: 32, fontSize: 13 }}
              />
            </div>
            <div></div>
          </div>

          {/* LINHA 5 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 4 }}>Data de Ativação:</div>
              <input 
                type="date"
                value={formData.dataAtivacao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataAtivacao: e.target.value }))}
                style={{ ...inputStyleVisivel, width: 240, height: 32, fontSize: 13 }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 4 }}>Editar Venda:</div>
              <button 
                type="button" 
                onClick={handleIrParaVenda}
                className="btn sm"
                style={{ 
                  background: 'var(--panel-2)', 
                  border: '1px solid var(--line, #475569)', 
                  height: 30, 
                  padding: '0 14px', 
                  fontSize: 12.5 
                }}
              >
                Editar
              </button>
            </div>
          </div>

          {/* LINHA 6 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Zerar Remuneração:</div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
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
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Gerar Price:</div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 4 }}>Data Digitalização:</div>
              <input 
                type="date"
                value={formData.dataDigitalizacao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataDigitalizacao: e.target.value }))}
                style={{ ...inputStyleVisivel, width: 240, height: 32, fontSize: 13 }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 4 }}>Nº Protocolo GED:</div>
              <input 
                type="text"
                value={formData.numeroProtocoloGed}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroProtocoloGed: e.target.value }))}
                style={{ ...inputStyleVisivel, width: 240, height: 32, fontSize: 13 }}
              />
            </div>
          </div>

          {/* LINHA 8 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 4 }}>Vencimento:</div>
              <select 
                value={formData.vencimento} 
                onChange={(e) => setFormData(prev => ({ ...prev, vencimento: e.target.value }))}
                style={{ ...inputStyleVisivel, width: 110, height: 32, fontSize: 13 }}
              >
                {LISTA_DIAS_VENCIMENTO.map(dia => (
                  <option key={dia} value={dia}>Dia {dia}</option>
                ))}
              </select>
            </div>
            <div></div>
          </div>

          <hr style={{ borderColor: 'var(--line-soft, #2a2340)', margin: '4px 0' }} />

          {/* LINHA 9: Status BKO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Status BKO:</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {['Improcedente', 'Procedente', 'Nao avaliado', 'Em avaliacao pelo BKO'].map((status) => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="statusBko" 
                    value={status} 
                    checked={formData.statusBko === status} 
                    onChange={(e) => setFormData(prev => ({ ...prev, statusBko: e.target.value }))}
                  />
                  <span style={{ fontSize: 13, fontWeight: formData.statusBko === status ? 700 : 400 }}>
                    {status === 'Nao avaliado' ? 'Não avaliado' : status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* LINHA 10: Líder de Equipe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 360 }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Líder de Equipe:</span>
            <input 
              type="text" 
              value={formData.liderEquipe || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, liderEquipe: e.target.value }))}
              style={{ ...inputStyleVisivel, height: 34, fontSize: 13 }}
            />
          </div>

          {/* LINHA 11: Observações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 520 }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações:</span>
            <textarea 
              rows={3}
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              style={{ ...inputStyleVisivel, resize: 'vertical', fontSize: 13 }}
            />
          </div>

          {/* LINHA 12: Observações da importação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 520 }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações da importação:</span>
            <textarea 
              rows={3}
              value={formData.observacoesImportacao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoesImportacao: e.target.value }))}
              style={{ ...inputStyleVisivel, resize: 'vertical', fontSize: 13 }}
            />
          </div>

          <hr style={{ borderColor: 'var(--line-soft, #2a2340)', margin: '4px 0' }} />

          {/* LINHA 13: Situação do serviço & Comissão */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>Situação do serviço:</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="situacaoServico" 
                    value="Confirmado" 
                    checked={formData.situacaoServico === 'Confirmado'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, situacaoServico: e.target.value }))}
                  />
                  <span style={{ fontSize: 13 }}>Confirmado</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="situacaoServico" 
                    value="Cancelado" 
                    checked={formData.situacaoServico === 'Cancelado'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, situacaoServico: e.target.value }))}
                  />
                  <span style={{ fontSize: 13 }}>Cancelado</span>
                </label>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 8 }}>
                Gerar comissão de serviço do vendedor:
              </div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="gerarComissao" 
                    value="Sim" 
                    checked={formData.gerarComissao === 'Sim'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, gerarComissao: e.target.value }))}
                  />
                  <span style={{ fontSize: 13 }}>Sim</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    name="gerarComissao" 
                    value="Não" 
                    checked={formData.gerarComissao === 'Não'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, gerarComissao: e.target.value }))}
                  />
                  <span style={{ fontSize: 13 }}>Não</span>
                </label>
              </div>
            </div>

            {/* Motivos do Cancelamento Condicional */}
            {formData.situacaoServico === 'Cancelado' && (
              <div style={{
                background: 'var(--panel-2)',
                border: '1px solid var(--bad, #ef4444)',
                borderRadius: 8,
                padding: 16,
                maxWidth: 480,
                marginTop: 6
              }}>
                <div style={{ color: 'var(--bad, #ef4444)', fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>
                  Motivo do cancelamento:
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 260,
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
          padding: '14px 24px', 
          borderTop: '1px solid var(--line, #332a4d)', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 12,
          marginTop: 'auto'
        }}>
          {salvoComSucesso && (
            <span style={{ color: 'var(--good, #22c55e)', fontSize: 13, fontWeight: 600, marginRight: 'auto' }}>
              ✓ Protocolo da venda #{formData.vendaId} atualizado com sucesso!
            </span>
          )}

          <button 
            type="button" 
            className="btn sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px' }}
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
              height: 34, 
              padding: '0 20px', 
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