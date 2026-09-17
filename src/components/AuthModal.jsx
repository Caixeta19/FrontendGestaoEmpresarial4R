import { useState } from 'react';

export default function AuthModal({ open, onClose, onConfirm }) {
  const [pass, setPass] = useState('');

  if (!open) return null;

  return (
    <div className="modal-overlay show">
      <div className="modal">
        <h3>Autenticação do vendedor</h3>
        <p>Confirme sua senha para aplicar descontos ou alterações sensíveis nesta venda.</p>
        <div className="field">
          <label>Vendedor</label>
          <input type="text" value="Guilherme Caixeta" disabled />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn solid"
            onClick={() => {
              onConfirm();
              setPass('');
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
