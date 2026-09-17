import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Pencil, Plus, Trash2, CheckCircle, HelpCircle, X, Check } from 'lucide-react';
import { PDVS, VENDEDORES, clientesDemo, imeiDemo, estoqueDemo } from '../data/demoData';

const CATEGORIAS_ITENS = [
  { id: 'PRODUTO_VIVO', rotulo: 'Produto Vivo' },
  { id: 'SERVICO_VIVO', rotulo: 'Serviço Vivo' },
  { id: 'ACESSORIO', rotulo: 'Acessório' },
  { id: 'RECARGA', rotulo: 'Recarga' },
  { id: 'PAGAMENTO', rotulo: 'Pagamento' }
];

const OPCOES_FORMAS_PAGAMENTO = [
  'Cartão de Crédito',
  'Cartão de Débito',
  'PIX',
  'Dinheiro',
  'Boleto Bancário / Convênio'
];

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

const LISTA_PLANOS_DEMO = [
  { nome: 'PRE PAGO - R$ 0,00', valorMensal: 0.00 },
  { nome: 'Vivo Controle 20GB', valorMensal: 59.90 },
  { nome: 'Vivo Controle 30GB', valorMensal: 74.90 },
  { nome: 'Vivo Pos Individual 50GB', valorMensal: 119.90 },
  { nome: 'Vivo Familia 2 120GB', valorMensal: 180.00 },
  { nome: 'Vivo Fibra 500M', valorMensal: 120.00 },
  { nome: 'Vivo Pré Turbo', valorMensal: 0.00 },
  { nome: 'Plano Controle Legado', valorMensal: 45.00 },
  { nome: 'Outro / Legado', valorMensal: 0.00 }
];

