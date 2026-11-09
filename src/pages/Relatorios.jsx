import React, { useEffect, useState, useMemo } from 'react';
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
import { listarFiliais } from '../services/vendasApi';
import { loginDoToken } from '../services/api';
import * as documental from '../services/documentalApi';

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

const LISTA_SERVICOS_FILTRO = [
  'Alta', 'Migração', 'Reativação',
  'Seguro', 'SVA', 'Troca de Aparelho',
  'Troca de Aparelho Smartphone Pós', 'Troca de número', 'Troca de Plano',
  'Troca de Simcard', 'Troca de titularidade', 'Vinculado a Linha Contratada (Serviço)'
];
const LISTA_TIPOS_PLANO = documental.TIPOS_PLANO.map((t) => t.valor);

/** Data local em yyyy-MM-dd (toISOString usaria UTC e trocaria o dia à noite). */
const dataISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const inicioDoMes = () => { const d = new Date(); d.setDate(1); return dataISO(d); };
const hoje = () => dataISO(new Date());

/** UF da filial pelo prefixo do nome ("CE - FTZ CENTRO" -> "CE"). */
const ufDaFilial = (nome) => /^([A-Z]{2})\s*-/.exec(String(nome || '').trim())?.[1] || '';

/** Padrão de filtros do usuário: fica no navegador, por login. O período não é salvo (volta para o mês atual). */
const chavePadrao = () => `syscor_relatorio_documental_${loginDoToken() || 'anonimo'}`;
function lerPadrao() {
  try {
    return JSON.parse(localStorage.getItem(chavePadrao()) || 'null');
  } catch {
    return null;
  }
}
function gravarPadrao(padrao) {
  try {
    localStorage.setItem(chavePadrao(), JSON.stringify(padrao));
    return true;
  } catch {
    return false;
  }
}
function apagarPadrao() {
  try {
    localStorage.removeItem(chavePadrao());
  } catch {
    // storage indisponível: nada a apagar
  }
}

/* ==========================================================================
   TELA DE EXTRAÇÃO PARA EXCEL DA GESTÃO DOCUMENTAL (dados da API)
   ========================================================================== */
