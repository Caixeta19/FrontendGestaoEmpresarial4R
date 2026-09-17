import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext.jsx';

export default function Login({ onLogin }) {
  const [filial, setFilial] = useState('Valparaíso de Goiás — Matriz');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  function entrar() {
    if (!user.trim() || !pass.trim()) {
      showToast('Preencha usuário e senha para continuar.', true);
      return;
    }
    onLogin({ filial, user });
    navigate('/');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') entrar();
  }

  return (
    <div id="login-screen">
      <div className="login-hero">
        <div className="wordmark">
          <div className="mark">4R</div>
          <span>Solutions</span>
        </div>
        <div className="hero-copy">
          <div className="kicker">GESTÃO INTEGRADA · VAREJO DE TELECOM</div>
          <h1>Toda a operação da revenda em um lugar só.</h1>
          <p>Vendas, estoque, financeiro e relatórios em um único sistema, feito para o dia a dia da revenda.</p>
        </div>
        <div className="hero-stats">
          <div><b>90</b><span>filiais ativas</span></div>
          <div><b>1.2k</b><span>vendas/mês</span></div>
          <div><b>99.8%</b><span>uptime</span></div>
        </div>
      </div>
      <div className="login-form-wrap">
        <div className="login-form">
          <h2>Bem-vindo ao 4R Solutions</h2>
          <p>Use suas credenciais para acessar o sistema.</p>
          <div className="field">
            <label>Usuário ou Email</label>
            <input
              type="text"
              placeholder="Digite seu email ou login"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <div className="pw-row">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPass((v) => !v)}>
                {showPass ? 'ocultar' : 'mostrar'}
              </button>
            </div>
          </div>
          <button type="button" className="btn-primary" onClick={entrar}>
            Entrar
          </button>
          <div className="login-foot">Ambiente de demonstração — qualquer usuário e senha entram no sistema.</div>
        </div>
      </div>
    </div>
  );
}
