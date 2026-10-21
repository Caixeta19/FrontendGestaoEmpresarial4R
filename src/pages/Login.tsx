import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext.jsx';
import { login } from '../services/vendasApi';

export default function Login({ setSession }) {
  const [filial, setFilial] = useState('Valparaíso de Goiás — Matriz');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  async function entrar() {
    if (!user.trim() || !pass.trim()) {
      showToast('Preencha usuário e senha para continuar.', true);
      return;
    }
    try {
      // A função de login do seu vendasApi deve retornar o objeto com token, primeiroAcesso, etc.
      const u = await login(user.trim(), pass);
      
      const dadosSessao = {
        token: u.token,
        id: u.id,
        filial,
        user: u.email || user,
        email: u.email,
        nome: u.nome || 'Usuário',
        role: `${u.cargo || 'Vendedor'} · ${filial}`
      };

      // Salva a sessão temporariamente
      setSession(dadosSessao);

      // Se for o primeiro acesso, redireciona obrigatoriamente para a tela de troca de senha
      if (u.primeiroAcesso) {
        showToast('Primeiro acesso detectado. Altere sua senha para continuar.', false);
        navigate('/primeiro-acesso');
      } else {
        navigate('/');
      }
    } catch (e) {
      showToast(e?.status === 401 ? 'E-mail ou senha inválidos.' : (e?.mensagem || 'Falha ao entrar.'), true);
    }
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
          <div className="login-foot">Acesso restrito a usuários cadastrados.</div>
        </div>
      </div>
    </div>
  );
}