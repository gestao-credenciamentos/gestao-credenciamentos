import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// ================= BUSCA CNPJ =================
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
  // ================= LOGIN SIMPLES =================
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

  useEffect(() => {
    carregarProcessos();
    carregarPrestadores();
  }, []);

  async function carregarProcessos() {
    const { data, error } = await supabase
      .from("processos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProcessos(data || []);
  }

  async function carregarPrestadores() {
    const { data, error } = await supabase
      .from("prestadores")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPrestadores(data || []);
  }

  // ================= FORM PROCESSO =================
  const [formProcesso, setFormProcesso] = useState({
    numeroProcesso: "",
    numeroCredenciamento: "",
    status: "Aberto",
    categoria: "Consultas",
    dataAbertura: "",
    dataEncerramento: "",
    procedimentosVinculados: [],
  });

  const handleProcessoChange = (e) => {
    const { name, value } = e.target;
    setFormProcesso({ ...formProcesso, [name]: value });
  };

  async function addProcesso(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("processos")
      .insert([formProcesso]);

    if (error) {
      alert("Erro ao salvar processo");
      return;
    }

    setFormProcesso({
      numeroProcesso: "",
      numeroCredenciamento: "",
      status: "Aberto",
      categoria: "Consultas",
      dataAbertura: "",
      dataEncerramento: "",
      procedimentosVinculados: [],
    });

    carregarProcessos();
  }

  async function deleteProcesso(id) {
    if (!window.confirm("Deseja excluir este processo?")) return;
    await supabase.from("processos").delete().eq("id", id);
    carregarProcessos();
  }

  // ================= FORM PRESTADOR =================
  const [formPrestador, setFormPrestador] = useState({
    nome: "",
    cnpj: "",
    local: "",
  });

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

  async function addPrestador(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("prestadores")
      .insert([formPrestador]);

    if (error) {
      alert("Erro ao salvar prestador");
      return;
    }

    setFormPrestador({ nome: "", cnpj: "", local: "" });
    carregarPrestadores();
  }

  // ================= LOGIN =================
  if (!loggedIn) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleLogin} style={{ padding: 30, border: "1px solid #ccc", borderRadius: 10 }}>
          <h2>AMVAP SAÚDE</h2>
          <input placeholder="Usuário" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} /><br /><br />
          <input type="password" placeholder="Senha" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} /><br /><br />
          <button type="submit">Entrar</button>
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

      <nav style={{ padding: 10 }}>
        <button onClick={() => setSection("processos")}>Processos</button>{" "}
        <button onClick={() => setSection("prestadores")}>Prestadores</button>
      </nav>

      {section === "processos" && (
        <div style={{ padding: 20 }}>
          <h2>Processos</h2>
          <form onSubmit={addProcesso}>
            <input
              name="numeroProcesso"
              placeholder="Número do Processo"
              value={formProcesso.numeroProcesso}
              onChange={handleProcessoChange}
            />
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
        <div style={{ padding: 20 }}>
          <h2>Prestadores</h2>
          <form onSubmit={addPrestador}>
            <input name="cnpj" placeholder="CNPJ" value={formPrestador.cnpj} onChange={handlePrestadorChange} />
            <input name="nome" placeholder="Razão Social" value={formPrestador.nome} onChange={handlePrestadorChange} />
            <input name="local" placeholder="Local" value={formPrestador.local} onChange={handlePrestadorChange} />
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
