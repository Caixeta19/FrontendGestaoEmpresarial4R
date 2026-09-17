import React, { useState } from 'react';
import { 
  Home, 
  Shield, 
  RefreshCw
} from 'lucide-react';

// ============================================================================
// 1. MAPEAMENTO DOS 19 MÓDULOS DA CAPA POWER BI
// ============================================================================
const MODULOS_CAPA = [
  { id: 'alavancas', label: 'ALAVANCAS' },
  { id: 'lojas', label: 'LOJAS' },
  { id: 'historico', label: 'HISTORICO 2026' },
  { id: 'hc', label: 'ACOMPANHAMENTO HC' },
  { id: 'comite_diario', label: 'COMITÊ DIÁRIO DE ALAVANCAS' },
  { id: 'one_page', label: 'ONE PAGE LOJAS' },
  { id: 'resumo_dias', label: 'RESUMO DIAS S/V' },
  { id: 'logistica', label: 'LOGÍSTICA' },
  { id: 'parcial', label: 'PARCIAL' },
  { id: 'forma_pagamento', label: 'FORMA DE PAGAMENTO' },
  { id: 'tfp', label: 'TFP' },
  { id: 'estoque', label: 'ESTOQUE' },
  { id: 'oportunidades', label: 'OPORTUNIDADES' },
  { id: 'cns_venda_zero', label: "CN'S VENDA ZERO" },
  { id: 'acelera_terminais', label: 'ACELERA TERMINAIS' },
  { id: 'paineis_vendas', label: 'PAINEIS VENDAS 2026' },
  { id: 'oportunidades_2', label: 'OPORTUNIDADES 2.0' },
  { id: 'mailing', label: 'MAILING' },
  { id: 'televendas', label: 'TELEVENDAS' }
];

