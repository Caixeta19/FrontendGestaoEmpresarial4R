import React, { useState, useEffect, useCallback, useRef } from 'react';
import { request } from '../services/api';
import { listarFiliais } from '../services/vendasApi';
import {
  Filter, DollarSign, TrendingUp, ShoppingCart, AlertTriangle, Radio, RefreshCw
} from 'lucide-react';

const INTERVALO_MS = 30000; // atualiza sozinho a cada 30 s

const VAZIO = {
  faturamentoMesAtual: 0, metaOperacao: 0, percentualAtingimentoMeta: 0,
  volumeVendasTransacoes: 0, ticketMedio: 0, skusCriticosOuRuptura: 0,
  evolucaoVendas: [], atividadesRecentes: [],
};

const brl = (v) => Number(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dataExtenso = () => new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const horaAgora = () => new Date().toLocaleTimeString('pt-BR');

const cardStyle = { background: 'var(--panel, #181329)', border: '1px solid var(--line, #2c2445)', borderRadius: 12 };
const rotuloStyle = { fontSize: 12, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 };
const selectStyle = {
  height: 38, borderRadius: 8, background: 'var(--panel-2, #211c38)',
  border: '1px solid var(--line, #382d54)', color: 'var(--text, #fff)',
  padding: '0 10px', fontSize: 13, outline: 'none',
};

function Filtro({ rotulo, valor, onChange, opcoes, desabilitado, dica }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: desabilitado ? 0.5 : 1 }} title={dica}>
      <span style={rotuloStyle}>{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} disabled={desabilitado} style={selectStyle}>
        {opcoes.map(([v, texto]) => <option key={v} value={v}>{texto}</option>)}
      </select>
    </div>
  );
}

