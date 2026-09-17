import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Filter, 
  RefreshCw, 
  FileSpreadsheet, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { PDVS } from '../data/demoData';

const REGIONAIS = [
  { id: 'CO', nome: 'Centro-Oeste (DF/GO/MT/MS)' },
  { id: 'SP', nome: 'São Paulo' },
  { id: 'NE', nome: 'Nordeste' },
  { id: 'SUL', nome: 'Sul' },
  { id: 'MG', nome: 'Minas Gerais' },
  { id: 'RJ', nome: 'Rio de Janeiro / ES' }
];

const MAPA_CATEGORIAS = [
  { chave: 'PRODUTO_VIVO', rotulo: 'Produto Vivo' },
  { chave: 'SERVICO_VIVO', rotulo: 'Serviço Vivo' },
  { chave: 'ACESSORIO', rotulo: 'Acessório' },
  { chave: 'RECARGA', rotulo: 'Recarga' }
];

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function parseDataBr(dataStr) {
  if (!dataStr) return null;
  // Trata formatos DD/MM/AAAA ou AAAA-MM-DD
  if (dataStr.includes('/')) {
    const [d, m, y] = dataStr.split('/');
    return new Date(y, m - 1, d);
  }
  return new Date(dataStr);
}

function baixarExcelCSV(cabecalhos, linhas, nomeArquivo) {
  const delimitador = ';';
  const csvLinhas = [
    cabecalhos.join(delimitador),
    ...linhas.map((linha) =>
      linha
        .map((campo) => {
          const valor = String(campo ?? '').replace(/"/g, '""');
          return `"${valor}"`;
        })
        .join(delimitador)
    ),
  ];

  const conteudoCSV = '\uFEFF' + csvLinhas.join('\r\n');
  const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DashboardRede() {
  // Estados dos filtros globais da rede
  const [filtros, setFiltros] = useState({
    loja: '',
    regional: '',
    dataInicio: '',
    dataFim: ''
  });

  // Base de vendas (obtida do localStorage ou dados de demonstração)
  const vendasGravadas = useMemo(() => {
    try {
      const locais = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
      if (locais.length > 0) return locais;

      return [
        {
          id: '000486',
          data: '02/09/2026',
          hora: '16:01',
          pdvId: 'pdv-1',
          cliente: 'João Pedro Martins',
          clienteDoc: '055.123.456-78',
          vendedorNome: 'Rafael Lima',
          valorTotal: 3448.90,
          status: 'FINALIZADA',
          itens: [
            { categoria: 'PRODUTO_VIVO', descricao: 'Smartphone 5G', valorTotal: 3448.90 }
          ]
        },
        {
          id: '000485',
          data: '02/09/2026',
          hora: '11:47',
          pdvId: 'pdv-1',
          cliente: 'João Pedro Martins',
          clienteDoc: '055.123.456-78',
          vendedorNome: 'Rafael Lima',
          valorTotal: 1899.00,
          status: 'FINALIZADA',
          itens: [
            { categoria: 'PRODUTO_VIVO', descricao: 'Aparelho Smart', valorTotal: 1899.00 }
          ]
        },
        {
          id: '000484',
          data: '01/09/2026',
          hora: '11:47',
          pdvId: 'pdv-2',
          cliente: 'Cliente Balcão',
          clienteDoc: '—',
          vendedorNome: 'Não informado',
          valorTotal: 2199.00,
          status: 'FINALIZADA',
          itens: [
            { categoria: 'PRODUTO_VIVO', descricao: 'Aparelho Vivo', valorTotal: 2199.00 }
          ]
        },
        {
          id: '000481',
          data: '01/09/2026',
          hora: '10:30',
          pdvId: 'pdv-1',
          cliente: 'Caio Silva de Sousa',
          clienteDoc: '063.860.213-04',
          vendedorNome: 'VILTON JODEVON SOARES FERREIRA',
          valorTotal: 3299.00,
          status: 'FINALIZADA',
          itens: [{ categoria: 'PRODUTO_VIVO', descricao: 'iPhone 14 128GB', valorTotal: 3299.00 }]
        },
        {
          id: '000480',
          data: '31/08/2026',
          hora: '16:45',
          pdvId: 'pdv-2',
          cliente: 'Ana Beatriz Souza',
          clienteDoc: '123.456.789-00',
          vendedorNome: 'Guilherme Caixeta',
          valorTotal: 120.00,
          status: 'FINALIZADA',
          itens: [{ categoria: 'SERVICO_VIVO', descricao: 'Vivo Fibra 500M', valorTotal: 120.00 }]
        }
      ];
    } catch {
      return [];
    }
  }, []);

  // Filtragem das vendas em memória
  const vendasFiltradas = useMemo(() => {
    return vendasGravadas.filter((venda) => {
      // 1. Filtro por Loja (PDV)
      if (filtros.loja && venda.pdvId !== filtros.loja) {
        return false;
      }

      // 2. Filtro por Data
      if (venda.data) {
        const dataVenda = parseDataBr(venda.data);
        if (filtros.dataInicio) {
          const dtInicio = new Date(filtros.dataInicio);
          dtInicio.setHours(0, 0, 0, 0);
          if (dataVenda < dtInicio) return false;
        }
        if (filtros.dataFim) {
          const dtFim = new Date(filtros.dataFim);
          dtFim.setHours(23, 59, 59, 999);
          if (dataVenda > dtFim) return false;
        }
      }

      return true;
    });
  }, [vendasGravadas, filtros]);

  // Totais por categoria baseados no conjunto filtrado
  const metricasCategorias = useMemo(() => {
    const totaisPorCat = {
      PRODUTO_VIVO: 0,
      SERVICO_VIVO: 0,
      ACESSORIO: 0,
      RECARGA: 0,
      PAGAMENTO: 0
    };

    let totalGeral = 0;

    vendasFiltradas.forEach((venda) => {
      (venda.itens || []).forEach((item) => {
        const cat = item.categoria || 'PRODUTO_VIVO';
        const valor = Number(item.valorTotal || item.valorUnitario || 0);
        if (totaisPorCat[cat] !== undefined) {
          totaisPorCat[cat] += valor;
        } else {
          totaisPorCat.PRODUTO_VIVO += valor;
        }
        totalGeral += valor;
      });
    });

    if (totalGeral === 0) {
      return MAPA_CATEGORIAS.map((cat) => ({
        rotulo: cat.rotulo,
        valor: 0,
        porcentagem: '0.0',
        alturaBarra: 6
      }));
    }

    const maiorValor = Math.max(...Object.values(totaisPorCat), 1);

    return MAPA_CATEGORIAS.map((cat) => {
      const valor = totaisPorCat[cat.chave] || 0;
      const porcentagem = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;
      const alturaBarra = maiorValor > 0 ? Math.max(8, (valor / maiorValor) * 100) : 8;

      return {
        rotulo: cat.rotulo,
        valor,
        porcentagem: porcentagem.toFixed(1),
        alturaBarra: Math.round(alturaBarra)
      };
    });
  }, [vendasFiltradas]);

  const faturamentoTotal = useMemo(() => {
    return vendasFiltradas.reduce((acc, v) => acc + (v.valorTotal || 0), 0);
  }, [vendasFiltradas]);

  const ticketMedio = useMemo(() => {
    return vendasFiltradas.length > 0 ? faturamentoTotal / vendasFiltradas.length : 0;
  }, [vendasFiltradas, faturamentoTotal]);

  const limparFiltros = () => {
    setFiltros({
      loja: '',
      regional: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  const handleExportarExcel = () => {
    const cabecalhos = ['ID Venda', 'Data', 'Hora', 'PDV', 'Cliente', 'CPF/Documento', 'Vendedor', 'Qtd Itens', 'Total (R$)', 'Status'];
    const linhas = vendasFiltradas.map((v) => [
      v.id,
      v.data,
      v.hora || '',
      v.pdvId ? (PDVS.find(p => p.id === v.pdvId)?.nome || v.pdvId) : 'Matriz',
      v.cliente,
      v.clienteDoc || '—',
      v.vendedorNome || '—',
      v.itens?.length || 0,
      (v.valorTotal || 0).toFixed(2).replace('.', ','),
      v.status || 'FINALIZADA'
    ]);
    baixarExcelCSV(cabecalhos, linhas, 'Dashboard_Rede_Vendas_Filtrado');
  };

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Topbar com Exportação Excel */}
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={24} color="var(--accent)" />
            Dashboard da Rede
          </h1>
          <div className="sub" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Calendar size={13} />
            <span>Consolidação analítica por filial, regional e período</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button 
            type="button" 
            className="btn solid" 
            onClick={handleExportarExcel}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <FileSpreadsheet size={16} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Filter size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>Filtros de Pesquisa da Rede</span>
          
          {(filtros.loja || filtros.regional || filtros.dataInicio || filtros.dataFim) && (
            <button
              type="button"
              onClick={limparFiltros}
              className="btn sm"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={12} /> Limpar
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Filtro Regional */}
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, marginBottom: 4 }}>Regional:</label>
            <select
              value={filtros.regional}
              onChange={(e) => setFiltros(prev => ({ ...prev, regional: e.target.value }))}
              style={{ width: '100%', minHeight: 38, height: 'auto', fontSize: 13 }}
            >
              <option value="">Todas as regionais</option>
              {REGIONAIS.map((r) => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>
          </div>

          {/* Filtro Loja / PDV */}
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, marginBottom: 4 }}>Loja / PDV:</label>
            <select
              value={filtros.loja}
              onChange={(e) => setFiltros(prev => ({ ...prev, loja: e.target.value }))}
              style={{ width: '100%', minHeight: 38, height: 'auto', fontSize: 13 }}
            >
              <option value="">Todas as lojas</option>
              {(PDVS || []).map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
              ))}
            </select>
          </div>

          {/* Data Início */}
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, marginBottom: 4 }}>Data Inicial:</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
              style={{ width: '100%', minHeight: 38, height: 'auto', fontSize: 13 }}
            />
          </div>

          {/* Data Fim */}
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, marginBottom: 4 }}>Data Final:</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
              style={{ width: '100%', minHeight: 38, height: 'auto', fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* CARDS DE KPIS */}
      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="kpi">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="lbl">Faturamento do Período</div>
            <DollarSign size={16} color="var(--accent)" />
          </div>
          <div className="val mono">{formatadorMoeda.format(faturamentoTotal)}</div>
          <div className="delta up">Total consolidado</div>
        </div>
        
        <div className="kpi">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="lbl">Vendas Realizadas</div>
            <ShoppingCart size={16} color="var(--accent)" />
          </div>
          <div className="val mono">{vendasFiltradas.length}</div>
          <div className="delta up">
            {vendasFiltradas.length === 1 ? '1 atendimento' : `${vendasFiltradas.length} atendimentos`}
          </div>
        </div>

        <div className="kpi">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="lbl">Ticket Médio</div>
            <TrendingUp size={16} color="var(--good)" />
          </div>
          <div className="val mono">{formatadorMoeda.format(ticketMedio)}</div>
          <div className="delta up">Por transação</div>
        </div>
      </div>

      {/* GRÁFICO DINÂMICO DE CATEGORIAS */}
      <div className="panel" style={{ padding: 20 }}>
        <div className="panel-head" style={{ marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Vendas por Categoria</h3>
            <span className="sub" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              Proporção dinâmica com base nos filtros ativos da rede
            </span>
          </div>
        </div>

        <div className="bar-chart" style={{ height: 210, alignItems: 'flex-end', gap: 16, paddingTop: 20 }}>
          {metricasCategorias.map((cat) => (
            <div 
              className="col" 
              key={cat.rotulo}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
            >
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
                {cat.porcentagem}%
              </span>

              <div 
                className="bar" 
                style={{ 
                  height: `${cat.alturaBarra}%`, 
                  width: '75%', 
                  transition: 'height 0.4s ease',
                  minHeight: 6,
                  borderRadius: '4px 4px 0 0'
                }} 
                title={`${cat.rotulo}: ${formatadorMoeda.format(cat.valor)} (${cat.porcentagem}%)`}
              />

              <div className="lbl" style={{ marginTop: 8, textAlign: 'center', fontWeight: 600, fontSize: 12 }}>
                {cat.rotulo}
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                {formatadorMoeda.format(cat.valor)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TABELA DE VENDAS */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="panel-head" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid var(--line-soft)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Vendas Filtradas</h3>
            <span className="sub" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              {vendasFiltradas.length} vendas encontradas
            </span>
          </div>
        </div>

        {vendasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 10px', color: 'var(--text-faint)' }}>
            Nenhuma venda encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="table-wrap">
            <table style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Nº Venda</th>
                  <th>Data</th>
                  <th>PDV</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th style={{ textAlign: 'center' }}>Qtd Itens</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.slice().reverse().map((v) => (
                  <tr key={v.id}>
                    <td><b>#{v.id}</b></td>
                    <td className="mono">{v.data} {v.hora || ''}</td>
                    <td>{v.pdvId ? (PDVS.find(p => p.id === v.pdvId)?.nome || v.pdvId) : 'Loja Shopping Centro'}</td>
                    <td>{v.cliente}</td>
                    <td>{v.vendedorNome}</td>
                    <td style={{ textAlign: 'center' }}>{v.itens?.length || 1}</td>
                    <td style={{ textAlign: 'right' }} className="mono">
                      <b>{formatadorMoeda.format(v.valorTotal || 0)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </section>
  );
}