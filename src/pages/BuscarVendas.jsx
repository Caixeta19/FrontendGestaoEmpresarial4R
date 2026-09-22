import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  X, 
  FileEdit, 
  Printer, 
  FileText, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { VENDEDORES, PDVS } from '../data/demoData';

export default function BuscarVendas() {
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState({
    pdv: 'Todos',
    vendedor: 'Todos',
    numeroVenda: '',
    periodoInicio: '',
    periodoFim: '',
    cliente: '',
    serialProdutoVivo: '',
    serialSimcard: '',
    serialProduto: '',
    modeloAcessorio: ''
  });

  const [resultados, setResultados] = useState([]);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleLimpar = () => {
    setFiltros({
      pdv: 'Todos',
      vendedor: 'Todos',
      numeroVenda: '',
      periodoInicio: '',
      periodoFim: '',
      cliente: '',
      serialProdutoVivo: '',
      serialSimcard: '',
      serialProduto: '',
      modeloAcessorio: ''
    });
    setResultados([]);
    setBuscaRealizada(false);
  };

  const handleBuscar = (e) => {
    e.preventDefault();

    const vendasSalvas = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
    const numeroLimpo = filtros.numeroVenda.trim().replace(/\D/g, '');
    const clienteBusca = filtros.cliente.trim().toLowerCase();

    // Filtra dados locais
    const filtrados = vendasSalvas.filter(v => {
      const vNum = String(v.id || v.numeroVenda || '').replace(/\D/g, '');
      const vCli = String(v.cliente || '').toLowerCase();

      if (numeroLimpo && !vNum.includes(numeroLimpo)) return false;
      if (clienteBusca && !vCli.includes(clienteBusca)) return false;
      if (filtros.vendedor !== 'Todos' && v.vendedor !== filtros.vendedor) return false;
      return true;
    });

    if (filtrados.length > 0) {
      setResultados(filtrados);
    } else {
      // Mock de demonstração caso a base esteja vazia
      setResultados([
        {
          id: filtros.numeroVenda || '000499',
          data: '22/09/2026 16:35',
          filial: filtros.pdv === 'Todos' ? '0142 - LOJA SHOPPING CENTRO' : filtros.pdv,
          vendedor: filtros.vendedor === 'Todos' ? 'MARINA FERREIRA' : filtros.vendedor,
          cliente: filtros.cliente || 'JOÃO PEDRO MARTINS',
          nf: '—'
        }
      ]);
    }

    setBuscaRealizada(true);
  };

  // Redireciona diretamente para a tela de venda com o registro carregado
  const handleAcessarVenda = (venda) => {
    navigate('/venda', {
      state: {
        vendaId: venda.id || venda.numeroVenda,
        clienteNome: venda.cliente,
        vendedorNome: venda.vendedor,
        vendaCarregada: venda
      }
    });
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      boxSizing: 'border-box'
    }}>
      
      {/* PAINEL PRINCIPAL DE BUSCA */}
      <form 
        onSubmit={handleBuscar}
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '24px 28px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease'
        }}
      >
        {/* TOPO COM TÍTULO E BOTÃO FECHAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--line)',
          paddingBottom: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={20} color="var(--accent, #c026d3)" />
            <h1 style={{
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--text)',
              margin: 0
            }}>
              Busca de Vendas
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/venda')}
            title="Fechar busca"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SUBTÍTULO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good, #22c55e)' }}>
          <ChevronRight size={18} strokeWidth={3} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Filtros Principais</h3>
        </div>

        {/* GRID DE FILTROS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '18px 28px'
        }}>
          
          {/* COLUNA ESQUERDA: PDV */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>PDV:</label>
            <select
              value={filtros.pdv}
              onChange={(e) => handleFiltroChange('pdv', e.target.value)}
              style={inputStyle}
            >
              <option value="Todos">Todos</option>
              {(PDVS || []).map(p => (
                <option key={p.id} value={p.codigo}>{p.codigo} — {p.nome}</option>
              ))}
            </select>
          </div>

          {/* COLUNA DIREITA: VENDEDOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Vendedor:</label>
            <select
              value={filtros.vendedor}
              onChange={(e) => handleFiltroChange('vendedor', e.target.value)}
              style={inputStyle}
            >
              <option value="Todos">Todos</option>
              {(VENDEDORES || []).map(v => (
                <option key={v.id} value={v.nome}>{v.nome}</option>
              ))}
            </select>
          </div>

          {/* COLUNA ESQUERDA: Nº */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nº:</label>
            <input
              type="text"
              placeholder="Ex: 000499"
              value={filtros.numeroVenda}
              onChange={(e) => handleFiltroChange('numeroVenda', e.target.value)}
              style={{ ...inputStyle, maxWidth: 280 }}
            />
          </div>

          {/* COLUNA DIREITA: PERÍODO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Período:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date"
                value={filtros.periodoInicio}
                onChange={(e) => handleFiltroChange('periodoInicio', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
              <input
                type="date"
                value={filtros.periodoFim}
                onChange={(e) => handleFiltroChange('periodoFim', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>

          {/* COLUNA ESQUERDA: CLIENTE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Cliente:</label>
            <input
              type="text"
              placeholder="Digite o nome ou CPF/CNPJ..."
              value={filtros.cliente}
              onChange={(e) => handleFiltroChange('cliente', e.target.value)}
              style={inputStyle}
            />
            <span style={{ fontSize: 11.5, color: '#38bdf8' }}>
              Digite as duas primeiras letras para iniciar a busca.
            </span>
          </div>

          {/* COLUNA DIREITA: SERIAL SIMCARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Serial Simcard:</label>
            <input
              type="text"
              placeholder="ICCID do chip..."
              value={filtros.serialSimcard}
              onChange={(e) => handleFiltroChange('serialSimcard', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* COLUNA ESQUERDA: SERIAL PRODUTO VIVO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Serial Produto Vivo:</label>
            <input
              type="text"
              placeholder="IMEI / Serial Vivo..."
              value={filtros.serialProdutoVivo}
              onChange={(e) => handleFiltroChange('serialProdutoVivo', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* COLUNA DIREITA: MODELO ACESSÓRIO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Modelo Acessório:</label>
            <input
              type="text"
              placeholder="Modelo do acessório..."
              value={filtros.modeloAcessorio}
              onChange={(e) => handleFiltroChange('modeloAcessorio', e.target.value)}
              style={inputStyle}
            />
            <span style={{ fontSize: 11.5, color: '#38bdf8' }}>
              Digite as duas primeiras letras para iniciar a busca.
            </span>
          </div>

          {/* COLUNA ESQUERDA: SERIAL PRODUTO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Serial Produto:</label>
            <input
              type="text"
              placeholder="Serial do produto..."
              value={filtros.serialProduto}
              onChange={(e) => handleFiltroChange('serialProduto', e.target.value)}
              style={inputStyle}
            />
          </div>

        </div>

        {/* BOTÕES DE AÇÃO */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid var(--line)'
        }}>
          <button
            type="button"
            onClick={handleLimpar}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 8,
              color: 'var(--text)',
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Limpar Campos
          </button>

          <button
            type="submit"
            style={{
              background: 'var(--accent, #c026d3)',
              border: 'none',
              borderRadius: 8,
              color: '#ffffff',
              padding: '8px 24px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Search size={15} />
            <span>Pesquisar</span>
          </button>
        </div>
      </form>

      {/* RESULTADOS DA PESQUISA */}
      {buscaRealizada && (
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
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Resultados Encontrados ({resultados.length})
          </h2>

          <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{
                  background: 'var(--panel-2)',
                  borderBottom: '1px solid var(--line)',
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                  fontSize: 11
                }}>
                  <th style={{ padding: '12px 16px' }}>Nº</th>
                  <th style={{ padding: '12px 16px', color: 'var(--good, #22c55e)' }}>Data</th>
                  <th style={{ padding: '12px 16px' }}>Filial</th>
                  <th style={{ padding: '12px 16px' }}>Vendedor</th>
                  <th style={{ padding: '12px 16px' }}>Cliente</th>
                  <th style={{ padding: '12px 16px' }}>NF</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((venda, idx) => (
                  <tr 
                    key={venda.id || idx}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: 'var(--panel)',
                      color: 'var(--text)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--panel)'}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      {venda.id || venda.numeroVenda}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {venda.data || '22/09/2026 16:35'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {venda.filial || '0142 - LOJA SHOPPING CENTRO'}
                    </td>
                    <td style={{ padding: '12px 16px', textTransform: 'uppercase' }}>
                      {venda.vendedor || 'MARINA FERREIRA'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {venda.cliente}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {venda.nf || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        
                        {/* BOTÃO ACESSAR E EDITAR VENDA */}
                        <button
                          type="button"
                          onClick={() => handleAcessarVenda(venda)}
                          title="Acessar e Editar Venda"
                          style={{
                            background: 'transparent',
                            border: '1px solid #38bdf8',
                            borderRadius: 6,
                            color: '#38bdf8',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <FileEdit size={15} />
                        </button>

                        {/* BOTÃO IMPRIMIR */}
                        <button
                          type="button"
                          onClick={() => window.print()}
                          title="Imprimir"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 4 }}
                        >
                          <Printer size={15} />
                        </button>

                        {/* BOTÃO GESTÃO DOCUMENTAL */}
                        <button
                          type="button"
                          onClick={() => navigate('/documental')}
                          title="Gestão Documental"
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent, #c026d3)', cursor: 'pointer', padding: 4 }}
                        >
                          <FileText size={15} />
                        </button>

                        {/* BOTÃO CANCELAR */}
                        <button
                          type="button"
                          onClick={() => alert(`Solicitação de cancelamento da venda ${venda.id}`)}
                          title="Cancelar Venda"
                          style={{ background: 'transparent', border: 'none', color: 'var(--bad, #ef4444)', cursor: 'pointer', padding: 4 }}
                        >
                          <XCircle size={15} />
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
    </div>
  );
}

// Estilo dinâmico dos campos baseado nas variáveis do tema
const inputStyle = {
  background: 'var(--input-bg)',
  border: '1px solid var(--line)',
  color: 'var(--text)',
  borderRadius: '8px',
  outline: 'none',
  padding: '8px 12px',
  fontSize: '13px',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease'
};