const TABELAS_PRECO = ['Mais Vivo', 'Pré-Pago', 'Varejo / Balcão', 'Fidelizado'];

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

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
  const [status] = useState('ABERTA');
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Identificação e Vendedor
  const [pdvId, setPdvId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [cliente, setCliente] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [emailLogin, setEmailLogin] = useState('');
  const [senha, setSenha] = useState('');

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
    tabelaPreco: '',
    sva: 'Nao',
    seguro: 'Nao',
    segmento: '',
    servico: 'Troca de Aparelho',
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
    valorMensalidade: 0.00,
    simcard3g: '',
    simcard4g: '',
    clientePossuiSimcard: false,
    simcardDoado: false,
    descontoChip: '',
    valorChip: '',
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
    parcelas: '1x'
  });

  useEffect(() => {
    if (!location.state?.vendaId) {
      const historico = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
      if (historico.length > 0) {
        const ultimoIdNum = parseInt(historico[historico.length - 1].id, 10);
        if (!isNaN(ultimoIdNum)) {
          setNumeroVenda(String(ultimoIdNum + 1).padStart(6, '0'));
        }
      } else {
        setNumeroVenda('000001');
      }
    }
  }, [location.state]);

  const totalAPagarCaixa = useMemo(() => {
    return Object.entries(itensPorCategoria)
      .filter(([cat]) => cat !== 'SERVICO_VIVO')
      .flatMap(([, itens]) => itens)
      .reduce((acc, item) => acc + item.valorTotal, 0);
  }, [itensPorCategoria]);

  const totalPagoAteAgora = useMemo(() => {
    return pagamentos.reduce((acc, p) => acc + p.valor, 0);
  }, [pagamentos]);

  const saldoRestante = useMemo(() => {
    return Math.max(0, totalAPagarCaixa - totalPagoAteAgora);
  }, [totalAPagarCaixa, totalPagoAteAgora]);

  useEffect(() => {
    if (abaAtiva === 'PAGAMENTO') {
      setPgtoForm((prev) => ({
        ...prev,
        valor: saldoRestante > 0 ? saldoRestante.toFixed(2) : ''
      }));
    }
  }, [abaAtiva, saldoRestante]);

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

  // Clientes
  const clientesSugeridos = useMemo(() => {
    if (buscaCliente.trim().length < 2) return [];
    if (cliente && `${cliente.nome} - ${cliente.doc || cliente.documento || ''}`.toLowerCase() === buscaCliente.trim().toLowerCase()) return [];

    const termo = buscaCliente.trim().toLowerCase();
    const termoNumerico = termo.replace(/\D/g, '');

    return (clientesDemo || []).filter((c) => {
      const nome = (c.nome || '').toLowerCase();
      const docLimpo = (c.doc || c.documento || c.cnpj || c.cpf || '').replace(/\D/g, '');
      const docFormatado = (c.doc || c.documento || c.cnpj || c.cpf || '').toLowerCase();

      return (
        nome.includes(termo) ||
        docFormatado.includes(termo) ||
        (termoNumerico.length >= 2 && docLimpo.includes(termoNumerico))
      );
    });
  }, [buscaCliente, cliente]);

  // Sugestões de aparelhos com Serial/IMEI
  const aparelhosSugeridos = useMemo(() => {
    if (buscaSerialProduto.trim().length < 2) return [];
    const termo = buscaSerialProduto.trim().toLowerCase();
    const imeiBase = JSON.parse(localStorage.getItem('syscor_imei')) || imeiDemo || [];

    return imeiBase
      .filter((item) => {
        const itemCat = (item.cat || '').toLowerCase();
        const ehAparelho = itemCat.includes('produto') || itemCat.includes('aparelho') || itemCat.includes('smartphone');
        const bateTermo = (item.nome || '').toLowerCase().includes(termo) || (item.imei || '').toLowerCase().includes(termo);
        const disponivel = !item.status || item.status.toUpperCase() !== 'VENDIDO';
        return ehAparelho && bateTermo && disponivel;
      })
      .slice(0, 6);
  }, [buscaSerialProduto]);

  // Acessórios
  const acessoriosSugeridos = useMemo(() => {
    if (buscaAcessorio.trim().length < 2) return [];
    const termo = buscaAcessorio.trim().toLowerCase();
    const estoqueBase = JSON.parse(localStorage.getItem('syscor_estoque')) || estoqueDemo || [];

    return estoqueBase
      .filter((item) => {
        const itemCat = (item.cat || '').toLowerCase();
        const ehAcessorio = itemCat.includes('acessorio') || itemCat.includes('acessório');
        const bateTermo = (item.nome || '').toLowerCase().includes(termo) || (item.sku || '').toLowerCase().includes(termo);
        return ehAcessorio && bateTermo;
      })
      .slice(0, 6);
  }, [buscaAcessorio]);

  const handleConfirmarSerialServico = () => {
    if (!servicoForm.simcard4g.trim()) {
      alert('Informe o número do Simcard/Serial antes de confirmar.');
      return;
    }
    setServicoForm((prev) => ({ ...prev, serialConfirmado: true }));
  };

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

    let descricaoCompleta = `${servicoForm.servico}: ${servicoForm.planoNovo || 'Plano Padrão'}`;
    if (requerPlanoAntigo) {
      descricaoCompleta = `${servicoForm.servico}: [${servicoForm.planoAntigo}] ➔ [${servicoForm.planoNovo || 'Plano Novo'}]`;
    }

    let chipInfo = '';
    if (servicoForm.clientePossuiSimcard) {
      chipInfo = ' · Chip Próprio';
    } else if (servicoForm.simcard4g) {
      chipInfo = ` · ICCID: ${servicoForm.simcard4g}`;
    }

    const novoServico = {
      id: `serv-${Date.now()}`,
      categoria: 'SERVICO_VIVO',
      descricao: descricaoCompleta,
      imeiOuSerial: `Linha: (${servicoForm.ddd}) ${servicoForm.numeroLinha}${chipInfo}${servicoForm.sistemaOrigem ? ` · Origem: ${servicoForm.sistemaOrigem}` : ''}`,
      quantidade: 1,
      valorUnitario: 0.00,
      valorTotal: 0.00,
      mensalidadeFatura: servicoForm.valorMensalidade || 0,
      detalhes: {
        servico: servicoForm.servico,
        planoAntigo: servicoForm.planoAntigo,
        planoNovo: servicoForm.planoNovo,
        mensalidade: servicoForm.valorMensalidade,
        linha: `(${servicoForm.ddd}) ${servicoForm.numeroLinha}`,
        vencimento: servicoForm.vencimentoFatura
      }
    };

    setItensPorCategoria((prev) => ({
      ...prev,
      SERVICO_VIVO: [...prev.SERVICO_VIVO, novoServico]
    }));

    setServicoForm({
      servico: '',
      ddd: '',
      tipoPlano: '',
      planoAntigo: '',
      planoNovo: '',
      numeroLinha: '',
      sistemaOrigem: '',
      vencimentoFatura: '',
      valorMensalidade: 0.00,
      simcard3g: '',
      simcard4g: '',
      clientePossuiSimcard: false,
      simcardDoado: false,
      descontoChip: '',
      valorChip: '',
      serialConfirmado: false
    });
  };

  const handleSelecionarAparelho = (ap) => {
    setAparelhoSelecionado(ap);
    setBuscaSerialProduto(ap.imei);
    setFormProdutoVivo((prev) => ({
      ...prev,
      valor: ap.preco || 0
    }));
  };

  const handleSalvarProdutoVivo = () => {
    if (!aparelhoSelecionado) {
      alert('Por favor, informe ou selecione o Serial/IMEI do aparelho.');
      return;
    }

    if (!formProdutoVivo.planoAtivo) {
      alert('Selecione o plano ativo ou contratado do cliente para validar a venda do aparelho.');
      return;
    }

    const valorFinal = Number(formProdutoVivo.valor) || 0;

    const novoItem = {
      id: `prod-${Date.now()}`,
      categoria: 'PRODUTO_VIVO',
      descricao: aparelhoSelecionado.nome,
      imeiOuSerial: aparelhoSelecionado.imei || buscaSerialProduto,
      numeroLinha: formProdutoVivo.numeroLinha ? `Linha: ${formProdutoVivo.numeroLinha}` : '',
      quantidade: 1,
      valorUnitario: valorFinal,
      valorTotal: valorFinal,
      detalhes: { ...formProdutoVivo }
    };

    setItensPorCategoria((prev) => ({
      ...prev,
      PRODUTO_VIVO: [...prev.PRODUTO_VIVO, novoItem]
    }));

    setModalProdutoAberto(false);
    setAparelhoSelecionado(null);
    setBuscaSerialProduto('');
    setFormProdutoVivo({
      tabelaPreco: '',
      sva: 'Nao',
      seguro: 'Nao',
      segmento: '',
      servico: 'Troca de Aparelho',
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
  };

  const handleAdicionarAcessorio = (e) => {
    e.preventDefault();
    if (!acessorioSelecionado) {
      alert('Selecione um acessório da lista de busca.');
      return;
    }

    const novoItem = {
      id: `acess-${Date.now()}`,
      categoria: 'ACESSORIO',
      descricao: acessorioSelecionado.nome,
      imeiOuSerial: acessorioSelecionado.sku || 'S/N',
      numeroLinha: '',
      quantidade: qtdAcessorio,
      valorUnitario: acessorioSelecionado.preco || 0,
      valorTotal: (acessorioSelecionado.preco || 0) * qtdAcessorio
    };

    setItensPorCategoria((prev) => ({
      ...prev,
      ACESSORIO: [...prev.ACESSORIO, novoItem]
    }));

    setBuscaAcessorio('');
    setAcessorioSelecionado(null);
    setQtdAcessorio(1);
  };

  const handleRemoverItem = (categoria, itemId) => {
    setItensPorCategoria((prev) => ({
      ...prev,
      [categoria]: prev[categoria].filter((i) => i.id !== itemId)
    }));
  };

  const handleAdicionarPagamento = (e) => {
    e.preventDefault();
    const v = parseFloat(String(pgtoForm.valor).replace(',', '.'));
    if (!v || v <= 0) {
      alert('Introduza um valor de pagamento válido.');
      return;
    }

    if (totalAPagarCaixa > 0 && v > saldoRestante + 0.01) {
      alert(`O valor indicado (${formatadorMoeda.format(v)}) excede o saldo restante (${formatadorMoeda.format(saldoRestante)}).`);
      return;
    }

    const descricaoCondicao = pgtoForm.forma === 'Cartão de Crédito' ? pgtoForm.parcelas : 'À vista';
    const novoPgto = {
      id: `pg-${Date.now()}`,
      forma: `${pgtoForm.forma}${pgtoForm.forma === 'Cartão de Crédito' ? ` (${descricaoCondicao})` : ''}`,
      detalhes: descricaoCondicao,
      valor: v
    };

    setPagamentos((prev) => [...prev, novoPgto]);
    setPgtoForm((prev) => ({ ...prev, valor: '' }));
  };

  const handleRemoverPagamento = (id) => {
    setPagamentos((prev) => prev.filter((p) => p.id !== id));
  };

  const executarBaixaEstoque = (itensVendidos) => {
    const estoqueSalvo = JSON.parse(localStorage.getItem('syscor_estoque'));
    const imeiSalvo = JSON.parse(localStorage.getItem('syscor_imei'));

    const estoqueAtual = estoqueSalvo || estoqueDemo.map((item) => ({ ...item }));
    const imeiAtual = imeiSalvo || imeiDemo.map((item) => ({ ...item }));

    itensVendidos.forEach((itemVenda) => {
      if (itemVenda.categoria !== 'PRODUTO_VIVO' && itemVenda.categoria !== 'ACESSORIO') {
        return;
      }

      const descVenda = normalizarComparacao(itemVenda.descricao);

      const idxEstoque = estoqueAtual.findIndex((e) => {
        const skuBate = e.sku && e.sku === itemVenda.imeiOuSerial;
        if (skuBate) return true;
        const nomeEstoque = normalizarComparacao(e.nome || '');
        if (!nomeEstoque || !descVenda) return false;
        return nomeEstoque.includes(descVenda) || descVenda.includes(nomeEstoque);
      });

      if (idxEstoque !== -1) {
        const novoSaldo = Math.max(0, (estoqueAtual[idxEstoque].saldo || 0) - itemVenda.quantidade);
        estoqueAtual[idxEstoque].saldo = novoSaldo;
        if (novoSaldo === 0) estoqueAtual[idxEstoque].status = 'esgotado';
        else if (novoSaldo <= (estoqueAtual[idxEstoque].min || 2)) estoqueAtual[idxEstoque].status = 'critico';
        else estoqueAtual[idxEstoque].status = 'ok';
      }

      if (itemVenda.imeiOuSerial && itemVenda.imeiOuSerial !== 'S/N') {
        const idxImei = imeiAtual.findIndex((i) => i.imei === itemVenda.imeiOuSerial);
        if (idxImei !== -1) {
          imeiAtual[idxImei].status = 'VENDIDO';
          imeiAtual[idxImei].vendaId = numeroVenda;
          imeiAtual[idxImei].dataVenda = new Date().toLocaleDateString('pt-BR');
        }
      }
    });

    localStorage.setItem('syscor_estoque', JSON.stringify(estoqueAtual));
    localStorage.setItem('syscor_imei', JSON.stringify(imeiAtual));
  };

  const handleFinalizarVenda = () => {
    if (totalItensCarrinho === 0) {
      alert('Adicione pelo menos um item ao carrinho antes de finalizar a venda.');
      return;
    }

    if (totalAPagarCaixa > 0 && saldoRestante > 0.01) {
      alert(`Existe um saldo pendente de ${formatadorMoeda.format(saldoRestante)}. Registe o pagamento na aba "Pagamento".`);
      setAbaAtiva('PAGAMENTO');
      return;
    }

    setCarregando(true);

    setTimeout(() => {
      const todosItens = Object.values(itensPorCategoria).flat();
      executarBaixaEstoque(todosItens);

      const novaVendaRegistrada = {
        id: numeroVenda,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        pdvId,
        vendedorId,
        vendedorNome: (VENDEDORES || []).find((v) => v.id === vendedorId)?.nome || 'Não informado',
        cliente: cliente ? cliente.nome : (buscaCliente || 'Cliente Balcão'),
        clienteDoc: cliente ? (cliente.doc || cliente.documento || cliente.cpf || cliente.cnpj || '—') : '—',
        itens: todosItens,
        valorTotal: totalAPagarCaixa,
        pagamentos,
        status: 'FINALIZADA'
      };

      const historicoAtual = JSON.parse(localStorage.getItem('syscor_vendas') || '[]');
      localStorage.setItem('syscor_vendas', JSON.stringify([...historicoAtual, novaVendaRegistrada]));

      const proximoNumero = String(parseInt(numeroVenda, 10) + 1).padStart(6, '0');

      setNumeroVenda(proximoNumero);
      setCliente(null);
      setBuscaCliente('');
      setEmailLogin('');
      setSenha('');
      setPagamentos([]);
      setItensPorCategoria({
        PRODUTO_VIVO: [],
        SERVICO_VIVO: [],
        ACESSORIO: [],
        RECARGA: []
      });
      setAbaAtiva('INICIO');
      setCarregando(false);

      setMensagemSucesso(`Venda #${novaVendaRegistrada.id} finalizada com sucesso!`);
      setTimeout(() => setMensagemSucesso(''), 5000);
    }, 600);
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {mensagemSucesso && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--good-soft)',
          border: '1px solid var(--good)',
          color: 'var(--good)',
          padding: '12px 18px',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 600
        }}>
          <CheckCircle size={18} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pencil size={20} color="var(--accent)" />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
            Lançar Venda <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7 }}>#{numeroVenda || '000000'}</span>
          </h1>
        </div>
        <span className="badge neutral">{status === 'ABERTA' ? 'ABERTA' : status}</span>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'visible' }}>
        {/* Barra de Abas */}
        <div className="tabs" style={{ padding: '6px 16px 0', position: 'relative' }}>
          <button
            type="button"
            className={`tab ${abaAtiva === 'INICIO' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('INICIO')}
          >
            Início
          </button>

          {CATEGORIAS_ITENS.map((cat) => {
            const count = contagemPorCategoria[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                className={`tab ${abaAtiva === cat.id ? 'active' : ''}`}
                onClick={() => setAbaAtiva(cat.id)}
              >
                {cat.rotulo} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ padding: 24 }}>
          {/* ================= 1. INÍCIO ================= */}
          {abaAtiva === 'INICIO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
              <div className="field" style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 12, margin: 0 }}>
                <label style={{ margin: 0 }}>PDV:</label>
                <select value={pdvId} onChange={(e) => setPdvId(e.target.value)}>
                  <option value="">Escolha ...</option>
                  {(PDVS || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 12, margin: 0 }}>
                <label style={{ margin: 0 }}>Vendedor:</label>
                <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
                  <option value="">Escolha...</option>
                  {(VENDEDORES || []).map((v) => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'start', gap: 12, margin: 0 }}>
                <label style={{ marginTop: 10 }}>Cliente:</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
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

              <fieldset style={{ borderRadius: 6, padding: 16, marginTop: 12, border: '1px solid var(--line)' }}>
                <legend style={{ padding: '0 6px', color: 'var(--text-dim)', fontSize: 13, fontWeight: 600 }}>
                  Autenticação do vendedor:
                </legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: 12, margin: 0 }}>
                    <label style={{ margin: 0 }}>E-mail / Login:</label>
                    <input
                      type="text"
                      placeholder="email@dominio.com"
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: 12, margin: 0 }}>
                    <label style={{ margin: 0 }}>Senha:</label>
                    <input
                      type="password"
                      placeholder="Senha do vendedor..."
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
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
                    fontWeight: 500
                  }}
                >
                  <Plus size={16} /> Adicionar produto Vivo
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

                  {/* 1. Aparelho/Serviços - Campos Alinhados */}
                  <fieldset style={{ 
                    border: '1px solid var(--line, #e2e8f0)', 
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
                      <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
                        <input
                          type="text"
                          placeholder="Digite ou bipe o IMEI/Serial..."
                          value={buscaSerialProduto}
                          onChange={(e) => {
                            setBuscaSerialProduto(e.target.value);
                            setAparelhoSelecionado(null);
                          }}
                          style={{
                            width: '100%',
                            height: 34,
                            padding: '0 10px',
                            fontSize: 13,
                            borderRadius: 6,
                            border: '1px solid var(--line, #cbd5e1)',
                            background: 'var(--panel)',
                            color: 'var(--text)',
                            boxSizing: 'border-box'
                          }}
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

                    {/* Tabela de Preço */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Tabela de Preço:</label>
                      <select
                        value={formProdutoVivo.tabelaPreco}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, tabelaPreco: e.target.value }))}
                        style={{
                          width: 240,
                          height: 34,
                          padding: '0 8px',
                          fontSize: 13,
                          borderRadius: 6,
                          border: '1px solid var(--line, #cbd5e1)',
                          background: 'var(--panel)',
                          color: 'var(--text)'
                        }}
                      >
                        <option value="">Escolha a tabela...</option>
                        {TABELAS_PRECO.map((tab) => (
                          <option key={tab} value={tab}>{tab}</option>
                        ))}
                      </select>
                    </div>

                    {/* SVA */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>SVA:</label>
                      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0 }}>
                          <input
                            type="radio"
                            name="sva"
                            checked={formProdutoVivo.sva === 'Nao'}
                            onChange={() => setFormProdutoVivo((p) => ({ ...p, sva: 'Nao' }))}
                          /> Não
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0 }}>
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
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0 }}>
                          <input
                            type="radio"
                            name="seguro"
                            checked={formProdutoVivo.seguro === 'Nao'}
                            onChange={() => setFormProdutoVivo((p) => ({ ...p, seguro: 'Nao' }))}
                          /> Não
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, margin: 0 }}>
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
                      <div style={{ display: 'flex', gap: 8, maxWidth: 440 }}>
                        <select
                          value={formProdutoVivo.segmento}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, segmento: e.target.value }))}
                          style={{
                            width: 130,
                            height: 34,
                            padding: '0 8px',
                            fontSize: 13,
                            borderRadius: 6,
                            border: '1px solid var(--line, #cbd5e1)',
                            background: 'var(--panel)',
                            color: 'var(--text)'
                          }}
                        >
                          <option value="">Segmento...</option>
                          <option value="Pré">Pré</option>
                          <option value="Controle">Controle</option>
                          <option value="Pós">Pós</option>
                        </select>
                        <select
                          value={formProdutoVivo.servico}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, servico: e.target.value }))}
                          style={{
                            flex: 1,
                            height: 34,
                            padding: '0 8px',
                            fontSize: 13,
                            borderRadius: 6,
                            border: '1px solid var(--line, #cbd5e1)',
                            background: 'var(--panel)',
                            color: 'var(--text)'
                          }}
                        >
                          <option value="Troca de Aparelho">Troca de Aparelho</option>
                          <option value="Aparelho Avulso / Pré">Aparelho Avulso / Pré</option>
                          <option value="Vinculado a Linha Contratada (Serviço)">Vinculado a Linha Contratada (Serviço)</option>
                        </select>
                      </div>
                    </div>

                    {/* Plano Ativo / Linha */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Plano Ativo / Linha:</label>
                      <div style={{ display: 'flex', gap: 8, maxWidth: 440 }}>
                        <select
                          value={formProdutoVivo.ddd}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, ddd: e.target.value }))}
                          style={{
                            width: 80,
                            height: 34,
                            padding: '0 6px',
                            fontSize: 13,
                            borderRadius: 6,
                            border: '1px solid var(--line, #cbd5e1)',
                            background: 'var(--panel)',
                            color: 'var(--text)'
                          }}
                        >
                          <option value="">DDD</option>
                          {LISTA_DDDS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <select
                          value={formProdutoVivo.planoAtivo}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, planoAtivo: e.target.value }))}
                          style={{
                            flex: 1,
                            height: 34,
                            padding: '0 8px',
                            fontSize: 13,
                            borderRadius: 6,
                            border: '1px solid var(--line, #cbd5e1)',
                            background: 'var(--panel)',
                            color: 'var(--text)'
                          }}
                        >
                          <option value="">Selecione o plano já ativo / contratado...</option>
                          {LISTA_PLANOS_DEMO.map((pl) => (
                            <option key={pl.nome} value={pl.nome}>{pl.nome}</option>
                          ))}
                        </select>
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

                  {/* 2. Valores - Campos Alinhados */}
                  <fieldset style={{ 
                    border: '1px solid var(--line, #e2e8f0)', 
                    borderRadius: 8, 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 14 
                  }}>
                    <legend style={{ padding: '0 8px', color: 'var(--accent, #a855f7)', fontSize: 13, fontWeight: 700 }}>
                      Valores
                    </legend>

                    {/* Badge Verde de Valor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Valor:</label>
                      <div>
                        <span style={{
                          background: 'var(--good, #22c55e)',
                          color: '#fff',
                          fontWeight: 700,
                          padding: '6px 14px',
                          borderRadius: 6,
                          fontSize: 13.5
                        }}>
                          {formatadorMoeda.format(formProdutoVivo.valor)}
                        </span>
                      </div>
                    </div>

                    {/* Valor Adicional */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Valor Adicional:</label>
                      <input
                        type="text"
                        placeholder="0,00"
                        value={formProdutoVivo.valorAdicional}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, valorAdicional: e.target.value }))}
                        style={{
                          width: 140,
                          height: 34,
                          padding: '0 10px',
                          fontSize: 13,
                          borderRadius: 6,
                          border: '1px solid var(--line, #cbd5e1)',
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Valor Acréscimo */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Valor Acréscimo:</label>
                      <span className="mono" style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
                        {formatadorMoeda.format(formProdutoVivo.valorAcrescimo)}
                      </span>
                    </div>

                    {/* Outros: Desconto + Cupom */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Outros:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Desconto:</span>
                        <input
                          type="text"
                          placeholder="0,00"
                          value={formProdutoVivo.desconto}
                          onChange={(e) => setFormProdutoVivo((p) => ({ ...p, desconto: e.target.value }))}
                          style={{
                            width: 100,
                            height: 34,
                            padding: '0 10px',
                            fontSize: 13,
                            borderRadius: 6,
                            border: '1px solid var(--line, #cbd5e1)',
                            background: 'var(--panel)',
                            color: 'var(--text)',
                            boxSizing: 'border-box'
                          }}
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

                    {/* Vencimento da fatura */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Vencimento da fatura:</label>
                      <select
                        value={formProdutoVivo.vencimentoFatura}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, vencimentoFatura: e.target.value }))}
                        style={{
                          width: 300,
                          height: 34,
                          padding: '0 8px',
                          fontSize: 13,
                          borderRadius: 6,
                          border: '1px solid var(--line, #cbd5e1)',
                          background: 'var(--panel)',
                          color: 'var(--text)'
                        }}
                      >
                        <option value="">Escolha o dia do vencimento da fatura</option>
                        {DIAS_VENCIMENTO.map((dia) => (
                          <option key={dia} value={dia}>Dia {dia}</option>
                        ))}
                      </select>
                    </div>
                  </fieldset>

                  {/* 3. Linha - Campos Alinhados */}
                  <fieldset style={{ 
                    border: '1px solid var(--line, #e2e8f0)', 
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
                        style={{
                          width: 220,
                          height: 34,
                          padding: '0 10px',
                          fontSize: 13,
                          borderRadius: 6,
                          border: '1px solid var(--line, #cbd5e1)',
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Sistema de Origem */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Sistema de Origem:</label>
                      <select
                        value={formProdutoVivo.sistemaOrigem}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, sistemaOrigem: e.target.value }))}
                        style={{
                          width: 220,
                          height: 34,
                          padding: '0 8px',
                          fontSize: 13,
                          borderRadius: 6,
                          border: '1px solid var(--line, #cbd5e1)',
                          background: 'var(--panel)',
                          color: 'var(--text)'
                        }}
                      >
                        <option value="">Escolha o sistema...</option>
                        {OPCOES_SISTEMA_ORIGEM.map((sis) => (
                          <option key={sis} value={sis}>{sis}</option>
                        ))}
                      </select>
                    </div>

                    {/* Nº da ordem NEXT / RPON Fixa */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Nº da ordem NEXT / RPON Fixa:</label>
                      <input
                        type="text"
                        value={formProdutoVivo.numOrdemNext}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, numOrdemNext: e.target.value }))}
                        placeholder="Digite o número da ordem..."
                        style={{
                          width: 220,
                          height: 34,
                          padding: '0 10px',
                          fontSize: 13,
                          borderRadius: 6,
                          border: '1px solid var(--line, #cbd5e1)',
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Nº da solicitação do GED */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Nº da solicitação do GED:</label>
                      <input
                        type="text"
                        value={formProdutoVivo.numSolicitacaoGed}
                        onChange={(e) => setFormProdutoVivo((p) => ({ ...p, numSolicitacaoGed: e.target.value }))}
                        placeholder="Digite o número da solicitação..."
                        style={{
                          width: 300,
                          height: 34,
                          padding: '0 10px',
                          fontSize: 13,
                          borderRadius: 6,
                          border: '1px solid var(--line, #cbd5e1)',
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </fieldset>

                  {/* Card Flutuante de Ações */}
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
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      className="btn solid"
                      onClick={handleSalvarProdutoVivo}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      Salvar <Check size={16} />
                    </button>
                  </div>

                </div>
              )}

              {/* Tabela de Produtos Cadastrados */}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Descrição do Aparelho</th>
                      <th>Serial / IMEI</th>
                      <th>Linha / Plano Ativo</th>
                      <th style={{ textAlign: 'right' }}>Qtd.</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
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
                        <tr key={item.id}>
                          <td><b>{item.descricao}</b></td>
                          <td className="mono" style={{ color: 'var(--accent)' }}>{item.imeiOuSerial}</td>
                          <td style={{ color: 'var(--text-faint)' }}>
                            {item.numeroLinha || '—'} {item.detalhes?.planoAtivo ? `(${item.detalhes.planoAtivo})` : ''}
                          </td>
                          <td style={{ textAlign: 'right' }}>{item.quantidade}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--good)' }} className="mono">
                            {formatadorMoeda.format(item.valorTotal)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
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
              <form onSubmit={handleAdicionarServicoVivo} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 740 }}>
                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0 }}>Serviço:</label>
                  <select
                    value={servicoForm.servico}
                    onChange={(e) => setServicoForm((prev) => ({ 
                      ...prev, 
                      servico: e.target.value,
                      serialConfirmado: false
                    }))}
                  >
                    <option value="">Escolha ...</option>
                    {OPCOES_SERVICO.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {requerPlanoAntigo && (
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                    <label style={{ margin: 0, color: 'var(--warn)' }}>Plano Antigo / Atual:</label>
                    <select
                      style={{ flex: 1, borderColor: 'var(--warn)' }}
                      value={servicoForm.planoAntigo}
                      onChange={(e) => setServicoForm((prev) => ({ ...prev, planoAntigo: e.target.value }))}
                    >
                      <option value="">Selecione o plano de origem...</option>
                      {LISTA_PLANOS_DEMO.map((p) => (
                        <option key={p.nome} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'start', gap: 16, margin: 0 }}>
                  <label style={{ marginTop: 10 }}>{requerPlanoAntigo ? 'Plano Novo (Destino):' : 'Plano Contratado:'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select 
                        style={{ width: 90 }}
                        value={servicoForm.ddd}
                        onChange={(e) => setServicoForm((prev) => ({ ...prev, ddd: e.target.value }))}
                      >
                        <option value="">DDD</option>
                        {LISTA_DDDS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select
                        style={{ flex: 1 }}
                        value={servicoForm.tipoPlano}
                        onChange={(e) => setServicoForm((prev) => ({ ...prev, tipoPlano: e.target.value }))}
                      >
                        <option value="">Segmento...</option>
                        <option value="Pos">Pós Pago</option>
                        <option value="Controle">Controle</option>
                        <option value="Fibra">Fibra</option>
                      </select>
                    </div>

                    <select
                      value={servicoForm.planoNovo}
                      onChange={(e) => {
                        const sel = LISTA_PLANOS_DEMO.find((p) => p.nome === e.target.value);
                        setServicoForm((prev) => ({ 
                          ...prev, 
                          planoNovo: e.target.value,
                          valorMensalidade: sel ? sel.valorMensal : 0.00
                        }));
                      }}
                    >
                      <option value="">Escolha o plano novo...</option>
                      {LISTA_PLANOS_DEMO.map((p) => (
                        <option key={p.nome} value={p.nome}>
                          {p.nome} (Fatura: {formatadorMoeda.format(p.valorMensal)}/mês)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0 }}>Número da linha:</label>
                  <input
                    type="text"
                    style={{ maxWidth: 220 }}
                    placeholder="Ex: 99437-3977"
                    value={servicoForm.numeroLinha}
                    onChange={(e) => setServicoForm((prev) => ({ ...prev, numeroLinha: e.target.value }))}
                  />
                </div>

                {requerSimcard && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--line-soft)' }}>
                    {servicoForm.servico === 'Troca de Simcard' && (
                      <div className="field" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                        <label style={{ margin: 0, fontSize: 13 }}>Simcard 3G (Antigo):</label>
                        <input
                          type="text"
                          style={{ maxWidth: 260 }}
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
                          <label style={{ margin: 0, fontSize: 13 }}>
                            {servicoForm.servico === 'Troca de Simcard' ? 'Simcard 4G (Novo):' : 'Simcard / Serial:'}
                          </label>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="text"
                              style={{ maxWidth: 260 }}
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
                                height: 36
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
                            style={{ width: 80, height: 28, textAlign: 'right' }}
                            value={servicoForm.descontoChip}
                            onChange={(e) => setServicoForm((prev) => ({ ...prev, descontoChip: e.target.value }))}
                          />

                          <input
                            type="text"
                            placeholder="0,00"
                            style={{ width: 80, height: 28, textAlign: 'right' }}
                            value={servicoForm.valorChip}
                            onChange={(e) => setServicoForm((prev) => ({ ...prev, valorChip: e.target.value }))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0 }}>Sistema de Origem:</label>
                  <select
                    style={{ maxWidth: 220 }}
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
                  <label style={{ margin: 0 }}>Vencimento da fatura:</label>
                  <select
                    value={servicoForm.vencimentoFatura}
                    onChange={(e) => setServicoForm((prev) => ({ ...prev, vencimentoFatura: e.target.value }))}
                  >
                    <option value="">Escolha o dia...</option>
                    {DIAS_VENCIMENTO.map((dia) => (
                      <option key={dia} value={dia}>Dia {dia}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                  <button type="submit" className="btn solid" style={{ padding: '8px 18px', fontSize: 13.5 }}>
                    <Plus size={16} /> Adicionar Serviço ao Carrinho
                  </button>
                </div>
              </form>

              {itensPorCategoria.SERVICO_VIVO.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Serviço / Transição de Plano</th>
                        <th>Linha & Chip</th>
                        <th style={{ textAlign: 'right' }}>Qtd.</th>
                        <th style={{ textAlign: 'right' }}>Cobrança Balcão</th>
                        <th style={{ textAlign: 'right' }}>Mensalidade Fatura</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensPorCategoria.SERVICO_VIVO.map((item) => (
                        <tr key={item.id}>
                          <td><b>{item.descricao}</b></td>
                          <td style={{ color: 'var(--text-faint)' }}>{item.imeiOuSerial}</td>
                          <td style={{ textAlign: 'right' }}>{item.quantidade}</td>
                          <td style={{ textAlign: 'right' }} className="mono">
                            <span className="badge neutral">R$ 0,00</span>
                          </td>
                          <td style={{ textAlign: 'right' }} className="mono">
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                              {formatadorMoeda.format(item.mensalidadeFatura)}/mês
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
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
              <form onSubmit={handleAdicionarAcessorio} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 640 }}>
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
                          <span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                            {formatadorMoeda.format(ac.preco || 0)}
                          </span>
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
                  />
                </div>

                <button
                  type="submit"
                  className="btn solid"
                  disabled={!acessorioSelecionado}
                >
                  Adicionar
                </button>
              </form>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>SKU / Código</th>
                      <th style={{ textAlign: 'right' }}>Qtd.</th>
                      <th style={{ textAlign: 'right' }}>Vlr. Unit.</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
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
                        <tr key={item.id}>
                          <td><b>{item.descricao}</b></td>
                          <td className="mono" style={{ color: 'var(--text-faint)' }}>{item.imeiOuSerial}</td>
                          <td style={{ textAlign: 'right' }}>{item.quantidade}</td>
                          <td style={{ textAlign: 'right' }} className="mono">{formatadorMoeda.format(item.valorUnitario)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--good)' }} className="mono">
                            {formatadorMoeda.format(item.valorTotal)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
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
              <form onSubmit={handleAdicionarPagamento} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620 }}>
                <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600 }}>Valor total:</label>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--good)' }}>
                    {formatadorMoeda.format(totalAPagarCaixa)}
                    {totalPagoAteAgora > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-faint)', marginLeft: 10 }}>
                        (Restante: {formatadorMoeda.format(saldoRestante)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600 }}>Forma de pagamento:</label>
                  <select
                    value={pgtoForm.forma}
                    onChange={(e) => setPgtoForm((prev) => ({ ...prev, forma: e.target.value }))}
                  >
                    <option value="">Escolha a forma de pagamento...</option>
                    {OPCOES_FORMAS_PAGAMENTO.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {pgtoForm.forma === 'Cartão de Crédito' && (
                  <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                    <label style={{ margin: 0, fontWeight: 600 }}>Parcelamento:</label>
                    <select
                      value={pgtoForm.parcelas}
                      onChange={(e) => setPgtoForm((prev) => ({ ...prev, parcelas: e.target.value }))}
                    >
                      {[1, 2, 3, 4, 5, 6, 10, 12, 18].map((p) => (
                        <option key={p} value={`${p}x`}>{p}x {p === 1 ? 'à vista' : 'sem juros'}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="field" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', alignItems: 'center', gap: 16, margin: 0 }}>
                  <label style={{ margin: 0, fontWeight: 600 }}>Valor:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="number"
                      step="0.01"
                      style={{ maxWidth: 180 }}
                      placeholder="0,00"
                      value={pgtoForm.valor}
                      onChange={(e) => setPgtoForm((prev) => ({ ...prev, valor: e.target.value }))}
                    />
                    <button
                      type="submit"
                      className="btn solid"
                      style={{
                        background: 'var(--good)',
                        borderColor: 'var(--good)',
                        color: '#ffffff'
                      }}
                      disabled={totalAPagarCaixa > 0 && saldoRestante <= 0}
                    >
                      Inserir
                    </button>
                  </div>
                </div>
              </form>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '60%' }}>Forma de pagamento</th>
                      <th style={{ textAlign: 'right', width: '30%' }}>Valor</th>
                      <th style={{ width: '10%', textAlign: 'center' }}></th>
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
                        <tr key={item.id}>
                          <td><b>{item.forma}</b></td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--good)' }} className="mono">
                            {formatadorMoeda.format(item.valor)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
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
        padding: '16px 20px',
        borderRadius: 8
      }}>
        <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
          <div>
            <b>{totalItensCarrinho}</b> {totalItensCarrinho === 1 ? 'item' : 'itens'} no carrinho
          </div>
          {itensPorCategoria.SERVICO_VIVO.length > 0 && (
            <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 2 }}>
              ({itensPorCategoria.SERVICO_VIVO.length} plano(s) na fatura mensal da Vivo)
            </small>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'block' }}>Total a pagar no caixa</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--good)' }}>
              {formatadorMoeda.format(totalAPagarCaixa)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFinalizarVenda}
            disabled={totalItensCarrinho === 0 || carregando}
            className="btn solid"
            style={{ padding: '10px 22px', fontSize: 14 }}
          >
            {carregando ? 'A gravar venda...' : 'Finalizar venda'}
          </button>
        </div>
      </div>
    </div>
  );
}