function TelaExtracaoGestaoDocumentalSyscor({ onVoltar }) {
  const padrao = useMemo(lerPadrao, []);

  const [filiais, setFiliais] = useState([]);
  const [erroFiliais, setErroFiliais] = useState('');
  const [filtroUf, setFiltroUf] = useState(padrao?.filtroUf || '');
  const [lojasSelecionadas, setLojasSelecionadas] = useState(padrao?.lojasSelecionadas || []);
  const [dataInicio, setDataInicio] = useState(inicioDoMes);
  const [dataFim, setDataFim] = useState(hoje);
  const [statusBko, setStatusBko] = useState(padrao?.statusBko || '');
  const [planosSelecionados, setPlanosSelecionados] = useState(padrao?.planosSelecionados || [...LISTA_TIPOS_PLANO]);
  const [servicosSelecionados, setServicosSelecionados] = useState(padrao?.servicosSelecionados || [...LISTA_SERVICOS_FILTRO]);

  const [quantidade, setQuantidade] = useState(null);
  const [contando, setContando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    listarFiliais({ incluirInativas: true })
      .then(setFiliais)
      .catch((e) => setErroFiliais(e.mensagem || 'Não foi possível carregar as filiais.'));
  }, []);

  const ufs = useMemo(() => [...new Set(filiais.map((f) => ufDaFilial(f.nome)).filter(Boolean))].sort(), [filiais]);
  const lojasExibidas = useMemo(
    () => (filtroUf ? filiais.filter((f) => ufDaFilial(f.nome) === filtroUf) : filiais),
    [filiais, filtroUf]
  );

  /** Filtros para a API. Nenhuma filial marcada = todas (as da UF, se houver UF); "Selecionar todos" = sem filtro. */
  const filtros = useMemo(() => {
    const filialIds = lojasSelecionadas.length
      ? lojasSelecionadas
      : (filtroUf ? lojasExibidas.map((f) => f.id) : []);
    return {
      dataInicio,
      dataFim,
      filialIds,
      statusBko,
      tiposPlano: planosSelecionados.length === LISTA_TIPOS_PLANO.length ? [] : planosSelecionados,
      servicos: servicosSelecionados.length === LISTA_SERVICOS_FILTRO.length ? [] : servicosSelecionados,
    };
  }, [dataInicio, dataFim, lojasSelecionadas, filtroUf, lojasExibidas, statusBko, planosSelecionados, servicosSelecionados]);

  const semPlanoOuServico = planosSelecionados.length === 0 || servicosSelecionados.length === 0;
  const periodoIncompleto = !dataInicio || !dataFim;

  // Quantidade de vendas antes de exportar (busca com size=1, lê o total)
  useEffect(() => {
    setMensagemErro('');
    if (periodoIncompleto || semPlanoOuServico) {
      setQuantidade(null);
      return undefined;
    }
    let cancelado = false;
    setContando(true);
    const t = setTimeout(() => {
      documental.contar(filtros)
        .then((n) => { if (!cancelado) setQuantidade(n); })
        .catch((e) => { if (!cancelado) { setQuantidade(null); setMensagemErro(e.mensagem || 'Falha ao contar as vendas.'); } })
        .finally(() => { if (!cancelado) setContando(false); });
    }, 400);
    return () => { cancelado = true; clearTimeout(t); };
  }, [filtros, periodoIncompleto, semPlanoOuServico]);

  const avisar = (texto) => {
    setMensagemSucesso(texto);
    setTimeout(() => setMensagemSucesso(''), 3500);
  };

  const handleToggleTodasLojas = (e) => {
    setLojasSelecionadas(e.target.checked ? lojasExibidas.map((l) => l.id) : []);
  };

  const handleToggleLoja = (id) => {
    setLojasSelecionadas((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleTodosPlanos = (e) => {
    setPlanosSelecionados(e.target.checked ? [...LISTA_TIPOS_PLANO] : []);
  };

  const handleTogglePlano = (plano) => {
    setPlanosSelecionados((prev) => (prev.includes(plano) ? prev.filter((p) => p !== plano) : [...prev, plano]));
  };

  const handleToggleTodosServicos = (e) => {
    setServicosSelecionados(e.target.checked ? [...LISTA_SERVICOS_FILTRO] : []);
  };

  const handleToggleServico = (servico) => {
    setServicosSelecionados((prev) => (prev.includes(servico) ? prev.filter((s) => s !== servico) : [...prev, servico]));
  };

  const redefinirFiltros = () => {
    setFiltroUf('');
    setLojasSelecionadas([]);
    setDataInicio(inicioDoMes());
    setDataFim(hoje());
    setStatusBko('');
    setPlanosSelecionados([...LISTA_TIPOS_PLANO]);
    setServicosSelecionados([...LISTA_SERVICOS_FILTRO]);
  };

  const handleSalvarPadrao = () => {
    const ok = gravarPadrao({ filtroUf, lojasSelecionadas, statusBko, planosSelecionados, servicosSelecionados });
    if (ok) avisar('Filtros salvos como seu padrão. Eles voltam quando você abrir esta tela.');
    else setMensagemErro('O navegador não deixou salvar os filtros (armazenamento indisponível).');
  };

  const handleApagarPadrao = () => {
    apagarPadrao();
    redefinirFiltros();
    avisar('Padrão apagado e filtros redefinidos.');
  };

  const handleExportarExcel = async () => {
    setMensagemErro('');
    if (periodoIncompleto) {
      setMensagemErro('Informe o período da venda.');
      return;
    }
    if (semPlanoOuServico) {
      setMensagemErro('Marque ao menos um tipo de plano e um serviço.');
      return;
    }
    setExportando(true);
    try {
      const total = await documental.contar(filtros);
      setQuantidade(total);
      if (total === 0) {
        setMensagemErro('Nenhuma venda encontrada para esses filtros');
        return;
      }
      await documental.exportar(filtros);
      avisar(`Relatório exportado com ${total} venda(s).`);
    } catch (e) {
      setMensagemErro(e.mensagem || e.message || 'Falha ao exportar o relatório.');
    } finally {
      setExportando(false);
    }
  };

  const campoData = {
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

        <button type="button" className="btn sm ghost" onClick={onVoltar} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Voltar à Seleção
        </button>
      </div>

      {mensagemSucesso && (
        <div role="status" style={{ background: 'var(--good-soft)', color: 'var(--good)', border: '1px solid var(--good)', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          ✓ {mensagemSucesso}
        </div>
      )}

      {(mensagemErro || erroFiliais) && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--bad, #ef4444)', border: '1px solid var(--bad, #ef4444)', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {mensagemErro || erroFiliais}
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
              onChange={(e) => { setFiltroUf(e.target.value); setLojasSelecionadas([]); }}
              style={{ width: 90, minHeight: 34, height: 'auto', fontSize: 12.5, background: 'var(--panel-2)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 8px' }}
            >
              <option value="">UF</option>
              {ufs.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>

            <button
              type="button"
              className="btn sm"
              onClick={redefinirFiltros}
              style={{ background: '#475569', borderColor: '#475569', color: '#fff', fontSize: 11.5, minHeight: 34, height: 'auto', padding: '6px 12px' }}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 14px' }}>
            {lojasExibidas.map((loja) => (
              <label
                key={loja.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', color: loja.ativo ? 'var(--text)' : 'var(--bad, #f43f5e)' }}
              >
                <input type="checkbox" checked={lojasSelecionadas.includes(loja.id)} onChange={() => handleToggleLoja(loja.id)} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {loja.nome}{loja.ativo ? '' : ' (INATIVA)'}
                </span>
              </label>
            ))}
          </div>
          <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 8 }}>
            Sem filial marcada, entram todas{filtroUf ? ` as filiais de ${filtroUf}` : ''}.
          </small>
        </div>

        <hr style={{ borderColor: 'var(--line-soft)', margin: '18px 0' }} />

        {/* 2. PERÍODO E STATUS BKO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22 }}>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6, display: 'block' }}>
              Período da Venda:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={campoData} />
              <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Até</span>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={campoData} />
            </div>
            <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 4 }}>Até 93 dias por exportação.</small>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6, display: 'block' }}>
              Status BKO:
            </label>
            <select
              value={statusBko}
              onChange={(e) => setStatusBko(e.target.value)}
              style={{ width: '100%', maxWidth: 280, minHeight: 38, height: 'auto', padding: '7px 12px', fontSize: 13, lineHeight: 1.4, background: 'var(--panel-2)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 6, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
            >
              <option value="">Todos</option>
              {documental.STATUS_BKO.map((s) => (
                <option key={s.valor} value={s.valor}>{s.rotulo}</option>
              ))}
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
            <input type="checkbox" checked={planosSelecionados.length === LISTA_TIPOS_PLANO.length} onChange={handleToggleTodosPlanos} />
            <span>Selecionar todos</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 14px' }}>
            {documental.TIPOS_PLANO.map((plano) => (
              <label key={plano.valor} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={planosSelecionados.includes(plano.valor)} onChange={() => handleTogglePlano(plano.valor)} />
                <span>{plano.rotulo}</span>
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
            <input type="checkbox" checked={servicosSelecionados.length === LISTA_SERVICOS_FILTRO.length} onChange={handleToggleTodosServicos} />
            <span>Selecionar todos</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 14px' }}>
            {LISTA_SERVICOS_FILTRO.map((serv) => (
              <label key={serv} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={servicosSelecionados.includes(serv)} onChange={() => handleToggleServico(serv)} />
                <span>{serv}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* BARRA FLUTUANTE DE AÇÕES */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(28, 23, 48, 0.95)', border: '1px solid var(--line)', borderRadius: 8, position: 'sticky', bottom: 16, zIndex: 50 }}>
        <span role="status" style={{ marginRight: 'auto', fontSize: 13, color: 'var(--text-dim, #cbd5e1)' }}>
          {periodoIncompleto ? 'Informe o período.'
            : semPlanoOuServico ? 'Marque ao menos um tipo de plano e um serviço.'
              : contando ? 'Contando vendas...'
                : quantidade === null ? '' : `${quantidade} venda(s) encontrada(s)`}
        </span>

        <button
          type="button"
          onClick={handleApagarPadrao}
          style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          Apagar <Trash2 size={14} />
        </button>

        <button
          type="button"
          onClick={handleSalvarPadrao}
          style={{ background: '#65a30d', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          Salvar <Check size={16} strokeWidth={3} />
        </button>

        <button
          type="button"
          onClick={handleExportarExcel}
          disabled={exportando}
          style={{ background: '#9333ea', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: exportando ? 'not-allowed' : 'pointer' }}
        >
          {exportando ? 'Exportando...' : 'Exportar'} <FileSpreadsheet size={15} />
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

      <div role="note" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warn, #f59e0b)', border: '1px solid var(--warn, #f59e0b)', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
        Dados de demonstração: esta extração ainda lê as vendas guardadas no navegador, e não as do sistema.
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
              {(PDVS || []).map(p => (
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