// ============================================================================
// COMPONENTE PRINCIPAL (ROTEADOR DE ESTADO)
// ============================================================================
export default function PowerBICompleto() {
  const [telaAtiva, setTelaAtiva] = useState('HUB');

  return (
    <div style={{ minHeight: '100vh', background: '#0b0814', color: '#fff', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
      {telaAtiva === 'HUB' && <TelaCapaHub onNavegar={setTelaAtiva} />}
      {telaAtiva === 'alavancas' && <TelaAlavancas onVoltar={() => setTelaAtiva('HUB')} />}
      {telaAtiva === 'historico' && <TelaHistorico onVoltar={() => setTelaAtiva('HUB')} />}
      {telaAtiva === 'hc' && <TelaAcompanhamentoHC onVoltar={() => setTelaAtiva('HUB')} />}
      {telaAtiva === 'acelera_terminais' && <TelaAceleraTerminais onVoltar={() => setTelaAtiva('HUB')} />}

      {!['HUB', 'alavancas', 'historico', 'hc', 'acelera_terminais'].includes(telaAtiva) && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Módulo em construção</h2>
          <button 
            onClick={() => setTelaAtiva('HUB')} 
            style={{ padding: '8px 16px', marginTop: 10, cursor: 'pointer', background: '#4c1d95', color: '#fff', border: 'none', borderRadius: 6 }}
          >
            Voltar ao Hub
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. TELA: CAPA / HUB 4R VIVO
// ============================================================================
function TelaCapaHub({ onNavegar }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #3b0764 0%, #1e0538 50%, #0b0217 100%)',
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Logos no Centro Superior: 4R sem borda e VIVO maiúsculo sem estrela */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 44 }}>
        <div style={{ 
          fontSize: 52, 
          fontWeight: 900, 
          letterSpacing: -1, 
          fontStyle: 'italic', 
          color: '#ffffff',
          lineHeight: 1
        }}>
          4R
        </div>
        
        <div style={{ height: 38, width: 2, background: 'rgba(255, 255, 255, 0.35)' }} />
        
        <div style={{ 
          fontSize: 48, 
          fontWeight: 900, 
          letterSpacing: 2, 
          color: '#ffffff',
          lineHeight: 1
        }}>
          VIVO
        </div>
      </div>

      {/* Grid com os 19 Botões */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        maxWidth: 1150,
        width: '100%'
      }}>
        {MODULOS_CAPA.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavegar(item.id)}
            style={{
              background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.3) 0%, rgba(88, 28, 135, 0.7) 100%)',
              border: '1.5px solid #a855f7',
              borderRadius: 20,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 11.5,
              padding: '13px 10px',
              cursor: 'pointer',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'linear-gradient(180deg, rgba(168, 85, 247, 0.45) 0%, rgba(107, 33, 168, 0.85) 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(180deg, rgba(147, 51, 234, 0.3) 0%, rgba(88, 28, 135, 0.7) 100%)';
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 3. TELA: ALAVANCAS 2026
// ============================================================================
function TelaAlavancas({ onVoltar }) {
  const cardsLinha1 = [
    { id: 'pos', titulo: 'Pós', cor: '#540974', meta: '0,43', real: '0,37', necDia: '162', peso: '12,72%', tick: 'R$ 63,58' },
    { id: 'controle', titulo: 'CONTROLE', cor: '#035936', meta: '1,27', real: '1,11', necDia: '466', peso: '13,15%', tick: 'R$ 59,52' },
    { id: 'fibra', titulo: 'FIBRA', cor: '#0c614b', meta: '0,38', real: '0,27', necDia: '78', peso: '17,84%', tick: 'R$ 86,16' },
    { id: 'controle_av', titulo: 'Controle\nAlto Valor', cor: '#220845', meta: '3330', real: '1201', necDia: '164', peso: '0,00%', tick: 'R$ 75,00' },
    { id: 'vivo_familia', titulo: 'Vivo Família', cor: '#170b3b', meta: '333', real: '28', necDia: '23', peso: '0,00%', tick: 'R$ 235,10' },
    { id: 'sva', titulo: 'Sva', cor: '#cf530e', meta: '0,55', real: '0,77', necDia: '130', peso: '2,60%', tick: 'R$ 24,46' },
    { id: 'seguro', titulo: 'Seguro', cor: '#9c5409', meta: '0,17', real: '0,12', necDia: '1', peso: '2,02%', tick: 'R$ 17,17' },
    { id: 'vale_saude', titulo: 'Vale Saúde', cor: '#781515', meta: '0,09', real: '0,07', necDia: '1', peso: '1,60%', tick: 'R$ 28,55' },
    { id: 'b2b', titulo: 'B2B MOVEL / FIXA', cor: '#374151', meta: '0,13', real: '0,07', necDia: '60', peso: '2,51%', tick: 'R$ 96,54' }
  ];

  const cardsLinha2 = [
    { id: 'delta', titulo: 'DELTA', cor: '#540974', meta: '0,29', real: '0,32', necDia: '87', peso: '3,38%', tick: 'R$ 22,09' },
    { id: 'terminal', titulo: 'TERMINAL', cor: '#4a0808', meta: 'R$ 1.370', real: 'R$ 1.004', necDia: 'R$ 550.463', peso: '10,99%', tick: 'R$ 3.013,72' },
    { id: 'acessorios', titulo: 'Acessórios', cor: '#1e2538', meta: 'R$ 70', real: 'R$ 48', necDia: 'R$ 28.740', peso: '3,47%', tick: 'R$ 85,01' },
    { id: 'eletronicos', titulo: 'Eletrônicos', cor: '#131138', meta: 'R$ 145', real: 'R$ 156,55', necDia: 'R$ 45.476', peso: '5,39%', tick: 'R$ 746,86' },
    { id: 'tfp_movel', titulo: 'TFP MOVEL', cor: '#2c0c3e', meta: '65%', real: '71,77%', necDia: '', peso: '2,76%', tick: '' },
    { id: 'tfp_fixa', titulo: 'TFP FIXA', cor: '#2c0c3e', meta: '75%', real: '93,26%', necDia: '', peso: '3,11%', tick: '' }
  ];

  const pontosGrafico = [
    { dia: '1', pct: '71,54%' },
    { dia: '2', pct: '72,20%' },
    { dia: '3', pct: '75,27%' },
    { dia: '4', pct: '78,64%' },
    { dia: '5', pct: '80,30%' },
    { dia: '6', pct: '81,12%' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#231535', fontSize: 10, color: '#000' }}>
      <SidebarLateral onVoltar={onVoltar} />

      <div style={{ flex: 1, background: '#cacdd3', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 6, overflowX: 'auto' }}>
        
        {/* Barra Superior */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#16082f' }}>ALAVANCAS 2026</span>
            <div style={{ background: '#330856', color: '#fff', padding: '2px 8px', borderRadius: 14, fontSize: 8.5, fontWeight: 700 }}>
              Dias Úteis: 10,00
            </div>
            <div style={{ background: '#330856', color: '#fff', padding: '2px 8px', borderRadius: 14, fontSize: 8.5, fontWeight: 700 }}>
              Dias Do MÊS: 23
            </div>
            <span style={{ fontSize: 8.5, color: '#333', fontWeight: 600 }}>Atualizado em 15/09/2026 06:38:53</span>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {['Diretor', 'Gerente de Vendas', 'PDVs', 'Indicadores', 'Tipo Loja'].map((label) => (
              <div key={label} style={{ background: '#2e074e', borderRadius: 4, padding: '1px 4px', minWidth: 70 }}>
                <div style={{ fontSize: 7.5, color: '#d8b4fe', fontWeight: 700 }}>{label}</div>
                <div style={{ color: '#fff', fontSize: 8.5, fontWeight: 600 }}>Todos ▼</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ background: '#e39f09', borderRadius: 6, color: '#fff', padding: '2px 10px', textAlign: 'right' }}>
              <div style={{ fontSize: 9.5, fontWeight: 800 }}>Premiação — <b>R$ 0</b></div>
              <div style={{ fontSize: 8.5, fontWeight: 700 }}>% Peso — <b>81,54%</b></div>
            </div>
            <div style={{ background: '#44096e', color: '#fff', fontWeight: 900, fontSize: 10, padding: '5px 12px', borderRadius: 6 }}>
              CN Vendas Zero
            </div>
          </div>
        </div>

        {/* Linha 1 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
          {cardsLinha1.map(card => <CardAlavanca key={card.id} card={card} />)}
        </div>

        {/* Linha 2 Cards + Gráfico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) 2.4fr', gap: 4 }}>
          {cardsLinha2.map(card => <CardAlavanca key={card.id} card={card} />)}

          <div style={{ background: '#24083a', borderRadius: 6, padding: '4px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#e9d5ff', textAlign: 'center' }}>
              Atingimento Premiação Diária
            </div>
            <div style={{ height: 52, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px 4px 10px' }}>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <polyline fill="none" stroke="#38bdf8" strokeWidth="1.5" points="20,44 65,40 120,32 175,22 230,16 280,12" />
              </svg>
              {pontosGrafico.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <span style={{ fontSize: 7, color: '#fff', fontWeight: 700, marginBottom: 2 }}>{p.pct}</span>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', border: '1.5px solid #38bdf8' }} />
                  <span style={{ fontSize: 7, color: '#c084fc', marginTop: 2 }}>{p.dia}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6.5, color: '#a855f7', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 1 }}>
              <span>71,54%</span>
              <span>81,12%</span>
            </div>
          </div>
        </div>

        {/* Tabelas Hierárquicas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SecaoTabela
            tituloNivel="Indicadores - Diretor"
            linhas={[
              { nome: 'ALEXANDRE', pMeta: '0,41', pReal: '0,32', pNec: '65', pD1: '40', pAt: '78,05%', pP: '11,74%', pHc: '144', pFis: '453', pTk: 'R$ 60,39', pMxM: '-11,31%', cMeta: '1,29', cReal: '1,11', cNec: '203', cD1: '162', cAt: '86,05%', cP: '12,94%', cHc: '144', cFis: '1617', cTk: 'R$ 57,64', cMxM: '9,84%', dirNome: 'ALEXANDRE', dirPeso: '76,66%', dirPrem: 'R$ 0' },
              { nome: 'DIEGO GODOY', pMeta: '0,43', pReal: '0,38', pNec: '29', pD1: '32', pAt: '88,37%', pP: '13,13%', pHc: '81', pFis: '207', pTk: 'R$ 61,82', pMxM: '-4,69%', cMeta: '1,24', cReal: '1,14', cNec: '106', cD1: '92', cAt: '91,94%', cP: '13,77%', cHc: '81', cFis: '922', cTk: 'R$ 60,92', cMxM: '21,45%', dirNome: 'DIEGO GODOY', dirPeso: '85,20%', dirPrem: 'R$ 0' },
              { nome: 'PETRONIO FELIPE', pMeta: '0,45', pReal: '0,38', pNec: '54', pD1: '48', pAt: '84,44%', pP: '12,56%', pHc: '109', pFis: '422', pTk: 'R$ 61,26', pMxM: '-2,17%', cMeta: '1,25', cReal: '0,96', cNec: '157', cD1: '102', cAt: '76,80%', cP: '11,53%', cHc: '109', cFis: '1059', cTk: 'R$ 60,87', cMxM: '10,99%', dirNome: 'PETRONIO FELIPE', dirPeso: '85,20%', dirPrem: 'R$ 0' }
            ]}
          />
          <SecaoTabela
            tituloNivel="Indicadores - Gerente de Vendas"
            linhas={[
              { nome: 'ANA PAULA', pMeta: '0,48', pReal: '0,42', pNec: '9', pD1: '8', pAt: '87,50%', pP: '12,09%', pHc: '17', pFis: '71', pTk: 'R$ 65,18', pMxM: '-19,92%', cMeta: '1,05', cReal: '1,01', cNec: '20', cD1: '22', cAt: '96,19%', cP: '12,84%', cHc: '17', cFis: '150', cTk: 'R$ 62,95', cMxM: '10,92%', dirNome: 'ANA PAULA', dirPeso: '96,30%', dirPrem: 'R$ 500' },
              { nome: 'ATHOS', pMeta: '0,42', pReal: '0,39', pNec: '22', pD1: '14', pAt: '92,86%', pP: '13,09%', pHc: '44', pFis: '132', pTk: 'R$ 59,22', pMxM: '-7,32%', cMeta: '1,23', cReal: '1,14', cNec: '57', cD1: '54', cAt: '92,68%', cP: '13,91%', cHc: '44', cFis: '502', cTk: 'R$ 62,22', cMxM: '9,72%', dirNome: 'ATHOS', dirPeso: '75,00%', dirPrem: 'R$ 0' }
            ]}
          />
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 4. TELA: HISTORICO 2026
// ============================================================================
function TelaHistorico({ onVoltar }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#231535', fontSize: 10, color: '#000' }}>
      <SidebarLateral onVoltar={onVoltar} />

      <div style={{ flex: 1, background: '#cacdd3', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ background: '#e2e8f0', borderRadius: 6, padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ background: '#4c1d95', color: '#fff', fontSize: 9, borderRadius: 4, height: 20 }}>
              <option>Ano Atual: 2026</option>
            </select>
            <select style={{ background: '#4c1d95', color: '#fff', fontSize: 9, borderRadius: 4, height: 20 }}>
              <option>Diretor: Todos</option>
            </select>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#3b0764' }}>4R HISTÓRICO CONSOLIDADO</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ background: '#4c1d95', color: '#fff', fontSize: 9, borderRadius: 4, height: 20 }}>
              <option>Sub Indicadores: FIXA</option>
            </select>
            <select style={{ background: '#4c1d95', color: '#fff', fontSize: 9, borderRadius: 4, height: 20 }}>
              <option>Indicadores: Todos</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 6 }}>
          <div style={{ background: '#24083a', borderRadius: 6, padding: 8, color: '#fff', height: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#c084fc' }}>Receita por Mês com % Mês Anterior</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 60, padding: '0 10px' }}>
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai'].map((m, idx) => (
                <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                  <span style={{ fontSize: 7, color: '#a855f7' }}>R$ 124k</span>
                  <div style={{ height: 40, width: 14, background: '#a855f7', margin: '2px auto', borderRadius: 2 }} />
                  <span style={{ fontSize: 7.5 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#24083a', borderRadius: 6, padding: 8, color: '#fff', height: 110 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#c084fc' }}>Receita por Diretor</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, fontSize: 8 }}>
              <div>PETRONIO: <b>R$ 15.087,55</b></div>
              <div>ALEXANDRE: <b>R$ 18.790,20</b></div>
              <div>DIEGO: <b>R$ 11.320,50</b></div>
            </div>
          </div>

          <div style={{ background: '#24083a', borderRadius: 6, padding: 8, color: '#fff', height: 110 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#c084fc' }}>Receita por Regional</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, fontSize: 8 }}>
              <div>CEARÁ: <b>R$ 25.418,80</b></div>
              <div>PIAUI: <b>R$ 2.341,00</b></div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', fontSize: 9 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#1e1b4b', color: '#fff' }}>
                <th style={{ textAlign: 'left', padding: 4 }}>Diretor / Gerente</th>
                <th colSpan={4} style={{ background: '#3b0764' }}>Janeiro</th>
                <th colSpan={4} style={{ background: '#581c87' }}>Fevereiro</th>
                <th colSpan={6} style={{ background: '#065f46' }}>Qtd de Meses que Atingiram a Meta</th>
              </tr>
              <tr style={{ background: '#312e81', color: '#e0e7ff', fontSize: 8 }}>
                <th style={{ textAlign: 'left', padding: 2 }}>Nome</th>
                <th>Meta</th><th>Real</th><th>% Ating</th><th>Gap</th>
                <th>Meta</th><th>Real</th><th>% Ating</th><th>Gap</th>
                <th>PÓS</th><th>CTRL</th><th>FIXA</th><th>TERM</th><th>ACESS</th><th>ELETRO</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nome: 'ALEXANDRE', m1: 'R$ 47.528', r1: 'R$ 33.559', a1: '71%', g1: 'R$ 13.968', m2: 'R$ 47.528', r2: 'R$ 32.440', a2: '68%', g2: 'R$ 15.087', q: [0, 0, 0, 0, 0, 0] },
                { nome: 'DIEGO GODOY', m1: 'R$ 32.164', r1: 'R$ 13.354', a1: '42%', g1: 'R$ 18.809', m2: 'R$ 32.164', r2: 'R$ 14.374', a2: '45%', g2: 'R$ 17.789', q: [0, 0, 0, 0, 0, 0] },
                { nome: 'PETRONIO FELIPE', m1: 'R$ 44.660', r1: 'R$ 26.269', a1: '59%', g1: 'R$ 18.390', m2: 'R$ 44.660', r2: 'R$ 25.869', a2: '58%', g2: 'R$ 18.790', q: [0, 0, 0, 0, 0, 0] }
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ textAlign: 'left', fontWeight: 800, padding: 4 }}>{r.nome}</td>
                  <td>{r.m1}</td><td>{r.r1}</td><td style={{ color: '#dc2626', fontWeight: 800 }}>{r.a1}</td><td>{r.g1}</td>
                  <td>{r.m2}</td><td>{r.r2}</td><td style={{ color: '#dc2626', fontWeight: 800 }}>{r.a2}</td><td>{r.g2}</td>
                  {r.q.map((val, idx) => <td key={idx} style={{ fontWeight: 800 }}>{val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. TELA: ACOMPANHAMENTO HC
// ============================================================================
function TelaAcompanhamentoHC({ onVoltar }) {
  const cardsHC = [
    { label: 'HC SUGESTÃO', val: '337', sub: '100% do HC' },
    { label: 'GERENTE', val: '78', sub: '86% de Ocupação' },
    { label: 'GERENTE FÉRIAS', val: '10', sub: '13% de Férias' },
    { label: 'CN ATIVOS', val: '302', sub: '90% de Ocupação' },
    { label: 'CN FÉRIAS', val: '16', sub: '5% de Férias' },
    { label: 'EM CONTRATAÇÃO', val: '--', sub: 'Contratação' },
    { label: 'CN TREINAMENTO', val: '28', sub: '8% em Treinamento' },
    { label: 'CN TOTAL', val: '350', sub: '104% de Ocupação' },
    { label: 'CN SAÍDAS', val: '250', sub: '74% de Saídas' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#231535', fontSize: 10, color: '#000' }}>
      <SidebarLateral onVoltar={onVoltar} />

      <div style={{ flex: 1, background: '#cbd5e1', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 5 }}>
          {cardsHC.map((c, i) => (
            <div key={i} style={{ background: '#0284c7', color: '#fff', borderRadius: 6, padding: '4px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 7.5, fontWeight: 800 }}>{c.label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, margin: '2px 0' }}>{c.val}</div>
              <div style={{ fontSize: 7, opacity: 0.85 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 3fr', gap: 6 }}>
          <div style={{ background: '#fff', borderRadius: 6, padding: 8, textAlign: 'center' }}>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: '#0369a1' }}>TURNOVER</span>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0284c7', margin: '8px 0' }}>5,8%</div>
            <span style={{ fontSize: 7.5, color: '#64748b' }}>Índice de Rotatividade</span>
          </div>

          <div style={{ background: '#fff', borderRadius: 6, padding: 8, textAlign: 'center' }}>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: '#0369a1' }}>QUANTIDADE POR SEXO</span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', marginTop: 10 }}>
              <div style={{ fontSize: 10 }}>Feminino: <b>22,59%</b></div>
              <div style={{ fontSize: 10 }}>Masculino: <b>77,41%</b></div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 6, padding: 8 }}>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: '#0369a1' }}>ENTRADAS E SAÍDAS AO LONGO DO TEMPO</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 42, marginTop: 4 }}>
              {['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set'].map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  <div style={{ width: 4, height: `${(i + 2) * 4}px`, background: '#0284c7' }} />
                  <div style={{ width: 4, height: `${(i + 1) * 3.5}px`, background: '#ef4444' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', fontSize: 8.5 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#0284c7', color: '#fff' }}>
                <th style={{ textAlign: 'left', padding: 3 }}>Gerente de Vendas</th>
                <th>HC Sugestão</th><th>Ocupação</th><th>Ocupação Ger/Sub</th><th>Média Func.</th>
                <th>% CN Total</th><th>CN Ativos</th><th>CN Afast.</th><th>CN Férias</th><th>CN Saídas</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nome: 'ANA PAULA', hc: 17, ocup: '100%', sub: '100%', med: '11 Meses', perc: '100%', ativ: 16, af: 0, fer: 1, sai: 16 },
                { nome: 'ATHOS', hc: 44, ocup: '98%', sub: '100%', med: '13 Meses', perc: '105%', ativ: 41, af: 1, fer: 3, sai: 28 },
                { nome: 'FILIPE', hc: 23, ocup: '87%', sub: '100%', med: '10 Meses', perc: '96%', ativ: 17, af: 1, fer: 1, sai: 20 },
                { nome: 'INGRID', hc: 23, ocup: '96%', sub: '100%', med: '22 Meses', perc: '104%', ativ: 21, af: 0, fer: 2, sai: 15 }
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ textAlign: 'left', fontWeight: 800, padding: 3 }}>{r.nome}</td>
                  <td>{r.hc}</td>
                  <td style={{ color: '#16a34a', fontWeight: 800 }}>{r.ocup}</td>
                  <td>{r.sub}</td><td>{r.med}</td><td>{r.perc}</td><td>{r.ativ}</td>
                  <td>{r.af}</td><td>{r.fer}</td><td>{r.sai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. TELA: ACELERA TERMINAIS
// ============================================================================
function TelaAceleraTerminais({ onVoltar }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1c0533', color: '#fff', fontSize: 10 }}>
      <SidebarLateral onVoltar={onVoltar} />

      <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ background: '#2e0854', borderRadius: 6, padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8.5, color: '#a855f7' }}>Atualizado em 14/09/2026 10:30:12</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#e879f9' }}>Campanha Acelera Terminais</span>
          <select style={{ background: '#4c1d95', color: '#fff', fontSize: 9, borderRadius: 4, height: 20 }}>
            <option>Diretor: Todos</option>
          </select>
        </div>

        <div style={{ background: '#240642', borderRadius: 6, overflow: 'hidden', fontSize: 8.5 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#3b0764', color: '#e879f9' }}>
                <th style={{ textAlign: 'left', padding: 3 }}>Gerente de Vendas</th>
                <th>Meta</th><th>Real Com Serviço</th><th>% Ating.</th><th>Flag Ship</th>
                <th>Premiação</th><th>Real Sem Serviço</th><th>Real Total</th><th>Qtd Acess</th><th>Qtd Eletro</th><th>Seguro</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nome: 'ANA PAULA', m: 150, rServ: 40, ating: '27%', flag: 14, prem: 'R$ 0', rSem: 13, tot: 53, acess: 35, eletro: 1, seg: 6 },
                { nome: 'ATHOS', m: 400, rServ: 59, ating: '15%', flag: 26, prem: 'R$ 0', rSem: 47, tot: 106, acess: 65, eletro: 24, seg: 2 },
                { nome: 'FILIPE', m: 180, rServ: 60, ating: '33%', flag: 19, prem: 'R$ 0', rSem: 10, tot: 70, acess: 64, eletro: 7, seg: 8 },
                { nome: 'INGRID', m: 210, rServ: 28, ating: '13%', flag: 16, prem: 'R$ 0', rSem: 29, tot: 57, acess: 28, eletro: 4, seg: 4 }
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #381269' }}>
                  <td style={{ textAlign: 'left', fontWeight: 800, padding: 3 }}>{r.nome}</td>
                  <td>{r.m}</td><td>{r.rServ}</td><td style={{ color: '#38bdf8' }}>{r.ating}</td><td>{r.flag}</td>
                  <td style={{ color: '#ca8a04' }}>{r.prem}</td><td>{r.rSem}</td><td style={{ fontWeight: 800 }}>{r.tot}</td>
                  <td>{r.acess}</td><td>{r.eletro}</td><td>{r.seg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, fontSize: 8 }}>
          <div style={{ background: '#240642', borderRadius: 6, padding: 6 }}>
            <span style={{ fontWeight: 800, color: '#e879f9' }}>Cliente sem Serviço</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {[
                { nome: 'ALVARINA CARDOSO SOARES', tel: '64 99951-7473' },
                { nome: 'ANILSON ANTONIO DA COSTA', tel: '64 99973-6400' }
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #381269', padding: '2px 0' }}>
                  <span>{c.nome}</span>
                  <span style={{ color: '#94a3b8' }}>{c.tel}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#240642', borderRadius: 6, padding: 6 }}>
            <span style={{ fontWeight: 800, color: '#e879f9' }}>Vendas sem Acessórios</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {[
                { nome: 'DOMINGAS MULATA DA SILVA', tel: '94 99270-8089' },
                { nome: 'MARCIO ARAGAO CARNEIRO', tel: '88 98138-5658' }
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #381269', padding: '2px 0' }}>
                  <span>{c.nome}</span>
                  <span style={{ color: '#94a3b8' }}>{c.tel}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#240642', borderRadius: 6, padding: 6 }}>
            <span style={{ fontWeight: 800, color: '#e879f9' }}>Vendas sem Eletrônicos</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {[
                { nome: 'RAIMUNDA MARIA DA COSTA', tel: '89 98145-2457' },
                { nome: 'SANDRA GONCALVES FREIRE', tel: '61 99623-0372' }
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #381269', padding: '2px 0' }}>
                  <span>{c.nome}</span>
                  <span style={{ color: '#94a3b8' }}>{c.tel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================
function SidebarLateral({ onVoltar }) {
  return (
    <div style={{
      width: 44,
      background: '#30084f',
      borderRight: '1px solid #4a1478',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 0',
      gap: 16,
      color: '#fff',
      flexShrink: 0
    }}>
      <div style={{ fontWeight: 900, fontSize: 16, fontStyle: 'italic', letterSpacing: -1 }}>4R</div>
      <div 
        onClick={onVoltar}
        style={{
          width: 32,
          height: 32,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Voltar ao Hub"
      >
        <Home size={18} color="#fff" />
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Shield size={18} color="#9d4edd" />
      </div>
    </div>
  );
}

function CardAlavanca({ card }) {
  return (
    <div style={{
      background: card.cor,
      color: '#fff',
      borderRadius: 6,
      padding: '3px 5px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 88,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        textAlign: 'center',
        fontWeight: 900,
        fontSize: 8.5,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: 2,
        lineHeight: 1.1,
        whiteSpace: 'pre-line'
      }}>
        {card.titulo}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2, fontSize: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>Meta</span>
          <b>{card.meta}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>Real</span>
          <b>{card.real}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>Nec Dia</span>
          <b>{card.necDia || '-'}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>% Peso</span>
          <b>{card.peso}</b>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: 1
        }}>
          <span style={{ opacity: 0.8 }}>Tick. Méd</span>
          <b>{card.tick || '-'}</b>
        </div>
      </div>
    </div>
  );
}

function SecaoTabela({ tituloNivel, linhas }) {
  return (
    <div style={{ background: '#fff', borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5, textAlign: 'center' }}>
        <thead>
          <tr style={{ background: '#1c0836', color: '#fff' }}>
            <th style={{ textAlign: 'left', padding: '3px 6px', width: '14%' }}>{tituloNivel}</th>
            <th colSpan={10} style={{ background: '#4a076a', borderLeft: '1px solid #fff' }}>Pós</th>
            <th colSpan={10} style={{ background: '#024b2b', borderLeft: '1px solid #fff' }}>Controle</th>
            <th colSpan={3} style={{ background: '#24083a', borderLeft: '1px solid #fff' }}>{tituloNivel}</th>
          </tr>
          <tr style={{ background: '#2b0c4f', color: '#e9d5ff', fontSize: 7.5 }}>
            <th style={{ textAlign: 'left', padding: '2px 6px' }}>Nome</th>
            <th>Meta</th><th>Real</th><th>Nec Dia</th><th>Real D-1</th><th>% Ating</th><th>% Peso</th><th>Hc's</th><th>Físico</th><th>Ticket Méd.</th><th>M x M</th>
            <th>Meta</th><th>Real</th><th>Nec Dia</th><th>Real D-1</th><th>% Ating</th><th>% Peso</th><th>Hc's</th><th>Físico</th><th>Ticket Méd.</th><th>M x M</th>
            <th>Nome</th><th>% Peso</th><th>Premiação</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((row, idx) => {
            const atingPosNum = parseFloat(row.pAt);
            const atingCtrlNum = parseFloat(row.cAt);

            return (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                <td style={{ textAlign: 'left', fontWeight: 800, padding: '3px 6px', color: '#0f172a' }}>{row.nome}</td>
                <td>{row.pMeta}</td>
                <td>{row.pReal}</td>
                <td>{row.pNec}</td>
                <td>{row.pD1}</td>
                <td style={{ fontWeight: 800, color: atingPosNum >= 100 ? '#16a34a' : '#dc2626' }}>
                  {atingPosNum >= 100 ? '🟢 ' : 'ⓧ '}{row.pAt}
                </td>
                <td>{row.pP}</td>
                <td>{row.pHc}</td>
                <td>{row.pFis}</td>
                <td>{row.pTk}</td>
                <td style={{ color: row.pMxM.startsWith('-') ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                  {row.pMxM.startsWith('-') ? '▼ ' : '▲ '}{row.pMxM}
                </td>
                <td>{row.cMeta}</td>
                <td>{row.cReal}</td>
                <td>{row.cNec}</td>
                <td>{row.cD1}</td>
                <td style={{ fontWeight: 800, color: atingCtrlNum >= 100 ? '#16a34a' : '#dc2626' }}>
                  {atingCtrlNum >= 100 ? '🟢 ' : 'ⓧ '}{row.cAt}
                </td>
                <td>{row.cP}</td>
                <td>{row.cHc}</td>
                <td>{row.cFis}</td>
                <td>{row.cTk}</td>
                <td style={{ color: row.cMxM.startsWith('-') ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                  {row.cMxM.startsWith('-') ? '▼ ' : '▲ '}{row.cMxM}
                </td>
                <td style={{ textAlign: 'left', fontWeight: 700, padding: '0 4px' }}>{row.dirNome}</td>
                <td style={{ fontWeight: 700 }}>{row.dirPeso}</td>
                <td style={{ fontWeight: 800, color: row.dirPrem !== 'R$ 0' ? '#16a34a' : '#ca8a04' }}>{row.dirPrem}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}