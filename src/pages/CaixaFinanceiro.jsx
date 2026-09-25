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
  Lock,
  PlusCircle,
  Plus
} from 'lucide-react';

export default function CaixaFinanceiro() {
  const [seccoesAbertas, setSeccoesAbertas] = useState({
    caixasAbertos: false,
    caixasPdv: false,
    caixasFechados: false,
    sangria: true,
    suprimentos: false
  });

  // 'painel' | 'caixasAbertosLista' | 'caixasFechadosLista' | 'caixasFechadosBusca'
  // 'sangriaCadastro' | 'sangriaBusca' | 'sangriaLista'
  const [visualizacaoAtual, setVisualizacaoAtual] = useState('painel');
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

  // =========================================================================
  // USUÁRIO AUTENTICADO DO SISTEMA
  // =========================================================================
  const usuarioLogadoNome = useMemo(() => {
    try {
      const sessaoArmazenada = 
        localStorage.getItem('syscor_usuario') || 
        localStorage.getItem('usuario_logado') || 
        localStorage.getItem('auth_user') || 
        localStorage.getItem('session');

      if (sessaoArmazenada) {
        const parsed = JSON.parse(sessaoArmazenada);
        return (parsed.nome || parsed.name || parsed.username || 'GUILHERME CAIXETA').toUpperCase();
      }
    } catch {
      // Ignora erro de parsing
    }
    return 'GUILHERME CAIXETA';
  }, []);

  // Bases de Dados Dinâmicas
  const [listaCaixasAbertos, setListaCaixasAbertos] = useState([
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
        { forma: 'Dinheiro', abertura: 288.65, movimento: 0.00, entradas: 0.00, saidas: 0.00, contabilizado: 288.65 }
      ]
    }
  ]);

  const [listaSangrias, setListaSangrias] = useState([]);

  // Estados do Formulário de Sangria
  const [formSangria, setFormSangria] = useState({
    pdv: 'Escolha...',
    caixa: '',
    usuario: usuarioLogadoNome,
    conta: 'Escolha...',
    valor: '',
    documento: '',
    observacao: ''
  });

  // Atualiza o usuário caso a sessão carregue dinamicamente
  useEffect(() => {
    setFormSangria(prev => ({ ...prev, usuario: usuarioLogadoNome }));
  }, [usuarioLogadoNome]);

  const [buscaSangria, setBuscaSangria] = useState({
    pdv: 'Todos',
    numeroMovimento: '',
    periodoInicio: '',
    periodoFim: ''
  });

  // Lista dinâmica de PDVs extraída da base
  const listaLojas = useMemo(() => {
    const lojas = Array.from(new Set(listaCaixasAbertos.map(c => c.pdv).filter(Boolean))).sort();
    return ['Escolha...', ...lojas];
  }, [listaCaixasAbertos]);

  // Caixas disponíveis para sangria de acordo com o PDV selecionado
  const caixasAbertosParaSangria = useMemo(() => {
    if (formSangria.pdv === 'Escolha...') return [];
    return listaCaixasAbertos.filter(c => c.pdv.trim().toUpperCase() === formSangria.pdv.trim().toUpperCase());
  }, [formSangria.pdv, listaCaixasAbertos]);

  const toggleSeccao = (chave) => {
    setSeccoesAbertas(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  const handleSalvarSangria = (e) => {
    e.preventDefault();
    if (formSangria.pdv === 'Escolha...') {
      alert('Selecione uma filial para prosseguir com a sangria.');
      return;
    }
    if (!formSangria.caixa) {
      alert('Não há caixa aberto disponível para sangria nesta filial.');
      return;
    }
    if (!formSangria.valor) {
      alert('Informe o valor da movimentação.');
      return;
    }

    const novaSangria = {
      id: String(Math.floor(Math.random() * 900000) + 100000),
      data: new Date().toLocaleDateString('pt-BR'),
      pdv: formSangria.pdv,
      caixa: formSangria.caixa,
      usuario: formSangria.usuario, // Usuário capturado no momento do login
      conta: formSangria.conta,
      valor: formSangria.valor,
      documento: formSangria.documento,
      observacao: formSangria.observacao
    };

    setListaSangrias([novaSangria, ...listaSangrias]);
    alert(`Sangria nº ${novaSangria.id} registrada com sucesso.`);
    setVisualizacaoAtual('sangriaLista');
  };

  // =========================================================================
  // 1. TELA: CADASTRO DE SANGRIA DE CAIXA (COM USUÁRIO DINÂMICO DO LOGIN)
  // =========================================================================
  if (visualizacaoAtual === 'sangriaCadastro') {
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
          {/* Topo com Título e Voltar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('painel')}
                title="Voltar ao Painel"
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#f472b6' }}>
                Cadastro de Sangria de Caixa
              </h1>
            </div>
          </div>

          {/* Faixa Amarela de Aviso */}
          <div style={{
            background: '#fef08a',
            color: '#854d0e',
            borderRadius: 6,
            padding: '10px 14px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 500
          }}>
            <Info size={16} />
            <span>O movimento será contabilizado na data do caixa aberto.</span>
          </div>

          {/* Formulário de Sangria */}
          <form onSubmit={handleSalvarSangria} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, marginTop: 8 }}>
            
            {/* Campo PDV */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>PDV</label>
              <select
                value={formSangria.pdv}
                onChange={(e) => {
                  const novoPdv = e.target.value;
                  const cxs = listaCaixasAbertos.filter(c => c.pdv.trim().toUpperCase() === novoPdv.trim().toUpperCase());
                  setFormSangria({
                    ...formSangria,
                    pdv: novoPdv,
                    caixa: cxs.length > 0 ? cxs[0].caixaPdv : ''
                  });
                }}
                style={inputEstiloFormulario}
              >
                {listaLojas.map(loja => (
                  <option key={loja} value={loja}>{loja}</option>
                ))}
              </select>
            </div>

            {/* Campo Caixa */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Caixa:</label>
              <div>
                {formSangria.pdv === 'Escolha...' ? (
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>Selecione uma filial</span>
                ) : caixasAbertosParaSangria.length === 0 ? (
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>Nenhum caixa aberto nesta filial</span>
                ) : (
                  <select
                    value={formSangria.caixa}
                    onChange={(e) => setFormSangria({ ...formSangria, caixa: e.target.value })}
                    style={inputEstiloFormulario}
                  >
                    {caixasAbertosParaSangria.map(c => (
                      <option key={c.id} value={c.caixaPdv}>{c.caixaPdv} (Turno #{c.id})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Campo Usuário: DINÂMICO CONFORME O LOGIN */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Usuário:</label>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {formSangria.usuario}
              </span>
            </div>

            {/* Campo Conta */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Conta:</label>
              <select
                value={formSangria.conta}
                onChange={(e) => setFormSangria({ ...formSangria, conta: e.target.value })}
                style={inputEstiloFormulario}
              >
                <option value="Escolha...">Escolha...</option>
                <option value="Cofre Loja">Cofre Loja</option>
                <option value="Despesas Operacionais">Despesas Operacionais</option>
                <option value="Depósito Bancário">Depósito Bancário</option>
              </select>
            </div>

            {/* Valor da movimentação */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Valor da movimentação:</label>
              <input
                type="text"
                placeholder="R$ 0,00"
                value={formSangria.valor}
                onChange={(e) => setFormSangria({ ...formSangria, valor: e.target.value })}
                style={{ ...inputEstiloFormulario, maxWidth: 160 }}
              />
            </div>

            {/* Cod Agência / Núm Documento */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Cod Agência / Núm Documento:</label>
              <input
                type="text"
                value={formSangria.documento}
                onChange={(e) => setFormSangria({ ...formSangria, documento: e.target.value })}
                style={{ ...inputEstiloFormulario, maxWidth: 180 }}
              />
            </div>

            {/* Observação */}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'flex-start', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginTop: 8 }}>Observação:</label>
              <textarea
                rows={4}
                value={formSangria.observacao}
                onChange={(e) => setFormSangria({ ...formSangria, observacao: e.target.value })}
                style={{ ...inputEstiloFormulario, resize: 'vertical' }}
              />
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('painel')}
                style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Salvar Sangria
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TELA: BUSCA DE MOVIMENTAÇÕES SAÍDA CAIXA
  // =========================================================================
  if (visualizacaoAtual === 'sangriaBusca') {
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
                onClick={() => setVisualizacaoAtual('painel')}
                title="Voltar ao Painel"
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#f472b6' }}>
                Busca de Movimentações Saída caixa
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>PDV</label>
              <select
                value={buscaSangria.pdv}
                onChange={(e) => setBuscaSangria({ ...buscaSangria, pdv: e.target.value })}
                style={{ ...inputEstiloFormulario, maxWidth: 300 }}
              >
                <option value="Todos">Todos</option>
                {listaLojas.filter(l => l !== 'Escolha...').map(loja => (
                  <option key={loja} value={loja}>{loja}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Número movimento:</label>
              <input
                type="text"
                value={buscaSangria.numeroMovimento}
                onChange={(e) => setBuscaSangria({ ...buscaSangria, numeroMovimento: e.target.value })}
                style={{ ...inputEstiloFormulario, maxWidth: 140 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Período:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="date"
                  value={buscaSangria.periodoInicio}
                  onChange={(e) => setBuscaSangria({ ...buscaSangria, periodoInicio: e.target.value })}
                  style={{ ...inputEstiloFormulario, maxWidth: 150 }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>a</span>
                <input
                  type="date"
                  value={buscaSangria.periodoFim}
                  onChange={(e) => setBuscaSangria({ ...buscaSangria, periodoFim: e.target.value })}
                  style={{ ...inputEstiloFormulario, maxWidth: 150 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('painel')}
                style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('sangriaLista')}
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
  // 3. TELA: LISTA DE SANGRIA DE CAIXA
  // =========================================================================
  if (visualizacaoAtual === 'sangriaLista') {
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
          {/* Topo com Título e 5 Botões de Ação */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
                <span style={{ width: 4, height: 18, background: 'var(--good, #22c55e)', borderRadius: 1 }} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#f472b6' }}>
                Lista de Sangria de Caixa
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setVisualizacaoAtual('painel')} style={botaoBarraSuperior}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Voltar</span>
                <ArrowLeft size={18} />
              </button>

              <button type="button" onClick={() => setModalAjudaAberto(true)} style={{ ...botaoBarraSuperior, background: '#7e22ce', color: '#fff' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ajuda</span>
                <HelpCircle size={18} />
              </button>

              <button type="button" onClick={() => setVisualizacaoAtual('sangriaLista')} style={{ ...botaoBarraSuperior, background: '#581c87', color: '#fff' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ver Todos</span>
                <Eye size={18} />
              </button>

              <button type="button" onClick={() => setVisualizacaoAtual('sangriaBusca')} style={{ ...botaoBarraSuperior, background: 'var(--panel-2)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)' }}>Buscar Registro</span>
                <Search size={18} color="var(--accent)" />
              </button>

              <button type="button" onClick={() => setVisualizacaoAtual('sangriaCadastro')} style={{ ...botaoBarraSuperior, background: '#4d7c0f', color: '#fff' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Inserir Registro</span>
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div style={{
            background: '#fef08a',
            color: '#854d0e',
            borderRadius: 6,
            padding: '10px 14px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 500
          }}>
            <Info size={16} />
            <span>
              {listaSangrias.length === 0 
                ? 'Nenhuma sangria de caixa encontrada no período.'
                : `${listaSangrias.length} sangria(s) encontrada(s) no período.`
              }
            </span>
          </div>

          {listaSangrias.length > 0 && (
            <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 11.5 }}>
                    <th style={{ padding: '12px 14px' }}>Nº</th>
                    <th style={{ padding: '12px 14px' }}>Data</th>
                    <th style={{ padding: '12px 14px' }}>PDV</th>
                    <th style={{ padding: '12px 14px' }}>Caixa</th>
                    <th style={{ padding: '12px 14px' }}>Conta Destino</th>
                    <th style={{ padding: '12px 14px' }}>Usuário</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '12px 14px' }}>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {listaSangrias.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.id}</td>
                      <td style={{ padding: '12px 14px' }}>{s.data}</td>
                      <td style={{ padding: '12px 14px' }}>{s.pdv}</td>
                      <td style={{ padding: '12px 14px' }}>{s.caixa}</td>
                      <td style={{ padding: '12px 14px' }}>{s.conta}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.usuario}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--bad, #ef4444)' }}>
                        - R$ {s.valor}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-faint)' }}>{s.observacao || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. TELA PRINCIPAL (CARDS SANFONA)
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

        {seccoesAbertas.sangria && (
          <div style={conteudoAbertoEstilo}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setVisualizacaoAtual('sangriaCadastro')}
                style={botaoQuadradoEstilo}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={iconeWrapperEstilo}><PlusCircle size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Inserir Registro</b>
              </button>

              <button
                type="button"
                onClick={() => setVisualizacaoAtual('sangriaBusca')}
                style={botaoQuadradoEstilo}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={iconeWrapperEstilo}><Search size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Buscar Registro</b>
              </button>

              <button
                type="button"
                onClick={() => setVisualizacaoAtual('sangriaLista')}
                style={botaoQuadradoEstilo}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={iconeWrapperEstilo}><Eye size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Ver Todos</b>
              </button>

              <button
                type="button"
                onClick={() => setModalAjudaAberto(true)}
                style={botaoQuadradoEstilo}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={iconeWrapperEstilo}><HelpCircle size={22} /></div>
                <b style={{ fontSize: 13.5 }}>Ajuda</b>
              </button>
            </div>
          </div>
        )}
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
            <h3 style={{ margin: 0, color: 'var(--text)' }}>Ajuda - Sangria de Caixa</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>
              A <b>Sangria de Caixa</b> é utilizada para registrar saídas de numerário da gaveta do PDV (ex: recolhimento para cofre ou pagamentos de despesas da loja). O movimento afeta diretamente o cálculo do <b>Movimento de Caixa</b> na conferência final do turno.
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