import React, { useState } from 'react';
import { useToast } from '../components/ToastContext.jsx';

export default function EntradaEstoque() {
  const showToast = useToast();
  
  const [estoqueAvancado, setEstoqueAvancado] = useState('Nao');
  const [pdv, setPdv] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [comprovante, setComprovante] = useState('');
  const [numComprovante, setNumComprovante] = useState('');
  const [valorFrete, setValorFrete] = useState('');
  const [arquivoCsv, setArquivoCsv] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Produtos carregados com sucesso no estoque!');
  };

  return (
    <section className="view">
      <div className="topbar">
        <div>
          <h1>Carregar produtos na compra</h1>
          <div className="sub">Registro de recebimento e importação de estoque (US-202)</div>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="field">
            <label>Compra Estoque Avançado?</label>
            <select value={estoqueAvancado} onChange={(e) => setEstoqueAvancado(e.target.value)}>
              <option value="Nao">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </div>

          <div className="field">
            <label>PDV:</label>
            <select value={pdv} onChange={(e) => setPdv(e.target.value)}>
              <option value="">Escolha ...</option>
              <option value="1">Filial Principal (DP01)</option>
              <option value="2">Filial Shopping</option>
            </select>
          </div>

          <div className="field">
            <label>Fornecedor:</label>
            <input 
              type="text" 
              placeholder="Digite as duas primeiras letras para iniciar a busca." 
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Comprovante:</label>
            <select value={comprovante} onChange={(e) => setComprovante(e.target.value)}>
              <option value="">Escolha ...</option>
              <option value="Nota Fiscal">Nota Fiscal</option>
              <option value="Recibo">Recibo</option>
            </select>
          </div>

          <div className="field">
            <label>Nº comprovante:</label>
            <input 
              type="text" 
              placeholder="Número da NF ou documento" 
              value={numComprovante}
              onChange={(e) => setNumComprovante(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Valor frete:</label>
            <input 
              type="text" 
              placeholder="R$ 0,00" 
              value={valorFrete}
              onChange={(e) => setValorFrete(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Arquivo (CSV):</label>
            <input 
              type="file" 
              accept=".csv, .txt, .xlsx"
              onChange={(e) => setArquivoCsv(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn solid" style={{ marginTop: '20px', width: '100%' }}>
            Processar e Carregar Estoque
          </button>
        </form>
      </div>
    </section>
  );
}