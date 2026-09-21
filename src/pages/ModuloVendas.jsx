import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Eye,
  HelpCircle,
  Smartphone,
  CreditCard,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Check,
  Edit,
  Printer,
  FileText,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { PDVS, VENDEDORES } from '../data/demoData';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export default function ModuloVendas() {
  const navigate = useNavigate();

  // Controle de colapso das secções
  const [abertoClienteLead, setAbertoClienteLead] = useState(false);
  const [abertoVenda, setAbertoVenda] = useState(true);

  // Estado dos Modais: null | 'BUSCA' | 'HOJE'
  const [modalAtivo, setModalAtivo] = useState(null);

  // -------------------------------------------------------------------------
  // ESTADO DE FILTROS DO MODAL DE BUSCA
  // -------------------------------------------------------------------------
  const [filtrosBusca, setFiltrosBusca] = useState({
    pdv: '',
    vendedor: '',
    numeroVenda: '',
    dataInicio: '',
    dataFim: '',
    cliente: '',
    serialProdutoVivo: '',
    serialSimcard: '',
    serialProduto: '',
    modeloAcessorio: '',
    numSolicitacao360: '',
    numAcesso: ''
  });

  const [vendasHistorico, setVendasHistorico] = useState([]);

  const carregarDadosVendas = () => {
    const dados = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
    setVendasHistorico(dados);
  };

  useEffect(() => {
    carregarDadosVendas();
  }, [modalAtivo]);

  // Data atual (DD/MM/AAAA)
  const dataHojeStr = useMemo(() => new Date().toLocaleDateString('pt-BR'), []);

  // Vendas filtradas apenas do dia de hoje
  const vendasDeHoje = useMemo(() => {
    return vendasHistorico.filter((v) => v.data && v.data.trim() === dataHojeStr.trim());
  }, [vendasHistorico, dataHojeStr]);

  // Vendas filtradas de acordo com os campos da Busca
  const vendasFiltradasBusca = useMemo(() => {
    return vendasHistorico.filter((venda) => {
      if (filtrosBusca.numeroVenda.trim() && !String(venda.id).includes(filtrosBusca.numeroVenda.trim())) {
        return false;
      }
      if (filtrosBusca.pdv && String(venda.pdvId) !== String(filtrosBusca.pdv)) {
        return false;
      }
      if (filtrosBusca.vendedor && String(venda.vendedorId) !== String(filtrosBusca.vendedor)) {
        return false;
      }
      if (filtrosBusca.cliente.trim()) {
        const termo = filtrosBusca.cliente.toLowerCase().trim();
        const nome = (venda.cliente || '').toLowerCase();
        const doc = (venda.clienteDoc || '').replace(/\D/g, '');
        const termoNum = termo.replace(/\D/g, '');
        if (!nome.includes(termo) && (!termoNum || !doc.includes(termoNum))) {
          return false;
        }
      }
      if (filtrosBusca.numAcesso.trim()) {
        const numLimpo = filtrosBusca.numAcesso.replace(/\D/g, '');
        const achouLinha = (venda.itens || []).some((i) => {
          const l = `${i.imeiOuSerial || ''} ${i.detalhes?.linha || ''} ${i.detalhes?.numeroLinha || ''}`;
          return l.replace(/\D/g, '').includes(numLimpo);
        });
        if (!achouLinha) return false;
      }
      if (filtrosBusca.serialProdutoVivo.trim()) {
        const termo = filtrosBusca.serialProdutoVivo.trim().toLowerCase();
        const achou = (venda.itens || []).some((i) =>
          i.categoria === 'PRODUTO_VIVO' && String(i.imeiOuSerial || '').toLowerCase().includes(termo)
        );
        if (!achou) return false;
      }
      if (filtrosBusca.serialSimcard.trim()) {
        const termo = filtrosBusca.serialSimcard.trim().toLowerCase();
        const achou = (venda.itens || []).some((i) =>
          i.categoria === 'SERVICO_VIVO' && String(i.imeiOuSerial || '').toLowerCase().includes(termo)
        );
        if (!achou) return false;
      }
      if (filtrosBusca.modeloAcessorio.trim()) {
        const termo = filtrosBusca.modeloAcessorio.trim().toLowerCase();
        const achou = (venda.itens || []).some((i) =>
          i.categoria === 'ACESSORIO' && (
            (i.descricao || '').toLowerCase().includes(termo) ||
            (i.imeiOuSerial || '').toLowerCase().includes(termo)
          )
        );
        if (!achou) return false;
      }
      if (filtrosBusca.dataInicio && venda.data) {
        const [d, m, y] = venda.data.split('/');
        const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        if (iso < filtrosBusca.dataInicio) return false;
        if (filtrosBusca.dataFim && iso > filtrosBusca.dataFim) return false;
      }
      return true;
    });
  }, [vendasHistorico, filtrosBusca]);

  const handleCancelarVenda = (vendaId) => {
    if (!window.confirm(`Deseja realmente cancelar/estornar a venda #${vendaId}?`)) return;
    const atualizado = vendasHistorico.filter((v) => String(v.id) !== String(vendaId));
    localStorage.setItem('syscor_vendas', JSON.stringify(atualizado));
    carregarDadosVendas();
  };

  const getNomeFilial = (pdvId) => {
    const p = (PDVS || []).find((x) => String(x.id) === String(pdvId));
    return p ? `${p.codigo} - ${p.nome}` : 'DF - PLANALTINA';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxWidth: 1280,
      width: '100%',
      margin: '0 auto'
    }}>
      {/* ===================================================================== */}
      {/* 1. SEÇÃO: CLIENTE / LEAD */}
      {/* ===================================================================== */}
      <div style={cardSectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={indicadorRoxoStyle} />
              <h2 style={tituloSecaoStyle}>Cliente / Lead</h2>
            </div>
            <p style={subtituloSecaoStyle}>Inclusão e alteração das informações dos clientes e leads.</p>
          </div>
          <button type="button" onClick={() => setAbertoClienteLead(!abertoClienteLead)} style={btnAvaliarStyle}>
            <span>Avaliar</span>
            {abertoClienteLead ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {abertoClienteLead && (
          <div style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 190px))',
            gap: 16
          }}>
            <button
              type="button"
              onClick={() => navigate('/clientes')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><PlusCircle size={22} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Novo Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/clientes')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><Search size={22} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Buscar Cliente</span>
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. SEÇÃO: VENDA */}
      {/* ===================================================================== */}
      <div style={cardSectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={indicadorRoxoStyle} />
              <h2 style={tituloSecaoStyle}>Venda</h2>
            </div>
            <p style={subtituloSecaoStyle}>Venda de produtos e serviços.</p>
          </div>

          <button type="button" onClick={() => setAbertoVenda(!abertoVenda)} style={btnAvaliarStyle}>
            <span>Avaliar</span>
            {abertoVenda ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {abertoVenda && (
          <div style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 190px))',
            gap: 16
          }}>
            {/* BOTÃO 1: Inserir Registro */}
            <button
              type="button"
              onClick={() => navigate('/venda/lancar')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><PlusCircle size={24} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Inserir Registro</span>
            </button>

            {/* BOTÃO 2: Buscar Registro */}
            <button
              type="button"
              onClick={() => setModalAtivo('BUSCA')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><Search size={24} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Buscar Registro</span>
            </button>

            {/* BOTÃO 3: Ver Vendas de Hoje */}
            <button
              type="button"
              onClick={() => setModalAtivo('HOJE')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><Eye size={24} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Ver Vendas de Hoje</span>
            </button>

            {/* BOTÃO 4: Ajuda */}
            <button
              type="button"
              onClick={() => alert('Central de Ajuda de Vendas')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><HelpCircle size={24} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Ajuda</span>
            </button>

            {/* BOTÃO 5: Vivo Renova */}
            <button
              type="button"
              onClick={() => alert('Módulo Vivo Renova')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><Smartphone size={24} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Vivo Renova</span>
            </button>

            {/* BOTÃO 6: Vincular TEF */}
            <button
              type="button"
              onClick={() => alert('Vinculação de TEF')}
              style={actionBtnStyle}
              onMouseEnter={(e) => aplicarHover(e, true)}
              onMouseLeave={(e) => aplicarHover(e, false)}
            >
              <div style={iconContainerStyle}><CreditCard size={24} color="#c084fc" /></div>
              <span style={actionBtnLabelStyle}>Vincular TEF</span>
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: BUSCA DE VENDAS */}
      {/* ===================================================================== */}
      {modalAtivo === 'BUSCA' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Search size={22} color="#c084fc" />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f5d0fe' }}>Busca de Vendas</h2>
              </div>
              <button
                type="button"
                onClick={() => setModalAtivo(null)}
                style={{ background: 'transparent', border: 'none', color: '#c084fc', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px 28px',
              borderBottom: '1px solid #232230',
              paddingBottom: 18
            }}>
              <div>
                <label style={labelStyle}>PDV:</label>
                <select
                  value={filtrosBusca.pdv}
                  onChange={(e) => setFiltrosBusca((p) => ({ ...p, pdv: e.target.value }))}
                  style={inputDarkStyle}
                >
                  <option value="">Todos</option>
                  {(PDVS || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Vendedor:</label>
                <select
                  value={filtrosBusca.vendedor}
                  onChange={(e) => setFiltrosBusca((p) => ({ ...p, vendedor: e.target.value }))}
                  style={inputDarkStyle}
                >
                  <option value="">Todos</option>
                  {(VENDEDORES || []).map((v) => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Nº Venda:</label>
                <input
                  type="text"
                  value={filtrosBusca.numeroVenda}
                  onChange={(e) => setFiltrosBusca((p) => ({ ...p, numeroVenda: e.target.value }))}
                  style={{ ...inputDarkStyle, maxWidth: 160 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Período:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="date"
                    value={filtrosBusca.dataInicio}
                    onChange={(e) => setFiltrosBusca((p) => ({ ...p, dataInicio: e.target.value }))}
                    style={{ ...inputDarkStyle, width: 130 }}
                  />
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Até</span>
                  <input
                    type="date"
                    value={filtrosBusca.dataFim}
                    onChange={(e) => setFiltrosBusca((p) => ({ ...p, dataFim: e.target.value }))}
                    style={{ ...inputDarkStyle, width: 130 }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Cliente (Nome ou CPF/CNPJ):</label>
                <input
                  type="text"
                  placeholder="Digite para filtrar..."
                  value={filtrosBusca.cliente}
                  onChange={(e) => setFiltrosBusca((p) => ({ ...p, cliente: e.target.value }))}
                  style={{ ...inputDarkStyle, maxWidth: 380 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Nº de Acesso (Linha):</label>
                <input
                  type="text"
                  placeholder="Ex: 62 99986-9888"
                  value={filtrosBusca.numAcesso}
                  onChange={(e) => setFiltrosBusca((p) => ({ ...p, numAcesso: e.target.value }))}
                  style={inputDarkStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Serial Produto Vivo / IMEI:</label>
                <input
                  type="text"
                  value={filtrosBusca.serialProdutoVivo}
                  onChange={(e) => setFiltrosBusca((p) => ({ ...p, serialProdutoVivo: e.target.value }))}
                  style={inputDarkStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setFiltrosBusca({
                  pdv: '', vendedor: '', numeroVenda: '', dataInicio: '', dataFim: '', cliente: '',
                  serialProdutoVivo: '', serialSimcard: '', serialProduto: '', modeloAcessorio: '',
                  numSolicitacao360: '', numAcesso: ''
                })}
                style={{
                  background: '#881337', border: '1px solid #be123c', color: '#fff',
                  borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                Apagar <RotateCcw size={14} />
              </button>
            </div>

            {/* Resultados da Pesquisa */}
            <div style={{ marginTop: 18, maxHeight: 260, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#171424', color: '#94a3b8', borderBottom: '1px solid #232230', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Nº</th>
                    <th style={{ padding: '8px 12px' }}>Data</th>
                    <th style={{ padding: '8px 12px' }}>Cliente</th>
                    <th style={{ padding: '8px 12px' }}>Vendedor</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasFiltradasBusca.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                        Nenhuma venda encontrada com os critérios fornecidos.
                      </td>
                    </tr>
                  ) : (
                    vendasFiltradasBusca.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #1c192b' }}>
                        <td style={{ padding: '8px 12px', color: '#c084fc', fontFamily: 'monospace' }}>#{v.id}</td>
                        <td style={{ padding: '8px 12px' }}>{v.data}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{v.cliente}</td>
                        <td style={{ padding: '8px 12px' }}>{v.vendedorNome}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>
                          {formatadorMoeda.format(v.valorTotal || 0)}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            title="Abrir Venda"
                            onClick={() => {
                              setModalAtivo(null);
                              navigate('/venda/lancar', { state: { vendaId: v.id } });
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer' }}
                          >
                            <Eye size={16} />
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
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: VENDAS DE HOJE */}
      {/* ===================================================================== */}
      {modalAtivo === 'HOJE' && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalContainerStyle, maxWidth: 1080 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Eye size={22} color="#c084fc" />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Vendas de Hoje ({dataHojeStr})
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={carregarDadosVendas}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid #2a283d',
                    color: '#c084fc', borderRadius: 6, padding: '4px 10px', fontSize: 12.5,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                  }}
                >
                  <RefreshCw size={13} /> Atualizar
                </button>
                <button
                  type="button"
                  onClick={() => setModalAtivo(null)}
                  style={{ background: 'transparent', border: 'none', color: '#c084fc', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div style={{ border: '1px solid #232230', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#161424', color: '#94a3b8', borderBottom: '1px solid #232230' }}>
                    <th style={{ padding: '12px 14px' }}>Nº</th>
                    <th style={{ padding: '12px 14px', color: '#4ade80' }}>Data</th>
                    <th style={{ padding: '12px 14px' }}>Filial</th>
                    <th style={{ padding: '12px 14px' }}>Vendedor</th>
                    <th style={{ padding: '12px 14px' }}>Cliente</th>
                    <th style={{ padding: '12px 14px' }}>NF</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasDeHoje.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                        Nenhuma venda realizada até ao momento no dia de hoje.
                      </td>
                    </tr>
                  ) : (
                    vendasDeHoje.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #171524', background: '#0e0c18' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#fff' }}>{item.id}</td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{item.data} {item.hora || '08:00'}</td>
                        <td style={{ padding: '12px 14px', fontSize: 12 }}>{getNomeFilial(item.pdvId)}</td>
                        <td style={{ padding: '12px 14px', fontSize: 12 }}>{item.vendedorNome || 'VENDEDOR'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{item.cliente || 'CLIENTE BALCÃO'}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{item.nf || ''}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <button
                              type="button"
                              title="Aceder à Venda"
                              onClick={() => {
                                setModalAtivo(null);
                                navigate('/venda/lancar', { state: { vendaId: item.id } });
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              title="Imprimir Comprovativo"
                              onClick={() => alert(`A imprimir comprovativo #${item.id}`)}
                              style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              type="button"
                              title="Termo / Contrato"
                              onClick={() => alert(`A gerar contrato #${item.id}`)}
                              style={{ background: 'transparent', border: 'none', color: '#a855f7', cursor: 'pointer' }}
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              type="button"
                              title="Cancelar Venda"
                              onClick={() => handleCancelarVenda(item.id)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ESTILOS VISUAIS
// ---------------------------------------------------------------------------
const cardSectionStyle = {
  background: '#13101d',
  border: '1px solid #231b2e',
  borderRadius: 10,
  padding: '20px 24px'
};

const indicadorRoxoStyle = {
  width: 5,
  height: 18,
  backgroundColor: '#c084fc',
  borderRadius: 3,
  display: 'inline-block'
};

const tituloSecaoStyle = {
  fontSize: 16,
  fontWeight: 700,
  margin: 0,
  color: '#ffffff'
};

const subtituloSecaoStyle = {
  margin: '4px 0 0 13px',
  color: '#94a3b8',
  fontSize: 13
};

const btnAvaliarStyle = {
  background: 'transparent',
  border: '1px solid #3c2f4e',
  color: '#e2e8f0',
  borderRadius: 20,
  padding: '6px 16px',
  fontSize: 12.5,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer'
};

const actionBtnStyle = {
  background: '#191526',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: 10,
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  outline: 'none'
};

const iconContainerStyle = {
  background: 'rgba(168, 85, 247, 0.15)',
  borderRadius: 10,
  padding: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const actionBtnLabelStyle = {
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 13.5,
  textAlign: 'center'
};

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(5, 4, 10, 0.85)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20
};

const modalContainerStyle = {
  background: '#0e0c18',
  border: '1px solid #27223c',
  borderRadius: 12,
  padding: 26,
  width: '100%',
  maxWidth: 960,
  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  marginBottom: 5,
  color: '#e2e8f0'
};

const inputDarkStyle = {
  width: '100%',
  height: 32,
  padding: '0 8px',
  background: '#151222',
  border: '1px solid #2d2644',
  borderRadius: 4,
  color: '#f1f5f9',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box'
};

const aplicarHover = (e, entrar) => {
  if (entrar) {
    e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.4)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  } else {
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.transform = 'translateY(0)';
  }
};