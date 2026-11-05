import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Pencil, Plus, Trash2, CheckCircle, HelpCircle, X, Check } from 'lucide-react';
import * as api from '../services/vendasApi';

const CATEGORIAS_ITENS = [
  { id: 'PRODUTO_VIVO', rotulo: 'Produto Vivo' },
  { id: 'SERVICO_VIVO', rotulo: 'Serviço Vivo' },
  { id: 'ACESSORIO', rotulo: 'Acessório' },
  { id: 'RECARGA', rotulo: 'Recarga' },
  { id: 'PAGAMENTO', rotulo: 'Pagamento' }
];

// Formas que cada condição aceita. O crédito do parcelado é a linha FINANCIADO, criada pelo backend.
const FORMAS_PIX = ['PIX', 'Vivo Pay', 'Voucher'];
const FORMAS_A_VISTA = [
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'PIX',
  'Vivo Pay',
  'Boleto Bancário / Convênio',
  'Voucher'
];
const FORMAS_ENTRADA = ['Dinheiro', 'PIX', 'Vivo Pay', 'Cartão de Débito', 'Voucher'];
const formasDaCondicao = (condicao) => {
  if (condicao === 'PIX') return FORMAS_PIX;
  return api.ehParcelado(condicao) ? FORMAS_ENTRADA : FORMAS_A_VISTA;
};

const PARCELAS_CREDITO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const OPCOES_SERVICO = [
  'Alta',
  'Troca de Plano',
  'Migração',
  'Reativação',
  'Troca de Simcard',
  'Seguro',
  'SVA',
  'Troca de titularidade',
  'Troca de numero',
  'Troca de Aparelho Smartphone Pós'
];

const OPCOES_SISTEMA_ORIGEM = ['VIVO+', 'NEXT', 'GED'];
const DIAS_VENCIMENTO = ['01', '06', '10', '15', '21', '26', '28'];

const LISTA_DDDS = [
  '89', '61', '62', '65', '66', '67', '11', '19', '21', '31', '41', '51', '71',
  '81', '85', '91', '92', '93', '94', '95', '96', '97', '98', '99', '27',
  '28', '32', '33', '34', '35', '36', '37', '38', '39', '42', '43', '44',
  '45', '46', '47', '48', '49', '55', '56', '57', '58', '59'
];

// Valor do combo de plano para "Sem plano / Pré-pago" (o backend resolve o grupo PRE)
const SEM_PLANO = '__SEM_PLANO__';
const ROTULO_SEM_PLANO = 'Sem plano / Pré-pago';
const rotuloPlano = (v) => (v === SEM_PLANO ? ROTULO_SEM_PLANO : v || '');
/** Plano para o backend: sem plano vai vazio na consulta (grupo PRE) e com o rótulo na venda. */
const planoParaConsulta = (v) => (v && v !== SEM_PLANO ? v : undefined);
const planoParaVenda = (v) => (v === SEM_PLANO ? ROTULO_SEM_PLANO : v || null);

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const COR_SEM_PRECO = 'var(--warn, #f59e0b)';

const PAGTO_VENDA_VAZIO = {
  condicaoPagamento: 'A_VISTA',
  parcelasCondicao: null,
  valorParcela: null,
  valorItens: null,
  ajusteCondicao: null
};

/**
 * Preço de uma unidade do estoque na tabela vigente, com debounce de 300 ms.
 * status: ocioso | carregando | ok | semPreco | erro.
 */
function usePrecoItem({ estoqueId, plano, habilitado }) {
  const [estado, setEstado] = useState({ status: 'ocioso' });

  useEffect(() => {
    if (!habilitado || !estoqueId) {
      setEstado({ status: 'ocioso' });
      return undefined;
    }
    let ativo = true;
    setEstado({ status: 'carregando' });
    const t = setTimeout(() => {
      api.consultarPreco({ estoqueId, plano })
        .then((r) => {
          if (!ativo) return;
          setEstado(r.semPreco ? { status: 'semPreco', mensagem: r.mensagem } : { status: 'ok', preco: r });
        })
        .catch((e) => ativo && setEstado({ status: 'erro', mensagem: e.mensagem || 'Falha ao consultar o preço.' }));
    }, 300);
    return () => { ativo = false; clearTimeout(t); };
  }, [estoqueId, plano, habilitado]);

  return estado;
}

