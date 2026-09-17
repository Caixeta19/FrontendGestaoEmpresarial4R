import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  ArrowRight, 
  ArrowLeft, 
  FileCheck2,
  Smartphone,
  FileText,
  ShoppingCart,
  FileEdit,
  ChevronRight,
  Check,
  Trash2
} from 'lucide-react';
import { PDVS, VENDEDORES } from '../data/demoData';

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

// 4 Relatórios principais
const ITENS_MENU_RELATORIOS = [
  {
    id: 'DOCUMENTAL',
    titulo: 'Gestão Documental',
    descricao: 'Confira os números de protocolos da Vivo dos serviços realizados pela revenda.',
    icone: FileCheck2
  },
  {
    id: 'PRODUTOS',
    titulo: 'Venda de Produtos',
    descricao: 'Confira os produtos vendidos nas suas lojas.',
    icone: Smartphone
  },
  {
    id: 'SERVICOS',
    titulo: 'Venda de Serviços',
    descricao: 'Confira os serviços vendidos nas suas lojas.',
    icone: FileText
  },
  {
    id: 'VENDAS',
    titulo: 'Vendas',
    descricao: 'Visualiza vendas feitas e também vendas canceladas.',
    icone: ShoppingCart
  }
];

// Lojas principais que operam vendas
const LOJAS_PRINCIPAIS_VENDA = [
  { id: 'pdv-1', codigo: '0142', nome: 'GO - LUZIANIA SHOPPING CORUMBA', uf: 'GO', cancelada: false },
  { id: 'pdv-2', codigo: '0143', nome: 'GO - ANAPOLIS CENTRO', uf: 'GO', cancelada: false },
  { id: 'pdv-3', codigo: '0144', nome: 'DF - PLANALTINA LOJA 01', uf: 'DF', cancelada: false },
  { id: 'pdv-4', codigo: '0145', nome: 'DF - SANTA MARIA SHOPPING', uf: 'DF', cancelada: false },
  { id: 'pdv-5', codigo: '0146', nome: 'CE - FORTALEZA DOM LUÍS', uf: 'CE', cancelada: false },
  { id: 'pdv-6', codigo: '0147', nome: 'CE - BENFICA SHOPPING', uf: 'CE', cancelada: false },
  { id: 'pdv-7', codigo: '0148', nome: 'CE - CAUCAIA (CANCELADA)', uf: 'CE', cancelada: true },
  { id: 'pdv-8', codigo: '0149', nome: 'GO - CALDAS NOVAS', uf: 'GO', cancelada: false }
];

const LISTA_TIPOS_PLANO = ['Controle', 'Pós', 'Pré'];

const LISTA_SERVICOS_FILTRO = [
  'Alta', 'Migração', 'Reativação',
  'Seguro', 'SVA', 'Troca de Aparelho',
  'Troca de número', 'Troca de Plano', 'Troca de Simcard',
  'Troca de titularidade'
];

