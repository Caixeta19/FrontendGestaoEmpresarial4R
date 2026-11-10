import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  UploadCloud,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Check,
  AlertTriangle,
  FileEdit,
  Download,
  RotateCcw
} from 'lucide-react';
import { listarFiliais, listarVendedores } from '../services/vendasApi';
import * as documental from '../services/documentalApi';

const LISTA_MOTIVOS_CANCELAMENTO = [
  'Acesso incorreto',
  'Duplicidade',
  'Fluxo com aquisição',
  'Lançamento incorreto',
  'Prazo na habilitação',
  'Venda não encontrada',
  'Outro',
  'Baixa Prematura',
  'Cliente Inelegível',
  'Downgrade',
  'Inversão de Titularidade',
  'MD',
  'Abaixo do Piso',
  'Serviço não remunerado',
  'MN',
  'SVA não ativo',
  'Desconto Indevido',
  'Submetida/Enviada',
  'Motivo Cliente',
  'Motivo Erro na Venda',
  'Técnico',
  'Operacional'
];

const LISTA_DIAS_VENCIMENTO = ['01', '06', '10', '15', '17', '21', '26', '28'];
const TAMANHO_PAGINA = 20;

/** Data local em yyyy-MM-dd (toISOString usaria UTC e trocaria o dia à noite). */
const diaISO = (diasAtras = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const FILTROS_VAZIOS = {
  dataInicio: '',
  dataFim: '',
  filialId: '',
  vendedorId: '',
  numeroVenda: '',
  numeroProtocoloGed: '',
  numeroAcesso: '',
  liderEquipe: '',
  statusBko: '',
  incluirCanceladas: false
};

/** Fila do BKO: vendas Não avaliado dos últimos 30 dias. */
const filtrosDaFila = () => ({ ...FILTROS_VAZIOS, dataInicio: diaISO(30), dataFim: diaISO(0), statusBko: 'Nao_avaliado' });

/** Para a API: o filtro de PDV vira lista de filiais. */
const paraApi = (f) => ({ ...f, filialIds: f.filialId ? [f.filialId] : [] });

export default function Documental() {
  const navigate = useNavigate();

  // 'MENU' | 'BUSCA' | 'DETALHE' | 'IMPORTAR'. Abre na busca, já com a fila do BKO.
  const [etapa, setEtapa] = useState('BUSCA');
  const [cardAberto, setCardAberto] = useState(true);

  const [filiais, setFiliais] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  // Busca
  const [filtrosBusca, setFiltrosBusca] = useState(filtrosDaFila);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosDaFila);
  const [resultado, setResultado] = useState(null); // { itens, total, pagina, totalPaginas }
  const [buscando, setBuscando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemVazio, setMensagemVazio] = useState('');

  // Detalhe
  const [formData, setFormData] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSalvo, setMensagemSalvo] = useState('');
  const [erroDetalhe, setErroDetalhe] = useState('');

  // Importação
  const [arquivoCsv, setArquivoCsv] = useState(null);
  const [carregandoImportacao, setCarregandoImportacao] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState(null);
  const [erroImportacao, setErroImportacao] = useState('');

  useEffect(() => {
    listarFiliais().then(setFiliais).catch(() => setFiliais([]));
    listarVendedores().then(setVendedores).catch(() => setVendedores([]));
    executarBusca(filtrosDaFila(), 0, false);
  }, []);

  const handleFiltroChange = (campo, valor) => {
    setFiltrosBusca((prev) => ({ ...prev, [campo]: valor }));
    if (mensagemErro) setMensagemErro('');
  };

  /** Busca na API. "Não encontrada" só com a lista vazia; falha de rede aparece como falha de rede. */
  const executarBusca = async (filtros, pagina = 0, abrirSeUm = false) => {
    setMensagemErro('');
    setMensagemVazio('');
    setBuscando(true);
    try {
      const r = await documental.buscar(paraApi(filtros), { page: pagina, size: TAMANHO_PAGINA });
      setFiltrosAplicados(filtros);
      setResultado(r);
      if (r.total === 0) {
        const numero = String(filtros.numeroVenda || '').trim();
        setMensagemVazio(numero ? `A venda "${numero}" não foi encontrada.` : 'Nenhuma venda encontrada para esses filtros.');
      } else if (abrirSeUm && r.total === 1) {
        await abrirDetalhe(r.itens[0].vendaId);
      }
    } catch (e) {
      setResultado(null);
      setMensagemErro(e.mensagem || e.message || 'Falha ao buscar as vendas.');
    } finally {
      setBuscando(false);
    }
  };

  const handleExecutarBusca = (e) => {
    e.preventDefault();
    executarBusca(filtrosBusca, 0, true);
  };

  const abrirDetalhe = async (vendaId) => {
    setErroDetalhe('');
    setMensagemSalvo('');
    try {
      setFormData(documental.paraFormulario(await documental.buscarPorVenda(vendaId)));
      setEtapa('DETALHE');
    } catch (e) {
      setMensagemErro(e.mensagem || e.message || 'Falha ao abrir a venda.');
    }
  };

  const voltarParaBusca = () => {
    setEtapa('BUSCA');
    // Recarrega a lista para refletir o que acabou de ser salvo
    if (resultado) executarBusca(filtrosAplicados, resultado.pagina, false);
  };

  const toggleMotivoCancelamento = (motivo) => {
    setFormData((prev) => {
      const lista = prev.motivosCancelamento || [];
      return {
        ...prev,
        motivosCancelamento: lista.includes(motivo) ? lista.filter((m) => m !== motivo) : [...lista, motivo]
      };
    });
  };

  // Improcedente -> Em avaliação: quem reabre descreve a correção na observação (o backend também confere)
  const reabrindoImprocedente = formData?.statusBkoSalvo === 'Improcedente' && formData?.statusBko === 'Em_avaliacao_pelo_BKO';
  const observacaoAtual = (formData?.observacoes || '').trim();
  const correcaoInformada = !!observacaoAtual && observacaoAtual !== (formData?.observacoesSalvas || '').trim();

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErroDetalhe('');
    setMensagemSalvo('');
    if (reabrindoImprocedente && !correcaoInformada) {
      setErroDetalhe('Para voltar a venda de Improcedente para Em avaliação, descreva a correção feita na observação.');
      return;
    }
    setSalvando(true);
    try {
      const salvo = await documental.salvar(formData.vendaId, documental.paraProtocolo(formData));
      setFormData(documental.paraFormulario(salvo));
      setMensagemSalvo(`Protocolo da venda #${salvo.numeroVenda} salvo com sucesso.`);
    } catch (err) {
      setErroDetalhe(err.mensagem || err.message || 'Falha ao salvar o protocolo.');
    } finally {
      setSalvando(false);
    }
  };

  const handleIrParaVenda = () => {
    navigate('/venda/lancar', { state: { vendaId: formData.vendaId } });
  };

  const handleBaixarModelo = () => {
    const cabecalho = 'NUMERO_VENDA;PROTOCOLO_GED;STATUS_BKO;NUMERO_ACESSO;DATA_DIGITALIZACAO\r\n';
    const exemplo = '1000003;472092420;Procedente;61998674575;23/09/2026\r\n1000005;472092389;Não avaliado;67998464536;23/09/2026\r\n';
    documental.baixarArquivo(new Blob(['﻿' + cabecalho + exemplo], { type: 'text/csv;charset=utf-8;' }),
      'modelo_importacao_protocolos.csv');
  };

  const handleProcessarImportacao = async () => {
    setErroImportacao('');
    setResultadoImportacao(null);
    if (!arquivoCsv) {
      setErroImportacao('Escolha um arquivo CSV para importar.');
      return;
    }
    setCarregandoImportacao(true);
    try {
      setResultadoImportacao(await documental.importar(arquivoCsv));
    } catch (e) {
      setErroImportacao(e.mensagem || e.message || 'Falha ao importar o arquivo.');
    } finally {
      setCarregandoImportacao(false);
    }
  };

  // ==========================================================================
  // 1. TELA: IMPORTAÇÃO DE SERVIÇOS
  // ==========================================================================
  if (etapa === 'IMPORTAR') {
    const comErros = resultadoImportacao?.erros?.length > 0;
    return (
      <div style={{
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        color: 'var(--text)',
        fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}>
        <div style={{
          background: 'var(--panel, #120e1c)',
          border: '1px solid var(--line, #2d2442)',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            background: '#2563eb',
            color: '#ffffff',
            padding: '14px 20px',
            fontSize: '13.5px',
            lineHeight: 1.45,
            fontWeight: 500
          }}>
            <b>Atenção!</b> Ao clicar em salvar basta aguardar, a importação pode levar alguns segundos. Não feche a tela até receber a confirmação de conclusão.
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {erroImportacao && (
              <div role="alert" style={{ ...caixaMensagem, ...caixaErro }}>{erroImportacao}</div>
            )}

            {resultadoImportacao && (
              <div style={{ ...caixaMensagem, ...(comErros ? caixaAviso : caixaSucesso), display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span>
                  {resultadoImportacao.total} linha(s) lida(s): {resultadoImportacao.sucessos} importada(s) com sucesso
                  {comErros ? ` e ${resultadoImportacao.erros.length} com erro.` : ', sem erros.'}
                </span>
                {comErros && (
                  <>
                    <ul style={{ margin: 0, paddingLeft: 18, fontWeight: 500 }}>
                      {resultadoImportacao.erros.slice(0, 5).map((erro) => (
                        <li key={erro.linha}>Linha {erro.linha} (venda {erro.numeroVenda || '—'}): {erro.motivo}</li>
                      ))}
                      {resultadoImportacao.erros.length > 5 && <li>… e mais {resultadoImportacao.erros.length - 5}.</li>}
                    </ul>
                    <button
                      type="button"
                      onClick={() => documental.baixarErrosImportacao(resultadoImportacao.erros)}
                      style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Download size={15} /> Baixar CSV de erros
                    </button>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Arquivo (CSV):</label>
              <div style={{
                background: 'var(--panel-2, #181329)',
                border: '1px solid var(--line, #382b4f)',
                borderRadius: 4,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                maxWidth: 420
              }}>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => { setArquivoCsv(e.target.files[0] || null); setErroImportacao(''); }}
                  style={{ fontSize: 12.5, color: 'var(--text)', cursor: 'pointer' }}
                />
              </div>
              <small style={{ color: 'var(--text-faint)' }}>
                Colunas NUMERO_VENDA;PROTOCOLO_GED;STATUS_BKO;NUMERO_ACESSO;DATA_DIGITALIZACAO (dd/mm/aaaa), separadas por ; ou ,.
              </small>
            </div>

            <div
              onClick={handleBaixarModelo}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--text)', cursor: 'pointer', userSelect: 'none', marginTop: 4, width: 'fit-content' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                <Download size={18} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, textDecoration: 'underline' }}>
                Modelo de arquivo para importação
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--line, #2d2442)', margin: 0 }} />

          <div style={{ padding: '24px 28px', display: 'flex', justifyContent: 'center', background: 'var(--panel)' }}>
            <div style={{
              background: 'var(--panel-2, #1f1833)',
              border: '1px solid var(--line, #3a2b54)',
              borderRadius: 14,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}>
              <button
                type="button"
                onClick={() => {
                  setArquivoCsv(null);
                  setResultadoImportacao(null);
                  setErroImportacao('');
                  setEtapa('MENU');
                }}
                style={{ ...botaoRodape, background: '#7f1d1d', boxShadow: '0 2px 6px rgba(127, 29, 29, 0.4)' }}
              >
                <span>Apagar</span>
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={handleProcessarImportacao}
                disabled={carregandoImportacao}
                style={{ ...botaoRodape, background: '#65a30d', boxShadow: '0 2px 6px rgba(101, 163, 13, 0.4)', cursor: carregandoImportacao ? 'not-allowed' : 'pointer' }}
              >
                <span>{carregandoImportacao ? 'Aguarde...' : 'Salvar'}</span>
                <Check size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 2. TELA: MENU PRINCIPAL
  // ==========================================================================
  if (etapa === 'MENU') {
    const opcoes = [
      { icone: Search, rotulo: 'Buscar Registro', acao: () => { setMensagemErro(''); setEtapa('BUSCA'); } },
      {
        icone: Eye,
        rotulo: 'Fila do BKO',
        acao: () => { const fila = filtrosDaFila(); setFiltrosBusca(fila); setEtapa('BUSCA'); executarBusca(fila); }
      },
      { icone: UploadCloud, rotulo: 'Importar serviços', acao: () => { setResultadoImportacao(null); setErroImportacao(''); setEtapa('IMPORTAR'); } }
    ];
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={cardContainerEstilo}>
          <div style={topoCardEstilo}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, background: '#c084fc', borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>
                  Gestão Documental
                </h2>
              </div>
              <p style={{ margin: '4px 0 0 14px', color: 'var(--text-faint)', fontSize: 13 }}>
                Preenchimento do número de protocolo de aprovação de contrato.
              </p>
            </div>

            <button type="button" onClick={() => setCardAberto(!cardAberto)} style={botaoAvaliarEstilo}>
              <span>Avaliar</span>
              {cardAberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {cardAberto && (
            <div style={conteudoAbertoEstilo}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {opcoes.map(({ icone: Icone, rotulo, acao }) => (
                  <button
                    key={rotulo}
                    type="button"
                    onClick={acao}
                    style={botaoQuadradoEstilo}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent, #c026d3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={iconeWrapperEstilo}>
                      <Icone size={22} />
                    </div>
                    <b style={{ fontSize: 13.5 }}>{rotulo}</b>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 3. TELA: BUSCA DE SERVIÇOS (com a lista de resultados)
  // ==========================================================================
  if (etapa === 'BUSCA') {
    const ehFila = filtrosAplicados.statusBko === 'Nao_avaliado';
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box', color: 'var(--text)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={22} color="var(--accent, #c026d3)" />
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
              Busca de Serviços - Gestão documental
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setEtapa('MENU')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}
          >
            <ArrowLeft size={14} /> Voltar ao Menu
          </button>
        </div>

        {mensagemErro && (
          <div role="alert" style={{ ...caixaMensagem, ...caixaErro, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} />
            <span>{mensagemErro}</span>
          </div>
        )}

        <form onSubmit={handleExecutarBusca} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 28, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good, #22c55e)', marginBottom: 20 }}>
            <ChevronRight size={18} strokeWidth={3} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Filtros Principais</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={campoFiltro}>
                <label style={rotuloFiltro}>Período da Venda:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="date" value={filtrosBusca.dataInicio} onChange={(e) => handleFiltroChange('dataInicio', e.target.value)} style={campoImportacaoEstilo} />
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
                  <input type="date" value={filtrosBusca.dataFim} onChange={(e) => handleFiltroChange('dataFim', e.target.value)} style={campoImportacaoEstilo} />
                </div>
              </div>

              <div style={campoFiltro}>
                <label style={rotuloFiltro}>PDV:</label>
                <select value={filtrosBusca.filialId} onChange={(e) => handleFiltroChange('filialId', e.target.value)} style={campoImportacaoEstilo}>
                  <option value="">Todos</option>
                  {filiais.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div style={campoFiltro}>
                <label style={rotuloFiltro}>Vendedor:</label>
                <select value={filtrosBusca.vendedorId} onChange={(e) => handleFiltroChange('vendedorId', e.target.value)} style={campoImportacaoEstilo}>
                  <option value="">Todos</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                  ))}
                </select>
              </div>

              <div style={campoFiltro}>
                <label style={rotuloFiltro}>Nº Venda:</label>
                <input type="text" placeholder="Ex: 1000003" value={filtrosBusca.numeroVenda} onChange={(e) => handleFiltroChange('numeroVenda', e.target.value)} style={campoImportacaoEstilo} />
              </div>

              <div style={campoFiltro}>
                <label style={rotuloFiltro}>Status BKO:</label>
                <select value={filtrosBusca.statusBko} onChange={(e) => handleFiltroChange('statusBko', e.target.value)} style={campoImportacaoEstilo}>
                  <option value="">Todos</option>
                  {documental.STATUS_BKO.map((s) => (
                    <option key={s.valor} value={s.valor}>{s.rotulo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={campoFiltro}>
                <label style={rotuloFiltro}>Líder de Equipe:</label>
                <input type="text" placeholder="Digite o líder de equipe..." value={filtrosBusca.liderEquipe} onChange={(e) => handleFiltroChange('liderEquipe', e.target.value)} style={campoImportacaoEstilo} />
              </div>

              <div style={campoFiltro}>
                <label style={rotuloFiltro}>Nº Protocolo GED:</label>
                <input type="text" placeholder="Ex: 472092420" value={filtrosBusca.numeroProtocoloGed} onChange={(e) => handleFiltroChange('numeroProtocoloGed', e.target.value)} style={campoImportacaoEstilo} />
              </div>

              <div style={campoFiltro}>
                <label style={rotuloFiltro}>Nº de acesso (Telefone):</label>
                <input type="text" placeholder="DDD + Número" value={filtrosBusca.numeroAcesso} onChange={(e) => handleFiltroChange('numeroAcesso', e.target.value)} style={campoImportacaoEstilo} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 6 }}>
                <input type="checkbox" checked={filtrosBusca.incluirCanceladas} onChange={(e) => handleFiltroChange('incluirCanceladas', e.target.checked)} />
                <span>Incluir vendas canceladas</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => { setMensagemErro(''); setFiltrosBusca(FILTROS_VAZIOS); }}
              style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Limpar Campos
            </button>

            <button
              type="submit"
              disabled={buscando}
              style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 24px', fontSize: 13, fontWeight: 700, cursor: buscando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={15} /> {buscando ? 'Pesquisando...' : 'Pesquisar Serviços'}
            </button>
          </div>
        </form>

        {resultado && (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                {ehFila ? 'Fila do BKO — vendas Não avaliado' : 'Vendas encontradas'}
              </h3>
              <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
                {resultado.total} venda(s){buscando ? ' · atualizando...' : ''}
              </span>
            </div>

            {mensagemVazio ? (
              <div style={{ padding: '14px 4px', color: 'var(--text-faint)', fontSize: 13.5 }}>{mensagemVazio}</div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%', borderRadius: 8, border: '1px solid var(--line)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontSize: 11.5 }}>
                      {['Nº Venda', 'Data', 'Cliente', 'Vendedor', 'PDV', 'Status da venda', 'Protocolo GED', 'Status BKO'].map((t) => (
                        <th key={t} style={{ padding: '12px 14px' }}>{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.itens.map((v) => (
                      <tr
                        key={v.vendaId}
                        onClick={() => abrirDetalhe(v.vendaId)}
                        title="Abrir o protocolo da venda"
                        style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--panel-2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>{v.numeroVenda}</td>
                        <td style={{ padding: '12px 14px' }}>{v.dataVenda ? new Date(v.dataVenda).toLocaleDateString('pt-BR') : '—'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{v.clienteNome}</td>
                        <td style={{ padding: '12px 14px' }}>{v.vendedorNome}</td>
                        <td style={{ padding: '12px 14px' }}>{v.filialNome}</td>
                        <td style={{ padding: '12px 14px' }}><SeloStatusVenda status={v.statusVenda} /></td>
                        <td style={{ padding: '12px 14px', color: 'var(--accent)' }} className="mono">{v.numeroProtocoloGed || '—'}</td>
                        <td style={{ padding: '12px 14px' }}><SeloStatusBko status={v.statusBko} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {resultado.totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <button type="button" className="btn sm ghost" disabled={buscando || resultado.pagina === 0}
                  onClick={() => executarBusca(filtrosAplicados, resultado.pagina - 1)}>Anterior</button>
                <span style={{ color: 'var(--text-faint)' }}>Página {resultado.pagina + 1} de {resultado.totalPaginas}</span>
                <button type="button" className="btn sm ghost" disabled={buscando || resultado.pagina + 1 >= resultado.totalPaginas}
                  onClick={() => executarBusca(filtrosAplicados, resultado.pagina + 1)}>Próxima</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // 4. TELA: ANÁLISE E EDIÇÃO DO PROTOCOLO
  // ==========================================================================
  const somenteLeitura = formData.statusVenda === 'CANCELADA';
  const procedenteFinal = formData.statusBkoSalvo === 'Procedente';
  return (
    <div style={{ width: '100%', paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box', color: 'var(--text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileEdit size={22} color="var(--accent, #c026d3)" />
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: 'var(--accent, #c026d3)' }}>
            Análise e Edição de Protocolo - Venda #{formData.numeroVenda}
          </h1>
          <SeloStatusVenda status={formData.statusVenda} />
        </div>

        <button
          type="button"
          onClick={voltarParaBusca}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Voltar à Busca
        </button>
      </div>

      {somenteLeitura && (
        <div style={{ ...caixaMensagem, ...caixaErro }}>
          Venda cancelada: o protocolo fica somente para consulta.
        </div>
      )}

      <form
        onSubmit={handleSalvar}
        style={{ padding: 0, display: 'flex', flexDirection: 'column', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, width: '100%', boxSizing: 'border-box' }}
      >
        {/* Informações da Venda */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 18, width: '100%', boxSizing: 'border-box' }}>
          <div style={gradeDuas}>
            <Info rotulo="Serviço:" valor={formData.servico} />
            <Info rotulo="Plano:" valor={formData.plano} />
          </div>

          <div style={gradeDuas}>
            <Info rotulo="Cliente:" valor={formData.cliente} forte />
            <Info rotulo="Vendedor:" valor={formData.vendedor} forte />
          </div>

          <hr style={{ borderColor: 'var(--line)', margin: '6px 0' }} />

          <div style={gradeDuas}>
            <Info rotulo="Data da Venda:" valor={formData.dataVenda} mono />
            <Info rotulo="PDV:" valor={formData.filial} />
          </div>

          {formData.alteradoPor && (
            <Info rotulo="Protocolo salvo por último por:" valor={formData.alteradoPor} />
          )}

          <div style={gradeDuas}>
            <Info rotulo="Número de Acesso:" valor={formData.numeroAcesso || '—'} mono />
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Venda:</div>
              <button
                type="button"
                onClick={handleIrParaVenda}
                style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)', height: 36, padding: '0 20px', fontSize: 13, borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Ir para a venda
              </button>
            </div>
          </div>

          <fieldset disabled={somenteLeitura || salvando} style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div style={gradeDuas}>
              <Radios
                rotulo="Zerar Remuneração:"
                nome="zerarRemuneracao"
                opcoes={[['sim', 'Sim'], ['nao', 'Não']]}
                valor={formData.zerarRemuneracao}
                onChange={(v) => setFormData((prev) => ({ ...prev, zerarRemuneracao: v }))}
              />
              <Radios
                rotulo="Gerar Price:"
                nome="gerarPrice"
                opcoes={[['sim', 'Sim'], ['nao', 'Não']]}
                valor={formData.gerarPrice}
                onChange={(v) => setFormData((prev) => ({ ...prev, gerarPrice: v }))}
              />
            </div>

            <div style={gradeDuas}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Data Digitalização:</div>
                <input
                  type="date"
                  value={formData.dataDigitalizacao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dataDigitalizacao: e.target.value }))}
                  style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
                />
              </div>

              <div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Nº Protocolo GED:</div>
                <input
                  type="text"
                  placeholder="Ex: 472092420"
                  value={formData.numeroProtocoloGed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numeroProtocoloGed: e.target.value }))}
                  style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
                />
              </div>
            </div>

            <div style={gradeDuas}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Nº Protocolo GED (Portabilidade):</div>
                <input
                  type="text"
                  value={formData.numeroProtocoloGedPortabilidade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numeroProtocoloGedPortabilidade: e.target.value }))}
                  style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
                />
              </div>
              <Radios
                rotulo="Ativação da Primeira Chamada:"
                nome="ativacaoPrimeiraChamada"
                opcoes={[['sim', 'Sim'], ['nao', 'Não']]}
                valor={formData.ativacaoPrimeiraChamada}
                onChange={(v) => setFormData((prev) => ({ ...prev, ativacaoPrimeiraChamada: v }))}
              />
            </div>

            <div style={gradeDuas}>
              <CampoData rotulo="Data de Ativação:" campo="dataAtivacao" formData={formData} setFormData={setFormData} />
              <CampoData rotulo="Data de Baixa:" campo="dataBaixa" formData={formData} setFormData={setFormData} />
            </div>

            <div style={gradeDuas}>
              <CampoData rotulo="Data Instalação:" campo="dataInstalacao" formData={formData} setFormData={setFormData} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Vencimento:</div>
                <select
                  value={formData.vencimento}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vencimento: e.target.value }))}
                  style={{ ...campoImportacaoEstilo, width: 140 }}
                >
                  {LISTA_DIAS_VENCIMENTO.map((dia) => (
                    <option key={dia} value={dia}>Dia {dia}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={gradeDuas}>
              <CampoData rotulo="Data Agendada de Instalação:" campo="dataAgendadaInstalacao" formData={formData} setFormData={setFormData} />
              <Radios
                rotulo="Serviço Instalado:"
                nome="servicoInstalado"
                opcoes={[['sim', 'Sim'], ['nao', 'Não']]}
                valor={formData.servicoInstalado}
                onChange={(v) => setFormData((prev) => ({ ...prev, servicoInstalado: v }))}
              />
            </div>

            <div style={gradeDuas}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Armário:</div>
                <input
                  type="text"
                  value={formData.armario}
                  onChange={(e) => setFormData((prev) => ({ ...prev, armario: e.target.value }))}
                  style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
                />
              </div>
              <CampoData rotulo="Data Última Ativação:" campo="dataUltimaAtivacao" formData={formData} setFormData={setFormData} />
            </div>

            <div style={gradeDuas}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Status GED:</div>
                <select
                  value={formData.statusGed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, statusGed: e.target.value }))}
                  style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
                >
                  <option value="">Automático (pelo protocolo)</option>
                  {documental.STATUS_GED.map(({ valor, rotulo }) => (
                    <option key={valor} value={valor}>{rotulo}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>Motivo Reprovação:</div>
                <input
                  type="text"
                  maxLength={200}
                  value={formData.motivoReprovacao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, motivoReprovacao: e.target.value }))}
                  style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
                />
              </div>
            </div>

            <hr style={{ borderColor: 'var(--line)', margin: '6px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 600 }}>Status BKO:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                {documental.STATUS_BKO.map(({ valor, rotulo }) => (
                  <label key={valor} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: procedenteFinal ? 'default' : 'pointer', margin: 0 }}>
                    <input
                      type="radio"
                      name="statusBko"
                      value={valor}
                      checked={formData.statusBko === valor}
                      disabled={procedenteFinal && valor !== 'Procedente'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, statusBko: e.target.value }))}
                    />
                    <span style={{ fontSize: 13.5, fontWeight: formData.statusBko === valor ? 700 : 400 }}>{rotulo}</span>
                  </label>
                ))}
              </div>
              {!somenteLeitura && procedenteFinal && (
                <small style={{ color: 'var(--text-faint)' }}>
                  Venda avaliada como Procedente: o status BKO não muda mais.
                </small>
              )}
              {!somenteLeitura && reabrindoImprocedente && (
                <small style={{ color: correcaoInformada ? 'var(--text-faint)' : 'var(--warn, #f59e0b)', fontWeight: 600 }}>
                  Para voltar de Improcedente para Em avaliação, descreva a correção feita na observação.
                </small>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 540 }}>
              <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Líder de Equipe:</span>
              <input
                type="text"
                value={formData.liderEquipe}
                onChange={(e) => setFormData((prev) => ({ ...prev, liderEquipe: e.target.value }))}
                style={campoImportacaoEstilo}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações:</span>
              <textarea
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                style={{ ...campoImportacaoEstilo, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>Observações da importação:</span>
              <textarea
                rows={3}
                value={formData.observacoesImportacao}
                onChange={(e) => setFormData((prev) => ({ ...prev, observacoesImportacao: e.target.value }))}
                style={{ ...campoImportacaoEstilo, resize: 'vertical' }}
              />
            </div>

            <hr style={{ borderColor: 'var(--line)', margin: '6px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Radios
                rotulo="Situação do serviço:"
                nome="situacaoServico"
                opcoes={[['Confirmado', 'Confirmado'], ['Cancelado', 'Cancelado']]}
                valor={formData.situacaoServico}
                onChange={(v) => setFormData((prev) => ({ ...prev, situacaoServico: v }))}
                destaque
              />

              <Radios
                rotulo="Gerar comissão de serviço do vendedor:"
                nome="gerarComissao"
                opcoes={[['Sim', 'Sim'], ['Não', 'Não']]}
                valor={formData.gerarComissao}
                onChange={(v) => setFormData((prev) => ({ ...prev, gerarComissao: v }))}
              />

              <Radios
                rotulo="Gerar comissão de aparelho do vendedor:"
                nome="comissaoAparelho"
                opcoes={[['Sim', 'Sim'], ['Não', 'Não']]}
                valor={formData.comissaoAparelho}
                onChange={(v) => setFormData((prev) => ({ ...prev, comissaoAparelho: v }))}
              />

              {formData.situacaoServico === 'Cancelado' && (
                <div style={{ background: 'var(--panel-2)', border: '1px solid var(--bad, #ef4444)', borderRadius: 8, padding: 20, maxWidth: 600, marginTop: 8 }}>
                  <div style={{ color: 'var(--bad, #ef4444)', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                    Motivo do cancelamento:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto', paddingRight: 6 }}>
                    {LISTA_MOTIVOS_CANCELAMENTO.map((motivo) => (
                      <label key={motivo} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text)' }}>
                        <input
                          type="checkbox"
                          checked={(formData.motivosCancelamento || []).includes(motivo)}
                          onChange={() => toggleMotivoCancelamento(motivo)}
                        />
                        <span>{motivo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </fieldset>
        </div>

        {/* Rodapé de Ações */}
        <div style={{ background: 'var(--panel-2)', padding: '16px 32px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, borderRadius: '0 0 12px 12px' }}>
          {mensagemSalvo && (
            <span role="status" style={{ color: 'var(--good, #22c55e)', fontSize: 13.5, fontWeight: 600, marginRight: 'auto' }}>
              ✓ {mensagemSalvo}
            </span>
          )}
          {erroDetalhe && (
            <span role="alert" style={{ color: 'var(--bad, #ef4444)', fontSize: 13.5, fontWeight: 600, marginRight: 'auto' }}>
              {erroDetalhe}
            </span>
          )}

          <button
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 20px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, cursor: 'pointer' }}
            onClick={voltarParaBusca}
          >
            <ArrowLeft size={15} /> Voltar
          </button>

          {!somenteLeitura && (
            <button
              type="submit"
              disabled={salvando}
              style={{ background: '#84cc16', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 26px', fontWeight: 700, borderRadius: 6, cursor: salvando ? 'not-allowed' : 'pointer' }}
            >
              {salvando ? 'Salvando...' : 'Salvar'} <Check size={16} strokeWidth={3} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- componentes pequenos
function Info({ rotulo, valor, forte = false, mono = false }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{rotulo}</div>
      <div className={mono ? 'mono' : undefined} style={{ fontSize: mono ? 14 : 15, fontWeight: forte ? 700 : mono ? 400 : 600, color: 'var(--text)', marginTop: 4 }}>
        {valor}
      </div>
    </div>
  );
}

function CampoData({ rotulo, campo, formData, setFormData }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 6 }}>{rotulo}</div>
      <input
        type="date"
        value={formData[campo]}
        onChange={(e) => setFormData((prev) => ({ ...prev, [campo]: e.target.value }))}
        style={{ ...campoImportacaoEstilo, maxWidth: 360 }}
      />
    </div>
  );
}

function Radios({ rotulo, nome, opcoes, valor, onChange, destaque = false }) {
  return (
    <div>
      <div style={{ fontSize: 13.5, color: destaque ? 'var(--text)' : 'var(--text-faint)', fontWeight: destaque ? 600 : 400, marginBottom: 8 }}>{rotulo}</div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {opcoes.map(([v, texto]) => (
          <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
            <input type="radio" name={nome} value={v} checked={valor === v} onChange={(e) => onChange(e.target.value)} />
            <span style={{ fontSize: 13.5 }}>{texto}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SeloStatusVenda({ status }) {
  const cancelada = status === 'CANCELADA';
  return (
    <span style={{
      background: cancelada ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
      color: cancelada ? 'var(--bad, #ef4444)' : 'var(--good, #22c55e)',
      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap'
    }}>
      {documental.rotuloStatusVenda(status)}
    </span>
  );
}

function SeloStatusBko({ status }) {
  const cores = {
    Procedente: ['rgba(34, 197, 94, 0.15)', 'var(--good)'],
    Improcedente: ['rgba(239, 68, 68, 0.15)', 'var(--bad)'],
  };
  const [fundo, cor] = cores[status] || ['rgba(245, 158, 11, 0.15)', 'var(--warn)'];
  return (
    <span style={{ background: fundo, color: cor, padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {documental.rotuloStatusBko(status)}
    </span>
  );
}

// ---------------------------------------------------------------- estilos reutilizáveis
const cardContainerEstilo = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: '18px 24px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  transition: 'background 0.2s ease, border-color 0.2s ease'
};

const topoCardEstilo = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' };

const botaoAvaliarEstilo = {
  background: 'var(--input-bg)',
  border: '1px solid var(--line)',
  borderRadius: 20,
  color: 'var(--text)',
  padding: '6px 16px',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s ease'
};

const conteudoAbertoEstilo = {
  paddingTop: 16,
  marginTop: 14,
  borderTop: '1px solid var(--line)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12
};

const botaoQuadradoEstilo = {
  background: 'var(--panel-2)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '24px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  cursor: 'pointer',
  color: 'var(--text)',
  minWidth: 125,
  transition: 'transform 0.15s ease, border-color 0.15s ease'
};

const iconeWrapperEstilo = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: 'rgba(192, 38, 211, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--accent, #c026d3)'
};

const campoImportacaoEstilo = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #382b4f)',
  color: 'var(--text, #ffffff)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const campoFiltro = { display: 'flex', flexDirection: 'column', gap: 6 };
const rotuloFiltro = { fontSize: 13, fontWeight: 600, color: 'var(--text)' };
const gradeDuas = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' };

const caixaMensagem = { padding: '12px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600 };
const caixaErro = { background: 'rgba(239, 68, 68, 0.15)', color: 'var(--bad, #ef4444)', border: '1px solid var(--bad, #ef4444)' };
const caixaAviso = { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warn, #f59e0b)', border: '1px solid var(--warn, #f59e0b)' };
const caixaSucesso = { background: 'rgba(34, 197, 94, 0.15)', color: 'var(--good, #22c55e)', border: '1px solid var(--good, #22c55e)' };

const botaoRodape = {
  color: '#ffffff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'opacity 0.15s ease'
};
