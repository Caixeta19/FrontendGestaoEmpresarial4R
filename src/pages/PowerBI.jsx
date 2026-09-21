import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Shield, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';

// ============================================================================
// COMPONENTE PRINCIPAL (ROTEADOR COM GESTÃO DE TEMA)
// ============================================================================
export default function PowerBICompleto() {
  const [telaAtiva, setTelaAtiva] = useState('alavancas');
  const [temaEscuro, setTemaEscuro] = useState(true);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: temaEscuro ? '#0b0814' : '#f8fafc', 
      color: temaEscuro ? '#fff' : '#0f172a', 
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      transition: 'background 0.2s ease, color 0.2s ease'
    }}>
      {telaAtiva === 'HUB' && (
        <TelaCapaHub 
          onNavegar={setTelaAtiva} 
          temaEscuro={temaEscuro} 
          setTemaEscuro={setTemaEscuro} 
        />
      )}
      {telaAtiva === 'alavancas' && (
        <TelaAlavancas 
          onVoltar={() => setTelaAtiva('HUB')} 
          temaEscuro={temaEscuro} 
          setTemaEscuro={setTemaEscuro} 
        />
      )}
    </div>
  );
}

// ============================================================================
// 1. TELA: CAPA / HUB 4R VIVO
// ============================================================================
function TelaCapaHub({ onNavegar, temaEscuro, setTemaEscuro }) {
  const modulos = [
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

  return (
    <div style={{
      minHeight: '100vh',
      background: temaEscuro 
        ? 'radial-gradient(ellipse at center, #3b0764 0%, #1e0538 50%, #0b0217 100%)'
        : 'radial-gradient(ellipse at center, #ede9fe 0%, #e0e7ff 50%, #f1f5f9 100%)',
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Botão de Tema no Topo Direito */}
      <button
        onClick={() => setTemaEscuro(!temaEscuro)}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          background: temaEscuro ? '#2b0c4f' : '#ffffff',
          border: `1px solid ${temaEscuro ? '#7e22ce' : '#cbd5e1'}`,
          borderRadius: 20,
          padding: '6px 14px',
          color: temaEscuro ? '#fff' : '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {temaEscuro ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
        <span>{temaEscuro ? 'Modo Claro' : 'Modo Escuro'}</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 44 }}>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: -1, fontStyle: 'italic', color: temaEscuro ? '#ffffff' : '#1e1b4b', lineHeight: 1 }}>
          4R
        </div>
        <div style={{ height: 38, width: 2, background: temaEscuro ? 'rgba(255, 255, 255, 0.35)' : 'rgba(30, 27, 75, 0.35)' }} />
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 2, color: temaEscuro ? '#ffffff' : '#6b21a8', lineHeight: 1 }}>
          VIVO
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 1150, width: '100%' }}>
        {modulos.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavegar(item.id)}
            style={{
              background: temaEscuro 
                ? 'linear-gradient(180deg, rgba(147, 51, 234, 0.3) 0%, rgba(88, 28, 135, 0.7) 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f3e8ff 100%)',
              border: `1.5px solid ${temaEscuro ? '#a855f7' : '#c084fc'}`,
              borderRadius: 20,
              color: temaEscuro ? '#ffffff' : '#4c1d95',
              fontWeight: 800,
              fontSize: 11.5,
              padding: '13px 10px',
              cursor: 'pointer',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              boxShadow: temaEscuro ? '0 4px 12px rgba(168, 85, 247, 0.2)' : '0 4px 10px rgba(168, 85, 247, 0.12)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 2. TELA: ALAVANCAS 2026 COM MOTOR DE ZOOM E SUPORTE DE TEMAS
// ============================================================================
function TelaAlavancas({ onVoltar, temaEscuro, setTemaEscuro }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [modoEncaixe, setModoEncaixe] = useState('fit-page');

  const LARGURA_NATIVA = 1420;
  const ALTURA_NATIVA = 900;

  // Cálculo automático do zoom no modo "Ajustar à Página"
  useEffect(() => {
    function calcularZoomAutomatico() {
      if (!containerRef.current) return;
      const larguraDisponivel = containerRef.current.clientWidth - 56;
      const alturaDisponivel = window.innerHeight - 38;

      if (modoEncaixe === 'fit-page') {
        const escalaLargura = larguraDisponivel / LARGURA_NATIVA;
        const escalaAltura = alturaDisponivel / ALTURA_NATIVA;
        const novaEscala = Math.min(escalaLargura, escalaAltura);
        setZoom(parseFloat(novaEscala.toFixed(2)));
      } else if (modoEncaixe === 'fit-width') {
        const escalaLargura = larguraDisponivel / LARGURA_NATIVA;
        setZoom(parseFloat(escalaLargura.toFixed(2)));
      }
    }

    calcularZoomAutomatico();
    window.addEventListener('resize', calcularZoomAutomatico);
    return () => window.removeEventListener('resize', calcularZoomAutomatico);
  }, [modoEncaixe]);

  const aumentarZoom = () => {
    setModoEncaixe('custom');
    setZoom((z) => Math.min(1.6, parseFloat((z + 0.05).toFixed(2))));
  };

  const diminuirZoom = () => {
    setModoEncaixe('custom');
    setZoom((z) => Math.max(0.45, parseFloat((z - 0.05).toFixed(2))));
  };

  const resetarZoom = () => {
    setModoEncaixe('custom');
    setZoom(1);
  };

  // DADOS DOS CARDS
  const cardsLinha1 = [
    { id: 'pos', titulo: 'Pós', cor: '#4a086b', meta: '0,43', real: '0,36', necDia: '186', peso: '12,59%', tick: 'R$ 65,25' },
    { id: 'controle', titulo: 'CONTROLE', cor: '#035e38', meta: '1,27', real: '1,07', necDia: '544', peso: '12,49%', tick: 'R$ 59,53' },
    { id: 'fibra', titulo: 'FIBRA', cor: '#0d5c48', meta: '0,38', real: '0,26', necDia: '98', peso: '17,17%', tick: 'R$ 87,11' },
    { id: 'controle_av', titulo: 'Controle\nAlto Valor', cor: '#220845', meta: '3330', real: '1495', necDia: '192', peso: '0,00%', tick: 'R$ 76,88' },
    { id: 'vivo_familia', titulo: 'Vivo Família', cor: '#1a0b3e', meta: '333', real: '42', necDia: '26', peso: '0,00%', tick: 'R$ 277,44' },
    { id: 'sva', titulo: 'Sva', cor: '#cf530e', meta: '0,55', real: '0,70', necDia: '182', peso: '2,53%', tick: 'R$ 24,34' },
    { id: 'seguro', titulo: 'Seguro', cor: '#9c5409', meta: '0,17', real: '0,17', necDia: '1', peso: '2,06%', tick: 'R$ 15,87' },
    { id: 'vale_saude', titulo: 'Vale Saúde', cor: '#781515', meta: '0,09', real: '0,06', necDia: '1', peso: '1,61%', tick: 'R$ 28,22' },
    { id: 'b2b', titulo: 'B2B MOVEL / FIXA', cor: '#374151', meta: '0,13', real: '0,06', necDia: '82', peso: '2,61%', tick: '', b2bDetalhe: true }
  ];

  const cardsLinha2 = [
    { id: 'delta', titulo: 'DELTA', cor: '#4a086b', meta: '0,29', real: '0,31', necDia: '85', peso: '3,22%', tick: 'R$ 22,32' },
    { id: 'terminal', titulo: 'TERMINAL', cor: '#450606', meta: 'R$ 1.370', real: 'R$ 1.138', necDia: 'R$ 593.217', peso: '12,37%', tick: 'R$ 2.392,81' },
    { id: 'acessorios', titulo: 'Acessórios', cor: '#1a243a', meta: 'R$ 70', real: 'R$ 49', necDia: 'R$ 35.184', peso: '3,50%', tick: 'R$ 84,09' },
    { id: 'eletronicos', titulo: 'Eletrônicos', cor: '#131138', meta: 'R$ 145', real: 'R$ 137,35', necDia: 'R$ 53.858', peso: '4,73%', tick: 'R$ 705,54' },
    { id: 'tfp_movel', titulo: 'TFP MOVEL', cor: '#2c0c3e', meta: '75%', real: '76,11%', necDia: '', peso: '2,67%', tick: '' },
    { id: 'tfp_fixa', titulo: 'TFP FIXA', cor: '#2c0c3e', meta: '75%', real: '92,84%', necDia: '', peso: '3,10%', tick: '' }
  ];

  const dadosGrafico = [
    { d: '1' }, { d: '2' }, { d: '3' }, { d: '4' }, { d: '5' },
    { d: '6' }, { d: '7' }, { d: '8' }, { d: '9' }, { d: '10' },
    { d: '11' }, { d: '12' }, { d: '13' }, { d: '14' }, { d: '15' },
    { d: '16' }, { d: '17' }, { d: '18' }, { d: '19' }, { d: '20' },
    { d: '21' }, { d: '22' }, { d: '23' }
  ];

  const dadosDiretor = [
    { nome: 'ALEXANDRE', pMeta: '0,41', pReal: '0,31', pNec: '93', pD1: '4', pAt: '75,61%', pP: '11,34%', pHc: '143', pFis: '454', pTk: 'R$ 65,49', pMxM: '-13,11%', cMeta: '1,29', cReal: '1,08', cNec: '286', cD1: '12', cAt: '83,72%', cP: '12,56%', cHc: '143', cFis: '1592', cTk: 'R$ 57,75', cMxM: '4,10%', dirNome: 'ALEXANDRE', dirPeso: '79,72%', dirPrem: 'R$ 0' },
    { nome: 'DIEGO GODOY', pMeta: '0,43', pReal: '0,39', pNec: '41', pD1: '1', pAt: '90,70%', pP: '13,50%', pHc: '81', pFis: '313', pTk: 'R$ 64,81', pMxM: '-7,96%', cMeta: '1,24', cReal: '1,12', cNec: '130', cD1: '5', cAt: '90,32%', cP: '13,55%', cHc: '81', cFis: '907', cTk: 'R$ 62,06', cMxM: '18,52%', dirNome: 'DIEGO GODOY', dirPeso: '87,83%', dirPrem: 'R$ 0' },
    { nome: 'PETRONIO FELIPE', pMeta: '0,45', pReal: '0,40', pNec: '52', pD1: '2', pAt: '88,89%', pP: '13,19%', pHc: '109', pFis: '435', pTk: 'R$ 65,22', pMxM: '-3,18%', cMeta: '1,25', cReal: '1,01', cNec: '188', cD1: '6', cAt: '80,80%', cP: '12,14%', cHc: '109', cFis: '1101', cTk: 'R$ 60,00', cMxM: '8,40%', dirNome: 'PETRONIO FELIPE', dirPeso: '85,43%', dirPrem: 'R$ 0' }
  ];

  const dadosGerente = [
    { nome: 'ANA PAULA', pMeta: '0,48', pReal: '0,42', pNec: '10', pD1: '2', pAt: '87,50%', pP: '12,42%', pHc: '17', pFis: '71', pTk: 'R$ 69,11', pMxM: '-21,15%', cMeta: '1,05', cReal: '0,99', cNec: '24', cD1: '1', cAt: '94,29%', cP: '12,12%', cHc: '17', cFis: '169', cTk: 'R$ 62,54', cMxM: '9,44%', rNome: 'THAYS', rPeso: '92,57%', rPrem: 'R$ 500' },
    { nome: 'ATHOS', pMeta: '0,42', pReal: '0,37', pNec: '29', pD1: '2', pAt: '88,10%', pP: '12,57%', pHc: '44', pFis: '165', pTk: 'R$ 64,13', pMxM: '-1,48%', cMeta: '1,23', cReal: '1,10', cNec: '84', cD1: '2', cAt: '89,43%', cP: '13,42%', cHc: '44', cFis: '484', cTk: 'R$ 62,59', cMxM: '7,11%', rNome: 'WANESKA', rPeso: '81,95%', rPrem: 'R$ 0' },
    { nome: 'FILIPE', pMeta: '0,47', pReal: '0,45', pNec: '11', pD1: '1', pAt: '95,74%', pP: '14,36%', pHc: '23', pFis: '103', pTk: 'R$ 69,18', pMxM: '-6,96%', cMeta: '1,30', cReal: '1,20', cNec: '43', cD1: '1', cAt: '92,31%', cP: '13,85%', cHc: '23', cFis: '277', cTk: 'R$ 62,41', cMxM: '11,48%', rNome: 'RODOLFO', rPeso: '81,87%', rPrem: 'R$ 0' },
    { nome: 'INGRID', pMeta: '0,48', pReal: '0,38', pNec: '15', pD1: '1', pAt: '79,17%', pP: '11,88%', pHc: '23', pFis: '88', pTk: 'R$ 71,40', pMxM: '-10,34%', cMeta: '1,30', cReal: '1,11', cNec: '58', cD1: '3', cAt: '85,38%', cP: '12,81%', cHc: '23', cFis: '256', cTk: 'R$ 60,67', cMxM: '14,26%', rNome: 'ANA PAULA', rPeso: '79,14%', rPrem: 'R$ 0' },
    { nome: 'JHONATAN', pMeta: '0,47', pReal: '0,47', pNec: '8', pD1: '0', pAt: '100,00%', pP: '15,00%', pHc: '21', pFis: '100', pTk: 'R$ 61,04', pMxM: '-8,67%', cMeta: '1,30', cReal: '1,01', cNec: '48', cD1: '1', cAt: '77,69%', cP: '11,65%', cHc: '21', cFis: '213', cTk: 'R$ 61,06', cMxM: '14,24%', rNome: 'ATHOS', rPeso: '72,11%', rPrem: 'R$ 0' },
    { nome: 'JULIANA', pMeta: '0,47', pReal: '0,46', pNec: '11', pD1: '0', pAt: '97,87%', pP: '14,67%', pHc: '28', pFis: '128', pTk: 'R$ 64,12', pMxM: '-8,30%', cMeta: '1,30', cReal: '1,08', cNec: '61', cD1: '1', cAt: '83,08%', cP: '12,47%', cHc: '28', cFis: '303', cTk: 'R$ 62,47', cMxM: '15,22%', rNome: 'JHONATAN', rPeso: '72,11%', rPrem: 'R$ 0' },
    { nome: 'MARCIO', pMeta: '0,45', pReal: '0,37', pNec: '15', pD1: '1', pAt: '82,22%', pP: '12,33%', pHc: '22', pFis: '82', pTk: 'R$ 68,09', pMxM: '-12,25%', cMeta: '1,20', cReal: '1,05', cNec: '47', cD1: '1', cAt: '87,50%', cP: '13,12%', cHc: '22', cFis: '231', cTk: 'R$ 64,41', cMxM: '10,98%', rNome: 'JULIANA', rPeso: '71,25%', rPrem: 'R$ 0' },
    { nome: 'MARIELE', pMeta: '0,41', pReal: '0,31', pNec: '18', pD1: '2', pAt: '75,61%', pP: '11,34%', pHc: '24', pFis: '75', pTk: 'R$ 64,54', pMxM: '-11,54%', cMeta: '1,20', cReal: '0,98', cNec: '52', cD1: '3', cAt: '81,67%', cP: '12,25%', cHc: '24', cFis: '235', cTk: 'R$ 62,01', cMxM: '16,56%', rNome: 'MARCELA', rPeso: '67,50%', rPrem: 'R$ 0' },
    { nome: 'MARCELA', pMeta: '0,38', pReal: '0,30', pNec: '12', pD1: '1', pAt: '78,95%', pP: '11,84%', pHc: '17', pFis: '51', pTk: 'R$ 62,46', pMxM: '-10,48%', cMeta: '1,20', cReal: '1,22', cNec: '27', cD1: '1', cAt: '101,67%', cP: '15,25%', cHc: '17', cFis: '207', cTk: 'R$ 60,37', cMxM: '3,86%', rNome: 'INGRID', rPeso: '66,35%', rPrem: 'R$ 0' },
    { nome: 'RODOLFO', pMeta: '0,39', pReal: '0,29', pNec: '14', pD1: '0', pAt: '74,36%', pP: '11,15%', pHc: '15', pFis: '44', pTk: 'R$ 65,44', pMxM: '-20,07%', cMeta: '1,31', cReal: '1,01', cNec: '38', cD1: '1', cAt: '77,10%', cP: '11,56%', cHc: '15', cFis: '152', cTk: 'R$ 57,01', cMxM: '-21,11%', rNome: 'FILIPE', rPeso: '63,16%', rPrem: 'R$ 0' },
    { nome: 'THAYS', pMeta: '0,38', pReal: '0,31', pNec: '12', pD1: '1', pAt: '81,58%', pP: '12,24%', pHc: '16', pFis: '50', pTk: 'R$ 63,42', pMxM: '-8,67%', cMeta: '1,31', cReal: '1,18', cNec: '34', cD1: '1', cAt: '90,08%', cP: '13,51%', cHc: '16', cFis: '189', cTk: 'R$ 55,42', cMxM: '3,47%', rNome: 'MARIELE', rPeso: '61,68%', rPrem: 'R$ 0' },
    { nome: 'WANESKA', pMeta: '0,42', pReal: '0,32', pNec: '19', pD1: '0', pAt: '76,19%', pP: '11,43%', pHc: '20', pFis: '63', pTk: 'R$ 63,19', pMxM: '-1,10%', cMeta: '1,31', cReal: '1,12', cNec: '47', cD1: '1', cAt: '85,50%', cP: '12,82%', cHc: '20', cFis: '223', cTk: 'R$ 53,60', cMxM: '9,79%', rNome: 'MARCIO', rPeso: '53,46%', rPrem: 'R$ 0' }
  ];

  const dadosPDVs = [
    { nome: 'CE - LIMOEIRO', pMeta: '0,45', pReal: '0,38', pNec: '2', pD1: '0', pAt: '84,44%', pP: '20,14%', pHc: '3', pFis: '14', pTk: 'R$ 64,88', pMxM: '6,78%', cMeta: '1,30', cReal: '1,01', cNec: '5', cD1: '0', cAt: '77,69%', cP: '23,17%', cHc: '3', cFis: '37', cTk: 'R$ 61,04', cMxM: '-10,50%', rNome: 'CE - SOBRAL RUA', rPeso: '109,21%', rPrem: 'R$ 1.000' },
    { nome: 'CE - IGUATU', pMeta: '0,45', pReal: '0,34', pNec: '3', pD1: '0', pAt: '75,56%', pP: '24,08%', pHc: '5', pFis: '20', pTk: 'R$ 73,11', pMxM: '1,78%', cMeta: '1,30', cReal: '1,15', cNec: '6', cD1: '0', cAt: '88,46%', cP: '21,68%', cHc: '5', cFis: '69', cTk: 'R$ 64,48', cMxM: '14,64%', rNome: 'CE - CRATEUS', rPeso: '108,01%', rPrem: 'R$ 1.000' },
    { nome: 'CE - CRATEUS', pMeta: '0,45', pReal: '0,36', pNec: '3', pD1: '0', pAt: '80,00%', pP: '11,28%', pHc: '5', pFis: '22', pTk: 'R$ 75,58', pMxM: '-24,80%', cMeta: '1,30', cReal: '1,41', cNec: '3', cD1: '1', cAt: '108,46%', cP: '21,12%', cHc: '5', cFis: '85', cTk: 'R$ 60,65', cMxM: '16,77%', rNome: 'CE - QUIXADA', rPeso: '105,79%', rPrem: 'R$ 1.000' },
    { nome: 'GO - RIO VERDE', pMeta: '0,45', pReal: '0,34', pNec: '3', pD1: '1', pAt: '75,56%', pP: '11,33%', pHc: '5', pFis: '20', pTk: 'R$ 69,57', pMxM: '-20,67%', cMeta: '1,45', cReal: '1,15', cNec: '9', cD1: '0', cAt: '79,31%', cP: '11,90%', cHc: '5', cFis: '69', cTk: 'R$ 64,45', cMxM: '-14,79%', rNome: 'GO - JATAI', rPeso: '104,80%', rPrem: 'R$ 1.000' },
    { nome: 'GO - ITUMBIARA', pMeta: '0,45', pReal: '0,41', pNec: '1', pD1: '0', pAt: '91,11%', pP: '13,67%', pHc: '3', pFis: '15', pTk: 'R$ 71,94', pMxM: '-21,83%', cMeta: '1,10', cReal: '1,11', cNec: '2', cD1: '0', cAt: '100,91%', cP: '15,14%', cHc: '3', cFis: '40', cTk: 'R$ 66,74', cMxM: '31,52%', rNome: 'DF - PARK SHOPPING BRASILIA', rPeso: '103,44%', rPrem: 'R$ 1.000' },
    { nome: 'CE - FORTALEZA SHOPPING BENFICA', pMeta: '0,45', pReal: '0,40', pNec: '2', pD1: '0', pAt: '88,89%', pP: '13,33%', pHc: '4', pFis: '19', pTk: 'R$ 69,44', pMxM: '-13,83%', cMeta: '1,30', cReal: '1,46', cNec: '3', cD1: '1', cAt: '112,31%', cP: '16,85%', cHc: '4', cFis: '70', cTk: 'R$ 57,00', cMxM: '8,46%', rNome: 'TO - ARAGUAINA', rPeso: '102,96%', rPrem: 'R$ 1.000' },
    { nome: 'CE - FORTALEZA SHOPPING RIOMAR KEN', pMeta: '0,35', pReal: '0,39', pNec: '2', pD1: '0', pAt: '111,43%', pP: '16,71%', pHc: '4', pFis: '19', pTk: 'R$ 67,23', pMxM: '-12,85%', cMeta: '1,10', cReal: '1,19', cNec: '4', cD1: '0', cAt: '108,18%', cP: '16,23%', cHc: '4', cFis: '57', cTk: 'R$ 67,61', cMxM: '-2,41%', rNome: 'GO - CALDAS NOVAS', rPeso: '102,87%', rPrem: 'R$ 1.000' },
    { nome: 'CE - FORTALEZA SHOPPING PARANGABA', pMeta: '0,45', pReal: '0,27', pNec: '7', pD1: '0', pAt: '60,00%', pP: '9,00%', pHc: '8', pFis: '26', pTk: 'R$ 66,97', pMxM: '-22,97%', cMeta: '1,30', cReal: '0,93', cNec: '18', cD1: '0', cAt: '71,54%', cP: '10,73%', cHc: '8', cFis: '89', cTk: 'R$ 62,37', cMxM: '26,38%', rNome: 'GO - RIO VERDE SHOPPING', rPeso: '102,12%', rPrem: 'R$ 1.000' },
    { nome: 'CE - FORTALEZA SHOPPING VIA SUL', pMeta: '0,45', pReal: '0,45', pNec: '2', pD1: '0', pAt: '100,00%', pP: '15,00%', pHc: '4', pFis: '22', pTk: 'R$ 64,88', pMxM: '-13,85%', cMeta: '1,30', cReal: '1,17', cNec: '6', cD1: '0', cAt: '90,00%', cP: '13,50%', cHc: '4', cFis: '56', cTk: 'R$ 63,44', cMxM: '18,84%', rNome: 'GO - SAO LUIS DE MONTES BELOS', rPeso: '101,64%', rPrem: 'R$ 1.000' },
    { nome: 'CE - FORTALEZA NORTH SHOPPING', pMeta: '0,45', pReal: '0,32', pNec: '5', pD1: '0', pAt: '71,11%', pP: '10,67%', pHc: '7', pFis: '27', pTk: 'R$ 61,23', pMxM: '-22,46%', cMeta: '1,30', cReal: '1,16', cNec: '13', cD1: '0', cAt: '89,23%', cP: '13,38%', cHc: '7', cFis: '98', cTk: 'R$ 63,41', cMxM: '12,65%', rNome: 'PA - XINGUARA', rPeso: '100,00%', rPrem: 'R$ 1.000' }
  ];

  const dadosVendedores = [
    { nome: 'ADRIANO DA SILVA LIMA', pMeta: '0,45', pReal: '0,45', pNec: '1,00', pD1: '0', pAt: '100,00%', pP: '15,00%', pHc: '1', pFis: '1', pTk: 'R$ 85,00', pMxM: '0,00%', cMeta: '1,30', cReal: '1,20', cNec: '2,00', cD1: '0', cAt: '92,31%', cP: '13,85%', cHc: '20', cTk: 'R$ 52,14', cMxM: '-1,85%', rNome: 'NATALIA DE JESUS SILVA', rPeso: '115,20%', rPrem: 'R$ 1.200' },
    { nome: 'ADRIELI DE JESUS', pMeta: '0,45', pReal: '0,55', pNec: '1,00', pD1: '0', pAt: '122,22%', pP: '18,33%', pHc: '7', pFis: '4', pTk: 'R$ 62,14', pMxM: '-16,67%', cMeta: '1,30', cReal: '1,35', cNec: '2,00', cD1: '0', cAt: '103,85%', cP: '15,58%', cHc: '19', cTk: 'R$ 61,50', cMxM: '-11,58%', rNome: 'ALESSANDRA DE SOUZA', rPeso: '112,50%', rPrem: 'R$ 1.200' },
    { nome: 'AIRTON DA ROCHA BARBOSA', pMeta: '0,45', pReal: '0,14', pNec: '1,00', pD1: '0', pAt: '31,11%', pP: '4,67%', pHc: '2', pFis: '1', pTk: 'R$ 55,00', pMxM: '-50,00%', cMeta: '1,30', cReal: '1,00', cNec: '2,00', cD1: '0', cAt: '76,92%', cP: '11,54%', cHc: '15', cTk: 'R$ 64,12', cMxM: '-2,17%', rNome: 'ANA VICTORIA CARVALHO COUTO', rPeso: '110,80%', rPrem: 'R$ 1.200' },
    { nome: 'ALEX BATISTA DA SILVA', pMeta: '0,45', pReal: '0,61', pNec: '1,00', pD1: '0', pAt: '135,56%', pP: '20,33%', pHc: '9', pFis: '4', pTk: 'R$ 55,71', pMxM: '0,00%', cMeta: '1,30', cReal: '0,71', cNec: '4,00', cD1: '0', cAt: '54,62%', cP: '8,19%', cHc: '11', cTk: 'R$ 65,33', cMxM: '-32,52%', rNome: 'ANTONIO LUIZ VIEIRA SANTOS', rPeso: '110,25%', rPrem: 'R$ 1.200' },
    { nome: 'ALEX BISPO JUNIOR LINHARES DA SILVA', pMeta: '0,45', pReal: '0,55', pNec: '1,00', pD1: '0', pAt: '122,22%', pP: '18,33%', pHc: '5', pFis: '5', pTk: 'R$ 61,00', pMxM: '42,86%', cMeta: '1,30', cReal: '0,91', cNec: '2,00', cD1: '0', cAt: '70,00%', cP: '10,50%', cHc: '10', cTk: 'R$ 57,00', cMxM: '-14,89%', rNome: 'ARLEI LUIZ DA SILVA', rPeso: '110,00%', rPrem: 'R$ 1.200' }
  ];

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        height: '100vh', 
        background: temaEscuro ? '#120524' : '#e2e8f0', 
        fontFamily: 'Segoe UI, system-ui, sans-serif', 
        fontSize: 10, 
        color: temaEscuro ? '#fff' : '#0f172a', 
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. BARRA LATERAL FIXA */}
      <div style={{
        width: 44,
        background: temaEscuro ? '#1d0538' : '#ffffff',
        borderRight: `1px solid ${temaEscuro ? '#3b0966' : '#cbd5e1'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: 16,
        color: temaEscuro ? '#fff' : '#1e1b4b',
        flexShrink: 0,
        zIndex: 20
      }}>
        <div style={{ fontWeight: 900, fontSize: 15, fontStyle: 'italic', letterSpacing: -1 }}>4R</div>
        <div 
          onClick={onVoltar} 
          style={{ 
            width: 32, 
            height: 32, 
            background: temaEscuro ? 'rgba(255,255,255,0.08)' : '#f1f5f9', 
            borderRadius: 8, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer' 
          }}
          title="Voltar ao Hub"
        >
          <Home size={18} color={temaEscuro ? '#fff' : '#4c1d95'} />
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#c084fc" />
        </div>
      </div>

      {/* 2. ÁREA DE VISUALIZAÇÃO COM ZOOM E BARRAS DE ROLAGEM */}
      <div 
        className={temaEscuro ? 'scrollbar-dark' : 'scrollbar-light'}
        style={{
          flex: 1,
          overflow: 'auto',
          background: temaEscuro ? '#333842' : '#cbd5e1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '12px',
          paddingBottom: '44px'
        }}
      >
        <div style={{
          width: LARGURA_NATIVA,
          minWidth: LARGURA_NATIVA,
          background: temaEscuro ? '#cfd3da' : '#f8fafc',
          padding: '8px 10px 14px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          borderRadius: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: modoEncaixe === 'custom' ? 'none' : 'transform 0.15s ease',
          color: '#000'
        }}>
          {/* TOPBAR CABEÇALHO */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#16082f', letterSpacing: -0.5 }}>ALAVANCAS 2026</span>
              <div style={{ background: '#2e0854', color: '#fff', padding: '3px 8px', borderRadius: 12, fontSize: 8.5, fontWeight: 800 }}>
                Dias Úteis: 14,50
              </div>
              <div style={{ background: '#2e0854', color: '#fff', padding: '3px 8px', borderRadius: 12, fontSize: 8.5, fontWeight: 800 }}>
                Dias Do MÊS: 23
              </div>
              <span style={{ fontSize: 8, color: '#333', fontWeight: 700, marginLeft: 2 }}>Atualizado em 21/09/2026 06:50:52</span>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #2b084e 0%, #1a0433 100%)',
              border: '1px solid #7e22ce',
              borderRadius: '16px 4px 4px 16px',
              padding: '3px 8px',
              display: 'flex',
              gap: 6,
              alignItems: 'center'
            }}>
              {['Diretor', 'Gerente de Vendas', 'PDVs', 'Indicadores', 'Tipo Loja'].map((f) => (
                <div key={f} style={{ background: '#120224', border: '1px solid #9333ea', borderRadius: 4, padding: '1px 6px', minWidth: 68 }}>
                  <div style={{ fontSize: 7, color: '#d8b4fe', fontWeight: 800 }}>{f}</div>
                  <div style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>Todos ▼</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                background: '#e29b00',
                borderRadius: 6,
                color: '#fff',
                padding: '3px 12px',
                textAlign: 'right',
                minWidth: 105,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: 9.5, fontWeight: 900 }}>Premiação — <b>R$ 0</b></div>
                <div style={{ fontSize: 8.5, fontWeight: 800 }}>% Peso — <b>81,06%</b></div>
              </div>

              <div style={{
                background: '#4c0c7a',
                color: '#fff',
                fontWeight: 900,
                fontSize: 10.5,
                padding: '6px 14px',
                borderRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                cursor: 'pointer'
              }}>
                CN Vendas Zero
              </div>
            </div>
          </div>

          {/* LINHA 1 DE CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
            {cardsLinha1.map(card => <CardAlavanca key={card.id} card={card} />)}
          </div>

          {/* LINHA 2 DE CARDS + GRÁFICO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) 2.6fr', gap: 4 }}>
            {cardsLinha2.map(card => <CardAlavanca key={card.id} card={card} />)}

            <div style={{
              background: '#24083a',
              borderRadius: 6,
              padding: '4px 6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: '#e9d5ff', textAlign: 'center', letterSpacing: 0.2 }}>
                Atingimento Premiação Diária
              </div>

              <div style={{ height: 50, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 4px 2px 4px' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.6"
                    points="15,42 28,38 42,32 58,26 74,20 89,24 104,16 119,13 134,15 149,11 164,17 179,12 194,8 209,11 224,13 239,9 254,14 269,17 284,12 299,10 314,13 329,11 345,8"
                  />
                </svg>

                {dadosGrafico.map((pt, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', border: '1.2px solid #38bdf8' }} />
                    <span style={{ fontSize: 6.5, color: '#c084fc', marginTop: 1, fontWeight: 700 }}>{pt.d}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6.5, color: '#a855f7', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 1 }}>
                <span>1</span>
                <span>12</span>
                <span>23</span>
              </div>
            </div>
          </div>

          {/* AS 4 TABELAS HIERÁRQUICAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SecaoTabela tituloNivel="Indicadores - Diretor" dados={dadosDiretor} tipo="DIRETOR" temaEscuro={temaEscuro} />
            <SecaoTabela tituloNivel="Indicadores - Gerente de Vendas" dados={dadosGerente} tipo="GERENTE" temaEscuro={temaEscuro} />
            <SecaoTabela tituloNivel="Indicadores - PDVs" dados={dadosPDVs} tipo="PDV" temaEscuro={temaEscuro} />
            <SecaoTabela tituloNivel="Indicadores - Nome do Vendedor" dados={dadosVendedores} tipo="VENDEDOR" temaEscuro={temaEscuro} />
          </div>
        </div>
      </div>

      {/* 3. BARRA DE FERRAMENTAS DE ZOOM E MUDANÇA DE TEMA */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 44,
        height: 32,
        background: temaEscuro ? '#18072e' : '#ffffff',
        borderTop: `1px solid ${temaEscuro ? '#350b5e' : '#cbd5e1'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        color: temaEscuro ? '#e9d5ff' : '#334155',
        fontSize: 11,
        zIndex: 30,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        {/* Lado Esquerdo: Alternador de Tema */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setTemaEscuro(!temaEscuro)}
            style={{
              background: temaEscuro ? '#2b0c4f' : '#f1f5f9',
              border: `1px solid ${temaEscuro ? '#5b1a9e' : '#cbd5e1'}`,
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 10.5,
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: temaEscuro ? '#e9d5ff' : '#0f172a'
            }}
            title="Alternar entre tema Claro e Escuro"
          >
            {temaEscuro ? <Sun size={12} color="#fbbf24" /> : <Moon size={12} color="#6366f1" />}
            <span>{temaEscuro ? 'Tema Claro' : 'Tema Escuro'}</span>
          </button>
        </div>

        {/* Lado Direito: Modos de Encaixe e Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderRight: `1px solid ${temaEscuro ? '#4a1380' : '#e2e8f0'}`, paddingRight: 10 }}>
            <button
              onClick={() => setModoEncaixe('fit-page')}
              style={{
                background: modoEncaixe === 'fit-page' ? (temaEscuro ? '#6b21a8' : '#7c3aed') : 'transparent',
                color: modoEncaixe === 'fit-page' ? '#fff' : (temaEscuro ? '#e9d5ff' : '#475569'),
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10.5,
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Ajustar tela inteira para caber na página"
            >
              <Maximize2 size={12} /> Ajustar à Página
            </button>

            <button
              onClick={() => setModoEncaixe('fit-width')}
              style={{
                background: modoEncaixe === 'fit-width' ? (temaEscuro ? '#6b21a8' : '#7c3aed') : 'transparent',
                color: modoEncaixe === 'fit-width' ? '#fff' : (temaEscuro ? '#e9d5ff' : '#475569'),
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10.5,
                cursor: 'pointer',
                fontWeight: 600
              }}
              title="Ajustar proporcional à largura disponível"
            >
              Ajustar à Largura
            </button>

            <button
              onClick={resetarZoom}
              style={{
                background: zoom === 1 && modoEncaixe === 'custom' ? (temaEscuro ? '#6b21a8' : '#7c3aed') : 'transparent',
                color: zoom === 1 && modoEncaixe === 'custom' ? '#fff' : (temaEscuro ? '#e9d5ff' : '#475569'),
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10.5,
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Restaurar tamanho real 100%"
            >
              <RotateCcw size={12} /> 100%
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={diminuirZoom}
              style={{
                background: temaEscuro ? '#2b0c4f' : '#f1f5f9',
                border: `1px solid ${temaEscuro ? '#5b1a9e' : '#cbd5e1'}`,
                color: temaEscuro ? '#fff' : '#0f172a',
                borderRadius: 4,
                width: 24,
                height: 22,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Diminuir Zoom (-)"
            >
              <ZoomOut size={13} />
            </button>

            <span style={{ minWidth: 42, textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: 11 }}>
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={aumentarZoom}
              style={{
                background: temaEscuro ? '#2b0c4f' : '#f1f5f9',
                border: `1px solid ${temaEscuro ? '#5b1a9e' : '#cbd5e1'}`,
                color: temaEscuro ? '#fff' : '#0f172a',
                borderRadius: 4,
                width: 24,
                height: 22,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Aumentar Zoom (+)"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ESTILIZAÇÃO DAS BARRAS DE ROLAGEM DINÂMICAS */}
      <style>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #18072e;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #5b1a9e;
          border-radius: 6px;
          border: 2px solid #18072e;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #7e22ce;
        }

        .scrollbar-light::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #e2e8f0;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 6px;
          border: 2px solid #e2e8f0;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPONENTE: CARD ALAVANCA
// ============================================================================
function CardAlavanca({ card }) {
  return (
    <div style={{
      background: card.cor,
      color: '#fff',
      borderRadius: 6,
      padding: '3px 6px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 88,
      boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
      position: 'relative'
    }}>
      <div style={{
        textAlign: 'center',
        fontWeight: 900,
        fontSize: 8.5,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: 2,
        lineHeight: 1.1,
        whiteSpace: 'pre-line',
        textTransform: 'uppercase'
      }}>
        {card.titulo}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1.2, marginTop: 2, fontSize: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.85 }}>Meta</span>
          <b style={{ fontWeight: 800 }}>{card.meta}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.85 }}>Real</span>
          <b style={{ fontWeight: 800 }}>{card.real}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.85 }}>Nec Dia</span>
          <b style={{ fontWeight: 800 }}>{card.necDia || '-'}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.85 }}>% Peso</span>
          <b style={{ fontWeight: 800 }}>{card.peso}</b>
        </div>

        {card.b2bDetalhe ? (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 1, fontSize: 7, display: 'flex', justifyContent: 'space-between' }}>
            <span>Tick. MÓV: <b>R$ 58,50</b></span>
            <span>FIXA: <b>R$ 98,21</b></span>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 1 }}>
            <span style={{ opacity: 0.85 }}>Tick. Méd</span>
            <b style={{ fontWeight: 800 }}>{card.tick || '-'}</b>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: TABELA COM HIERARQUIA E CONTRASTE DE TEMA
