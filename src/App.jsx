import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ================= CNPJ =================
async function fetchCNPJ(cnpj) {
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {
    return null;
  }
}

function App() {
  // ================= LOGIN (SIMPLES) =================
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === "admin" && loginPass === "admin") {
      setLoggedIn(true);
    } else {
      alert("Usuário ou senha inválidos");
    }
  };

  // ================= MENU =================
  const [section, setSection] = useState("processos");

  // ================= DADOS (SUPABASE) =================
  const [processos, setProcessos] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [credenciados, setCredenciados] = useState([]);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    await Promise.all([
      fetchProcessos(),
      fetchPrestadores(),
      fetchProcedimentos(),
      fetchCredenciados(),
    ]);
  }

  async function fetchProcessos() {
    const { data } = await supabase.from("processos").select("*").order("created_at", { ascending: false });
    setProcessos(data || []);
  }

  async function fetchPrestadores() {
    const { data } = await supabase.from("prestadores").select("*").order("created_at", { ascending: false });
    setPrestadores(data || []);
  }

  async function fetchProcedimentos() {
    const { data } = await supabase.from("procedimentos").select("*").order("created_at", { ascending: false });
    setProcedimentos(data || []);
  }

  async function fetchCredenciados() {
    const { data } = await supabase.from("credenciados").select("*").order("created_at", { ascending: false });
    setCredenciados(data || []);
  }

  // ================= FORMULÁRIOS =================
  const [formProcesso, setForm = useState({
    numeroProcesso: "",
    numeroCredenciamento: "",
    status: "Aberto",
    categoria: "Consultas",
    dataAbertura: "",
    dataEncerramento: "",
    procedimentosVinculados: [],
  })][0];

  const [formPrestador, setFormPrestador] = useState({
    nome: "",
    cnpj: "",
    local: "",
  });

  // ================= CRUD =================
  async function addProcesso(e) {
    e.preventDefault();
    const { error } = await supabase.from("processos").insert([formProcesso]);
    if (error) return alert("Erro ao salvar processo");
    fetchProcessos();
  }

  async function deleteProcesso(id) {
    if (!confirm("Excluir processo?")) return;
    await supabase.from("processos").delete().eq("id", id);
    fetchProcessos();
  }

  async function addPrestador(e) {
    e.preventDefault();
    const { error } = await supabase.from("prestadores").insert([formPrestador]);
    if (error) return alert("Erro ao salvar prestador");
    fetchPrestadores();
  }

  const handlePrestadorChange = async (e) => {
    const { name, value } = e.target;
    setFormPrestador({ ...formPrestador, [name]: value });

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

  // ================= LOGIN =================
  if (!loggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <form onSubmit={handleLogin} style={{ padding: 30, border: "1px solid #ccc", borderRadius: 10 }}>
          <h2>AMVAP SAÚDE</h2>
          <input placeholder="Usuário" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} /><br />
          <input type="password" placeholder="Senha" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} /><br />
          <button>Entrar</button>
        </form>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div>
      <header style={{ background: "#1e90ff", color: "#fff", padding: 20 }}>
        <h1>AMVAP SAÚDE – Gestão de Credenciamentos</h1>
      </header>

      <nav style={{ display: "flex", gap: 10, padding: 10 }}>
        <button onClick={() => setSection("processos")}>Processos</button>
        <button onClick={() => setSection("prestadores")}>Prestadores</button>
      </nav>

      {section === "processos" && (
        <div>
          <h2>Processos</h2>
          <form onSubmit={addProcesso}>
            <input placeholder="Número Processo" onChange={(e) => setFormProcesso({ ...formProcesso, numeroProcesso: e.target.value })} />
            <button>Adicionar</button>
          </form>

          <ul>
            {processos.map((p) => (
              <li key={p.id}>
                {p.numeroProcesso}
                <button onClick={() => deleteProcesso(p.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "prestadores" && (
        <div>
          <h2>Prestadores</h2>
          <form onSubmit={addPrestador}>
            <input name="cnpj" placeholder="CNPJ" onChange={handlePrestadorChange} />
            <input name="nome" placeholder="Razão Social" onChange={handlePrestadorChange} />
            <input name="local" placeholder="Local" onChange={handlePrestadorChange} />
            <button>Adicionar</button>
          </form>

          <ul>
            {prestadores.map((p) => (
              <li key={p.id}>{p.nome} – {p.cnpj}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