// Base com dados reais para o ficheiro exportado em Excel
const REGISTROS_BASE_DOCUMENTAL = [
  {
    id: '000482',
    data: '02/09/2026 14:15',
    lojaId: 'pdv-1',
    lojaNome: 'GO - LUZIANIA SHOPPING CORUMBA',
    cliente: 'MARIANA RIBEIRO ALVES',
    cpf: '042.891.231-55',
    linha: '(61) 99437-3977',
    servico: 'Alta',
    tipoPlano: 'Controle',
    plano: 'Vivo Controle 30GB',
    protocolo: '472092420',
    vendedor: 'CARLOS EDUARDO',
    statusBko: 'Procedente',
    valorTotal: 74.90
  },
  {
    id: '000481',
    data: '01/09/2026 11:30',
    lojaId: 'pdv-2',
    lojaNome: 'GO - ANAPOLIS CENTRO',
    cliente: 'FERNANDO DIAS DA SILVA',
    cpf: '321.654.987-10',
    linha: '(61) 98112-4455',
    servico: 'Migração',
    tipoPlano: 'Pós',
    plano: 'Vivo Família 120GB',
    protocolo: '583920194',
    vendedor: 'JULIANA MENDES',
    statusBko: 'Em avaliacao pelo BKO',
    valorTotal: 180.00
  },
  {
    id: '000480',
    data: '01/09/2026 09:20',
    lojaId: 'pdv-3',
    lojaNome: 'DF - PLANALTINA LOJA 01',
    cliente: 'PATRÍCIA ROCHA FREITAS',
    cpf: '789.123.456-00',
    linha: '(61) 98765-1122',
    servico: 'Troca de Simcard',
    tipoPlano: 'Controle',
    plano: 'Vivo Controle 20GB',
    protocolo: '610293847',
    vendedor: 'VILTON JODEVON',
    statusBko: 'Improcedente',
    valorTotal: 59.90
  },
  {
    id: '000478',
    data: '31/08/2026 16:40',
    lojaId: 'pdv-5',
    lojaNome: 'CE - FORTALEZA DOM LUÍS',
    cliente: 'LUCAS GONÇALVES MARTINS',
    cpf: '654.987.321-44',
    linha: '(85) 99222-3344',
    servico: 'Reativação',
    tipoPlano: 'Pré',
    plano: 'Vivo Pré Turbo',
    protocolo: '719283719',
    vendedor: 'JULIANA MENDES',
    statusBko: 'Nao avaliado',
    valorTotal: 0.00
  }
];

/* ==========================================================================
   TELA DE EXTRAÇÃO PARA EXCEL DA GESTÃO DOCUMENTAL
   ========================================================================== */