/** Combo com busca digitável dos planos da tabela vigente (~400): nome do plano e, em cinza, o grupo. */
function ComboPlano({ value, onChange, placeholder, permitirSemPlano = true, destaque }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');
  const [planos, setPlanos] = useState([]);
  const [estado, setEstado] = useState('ocioso'); // ocioso | carregando | ok | erro
  const [erroMsg, setErroMsg] = useState('');

  useEffect(() => {
    if (!aberto) return undefined;
    let ativo = true;
    setEstado('carregando');
    const t = setTimeout(() => {
      api.listarPlanos(texto.trim())
        .then((r) => { if (ativo) { setPlanos(r); setEstado('ok'); } })
        .catch((e) => { if (ativo) { setErroMsg(e.mensagem || 'Falha ao carregar os planos.'); setEstado('erro'); } });
    }, 300);
    return () => { ativo = false; clearTimeout(t); };
  }, [texto, aberto]);

  const escolher = (valor, plano) => {
    onChange(valor, plano);
    setAberto(false);
    setTexto('');
  };

  const opcao = { padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line-soft)', fontSize: 13 };
  const cinza = { color: 'var(--text-faint)', fontSize: 12, marginLeft: 8 };
  const aviso = { padding: '8px 12px', fontSize: 12.5, color: 'var(--text-faint)' };

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        type="text"
        value={aberto ? texto : rotuloPlano(value)}
        placeholder={aberto ? 'Digite para buscar o plano...' : placeholder}
        onFocus={() => { setAberto(true); setTexto(''); }}
        onBlur={() => setAberto(false)}
        onChange={(e) => setTexto(e.target.value)}
        style={{ ...inputStyleGlobal, width: '100%', ...(destaque ? { borderColor: destaque } : {}) }}
      />
      {aberto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, zIndex: 9999,
          background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 6,
          maxHeight: 260, overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          {permitirSemPlano && (
            <div style={opcao} onMouseDown={() => escolher(SEM_PLANO, null)}>
              <span style={{ color: 'var(--text)' }}>{ROTULO_SEM_PLANO}</span>
              <span style={cinza}>{api.rotuloGrupo('PRE')}</span>
            </div>
          )}
          {estado === 'carregando' && <div style={aviso}>Carregando planos...</div>}
          {estado === 'erro' && <div style={{ ...aviso, color: 'var(--bad, #ef4444)' }}>{erroMsg}</div>}
          {estado === 'ok' && planos.length === 0 && (
            <div style={aviso}>{texto.trim() ? 'Nenhum plano encontrado.' : 'Nenhum plano na tabela vigente.'}</div>
          )}
          {estado === 'ok' && planos.map((p) => (
            <div key={`${p.nomePlano}|${p.sistema || ''}`} style={opcao} onMouseDown={() => escolher(p.nomePlano, p)}>
              <span style={{ color: 'var(--text)' }}>{p.nomePlano}</span>
              <span style={cinza}>{api.rotuloGrupo(p.grupoPlano)}{p.sistema ? ` · ${p.sistema}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Selo da tabela aplicada pelo backend no item (Renova / Regular). */
function SeloTabela({ tabela }) {
  if (!tabela) return null;
  const renova = tabela === 'RENOVA';
  return (
    <span style={{
      display: 'inline-block', padding: '1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      letterSpacing: 0.2, verticalAlign: 'middle',
      background: renova ? 'var(--accent, #a855f7)' : 'var(--panel-2, #1f1a33)',
      color: renova ? '#fff' : 'var(--text-dim)',
      border: renova ? '1px solid transparent' : '1px solid var(--line)'
    }}>
      {renova ? 'Renova' : 'Regular'}
    </span>
  );
}

/** Um cartão de "Como o cliente vai pagar?". */
function CartaoCondicao({ titulo, total, ativo, bloqueado, onEscolher, children }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 16px', borderRadius: 8,
      background: 'var(--panel-2, #181329)',
      border: ativo ? '2px solid var(--accent, #c026d3)' : '2px solid var(--line)'
    }}>
      <b style={{ fontSize: 13.5, color: 'var(--text)' }}>{titulo}</b>
      <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--good)' }}>
        {total === undefined ? '—' : formatadorMoeda.format(total)}
      </span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'var(--text-dim)' }}>
        {children}
      </div>
      <button
        type="button"
        className="btn"
        onClick={onEscolher}
        disabled={ativo || bloqueado}
        style={{ marginTop: 6, fontWeight: 700, cursor: ativo || bloqueado ? 'default' : 'pointer' }}
      >
        {ativo ? 'Selecionada' : 'Escolher'}
      </button>
    </div>
  );
}

/** Topo da aba Pagamento: os valores vêm de GET /vendas/{id}/simulacao-pagamento. */
function CartoesCondicao({ simulacao, condicao, parcelas, bloqueado, onEscolher, onParcelas }) {
  const buscar = (c) => simulacao.find((s) => s.condicao === c);
  const pix = buscar('PIX');
  const aVista = buscar('A_VISTA');
  const condicaoParcelada = api.condicaoParcelada(parcelas);
  const parcelado = buscar(condicaoParcelada);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      <CartaoCondicao
        titulo="PIX / Vivo Pay"
        total={pix?.total}
        ativo={condicao === 'PIX'}
        bloqueado={bloqueado}
        onEscolher={() => onEscolher('PIX')}
      >
        {pix && <span>Economia de {formatadorMoeda.format(Math.abs(pix.economiaOuJuros))}</span>}
      </CartaoCondicao>

      <CartaoCondicao
        titulo="À vista ou até 12x"
        total={aVista?.total}
        ativo={condicao === 'A_VISTA'}
        bloqueado={bloqueado}
        onEscolher={() => onEscolher('A_VISTA')}
      >
        {aVista && <span>{aVista.parcelas}x de {formatadorMoeda.format(aVista.valorParcela)} sem juros</span>}
      </CartaoCondicao>

      <CartaoCondicao
        titulo="Parcelado"
        total={parcelado?.total}
        ativo={condicao === condicaoParcelada}
        bloqueado={bloqueado}
        onEscolher={() => onEscolher(condicaoParcelada)}
      >
        <select
          aria-label="Número de parcelas"
          value={parcelas}
          disabled={bloqueado}
          onChange={(e) => onParcelas(Number(e.target.value))}
          style={{ ...inputStyleGlobal, padding: '4px 8px' }}
        >
          {api.PARCELAS_FINANCIADAS.map((n) => <option key={n} value={n}>{n}x</option>)}
        </select>
        {parcelado && (
          <>
            <span>{parcelado.parcelas}x de {formatadorMoeda.format(parcelado.valorParcela)}</span>
            <span>Juros de {formatadorMoeda.format(parcelado.economiaOuJuros)}</span>
          </>
        )}
      </CartaoCondicao>
    </div>
  );
}

/** Resumo da aba Pagamento: só exibe o que o backend devolveu. */
function ResumoPagamento({ pagto, total, pago, saldo, renova, descontoFabricante }) {
  const ajuste = pagto.ajusteCondicao || 0;
  const linha = (rotulo, valor, destaque) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: destaque ? 14.5 : 13 }}>
      <span style={{ color: destaque ? 'var(--text)' : 'var(--text-dim)', fontWeight: destaque ? 700 : 500 }}>{rotulo}</span>
      <span className="mono" style={{ color: 'var(--text)', fontWeight: destaque ? 700 : 600 }}>{formatadorMoeda.format(valor || 0)}</span>
    </div>
  );
  return (
    <fieldset style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '14px 18px', maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <legend style={{ padding: '0 8px', color: 'var(--accent, #a855f7)', fontSize: 13, fontWeight: 700 }}>Resumo do pagamento</legend>
      {linha('Itens (preço cheio)', pagto.valorItens)}
      {ajuste !== 0 && linha(ajuste < 0 ? 'Desconto PIX' : 'Juros', ajuste)}
      {renova && linha('Desconto fabricante (Renova, informativo)', descontoFabricante)}
      {linha('Total', total, true)}
      {linha('Pago', pago)}
      {linha('Saldo', saldo, true)}
      {api.ehParcelado(pagto.condicaoPagamento) && (
        <div className="mono" style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-dim)' }}>
          {pagto.parcelasCondicao} × {formatadorMoeda.format(pagto.valorParcela || 0)}
        </div>
      )}
    </fieldset>
  );
}

/** Área de preço da tabela vigente: cartão/débito/dinheiro, PIX, parcelas 13x–21x e vigência. */
function PainelPreco({ estado, vazio }) {
  const linha = { display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 };
  const rotulo = { fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 };
  const selo = (cor) => ({ background: cor, color: '#fff', fontWeight: 700, padding: '6px 14px', borderRadius: 6, fontSize: 13.5 });

  if (estado.status === 'ok') {
    const p = estado.preco;
    const parcelasLongas = p.parcelas.filter((x) => x.n >= 13);
    return (
      <>
        <div style={linha}>
          <label style={rotulo}>Valor (cartão até 12x, débito, dinheiro):</label>
          <div><span className="mono" style={selo('var(--good, #22c55e)')}>{api.formatarMoeda(p.preco)}</span></div>
        </div>
        <div style={linha}>
          <label style={rotulo}>Valor no PIX / Vivo Pay:</label>
          <div>
            {p.precoPix != null
              ? <span className="mono" style={selo('var(--accent, #a855f7)')}>{api.formatarMoeda(p.precoPix)}</span>
              : <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>Sem preço PIX nesta tabela</span>}
          </div>
        </div>
        {parcelasLongas.length > 0 && (
          <div style={linha}>
            <div />
            <details style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
              <summary style={{ cursor: 'pointer' }}>Parcelas de 13x a 21x (valor total)</summary>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '4px 16px', marginTop: 8 }}>
                {parcelasLongas.map((x) => (
                  <span key={x.n} className="mono">
                    {x.n}x: {api.formatarMoeda(x.valor)} <span style={{ color: 'var(--text-faint)' }}>({api.formatarMoeda(x.valor / x.n)}/mês)</span>
                  </span>
                ))}
              </div>
            </details>
          </div>
        )}
        <div style={linha}>
          <div />
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Tabela vigente desde {api.formatarData(p.vigencia)}</span>
        </div>
      </>
    );
  }

  const mensagens = {
    ocioso: { cor: 'var(--text-faint)', texto: vazio },
    carregando: { cor: 'var(--text-faint)', texto: 'Consultando preço na tabela vigente...' },
    semPreco: { cor: COR_SEM_PRECO, texto: estado.mensagem },
    erro: { cor: 'var(--bad, #ef4444)', texto: estado.mensagem },
  };
  const m = mensagens[estado.status] || mensagens.ocioso;
  return (
    <div style={linha}>
      <label style={rotulo}>Valor:</label>
      <span style={{ color: m.cor, fontSize: 13, fontWeight: estado.status === 'semPreco' ? 600 : 400 }}>{m.texto}</span>
    </div>
  );
}

const normalizarComparacao = (txt = '') =>
  txt
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function Venda() {
  const location = useLocation();

  const [numeroVenda, setNumeroVenda] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('INICIO');
  const [status, setStatus] = useState('ABERTA');
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Identificação e Vendedor
  const [pdvId, setPdvId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [cliente, setCliente] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [emailLogin, setEmailLogin] = useState('');
  const [senha, setSenha] = useState('');

  // Integração com a API
  const [vendaId, setVendaId] = useState(null);          // id da venda no backend (null = carrinho ainda não aberto)
  const [valorTotalVenda, setValorTotalVenda] = useState(null); // valorTotal devolvido pelo backend
  const [saldoVenda, setSaldoVenda] = useState(null);           // saldo devolvido pelo backend (pode ser negativo)
  const [avisoVenda, setAvisoVenda] = useState('');             // aviso do backend (ex.: pagamentos acima do total)
  const [renovaAtivo, setRenovaAtivo] = useState(false);
  const [descontoFabricante, setDescontoFabricante] = useState(null);
  const [renovaBloqueio, setRenovaBloqueio] = useState('');     // mensagem do backend ao recusar o Renova
  const [pagtoVenda, setPagtoVenda] = useState(PAGTO_VENDA_VAZIO); // condição e valores devolvidos pelo backend
  const [parcelasParcelado, setParcelasParcelado] = useState(api.PARCELAS_FINANCIADAS[0]); // seletor 13x–21x
  const [simulacao, setSimulacao] = useState([]);
  const [simulacaoErro, setSimulacaoErro] = useState('');
  const [incompativeis, setIncompativeis] = useState([]);       // pagamentos recusados na troca de condição (422)
  const [filiais, setFiliais] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [erro, setErro] = useState('');
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [aparelhosSugeridos, setAparelhosSugeridos] = useState([]);
  const [acessoriosSugeridos, setAcessoriosSugeridos] = useState([]);
  const inicioSalvoRef = useRef({ clienteId: null, filialId: null });

  // Carrinho
  const [itensPorCategoria, setItensPorCategoria] = useState({
    PRODUTO_VIVO: [],
    SERVICO_VIVO: [],
    ACESSORIO: [],
    RECARGA: []
  });

  // Modal / Formulário Produto Vivo
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [buscaSerialProduto, setBuscaSerialProduto] = useState('');
  const [aparelhoSelecionado, setAparelhoSelecionado] = useState(null);
  const [formProdutoVivo, setFormProdutoVivo] = useState({
    sva: 'Nao',
    seguro: 'Nao',
    segmento: '',
    servico: '',
    ddd: '',
    planoAtivo: '',
    debitoAutomatico: false,
    valor: 0,
    valorAdicional: '',
    valorAcrescimo: 0.00,
    desconto: '',
    cupom: false,
    vencimentoFatura: '',
    numeroLinha: '',
    sistemaOrigem: '',
    numOrdemNext: '',
    numSolicitacaoGed: ''
  });

  // Formulário de Serviço Vivo
  const [servicoForm, setServicoForm] = useState({
    servico: '',
    ddd: '',
    tipoPlano: '',
    planoAntigo: '',
    planoNovo: '',
    numeroLinha: '',
    sistemaOrigem: '',
    vencimentoFatura: '',
    valorMensalidade: '',
    simcard3g: '',
    simcard4g: '',
    clientePossuiSimcard: false,
    simcardDoado: false,
    descontoChip: '',
    cobrarChip: false,
    serialConfirmado: false
  });

  // Formulário de Acessório
  const [buscaAcessorio, setBuscaAcessorio] = useState('');
  const [acessorioSelecionado, setAcessorioSelecionado] = useState(null);
  const [qtdAcessorio, setQtdAcessorio] = useState(1);

  // Pagamentos
  const [pagamentos, setPagamentos] = useState([]);
  const [pgtoForm, setPgtoForm] = useState({
    forma: '',
    valor: '',
    parcelas: '1x',
    codigoVoucher: ''
  });

  // =========================================================================
  // CATÁLOGOS (PDVs e vendedores) E VENDA EXISTENTE — tudo vindo da API
  // =========================================================================
  useEffect(() => {
    api.listarFiliais().then(setFiliais).catch((e) => setErro(e.mensagem));
    api.listarVendedores().then(setVendedores).catch(() => setVendedores([]));
  }, []);

  useEffect(() => {
    const id = location.state?.vendaId;
    if (!id) return;
    api.buscarVenda(id).then((v) => carregarVendaExistente(v)).catch((e) => setErro(e.mensagem));
  }, [location.state]);

  // Total da venda calculado pelo backend (não recalcular no front)
  const totalAPagarCaixa = valorTotalVenda ?? 0;

  // Saldo vindo do backend (valorTotal − pagamentos); sem venda aberta, nada a pagar
  const saldoBackend = saldoVenda ?? totalAPagarCaixa;
  const totalPagoAteAgora = totalAPagarCaixa - saldoBackend;
  const saldoRestante = Math.max(0, saldoBackend);

  // Renova: precisa de voucher lançado e de aparelho com preço por plano
  const temVoucher = pagamentos.some((p) => p.formaEnum === 'VOUCHER');
  const temAparelhoRenova = itensPorCategoria.PRODUTO_VIVO.some((i) => i.grupoPlano && i.grupoPlano !== 'SEM_PLANO');
  useEffect(() => { setRenovaBloqueio(''); }, [itensPorCategoria]);

  // Condição de pagamento
  const condicaoVenda = pagtoVenda.condicaoPagamento;
  const vendaParcelada = api.ehParcelado(condicaoVenda);
  const formasDisponiveis = formasDaCondicao(condicaoVenda);
  const vendaEditavel = Boolean(vendaId) && status === 'ABERTA';
  const incompativeisAtuais = incompativeis.filter((p) => pagamentos.some((x) => x.id === p.id));

  // A simulação depende dos itens, das entradas e do Renova: recarrega sempre que a venda volta do backend
  useEffect(() => {
    if (!vendaId) {
      setSimulacao([]);
      setSimulacaoErro('');
      return undefined;
    }
    if (abaAtiva !== 'PAGAMENTO') return undefined;
    let atual = true;
    api.simularPagamento(vendaId)
      .then((lista) => {
        if (!atual) return;
        setSimulacao(lista);
        setSimulacaoErro('');
      })
      .catch((e) => {
        if (atual) setSimulacaoErro(e.mensagem || 'Falha ao simular o pagamento.');
      });
    return () => { atual = false; };
  }, [abaAtiva, vendaId, itensPorCategoria, pagamentos, renovaAtivo]);

  useEffect(() => {
    if (abaAtiva === 'PAGAMENTO') {
      setPgtoForm((prev) => ({
        ...prev,
        // No parcelado o campo é a entrada, que é opcional: o saldo vai para o financiamento
        valor: !vendaParcelada && saldoRestante > 0 ? saldoRestante.toFixed(2) : ''
      }));
    }
  }, [abaAtiva, saldoRestante, vendaParcelada]);

  // Trocou a condição: a forma escolhida pode não valer mais
  useEffect(() => {
    setPgtoForm((prev) => (!prev.forma || formasDaCondicao(condicaoVenda).includes(prev.forma)
      ? prev
      : { ...prev, forma: '' }));
  }, [condicaoVenda]);

  const contagemPorCategoria = useMemo(() => {
    const mapa = { PAGAMENTO: pagamentos.length };
    Object.keys(itensPorCategoria).forEach((cat) => {
      mapa[cat] = itensPorCategoria[cat].length;
    });
    return mapa;
  }, [itensPorCategoria, pagamentos]);

  const totalItensCarrinho = useMemo(() => {
    return Object.values(itensPorCategoria)
      .flat()
      .reduce((acc, item) => acc + item.quantidade, 0);
  }, [itensPorCategoria]);

  const requerPlanoAntigo = useMemo(() => {
    const s = servicoForm.servico;
    return s === 'Migração' || s === 'Troca de Plano';
  }, [servicoForm.servico]);

  const requerSimcard = useMemo(() => {
    const s = servicoForm.servico;
    return s === 'Alta' || s === 'Reativação' || s === 'Migração' || s === 'Troca de Simcard';
  }, [servicoForm.servico]);

  // Acessório: mesma consulta, sem plano (grupo SEM_PLANO)
  const precoAcessorio = usePrecoItem({
    estoqueId: acessorioSelecionado?.produtoId,
    habilitado: Boolean(acessorioSelecionado),
  });

  // Preço do aparelho na tabela vigente (sempre Regular): precisa do aparelho e do plano (ou "Sem plano")
  const precoProduto = usePrecoItem({
    estoqueId: aparelhoSelecionado?.produtoId,
    plano: planoParaConsulta(formProdutoVivo.planoAtivo),
    habilitado: Boolean(aparelhoSelecionado && formProdutoVivo.planoAtivo),
  });

  // Sugestões — buscam na API com debounce de 300 ms
  useEffect(() => {
    const termo = buscaCliente.trim();
    if (cliente || termo.length < 2) { setClientesSugeridos([]); return undefined; }
    let ativo = true;
    const t = setTimeout(() => {
      api.buscarClientes(termo).then((r) => ativo && setClientesSugeridos(r)).catch(() => ativo && setClientesSugeridos([]));
    }, 300);
    return () => { ativo = false; clearTimeout(t); };
  }, [buscaCliente, cliente]);

  useEffect(() => {
    const termo = buscaSerialProduto.trim();
    if (aparelhoSelecionado || termo.length < 2) { setAparelhosSugeridos([]); return undefined; }
    let ativo = true;
    const t = setTimeout(() => {
      api.buscarAparelhos(termo).then((r) => ativo && setAparelhosSugeridos(r)).catch(() => ativo && setAparelhosSugeridos([]));
    }, 300);
    return () => { ativo = false; clearTimeout(t); };
  }, [buscaSerialProduto, aparelhoSelecionado]);

  useEffect(() => {
    const termo = buscaAcessorio.trim();
    if (acessorioSelecionado || termo.length < 2) { setAcessoriosSugeridos([]); return undefined; }
    let ativo = true;
    const t = setTimeout(() => {
      api.buscarAcessorios(termo).then((r) => ativo && setAcessoriosSugeridos(r)).catch(() => ativo && setAcessoriosSugeridos([]));
    }, 300);
    return () => { ativo = false; clearTimeout(t); };
  }, [buscaAcessorio, acessorioSelecionado]);

  const handleConfirmarSerialServico = () => {
    if (!servicoForm.simcard4g.trim()) {
      alert('Informe o número do Simcard/Serial antes de confirmar.');
      return;
    }
    setServicoForm((prev) => ({ ...prev, serialConfirmado: true }));
  };

  // =========================================================================
  // INTEGRAÇÃO COM A API
  // =========================================================================
  const num = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Math.round(Number(v) * 100) / 100);
  const sim = (v) => v === true || v === 'Sim';
  const credenciais = () => ({ email: emailLogin.trim(), senha });

  const executar = async (fn) => {
    setErro('');
    setCarregando(true);
    try {
      return await fn();
    } catch (e) {
      setErro(e.mensagem || e.message || 'Falha ao comunicar com o servidor.');
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const aplicarVenda = (v) => {
    const tela = api.vendaParaTela(v);
    setVendaId(v.id);
    setNumeroVenda(tela.numero);
    setStatus(v.status);
    setItensPorCategoria(tela.itensPorCategoria);
    setPagamentos(tela.pagamentos);
    setValorTotalVenda(tela.valorTotal);
    setSaldoVenda(tela.saldo);
    setAvisoVenda(tela.aviso || '');
    setRenovaAtivo(tela.renova);
    setDescontoFabricante(tela.descontoFabricante);
    setPagtoVenda({
      condicaoPagamento: tela.condicaoPagamento,
      parcelasCondicao: tela.parcelasCondicao,
      valorParcela: tela.valorParcela,
      valorItens: tela.valorItens,
      ajusteCondicao: tela.ajusteCondicao
    });
    if (api.ehParcelado(tela.condicaoPagamento)) setParcelasParcelado(tela.parcelasCondicao);
  };

  const carregarVendaExistente = (v) => {
    aplicarVenda(v);
    setCliente({ id: v.clienteId, nome: v.clienteNome, doc: '—' });
    setBuscaCliente(v.clienteNome);
    setPdvId(String(v.filialId));
    inicioSalvoRef.current = { clienteId: v.clienteId, filialId: v.filialId };
  };

  const resetarTela = () => {
    setVendaId(null);
    setValorTotalVenda(null);
    setSaldoVenda(null);
    setAvisoVenda('');
    setRenovaAtivo(false);
    setDescontoFabricante(null);
    setRenovaBloqueio('');
    setPagtoVenda(PAGTO_VENDA_VAZIO);
    setParcelasParcelado(api.PARCELAS_FINANCIADAS[0]);
    setIncompativeis([]);
    setNumeroVenda('');
    setStatus('ABERTA');
    setCliente(null);
    setBuscaCliente('');
    setPagamentos([]);
    setItensPorCategoria({ PRODUTO_VIVO: [], SERVICO_VIVO: [], ACESSORIO: [], RECARGA: [] });
    setSenha('');
    setAbaAtiva('INICIO');
    inicioSalvoRef.current = { clienteId: null, filialId: null };
  };

  const handleSelecionarVendedor = (id) => {
    setVendedorId(id);
    const v = vendedores.find((x) => String(x.id) === String(id));
    setEmailLogin(v?.email || '');
  };

  /** Abre o carrinho no backend na primeira ação (ou sincroniza cliente/PDV se mudaram). Devolve o id da venda. */
  const garantirVenda = async () => {
    if (!pdvId) throw new Error('Selecione o PDV na aba Início.');
    if (!cliente?.id) throw new Error('Selecione um cliente cadastrado na aba Início.');
    if (!emailLogin.trim() || !senha) throw new Error('Informe o e-mail e a senha do vendedor na aba Início.');

    const filialId = Number(pdvId);
    if (!vendaId) {
      const v = await api.abrirVenda({
        clienteId: cliente.id,
        filialId,
        estoqueAvancado: false,
        autenticacaoVendedor: credenciais(),
      });
      inicioSalvoRef.current = { clienteId: cliente.id, filialId };
      aplicarVenda(v);
      return v.id;
    }

    const salvo = inicioSalvoRef.current;
    if (salvo.clienteId !== cliente.id || salvo.filialId !== filialId) {
      const v = await api.atualizarInicio(vendaId, {
        clienteId: cliente.id,
        filialId,
        estoqueAvancado: false,
        autenticacaoUsuario: credenciais(),
      });
      inicioSalvoRef.current = { clienteId: cliente.id, filialId };
      aplicarVenda(v);
    }
    return vendaId;
  };

  /** Adiciona o item e devolve o item gravado pelo backend (com o valor que ele calculou). */
  const enviarItem = async (corpo) => {
    const id = await garantirVenda();
    const antes = new Set(Object.values(itensPorCategoria).flat().map((i) => i.id));
    const v = await api.adicionarItem(id, corpo);
    aplicarVenda(v);
    return (v.itens || []).find((i) => !antes.has(i.id)) || null;
  };

  const avisarItemGravado = (item, rotulo) => {
    if (!item) return;
    const extra = [item.tabelaAplicada && api.rotuloTabela(item.tabelaAplicada), item.grupoPlano && api.rotuloGrupo(item.grupoPlano)]
      .filter(Boolean).join(' · ');
    setMensagemSucesso(`${rotulo} adicionado: ${api.formatarMoeda(item.valorUnitario)}${extra ? ` (${extra})` : ''}.`);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const formServicoVazio = () => ({
    servico: '', ddd: '', tipoPlano: '', planoAntigo: '', planoNovo: '', numeroLinha: '', sistemaOrigem: '',
    vencimentoFatura: '', valorMensalidade: '', simcard3g: '', simcard4g: '', clientePossuiSimcard: false,
    simcardDoado: false, descontoChip: '', cobrarChip: false, serialConfirmado: false
  });

  const formProdutoVazio = () => ({
    sva: 'Nao', seguro: 'Nao', segmento: '', servico: '', ddd: '',
    planoAtivo: '', debitoAutomatico: false, valor: 0, valorAdicional: '', valorAcrescimo: 0.00, desconto: '',
    cupom: false, vencimentoFatura: '', numeroLinha: '', sistemaOrigem: '', numOrdemNext: '', numSolicitacaoGed: ''
  });

  const handleAdicionarServicoVivo = (e) => {
    e.preventDefault();
    if (!servicoForm.servico || !servicoForm.numeroLinha) {
      alert('Por favor, selecione o Serviço e informe o Número da linha.');
      return;
    }
    if (requerPlanoAntigo && !servicoForm.planoAntigo) {
      alert('Para Migração ou Troca de Plano, selecione o Plano Antigo.');
      return;
    }
    if (requerSimcard && !servicoForm.clientePossuiSimcard && !servicoForm.simcard4g) {
      alert('Informe o Serial do Simcard ou selecione "Cliente já possui simcard".');
      return;
    }

    let descricaoCompleta = `${servicoForm.servico}: ${rotuloPlano(servicoForm.planoNovo) || 'Plano Padrão'}`;
    if (requerPlanoAntigo) {
      descricaoCompleta = `${servicoForm.servico}: [${rotuloPlano(servicoForm.planoAntigo)}] ➔ [${rotuloPlano(servicoForm.planoNovo) || 'Plano Novo'}]`;
    }

    executar(async () => {
      const gravado = await enviarItem({
        categoria: 'SERVICO_VIVO',
        produtoId: null,
        descricaoProduto: descricaoCompleta,
        quantidade: 1,
        valorUnitario: 0,                       // plano é cobrado na fatura da operadora
        tipoServico: servicoForm.servico,
        ddd: servicoForm.ddd || null,
        numeroAcesso: servicoForm.numeroLinha,
        planoAntigo: planoParaVenda(servicoForm.planoAntigo),
        plano: planoParaVenda(servicoForm.planoNovo),
        valorAdicional: num(String(servicoForm.valorMensalidade).replace(/\./g, '').replace(',', '.')),   // mensalidade informada na fatura
        vencimentoFatura: servicoForm.vencimentoFatura || null,
        sistemaOrigem: servicoForm.sistemaOrigem || null,
        simcard3g: servicoForm.simcard3g || null,
        simcard4g: servicoForm.simcard4g || null,
        clientePossuiSimcard: !!servicoForm.clientePossuiSimcard,
        simcardDoado: !!servicoForm.simcardDoado,
        descontoChip: num(servicoForm.descontoChip),
        // Chip: preço fixo configurado no backend; qualquer valor não nulo só sinaliza que o chip é cobrado
        valorChip: servicoForm.cobrarChip && !servicoForm.clientePossuiSimcard ? 0 : null,
        serialConfirmado: !!servicoForm.serialConfirmado
      });
      if (gravado?.valorChip != null) {
        setMensagemSucesso(`Serviço adicionado. Chip: ${api.formatarMoeda(gravado.valorChip)}.`);
        setTimeout(() => setMensagemSucesso(''), 5000);
      }
      setServicoForm(formServicoVazio());
    });
  };

   const handleSelecionarAparelho = (ap) => {
    setAparelhoSelecionado(ap);
    setBuscaSerialProduto(ap.imei);
  };

  const handleSalvarProdutoVivo = () => {
    if (!aparelhoSelecionado) {
      alert('Por favor, informe ou selecione o Serial/IMEI do aparelho.');
      return;
    }
    if (!formProdutoVivo.servico) {
      alert('Selecione o serviço do aparelho.');
      return;
    }
    if (!formProdutoVivo.planoAtivo) {
      alert('Selecione o plano ativo ou contratado do cliente (ou "Sem plano / Pré-pago").');
      return;
    }
    if (precoProduto.status !== 'ok') return; // sem preço na tabela vigente: botão já fica desabilitado
    const f = formProdutoVivo;

    executar(async () => {
      const gravado = await enviarItem({
        categoria: 'PRODUTO_VIVO',
        produtoId: aparelhoSelecionado.produtoId,
        descricaoProduto: aparelhoSelecionado.nome,
        quantidade: 1,
        valorUnitario: precoProduto.preco.preco, // informativo: o backend recalcula pela tabela vigente
        imeiOuSerial: aparelhoSelecionado.imei,
        sva: sim(f.sva),
        seguro: sim(f.seguro),
        segmento: f.segmento || null,
        tipoServico: f.servico || null,
        ddd: f.ddd || null,
        plano: planoParaVenda(f.planoAtivo),
        debitoAutomatico: !!f.debitoAutomatico,
        valorAdicional: num(f.valorAdicional),
        valorAcrescimo: num(f.valorAcrescimo),
        desconto: num(f.desconto),
        cupom: !!f.cupom,
        vencimentoFatura: f.vencimentoFatura || null,
        numeroAcesso: f.numeroLinha || null,
        sistemaOrigem: f.sistemaOrigem || null,
        numOrdemNext: f.numOrdemNext || null,
        numSolicitacaoGed: f.numSolicitacaoGed || null
      });
      avisarItemGravado(gravado, 'Aparelho');
      setModalProdutoAberto(false);
      setAparelhoSelecionado(null);
      setBuscaSerialProduto('');
      setFormProdutoVivo(formProdutoVazio());
    });
  };

  const handleAdicionarAcessorio = (e) => {
    e.preventDefault();
    if (!acessorioSelecionado) {
      alert('Selecione um acessório da lista de busca.');
      return;
    }
    if (precoAcessorio.status !== 'ok') return;
    executar(async () => {
      const gravado = await enviarItem({
        categoria: 'ACESSORIO',
        produtoId: acessorioSelecionado.produtoId,
        descricaoProduto: acessorioSelecionado.nome,
        quantidade: Number(qtdAcessorio) || 1,
        valorUnitario: precoAcessorio.preco.preco // informativo: o backend recalcula pela tabela vigente
      });
      avisarItemGravado(gravado, 'Acessório');
      setBuscaAcessorio('');
      setAcessorioSelecionado(null);
      setQtdAcessorio(1);
    });
  };

  const handleRemoverItem = (categoria, itemId) => {
    if (!vendaId) return;
    executar(async () => aplicarVenda(await api.removerItem(vendaId, itemId)));
  };

  const handleAdicionarPagamento = (e) => {
    e.preventDefault();
    const v = parseFloat(String(pgtoForm.valor).replace(',', '.'));
    if (!pgtoForm.forma) {
      alert('Selecione a forma de pagamento.');
      return;
    }
    const credito = pgtoForm.forma === 'Cartão de Crédito';
    const voucher = pgtoForm.forma === 'Voucher';
    if (voucher && !pgtoForm.codigoVoucher.trim()) {
      alert('Informe o código do voucher.');
      return;
    }
    executar(async () => {
      const id = await garantirVenda();
      aplicarVenda(await api.adicionarPagamento(id, {
        forma: api.FORMA_ENUM[pgtoForm.forma],
        valor: Math.round(v * 100) / 100,
        parcelas: credito ? parseInt(pgtoForm.parcelas, 10) || 1 : 1,
        codigoVoucher: voucher ? pgtoForm.codigoVoucher.trim() : null
      }));
      setPgtoForm((prev) => ({ ...prev, valor: '', codigoVoucher: '' }));
    });
  };

  /** Liga/desliga o Renova no backend; a venda volta reprecificada (nada é calculado no front). */
  const handleAplicarRenova = async (ativo) => {
    if (!vendaId) return;
    setErro('');
    setRenovaBloqueio('');
    setCarregando(true);
    try {
      aplicarVenda(await api.aplicarRenova(vendaId, ativo));
    } catch (e) {
      const msg = e.mensagem || e.message || 'Falha ao aplicar o Renova.';
      if (e.status === 422) setRenovaBloqueio(msg); // ex.: "Renova não disponível para plano pré-pago."
      else setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  /** Troca a condição no backend; 422 traz os pagamentos que a condição não aceita. */
  const handleEscolherCondicao = async (condicao) => {
    setErro('');
    setIncompativeis([]);
    setCarregando(true);
    try {
      aplicarVenda(await api.alterarCondicao(vendaId, condicao));
    } catch (e) {
      const lista = e.corpo?.pagamentosIncompativeis;
      if (e.status === 422 && lista?.length) setIncompativeis(lista.map(api.pagamentoParaTela));
      else setErro(e.mensagem || e.message || 'Falha ao alterar a condição de pagamento.');
    } finally {
      setCarregando(false);
    }
  };

  /** Fora do parcelado, o seletor só mostra os valores; dentro dele, já troca o número de parcelas. */
  const handleParcelasParcelado = (n) => {
    setParcelasParcelado(n);
    if (api.ehParcelado(condicaoVenda)) handleEscolherCondicao(api.condicaoParcelada(n));
  };

  const handleFinanciarSaldo = () => {
    executar(async () => aplicarVenda(await api.financiarSaldo(vendaId)));
  };

  const handleRemoverPagamento = (id) => {
    if (!vendaId) return;
    executar(async () => aplicarVenda(await api.removerPagamento(vendaId, id)));
  };

  const handleFinalizarVenda = () => {
    if (totalItensCarrinho === 0) {
      alert('Adicione pelo menos um item ao carrinho antes de finalizar a venda.');
      return;
    }
    if (avisoVenda) {
      alert(avisoVenda);
      setAbaAtiva('PAGAMENTO');
      return;
    }
    executar(async () => {
      const id = await garantirVenda();
      const v = await api.finalizar(id, credenciais());
      const numero = String(v.numeroVenda).padStart(6, '0');
      resetarTela();
      setMensagemSucesso(`Venda #${numero} finalizada e enviada para aprovação (status ${v.status}).`);
      setTimeout(() => setMensagemSucesso(''), 6000);
    });
  };

  /** Aprovar / Concluir / Cancelar (cancelar devolve os IMEIs ao estoque). */
  const handleMudarStatus = (novoStatus) => {
    if (!vendaId) return;
    if (!emailLogin.trim() || !senha) {
      setErro('Informe o e-mail e a senha do vendedor na aba Início para alterar o status.');
      setAbaAtiva('INICIO');
      return;
    }
    if (novoStatus === 'CANCELADA' && !window.confirm('Cancelar esta venda? Os IMEIs/seriais voltam ao estoque.')) return;
    executar(async () => {
      const v = await api.mudarStatus(vendaId, novoStatus, credenciais());
      const numero = String(v.numeroVenda).padStart(6, '0');
      if (novoStatus === 'CANCELADA') resetarTela();
      else aplicarVenda(v);
      setMensagemSucesso(`Venda #${numero}: status alterado para ${v.status}.`);
      setTimeout(() => setMensagemSucesso(''), 5000);
    });
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 1400, 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 16,
      color: 'var(--text)'
    }}>
      {mensagemSucesso && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid var(--good, #22c55e)',
          color: 'var(--good, #22c55e)',
          padding: '12px 18px',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 600
        }}>
          <CheckCircle size={18} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div role="alert" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--bad, #ef4444)',
          color: 'var(--bad, #ef4444)', padding: '12px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600
        }}>
          <span>{erro}</span>
          <button type="button" onClick={() => setErro('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {avisoVenda && (
        <div role="status" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(245, 158, 11, 0.12)', border: '1px solid var(--warn, #f59e0b)',
          color: 'var(--warn, #f59e0b)', padding: '12px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600
        }}>
          <span>{avisoVenda}</span>
        </div>
      )}

      {vendaId && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {status === 'PENDENTE' && (
            <button type="button" className="btn solid" disabled={carregando} onClick={() => handleMudarStatus('APROVADA')}>Aprovar</button>
          )}
          {status === 'APROVADA' && (
            <button type="button" className="btn solid" disabled={carregando} onClick={() => handleMudarStatus('CONCLUIDA')}>Concluir</button>
          )}
          {status !== 'CANCELADA' && (
            <button type="button" className="btn ghost" disabled={carregando} onClick={() => handleMudarStatus('CANCELADA')}>Cancelar venda</button>
          )}
        </div>
      )}

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pencil size={20} color="var(--accent, #c026d3)" />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, textTransform: 'uppercase', color: 'var(--text)' }}>
            Lançar Venda <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-faint)' }}></span>
          </h1>
        </div>
        <span className="badge neutral" style={{
          background: 'var(--panel-2)',
          border: '1px solid var(--line)',
          color: 'var(--text-dim)',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700
        }}>
          {status === 'ABERTA' ? 'ABERTA' : status}
        </span>
      </div>

      <div className="panel" style={{ 
        padding: 0, 
        overflow: 'visible', 
        width: '100%',
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 12
      }}>
        {/* Barra de Abas */}
        <div className="tabs" style={{ 
          padding: '8px 16px 0', 
          position: 'relative',
          display: 'flex',
          gap: 6,
          borderBottom: '1px solid var(--line)'
        }}>
          <button
            type="button"
            className={`tab ${abaAtiva === 'INICIO' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('INICIO')}
            style={getTabStyle(abaAtiva === 'INICIO')}
          >
            Início
          </button>

          {CATEGORIAS_ITENS.map((cat) => {
            const count = contagemPorCategoria[cat.id] || 0;
            const ativa = abaAtiva === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`tab ${ativa ? 'active' : ''}`}
                onClick={() => setAbaAtiva(cat.id)}
                style={getTabStyle(ativa)}
              >
                {cat.rotulo} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ padding: 28, width: '100%', boxSizing: 'border-box' }}>
          {/* ================= 1. INÍCIO ================= */}
          {abaAtiva === 'INICIO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <div className="field" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>PDV:</label>
                <select 
               value={pdvId} 
               onChange={(e) => setPdvId(e.target.value)} 
               style={{ width: '100%', maxWidth: 760 }}
                 >
             <option value="">Escolha ...</option>
              {filiais.map((p) => {
             const textoBruto = p.nome || p.descricao || p.razaoSocial || '';
             const textoLimpo = textoBruto.replace(/abadas/gi, '').trim();
              return (
               <option key={p.id} value={p.id}>
                 {textoLimpo}
              </option>
                );
                })}
                </select>
              </div>

              <div className="field" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Vendedor:</label>
                <select 
                  value={vendedorId} 
                  onChange={(e) => handleSelecionarVendedor(e.target.value)} 
                  style={{ ...inputStyleGlobal, width: '100%', maxWidth: 760 }}
                >
                  <option value="">Escolha...</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'start', gap: 16, margin: 0 }}>
                <label style={{ marginTop: 10, fontWeight: 600, color: 'var(--text)' }}>Cliente:</label>
                <div style={{ position: 'relative', width: '100%', maxWidth: 760 }}>
                  <input
                    type="text"
                    style={{ ...inputStyleGlobal, width: '100%' }}
                    placeholder="Buscar por Nome ou CPF/CNPJ..."
                    value={cliente ? `${cliente.nome} - ${cliente.doc || cliente.documento || cliente.cpf || cliente.cnpj}` : buscaCliente}
                    onChange={(e) => {
                      setCliente(null);
                      setBuscaCliente(e.target.value);
                    }}
                  />
                  <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 4 }}>
                    Nome e CPF/CNPJ do cliente.
                  </small>

                  {!cliente && clientesSugeridos.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% - 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        background: 'var(--panel)',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        maxHeight: 220,
                        overflowY: 'auto'
                      }}
                    >
                      {clientesSugeridos.map((c) => {
                        const documento = c.doc || c.documento || c.cpf || c.cnpj || '—';
                        return (
                          <div
                            key={c.id || documento}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--line-soft)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setCliente(c);
                              setBuscaCliente(`${c.nome} - ${documento}`);
                            }}
                          >
                            <b style={{ color: 'var(--text)', fontSize: 13.5 }}>{c.nome}</b>
                            <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                              CPF/CNPJ: {documento}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <fieldset style={{ 
                borderRadius: 8, 
                padding: '18px 24px', 
                marginTop: 12, 
                border: '1px solid var(--line)', 
                background: 'var(--panel-2)',
                width: '100%', 
                maxWidth: 760, 
                boxSizing: 'border-box' 
              }}>
                <legend style={{ padding: '0 8px', color: 'var(--accent, #c026d3)', fontSize: 13, fontWeight: 700 }}>
                  Autenticação do vendedor:
                </legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: 14, margin: 0 }}>
                    <label style={{ margin: 0, color: 'var(--text)' }}>E-mail / Login:</label>
                    <input
                      type="text"
                      placeholder="email@dominio.com"
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                      style={inputStyleGlobal}
                    />
                  </div>
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: 14, margin: 0 }}>
                    <label style={{ margin: 0, color: 'var(--text)' }}>Senha:</label>
                    <input
                      type="password"
                      placeholder="Senha do vendedor..."
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      style={inputStyleGlobal}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* ================= 2. PRODUTO VIVO ================= */}
          {abaAtiva === 'PRODUTO_VIVO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setModalProdutoAberto(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                    background: 'var(--panel-2)',
                    color: 'var(--text)',
                    border: '1px solid var(--line)',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} color="var(--accent)" /> Adicionar produto Vivo
                </button>
              </div>

              {modalProdutoAberto && (
                <div style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: 24,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20
                }}>
                  <button
                    type="button"
                    onClick={() => setModalProdutoAberto(false)}
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={20} />
                  </button>

                  {/* 1. Aparelho/Serviços */}
                  <fieldset style={{ 
                    border: '1px solid var(--line)', 
                    borderRadius: 8, 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 14 
                  }}>
                    <legend style={{ padding: '0 8px', color: 'var(--accent, #a855f7)', fontSize: 13, fontWeight: 700 }}>
                      Aparelho/Serviços
                    </legend>

                    {/* Serial */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Serial:</label>
                      <div style={{ position: 'relative', width: '100%', maxWidth: 540 }}>
                        <input
                          type="text"
                          placeholder="Digite ou bipe o IMEI/Serial..."
                          value={buscaSerialProduto}
                          onChange={(e) => {
                            setBuscaSerialProduto(e.target.value);
                            setAparelhoSelecionado(null);
                          }}
                          style={{ ...inputStyleGlobal, width: '100%' }}
                        />
                        {aparelhosSugeridos.length > 0 && !aparelhoSelecionado && (
                          <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 2px)',
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            background: 'var(--panel)',
                            border: '1px solid var(--line)',
                            borderRadius: 6,
                            maxHeight: 180,
                            overflowY: 'auto',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                          }}>
                            {aparelhosSugeridos.map((ap) => (
                              <div
                                key={ap.imei}
                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line-soft)' }}
                                onMouseDown={() => handleSelecionarAparelho(ap)}
                              >
                                <b style={{ color: 'var(--text)', fontSize: 13 }}>{ap.nome}</b>
                                <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>IMEI: {ap.imei}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {aparelhoSelecionado && (
                          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-dim)' }}>
                            <b>Modelo: </b><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{aparelhoSelecionado.nome}</span>
                            {' — '}<b>Cor: </b><span>{aparelhoSelecionado.cor || 'Padrão'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SVA */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>SVA:</label>
                      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0, color: 'var(--text)' }}>
                          <input
                            type="radio"
                            name="sva"
                            checked={formProdutoVivo.sva === 'Nao'}
                            onChange={() => setFormProdutoVivo((p) => ({ ...p, sva: 'Nao' }))}
                          /> Não
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0, color: 'var(--text)' }}>
                          <input
                            type="radio"
                            name="sva"
                            checked={formProdutoVivo.sva === 'Sim'}
                            onChange={() => setFormProdutoVivo((p) => ({ ...p, sva: 'Sim' }))}
                          /> Sim
                        </label>
                      </div>
                    </div>

                    {/* Seguro */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Seguro:</label>
                      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0, color: 'var(--text)' }}>
                          <input
                            type="radio"
                            name="seguro"
                            checked={formProdutoVivo.seguro === 'Nao'}
                            onChange={() => setFormProdutoVivo((p) => ({ ...p, seguro: 'Nao' }))}
                          /> Não
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0, color: 'var(--text)' }}>
                          <input
                            type="radio"
                            name="seguro"
                            checked={formProdutoVivo.seguro === 'Sim'}
                            onChange={() => setFormProdutoVivo((p) => ({ ...p, seguro: 'Sim' }))}
                          /> Sim
                        </label>
                      </div>
                    </div>

                    {/* Serviço */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Serviço:</label>
                      <div style={{ display: 'flex', gap: 8, maxWidth: 540 }}>
                        <select
                          value={formProdutoVivo.segmento}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, segmento: e.target.value }))}
                          style={{ ...inputStyleGlobal, width: 140 }}
                        >
                          <option value="">Segmento...</option>
                          <option value="Pré">Pré</option>
                          <option value="Controle">Controle</option>
                          <option value="Pós">Pós</option>
                        </select>
                        <select
                          value={formProdutoVivo.servico}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, servico: e.target.value }))}
                          style={{ ...inputStyleGlobal, flex: 1 }}
                        >
                          <option value="">Escolha o serviço...</option>
                          <option value="Troca de Aparelho">Troca de Aparelho</option>
                          <option value="Aparelho Avulso / Pré">Aparelho Avulso / Pré</option>
                          <option value="Vinculado a Linha Contratada (Serviço)">Vinculado a Linha Contratada (Serviço)</option>
                        </select>
                      </div>
                    </div>

                    {/* Plano Ativo / Linha */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Plano Ativo / Linha:</label>
                      <div style={{ display: 'flex', gap: 8, maxWidth: 540 }}>
                        <select
                          value={formProdutoVivo.ddd}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, ddd: e.target.value }))}
                          style={{ ...inputStyleGlobal, width: 85 }}
                        >
                          <option value="">DDD</option>
                          {LISTA_DDDS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <ComboPlano
                          value={formProdutoVivo.planoAtivo}
                          onChange={(valor, plano) => setFormProdutoVivo((p) => ({
                            ...p,
                            planoAtivo: valor,
                            planoGrupo: valor === SEM_PLANO ? 'PRE' : plano?.grupoPlano || ''
                          }))}
                          placeholder="Selecione o plano já ativo / contratado..."
                        />
                      </div>
                    </div>

                    {/* Débito automático */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <div />
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text)', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={formProdutoVivo.debitoAutomatico}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, debitoAutomatico: e.target.checked }))}
                        />
                        <span>Débito automático</span>
                      </label>
                    </div>
                  </fieldset>

                  {/* 2. Valores */}
                  <fieldset style={{ 
                    border: '1px solid var(--line)', 
                    borderRadius: 8, 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 14 
                  }}>
                    <legend style={{ padding: '0 8px', color: 'var(--accent, #a855f7)', fontSize: 13, fontWeight: 700 }}>
                      Valores
                    </legend>

                    {/* Tabela (sempre Regular) e grupo do plano — só leitura */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Tabela:</label>
                      <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 13, color: 'var(--text)', flexWrap: 'wrap' }}>
                        {renovaAtivo ? (
                          <span>
                            <SeloTabela tabela="RENOVA" />
                            <span style={{ color: 'var(--text-faint)', marginLeft: 6 }}>
                              Venda com Renova: o aparelho entra pela Renova ao salvar (valores abaixo são da Regular; o final aparece no carrinho).
                            </span>
                          </span>
                        ) : (
                          <b>Tabela Regular</b>
                        )}
                        <span>
                          <span style={{ color: 'var(--text-dim)' }}>Grupo do plano: </span>
                          <b>{api.rotuloGrupo(precoProduto.status === 'ok' ? precoProduto.preco.grupoPlano : formProdutoVivo.planoGrupo)}</b>
                        </span>
                      </div>
                    </div>

                    {/* Valor (tabela vigente, não editável) */}
                    <PainelPreco
                      estado={precoProduto}
                      vazio={!aparelhoSelecionado ? 'Selecione o aparelho' : 'Selecione o plano para consultar o preço'}
                    />

                    {/* Valor Adicional */}
                      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Valor Adicional:</label>
                        <input
                          type="text"
                          placeholder="0,00"
                          value={formProdutoVivo.valorAdicional}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, valorAdicional: e.target.value }))}
                          style={{ ...inputStyleGlobal, width: 140 }}
                        />
                      </div>

                    {/* Valor Acréscimo */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Valor Acréscimo:</label>
                      <span className="mono" style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
                        {formatadorMoeda.format(formProdutoVivo.valorAcrescimo)}
                      </span>
                    </div>

                    {/* Outros */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Outros:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Desconto:</span>
                        <input
                          type="text"
                          placeholder="0,00"
                          value={formProdutoVivo.desconto}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, desconto: e.target.value }))}
                          style={{ ...inputStyleGlobal, width: 100 }}
                        />
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text)', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={formProdutoVivo.cupom}
                            onChange={(e) => setFormProdutoVivo((p) => ({ ...p, cupom: e.target.checked }))}
                          /> Cupom
                        </label>
                      </div>
                    </div>

                    {/* Vencimento */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Vencimento da fatura:</label>
                      <select
                        value={formProdutoVivo.vencimentoFatura}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, vencimentoFatura: e.target.value }))}
                        style={{ ...inputStyleGlobal, width: 300 }}
                      >
                        <option value="">Escolha o dia do vencimento da fatura</option>
                        {DIAS_VENCIMENTO.map((dia) => (
                          <option key={dia} value={dia}>Dia {dia}</option>
                        ))}
                      </select>
                    </div>
                  </fieldset>

                  {/* 3. Linha */}
                  <fieldset style={{ 
                    border: '1px solid var(--line)', 
                    borderRadius: 8, 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 14 
                  }}>
                    <legend style={{ padding: '0 8px', color: 'var(--accent, #a855f7)', fontSize: 13, fontWeight: 700 }}>
                      Linha
                    </legend>

                    {/* Número da Linha */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Número da linha:</label>
                      <input
                        type="text"
                        placeholder="Ex: 89 98114-3161"
                        value={formProdutoVivo.numeroLinha}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, numeroLinha: e.target.value }))}
                        style={{ ...inputStyleGlobal, width: 240 }}
                      />
                    </div>

                    {/* Sistema de Origem */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Sistema de Origem:</label>
                      <select
                        value={formProdutoVivo.sistemaOrigem}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, sistemaOrigem: e.target.value }))}
                        style={{ ...inputStyleGlobal, width: 240 }}
                      >
                        <option value="">Escolha o sistema...</option>
                        {OPCOES_SISTEMA_ORIGEM.map((sis) => (
                          <option key={sis} value={sis}>{sis}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nº da ordem NEXT */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Nº da ordem NEXT / RPON Fixa:</label>
                      <input
                        type="text"
                        value={formProdutoVivo.numOrdemNext}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, numOrdemNext: e.target.value }))}
                        placeholder="Digite o número da ordem..."
                        style={{ ...inputStyleGlobal, width: 240 }}
                      />
                    </div>

                    {/* Nº da solicitação GED */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Nº da solicitação do GED:</label>
                      <input
                        type="text"
                        value={formProdutoVivo.numSolicitacaoGed}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, numSolicitacaoGed: e.target.value }))}
                        placeholder="Digite o número da solicitação..."
                        style={{ ...inputStyleGlobal, width: 320 }}
                      />
                    </div>
                  </fieldset>

                  {/* Card de Ações */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    padding: '12px 18px',
                    alignSelf: 'flex-end',
                    gap: 10
                  }}>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => setModalProdutoAberto(false)}
                      style={{
                        background: 'transparent',
                        color: 'var(--text)',
                        border: '1px solid var(--line)',
                        padding: '6px 14px',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      className="btn solid"
                      onClick={handleSalvarProdutoVivo}
                      disabled={carregando || precoProduto.status !== 'ok'}
                      title={precoProduto.status === 'semPreco' ? precoProduto.mensagem : undefined}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--accent, #c026d3)',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 16px',
                        borderRadius: 6,
                        fontWeight: 700,
                        cursor: carregando || precoProduto.status !== 'ok' ? 'not-allowed' : 'pointer',
                        opacity: carregando || precoProduto.status !== 'ok' ? 0.5 : 1
                      }}
                    >
                      Salvar <Check size={16} />
                    </button>
                  </div>

                </div>
              )}

              {/* Tabela de Produtos Cadastrados */}
              <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--panel-2)', color: 'var(--text-faint)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '12px 16px' }}>Descrição do Aparelho</th>
                      <th style={{ padding: '12px 16px' }}>Serial / IMEI</th>
                      <th style={{ padding: '12px 16px' }}>Linha / Plano Ativo</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Qtd.</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensPorCategoria.PRODUTO_VIVO.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-faint)' }}>
                          Nenhum produto Vivo adicionado à venda.
                        </td>
                      </tr>
                    ) : (
                      itensPorCategoria.PRODUTO_VIVO.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}>
                          <td style={{ padding: '12px 16px' }}><b>{item.descricao}</b></td>
                          <td className="mono" style={{ padding: '12px 16px', color: 'var(--accent)' }}>{item.imeiOuSerial}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>
                            {item.numeroLinha || '—'} {item.detalhes?.planoAtivo ? `(${item.detalhes.planoAtivo})` : ''}
                            {(item.tabelaAplicada || item.grupoPlano) && (
                              <div style={{ fontSize: 11.5, marginTop: 4, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                <SeloTabela tabela={item.tabelaAplicada} />
                                {item.grupoPlano && <span>{api.rotuloGrupo(item.grupoPlano)}</span>}
                                {item.descontoFabricante ? (
                                  <span>· desc. fabricante {formatadorMoeda.format(item.descontoFabricante)}</span>
                                ) : null}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>{item.quantidade}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--good)' }} className="mono">
                            {formatadorMoeda.format(item.valorTotal)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoverItem('PRODUTO_VIVO', item.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================= 3. SERVIÇO VIVO ================= */}
          {abaAtiva === 'SERVICO_VIVO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <form onSubmit={handleAdicionarServicoVivo} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 840 }}>
                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Serviço:</label>
                  <select
                    value={servicoForm.servico}
                    onChange={(e) => setServicoForm((prev) => ({ 
                      ...prev, 
                      servico: e.target.value,
                      serialConfirmado: false
                    }))}
                    style={inputStyleGlobal}
                  >
                    <option value="">Escolha ...</option>
                    {OPCOES_SERVICO.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {requerPlanoAntigo && (
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                    <label style={{ margin: 0, color: 'var(--warn)', fontWeight: 600 }}>Plano Antigo / Atual:</label>
                    <ComboPlano
                      value={servicoForm.planoAntigo}
                      onChange={(valor) => setServicoForm((prev) => ({ ...prev, planoAntigo: valor }))}
                      placeholder="Selecione o plano de origem..."
                      destaque="var(--warn)"
                    />
                  </div>
                )}

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'start', gap: 16, margin: 0 }}>
                  <label style={{ marginTop: 10, fontWeight: 600, color: 'var(--text)' }}>{requerPlanoAntigo ? 'Plano Novo (Destino):' : 'Plano Contratado:'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select 
                        style={{ ...inputStyleGlobal, width: 90 }}
                        value={servicoForm.ddd}
                        onChange={(e) => setServicoForm((prev) => ({ ...prev, ddd: e.target.value }))}
                      >
                        <option value="">DDD</option>
                        {LISTA_DDDS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select
                        style={{ ...inputStyleGlobal, flex: 1 }}
                        value={servicoForm.tipoPlano}
                        onChange={(e) => setServicoForm((prev) => ({ ...prev, tipoPlano: e.target.value }))}
                      >
                        <option value="">Segmento...</option>
                        <option value="Pos">Pós Pago</option>
                        <option value="Controle">Controle</option>
                        <option value="Fibra">Fibra</option>
                      </select>
                    </div>

                    <ComboPlano
                      value={servicoForm.planoNovo}
                      onChange={(valor) => setServicoForm((prev) => ({ ...prev, planoNovo: valor }))}
                      placeholder="Escolha o plano novo..."
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>Mensalidade na fatura (R$):</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={servicoForm.valorMensalidade}
                        onChange={(e) => setServicoForm((prev) => ({ ...prev, valorMensalidade: e.target.value }))}
                        style={{ ...inputStyleGlobal, width: 110, textAlign: 'right' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Número da linha:</label>
                  <input
                    type="text"
                    style={{ ...inputStyleGlobal, maxWidth: 260 }}
                    placeholder="Ex: 99437-3977"
                    value={servicoForm.numeroLinha}
                    onChange={(e) => setServicoForm((prev) => ({ ...prev, numeroLinha: e.target.value }))}
                  />
                </div>

                {requerSimcard && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', background: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
                    {servicoForm.servico === 'Troca de Simcard' && (
                      <div className="field" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                        <label style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Simcard 3G (Antigo):</label>
                        <input
                          type="text"
                          style={{ ...inputStyleGlobal, maxWidth: 280 }}
                          placeholder="ICCID antigo..."
                          value={servicoForm.simcard3g}
                          onChange={(e) => setServicoForm((prev) => ({ ...prev, simcard3g: e.target.value }))}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginLeft: 176 }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0, fontSize: 13, color: 'var(--text)' }}>
                        <input
                          type="checkbox"
                          checked={servicoForm.clientePossuiSimcard}
                          onChange={(e) => setServicoForm((prev) => ({ 
                            ...prev, 
                            clientePossuiSimcard: e.target.checked,
                            serialConfirmado: false
                          }))}
                        />
                        <span>Cliente já possui simcard</span>
                        <HelpCircle size={15} color="#2dd4bf" style={{ verticalAlign: 'middle' }} />
                      </label>

                      {!servicoForm.clientePossuiSimcard && (
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0, fontSize: 13, color: 'var(--text)' }}>
                          <input
                            type="checkbox"
                            checked={servicoForm.simcardDoado}
                            onChange={(e) => setServicoForm((prev) => ({ ...prev, simcardDoado: e.target.checked }))}
                          />
                          <span>Simcard doado</span>
                        </label>
                      )}
                    </div>

                    {!servicoForm.clientePossuiSimcard && (
                      <>
                        <div className="field" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                          <label style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                            {servicoForm.servico === 'Troca de Simcard' ? 'Simcard 4G (Novo):' : 'Simcard / Serial:'}
                          </label>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="text"
                              style={{ ...inputStyleGlobal, maxWidth: 280 }}
                              placeholder="Digite ou bipe o ICCID..."
                              value={servicoForm.simcard4g}
                              onChange={(e) => setServicoForm((prev) => ({ ...prev, simcard4g: e.target.value, serialConfirmado: false }))}
                            />

                            <button
                              type="button"
                              onClick={handleConfirmarSerialServico}
                              className="btn sm"
                              style={{
                                background: servicoForm.serialConfirmado ? 'var(--good)' : 'var(--accent)',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                height: 36,
                                padding: '0 14px',
                                borderRadius: 6,
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {servicoForm.serialConfirmado ? <Check size={14} /> : null}
                              {servicoForm.serialConfirmado ? 'Confirmado' : 'Confirmar Serial'}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 176 }}>
                          <span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>Desconto:</span>
                          <input
                            type="text"
                            placeholder="0,00"
                            style={{ ...inputStyleGlobal, width: 80, height: 32, textAlign: 'right' }}
                            value={servicoForm.descontoChip}
                            onChange={(e) => setServicoForm((prev) => ({ ...prev, descontoChip: e.target.value }))}
                          />

                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0, fontSize: 12.5, color: 'var(--text)' }}>
                            <input
                              type="checkbox"
                              checked={servicoForm.cobrarChip}
                              onChange={(e) => setServicoForm((prev) => ({ ...prev, cobrarChip: e.target.checked }))}
                            />
                            <span>Cobrar chip</span>
                            <span style={{ color: 'var(--text-faint)' }}>(valor definido pelo sistema)</span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Sistema de Origem:</label>
                  <select
                    style={{ ...inputStyleGlobal, maxWidth: 260 }}
                    value={servicoForm.sistemaOrigem}
                    onChange={(e) => setServicoForm((prev) => ({ ...prev, sistemaOrigem: e.target.value }))}
                  >
                    <option value="">Escolha...</option>
                    {OPCOES_SISTEMA_ORIGEM.map((sis) => (
                      <option key={sis} value={sis}>{sis}</option>
                    ))}
                  </select>
                </div>

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Vencimento da fatura:</label>
                  <select
                    value={servicoForm.vencimentoFatura}
                    onChange={(e) => setServicoForm((prev) => ({ ...prev, vencimentoFatura: e.target.value }))}
                    style={{ ...inputStyleGlobal, maxWidth: 260 }}
                  >
                    <option value="">Escolha o dia...</option>
                    {DIAS_VENCIMENTO.map((dia) => (
                      <option key={dia} value={dia}>Dia {dia}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                  <button 
                    type="submit" 
                    className="btn solid" 
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: 13.5,
                      background: 'var(--accent, #c026d3)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Plus size={16} /> Adicionar Serviço ao Carrinho
                  </button>
                </div>
              </form>

              {itensPorCategoria.SERVICO_VIVO.length > 0 && (
                <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--panel-2)', color: 'var(--text-faint)', borderBottom: '1px solid var(--line)' }}>
                        <th style={{ padding: '12px 16px' }}>Serviço / Transição de Plano</th>
                        <th style={{ padding: '12px 16px' }}>Linha & Chip</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Qtd.</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Cobrança Balcão</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Mensalidade Fatura</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensPorCategoria.SERVICO_VIVO.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}>
                          <td style={{ padding: '12px 16px' }}><b>{item.descricao}</b></td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>{item.imeiOuSerial}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>{item.quantidade}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }} className="mono">
                            {item.valorChip != null ? (
                              <span title="Chip (preço fixo do backend)">
                                Chip {formatadorMoeda.format(item.valorChip)}
                                {item.descontoChip ? <span style={{ color: 'var(--text-faint)' }}> (−{formatadorMoeda.format(item.descontoChip)})</span> : null}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-faint)' }}>{formatadorMoeda.format(item.valorTotal || 0)}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }} className="mono">
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                              {formatadorMoeda.format(item.mensalidadeFatura)}/mês
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoverItem('SERVICO_VIVO', item.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--bad)', padding: 4, cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= 4. ACESSÓRIO ================= */}
          {abaAtiva === 'ACESSORIO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <form onSubmit={handleAdicionarAcessorio} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 840 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 6 }}>
                    Buscar Acessório (Capa, Película, Cabo, Fone):
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o nome ou SKU do acessório..."
                    value={acessorioSelecionado ? `${acessorioSelecionado.nome} — (${acessorioSelecionado.sku})` : buscaAcessorio}
                    onChange={(e) => {
                      setAcessorioSelecionado(null);
                      setBuscaAcessorio(e.target.value);
                    }}
                    style={inputStyleGlobal}
                  />
                  {!acessorioSelecionado && acessoriosSugeridos.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      zIndex: 9999,
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      maxHeight: 180,
                      overflowY: 'auto'
                    }}>
                      {acessoriosSugeridos.map((ac) => (
                        <div
                          key={ac.sku}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between' }}
                          onMouseDown={() => {
                            setAcessorioSelecionado(ac);
                            setBuscaAcessorio(`${ac.nome} — (${ac.sku})`);
                          }}
                        >
                          <div>
                            <b style={{ color: 'var(--text)', fontSize: 13 }}>{ac.nome}</b>
                            <div style={{ color: 'var(--text-faint)', fontSize: 11.5 }}>SKU: {ac.sku}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ width: 85 }}>
                  <label style={{ display: 'block', fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 6 }}>Qtd.</label>
                  <input
                    type="number"
                    min="1"
                    value={qtdAcessorio}
                    onChange={(e) => setQtdAcessorio(Math.max(1, Number(e.target.value)))}
                    style={inputStyleGlobal}
                  />
                </div>

                <button
                  type="submit"
                  className="btn solid"
                  disabled={carregando || !acessorioSelecionado || precoAcessorio.status !== 'ok'}
                  style={{
                    background: 'var(--accent, #c026d3)',
                    color: '#fff',
                    border: 'none',
                    height: 36,
                    padding: '0 18px',
                    borderRadius: 6,
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: carregando || !acessorioSelecionado || precoAcessorio.status !== 'ok' ? 0.5 : 1
                  }}
                >
                  Adicionar
                </button>
              </form>

              {acessorioSelecionado && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 840 }}>
                  <PainelPreco estado={precoAcessorio} vazio="Selecione o acessório" />
                </div>
              )}

              <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--panel-2)', color: 'var(--text-faint)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '12px 16px' }}>Descrição</th>
                      <th style={{ padding: '12px 16px' }}>SKU / Código</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Qtd.</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Vlr. Unit.</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensPorCategoria.ACESSORIO.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-faint)' }}>
                          Nenhum acessório adicionado à venda.
                        </td>
                      </tr>
                    ) : (
                      itensPorCategoria.ACESSORIO.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}>
                          <td style={{ padding: '12px 16px' }}><b>{item.descricao}</b></td>
                          <td className="mono" style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>{item.imeiOuSerial}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>{item.quantidade}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }} className="mono">{formatadorMoeda.format(item.valorUnitario)}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--good)' }} className="mono">
                            {formatadorMoeda.format(item.valorTotal)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoverItem('ACESSORIO', item.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 5. PAGAMENTO ================= */}
          {abaAtiva === 'PAGAMENTO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <section style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 840 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: 'var(--text)' }}>Como o cliente vai pagar?</h3>
                {!vendaId ? (
                  <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>
                    Adicione um item ao carrinho para ver as condições de pagamento.
                  </span>
                ) : (
                  <CartoesCondicao
                    simulacao={simulacao}
                    condicao={condicaoVenda}
                    parcelas={parcelasParcelado}
                    bloqueado={carregando || !vendaEditavel}
                    onEscolher={handleEscolherCondicao}
                    onParcelas={handleParcelasParcelado}
                  />
                )}
                {simulacaoErro && (
                  <span style={{ fontSize: 12.5, color: COR_SEM_PRECO, fontWeight: 600 }}>{simulacaoErro}</span>
                )}
                {incompativeisAtuais.length > 0 && (
                  <div role="alert" style={{ border: `1px solid ${COR_SEM_PRECO}`, borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <b style={{ color: 'var(--text)' }}>Remova estes pagamentos para trocar a condição:</b>
                    {incompativeisAtuais.map((p) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
                        <span>{p.forma}</span>
                        <span className="mono" style={{ fontWeight: 700 }}>{formatadorMoeda.format(p.valor)}</span>
                        <button
                          type="button"
                          className="btn"
                          disabled={carregando}
                          onClick={() => handleRemoverPagamento(p.id)}
                          style={{ marginLeft: 'auto', color: 'var(--bad)' }}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <form onSubmit={handleAdicionarPagamento} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 840 }}>
                {vendaParcelada && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 15, color: 'var(--text)' }}>Entrada</h3>
                    <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
                      Opcional. Os juros incidem só sobre o saldo financiado.
                    </span>
                  </div>
                )}

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Forma de pagamento:</label>
                  <select
                    value={pgtoForm.forma}
                    onChange={(e) => setPgtoForm((prev) => ({ ...prev, forma: e.target.value }))}
                    style={inputStyleGlobal}
                  >
                    <option value="">Escolha a forma de pagamento...</option>
                    {formasDisponiveis.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {pgtoForm.forma === 'Voucher' && (
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                    <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Código do voucher:</label>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="Digite o código do voucher..."
                      value={pgtoForm.codigoVoucher}
                      onChange={(e) => setPgtoForm((prev) => ({ ...prev, codigoVoucher: e.target.value }))}
                      style={{ ...inputStyleGlobal, maxWidth: 280 }}
                    />
                  </div>
                )}

                {pgtoForm.forma === 'Cartão de Crédito' && (
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                    <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Parcelamento:</label>
                    <select
                      value={pgtoForm.parcelas}
                      onChange={(e) => setPgtoForm((prev) => ({ ...prev, parcelas: e.target.value }))}
                      style={inputStyleGlobal}
                    >
                      {PARCELAS_CREDITO.map((p) => (
                        <option key={p} value={`${p}x`}>{p}x {p === 1 ? 'à vista' : 'sem juros'}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Valor:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="number"
                      step="0.01"
                      style={{ ...inputStyleGlobal, maxWidth: 220 }}
                      placeholder="0,00"
                      value={pgtoForm.valor}
                      onChange={(e) => setPgtoForm((prev) => ({ ...prev, valor: e.target.value }))}
                    />
                    <button
                      type="submit"
                      className="btn solid"
                      style={{
                        background: 'var(--good, #22c55e)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0 20px',
                        height: 36,
                        borderRadius: 6,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Inserir
                    </button>
                  </div>
                </div>
              </form>

              {vendaParcelada && (
                <div>
                  <button
                    type="button"
                    className="btn solid"
                    onClick={handleFinanciarSaldo}
                    disabled={carregando || !vendaEditavel || saldoRestante <= 0}
                    style={{ padding: '10px 18px', fontWeight: 700 }}
                  >
                    Financiar saldo em {pagtoVenda.parcelasCondicao}x no cartão
                  </button>
                </div>
              )}

              {/* Renova: Desconto fabricante (do backend) + Voucher (pagamento) */}
              <fieldset style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '14px 18px', maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <legend style={{ padding: '0 8px', color: 'var(--accent, #a855f7)', fontSize: 13, fontWeight: 700 }}>Renova</legend>

                <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Desconto fabricante:</label>
                  <div style={{ fontSize: 13 }}>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--text)' }}>
                      {renovaAtivo ? formatadorMoeda.format(descontoFabricante || 0) : '—'}
                    </span>
                    <span style={{ color: 'var(--text-faint)', marginLeft: 8 }}>
                      {renovaAtivo ? '(já embutido no preço Renova dos aparelhos)' : '(preenchido pelo sistema ao aplicar o Renova)'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16 }}>
                  <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Voucher:</label>
                  <span style={{ fontSize: 13, color: temVoucher ? 'var(--text)' : 'var(--text-faint)' }}>
                    {temVoucher
                      ? pagamentos.filter((p) => p.formaEnum === 'VOUCHER')
                        .map((p) => `${p.codigoVoucher || 's/ código'} (${formatadorMoeda.format(p.valor)})`).join(' · ')
                      : 'Lance o voucher acima, na forma de pagamento "Voucher".'}
                  </span>
                </div>

                {itensPorCategoria.PRODUTO_VIVO.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'start', gap: 16 }}>
                    <label style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Aparelhos:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                      {itensPorCategoria.PRODUTO_VIVO.map((item) => (
                        <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <SeloTabela tabela={item.tabelaAplicada} />
                          <span style={{ color: 'var(--text)' }}>{item.descricao}</span>
                          <span className="mono" style={{ color: 'var(--good)', fontWeight: 700 }}>{formatadorMoeda.format(item.valorTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'start', gap: 16 }}>
                  <div />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={renovaAtivo}
                        disabled={carregando || !vendaId || (!renovaAtivo && (!temVoucher || !temAparelhoRenova || Boolean(renovaBloqueio)))}
                        onChange={(e) => handleAplicarRenova(e.target.checked)}
                      />
                      <b>Aplicar Renova</b>
                    </label>
                    {renovaBloqueio ? (
                      <span style={{ fontSize: 12.5, color: COR_SEM_PRECO, fontWeight: 600 }}>{renovaBloqueio}</span>
                    ) : !renovaAtivo && !temAparelhoRenova ? (
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Adicione um aparelho com plano para usar o Renova.</span>
                    ) : !renovaAtivo && !temVoucher ? (
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Exige um pagamento por voucher.</span>
                    ) : renovaAtivo ? (
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Remover o voucher desliga o Renova e os aparelhos voltam para a Regular.</span>
                    ) : null}
                  </div>
                </div>
              </fieldset>

              <div className="table-wrap" style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--panel-2)', color: 'var(--text-faint)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ width: '60%', padding: '12px 16px' }}>Forma de pagamento</th>
                      <th style={{ textAlign: 'right', width: '30%', padding: '12px 16px' }}>Valor</th>
                      <th style={{ width: '10%', textAlign: 'center', padding: '12px 16px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-faint)' }}>
                          Nenhum pagamento inserido.
                        </td>
                      </tr>
                    ) : (
                      pagamentos.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--line)', color: 'var(--text)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <b>{item.forma}</b>
                            {item.tipo === 'ENTRADA' && (
                              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-faint)' }}>Entrada</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--good)', padding: '12px 16px' }} className="mono">
                            {formatadorMoeda.format(item.valor)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoverPagamento(item.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <ResumoPagamento
                pagto={pagtoVenda}
                total={totalAPagarCaixa}
                pago={totalPagoAteAgora}
                saldo={saldoBackend}
                renova={renovaAtivo}
                descontoFabricante={descontoFabricante}
              />
            </div>
          )}

        </div>
      </div>

      {/* Barra de Rodapé / Finalizar */}
      <div className="totais-card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        padding: '16px 24px',
        borderRadius: 8,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
          <div>
            <b style={{ color: 'var(--text)' }}>{totalItensCarrinho}</b> {totalItensCarrinho === 1 ? 'item' : 'itens'} no carrinho
          </div>
          {itensPorCategoria.SERVICO_VIVO.length > 0 && (
            <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 2 }}>
              ({itensPorCategoria.SERVICO_VIVO.length} plano(s) na fatura mensal da Vivo)
            </small>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block' }}>Total a pagar no caixa</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--good)' }}>
              {formatadorMoeda.format(totalAPagarCaixa)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFinalizarVenda}
            disabled={totalItensCarrinho === 0 || carregando || status !== 'ABERTA'}
            className="btn solid"
            style={{ 
              padding: '12px 26px', 
              fontSize: 14,
              background: 'var(--accent, #c026d3)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: totalItensCarrinho === 0 || carregando ? 'not-allowed' : 'pointer'
            }}
          >
            {carregando ? 'A gravar venda...' : 'Finalizar venda'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilo padronizado de campos que responde instantaneamente às variáveis CSS do tema
const inputStyleGlobal = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #475569)',
  color: 'var(--text, #f1eef7)',
  borderRadius: '6px',
  outline: 'none',
  padding: '8px 12px',
  fontSize: '13px',
  boxSizing: 'border-box',
  transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease'
};

const getTabStyle = (ativa) => ({
  background: ativa ? 'var(--panel-2)' : 'transparent',
  border: 'none',
  borderBottom: ativa ? '2px solid var(--accent, #c026d3)' : '2px solid transparent',
  color: ativa ? 'var(--accent, #c026d3)' : 'var(--text-faint)',
  padding: '10px 18px',
  fontSize: '13px',
  fontWeight: ativa ? 700 : 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease'
});