function Kpi({ rotulo, icone, corIcone, children }) {
  return (
    <div className="kpi" style={{ ...cardStyle, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="lbl" style={rotuloStyle}>{rotulo}</span>
        <span style={{ color: corIcone }}>{icone}</span>
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [dados, setDados] = useState(VAZIO);
  const [estado, setEstado] = useState('carregando'); // 'carregando' | 'ao-vivo' | 'erro'
  const [erro, setErro] = useState('');
  const [atualizadoEm, setAtualizadoEm] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [filiais, setFiliais] = useState([]);
  const [filial, setFilial] = useState('TODAS');

  const ultimaRequisicao = useRef(0);

  // Lista de filiais reais (o back filtra por filialId).
  useEffect(() => {
    listarFiliais()
      .then((lista) => setFiliais(Array.isArray(lista) ? lista : (lista?.content ?? [])))
      .catch(() => setFiliais([]));
  }, []);

  const carregar = useCallback(async () => {
    const id = ++ultimaRequisicao.current;
    setCarregando(true);
    try {
      const resposta = await request('/dashboard/executivo', {
        params: { filialId: filial === 'TODAS' ? undefined : filial },
      });
      if (id !== ultimaRequisicao.current) return; // resposta antiga: ignora
      setDados({ ...VAZIO, ...(resposta || {}) });
      setEstado('ao-vivo');
      setErro('');
      setAtualizadoEm(horaAgora());
    } catch (e) {
      if (id !== ultimaRequisicao.current) return;
      setEstado('erro');
      setErro(e?.mensagem || 'Não foi possível atualizar o painel.');
    } finally {
      if (id === ultimaRequisicao.current) setCarregando(false);
    }
  }, [filial]);

  // Carrega ao abrir, ao trocar de filial, a cada 30 s e ao voltar para a aba.
  useEffect(() => {
    carregar();
    const timer = setInterval(() => { if (!document.hidden) carregar(); }, INTERVALO_MS);
    const aoVoltar = () => { if (!document.hidden) carregar(); };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [carregar]);

  const evolucao = dados.evolucaoVendas || [];
  const atividades = dados.atividadesRecentes || [];
  const valorMaximoEvolucao = Math.max(...evolucao.map((m) => Number(m.valor) || 0), 1);
  const temMeta = Number(dados.metaOperacao) > 0;

  const selo = {
    'ao-vivo': { texto: 'Ao vivo', cor: 'var(--good, #22c55e)', fundo: 'rgba(34, 197, 94, 0.15)' },
    carregando: { texto: 'Carregando', cor: '#f59e0b', fundo: 'rgba(245, 158, 11, 0.15)' },
    erro: { texto: 'Sem conexão', cor: 'var(--bad, #ef4444)', fundo: 'rgba(239, 68, 68, 0.15)' },
  }[estado];

  const opcoesFilial = [
    ['TODAS', 'Todas as Lojas / PDVs'],
    ...filiais.map((f) => [String(f.id), f.nome ?? f.descricao ?? `Filial ${f.id}`]),
  ];

  return (
    <section className="view" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 30 }}>

      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)' }}>Painel Geral Executivo</h1>
          <div className="sub" style={{ marginTop: 4, color: 'var(--text-faint, #8c85a6)', fontSize: 13 }}>
            Visão consolidada da operação · {dataExtenso()}
            {atualizadoEm && ` · atualizado às ${atualizadoEm}`}
          </div>
        </div>
        <button onClick={carregar} disabled={carregando}
          style={{ ...selectStyle, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '0 14px' }}>
          <RefreshCw size={14} /> {carregando ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>

      {erro && (
        <div style={{ ...cardStyle, padding: '10px 14px', borderColor: 'var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', fontSize: 13 }}>
          {erro}
        </div>
      )}

      <div className="panel" style={{ ...cardStyle, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text, #fff)', fontSize: 13, fontWeight: 700 }}>
          <Filter size={15} color="var(--accent, #c026d3)" /> Filtros do Painel:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          <Filtro rotulo="Filial / PDV:" valor={filial} onChange={setFilial} opcoes={opcoesFilial} />
          <Filtro rotulo="Regional:" valor="TODAS" onChange={() => {}} desabilitado
            dica="Ainda não disponível no backend" opcoes={[['TODAS', 'Todas (em breve)']]} />
          <Filtro rotulo="Período:" valor="MES_ATUAL" onChange={() => {}} desabilitado
            dica="Ainda não disponível no backend" opcoes={[['MES_ATUAL', 'Mês Atual']]} />
          <Filtro rotulo="Categoria:" valor="TODAS" onChange={() => {}} desabilitado
            dica="Ainda não disponível no backend" opcoes={[['TODAS', 'Todas (em breve)']]} />
        </div>
      </div>

      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        <Kpi rotulo="Faturamento (Mês Atual)" icone={<DollarSign size={16} />} corIcone="var(--accent, #c026d3)">
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)', margin: '12px 0 6px 0' }}>
            R$ {brl(dados.faturamentoMesAtual)}
          </div>
          <div className="delta up" style={{ fontSize: 12, color: 'var(--good, #22c55e)', fontWeight: 600 }}>Consolidado total</div>
        </Kpi>

        <Kpi rotulo={temMeta ? `Meta da Operação (${Number(dados.percentualAtingimentoMeta).toFixed(1)}%)` : 'Meta da Operação'}
          icone={<TrendingUp size={16} />} corIcone="var(--good, #22c55e)">
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)', margin: '12px 0 10px 0' }}>
            {temMeta ? `R$ ${brl(dados.metaOperacao)}` : 'Não definida'}
          </div>
          <div style={{ width: '100%', background: 'var(--panel-2, #211c38)', height: 6, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ background: 'var(--good, #22c55e)', height: '100%', borderRadius: 4,
              width: `${Math.min(Number(dados.percentualAtingimentoMeta) || 0, 100)}%` }} />
          </div>
        </Kpi>

        <Kpi rotulo="Volume de Vendas" icone={<ShoppingCart size={16} />} corIcone="var(--accent, #c026d3)">
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text, #fff)', margin: '12px 0 6px 0' }}>
            {dados.volumeVendasTransacoes} vendas
          </div>
          <div className="delta up" style={{ fontSize: 12, color: 'var(--good, #22c55e)', fontWeight: 600 }}>
            Ticket médio: ~R$ {brl(dados.ticketMedio)}
          </div>
        </Kpi>

        <Kpi rotulo="Alertas de Estoque" icone={<AlertTriangle size={16} />} corIcone="var(--bad, #ef4444)">
          <div className="val mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--bad, #ef4444)', margin: '12px 0 6px 0' }}>
            {dados.skusCriticosOuRuptura} SKUs críticos
          </div>
          <div style={{ fontSize: 12, color: 'var(--bad, #ef4444)', fontWeight: 600, cursor: 'pointer' }}>Ver no estoque →</div>
        </Kpi>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>

        <div className="panel" style={{ ...cardStyle, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text, #fff)' }}>Evolução de Vendas</h2>
              <span style={rotuloStyle}>Todas as Categorias</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
              background: 'var(--panel-2, #211c38)', border: '1px solid var(--line, #382d54)', color: 'var(--text, #fff)' }}>
              Histórico 6M
            </span>
          </div>
          <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
            paddingTop: 20, paddingBottom: 8, borderBottom: '1px solid var(--line, #2c2445)' }}>
            {evolucao.length === 0 && <div style={{ ...rotuloStyle, margin: 'auto' }}>Sem vendas no período.</div>}
            {evolucao.map((item, idx) => {
              const altura = ((Number(item.valor) || 0) / valorMaximoEvolucao) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint, #8c85a6)', fontWeight: 600 }}>{item.valorFormatadoK}</span>
                  <div title={`R$ ${brl(item.valor)}`} style={{ width: '100%', height: `${altura}%`, minHeight: 2,
                    background: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)', borderRadius: '6px 6px 0 0',
                    transition: 'height 0.3s ease', cursor: 'pointer' }} />
                  <span style={rotuloStyle}>{item.mesRotulo}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ ...cardStyle, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text, #fff)' }}>Atividades Recentes</h2>
              <span style={rotuloStyle}>Feed de transações e contratos</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
              padding: '3px 9px', borderRadius: 20, background: selo.fundo, border: `1px solid ${selo.cor}`, color: selo.cor }}>
              <Radio size={12} /> {selo.texto}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {atividades.length === 0 && <div style={rotuloStyle}>Nenhuma venda registrada ainda.</div>}
            {atividades.map((item, idx) => (
              <div key={idx} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--panel-2, #211c38)',
                border: '1px solid var(--line-soft, #2c2445)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #fff)' }}>Venda {item.numeroPedido} {item.status}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint, #8c85a6)', marginTop: 2 }}>{item.clienteNome} · {item.vendedorNome}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #fff)' }}>R$ {brl(item.valorTotal)}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint, #8c85a6)', marginTop: 2 }}>{item.dataHora}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}