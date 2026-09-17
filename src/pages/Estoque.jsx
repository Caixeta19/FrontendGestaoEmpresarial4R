import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Search, 
  ArrowRightLeft, 
  Package, 
  RotateCcw, 
  ChevronDown, 
  CheckCircle2, 
  Upload, 
  AlertCircle,
  HelpCircle,
  Loader2,
  X
} from 'lucide-react';
import { estoqueDemo, imeiDemo } from '../data/demoData';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function normalizarTexto(txt) {
  return String(txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePreco(valor) {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  const limpo = String(valor)
    .replace('R$', '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
}

const OPCOES_PLANOS = [
  { id: 'pre', label: 'Tabela Regular (PRÉ)' },
  { id: 'controleBtl', label: 'Controle BTL' },
  { id: 'controleEntrada', label: 'Controle Entrada' },
  { id: 'controleAltoValor', label: 'Controle Alto Valor' },
  { id: 'posIndividual', label: 'Pós Individual' },
  { id: 'familia2', label: 'Família 2' },
  { id: 'familia3', label: 'Família 3' },
  { id: 'familia45', label: 'Família 4/5' },
  { id: 'vivoV', label: 'Vivo V' }
];

export default function Estoque() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [planoVisualizacao, setPlanoVisualizacao] = useState(() => {
    return localStorage.getItem('syscor_plano_visualizacao') || 'pre';
  });
  const [serialAbertoId, setSerialAbertoId] = useState(null);
  const [popoverPlanoId, setPopoverPlanoId] = useState(null);

  const [estoque, setEstoque] = useState([]);
  const [seriais, setSeriais] = useState([]);
  const [carregandoArquivo, setCarregandoArquivo] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', mensagem: '' });

  const carregarDados = () => {
    try {
      const estoqueSalvo = JSON.parse(localStorage.getItem('syscor_estoque'));
      const imeiSalvo = JSON.parse(localStorage.getItem('syscor_imei'));

      setEstoque(estoqueSalvo && estoqueSalvo.length > 0 ? estoqueSalvo : estoqueDemo);
      setSeriais(imeiSalvo && imeiSalvo.length > 0 ? imeiSalvo : imeiDemo);
    } catch {
      setEstoque(estoqueDemo);
      setSeriais(imeiDemo);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Fecha menus flutuantes ao clicar fora ou apertar Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSerialAbertoId(null);
        setPopoverPlanoId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMudarPlano = (novoPlano) => {
    setPlanoVisualizacao(novoPlano);
    localStorage.setItem('syscor_plano_visualizacao', novoPlano);
  };

  const resetarBaseDemo = () => {
    localStorage.removeItem('syscor_estoque');
    localStorage.removeItem('syscor_imei');
    localStorage.removeItem('syscor_matriz_precos');
    setEstoque(estoqueDemo);
    setSeriais(imeiDemo);
    setSerialAbertoId(null);
    setPopoverPlanoId(null);
    setFeedback({ tipo: 'sucesso', mensagem: 'Catálogo e seriais restaurados com sucesso!' });
    setTimeout(() => setFeedback({ tipo: '', mensagem: '' }), 4000);
  };

  // =========================================================================
  // IMPORTAÇÃO COMPLETA DE TODOS OS PLANOS (COLUNAS J ATÉ R)
  // =========================================================================
  const handleSelecionarArquivo = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setCarregandoArquivo(true);

    try {
      const arrayBuffer = await arquivo.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const nomeAba = workbook.SheetNames.find(s => s.trim().toUpperCase() === 'SMARTPHONES')
        || workbook.SheetNames.find(s => s.toUpperCase().includes('SMARTPHONE'))
        || workbook.SheetNames[0];

      const worksheet = workbook.Sheets[nomeAba];
      if (!worksheet) throw new Error(`Aba "${nomeAba}" não encontrada.`);

      const linhas = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (!linhas || linhas.length < 4) throw new Error('A planilha não possui linhas suficientes.');

      let idxLinhaCabecalho = 2;
      let colNome = 5;

      for (let r = 0; r < Math.min(10, linhas.length); r++) {
        const linhaStr = (linhas[r] || []).map(c => normalizarTexto(c));
        const pNome = linhaStr.findIndex(c => c.includes('nome comercial'));
        if (pNome !== -1) {
          idxLinhaCabecalho = r;
          colNome = pNome;
          break;
        }
      }

      const mapaPlanosAparelhos = {};

      for (let r = idxLinhaCabecalho + 1; r < linhas.length; r++) {
        const linha = linhas[r];
        if (!linha || linha.length === 0) continue;

        const nome = String(linha[colNome] || '').trim();
        if (!nome) continue;

        const pPre = parsePreco(linha[9]);
        if (pPre <= 0) continue;

        const precosPorPlano = {
          pre: pPre,
          controleBtl: parsePreco(linha[10]) || pPre,
          controleEntrada: parsePreco(linha[11]) || pPre,
          controleAltoValor: parsePreco(linha[12]) || pPre,
          posIndividual: parsePreco(linha[13]) || pPre,
          familia2: parsePreco(linha[14]) || pPre,
          familia3: parsePreco(linha[15]) || pPre,
          familia45: parsePreco(linha[16]) || pPre,
          vivoV: parsePreco(linha[17]) || pPre
        };

        mapaPlanosAparelhos[normalizarTexto(nome)] = precosPorPlano;
      }

      let atualizados = 0;
      const estoqueAtualizado = estoque.map((item) => {
        const nomeNorm = normalizarTexto(item.nome);
        let tabelaItem = mapaPlanosAparelhos[nomeNorm];

        if (!tabelaItem) {
          const matchChave = Object.keys(mapaPlanosAparelhos).find(k => 
            (k.length >= 6 && nomeNorm.includes(k)) || 
            (nomeNorm.length >= 6 && k.includes(nomeNorm))
          );
          if (matchChave) tabelaItem = mapaPlanosAparelhos[matchChave];
        }

        if (tabelaItem) {
          atualizados++;
          return {
            ...item,
            preco: tabelaItem.pre,
            precosPlano: tabelaItem
          };
        }
        return item;
      });

      const seriaisAtualizados = seriais.map((item) => {
        const nomeNorm = normalizarTexto(item.nome || item.descricao);
        let tabelaItem = mapaPlanosAparelhos[nomeNorm];

        if (!tabelaItem) {
          const matchChave = Object.keys(mapaPlanosAparelhos).find(k => 
            (k.length >= 6 && nomeNorm.includes(k)) || 
            (nomeNorm.length >= 6 && k.includes(nomeNorm))
          );
          if (matchChave) tabelaItem = mapaPlanosAparelhos[matchChave];
        }

        if (tabelaItem) {
          return {
            ...item,
            preco: tabelaItem.pre,
            valorUnitario: tabelaItem.pre,
            precosPlano: tabelaItem
          };
        }
        return item;
      });

      localStorage.setItem('syscor_estoque', JSON.stringify(estoqueAtualizado));
      localStorage.setItem('syscor_imei', JSON.stringify(seriaisAtualizados));
      localStorage.setItem('syscor_matriz_precos', JSON.stringify(mapaPlanosAparelhos));

      setEstoque(estoqueAtualizado);
      setSeriais(seriaisAtualizados);

      setFeedback({
        tipo: 'sucesso',
        mensagem: `Planilha oficial processada com sucesso! ${atualizados} modelos sincronizados com a matriz Vivo.`
      });
      setTimeout(() => setFeedback({ tipo: '', mensagem: '' }), 6000);

    } catch (err) {
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao processar planilha: ' + (err.message || 'Verifique o formato do arquivo.')
      });
    } finally {
      setCarregandoArquivo(false);
      e.target.value = '';
    }
  };

  const estoqueUnificado = useMemo(() => {
    return (estoque || []).map((item) => {
      const nomeNorm = normalizarTexto(item.nome);
      const skuNorm = normalizarTexto(item.sku);

      const seriaisAssociados = (seriais || []).filter((s) => {
        const sSkuNorm = normalizarTexto(s.sku);
        const sNomeNorm = normalizarTexto(s.nome || s.descricao);

        if (sSkuNorm && sSkuNorm === skuNorm) return true;
        if (nomeNorm.length >= 5 && sNomeNorm.includes(nomeNorm)) return true;
        if (sNomeNorm.length >= 5 && nomeNorm.includes(sNomeNorm)) return true;

        return false;
      });

      const disponiveis = seriaisAssociados.filter(
        (s) => !s.status || s.status.toUpperCase() !== 'VENDIDO'
      );

      const precoDinamico = item.precosPlano?.[planoVisualizacao] || item.preco || 0;

      return {
        ...item,
        precoVisualizacao: precoDinamico,
        seriaisDisponiveis: disponiveis.map((s) => s.imei || s.imeiOuSerial).filter((im) => im && im !== '—')
      };
    });
  }, [estoque, seriais, planoVisualizacao]);

  const estoqueFiltrado = useMemo(() => {
    return estoqueUnificado.filter((item) => {
      const termo = busca.toLowerCase().trim();
      const bateBusca =
        !termo ||
        item.nome.toLowerCase().includes(termo) ||
        item.sku.toLowerCase().includes(termo) ||
        (item.cat && item.cat.toLowerCase().includes(termo)) ||
        item.seriaisDisponiveis.some((imei) => String(imei).includes(termo));

      const bateCategoria =
        filtroCategoria === 'TODAS' ||
        (item.cat && item.cat.toUpperCase().includes(filtroCategoria));

      return bateBusca && bateCategoria;
    });
  }, [estoqueUnificado, busca, filtroCategoria]);

  const totaisGerais = useMemo(() => {
    const totalItens = estoqueFiltrado.reduce((acc, i) => acc + (i.saldo || 0), 0);
    const valorEstoque = estoqueFiltrado.reduce((acc, i) => acc + ((i.saldo || 0) * (i.precoVisualizacao || 0)), 0);
    const emRuptura = estoqueFiltrado.filter((i) => (i.saldo || 0) <= 0).length;

    return { totalItens, valorEstoque, emRuptura };
  }, [estoqueFiltrado]);

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelecionarArquivo}
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
      />

      {/* Topbar */}
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={24} color="var(--accent)" />
            Controle de Estoque
          </h1>
          <div className="sub" style={{ marginTop: 4, color: 'var(--text-faint)' }}>
            Visão consolidada de saldos físicos, seriais e precificação multissubsídio Vivo
          </div>
        </div>

        <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className="btn sm solid"
            onClick={() => fileInputRef.current?.click()}
            disabled={carregandoArquivo}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {carregandoArquivo ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
            {carregandoArquivo ? 'Processando...' : 'Importar Planilha Vivo (.xlsx)'}
          </button>

          <button
            type="button"
            className="btn sm ghost"
            onClick={resetarBaseDemo}
            title="Recarregar catálogo e seriais completos"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={14} /> Restaurar Padrão
          </button>

          <button
            type="button"
            className="btn sm"
            onClick={() => navigate('/estoque/inventario')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowRightLeft size={14} /> Inventário SAP
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback.mensagem && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 600,
          background: feedback.tipo === 'erro' ? 'rgba(239, 68, 68, 0.15)' : 'var(--good-soft, rgba(34, 197, 94, 0.15))',
          color: feedback.tipo === 'erro' ? 'var(--bad, #ef4444)' : 'var(--good, #22c55e)',
          border: `1px solid ${feedback.tipo === 'erro' ? 'var(--bad, #ef4444)' : 'var(--good, #22c55e)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {feedback.tipo === 'erro' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{feedback.mensagem}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedback({ tipo: '', mensagem: '' })}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Cards Rápidos */}
      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="kpi">
          <div className="lbl">Saldo Físico Geral</div>
          <div className="val mono">{totaisGerais.totalItens} un</div>
          <div className="delta up">{estoqueFiltrado.length} modelos listados</div>
        </div>

        <div className="kpi">
          <div className="lbl">Valor Total em Estoque</div>
          <div className="val mono">{formatadorMoeda.format(totaisGerais.valorEstoque)}</div>
          <div className="delta up">
            Plano: {OPCOES_PLANOS.find(p => p.id === planoVisualizacao)?.label}
          </div>
        </div>

        <div className="kpi">
          <div className="lbl">Itens em Ruptura / Críticos</div>
          <div className="val mono" style={{ color: totaisGerais.emRuptura > 0 ? 'var(--bad)' : 'var(--good)' }}>
            {totaisGerais.emRuptura} itens
          </div>
          <div className="delta down">{totaisGerais.emRuptura > 0 ? 'Exige reposição' : 'Regular'}</div>
        </div>
      </div>

      {/* Painel Tabela Unificada */}
      <div className="panel" style={{ padding: 0, overflow: 'visible' }}>
        
        {/* Filtros: Categoria, Seletor de Plano da Vivo e Busca */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              style={{ minHeight: 36, height: 'auto', fontSize: 13 }}
            >
              <option value="TODAS">Todas as Categorias</option>
              <option value="PRODUTO">Smartphones / Aparelhos</option>
              <option value="ACESS">Acessórios</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-faint)' }}>Modalidade:</span>
              <select
                value={planoVisualizacao}
                onChange={(e) => handleMudarPlano(e.target.value)}
                style={{
                  minHeight: 36,
                  height: 'auto',
                  fontSize: 13,
                  fontWeight: 600,
                  borderColor: 'var(--accent, #7c3aed)',
                  color: 'var(--accent, #7c3aed)'
                }}
              >
                {OPCOES_PLANOS.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {plano.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ position: 'relative', width: 300 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Buscar por modelo, SKU ou serial..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ paddingLeft: 36, height: 36, fontSize: 13 }}
            />
          </div>
        </div>

        <div className="table-wrap" style={{ overflow: 'visible' }}>
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 120 }}>SKU / Código</th>
                <th>Descrição do Aparelho / Item</th>
                <th>Categoria</th>
                <th style={{ textAlign: 'center', width: 100 }}>Estoque Mín.</th>
                <th style={{ textAlign: 'right', width: 110 }}>Saldo Físico</th>
                <th style={{ minWidth: 260 }}>IMEIs / Seriais Disponíveis</th>
                <th style={{ textAlign: 'right', width: 170 }}>
                  Preço ({OPCOES_PLANOS.find(p => p.id === planoVisualizacao)?.label.replace('Tabela Regular ', '')})
                </th>
              </tr>
            </thead>
            <tbody>
              {estoqueFiltrado.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-faint)' }}>
                    Nenhum item localizado.
                  </td>
                </tr>
              ) : (
                estoqueFiltrado.map((item) => {
                  const saldoZerado = (item.saldo || 0) <= 0;
                  const saldoCritico = !saldoZerado && (item.saldo || 0) <= (item.min || 2);
                  const isMenuAberto = serialAbertoId === item.sku;
                  const isPopoverAberto = popoverPlanoId === item.sku;

                  return (
                    <tr key={item.sku} style={{ opacity: saldoZerado ? 0.75 : 1 }}>
                      <td>
                        {saldoZerado ? (
                          <span className="badge bad">Ruptura</span>
                        ) : saldoCritico ? (
                          <span className="badge warn">Crítico</span>
                        ) : (
                          <span className="badge good">Disponível</span>
                        )}
                      </td>

                      <td className="mono"><b>{item.sku}</b></td>
                      <td><b>{item.nome}</b></td>
                      <td style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{item.cat}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-faint)' }}>{item.min} un</td>

                      <td style={{ textAlign: 'right' }} className="mono">
                        <b style={{ fontSize: 14, color: saldoZerado ? 'var(--bad)' : 'var(--text)' }}>
                          {item.saldo} un
                        </b>
                      </td>

                      {/* Coluna de Seriais com Dropdown */}
                      <td style={{ position: 'relative' }}>
                        {item.seriaisDisponiveis && item.seriaisDisponiveis.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                            {item.seriaisDisponiveis.slice(0, 2).map((serial) => (
                              <span
                                key={serial}
                                className="mono"
                                style={{
                                  background: 'var(--panel-2, #1c1730)',
                                  border: '1px solid var(--line-soft, #332a4d)',
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  fontSize: 11.5,
                                  color: 'var(--accent, #c026d3)',
                                  fontWeight: 600
                                }}
                              >
                                {serial}
                              </span>
                            ))}

                            {item.seriaisDisponiveis.length > 2 && (
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSerialAbertoId(isMenuAberto ? null : item.sku);
                                    setPopoverPlanoId(null);
                                  }}
                                  className="btn sm"
                                  style={{
                                    padding: '2px 8px',
                                    height: 24,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: 'var(--panel-2)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--line)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3
                                  }}
                                >
                                  +{item.seriaisDisponiveis.length - 2} seriais
                                  <ChevronDown size={12} />
                                </button>

                                {isMenuAberto && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: 'absolute',
                                      top: 'calc(100% + 4px)',
                                      left: 0,
                                      zIndex: 99999,
                                      minWidth: 230,
                                      background: 'var(--panel, #181329)',
                                      border: '1px solid var(--line, #382d54)',
                                      borderRadius: 8,
                                      padding: '10px 12px',
                                      boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 6
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Seriais em Estoque ({item.seriaisDisponiveis.length})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setSerialAbertoId(null)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 0 }}
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                    <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      {item.seriaisDisponiveis.map((serialCompleto) => (
                                        <div
                                          key={serialCompleto}
                                          className="mono"
                                          style={{
                                            fontSize: 12,
                                            padding: '4px 6px',
                                            borderRadius: 4,
                                            background: 'var(--panel-2)',
                                            color: 'var(--text)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                          }}
                                        >
                                          <span>{serialCompleto}</span>
                                          <CheckCircle2 size={12} color="var(--good, #22c55e)" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>—</span>
                        )}
                      </td>

                      {/* Coluna Preço por Plano com Popover Comparativo */}
                      <td style={{ textAlign: 'right', position: 'relative' }} className="mono">
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <b style={{ color: 'var(--text)', fontSize: 13.5 }}>
                            {formatadorMoeda.format(item.precoVisualizacao || 0)}
                          </b>

                          {item.precosPlano && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPopoverPlanoId(isPopoverAberto ? null : item.sku);
                                setSerialAbertoId(null);
                              }}
                              title="Ver comparativo de preços por plano"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 2,
                                color: isPopoverAberto ? 'var(--accent, #c026d3)' : 'var(--accent, #7c3aed)'
                              }}
                            >
                              <HelpCircle size={14} />
                            </button>
                          )}
                        </div>

                        {/* Janela Popover de Comparativo de Todos os Planos */}
                        {isPopoverAberto && item.precosPlano && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 4px)',
                              right: 0,
                              zIndex: 99999,
                              minWidth: 260,
                              background: 'var(--panel, #181329)',
                              border: '1px solid var(--line, #382d54)',
                              borderRadius: 8,
                              padding: '12px',
                              boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent, #c026d3)' }}>
                                PREÇOS: {item.nome}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPopoverPlanoId(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 0 }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                              {OPCOES_PLANOS.map((p) => (
                                <div
                                  key={p.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '3px 6px',
                                    borderRadius: 4,
                                    background: planoVisualizacao === p.id ? 'var(--panel-2, #261f3d)' : 'transparent',
                                    fontWeight: planoVisualizacao === p.id ? 700 : 400
                                  }}
                                >
                                  <span style={{ color: 'var(--text-dim)' }}>{p.label}:</span>
                                  <span className="mono">
                                    {formatadorMoeda.format(item.precosPlano[p.id] || item.preco || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}