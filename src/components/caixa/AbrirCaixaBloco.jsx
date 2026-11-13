import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import FormularioAbertura from './FormularioAbertura';
import SeletorPdv from './SeletorPdv';
import { inputEstiloFormulario } from './estilos';
import { useSituacaoCaixa } from './utilCaixa';

/** Bloco "Abrir caixa": PDV + Caixa do PDV; o botão abre o formulário de abertura por forma de pagamento. */
export default function AbrirCaixaBloco({ filiais, filialInicial = '', onAberto }) {
  const [filialId, setFilialId] = useState(filialInicial);
  const [caixaPdv, setCaixaPdv] = useState('');
  const [formulario, setFormulario] = useState(false);
  const { situacao } = useSituacaoCaixa(filialId);
  const filial = filiais.find((f) => String(f.id) === String(filialId));
  const semPermissao = situacao && !situacao.podeAbrir;
  const nome = caixaPdv.trim();
  const desabilitado = !filial || !nome || semPermissao;

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '16px 18px', background: 'var(--panel-2)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <b style={{ fontSize: 14 }}>Abrir caixa de hoje</b>
      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '10px 16px', maxWidth: 560 }}>
        <label style={{ fontSize: 13.5, fontWeight: 600 }}>PDV:</label>
        <SeletorPdv filiais={filiais} value={filialId} onChange={setFilialId} rotuloVazio="Escolha..." />
        <label style={{ fontSize: 13.5, fontWeight: 600 }} htmlFor="caixa-pdv-novo">Caixa do PDV:</label>
        <div>
          <input
            id="caixa-pdv-novo"
            list="caixas-do-pdv"
            value={caixaPdv}
            onChange={(e) => setCaixaPdv(e.target.value)}
            placeholder="Ex.: CAIXA SALINAS"
            maxLength={100}
            style={{ ...inputEstiloFormulario, maxWidth: 320 }}
          />
          <datalist id="caixas-do-pdv">
            {(situacao?.caixas || []).map((c) => <option key={c.id} value={c.caixaPdv} />)}
          </datalist>
        </div>
      </div>

      {filial && situacao?.aberto && (
        <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
          Já aberto hoje em {filial.nome}: {situacao.caixas.map((c) => c.caixaPdv).join(', ')}.
        </span>
      )}
      {semPermissao && (
        <span role="alert" style={{ fontSize: 12.5, color: '#f97316', fontWeight: 600 }}>
          Seu perfil não abre caixa nessa filial: peça ao gerente da loja ou à auditoria de caixa.
        </span>
      )}

      <div>
        <button
          type="button"
          disabled={desabilitado}
          onClick={() => setFormulario(true)}
          style={{
            background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 22px',
            fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
            cursor: desabilitado ? 'not-allowed' : 'pointer', opacity: desabilitado ? 0.55 : 1,
          }}
        >
          <PlusCircle size={15} /> Abrir caixa
        </button>
      </div>

      {formulario && filial && (
        <FormularioAbertura
          filial={filial}
          caixaPdv={nome}
          onFechar={() => setFormulario(false)}
          onAberto={(caixa) => {
            setFormulario(false);
            setCaixaPdv('');
            onAberto?.(caixa);
          }}
        />
      )}
    </div>
  );
}
