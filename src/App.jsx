import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

/* ======================================================
   SUPABASE
   (usa variáveis do Vercel/Vite)
   ====================================================== */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/* ======================================================
   BUSCA CNPJ (BrasilAPI)
   ====================================================== */
async function fetchCNPJ(cnpj) {
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {
    return null;
  }
}

export default function App() {
  /* ================= LOGIN SIMPLES ================= */
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === "admin" && loginPass === "admin") setLoggedIn(true);
    else alert("Usuário ou senha inválidos");
  };

  /* ================= MENU ================= */
  const [section, setSection] = useState("processos");

  /* ================= DADOS ================= */
  const [processos, setProcessos] = useState([]);
  const [prestadores, setPrestadores] = useState([]);

  useEffect(() => {
    carregarProcessos();
    carregarPrestadores();
  }, []);

  async function carregarProcessos() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("processos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data)) setProcessos(data);
  }

  async function carregarPrestadores() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("prestadores")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data)) setPrestadores(data);
  }

  /* ================= FORM PROCESSO ================= */
  const [formProcesso, setFormProcesso] = useState({
    numeroProcesso: "",
    numeroCredenciamento: "",
    dataInicioVigencia: "",
    dataFimVigencia: "",
  });

  const handleProcessoChange = (e) => {
    const { name, value } = e.target;
    setFormProcesso((p) => ({ ...p, [name]: value }));
  };

  async function addProcesso(e) {
    e.preventDefault();
    if (!supabase) return alert("Supabase não configurado");
    const { error } = await supabase.from("processos").insert([formProcesso]);
    if (error) return alert("Erro ao salvar processo");
    setFormProcesso({
      numeroProcesso: "",
      numeroCredenciamento: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
    });
    carregarProcessos();
  }

  async function deleteProcesso(id) {
    if (!window.confirm("Deseja excluir este processo?")) return;
    await supabase.from("processos").delete().eq("id", id);
    carregarProcessos();
  }

  /* ================= FORM PRESTADOR ================= */
  const [formPrestador, setFormPrestador] = useState({
    nome: "",
    cnpj: "",
    local: "",
  });

  const handlePrestadorChange = async (e) => {
    const { name, value } = e.target;
    setFormPrestador((p) => ({ ...p, [name]: value }));

    if (name === "cnpj" && value.replace(/\D/g, "").length === 14) {
      const data = await fetchCNPJ(value.replace(/\D/g, ""));
      if (data) {
        setFormPrestador((p) => ({
          ...p,
          nome: data.razao_social || p.nome,
          local: data.municipio || p.local,
        }));
      }
    }
  };

  async function addPrestador(e) {
    e.preventDefault();
    if (!supabase) return alert("Supabase não configurado");
    const { error } = await supabase.from("prestadores").insert([formPrestador]);
    if (error) return alert("Erro ao salvar prestador");
    setFormPrestador({ nome: "", cnpj: "", local: "" });
    carregarPrestadores();
  }

  /* ================= LOGIN ================= */
  if (!loggedIn) {
    return (
      <div className="login">
        <form onSubmit={handleLogin} className="login-card">
          <h2>AMVAP SAÚDE</h2>
          <input
            placeholder="Usuário"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
          />
          <button>Entrar</button>
        </form>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div>
      <header className="header">
        <h1>AMVAP SAÚDE – Gestão de Credenciamentos</h1>
      </header>

      <nav className="menu">
        <button onClick={() => setSection("processos")}>Processos</button>
        <button onClick={() => setSection("prestadores")}>Prestadores</button>
      </nav>

      {section === "processos" && (
        <div className="card">
          <h2>Processos</h2>

          <form onSubmit={addProcesso} className="form-grid">
            <input
              name="numeroProcesso"
              placeholder="Número do Processo"
              value={formProcesso.numeroProcesso}
              onChange={handleProcessoChange}
              required
            />
            <input
              name="numeroCredenciamento"
              placeholder="Número do Credenciamento"
              value={formProcesso.numeroCredenciamento}
              onChange={handleProcessoChange}
              required
            />
            <input
              type="date"
              name="dataInicioVigencia"
              value={formProcesso.dataInicioVigencia}
              onChange={handleProcessoChange}
              required
            />
            <input
              type="date"
              name="dataFimVigencia"
              value={formProcesso.dataFimVigencia}
              onChange={handleProcessoChange}
              required
            />
            <button>Adicionar</button>
          </form>

          <ul className="list">
            {processos.map((p) => (
              <li key={p.id}>
                <strong>{p.numeroProcesso}</strong> — Cred.:{" "}
                {p.numeroCredenciamento} — Vigência:{" "}
                {p.dataInicioVigencia} a {p.dataFimVigencia}
                <button onClick={() => deleteProcesso(p.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "prestadores" && (
        <div className="card">
          <h2>Prestadores</h2>

          <form onSubmit={addPrestador} className="form-grid">
            <input
              name="cnpj"
              placeholder="CNPJ"
              value={formPrestador.cnpj}
              onChange={handlePrestadorChange}
              required
            />
            <input
              name="nome"
              placeholder="Razão Social"
              value={formPrestador.nome}
              onChange={handlePrestadorChange}
              required
            />
            <input
              name="local"
              placeholder="Local de Atendimento"
              value={formPrestador.local}
              onChange={handlePrestadorChange}
              required
            />
            <button>Adicionar</button>
          </form>

          <ul className="list">
            {prestadores.map((p) => (
              <li key={p.id}>
                {p.nome} — {p.cnpj} ({p.local})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
