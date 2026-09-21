import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronRight, X, RotateCcw, Check, Eye } from 'lucide-react';
import { PDVS, VENDEDORES } from '../data/demoData';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const inputStyle = {
  width: '100%',
  height: 34,
  padding: '0 10px',
  background: '#13121b',
  border: '1px solid #2a283d',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box'
};

export default function BuscaVendas() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filtros, setFiltros] = useState({
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

  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
    setVendasHistorico(dadosSalvos);

    if (location.state?.dataInicial) {
      setFiltros((prev) => ({
        ...prev,
        dataInicio: location.state.dataInicial,
        dataFim: location.state.dataFinal || location.state.dataInicial
      }));
    }
  }, [location.state]);

  const handleLimparFiltros = () => {
    setFiltros({
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
  };

  const vendasFiltradas = useMemo(() => {
    return vendasHistorico.filter((venda) => {
      if (filtros.numeroVenda.trim() && !String(venda.id).includes(filtros.numeroVenda.trim())) {
        return false;
      }

      if (filtros.pdv && String(venda.pdvId) !== String(filtros.pdv)) {
        return false;
      }

      if (filtros.vendedor && String(venda.vendedorId) !== String(filtros.vendedor)) {
        return false;
      }

      if (filtros.cliente.trim()) {
        const termoCli = filtros.cliente.toLowerCase().trim();
        const nomeCli = (venda.cliente || '').toLowerCase();
        const docCli = (venda.clienteDoc || '').replace(/\D/g, '');
        const termoNum = termoCli.replace(/\D/g, '');

        const bateNome = nomeCli.includes(termoCli);
        const bateDoc = termoNum.length >= 2 && docCli.includes(termoNum);
        if (!bateNome && !bateDoc) return false;
      }

      if (filtros.numAcesso.trim()) {
        const numLimpo = filtros.numAcesso.replace(/\D/g, '');
        const encontrouLinha = (venda.itens || []).some((i) => {
          const dadosLinha = `${i.imeiOuSerial || ''} ${i.detalhes?.linha || ''} ${i.detalhes?.numeroLinha || ''}`;
          return dadosLinha.replace(/\D/g, '').includes(numLimpo);
        });
        if (!encontrouLinha) return false;
      }

      if (filtros.serialProdutoVivo.trim()) {
        const termo = filtros.serialProdutoVivo.trim().toLowerCase();
        const bateSerial = (venda.itens || []).some((i) =>
          i.categoria === 'PRODUTO_VIVO' && String(i.imeiOuSerial || '').toLowerCase().includes(termo)
        );
        if (!bateSerial) return false;
      }

      if (filtros.serialSimcard.trim()) {
        const termoChip = filtros.serialSimcard.trim().toLowerCase();
        const bateChip = (venda.itens || []).some((i) =>
          i.categoria === 'SERVICO_VIVO' && String(i.imeiOuSerial || '').toLowerCase().includes(termoChip)
        );
        if (!bateChip) return false;
      }

      if (filtros.modeloAcessorio.trim()) {
        const termoAcess = filtros.modeloAcessorio.trim().toLowerCase();
        const bateAcess = (venda.itens || []).some((i) =>
          i.categoria === 'ACESSORIO' && (
            (i.descricao || '').toLowerCase().includes(termoAcess) ||
            (i.imeiOuSerial || '').toLowerCase().includes(termoAcess)
          )
        );
        if (!bateAcess) return false;
      }

      if (filtros.dataInicio && venda.data) {
        const [dia, mes, ano] = venda.data.split('/');
        const dataVendaIso = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        if (dataVendaIso < filtros.dataInicio) return false;
        if (filtros.dataFim && dataVendaIso > filtros.dataFim) return false;
      }

      return true;
    });
  }, [vendasHistorico, filtros]);

  return (
    <div style={{
      maxWidth: 1160,
      margin: '0 auto',
      background: '#0d0d12',
      color: '#e2e8f0',
      borderRadius: 10,
      border: '1px solid #232230',
      padding: '24px 30px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={22} color="#c084fc" />
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#f5d0fe' }}>
            Busca de Vendas
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: '#c084fc', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: '#4ade80',
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 20
      }}>
        <ChevronRight size={18} />
        <span>Filtros Principais</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px 36px',
        borderBottom: '1px solid #1e1d2b',
        paddingBottom: 24
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>PDV:</label>
            <select
              value={filtros.pdv}
              onChange={(e) => setFiltros((prev) => ({ ...prev, pdv: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Todos</option>
              {(PDVS || []).map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Nº:</label>
            <input
              type="text"
              value={filtros.numeroVenda}
              onChange={(e) => setFiltros((prev) => ({ ...prev, numeroVenda: e.target.value }))}
              style={{ ...inputStyle, maxWidth: 160 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Vendedor:</label>
            <select
              value={filtros.vendedor}
              onChange={(e) => setFiltros((prev) => ({ ...prev, vendedor: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Todos</option>
              {(VENDEDORES || []).map((v) => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Período:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros((prev) => ({ ...prev, dataInicio: e.target.value }))}
                style={{ ...inputStyle, width: 140 }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Até</span>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros((prev) => ({ ...prev, dataFim: e.target.value }))}
                style={{ ...inputStyle, width: 140 }}
              />
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Cliente:</label>
          <input
            type="text"
            placeholder="Digite o nome ou CPF/CNPJ..."
            value={filtros.cliente}
            onChange={(e) => setFiltros((prev) => ({ ...prev, cliente: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 360 }}
          />
          <small style={{ color: '#38bdf8', fontSize: 11, display: 'block', marginTop: 4 }}>
            Digite as duas primeiras letras para iniciar a busca.
          </small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Serial Produto Vivo:</label>
          <input
            type="text"
            value={filtros.serialProdutoVivo}
            onChange={(e) => setFiltros((prev) => ({ ...prev, serialProdutoVivo: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 280 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Serial Simcard:</label>
          <input
            type="text"
            value={filtros.serialSimcard}
            onChange={(e) => setFiltros((prev) => ({ ...prev, serialSimcard: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 280 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Serial Produto:</label>
          <input
            type="text"
            value={filtros.serialProduto}
            onChange={(e) => setFiltros((prev) => ({ ...prev, serialProduto: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 280 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Modelo Acessório:</label>
          <input
            type="text"
            value={filtros.modeloAcessorio}
            onChange={(e) => setFiltros((prev) => ({ ...prev, modeloAcessorio: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 360 }}
          />
          <small style={{ color: '#38bdf8', fontSize: 11, display: 'block', marginTop: 4 }}>
            Digite as duas primeiras letras para iniciar a busca.
          </small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Nº Solicitação 360:</label>
          <input
            type="text"
            value={filtros.numSolicitacao360}
            onChange={(e) => setFiltros((prev) => ({ ...prev, numSolicitacao360: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 240 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#e2e8f0' }}>Nº de acesso:</label>
          <input
            type="text"
            placeholder="Ex: 62 99986-9888"
            value={filtros.numAcesso}
            onChange={(e) => setFiltros((prev) => ({ ...prev, numAcesso: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 240 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <button
          type="button"
          onClick={handleLimparFiltros}
          style={{
            background: '#881337',
            border: '1px solid #be123c',
            color: '#ffffff',
            borderRadius: 6,
            padding: '8px 18px',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          Apagar <RotateCcw size={15} />
        </button>

        <button
          type="button"
          style={{
            background: '#65a30d',
            border: '1px solid #84cc16',
            color: '#ffffff',
            borderRadius: 6,
            padding: '8px 24px',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          Salvar <Check size={16} />
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#cbd5e1', marginBottom: 12 }}>
          Registros Encontrados ({vendasFiltradas.length})
        </h3>

        <div style={{ overflowX: 'auto', border: '1px solid #1e1d2b', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#13121b', borderBottom: '1px solid #232230', color: '#94a3b8' }}>
                <th style={{ padding: '10px 14px' }}>Nº Venda</th>
                <th style={{ padding: '10px 14px' }}>Data/Hora</th>
                <th style={{ padding: '10px 14px' }}>Cliente</th>
                <th style={{ padding: '10px 14px' }}>CPF/CNPJ</th>
                <th style={{ padding: '10px 14px' }}>Vendedor</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '10px 14px', width: 60, textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                    Nenhuma venda localizada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                vendasFiltradas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #1a1926' }}>
                    <td style={{ padding: '10px 14px', color: '#c084fc', fontFamily: 'monospace' }}>#{v.id}</td>
                    <td style={{ padding: '10px 14px' }}>{v.data} {v.hora ? `às ${v.hora}` : ''}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{v.cliente}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{v.clienteDoc}</td>
                    <td style={{ padding: '10px 14px' }}>{v.vendedorNome}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#4ade80' }}>
                      {formatadorMoeda.format(v.valorTotal || 0)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        title="Ver / Abrir Venda"
                        onClick={() => navigate('/vendas/lancar', { state: { vendaId: v.id } })}
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
  );
}