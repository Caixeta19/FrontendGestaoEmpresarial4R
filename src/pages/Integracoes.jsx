import { useState } from 'react';
import { useToast } from '../components/ToastContext.jsx';

export default function Integracoes() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const showToast = useToast();

  return (
    <section className="view">
      <div className="topbar">
        <div>
          <h1>Integração Meta</h1>
          <div className="sub">WhatsApp / Instagram via n8n e webhooks (Épico 5)</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Status da conexão</h3></div>
        <div className="auth-row" style={{ marginBottom: 14 }}>
          <div className="txt"><b>Webhook Meta Business</b><span>Não configurado</span></div>
          <span className="badge neutral">Desconectado</span>
        </div>
        <div className="field">
          <label>URL do endpoint (n8n)</label>
          <input type="text" placeholder="https://n8n.vivo4redes.com.br/webhook/meta" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="field">
          <label>Token de verificação</label>
          <input type="text" placeholder="Token gerado no Meta Business Manager" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <button className="btn solid" onClick={() => showToast('Conexão com o Meta Business enviada.')}>Conectar</button>
      </div>
    </section>
  );
}
