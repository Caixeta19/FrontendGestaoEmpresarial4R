import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../components/ToastContext.jsx';

const inputStyleVisivel = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #475569)',
  color: 'var(--text, #f1eef7)',
  borderRadius: '6px',
  outline: 'none',
  padding: '8px 12px',
  transition: 'border-color 0.15s ease',
  width: '100%',
  fontSize: 13
};

export default function Clientes({ onVoltar, etapaInicial = 'MENU' }) {
  // 'MENU' | 'BUSCA' | 'DETALHE'
  const [etapa, setEtapa] = useState(() => {
    if (etapaInicial === 'INSERIR') return 'DETALHE';
    if (etapaInicial === 'BUSCAR') return 'BUSCA';
    return 'MENU';
  });

  const [mensagemErro, setMensagemErro] = useState('');
  const showToast = useToast();

  const [filtrosBusca, setFiltrosBusca] = useState({
    nome: '',
    documento: '',
    telefone: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    doc: '',
    celular: '',
    telefone: '',
    email: '',
    // Endereço Principal
    cep: '',
    estado: 'GO',
    cidade: 'Luziânia',
    rua: '',
    bairro: '',
    numero: '',
    semNumero: false,
    complemento: '',
    zonaRural: false,
    // Dados Complementares
    contatoNome: '',
    contatoEmail: '',
    observacao: '',
    restricao: 'Não',
    receberMensagens: 'Sim',
    origemCadastro: 'Loja Física',
    scoreCliente: '',
    vencimentoFatura: 'Dia 01'
  });

  const [docFeedback, setDocFeedback] = useState({ text: '', color: '' });

  function validarDoc(value) {
    setFormData(prev => ({ ...prev, doc: value }));
    const v = value.replace(/\D/g, '');
    if (v.length === 0) setDocFeedback({ text: '', color: '' });
    else if (v.length === 11) setDocFeedback({ text: 'CPF em formato válido.', color: 'var(--good, #22c55e)' });
    else if (v.length === 14) setDocFeedback({ text: 'CNPJ em formato válido.', color: 'var(--good, #22c55e)' });
    else setDocFeedback({ text: 'Documento incompleto.', color: 'var(--warn, #eab308)' });
  }

  const handleExecutarBusca = (e) => {
    e.preventDefault();
    setMensagemErro('');

    const docLimpo = filtrosBusca.documento.trim().replace(/\D/g, '');
    const nomeBusca = filtrosBusca.nome.trim().toLowerCase();

    const clientesSalvos = JSON.parse(localStorage.getItem('syscor_clientes') || '[]');

    const encontrado = clientesSalvos.find(c => {
      const cDoc = String(c.doc || '').replace(/\D/g, '');
      const cNome = String(c.nome || '').toLowerCase();
      if (docLimpo && cDoc.includes(docLimpo)) return true;
      if (nomeBusca && cNome.includes(nomeBusca)) return true;
      return false;
    });

    if (encontrado) {
      setFormData(encontrado);
      setEtapa('DETALHE');
      return;
    }

    if (docLimpo || nomeBusca) {
      setFormData(prev => ({
        ...prev,
        nome: filtrosBusca.nome || '',
        doc: filtrosBusca.documento || '',
        celular: filtrosBusca.telefone || ''
      }));
      setEtapa('DETALHE');
      return;
    }

    setMensagemErro('Informe ao menos o Nome ou CPF/CNPJ para pesquisar.');
  };

  const salvarCliente = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.doc) {
      alert('Preencha ao menos o Nome completo e o CPF/CNPJ.');
      return;
    }

    const clientesSalvos = JSON.parse(localStorage.getItem('syscor_clientes') || '[]');
    const index = clientesSalvos.findIndex(c => c.doc === formData.doc);
    
    if (index >= 0) {
      clientesSalvos[index] = formData;
    } else {
      clientesSalvos.push(formData);
    }
    
    localStorage.setItem('syscor_clientes', JSON.stringify(clientesSalvos));
    showToast('Cliente cadastrado/atualizado com sucesso.');
    if (onVoltar) onVoltar();
  };

  /* ==========================================================================
     1. TELA DE MENU PRINCIPAL (2 CARDS)
     ========================================================================== */
  if (etapa === 'MENU') {
    return (
      <div style={{ maxWidth: 720, margin: '20px auto 0', display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 8, height: 16, background: 'var(--accent, #c026d3)', borderRadius: 2, marginTop: 4 }} />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text, #fff)' }}>
                Cliente / Lead
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-faint, #8c85a6)', fontSize: 13.5 }}>
                Inclusão e alteração das informações dos clientes e leads.
              </p>
            </div>
          </div>
          {onVoltar && (
            <button type="button" className="btn sm" onClick={onVoltar} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Voltar ao Menu
            </button>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 20, 
          padding: 28, 
          background: 'var(--panel, #181329)', 
          border: '1px solid var(--line, #332a4d)', 
          borderRadius: 12 
        }}>
          <div 
            onClick={() => {
              setFormData({
                nome: '', doc: '', celular: '', telefone: '', email: '',
                cep: '', estado: 'GO', cidade: 'Luziânia', rua: '', bairro: '',
                numero: '', semNumero: false, complemento: '', zonaRural: false,
                contatoNome: '', contatoEmail: '', observacao: '', restricao: 'Não',
                receberMensagens: 'Sim', origemCadastro: 'Loja Física', scoreCliente: '', vencimentoFatura: 'Dia 01'
              });
              setDocFeedback({ text: '', color: '' });
              setEtapa('DETALHE');
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 16, padding: '44px 20px', borderRadius: 10, border: '1px solid var(--line, #332a4d)',
              background: 'var(--panel-2, #211c38)', cursor: 'pointer'
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
              <PlusCircle size={28} />
            </div>
            <b style={{ fontSize: 15, color: 'var(--text, #fff)' }}>Inserir Registro</b>
          </div>

          <div 
            onClick={() => {
              setMensagemErro('');
              setEtapa('BUSCA');
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 16, padding: '44px 20px', borderRadius: 10, border: '1px solid var(--line, #332a4d)',
              background: 'var(--panel-2, #211c38)', cursor: 'pointer'
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(192, 38, 211, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #c026d3)' }}>
              <Search size={28} />
            </div>
            <b style={{ fontSize: 15, color: 'var(--text, #fff)' }}>Buscar Registro</b>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     2. TELA DE BUSCA DE CLIENTES / LEADS
     ========================================================================== */
  if (etapa === 'BUSCA') {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={22} color="var(--accent, #c026d3)" />
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text, #fff)' }}>
              Busca de Clientes / Leads
            </h1>
          </div>

          <button 
            type="button" 
            className="btn sm"
            onClick={() => {
              if (etapaInicial !== 'MENU' && onVoltar) onVoltar();
              else setEtapa('MENU');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Voltar ao Menu
          </button>
        </div>

        {mensagemErro && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            borderRadius: 8, fontSize: 13.5, fontWeight: 600,
            background: 'rgba(239, 68, 68, 0.15)', color: 'var(--bad, #ef4444)', border: '1px solid var(--bad, #ef4444)'
          }}>
            <AlertTriangle size={18} />
            <span>{mensagemErro}</span>
          </div>
        )}

        <form onSubmit={handleExecutarBusca} className="panel" style={{ padding: 24, border: '1px solid var(--line, #332a4d)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good, #22c55e)', marginBottom: 20 }}>
            <ChevronRight size={18} strokeWidth={3} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Filtros de Pesquisa</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Nome Completo:</label>
              <input 
                type="text" 
                placeholder="Digite o nome do cliente..." 
                value={filtrosBusca.nome}
                onChange={(e) => setFiltrosBusca(prev => ({ ...prev, nome: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>CPF / CNPJ:</label>
              <input 
                type="text" 
                placeholder="000.000.000-00" 
                value={filtrosBusca.documento}
                onChange={(e) => setFiltrosBusca(prev => ({ ...prev, documento: e.target.value }))}
                style={{ ...inputStyleVisivel, maxWidth: 300 }}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Telefone:</label>
              <input 
                type="text" 
                placeholder="(00) 00000-0000" 
                value={filtrosBusca.telefone}
                onChange={(e) => setFiltrosBusca(prev => ({ ...prev, telefone: e.target.value }))}
                style={{ ...inputStyleVisivel, maxWidth: 300 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line, #332a4d)' }}>
            <button 
              type="button" 
              className="btn sm ghost"
              onClick={() => setFiltrosBusca({ nome: '', documento: '', telefone: '' })}
            >
              Limpar Campos
            </button>

            <button 
              type="submit" 
              className="btn sm solid"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px' }}
            >
              <Search size={15} /> Pesquisar Cliente
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ==========================================================================
     3. TELA DE CADASTRO / EDIÇÃO DE CLIENTE (ENDEREÇOS E DADOS COMPLETOS)
     ========================================================================== */
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserCheck size={20} color="var(--accent, #c026d3)" />
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: 'var(--accent, #c026d3)' }}>
            Cadastro de Cliente / Lead
          </h1>
        </div>

        <button 
          type="button" 
          className="btn sm"
          onClick={() => {
            if (etapaInicial !== 'MENU' && onVoltar) onVoltar();
            else setEtapa('MENU');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} /> Voltar ao Menu
        </button>
      </div>

      <form 
        onSubmit={salvarCliente} 
        className="panel" 
        style={{ 
          padding: 24, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 22, 
          background: 'var(--panel, #181329)', 
          border: '1px solid var(--line, #332a4d)' 
        }}
      >
        {/* DADOS PRINCIPAIS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="field" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label>Nome completo:</label>
            <input 
              type="text" 
              placeholder="Nome do cliente" 
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              style={inputStyleVisivel}
              required
            />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label>CPF / CNPJ:</label>
            <input 
              type="text" 
              placeholder="000.000.000-00" 
              value={formData.doc} 
              onChange={(e) => validarDoc(e.target.value)} 
              style={inputStyleVisivel}
              required
            />
            <small style={{ fontSize: 11.5, color: docFeedback.color || 'var(--text-faint)', marginTop: 4, display: 'block' }}>
              {docFeedback.text}
            </small>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label>E-mail:</label>
            <input 
              type="email" 
              placeholder="cliente@email.com" 
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              style={inputStyleVisivel}
            />
          </div>
        </div>

        {/* SEÇÃO: ENDEREÇO PRINCIPAL */}
        <div style={{ background: 'var(--panel-2, #211c38)', padding: 18, borderRadius: 8, border: '1px solid var(--line, #332a4d)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: 14, margin: 0, color: 'var(--text, #fff)', fontWeight: 700, borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
            Endereço Principal
          </h3>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="field" style={{ margin: 0, flex: 1, maxWidth: 220 }}>
              <label>CEP:</label>
              <input 
                type="text" 
                placeholder="00000-000" 
                value={formData.cep}
                onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>
            <button 
              type="button" 
              className="btn sm"
              onClick={() => alert('Consulta de CEP simulada!')}
              style={{ background: 'var(--accent, #c026d3)', color: '#fff', border: 'none', height: 34, padding: '0 14px' }}
            >
              Procurar CEP
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Estado (UF):</label>
              <select 
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                style={inputStyleVisivel}
              >
                <option value="GO">GO</option>
                <option value="DF">DF</option>
                <option value="SP">SP</option>
                <option value="CE">CE</option>
              </select>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Cidade:</label>
              <input 
                type="text" 
                value={formData.cidade}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Rua:</label>
              <input 
                type="text" 
                placeholder="Nome da rua / avenida" 
                value={formData.rua}
                onChange={(e) => setFormData(prev => ({ ...prev, rua: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Bairro:</label>
              <input 
                type="text" 
                placeholder="Bairro" 
                value={formData.bairro}
                onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 16, alignItems: 'center' }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Nº:</label>
              <input 
                type="text" 
                placeholder="Nº" 
                disabled={formData.semNumero}
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                style={{ ...inputStyleVisivel, opacity: formData.semNumero ? 0.5 : 1 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={formData.semNumero}
                  onChange={(e) => setFormData(prev => ({ ...prev, semNumero: e.target.checked }))}
                />
                <span>Sem número</span>
              </label>
            </div>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label>Complemento:</label>
            <input 
              type="text" 
              placeholder="Apto, Bloco, Quadra..." 
              value={formData.complemento}
              onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
              style={inputStyleVisivel}
            />
          </div>

          <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, margin: 0 }}>
              <input 
                type="checkbox" 
                checked={formData.zonaRural}
                onChange={(e) => setFormData(prev => ({ ...prev, zonaRural: e.target.checked }))}
              />
              <span>Zona Rural</span>
            </label>
          </div>
        </div>

        {/* SEÇÃO: DADOS COMPLEMENTARES */}
        <div style={{ background: 'var(--panel-2, #211c38)', padding: 18, borderRadius: 8, border: '1px solid var(--line, #332a4d)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: 14, margin: 0, color: 'var(--text, #fff)', fontWeight: 700, borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
            Dados Complementares
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Celular:</label>
              <input 
                type="text" 
                placeholder="(61) 90000-0000" 
                value={formData.celular}
                onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Telefone:</label>
              <input 
                type="text" 
                placeholder="(61) 3000-0000" 
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Contato / Nome:</label>
              <input 
                type="text" 
                placeholder="Nome do contato alternativo" 
                value={formData.contatoNome}
                onChange={(e) => setFormData(prev => ({ ...prev, contatoNome: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Contato / E-mail-Adicional:</label>
              <input 
                type="email" 
                placeholder="contato@email.com" 
                value={formData.contatoEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contatoEmail: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label>Observação:</label>
            <textarea 
              rows={3}
              placeholder="Observações adicionais sobre o cliente..."
              value={formData.observacao}
              onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
              style={{ ...inputStyleVisivel, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Restrição:</label>
              <select 
                value={formData.restricao}
                onChange={(e) => setFormData(prev => ({ ...prev, restricao: e.target.value }))}
                style={inputStyleVisivel}
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Deseja receber mensagens promocionais da loja (E-mail, SMS ...)?</label>
              <select 
                value={formData.receberMensagens}
                onChange={(e) => setFormData(prev => ({ ...prev, receberMensagens: e.target.value }))}
                style={inputStyleVisivel}
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Origem do cadastro:</label>
              <select 
                value={formData.origemCadastro}
                onChange={(e) => setFormData(prev => ({ ...prev, origemCadastro: e.target.value }))}
                style={inputStyleVisivel}
              >
                <option value="Loja Física">Loja Física</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Indicação">Indicação</option>
                <option value="Redes Sociais">Redes Sociais</option>
              </select>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Score do cliente:</label>
              <input 
                type="text" 
                placeholder="Ex: 850" 
                value={formData.scoreCliente}
                onChange={(e) => setFormData(prev => ({ ...prev, scoreCliente: e.target.value }))}
                style={inputStyleVisivel}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Vencimento da fatura:</label>
              <select 
                value={formData.vencimentoFatura}
                onChange={(e) => setFormData(prev => ({ ...prev, vencimentoFatura: e.target.value }))}
                style={inputStyleVisivel}
              >
                <option value="Dia 01">Dia 01</option>
                <option value="Dia 06">Dia 06</option>
                <option value="Dia 10">Dia 10</option>
                <option value="Dia 15">Dia 15</option>
                <option value="Dia 17">Dia 17</option>
                <option value="Dia 21">Dia 21</option>
                <option value="Dia 26">Dia 26</option>
                <option value="Dia 28">Dia 28</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div style={{ 
          display: 'flex', justifyContent: 'flex-end', gap: 12, 
          paddingTop: 16, borderTop: '1px solid var(--line, #332a4d)' 
        }}>
          <button 
            type="button" 
            className="btn sm"
            onClick={() => {
              if (etapaInicial !== 'MENU' && onVoltar) onVoltar();
              else setEtapa('MENU');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px' }}
          >
            <ArrowLeft size={15} /> Voltar
          </button>

          <button 
            type="submit" 
            className="btn sm"
            style={{ 
              background: '#84cc16', color: '#fff', border: 'none', 
              display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 20px', fontWeight: 700 
            }}
          >
            Salvar cliente
            <Check size={16} strokeWidth={3} />
          </button>
        </div>

      </form>
    </div>
  );
}