// ============================================================================
function SecaoTabela({ tituloNivel, dados, tipo, temaEscuro }) {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 4, 
      overflow: 'hidden', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      border: temaEscuro ? 'none' : '1px solid #e2e8f0'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8, textAlign: 'center', lineHeight: 1.15 }}>
        <thead>
          <tr style={{ background: '#1c0836', color: '#fff' }}>
            <th style={{ textAlign: 'left', padding: '3px 6px', width: '12%', borderRight: '1px solid #fff' }}>
              {tituloNivel}
            </th>
            <th colSpan={10} style={{ background: '#4a076a', borderRight: '1px solid #fff' }}>
              Pós
            </th>
            <th colSpan={10} style={{ background: '#024b2b', borderRight: '1px solid #fff' }}>
              Controle
            </th>
            <th colSpan={tipo === 'VENDEDOR' ? 2 : 3} style={{ background: '#24083a' }}>
              {tipo === 'DIRETOR' ? 'Diretor' : tipo === 'GERENTE' ? 'Gerente de Vendas' : tipo === 'PDV' ? 'PDVs' : 'Nome do Vendedor'}
            </th>
          </tr>

          <tr style={{ background: '#2b0c4f', color: '#e9d5ff', fontSize: 7.2 }}>
            <th style={{ textAlign: 'left', padding: '2px 6px' }}>Nome</th>
            <th>Meta</th><th>Real</th><th>Nec Dia</th><th>Real D-1</th>
            <th>% Ating</th><th>% Peso</th><th>Hc's</th><th>Físico</th><th>Ticket Méd.</th><th>M x M</th>
            <th>Meta</th><th>Real</th><th>Nec Dia</th><th>Real D-1</th>
            <th>% Ating</th><th>% Peso</th><th>Hc's</th><th>Físico</th><th>Ticket Méd.</th><th>M x M</th>
            <th>Nome</th>
            <th>% Peso</th>
            {tipo !== 'VENDEDOR' && <th>Premiação</th>}
          </tr>
        </thead>
        <tbody>
          {dados.map((row, idx) => {
            const atingPos = parseFloat(row.pAt);
            const atingCtrl = parseFloat(row.cAt);

            return (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                <td style={{ textAlign: 'left', fontWeight: 800, padding: '2px 6px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                  {row.nome}
                </td>

                <td>{row.pMeta}</td>
                <td>{row.pReal}</td>
                <td>{row.pNec}</td>
                <td>{row.pD1}</td>
                
                <td style={{ fontWeight: 800, color: atingPos >= 100 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                  <IconeSemaforo atingimento={atingPos} /> {row.pAt}
                </td>
                
                <td>{row.pP}</td>
                <td>{row.pHc}</td>
                <td>{row.pFis}</td>
                <td>{row.pTk}</td>
                
                <td style={{ color: row.pMxM.startsWith('-') ? '#dc2626' : '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <IconeSeta variacao={row.pMxM} /> {row.pMxM}
                </td>

                <td>{row.cMeta}</td>
                <td>{row.cReal}</td>
                <td>{row.cNec}</td>
                <td>{row.cD1}</td>
                
                <td style={{ fontWeight: 800, color: atingCtrl >= 100 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                  <IconeSemaforo atingimento={atingCtrl} /> {row.cAt}
                </td>
                
                <td>{row.cP}</td>
                <td>{row.cHc}</td>
                <td>{row.cFis}</td>
                <td>{row.cTk}</td>
                
                <td style={{ color: row.cMxM.startsWith('-') ? '#dc2626' : '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <IconeSeta variacao={row.cMxM} /> {row.cMxM}
                </td>

                <td style={{ textAlign: 'left', fontWeight: 800, padding: '0 4px', whiteSpace: 'nowrap', color: '#1e1b4b' }}>
                  {row.dirNome || row.rNome}
                </td>
                <td style={{ fontWeight: 800, color: '#334155' }}>
                  {row.dirPeso || row.rPeso}
                </td>
                {tipo !== 'VENDEDOR' && (
                  <td style={{ fontWeight: 800, color: (row.dirPrem || row.rPrem) !== 'R$ 0' ? '#16a34a' : '#ca8a04' }}>
                    {row.dirPrem || row.rPrem}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IconeSemaforo({ atingimento }) {
  if (atingimento >= 100) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: '#16a34a',
        color: '#fff',
        fontSize: 6,
        marginRight: 2
      }}>
        ✓
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: '#dc2626',
      color: '#fff',
      fontSize: 6,
      marginRight: 2
    }}>
      ✕
    </span>
  );
}

function IconeSeta({ variacao }) {
  const negativo = variacao.startsWith('-');
  return (
    <span style={{ fontSize: 7, marginRight: 2, color: negativo ? '#dc2626' : '#16a34a' }}>
      {negativo ? '▼' : '▲'}
    </span>
  );
}