import { auditDemo, rbacDemo } from '../data/demoData.js';

export default function Config() {
  return (
    <section className="view">
      <div className="topbar">
        <div>
          <h1>Configurações</h1>
          <div className="sub">Perfis de acesso e auditoria (Épico 0)</div>
        </div>
        <div className="topbar-actions"><button className="btn solid">+ Novo perfil</button></div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Perfis (RBAC)</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Perfil</th><th>Usuários</th><th>Permissões</th></tr></thead>
            <tbody>
              {rbacDemo.map((r) => (
                <tr key={r.perfil}>
                  <td><b>{r.perfil}</b></td>
                  <td className="mono">{r.usuarios}</td>
                  <td>{r.perm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Log de auditoria</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Data/hora</th><th>Usuário</th><th>Ação</th><th>Módulo</th></tr></thead>
            <tbody>
              {auditDemo.map((a, idx) => (
                <tr key={idx}>
                  <td className="mono">{a.dt}</td>
                  <td>{a.user}</td>
                  <td>{a.acao}</td>
                  <td><span className="badge neutral">{a.mod}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