function TelaExtracaoGestaoDocumentalSyscor({ onVoltar }) {
  const [filtroUf, setFiltroUf] = useState('');
  const [lojasSelecionadas, setLojasSelecionadas] = useState([]);

  // Período
  const [dataInicio, setDataInicio] = useState('2026-09-01');
  const [dataFim, setDataFim] = useState('2026-09-02');

  // Status BKO
  const [statusBko, setStatusBko] = useState('Todos');

  // Planos e Serviços
  const [planosSelecionados, setPlanosSelecionados] = useState([...LISTA_TIPOS_PLANO]);
  const [servicosSelecionados, setServicosSelecionados] = useState([...LISTA_SERVICOS_FILTRO]);

  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Lojas filtradas por UF
  const lojasExibidas = useMemo(() => {
    if (!filtroUf) return LOJAS_PRINCIPAIS_VENDA;
    return LOJAS_PRINCIPAIS_VENDA.filter(l => l.uf === filtroUf);
  }, [filtroUf]);

  const handleToggleTodasLojas = (e) => {
    setLojasSelecionadas(e.target.checked ? lojasExibidas.map(l => l.id) : []);
  };

  const handleToggleLoja = (id) => {
    setLojasSelecionadas(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleTodosPlanos = (e) => {
    setPlanosSelecionados(e.target.checked ? [...LISTA_TIPOS_PLANO] : []);
  };

  const handleTogglePlano = (plano) => {
    setPlanosSelecionados(prev => 
      prev.includes(plano) ? prev.filter(p => p !== plano) : [...prev, plano]
    );
  };

  const handleToggleTodosServicos = (e) => {
    setServicosSelecionados(e.target.checked ? [...LISTA_SERVICOS_FILTRO] : []);
  };

  const handleToggleServico = (servico) => {
    setServicosSelecionados(prev => 
      prev.includes(servico) ? prev.filter(s => s !== servico) : [...prev, servico]
    );
  };

  const redefinirFiltros = () => {
    setFiltroUf('');
    setLojasSelecionadas([]);
    setDataInicio('2026-09-01');
    setDataFim('2026-09-02');
    setStatusBko('Todos');
    setPlanosSelecionados([...LISTA_TIPOS_PLANO]);
    setServicosSelecionados([...LISTA_SERVICOS_FILTRO]);
    setMensagemSucesso('Filtros redefinidos com sucesso.');
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const handleExportarExcel = () => {
    const dadosParaExportar = REGISTROS_BASE_DOCUMENTAL.filter((v) => {
      if (lojasSelecionadas.length > 0 && !lojasSelecionadas.includes(v.lojaId)) {
        return false;
      }
      if (statusBko !== 'Todos' && v.statusBko !== statusBko) {
        return false;
      }
      if (planosSelecionados.length > 0 && !planosSelecionados.includes(v.tipoPlano)) {
        return false;
      }
      if (servicosSelecionados.length > 0 && !servicosSelecionados.includes(v.servico)) {
        return false;
      }
      return true;
    });

    const cabecalhos = [
      'Data/Hora',
      'Nº Venda',
      'Filial / Loja',
      'Cliente',
      'CPF',
      'Linha',
      'Serviço',
      'Tipo de Plano',
      'Plano Contratado',
      'Protocolo GED',
      'Vendedor',
      'Status BKO',
      'Valor Total (R$)'
    ];

    const baseFinal = dadosParaExportar.length > 0 ? dadosParaExportar : REGISTROS_BASE_DOCUMENTAL;

    const linhas = baseFinal.map((v) => [
      v.data,
      v.id,
      v.lojaNome,
      v.cliente,
      v.cpf,
      v.linha,
      v.servico,
      v.tipoPlano,
      v.plano,
      v.protocolo,
      v.vendedor,
      v.statusBko,
      v.valorTotal.toFixed(2).replace('.', ',')
    ]);

    baixarExcelCSV(cabecalhos, linhas, `Relatorio_Gestao_Documental_${dataInicio}_a_${dataFim}`);
    setMensagemSucesso('Ficheiro Excel exportado com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 3500);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileEdit size={22} color="var(--accent, #c026d3)" />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--accent, #c026d3)' }}>
            Relatório de Gestão Documental
          </h1>
        </div>

        <button
          type="button"
          className="btn sm ghost"
          onClick={onVoltar}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} /> Voltar à Seleção
        </button>
      </div>

      {mensagemSucesso && (
        <div style={{
          background: 'var(--good-soft)',
          color: 'var(--good)',
          border: '1px solid var(--good)',
          padding: '10px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600
        }}>
          ✓ {mensagemSucesso}
        </div>
      )}

      {/* PAINEL DE FILTROS PRINCIPAIS */}
      <div className="panel" style={{ padding: 24, background: 'var(--panel)', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good)', marginBottom: 20 }}>
          <ChevronRight size={18} strokeWidth={3} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Filtros Principais</h3>
        </div>

        {/* 1. SELEÇÃO DE FILIAL */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
            Filial:
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <select
              value={filtroUf}
              onChange={(e) => setFiltroUf(e.target.value)}
              style={{
                width: 90,
                minHeight: 34,
                height: 'auto',
                fontSize: 12.5,
                background: 'var(--panel-2)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                padding: '4px 8px'
              }}
            >
              <option value="">UF</option>
              <option value="GO">GO</option>
              <option value="DF">DF</option>
              <option value="CE">CE</option>
            </select>

            <button
              type="button"
              className="btn sm"
              onClick={redefinirFiltros}
              style={{
                background: '#475569',
                borderColor: '#475569',
                color: '#fff',
                fontSize: 11.5,
                minHeight: 34,
                height: 'auto',
                padding: '6px 12px'
              }}
            >
              Redefinir filtros
            </button>
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={lojasSelecionadas.length === lojasExibidas.length && lojasExibidas.length > 0}
              onChange={handleToggleTodasLojas}
            />
            <span>Selecionar todos</span>
          </label>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px 14px'
          }}>
            {lojasExibidas.map((loja) => (
              <label
                key={loja.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: loja.cancelada ? 'var(--bad, #f43f5e)' : 'var(--text)'
                }}
              >
                <input
                  type="checkbox"
                  checked={lojasSelecionadas.includes(loja.id)}
                  onChange={() => handleToggleLoja(loja.id)}
                />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {loja.nome}
                </span>
              </label>
            ))}
          </div>
        </div>

        <hr style={{ borderColor: 'var(--line-soft)', margin: '18px 0' }} />

        {/* 2. PERÍODO E STATUS BKO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22 }}>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6, display: 'block' }}>
              Período da Venda:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={{
                  maxWidth: 160,
                  minHeight: 38,
                  height: 'auto',
                  padding: '7px 10px',
                  fontSize: 13,
                  lineHeight: 1.4,
                  background: 'var(--panel-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Até</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                style={{
                  maxWidth: 160,
                  minHeight: 38,
                  height: 'auto',
                  padding: '7px 10px',
                  fontSize: 13,
                  lineHeight: 1.4,
                  background: 'var(--panel-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6, display: 'block' }}>
              Status BKO:
            </label>
            <select
              value={statusBko}
              onChange={(e) => setStatusBko(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 280,
                minHeight: 38,
                height: 'auto',
                padding: '7px 12px',
                fontSize: 13,
                lineHeight: 1.4,
                background: 'var(--panel-2)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="Todos">Todos</option>
              <option value="Improcedente">Improcedente</option>
              <option value="Procedente">Procedente</option>
              <option value="Nao avaliado">Não avaliado</option>
              <option value="Em avaliacao pelo BKO">Em avaliação pelo BKO</option>
            </select>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--line-soft)', margin: '18px 0' }} />

        {/* 3. TIPO DE PLANO */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
            Tipo de Plano:
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer', marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={planosSelecionados.length === LISTA_TIPOS_PLANO.length}
              onChange={handleToggleTodosPlanos}
            />
            <span>Selecionar todos</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 14px' }}>
            {LISTA_TIPOS_PLANO.map((plano) => (
              <label key={plano} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={planosSelecionados.includes(plano)}
                  onChange={() => handleTogglePlano(plano)}
                />
                <span>{plano}</span>
              </label>
            ))}
          </div>
        </div>

        <hr style={{ borderColor: 'var(--line-soft)', margin: '18px 0' }} />

        {/* 4. FILTRAR POR SERVIÇO */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
            Filtrar por serviço:
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer', marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={servicosSelecionados.length === LISTA_SERVICOS_FILTRO.length}
              onChange={handleToggleTodosServicos}
            />
            <span>Selecionar todos</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 14px' }}>
            {LISTA_SERVICOS_FILTRO.map((serv) => (
              <label key={serv} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={servicosSelecionados.includes(serv)}
                  onChange={() => handleToggleServico(serv)}
                />
                <span>{serv}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* BARRA FLUTUANTE DE AÇÕES */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        background: 'rgba(28, 23, 48, 0.95)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        position: 'sticky',
        bottom: 16,
        zIndex: 50
      }}>
        <button
          type="button"
          onClick={redefinirFiltros}
          style={{
            background: '#b91c1c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          Apagar <Trash2 size={14} />
        </button>

        <button
          type="button"
          onClick={() => {
            setMensagemSucesso('Filtros e parâmetros salvos com sucesso.');
            setTimeout(() => setMensagemSucesso(''), 3000);
          }}
          style={{
            background: '#65a30d',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 22px',
            fontSize: 13,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          Salvar <Check size={16} strokeWidth={3} />
        </button>

        <button
          type="button"
          onClick={handleExportarExcel}
          style={{
            background: '#9333ea',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          Exportar <FileSpreadsheet size={15} />
        </button>
      </div>

    </div>
  );
}

/* ==========================================================================
   TELA GENÉRICA DE EXTRAÇÃO PARA PRODUTOS, SERVIÇOS E VENDAS
   ========================================================================== */
function TelaExtracaoGenerica({ tipo, onVoltar, vendas }) {
  const [dataInicio, setDataInicio] = useState('2026-09-01');
  const [dataFim, setDataFim] = useState('2026-09-02');
  const [filtroPdv, setFiltroPdv] = useState('TODOS');
  const [filtroVendedor, setFiltroVendedor] = useState('TODOS');

  const titulo = tipo === 'PRODUTOS' ? 'Venda de Produtos' : tipo === 'SERVICOS' ? 'Venda de Serviços' : 'Vendas';

  const handleExportarGenerico = () => {
    const cabecalhos = ['Nº Venda', 'Data', 'Loja/PDV', 'Cliente', 'CPF', 'Vendedor', 'Total (R$)', 'Status'];
    const linhas = vendas.map(v => [
      v.id,
      v.data,
      v.pdvId || 'Loja Principal',
      v.cliente,
      v.clienteDoc || '—',
      v.vendedorNome || '—',
      (v.valorTotal || 0).toFixed(2).replace('.', ','),
      v.status || 'FINALIZADA'
    ]);
    baixarExcelCSV(cabecalhos, linhas, `Extracao_${tipo}_${dataInicio}_a_${dataFim}`);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <button
            type="button"
            className="btn sm ghost"
            onClick={onVoltar}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', marginBottom: 4 }}
          >
            <ArrowLeft size={15} /> Voltar aos Relatórios
          </button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Extração: {titulo}</h2>
        </div>

        <button
          type="button"
          className="btn sm solid"
          onClick={handleExportarGenerico}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <FileSpreadsheet size={15} /> Exportar Excel
        </button>
      </div>

      <div className="panel" style={{ padding: 24, background: 'var(--panel)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>Data Inicial:</label>
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
              style={{ minHeight: 38, height: 'auto' }}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>Data Final:</label>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
              style={{ minHeight: 38, height: 'auto' }}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>PDV / Loja:</label>
            <select 
              value={filtroPdv} 
              onChange={(e) => setFiltroPdv(e.target.value)}
              style={{ minHeight: 38, height: 'auto' }}
            >
              <option value="TODOS">Todas as Lojas</option>
              {LOJAS_PRINCIPAIS_VENDA.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>Vendedor:</label>
            <select 
              value={filtroVendedor} 
              onChange={(e) => setFiltroVendedor(e.target.value)}
              style={{ minHeight: 38, height: 'auto' }}
            >
              <option value="TODOS">Todos os Vendedores</option>
              {(VENDEDORES || []).map(v => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--panel-2)', borderRadius: 8, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
          Configure os parâmetros acima e clique no botão <b>"Exportar Excel"</b> para transferir diretamente o ficheiro compilado das vendas.
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   TELA PRINCIPAL EXCLUSIVA DE RELATÓRIO DE VENDAS (SEM OUTRAS ABAS)
   ========================================================================== */
export default function Relatorios() {
  const [relatorioAtivo, setRelatorioAtivo] = useState(null);

  const vendasGravadas = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
    } catch {
      return [];
    }
  }, []);

  // 1. Tela de Gestão Documental
  if (relatorioAtivo === 'DOCUMENTAL') {
    return (
      <section className="view">
        <TelaExtracaoGestaoDocumentalSyscor onVoltar={() => setRelatorioAtivo(null)} />
      </section>
    );
  }

  // 2. Outras telas de extração (Produtos, Serviços, Vendas)
  if (relatorioAtivo) {
    return (
      <section className="view">
        <TelaExtracaoGenerica 
          tipo={relatorioAtivo} 
          onVoltar={() => setRelatorioAtivo(null)} 
          vendas={vendasGravadas} 
        />
      </section>
    );
  }

  // 3. Menu principal dos 4 Relatórios
  return (
    <section className="view">
      <div className="topbar">
        <div>
          <h1>Relatório de Vendas</h1>
          <div className="sub">Consolidação e extração de dados comerciais por loja e período</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ITENS_MENU_RELATORIOS.map((item) => {
          return (
            <div
              key={item.id}
              className="panel"
              style={{
                padding: 0,
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: 'var(--panel)',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 24px',
                  cursor: 'pointer'
                }}
                onClick={() => setRelatorioAtivo(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 20, background: 'var(--accent, #c026d3)', borderRadius: 2 }} />
                  <div>
                    <b style={{ fontSize: 15, color: 'var(--text)', display: 'block' }}>{item.titulo}</b>
                    <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>{item.descricao}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn sm"
                  style={{
                    background: 'var(--panel-2)',
                    borderColor: 'var(--line)',
                    color: 'var(--text)',
                    borderRadius: 20,
                    padding: '6px 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600
                  }}
                >
                  Avaliar <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}