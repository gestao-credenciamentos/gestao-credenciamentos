import "../styles/login.css";

export default function Login({ onLogin }) {
  function handleSubmit(e) {
    e.preventDefault();
    onLogin();
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>AMVAP SAÚDE</h2>

        <input placeholder="Usuário" required />
        <input type="password" placeholder="Senha" required />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
