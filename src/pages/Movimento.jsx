import React, { useState } from 'react';
import { 
  BarChart3, 
  ChevronDown, 
  ArrowLeft, 
  RotateCcw, 
  Search, 
  FileSpreadsheet, 
  FileText 
} from 'lucide-react';

export default function Movimento() {
  const [telaAtiva, setTelaAtiva] = useState('lista');

  // Estados dos Filtros do Relatório de Formas de Pagamento
  const [agruparPor, setAgruparPor] = useState('Filial');
  const [dataInicio, setDataInicio] = useState('2026-10-06');
  const [dataFim, setDataFim] = useState('2026-10-06');
  const [uf, setUf] = useState('UF');
  const [filialSelecionada, setFilialSelecionada] = useState('');
  const [todasFiliaisSelecionadas, setTodasFiliaisSelecionadas] = useState(true);
  
  const filiaisList = [
    "ADM 4 REDES", "CE - CANINDE", "CE - CAUCAIA", "CE - CRATEUS", "CE - DEL PASEO", "CE - EUSEBIO", "CE - FORTALEZA LOJA DOM LUIS",
    "CE - FORTALEZA LOJA MESSEJANA", "CE - FTZ BENFICA SHOP", "CE - FTZ CENTRO", "CE - FTZ VIA SUL SHOP", "CE - IGUATU", "CE - ITAPIPOCA", "CE - MARACANAU",
    "CE - MARANGUAPE", "CE - QUIXADA", "CE - SOBRAL", "CE - SOBRAL RUA", "CE - SOLARES", "DF - ESTOQUE", "DF - PARANOA",
    "DF - PLANALTINA", "DF - SANTA MARIA", "EA CE - FTZ CENTRO", "EA PI - TERESINA LOJA 01", "GO - AGUAS LINDAS", "GO - ANAPOLIS", "GO - CALDAS NOVAS",
    "GO - CATALÃO", "GO - CERES", "GO - CRISTALINA", "GO - ESTOQUE", "GO - GOIANESIA", "GO - GOIATUBA", "GO - IPAMERI",
    "GO - ITAPACI", "GO - LUZIANIA", "GO - LUZIANIA SHOPPING CORUMBA", "GO - NIQUELANDIA", "GO - PADRE BERNARDO", "GO - PIRES DO RIO", "GO - PLANALTINA",
    "GO - PORANGATU", "GO - POSSE", "GO - SHOPPING ARAGUAIA", "GO - URUAÇU", "GO - VALPARAISO", "MG - BOCAIUVA LOJA -141", "MG - BOCAIUVA LOJA -383",
    "MG - CORINTO", "MG - DIAMANTINA LOJA 02", "MG - DIAMANTINA MATRIZ", "MG - GOUVEIA", "MG - ITAMARANDIBA", "MG - SALINAS", "MG - SERRO",
    "MG - TAIOBEIRAS", "MG - TRES MARIAS", "MS - CAMPO GRANDE (COMPER SPIPE CALARGE)", "MS - CAMPO GRANDE (COMPER)", "MS - CHAPADAO DO SUL", "MS - COSTA RICA", "MS - COXIM",
    "MS - JARDIM", "MS - PATIO CENTRAL", "MS - RIBAS DO RIO PARDO", "MS - RIO BRILHANTE", "MS - SAO GABRIEL DO OESTE", "MS - SHOPPING NORTE SUL PLAZA", "MS - SIDROLANDIA",
    "MT - ALTA FLORESTA", "MT - CUIABA (CPA)", "MT - JUARA", "MT - NOVA MUTUM", "MT - SHOPPING SINOP", "MT - SINOP LOJA 1 - MATRIZ", "MT - SINOP LOJA 2",
    "PA - CANAÃ DOS CARAJAS 02", "PA - MARABA", "PA - PARAUAPEBAS", "PA - REDENÇAO", "PA - TUCURUI", "PA - XINGUARA", "PI - BOM JESUS",
    "PI - PARNAIBA", "PI - PICOS", "PI - SAO RAIMUNDO NONATO", "PI - TERESINA LOJA 01", "PI - TERESINA LOJA 02", "TO - ARAGUAINA", "TO - ARAGUATINS",
    "TO - CAPIM DORADO", "TO - GUARAI", "TO - GURUPI", "TO - PARAISO DO TOCANTINS", "CE - EUSEBIO TERRACO (CANCELADA)", "CE - FORTALEZA PAP 1 (CANCELADA)", "CE - FORTALEZA PAP 2 (CANCELADA)"
  ];

  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('');
  const [todasFormasSelecionadas, setTodasFormasSelecionadas] = useState(true);
  const formasPagamentoList = [
    "AGORACRED CRED", "Boleto", "Bonus", "BR Card.", "C6 Bank Credito", "C6 Bank Debito", "Cartão AMEX",
    "Cartao Elo", "Cartao Juros TEF", "Cartão Master", "Cartão VISA", "Cetelem", "Cheque", "Cheque Pré",
    "Credishop", "Credito Devol.", "Credpar", "Depôs. Conta", "Desc Fabric - EA", "Desc Fabricante", "Desconto Folha",
    "Dinheiro", "GETNET Crediario", "GETNET Crédito", "GETNET Débito", "GetPay", "Getpay Credito", "Getpay Debito",
    "HubCred", "ITAU CARTAO", "Losango", "PARCELEX", "PARCELEX MOBILID", "PAYJOY", "Pgto Antecipado",
    "PIX", "Produto", "Redecard", "Redecard Credito", "Redecard Débito", "Renova EA", "TEF Credito",
    "TEF Debito", "Transferência", "UME Financeira", "Vivo Money", "Vivo Renova", "WIWAP"
  ];

  // Estados dos Filtros do Relatório de Movimento de Caixa
  const [caixaFilial, setCaixaFilial] = useState('Todas');
  const [caixaDoCaixa, setCaixaDoCaixa] = useState('Todos');
  const [caixaMovimentos, setCaixaMovimentos] = useState('Todos');
  const [caixaModo, setCaixaModo] = useState('Sintético');
  const [caixaDataInicio, setCaixaDataInicio] = useState('2026-10-06');
  const [caixaDataFim, setCaixaDataFim] = useState('2026-10-06');

  // ----------------------------------------------------
  // TELA 1: LISTAGEM DE CARTÕES DE RELATÓRIOS
  // ----------------------------------------------------
  if (telaAtiva === 'lista') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
        
        {/* Cartão 1: Forma de Pagamento */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 4, width: 5, height: 14, borderRadius: 2, background: '#a855f7' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#c084fc', margin: 0, letterSpacing: 0.2 }}>
              Forma de Pagamento
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
              Relatório das movimentações por forma de pagamento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTelaAtiva('forma-pagamento')}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              outline: 'none'
            }}
          >
            <span>Avaliar</span>
            <ChevronDown size={14} color="var(--text-faint)" />
          </button>
        </div>

        {/* Cartão 2: Movimento Caixa */}
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 4, width: 5, height: 14, borderRadius: 2, background: '#a855f7' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#c084fc', margin: 0, letterSpacing: 0.2 }}>
              Movimento Caixa
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>
              Visualizar o relatório da movimentação de caixa da revenda ou das filiais.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTelaAtiva('movimento-caixa')}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              outline: 'none'
            }}
          >
            <span>Avaliar</span>
            <ChevronDown size={14} color="var(--text-faint)" />
          </button>
        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // TELA 2: TELA CHEIA - RELATÓRIO DE FORMAS DE PAGAMENTO
  // ----------------------------------------------------
  if (telaAtiva === 'forma-pagamento') {
    return (
      <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', color: 'var(--text)' }}>
        
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setTelaAtiva('lista')}
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft size={14} /> Voltar aos Relatórios
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={24} color="#c084fc" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#c084fc', margin: 0 }}>
              Relatório de Formas de Pagamento
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '2px 0 0 0' }}>
              Valores recebidos por forma de pagamento, PDV e período.
            </p>
          </div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, width: '100%', boxSizing: 'border-box' }}>
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: 0.5, marginBottom: 14, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 4, height: 12, background: '#a855f7', borderRadius: 2 }}></span>
              Filtros Principais
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                  Agrupar por:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={agruparPor}
                    onChange={(e) => setAgruparPor(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Filial">Filial</option>
                    <option value="FormaPagamento">Forma de Pagamento</option>
                    <option value="PDV">PDV</option>
                  </select>
                  <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                  Período:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'var(--input-bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '9px 12px',
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>até</span>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'var(--input-bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '9px 12px',
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 14, marginTop: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                  Filial:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="UF">UF</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="GO">GO</option>
                    <option value="MG">MG</option>
                    <option value="MS">MS</option>
                    <option value="MT">MT</option>
                    <option value="PA">PA</option>
                    <option value="PI">PI</option>
                    <option value="TO">TO</option>
                  </select>
                  <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filialSelecionada}
                    onChange={(e) => setFilialSelecionada(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Selecione</option>
                    {filiaisList.map((f, i) => (
                      <option key={i} value={f}>{f}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setUf('UF');
                    setFilialSelecionada('');
                  }}
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 16px',
                    color: 'var(--text)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <RotateCcw size={14} /> Redefinir filtros
                </button>
              </div>
            </div>
          </div>

          {/* Grid de Filiais em 4 colunas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Filtrar filiais"
                style={{
                  width: '100%',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '10px 14px 10px 40px',
                  color: 'var(--text)',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', marginTop: 4 }}>
              <input
                type="checkbox"
                checked={todasFiliaisSelecionadas}
                onChange={(e) => setTodasFiliaisSelecionadas(e.target.checked)}
                style={{ accentColor: '#a855f7', width: 15, height: 15 }}
              />
              Selecionar todos
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
              {filiaisList.map((filial, idx) => (
                <label 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    fontSize: 12, 
                    color: 'var(--text)', 
                    cursor: 'pointer',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={todasFiliaisSelecionadas}
                    onChange={() => {}}
                    style={{ accentColor: '#a855f7', width: 14, height: 14, flexShrink: 0 }}
                  />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{filial}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 8 }}>
              Movimentação:
            </label>
            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--line)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#a855f7', width: 15, height: 15 }} />
                Selecionar todos
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#a855f7' }} /> Compra
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#a855f7' }} /> Venda
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#a855f7' }} /> Despesas
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#a855f7' }} /> Receitas
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#a855f7' }} /> Ordens de Serviço
                </label>
              </div>
            </div>
          </div>

          {/* Grid de Formas de Pagamento em 4 colunas */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 8 }}>
              Forma de Pagamento:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filtrar opções"
                  value={filtroFormaPagamento}
                  onChange={(e) => setFiltroFormaPagamento(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px 10px 40px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={todasFormasSelecionadas}
                  onChange={(e) => setTodasFormasSelecionadas(e.target.checked)}
                  style={{ accentColor: '#a855f7', width: 15, height: 15 }}
                />
                Selecionar todos
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                {formasPagamentoList
                  .filter(f => f.toLowerCase().includes(filtroFormaPagamento.toLowerCase()))
                  .map((forma, idx) => (
                    <label 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        fontSize: 12, 
                        color: 'var(--text)', 
                        cursor: 'pointer',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        padding: '10px 14px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={todasFormasSelecionadas}
                        onChange={() => {}}
                        style={{ accentColor: '#a855f7', width: 14, height: 14, flexShrink: 0 }}
                      />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{forma}</span>
                    </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => alert('A exportar dados para CSV...')}
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                color: 'var(--text)',
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <FileSpreadsheet size={16} color="#c084fc" /> Exportar CSV
            </button>

            <button
              type="button"
              onClick={() => alert('A gerar relatório...')}
              style={{
                background: '#9333ea',
                border: 'none',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)'
              }}
            >
              <FileText size={16} color="#ffffff" /> Gerar relatório
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TELA 3: TELA CHEIA - RELATÓRIO DE MOVIMENTO DE CAIXA
  // ----------------------------------------------------
  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', color: 'var(--text)' }}>
      
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setTelaAtiva('lista')}
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <ArrowLeft size={14} /> Voltar aos Relatórios
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={24} color="#c084fc" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#c084fc', margin: 0 }}>
            Relatório de Movimento de Caixa
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '2px 0 0 0' }}>
            Entradas e retiradas dos caixas, por PDV e por dia.
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, width: '100%', boxSizing: 'border-box' }}>
        
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: 0.5, marginBottom: 14, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 12, background: '#a855f7', borderRadius: 2 }}></span>
            Filtros Principais
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Filial:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaFilial}
                  onChange={(e) => setCaixaFilial(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todas">Todas</option>
                  <option value="Matriz">Matriz</option>
                  <option value="Filial 1">Filial 1</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Caixa da Filial:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaDoCaixa}
                  onChange={(e) => setCaixaDoCaixa(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Caixa Principal">Caixa Principal</option>
                  <option value="PDV 1">PDV 1</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Movimentos:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaMovimentos}
                  onChange={(e) => setCaixaMovimentos(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Entradas">Entradas</option>
                  <option value="Retiradas">Retiradas</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Período:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="date"
                  value={caixaDataInicio}
                  onChange={(e) => setCaixaDataInicio(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>até</span>
                <input
                  type="date"
                  value={caixaDataFim}
                  onChange={(e) => setCaixaDataFim(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 6 }}>
                Modo:
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={caixaModo}
                  onChange={(e) => setCaixaModo(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Sintético">Sintético</option>
                  <option value="Analítico">Analítico</option>
                </select>
                <ChevronDown size={14} color="var(--text-faint)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => alert('A exportar dados para CSV...')}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FileSpreadsheet size={16} color="#c084fc" /> Exportar CSV
          </button>

          <button
            type="button"
            onClick={() => alert('A gerar relatório de movimento de caixa...')}
            style={{
              background: '#9333ea',
              border: 'none',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)'
            }}
          >
            <FileText size={16} color="#ffffff" /> Gerar relatório
          </button>
        </div>

      </div>
    </div>
  );
}