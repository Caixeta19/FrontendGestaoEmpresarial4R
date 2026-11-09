import { useEffect, useState } from 'react';

/**
 * Autenticação do vendedor para finalizar a venda ou mudar o status. A senha fica só no estado deste componente e é
 * limpa ao fechar. `children` é o resumo da operação, mostrado acima dos campos.
 */
export default function AuthModal({
  open,
  titulo = 'Autenticação do vendedor',
  textoConfirmar = 'Finalizar venda',
  textoFechar = 'Cancelar',
  vendedores = [],
  vendedorInicial = null,
  onConfirmar,
  onClose,
  erro = '',
  carregando = false,
  children,
}) {
  const [vendedorId, setVendedorId] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    if (!open) setSenha('');
  }, [open]);

  useEffect(() => {
    setVendedorId(open && vendedorInicial != null ? String(vendedorInicial) : '');
  }, [open, vendedorInicial]);

  if (!open) return null;

  const vendedor = vendedores.find((v) => String(v.id) === vendedorId);
  const podeConfirmar = Boolean(vendedor && senha) && !carregando;

  const confirmar = (e) => {
    e.preventDefault();
    if (podeConfirmar) onConfirmar({ email: vendedor.email || vendedor.login, senha });
  };

  return (
    <div className="modal-overlay show">
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-titulo" onSubmit={confirmar}>
        <h3 id="auth-modal-titulo">{titulo}</h3>
        {children}
        <div className="field">
          <label htmlFor="auth-modal-vendedor">Vendedor</label>
          <select
            id="auth-modal-vendedor"
            value={vendedorId}
            disabled={carregando}
            onChange={(e) => setVendedorId(e.target.value)}
          >
            <option value="">Escolha...</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>{v.nome}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="auth-modal-senha">Senha</label>
          <input
            id="auth-modal-senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            autoFocus
            value={senha}
            disabled={carregando}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        {erro && (
          <div role="alert" style={{ color: 'var(--bad, #ef4444)', fontSize: 13, fontWeight: 600, marginTop: 12 }}>
            {erro}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn ghost" disabled={carregando} onClick={onClose}>{textoFechar}</button>
          <button type="submit" className="btn solid" disabled={!podeConfirmar}>
            {carregando ? 'Aguarde...' : textoConfirmar}
          </button>
        </div>
      </form>
    </div>
  );
}
