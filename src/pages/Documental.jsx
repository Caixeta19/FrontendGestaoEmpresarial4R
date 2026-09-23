import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Eye, 
  UploadCloud, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  XSquare, 
  ArrowLeft, 
  Check, 
  AlertTriangle,
  FileEdit,
  Download,
  RotateCcw
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

export default function Documental() {
  const navigate = useNavigate();

  // 'MENU' | 'BUSCA' | 'DETALHE' | 'VER_TODOS' | 'IMPORTAR'
  const [etapa, setEtapa] = useState('MENU');
  const [cardAberto, setCardAberto] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  // Estados da Tela de Importação
  const [importacaoPeriodo, setImportacaoPeriodo] = useState({
    inicio: '2026-09-01',
    fim: '2026-09-23'
  });
  const [tipoRelatorioImportacao, setTipoRelatorioImportacao] = useState('Relatório gestão documental');
  const [arquivoCsv, setArquivoCsv] = useState(null);
  const [carregandoImportacao, setCarregandoImportacao] = useState(false);
  const [statusImportacao, setStatusImportacao] = useState(null);

  // Estados de Filtro de Busca
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

  // Dados do Formulário Documental
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

  // Base demonstrativa para "Ver Todos"
  const [listaDocumental, setListaDocumental] = useState([
    { id: '000499', cliente: 'JOÃO PEDRO MARTINS', vendedor: 'MARINA FERREIRA', servico: 'Alta - Controle', protocoloGed: '472092420', statusBko: 'Procedente', data: '22/09/2026' },
    { id: '000487', cliente: 'FERNANDA RIBEIRO TELECOM LTDA', vendedor: 'MARINA FERREIRA', servico: 'Troca de Aparelho Smartphone Pós', protocoloGed: '472092389', statusBko: 'Nao avaliado', data: '20/09/2026' },
    { id: '000482', cliente: 'JOÃO PEDRO MARTINS', vendedor: 'GUILHERME CAIXETA', servico: 'Migração Controle', protocoloGed: '472091992', statusBko: 'Em avaliacao pelo BKO', data: '18/09/2026' }
  ]);

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

    if (vendaEncontrada) {
      const itens = vendaEncontrada.itens || [];
      const itemServico = itens.find(it => it.categoria === 'SERVICO_VIVO');
      const itemProduto = itens.find(it => it.categoria === 'PRODUTO_VIVO');
      const itemGenerico = itens[0] || {};

      let servicoFormatado = 'Venda Avulsa';
      if (itemServico?.detalhes?.servico) {
        servicoFormatado = itemServico.detalhes.servico;
      } else if (itemProduto) {
        servicoFormatado = itemProduto.detalhes?.servico || 'Venda de Aparelho';
      } else if (itemServico) {
        servicoFormatado = 'Serviço Vivo';
      }

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

      const clienteNome = vendaEncontrada.cliente || 'Cliente Balcão';
      const clienteDoc = vendaEncontrada.clienteDoc && vendaEncontrada.clienteDoc !== '—' 
        ? ` - CPF: ${vendaEncontrada.clienteDoc}` 
        : '';

      setFormData({
        vendaId: vendaEncontrada.numeroVenda || vendaEncontrada.numeroPedido || String(vendaEncontrada.id),
        quantidade: itens.length || 1,
        servico: servicoFormatado,
        plano: planoFormatado,
        cliente: `${clienteNome}${clienteDoc}`,
        vendedor: vendaEncontrada.vendedorNome || vendaEncontrada.vendedor || 'Vendedor Não Identificado',
        dataVenda: vendaEncontrada.data || new Date().toLocaleDateString('pt-BR'),
        numeroAcesso: filtrosBusca.numeroAcesso || '',
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
    navigate('/venda/lancar', {
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

  const handleBaixarModelo = () => {
    const cabecalho = 'NUMERO_VENDA;PROTOCOLO_GED;STATUS_BKO;NUMERO_ACESSO;DATA_DIGITALIZACAO\n';
    const exemplo = '000499;472092420;Procedente;61999998888;23/09/2026\n000487;472092389;Nao avaliado;61988887777;23/09/2026';
    const blob = new Blob([cabecalho + exemplo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_protocolos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessarImportacao = () => {
    if (!arquivoCsv) {
      alert('Por favor, escolha um arquivo CSV para importar.');
      return;
    }

    setCarregandoImportacao(true);
    setStatusImportacao(null);

    const leitor = new FileReader();

    leitor.onload = (e) => {
      const conteudo = e.target.result;
      const linhas = conteudo.split(/\r?\n/).filter(linha => linha.trim() !== '');

      if (linhas.length <= 1) {
        alert('O arquivo enviado está vazio ou não possui registros válidos.');
        setCarregandoImportacao(false);
        return;
      }

      const vendasLocais = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
      const protocolosSalvos = JSON.parse(localStorage.getItem('syscor_protocolos') || '{}');

      const errosEncontrados = [];
      let sucessos = 0;

      for (let i = 1; i < linhas.length; i++) {
        const colunas = linhas[i].split(/[;,]/).map(c => c.trim().replace(/^"|"$/g, ''));
        const numeroVenda = colunas[0];
        const protocoloGed = colunas[1];
        const statusBko = colunas[2] || 'Nao avaliado';
        const numeroAcesso = colunas[3] || '';
        const dataDigitalizacao = colunas[4] || new Date().toLocaleDateString('pt-BR');

        if (!numeroVenda) {
          errosEncontrados.push({ linha: i + 1, venda: 'Indefinida', motivo: 'Número de venda em branco' });
          continue;
        }

        const vendaExiste = vendasLocais.find(v => String(v.id || v.numeroVenda || '') === String(numeroVenda));

        if (!vendaExiste) {
          errosEncontrados.push({ linha: i + 1, venda: numeroVenda, motivo: 'Venda não cadastrada no sistema' });
        } else {
          protocolosSalvos[numeroVenda] = {
            vendaId: numeroVenda,
            numeroProtocoloGed: protocoloGed || 'IMPORTADO',
            statusBko: statusBko,
            numeroAcesso: numeroAcesso,
            dataDigitalizacao: dataDigitalizacao,
            cliente: vendaExiste.cliente || 'Importado',
            vendedor: vendaExiste.vendedorNome || vendaExiste.vendedor || 'Importado',
            servico: 'Serviço Importado',
            dataVenda: vendaExiste.data || new Date().toLocaleDateString('pt-BR')
          };
          sucessos++;
        }
      }

      localStorage.setItem('syscor_protocolos', JSON.stringify(protocolosSalvos));

      setTimeout(() => {
        setCarregandoImportacao(false);

        if (errosEncontrados.length > 0) {
          let csvErro = 'LINHA;NUMERO_VENDA;MOTIVO_ERRO\n';
          errosEncontrados.forEach(err => {
            csvErro += `${err.linha};${err.venda};${err.motivo}\n`;
          });

          const blobErro = new Blob([csvErro], { type: 'text/csv;charset=utf-8;' });
          const urlErro = URL.createObjectURL(blobErro);
          const linkErro = document.createElement('a');
          linkErro.setAttribute('href', urlErro);
          linkErro.setAttribute('download', `erros_importacao_protocolos_${Date.now()}.csv`);
          document.body.appendChild(linkErro);
          linkErro.click();
          document.body.removeChild(linkErro);

          setStatusImportacao({
            tipo: 'aviso',
            mensagem: `Importação concluída com inconsistências: ${sucessos} registro(s) processados com sucesso e ${errosEncontrados.length} erro(s). A planilha de erros foi baixada automaticamente.`
          });
        } else {
          setStatusImportacao({
            tipo: 'sucesso',
            mensagem: `Sucesso! Todos os ${sucessos} registros foram importados e processados sem erros.`
          });
        }
      }, 800);
    };

    leitor.readAsText(arquivoCsv);
  };

  // ==========================================================================
  // 1. TELA: IMPORTAÇÃO DE SERVIÇOS
  // ==========================================================================
  if (etapa === 'IMPORTAR') {
    return (
      <div style={{
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        color: 'var(--text)',
        fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}>
        <div style={{
          background: 'var(--panel, #120e1c)',
          border: '1px solid var(--line, #2d2442)',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          {/* Faixa azul de atenção */}
          <div style={{
            background: '#2563eb',
            color: '#ffffff',
            padding: '14px 20px',
            fontSize: '13.5px',
            lineHeight: 1.45,
            fontWeight: 500
          }}>
            <b>Atenção!</b> Ao clicar em salvar basta aguardar, a importação pode levar alguns segundos. Não feche a tela até receber a confirmação de conclusão.
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {statusImportacao && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                background: statusImportacao.tipo === 'sucesso' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: statusImportacao.tipo === 'sucesso' ? 'var(--good, #22c55e)' : 'var(--bad, #ef4444)',
                border: `1px solid ${statusImportacao.tipo === 'sucesso' ? 'var(--good, #22c55e)' : 'var(--bad, #ef4444)'}`
              }}>
                {statusImportacao.mensagem}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Período:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="date"
                  value={importacaoPeriodo.inicio}
                  onChange={(e) => setImportacaoPeriodo({ ...importacaoPeriodo, inicio: e.target.value })}
                  style={campoImportacaoEstilo}
                />
                <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Até</span>
                <input
                  type="date"
                  value={importacaoPeriodo.fim}
                  onChange={(e) => setImportacaoPeriodo({ ...importacaoPeriodo, fim: e.target.value })}
                  style={campoImportacaoEstilo}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Tipo:</label>
              <select
                value={tipoRelatorioImportacao}
                onChange={(e) => setTipoRelatorioImportacao(e.target.value)}
                style={{ ...campoImportacaoEstilo, maxWidth: 300, cursor: 'pointer' }}
              >
                <option value="Relatório gestão documental">Relatório gestão documental</option>
                <option value="Importação GED">Importação GED</option>
                <option value="Importação Simplificada">Importação Simplificada</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Arquivo (CSV):</label>
              <div style={{
                background: 'var(--panel-2, #181329)',
                border: '1px solid var(--line, #382b4f)',
                borderRadius: 4,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                maxWidth: 420
              }}>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setArquivoCsv(e.target.files[0])}
                  style={{
                    fontSize: 12.5,
                    color: 'var(--text)',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div 
              onClick={handleBaixarModelo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--text)',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: 4,
                width: 'fit-content'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text)'
              }}>
                <Download size={18} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, textDecoration: 'underline' }}>
                Modelo de arquivo para importação
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--line, #2d2442)', margin: 0 }} />

          {/* Card Flutuante Inferior com Apagar e Salvar */}
          <div style={{
            padding: '24px 28px',
            display: 'flex',
            justifyContent: 'center',
            background: 'var(--panel)'
          }}>
            <div style={{
              background: 'var(--panel-2, #1f1833)',
              border: '1px solid var(--line, #3a2b54)',
              borderRadius: 14,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}>
              <button
                type="button"
                onClick={() => {
                  setArquivoCsv(null);
                  setStatusImportacao(null);
                  setEtapa('MENU');
                }}
                style={{
                  background: '#7f1d1d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 6px rgba(127, 29, 29, 0.4)',
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>Apagar</span>
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={handleProcessarImportacao}
                disabled={carregandoImportacao}
                style={{
                  background: '#65a30d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: carregandoImportacao ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 6px rgba(101, 163, 13, 0.4)',
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>{carregandoImportacao ? 'Aguarde...' : 'Salvar'}</span>
                <Check size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 2. TELA: MENU PRINCIPAL
  // ==========================================================================
  if (etapa === 'MENU') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={cardContainerEstilo}>
          <div style={topoCardEstilo}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>
                  Gestão Documental
                </h2>
              </div>
              <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>
                Preenchimento do número de protocolo de aprovação de contrato.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCardAberto(!cardAberto)}
              style={botaoAvaliarEstilo}
            >
              <span>Avaliar</span>
              {cardAberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {cardAberto && (
            <div style={conteudoAbertoEstilo}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleIniciarNovoRegistro}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <PlusCircle size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Inserir Registro</b>
                </button>

                <button
                  type="button"
                  onClick={() => { setMensagemErro(''); setEtapa('BUSCA'); }}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <Search size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Buscar Registro</b>
                </button>

                <button
                  type="button"
                  onClick={() => setEtapa('VER_TODOS')}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <Eye size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Ver Todos</b>
                </button>

                <button
                  type="button"
                  onClick={() => { setStatusImportacao(null); setEtapa('IMPORTAR'); }}
                  style={botaoQuadradoEstilo}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={iconeWrapperEstilo}>
                    <UploadCloud size={22} />
                  </div>
                  <b style={{ fontSize: 13.5 }}>Importar serviços</b>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 3. TELA: VER TODOS OS PROTOCOLOS
  // ==========================================================================
  if (etapa === 'VER_TODOS') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setEtapa('MENU')}
                title="Voltar ao Menu"
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Todos os Protocolos Documentais
              </h1>
            </div>
          </div>

          <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 11.5 }}>
                  <th style={{ padding: '12px 14px' }}>Nº Venda</th>
                  <th style={{ padding: '12px 14px' }}>Data</th>
                  <th style={{ padding: '12px 14px' }}>Cliente</th>
                  <th style={{ padding: '12px 14px' }}>Vendedor</th>
                  <th style={{ padding: '12px 14px' }}>Serviço</th>
                  <th style={{ padding: '12px 14px' }}>Protocolo GED</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status BKO</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {listaDocumental.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{doc.id}</td>
                    <td style={{ padding: '12px 14px' }}>{doc.data}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{doc.cliente}</td>
                    <td style={{ padding: '12px 14px' }}>{doc.vendedor}</td>
                    <td style={{ padding: '12px 14px' }}>{doc.servico}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--accent)' }} className="mono">{doc.protocoloGed}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        background: doc.statusBko === 'Procedente' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: doc.statusBko === 'Procedente' ? 'var(--good)' : 'var(--warn)',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {doc.statusBko}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            vendaId: doc.id,
                            cliente: doc.cliente,
                            vendedor: doc.vendedor,
                            servico: doc.servico,
                            numeroProtocoloGed: doc.protocoloGed,
                            statusBko: doc.statusBko,
                            dataVenda: doc.data
                          });
                          setEtapa('DETALHE');
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 4 }}
                        title="Editar Protocolo"
                      >
                        <FileEdit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 4. TELA: BUSCA DE SERVIÇOS
  // ==========================================================================
  if (etapa === 'BUSCA') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={22} color="var(--accent, #c026d3)" />
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
              Busca de Serviços - Gestão documental
            </h1>
          </div>

          <button 
            type="button" 
            onClick={() => setEtapa('MENU')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}
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

        <form onSubmit={handleExecutarBusca} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 28, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good, #22c55e)', marginBottom: 20 }}>
            <ChevronRight size={18} strokeWidth={3} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Filtros Principais</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Período da Venda:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="date" 
                    value={filtrosBusca.periodoInicio} 
                    onChange={(e) => handleFiltroChange('periodoInicio', e.target.value)} 
                    style={campoImportacaoEstilo}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
                  <input 
                    type="date" 
                    value={filtrosBusca.periodoFim} 
                    onChange={(e) => handleFiltroChange('periodoFim', e.target.value)} 
                    style={campoImportacaoEstilo}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>PDV:</label>
                <select 
                  value={filtrosBusca.pdv} 
                  onChange={(e) => handleFiltroChange('pdv', e.target.value)}
                  style={campoImportacaoEstilo}
                >
                  <option value="TODOS">Todos</option>
                  {(PDVS || []).map(p => (
                    <option key={p.id} value={p.codigo}>{p.codigo} — {p.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Vendedor:</label>
                <select 
                  value={filtrosBusca.vendedor} 
                  onChange={(e) => handleFiltroChange('vendedor', e.target.value)}
                  style={campoImportacaoEstilo}
                >
                  <option value="TODOS">Todos</option>
                  {(VENDEDORES || []).map(v => (
                    <option key={v.id} value={v.nome}>{v.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nº Venda:</label>
                <input 
                  type="text" 
                  placeholder="Ex: 000487" 
                  value={filtrosBusca.numeroVenda}
                  onChange={(e) => handleFiltroChange('numeroVenda', e.target.value)}
                  style={campoImportacaoEstilo}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nº Solicitação 360:</label>
                <input 
                  type="text" 
                  placeholder="Número 360..." 
                  value={filtrosBusca.numeroSolicitacao360}
                  onChange={(e) => handleFiltroChange('numeroSolicitacao360', e.target.value)}
                  style={campoImportacaoEstilo}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Data Agendada de Instalação:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="date" 
                    value={filtrosBusca.dataInstalacaoInicio} 
                    onChange={(e) => handleFiltroChange('dataInstalacaoInicio', e.target.value)} 
                    style={campoImportacaoEstilo}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
                  <input 
                    type="date" 
                    value={filtrosBusca.dataInstalacaoFim} 
                    onChange={(e) => handleFiltroChange('dataInstalacaoFim', e.target.value)} 
                    style={campoImportacaoEstilo}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Líder de Equipe:</label>
                <input 
                  type="text" 
                  placeholder="Digite o líder de equipe..." 
                  value={filtrosBusca.liderEquipe}
                  onChange={(e) => handleFiltroChange('liderEquipe', e.target.value)}
                  style={campoImportacaoEstilo}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nº Protocolo GED:</label>
                <input 
                  type="text" 
                  placeholder="Ex: 472092420" 
                  value={filtrosBusca.numeroProtocoloGed}
                  onChange={(e) => handleFiltroChange('numeroProtocoloGed', e.target.value)}
                  style={campoImportacaoEstilo}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nº de acesso (Telefone):</label>
                <input 
                  type="text" 
                  placeholder="DDD + Número" 
                  value={filtrosBusca.numeroAcesso}
                  onChange={(e) => handleFiltroChange('numeroAcesso', e.target.value)}
                  style={campoImportacaoEstilo}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nº Portabilidade:</label>
                <input 
                  type="text" 
                  placeholder="Portabilidade..." 
                  value={filtrosBusca.numeroPortabilidade}
                  onChange={(e) => handleFiltroChange('numeroPortabilidade', e.target.value)}
                  style={campoImportacaoEstilo}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <button 
              type="button" 
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
              style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Limpar Campos
            </button>

            <button 
              type="submit" 
              style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={15} /> Pesquisar Serviços
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================================================
  // 5. TELA: ANÁLISE E EDIÇÃO DO PROTOCOLO
  // ==========================================================================
  return (
    <div style={{ width: '100%', paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box', color: 'var(--text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileEdit size={22} color="var(--accent, #c026d3)" />
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: 'var(--accent, #c026d3)' }}>
            Análise e Edição de Protocolo - Venda #{formData.vendaId}
          </h1>
        </div>

        <button 
          type="button" 
          onClick={() => setEtapa('BUSCA')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Voltar à Busca
        </button>
      </div>

      <form 
        onSubmit={handleSalvar} 
        style={{ 
          padding: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          background: 'var(--panel)', 
          border: '1px solid var(--line)',
          borderRadius: 12,
          width: '100%', 
          boxSizing: 'border-box' 
        }}
      >
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15, color: 'var(--good, #22c55e)' }}>
          <ChevronRight size={18} strokeWidth={3} />
          <span>Quantidade ({formData.quantidade})</span>
        </div>

        <div style={{ background: 'rgba(225, 29, 72, 0.12)', padding: '10px 24px', borderTop: '1px solid rgba(225, 29, 72, 0.3)', borderBottom: '1px solid rgba(225, 29, 72, 0.3)', display: 'flex', alignItems: 'center' }}>
          <button 
            type="button" 
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--bad, #ef4444)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            onClick={() => alert(`Item da venda ${formData.vendaId} removido da conferência.`)}
          >
            <XSquare size={16} />
            Remover item
          </button>
        </div>

        {/* Informações da Venda */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 18, width: '100%', boxSizing: 'border-box' }}>
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

          <hr style={{ borderColor: 'var(--line)', margin: '6px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Data da Venda:</div>
              <div className="mono" style={{ fontSize: 14, color: 'var(--text)', marginTop: 4 }}>
                {formData.dataVenda}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>Ativação da Primeira Chamada:</div>
              <div style={{ color: 'var(--bad, #ef4444)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                Não foi feita a primeira ligação na central SysCor deste serviço
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Número de Acesso:</div>
              <input 
                type="text"
                placeholder="DDD + Número"
                value={formData.numeroAcesso}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroAcesso: e.target.value }))}
                style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Data de Ativação:</div>
              <input 
                type="date"
                value={formData.dataAtivacao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataAtivacao: e.target.value }))}
                style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Editar Venda:</div>
              <button 
                type="button" 
                onClick={handleIrParaVenda}
                style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)', height: 36, padding: '0 20px', fontSize: 13, borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Editar Venda no Caixa
              </button>
            </div>
          </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Data Digitalização:</div>
              <input 
                type="date"
                value={formData.dataDigitalizacao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataDigitalizacao: e.target.value }))}
                style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Nº Protocolo GED:</div>
              <input 
                type="text"
                placeholder="Ex: 472092420"
                value={formData.numeroProtocoloGed}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroProtocoloGed: e.target.value }))}
                style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Vencimento:</div>
              <select 
                value={formData.vencimento} 
                onChange={(e) => setFormData(prev => ({ ...prev, vencimento: e.target.value }))}
                style={{ ...campoImportacaoEstilo, width: 140 }}
              >
                {LISTA_DIAS_VENCIMENTO.map(dia => (
                  <option key={dia} value={dia}>Dia {dia}</option>
                ))}
              </select>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--line)', margin: '6px 0' }} />

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 540 }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Líder de Equipe:</span>
            <input 
              type="text" 
              value={formData.liderEquipe || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, liderEquipe: e.target.value }))}
              style={campoImportacaoEstilo}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações:</span>
            <textarea 
              rows={3}
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              style={{ ...campoImportacaoEstilo, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações da importação:</span>
            <textarea 
              rows={3}
              value={formData.observacoesImportacao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoesImportacao: e.target.value }))}
              style={{ ...campoImportacaoEstilo, resize: 'vertical' }}
            />
          </div>

          <hr style={{ borderColor: 'var(--line)', margin: '6px 0' }} />

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
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto', paddingRight: 6 }}>
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
          borderTop: '1px solid var(--line)', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 14,
          borderRadius: '0 0 12px 12px'
        }}>
          {salvoComSucesso && (
            <span style={{ color: 'var(--good, #22c55e)', fontSize: 13.5, fontWeight: 600, marginRight: 'auto' }}>
              ✓ Protocolo da venda #{formData.vendaId} atualizado com sucesso!
            </span>
          )}

          <button 
            type="button" 
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 20px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, cursor: 'pointer' }}
            onClick={() => setEtapa('BUSCA')}
          >
            <ArrowLeft size={15} /> Voltar
          </button>

          <button 
            type="submit" 
            style={{ 
              background: '#84cc16', 
              color: '#fff', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              height: 36, 
              padding: '0 26px', 
              fontWeight: 700,
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Salvar <Check size={16} strokeWidth={3} />
          </button>
        </div>
      </form>
    </div>
  );
}

// Estilos Reutilizáveis
const cardContainerEstilo = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: '18px 24px',
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

const campoImportacaoEstilo = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #382b4f)',
  color: 'var(--text, #ffffff)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};