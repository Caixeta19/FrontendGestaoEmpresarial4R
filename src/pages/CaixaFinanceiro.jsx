import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  HelpCircle, 
  Info, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Play, 
  RotateCcw, 
  Check, 
  Clock,
  Lock
} from 'lucide-react';

export default function CaixaFinanceiro() {
  const [seccoesAbertas, setSeccoesAbertas] = useState({
    caixasAbertos: true,
    caixasPdv: false,
    caixasFechados: false,
    sangria: false,
    suprimentos: false
  });

  // 'painel' | 'caixasAbertosLista' | 'caixasFechadosLista' | 'caixasFechadosBusca'
  const [visualizacaoAtual, setVisualizacaoAtual] = useState('painel');
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

  // Controla o ID do caixa cujo detalhe de conferência está expandido
  const [caixaConferenciaAberta, setCaixaConferenciaAberta] = useState(null);

  // Estados dos inputs de conferência por caixa
  const [dadosConferenciaPorCaixa, setDadosConferenciaPorCaixa] = useState({});

  // =========================================================================
  // DADOS DINÂMICOS (PRONTOS PARA O BACKEND / API)
  // =========================================================================
  const [listaCaixasAbertos, setListaCaixasAbertos] = useState(() => {
    return [
      { 
        id: '587094', 
        pdv: 'CE - CANINDE', 
        caixaPdv: 'CAIXA CANINDE', 
        data: '21/09/2026', 
        tipoData: 'anterior', 
        formasPagamento: [
          { forma: 'Dinheiro', abertura: 39.00, movimento: -150.00, entradas: 134.00, saidas: 0.00, contabilizado: 23.00 },
          { forma: 'PIX', abertura: 0.00, movimento: 0.00, entradas: 3378.89, saidas: 0.00, contabilizado: 3378.89 },
          { forma: 'Redecard Débito', abertura: 0.00, movimento: 0.00, entradas: 119.00, saidas: 0.00, contabilizado: 119.00 }
        ]
      },
      { 
        id: '587507', 
        pdv: 'PA - REDENÇÃO', 
        caixaPdv: 'CAIXA REDENÇÃO', 
        data: '23/09/2026', 
        tipoData: 'atual', 
        formasPagamento: [
          { forma: 'Dinheiro', abertura: 288.65, movimento: 0.00, entradas: 0.00, saidas: 0.00, contabilizado: 288.65 },
          { forma: 'PIX', abertura: 0.00, movimento: 0.00, entradas: 540.00, saidas: 0.00, contabilizado: 540.00 }
        ]
      },
      { 
        id: '587504', 
        pdv: 'PA - MARABA', 
        caixaPdv: 'CAIXA MARABA', 
        data: '23/09/2026', 
        tipoData: 'atual', 
        formasPagamento: [
          { forma: 'Dinheiro', abertura: 200.00, movimento: 0.00, entradas: 450.00, saidas: 0.00, contabilizado: 650.00 },
          { forma: 'Redecard Débito', abertura: 0.00, movimento: 0.00, entradas: 320.00, saidas: 0.00, contabilizado: 320.00 }
        ]
      },
      { 
        id: '587503', 
        pdv: 'CE - ITAPIPOCA', 
        caixaPdv: 'CAIXA ITAPIPOCA', 
        data: '23/09/2026', 
        tipoData: 'atual', 
        formasPagamento: [
          { forma: 'Dinheiro', abertura: 150.00, movimento: 0.00, entradas: 80.00, saidas: 0.00, contabilizado: 230.00 }
        ]
      },
      { 
        id: '587501', 
        pdv: 'MG - DIAMANTINA LOJA 02', 
        caixaPdv: 'CAIXA DIAMANTINA LOJA 02', 
        data: '23/09/2026', 
        tipoData: 'atual', 
        formasPagamento: [
          { forma: 'Dinheiro', abertura: 300.00, movimento: 0.00, entradas: 0.00, saidas: 0.00, contabilizado: 300.00 }
        ]
      },
      { 
        id: '587498', 
        pdv: 'CE - QUIXADA', 
        caixaPdv: 'CE - QUIXADA', 
        data: '23/09/2026', 
        tipoData: 'atual', 
        formasPagamento: [
          { forma: 'Dinheiro', abertura: 180.00, movimento: 0.00, entradas: 0.00, saidas: 0.00, contabilizado: 180.00 }
        ]
      }
    ];
  });

  // Base Dinâmica de Caixas Fechados
  const [listaCaixasFechados, setListaCaixasFechados] = useState([
    { id: '586924', data: '20/09/2026', pdv: 'GO - LUZIANIA', caixaPdv: 'CX - LUZIANIA', abertura: '76,15', contabilizado: '76,15', fechamento: '76,15', diferenca: '0,00', valorNumerico: 76.15, conferido: false },
    { id: '586925', data: '20/09/2026', pdv: 'GO - AGUAS LINDAS', caixaPdv: 'CX - AGUAS LINDAS', abertura: '154,00', contabilizado: '167,00', fechamento: '167,00', diferenca: '0,00', valorNumerico: 154.00, conferido: false },
    { id: '586927', data: '20/09/2026', pdv: 'CE - MARANGUAPE', caixaPdv: 'CE - MARANGUAPE', abertura: '172,99', contabilizado: '185,99', fechamento: '185,99', diferenca: '0,00', valorNumerico: 172.99, conferido: true },
    { id: '586947', data: '20/09/2026', pdv: 'TO - ARAGUATINS', caixaPdv: 'CAIXA ARAGUATINS', abertura: '45,98', contabilizado: '45,98', fechamento: '45,98', diferenca: '0,00', valorNumerico: 45.98, conferido: false },
    { id: '586950', data: '20/09/2026', pdv: 'PA - XINGUARA', caixaPdv: 'CAIXA XINGUARA', abertura: '264,90', contabilizado: '264,90', fechamento: '264,90', diferenca: '0,00', valorNumerico: 264.90, conferido: true },
    { id: '586955', data: '20/09/2026', pdv: 'PA - MARABA', caixaPdv: 'CAIXA MARABA', abertura: '75,19', contabilizado: '75,19', fechamento: '75,19', diferenca: '0,00', valorNumerico: 75.19, conferido: false },
    { id: '586962', data: '20/09/2026', pdv: 'MG - SALINAS', caixaPdv: 'CAIXA SALINAS', abertura: '77,07', contabilizado: '77,07', fechamento: '77,07', diferenca: '0,00', valorNumerico: 77.07, conferido: false }
  ]);

  // Lista dinâmica de PDVs extraída da base
  const listaLojas = useMemo(() => {
    const lojas = Array.from(new Set(listaCaixasAbertos.map(c => c.pdv).filter(Boolean))).sort();
    return ['Todos', ...lojas];
  }, [listaCaixasAbertos]);

  // Filtros aplicados em "Lista de caixas abertos"
  const [filtroPdvAbertos, setFiltroPdvAbertos] = useState('Todos');
  const [filtroCaixaPdvAbertos, setFiltroCaixaPdvAbertos] = useState('Escolha...');
  const [termoBuscaAbertos, setTermoBuscaAbertos] = useState('');

  // Ao mudar o PDV, repõe a seleção de Caixa do PDV
  useEffect(() => {
    setFiltroCaixaPdvAbertos('Escolha...');
    setPaginaAtualAbertos(1);
    setCaixaConferenciaAberta(null);
  }, [filtroPdvAbertos]);

  // Opções dinâmicas de Caixas do PDV calculadas exclusivamente para a loja selecionada
  const opcoesCaixaPdvDisponiveis = useMemo(() => {
    if (filtroPdvAbertos === 'Todos') {
      const todosCaixas = Array.from(new Set(listaCaixasAbertos.map(c => c.caixaPdv).filter(Boolean)));
      return todosCaixas.sort();
    }

    const caixasDoPdv = listaCaixasAbertos
      .filter(c => c.pdv.trim().toUpperCase() === filtroPdvAbertos.trim().toUpperCase())
      .map(c => c.caixaPdv)
      .filter(Boolean);

    return Array.from(new Set(caixasDoPdv)).sort();
  }, [filtroPdvAbertos, listaCaixasAbertos]);

  // Filtro Dinâmico da Tabela de Caixas Abertos
  const caixasAbertosFiltrados = useMemo(() => {
    return listaCaixasAbertos.filter(c => {
      if (filtroPdvAbertos !== 'Todos' && c.pdv.trim().toUpperCase() !== filtroPdvAbertos.trim().toUpperCase()) {
        return false;
      }
      if (filtroCaixaPdvAbertos !== 'Escolha...' && c.caixaPdv.trim().toUpperCase() !== filtroCaixaPdvAbertos.trim().toUpperCase()) {
        return false;
      }
      if (termoBuscaAbertos) {
        const termo = termoBuscaAbertos.toLowerCase();
        return c.id.includes(termo) || c.pdv.toLowerCase().includes(termo) || c.caixaPdv.toLowerCase().includes(termo);
      }
      return true;
    });
  }, [listaCaixasAbertos, filtroPdvAbertos, filtroCaixaPdvAbertos, termoBuscaAbertos]);

  // Paginação dos Caixas Abertos
  const [paginaAtualAbertos, setPaginaAtualAbertos] = useState(1);
  const ITENS_POR_PAGINA = 20;
  const totalRegistosAbertos = caixasAbertosFiltrados.length;
  const totalPaginasAbertos = Math.ceil(totalRegistosAbertos / ITENS_POR_PAGINA) || 1;
  const indiceInicial = (paginaAtualAbertos - 1) * ITENS_POR_PAGINA;
  const indiceFinal = Math.min(indiceInicial + ITENS_POR_PAGINA, totalRegistosAbertos);
  const itensPaginaAtualAbertos = caixasAbertosFiltrados.slice(indiceInicial, indiceFinal);

  // Estados de Busca para Caixas Fechados
  const [buscaFechados, setBuscaFechados] = useState({
    pdv: 'Todos',
    periodoInicio: '2026-09-20',
    periodoFim: '2026-09-23',
    confirmados: 'Todos'
  });
  const [pdvFiltroAplicadoFechados, setPdvFiltroAplicadoFechados] = useState('Todos');
  const [filtroPdvAberto, setFiltroPdvAberto] = useState(false);
  const [termoPesquisaPdv, setTermoPesquisaPdv] = useState('');

  const pdvsFiltradosBusca = listaLojas.filter(p => p !== 'Todos' && p.toLowerCase().includes(termoPesquisaPdv.toLowerCase()));

  const toggleSeccao = (chave) => {
    setSeccoesAbertas(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  const mudarPaginaAbertos = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginasAbertos) {
      setPaginaAtualAbertos(novaPagina);
      setCaixaConferenciaAberta(null);
    }
  };

  // Alterna a abertura do painel de conferência no botão amarelo (Info)
  const togglePainelConferencia = (cx, e) => {
    e.stopPropagation();
    if (caixaConferenciaAberta === cx.id) {
      setCaixaConferenciaAberta(null);
    } else {
      setCaixaConferenciaAberta(cx.id);
      // Inicializa o estado de formulário para as formas deste caixa caso ainda não exista
      if (!dadosConferenciaPorCaixa[cx.id]) {
        const valoresIniciais = {};
        (cx.formasPagamento || []).forEach(f => {
          valoresIniciais[f.forma] = f.contabilizado !== undefined ? f.contabilizado.toFixed(2).replace('.', ',') : '0,00';
        });

        setDadosConferenciaPorCaixa(prev => ({
          ...prev,
          [cx.id]: {
            valores: valoresIniciais,
            realizarBaixa: true,
            realizarSaida: false,
            realizarEntrada: false
          }
        }));
      }
    }
  };

  // Atualiza valor contabilizado individual por forma de pagamento
  const handleAtualizarContabilizado = (caixaId, forma, valor) => {
    setDadosConferenciaPorCaixa(prev => ({
      ...prev,
      [caixaId]: {
        ...prev[caixaId],
        valores: {
          ...prev[caixaId]?.valores,
          [forma]: valor
        }
      }
    }));
  };

  // Execução do Fecho de Caixa
  const handleFecharCaixa = (cx) => {
    // 1. Remove da lista de caixas abertos
    setListaCaixasAbertos(prev => prev.filter(item => item.id !== cx.id));

    // 2. Insere na lista de caixas fechados
    const novoFechado = {
      id: cx.id,
      data: cx.data,
      pdv: cx.pdv,
      caixaPdv: cx.caixaPdv,
      abertura: (cx.formasPagamento?.[0]?.abertura || 0).toFixed(2).replace('.', ','),
      contabilizado: (cx.formasPagamento?.[0]?.contabilizado || 0).toFixed(2).replace('.', ','),
      fechamento: (cx.formasPagamento?.[0]?.contabilizado || 0).toFixed(2).replace('.', ','),
      diferenca: '0,00',
      valorNumerico: cx.formasPagamento?.[0]?.abertura || 0,
      conferido: true
    };

    setListaCaixasFechados(prev => [novoFechado, ...prev]);
    setCaixaConferenciaAberta(null);
    alert(`Caixa nº ${cx.id} (${cx.pdv}) encerrado com sucesso.`);
  };

  const alternarStatusConferencia = (id) => {
    setListaCaixasFechados(prev => prev.map(cx => {
      if (cx.id === id) {
        return { ...cx, conferido: !cx.conferido };
      }
      return cx;
    }));
  };

  const handleReabrirCaixa = (caixaFechado) => {
    setListaCaixasFechados(prev => prev.filter(c => c.id !== caixaFechado.id));

    const caixaReaberto = {
      id: caixaFechado.id,
      pdv: caixaFechado.pdv,
      caixaPdv: caixaFechado.caixaPdv,
      data: '23/09/2026',
      tipoData: 'atual',
      formasPagamento: [
        { forma: 'Dinheiro', abertura: caixaFechado.valorNumerico || 100.00, movimento: 0.00, entradas: 0.00, saidas: 0.00, contabilizado: caixaFechado.valorNumerico || 100.00 }
      ]
    };

    setListaCaixasAbertos(prev => [caixaReaberto, ...prev]);
    setFiltroPdvAbertos('Todos');
    setFiltroCaixaPdvAbertos('Escolha...');
    setVisualizacaoAtual('caixasAbertosLista');
    setPaginaAtualAbertos(1);
  };

  const formatarValor = (val) => {
    if (val === undefined || val === null) return '0,00';
    return Number(val).toFixed(2).replace('.', ',');
  };

  // =========================================================================
  // 1. TELA: LISTA DE CAIXAS ABERTOS (PRINT COM FORMULÁRIO COMPLETO)
  // =========================================================================
  if (visualizacaoAtual === 'caixasAbertosLista') {
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
          {/* Topo com Título e Voltar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('painel')}
                title="Voltar ao Painel de Caixa"
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#9f28c0' }}>
                  Lista de caixas abertos
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-faint)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por Nº ou PDV..." 
                  value={termoBuscaAbertos}
                  onChange={(e) => { setTermoBuscaAbertos(e.target.value); setPaginaAtualAbertos(1); }}
                  style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '6px 12px 6px 32px', fontSize: 12.5, outline: 'none', width: 220 }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setFiltroPdvAbertos('Todos');
                  setFiltroCaixaPdvAbertos('Escolha...');
                  setTermoBuscaAbertos('');
                  setPaginaAtualAbertos(1);
                  setCaixaConferenciaAberta(null);
                }}
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  color: 'var(--text)',
                  padding: '7px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={13} color="var(--accent)" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          {/* Filtros em Cascata Dinâmicos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 540, paddingTop: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', margin: 0 }}>PDV:</label>
              <select
                value={filtroPdvAbertos}
                onChange={(e) => setFiltroPdvAbertos(e.target.value)}
                style={selectEstiloCascata}
              >
                {listaLojas.map(loja => (
                  <option key={loja} value={loja}>{loja}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Caixa do PDV:</label>
              <select
                value={filtroCaixaPdvAbertos}
                onChange={(e) => {
                  setFiltroCaixaPdvAbertos(e.target.value);
                  setPaginaAtualAbertos(1);
                }}
                style={selectEstiloCascata}
              >
                <option value="Escolha...">Escolha...</option>
                {opcoesCaixaPdvDisponiveis.map(cx => (
                  <option key={cx} value={cx}>{cx}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela de Caixas Abertos com o Detalhe Sanfona Integrado */}
          <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)', marginTop: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 12 }}>
                  <th style={{ padding: '12px 16px', color: 'var(--good, #22c55e)', width: '10%' }}>Nº</th>
                  <th style={{ padding: '12px 16px', width: '35%' }}>PDV</th>
                  <th style={{ padding: '12px 16px', width: '30%' }}>Caixa do PDV</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', width: '15%' }}>Data</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', width: '10%' }}>Conferência</th>
                </tr>
              </thead>
              <tbody>
                {itensPaginaAtualAbertos.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px 14px', color: 'var(--text-faint)' }}>
                      Nenhum caixa aberto encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  itensPaginaAtualAbertos.map(cx => {
                    const estaAberto = caixaConferenciaAberta === cx.id;
                    const dadosCaixaForm = dadosConferenciaPorCaixa[cx.id] || {
                      valores: {},
                      realizarBaixa: true,
                      realizarSaida: false,
                      realizarEntrada: false
                    };

                    return (
                      <React.Fragment key={cx.id}>
                        {/* Linha Principal do Caixa */}
                        <tr 
                          style={{
                            borderBottom: estaAberto ? 'none' : '1px solid var(--line)',
                            background: estaAberto ? 'var(--panel-2)' : 'var(--panel)',
                            color: 'var(--text)',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{cx.id}</td>
                          <td style={{ padding: '12px 16px' }}>{cx.pdv}</td>
                          <td style={{ padding: '12px 16px' }}>{cx.caixaPdv}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              background: cx.tipoData === 'atual' ? '#16a34a' : '#dc2626',
                              color: '#ffffff',
                              padding: '3px 10px',
                              borderRadius: 4,
                              fontSize: 11.5,
                              fontWeight: 700,
                              display: 'inline-block'
                            }}>
                              {cx.data}
                            </span>
                          </td>

                          {/* BOTÃO AMARELO DE CONFERÊNCIA COM BORDA VERMELHA QUANDO ATIVO */}
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={(e) => togglePainelConferencia(cx, e)}
                              title="Abrir formulário de conferência e fecho de caixa"
                              style={{
                                background: estaAberto ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                border: estaAberto ? '1px solid #ef4444' : 'none',
                                borderRadius: 4,
                                color: '#f59e0b',
                                cursor: 'pointer',
                                padding: '4px 6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Info size={19} />
                            </button>
                          </td>
                        </tr>

                        {/* DETALHE EXPANDIDO: GRELHA DINÂMICA DE FORMAS DE PAGAMENTO E OPÇÕES */}
                        {estaAberto && (
                          <tr style={{
                            background: 'var(--panel-2)',
                            borderBottom: '2px solid var(--line)'
                          }}>
                            <td colSpan={5} style={{ padding: '16px 24px 28px' }}>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20
                              }}>

                                {/* Grelha das Formas de Pagamento Vinculadas às Vendas */}
                                <div style={{ overflowX: 'auto', width: '100%' }}>
                                  <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    textAlign: 'left',
                                    fontSize: 13,
                                    color: 'var(--text)'
                                  }}>
                                    <thead>
                                      <tr style={{ color: 'var(--text-dim)', fontSize: 12.5, fontWeight: 700 }}>
                                        <th style={{ paddingBottom: 12 }}>Forma de Pagamento</th>
                                        <th style={{ paddingBottom: 12 }}>Valor de Abertura</th>
                                        <th style={{ paddingBottom: 12 }}>Movimento de Caixa</th>
                                        <th style={{ paddingBottom: 12 }}>Entradas</th>
                                        <th style={{ paddingBottom: 12 }}>Saídas</th>
                                        <th style={{ paddingBottom: 12 }}>Valor contabilizado</th>
                                        <th style={{ paddingBottom: 12 }}>Diferença</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(cx.formasPagamento || [
                                        { forma: 'Dinheiro', abertura: cx.abertura || 0, movimento: 0, entradas: 0, saidas: 0, contabilizado: cx.abertura || 0 }
                                      ]).map((fp, idx) => {
                                        const valorDigitado = dadosCaixaForm.valores?.[fp.forma] ?? formatarValor(fp.contabilizado);
                                        const valorContabilizadoNum = parseFloat(String(valorDigitado).replace(',', '.')) || 0;
                                        const diferencaCalculada = (valorContabilizadoNum - (fp.abertura + fp.movimento + fp.entradas - fp.saidas)).toFixed(2).replace('.', ',');

                                        return (
                                          <tr key={idx} style={{ borderTop: '1px solid var(--line)' }}>
                                            <td style={{ padding: '12px 0', fontWeight: 600 }}>{fp.forma}</td>
                                            <td style={{ padding: '12px 0' }}>{formatarValor(fp.abertura)}</td>
                                            <td style={{ padding: '12px 0' }}>{formatarValor(fp.movimento)}</td>
                                            <td style={{ padding: '12px 0' }}>{formatarValor(fp.entradas)}</td>
                                            <td style={{ padding: '12px 0' }}>{formatarValor(fp.saidas)}</td>
                                            <td style={{ padding: '12px 0' }}>
                                              <input 
                                                type="text"
                                                value={valorDigitado}
                                                onChange={(e) => handleAtualizarContabilizado(cx.id, fp.forma, e.target.value)}
                                                style={{
                                                  background: 'var(--panel)',
                                                  border: '1px solid var(--line)',
                                                  borderRadius: 4,
                                                  color: 'var(--text)',
                                                  padding: '4px 10px',
                                                  fontSize: 13,
                                                  fontWeight: 700,
                                                  width: 105,
                                                  outline: 'none'
                                                }}
                                              />
                                            </td>
                                            <td style={{ padding: '12px 0', fontWeight: 600 }}>{diferencaCalculada}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Opção 1: Baixa das movimentações */}
                                <fieldset style={caixaOpcaoEstilo}>
                                  <legend style={legendaOpcaoEstilo}>
                                    Deseja realizar a baixa das movimentações? (exceto dinheiro)
                                  </legend>
                                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                                    <input 
                                      type="checkbox"
                                      checked={dadosCaixaForm.realizarBaixa}
                                      onChange={(e) => {
                                        setDadosConferenciaPorCaixa(prev => ({
                                          ...prev,
                                          [cx.id]: { ...prev[cx.id], realizarBaixa: e.target.checked }
                                        }));
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span>Sim, realize a baixa das movimentações</span>
                                  </label>
                                </fieldset>

                                {/* Opção 2: Movimento de saída em dinheiro */}
                                <fieldset style={caixaOpcaoEstilo}>
                                  <legend style={legendaOpcaoEstilo}>
                                    Deseja realizar um movimento de saída em dinheiro?
                                  </legend>
                                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                                    <input 
                                      type="checkbox"
                                      checked={dadosCaixaForm.realizarSaida}
                                      onChange={(e) => {
                                        setDadosConferenciaPorCaixa(prev => ({
                                          ...prev,
                                          [cx.id]: { ...prev[cx.id], realizarSaida: e.target.checked }
                                        }));
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span>Sim, vou fazer uma retirada em dinheiro do caixa</span>
                                  </label>
                                </fieldset>

                                {/* Opção 3: Movimento de entrada em dinheiro */}
                                <fieldset style={caixaOpcaoEstilo}>
                                  <legend style={legendaOpcaoEstilo}>
                                    Deseja realizar um movimento de entrada em dinheiro?
                                  </legend>
                                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                                    <input 
                                      type="checkbox"
                                      checked={dadosCaixaForm.realizarEntrada}
                                      onChange={(e) => {
                                        setDadosConferenciaPorCaixa(prev => ({
                                          ...prev,
                                          [cx.id]: { ...prev[cx.id], realizarEntrada: e.target.checked }
                                        }));
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span>Sim, vou adicionar dinheiro ao caixa</span>
                                  </label>
                                </fieldset>

                                {/* Botão Roxo: Fechar Caixa */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleFecharCaixa(cx)}
                                    style={{
                                      background: '#7c3aed',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: 6,
                                      padding: '9px 24px',
                                      fontSize: 13.5,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
                                      transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#6d28d9'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#7c3aed'}
                                  >
                                    <Lock size={15} /> Fechar caixa
                                  </button>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação Roxa Oficial */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#581c87', color: '#ffffff', borderRadius: 4, overflow: 'hidden', fontSize: 12.5 }}>
              <span style={{ padding: '6px 14px', fontWeight: 600 }}>
                total: {totalRegistosAbertos} registro(s), visualizando de {totalRegistosAbertos === 0 ? 0 : indiceInicial + 1} até {indiceFinal}.
              </span>
              <button
                type="button"
                onClick={() => mudarPaginaAbertos(paginaAtualAbertos - 1)}
                disabled={paginaAtualAbertos === 1}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 10px' }}
              >
                <Play size={10} style={{ transform: 'rotate(180deg)', fill: 'currentColor' }} />
              </button>
              {Array.from({ length: Math.min(5, totalPaginasAbertos) }, (_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  onClick={() => mudarPaginaAbertos(i + 1)}
                  style={{ background: paginaAtualAbertos === i + 1 ? '#7e22ce' : 'transparent', border: 'none', color: '#fff', fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => mudarPaginaAbertos(paginaAtualAbertos + 1)}
                disabled={paginaAtualAbertos === totalPaginasAbertos}
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
  // 2. TELA: BUSCA DE CAIXAS FECHADOS
  // =========================================================================
  if (visualizacaoAtual === 'caixasFechadosBusca') {
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
          gap: 22
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('painel')}
                title="Voltar ao Painel"
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f472b6' }}>
                Busca de Caixas Fechados
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 650 }}>
            {/* Campo PDV */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginTop: 8 }}>PDV</label>
              
              <div style={{ position: 'relative', width: '100%' }}>
                <div
                  onClick={() => setFiltroPdvAberto(!filtroPdvAberto)}
                  style={{
                    background: 'var(--panel-2)',
                    border: '1px solid #7c3aed',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: 'var(--text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{buscaFechados.pdv}</span>
                  <ChevronDown size={15} color="var(--text-faint)" />
                </div>

                {filtroPdvAberto && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: 8, background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
                      <input 
                        type="text"
                        placeholder="Pesquisar loja..."
                        value={termoPesquisaPdv}
                        onChange={(e) => setTermoPesquisaPdv(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: 'var(--panel)',
                          border: '1px solid var(--line)',
                          borderRadius: 4,
                          padding: '6px 8px',
                          color: 'var(--text)',
                          fontSize: 12.5,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                      <div
                        onClick={() => { setBuscaFechados({ ...buscaFechados, pdv: 'Todos' }); setFiltroPdvAberto(false); }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          background: buscaFechados.pdv === 'Todos' ? '#3b82f6' : 'transparent',
                          color: buscaFechados.pdv === 'Todos' ? '#fff' : 'var(--text)',
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        Todos
                      </div>
                      <div style={{ padding: '6px 12px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                        Ativas
                      </div>
                      {pdvsFiltradosBusca.map((p) => (
                        <div
                          key={p}
                          onClick={() => { setBuscaFechados({ ...buscaFechados, pdv: p }); setFiltroPdvAberto(false); }}
                          style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            background: buscaFechados.pdv === p ? '#3b82f6' : 'transparent',
                            color: buscaFechados.pdv === p ? '#fff' : 'var(--text)',
                            fontSize: 12.5
                          }}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campo Período */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Período:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input 
                  type="date"
                  value={buscaFechados.periodoInicio}
                  onChange={(e) => setBuscaFechados({ ...buscaFechados, periodoInicio: e.target.value })}
                  style={inputEstiloForm}
                />
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
                <input 
                  type="date"
                  value={buscaFechados.periodoFim}
                  onChange={(e) => setBuscaFechados({ ...buscaFechados, periodoFim: e.target.value })}
                  style={inputEstiloForm}
                />
              </div>
            </div>

            {/* Caixas confirmados */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Caixas confirmados:</label>
              <select
                value={buscaFechados.confirmados}
                onChange={(e) => setBuscaFechados({ ...buscaFechados, confirmados: e.target.value })}
                style={{ ...inputEstiloForm, maxWidth: 220 }}
              >
                <option value="Todos">Todos</option>
                <option value="Sim">Sim</option>
                <option value="Nao">Não</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('painel')}
                style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPdvFiltroAplicadoFechados(buscaFechados.pdv);
                  setVisualizacaoAtual('caixasFechadosLista');
                }}
                style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Search size={15} /> Pesquisar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. TELA: LISTA DE CAIXAS FECHADOS
  // =========================================================================
  if (visualizacaoAtual === 'caixasFechadosLista') {
    const fechadosFiltrados = pdvFiltroAplicadoFechados === 'Todos'
      ? listaCaixasFechados
      : listaCaixasFechados.filter(c => c.pdv.trim().toUpperCase() === pdvFiltroAplicadoFechados.trim().toUpperCase());

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#f472b6' }}>
                Lista de Caixas Fechados {pdvFiltroAplicadoFechados !== 'Todos' ? `— ${pdvFiltroAplicadoFechados}` : 'a partir de 20/09/2026'}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('painel')}
                style={botaoBarraSuperior}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Voltar</span>
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => setModalAjudaAberto(true)}
                style={{ ...botaoBarraSuperior, background: '#7e22ce', color: '#fff' }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ajuda</span>
                <HelpCircle size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPdvFiltroAplicadoFechados('Todos');
                  setVisualizacaoAtual('caixasFechadosLista');
                }}
                style={{ ...botaoBarraSuperior, background: '#581c87', color: '#fff' }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ver Todos</span>
                <Eye size={18} />
              </button>

              <button
                type="button"
                onClick={() => setVisualizacaoAtual('caixasFechadosBusca')}
                style={{ ...botaoBarraSuperior, background: 'var(--panel-2)' }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Buscar Registro</span>
                <Search size={18} color="var(--accent)" />
              </button>
            </div>
          </div>

          {/* Tabela de Caixas Fechados */}
          <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 11.5, letterSpacing: 0.3 }}>
                  <th style={{ padding: '12px 14px', width: '7%' }}>Nº</th>
                  <th style={{ padding: '12px 14px', color: 'var(--good, #22c55e)', width: '9%' }}>Data</th>
                  <th style={{ padding: '12px 14px', width: '16%' }}>PDV</th>
                  <th style={{ padding: '12px 14px', width: '15%' }}>Caixa do PDV</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', width: '11%' }}>Valor de Abertura</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', width: '12%' }}>Valor Contabilizado</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', width: '13%' }}>Valor de Fechamento</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', width: '8%' }}>Diferença</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', width: '7%' }}>Ver detalhes</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', width: '7%' }}>Conferência</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', width: '6%' }}>Reabrir</th>
                </tr>
              </thead>
              <tbody>
                {fechadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '30px 14px', color: 'var(--text-faint)' }}>
                      Nenhum caixa fechado encontrado para esta unidade.
                    </td>
                  </tr>
                ) : (
                  fechadosFiltrados.map((cx) => (
                    <tr 
                      key={cx.id}
                      style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--panel)'}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{cx.id}</td>
                      <td style={{ padding: '12px 14px' }}>{cx.data}</td>
                      <td style={{ padding: '12px 14px' }}>{cx.pdv}</td>
                      <td style={{ padding: '12px 14px' }}>{cx.caixaPdv}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{cx.abertura}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{cx.contabilizado}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{cx.fechamento}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{cx.diferenca}</td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => alternarStatusConferencia(cx.id)}
                          title={cx.conferido ? 'Conferido com sucesso' : 'Conferência pendente'}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}
                        >
                          {cx.conferido ? (
                            <Check size={20} color="var(--good, #22c55e)" strokeWidth={3} />
                          ) : (
                            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Clock size={13} color="#f97316" strokeWidth={2.5} />
                            </div>
                          )}
                        </button>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleReabrirCaixa(cx)}
                          title="Reabrir Caixa e Enviar para Caixas Abertos"
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4 }}
                        >
                          <RotateCcw size={17} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. TELA PRINCIPAL (CARDS DO CAIXA)
  // =========================================================================
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
      {/* 1. CARD: CAIXAS ABERTOS */}
      <div style={cardEstilo}>
        <div style={topoCardEstilo}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>Caixas Abertos</h2>
            </div>
            <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>Incluir, alterar e fechar os caixas abertos.</p>
          </div>
          <button type="button" onClick={() => toggleSeccao('caixasAbertos')} style={botaoAvaliarEstilo}>
            <span>Avaliar</span>
            {seccoesAbertas.caixasAbertos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {seccoesAbertas.caixasAbertos && (
          <div style={conteudoAbertoEstilo}>
            <div style={{ display: 'flex', gap: 16 }}>
              <button type="button" onClick={() => setVisualizacaoAtual('caixasAbertosLista')} style={botaoQuadradoEstilo}>
                <div style={iconeWrapperEstilo}><Eye size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Ver Todos</b>
              </button>
              <button type="button" onClick={() => setModalAjudaAberto(true)} style={botaoQuadradoEstilo}>
                <div style={iconeWrapperEstilo}><HelpCircle size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Ajuda</b>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. CARD: CAIXAS DO PDV */}
      <div style={cardEstilo}>
        <div style={topoCardEstilo}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>Caixas do PDV</h2>
            </div>
            <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>Crie os caixas das lojas da sua revenda.</p>
          </div>
          <button type="button" onClick={() => toggleSeccao('caixasPdv')} style={botaoAvaliarEstilo}>
            <span>Avaliar</span>
            {seccoesAbertas.caixasPdv ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* 3. CARD: CAIXAS FECHADOS */}
      <div style={cardEstilo}>
        <div style={topoCardEstilo}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>Caixas Fechados</h2>
            </div>
            <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>Visualizar e reabrir os caixas fechados.</p>
          </div>
          <button type="button" onClick={() => toggleSeccao('caixasFechados')} style={botaoAvaliarEstilo}>
            <span>Avaliar</span>
            {seccoesAbertas.caixasFechados ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {seccoesAbertas.caixasFechados && (
          <div style={conteudoAbertoEstilo}>
            <div style={{ display: 'flex', gap: 16 }}>
              <button type="button" onClick={() => setVisualizacaoAtual('caixasFechadosBusca')} style={botaoQuadradoEstilo}>
                <div style={iconeWrapperEstilo}><Search size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Buscar Registro</b>
              </button>

              <button type="button" onClick={() => { setPdvFiltroAplicadoFechados('Todos'); setVisualizacaoAtual('caixasFechadosLista'); }} style={botaoQuadradoEstilo}>
                <div style={iconeWrapperEstilo}><Eye size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Ver Todos</b>
              </button>

              <button type="button" onClick={() => setModalAjudaAberto(true)} style={botaoQuadradoEstilo}>
                <div style={iconeWrapperEstilo}><HelpCircle size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Ajuda</b>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. CARD: SANGRIA DE CAIXA */}
      <div style={cardEstilo}>
        <div style={topoCardEstilo}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>Sangria de Caixa</h2>
            </div>
            <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>Cadastro de movimentos de saída do caixa.</p>
          </div>
          <button type="button" onClick={() => toggleSeccao('sangria')} style={botaoAvaliarEstilo}>
            <span>Avaliar</span>
            {seccoesAbertas.sangria ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* 5. CARD: SUPRIMENTOS DE CAIXA */}
      <div style={cardEstilo}>
        <div style={topoCardEstilo}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>Suprimentos de Caixa</h2>
            </div>
            <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>Cadastro de movimentos de entrada no caixa.</p>
          </div>
          <button type="button" onClick={() => toggleSeccao('suprimentos')} style={botaoAvaliarEstilo}>
            <span>Avaliar</span>
            {seccoesAbertas.suprimentos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Modal Ajuda */}
      {modalAjudaAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, maxWidth: 460, width: '90%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, color: 'var(--text)' }}>Ajuda do Módulo Caixa</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
              Filtre caixas fechados por PDV para auditar discrepâncias. Na coluna <b>Conferência</b>, o ícone de relógio laranja indica que a análise está pendente; ao clicar nele, o status é alternado para o visto verde de confirmação[cite: 14, 16]. Ao clicar em <b>Reabrir</b>, o caixa retorna imediatamente para o status de <b>Caixas Abertos</b>.
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

const inputEstiloForm = {
  background: 'var(--panel-2)',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const selectEstiloCascata = {
  background: 'var(--panel-2, #1b1425)',
  border: '1px solid var(--line, #382b4f)',
  color: 'var(--text, #ffffff)',
  borderRadius: 6,
  padding: '7px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  maxWidth: 320,
  cursor: 'pointer',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease'
};

const caixaOpcaoEstilo = {
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '12px 16px',
  background: 'var(--panel)'
};

const legendaOpcaoEstilo = {
  padding: '0 8px',
  fontSize: 12,
  color: 'var(--text-faint)',
  fontWeight: 500
};