import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Search, RotateCcw, Download, FileBarChart, Eraser } from 'lucide-react';
import { estoqueDemo, imeiDemo } from '../data/demoData';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function normalizarTexto(txt) {
  return String(txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lerLS(chave, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(chave));
    return Array.isArray(v) && v.length > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

// TROQUE por suas lojas reais (ativa: false aparece em vermelho)
const LOJAS = [
  { cod: 'CE', nome: 'CENTRO', ativa: true },
  { cod: 'CO', nome: 'CONDOMÍNIO', ativa: true },
  { cod: 'FL', nome: 'FLORESTA', ativa: false },
  { cod: 'GA', nome: 'GAMA', ativa: true },
  { cod: 'LU', nome: 'LUZIÂNIA', ativa: true },
  { cod: 'NO', nome: 'NOVO GAMA', ativa: true },
  { cod: 'PL', nome: 'PLANALTINA', ativa: true },
  { cod: 'SA', nome: 'SANTO ANTÔNIO', ativa: false },
  { cod: 'SM', nome: 'SAMAMBAIA', ativa: true },
  { cod: 'TA', nome: 'TAGUATINGA', ativa: true },
  { cod: 'VA', nome: 'VALPARAÍSO', ativa: true },
  { cod: 'VP', nome: 'VICENTE PIRES', ativa: true }
];

const TIPOS_PRODUTO = ['Aparelhos', 'Acessórios', 'Recargas', 'Simcard', 'Produtos Diversos', 'Produtos de Assinatura'];

function tipoDoItem(cat) {
  const c = normalizarTexto(cat);
  if (c.includes('acess')) return 'Acessórios';
  if (c.includes('recarga')) return 'Recargas';
  if (c.includes('sim')) return 'Simcard';
  if (c.includes('assin')) return 'Produtos de Assinatura';
  if (c.includes('produto') || c.includes('aparelho') || c.includes('smartphone')) return 'Aparelhos';
  return 'Produtos Diversos';
}

const FILTROS_INICIAIS = {
  somenteDisponivel: false,
  grupoLojas: 'TODAS',
  buscaLoja: '',
  lojas: [],
  visao: 'RESUMO',
  tipos: [],
  status: 'TODOS'
};

const estiloLabel = { fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6, display: 'block' };
const estiloSecao = { display: 'flex', flexDirection: 'column', gap: 6 };

// ---------------------------------------------------------------------------
// Tela: Relatório de Estoque (filtros + resultado)
// ---------------------------------------------------------------------------
function RelatorioEstoqueTela() {
  const [f, setF] = useState(FILTROS_INICIAIS);
  const [resultado, setResultado] = useState(null);

  const set = (campo, valor) => setF((atual) => ({ ...atual, [campo]: valor }));

  const alternarNaLista = (campo, valor) =>
    setF((atual) => ({
      ...atual,
      [campo]: atual[campo].includes(valor) ? atual[campo].filter((v) => v !== valor) : [...atual[campo], valor]
    }));

  const lojasVisiveis = useMemo(() => {
    const termo = normalizarTexto(f.buscaLoja);
    return LOJAS.filter((l) => {
      if (f.grupoLojas === 'ATIVAS' && !l.ativa) return false;
      if (f.grupoLojas === 'INATIVAS' && l.ativa) return false;
      return !termo || normalizarTexto(`${l.cod} ${l.nome}`).includes(termo);
    });
  }, [f.buscaLoja, f.grupoLojas]);

  const todasMarcadas = lojasVisiveis.length > 0 && lojasVisiveis.every((l) => f.lojas.includes(l.cod));

  const alternarTodas = () => {
    const cods = lojasVisiveis.map((l) => l.cod);
    setF((atual) => ({
      ...atual,
      lojas: todasMarcadas ? atual.lojas.filter((c) => !cods.includes(c)) : Array.from(new Set([...atual.lojas, ...cods]))
    }));
  };

  const limpar = () => {
    setF(FILTROS_INICIAIS);
    setResultado(null);
  };

  const gerar = () => {
    const estoque = lerLS('syscor_estoque', estoqueDemo);
    const seriais = lerLS('syscor_imei', imeiDemo);

    const linhas = estoque
      .map((i) => {
        const saldo = Number(i.saldo) || 0;
        const min = Number(i.min) || 2;
        const status = saldo <= 0 ? 'Ruptura' : saldo <= min ? 'Crítico' : 'Disponível';
        const listaSeriais = seriais
          .filter(
            (s) =>
              normalizarTexto(s.sku) === normalizarTexto(i.sku) &&
              (!s.status || String(s.status).toUpperCase() !== 'VENDIDO')
          )
          .map((s) => s.imei || s.imeiOuSerial)
          .filter((x) => x && x !== '—');

        return {
          loja: i.loja || '',
          sku: i.sku,
          nome: i.nome,
          tipo: tipoDoItem(i.cat),
          saldo,
          status,
          valor: saldo * (Number(i.preco) || 0),
          seriais: listaSeriais.join(', ')
        };
      })
      .filter((l) => !f.somenteDisponivel || l.saldo > 0)
      .filter((l) => f.lojas.length === 0 || !l.loja || f.lojas.includes(l.loja))
      .filter((l) => f.tipos.length === 0 || f.tipos.includes(l.tipo))
      .filter((l) => f.status === 'TODOS' || l.status === f.status);

    setResultado(linhas);
  };

  const colunas = [
    { key: 'sku', label: 'SKU', mono: true },
    { key: 'nome', label: 'Produto' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'status', label: 'Status', badge: true },
    { key: 'saldo', label: 'Saldo', align: 'right', fmt: (v) => `${v} un` },
    { key: 'valor', label: 'Valor em estoque', align: 'right', fmt: (v) => moeda.format(v) },
    ...(f.visao === 'DETALHADO' ? [{ key: 'seriais', label: 'IMEIs / Seriais' }] : [])
  ];

  const exportarCSV = () => {
    if (!resultado || resultado.length === 0) return;
    const aspas = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const cab = colunas.map((c) => aspas(c.label)).join(';');
    const corpo = resultado.map((l) => colunas.map((c) => aspas(l[c.key])).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + cab + '\n' + corpo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_estoque_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalSaldo = (resultado || []).reduce((acc, l) => acc + l.saldo, 0);
  const totalValor = (resultado || []).reduce((acc, l) => acc + l.valor, 0);

  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Cabeçalho da tela */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileBarChart size={20} color="var(--accent, #c026d3)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Relatório de Estoque</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Ajuste os filtros e gere o relatório</div>
          </div>
        </div>

        {/* Busca por estoque */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={f.somenteDisponivel}
            onChange={(e) => set('somenteDisponivel', e.target.checked)}
          />
          Somente itens com saldo disponível
        </label>

        {/* Lojas */}
        <div style={estiloSecao}>
          <span style={estiloLabel}>Lojas</span>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <select
              value={f.grupoLojas}
              onChange={(e) => set('grupoLojas', e.target.value)}
              style={{ minHeight: 34, height: 'auto', fontSize: 13 }}
            >
              <option value="TODAS">Todas as lojas</option>
              <option value="ATIVAS">Somente ativas</option>
              <option value="INATIVAS">Somente inativas</option>
            </select>

            <button
              type="button"
              className="btn sm ghost"
              onClick={() => setF((a) => ({ ...a, grupoLojas: 'TODAS', buscaLoja: '', lojas: [] }))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={13} /> Redefinir filtros
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Filtrar lojas..."
              value={f.buscaLoja}
              onChange={(e) => set('buscaLoja', e.target.value)}
              style={{ paddingLeft: 36, height: 36, fontSize: 13, width: '100%' }}
            />
          </div>

          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700 }}>
              <input type="checkbox" checked={todasMarcadas} onChange={alternarTodas} />
              Selecionar todas
              <span style={{ fontWeight: 400, color: 'var(--text-faint)' }}>({f.lojas.length} marcadas)</span>
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: 6,
                maxHeight: 220,
                overflowY: 'auto'
              }}
            >
              {lojasVisiveis.map((l) => {
                const marcada = f.lojas.includes(l.cod);
                return (
                  <label
                    key={l.cod}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      border: `1px solid ${marcada ? 'var(--accent, #7c3aed)' : 'var(--line-soft, #332a4d)'}`,
                      background: marcada ? 'var(--panel-2, #261f3d)' : 'transparent',
                      color: l.ativa ? 'var(--text)' : 'var(--bad, #ef4444)'
                    }}
                  >
                    <input type="checkbox" checked={marcada} onChange={() => alternarNaLista('lojas', l.cod)} />
                    {l.cod} - {l.nome}
                  </label>
                );
              })}
              {lojasVisiveis.length === 0 && (
                <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Nenhuma loja encontrada.</span>
              )}
            </div>
          </div>
        </div>

        {/* Visão */}
        <div style={estiloSecao}>
          <span style={estiloLabel}>Visão</span>
          <select
            value={f.visao}
            onChange={(e) => set('visao', e.target.value)}
            style={{ minHeight: 36, height: 'auto', fontSize: 13, maxWidth: 320 }}
          >
            <option value="RESUMO">Resumo Simples</option>
            <option value="DETALHADO">Detalhado (com seriais)</option>
          </select>
        </div>

        {/* Tipo de produto */}
        <div style={estiloSecao}>
          <span style={estiloLabel}>Tipo de Produto</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TIPOS_PRODUTO.map((t) => {
              const marcado = f.tipos.includes(t);
              return (
                <label
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    border: `1px solid ${marcado ? 'var(--accent, #7c3aed)' : 'var(--line, #382d54)'}`,
                    background: marcado ? 'var(--panel-2, #261f3d)' : 'transparent'
                  }}
                >
                  <input type="checkbox" checked={marcado} onChange={() => alternarNaLista('tipos', t)} />
                  {t}
                </label>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div style={estiloSecao}>
          <span style={estiloLabel}>Status</span>
          <select
            value={f.status}
            onChange={(e) => set('status', e.target.value)}
            style={{ minHeight: 36, height: 'auto', fontSize: 13, maxWidth: 320 }}
          >
            <option value="TODOS">Todos</option>
            <option value="Disponível">Disponível</option>
            <option value="Crítico">Crítico</option>
            <option value="Ruptura">Ruptura</option>
          </select>
        </div>

        {/* Resultado */}
        {resultado && (
          <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
            <div
              style={{
                padding: '10px 14px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                fontSize: 12.5,
                color: 'var(--text-faint)',
                borderBottom: '1px solid var(--line)'
              }}
            >
              <span>{resultado.length} itens</span>
              <span>Saldo total: <b style={{ color: 'var(--text)' }}>{totalSaldo} un</b></span>
              <span>Valor total: <b style={{ color: 'var(--text)' }}>{moeda.format(totalValor)}</b></span>
            </div>

            <div className="table-wrap" style={{ overflow: 'auto', maxHeight: 420 }}>
              <table style={{ margin: 0 }}>
                <thead>
                  <tr>
                    {colunas.map((c) => (
                      <th key={c.key} style={{ textAlign: c.align || 'left', whiteSpace: 'nowrap' }}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.length === 0 ? (
                    <tr>
                      <td colSpan={colunas.length} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-faint)' }}>
                        Nenhum item encontrado com esses filtros.
                      </td>
                    </tr>
                  ) : (
                    resultado.map((l, idx) => (
                      <tr key={`${l.sku}-${idx}`}>
                        {colunas.map((c) => {
                          if (c.badge) {
                            const cls = l.status === 'Ruptura' ? 'bad' : l.status === 'Crítico' ? 'warn' : 'good';
                            return <td key={c.key}><span className={`badge ${cls}`}>{l.status}</span></td>;
                          }
                          return (
                            <td
                              key={c.key}
                              className={c.mono || c.align === 'right' ? 'mono' : undefined}
                              style={{ textAlign: c.align || 'left', whiteSpace: c.key === 'seriais' ? 'normal' : 'nowrap' }}
                            >
                              {c.fmt ? c.fmt(l[c.key]) : l[c.key] || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Barra de ações fixa no rodapé da tela */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          borderTop: '1px solid var(--line)',
          background: 'var(--panel, #181329)',
          borderRadius: '0 0 12px 12px'
        }}
      >
        <button type="button" className="btn sm ghost" onClick={limpar} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Eraser size={14} /> Limpar filtros
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn sm"
            onClick={exportarCSV}
            disabled={!resultado || resultado.length === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button type="button" className="btn sm solid" onClick={gerar} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileBarChart size={14} /> Gerar relatório
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lista de relatórios (cards)
// ---------------------------------------------------------------------------
const RELATORIOS = [
  { id: 'compras', titulo: 'Compras', descricao: 'Visualizar relatório das entradas de produtos realizadas nas filiais.' },
  { id: 'estoque', titulo: 'Estoque', descricao: 'Visualizar relatório do estoque da revenda e de suas filiais.', tela: RelatorioEstoqueTela },
  { id: 'saida-produtos', titulo: 'Saída de Produtos', descricao: 'Visualiza o relatório de produtos que saíram do estoque por outros motivos seja por devolução ou roubo.' },
  { id: 'situacao', titulo: 'Situação', descricao: 'Visualiza a situação completa de um determinado produto, desde a compra, transferência até a venda.' },
  { id: 'tabela-precos', titulo: 'Tabela de Preços', descricao: 'Relatório dos produtos com seus respectivos valores de venda.' }
];

export default function RelatoriosEstoque() {
  const navigate = useNavigate();
  const [telaAtual, setTelaAtual] = useState(null); // null = lista de cards
  const [aberto, setAberto] = useState(null);

  const relatorioAtivo = RELATORIOS.find((r) => r.id === telaAtual);

  // Outra tela: substitui a lista de cards
  if (relatorioAtivo?.tela) {
    const Tela = relatorioAtivo.tela;
    return (
      <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <button
            type="button"
            className="btn sm ghost"
            onClick={() => setTelaAtual(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Voltar aos relatórios
          </button>
        </div>

        <div className="panel" style={{ padding: 0, borderRadius: 12, border: '1px solid var(--line)' }}>
          <Tela />
        </div>
      </section>
    );
  }

  const abrirRelatorio = (r) => {
    if (r.tela) setTelaAtual(r.id);
    else navigate(`/relatorios/${r.id}`);
  };

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {RELATORIOS.map((r) => {
        const isAberto = aberto === r.id;

        return (
          <div
            key={r.id}
            className="panel"
            style={{
              padding: 0,
              borderRadius: 12,
              border: `1px solid ${isAberto ? 'var(--accent, #7c3aed)' : 'var(--line)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent, #c026d3)', marginTop: 7, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--accent, #c026d3)' }}>{r.titulo}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 2 }}>{r.descricao}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button type="button" className="btn sm" onClick={() => abrirRelatorio(r)}>
                  Avaliar
                </button>

                <button
                  type="button"
                  aria-label={isAberto ? 'Recolher' : 'Expandir'}
                  aria-expanded={isAberto}
                  onClick={() => setAberto(isAberto ? null : r.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                >
                  <ChevronDown
                    size={16}
                    color="var(--text-faint)"
                    style={{ transform: isAberto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
                  />
                </button>
              </div>
            </div>

            {isAberto && (
              <div style={{ borderTop: '1px solid var(--line)', padding: '16px 18px', color: 'var(--text-faint)', fontSize: 13 }}>
                {r.descricao}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}