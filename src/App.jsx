import { useState, useEffect } from "react";
import { supabase } from "./supabase";

/* ===============================
   BUSCAR CNPJ – BRASIL API
================================ */
async function fetchCNPJ(cnpj) {
  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`
    );
    if (!response.ok) throw new Error("CNPJ inválido");
    return await response.json();
  } catch {
    return null;
  }
}

function App() {
  /* ===============================
     LOGIN
  ================================ */
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved
      ? JSON.parse(saved)
      : [{ username: "admin", password: "admin" }];
  });

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(
      (u) =>
        u.username === loginUser.trim() &&
        u.password === loginPass.trim()
    );
    if (found) setLoggedIn(true);
    else alert("Usuário ou senha incorretos!");
  };

  /* ===============================
     MENU
  ================================ */
  const [section, setSection] = useState("processos");

  /* ===============================
     ESTADOS (LOCAL + SUPABASE)
  ================================ */
  const [processos, setProcessos] = useState(() =>
    JSON.parse(localStorage.getItem("processos") || "[]")
  );

  useEffect(() => {
    localStorage.setItem("processos", JSON.stringify(processos));
  }, [processos]);

  /* ===============================
     MODAIS
  ================================ */
  const [modalOpen, setModalOpen] = useState({
    processo: false,
  });

  /* ===============================
     FORM PROCESSO
  ================================ */
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

  /* ===============================
     ADD PROCESSO (LOCAL + SUPABASE)
  ================================ */
  const addProcesso = async (e) => {
    e.preventDefault();

    /* 1️⃣ SALVA LOCAL (como antes) */
    setProcessos([formProcesso, ...processos]);

    /* 2️⃣ SALVA NO SUPABASE (NOVO) */
    const { error } = await supabase.from("processos").insert([
      {
        numero_processo: formProcesso.numeroProcesso,
        numero_credenciamento: formProcesso.numeroCredenciamento,
        status: formProcesso.status,
        categoria: formProcesso.categoria,
        data_abertura: formProcesso.dataAbertura || null,
        data_encerramento: formProcesso.dataEncerramento || null,
        procedimentos: formProcesso.procedimentosVinculados,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      alert("Erro ao salvar no banco");
      return;
    }

    /* 3️⃣ LIMPA FORM */
    setFormProcesso({
      numeroProcesso: "",
      numeroCredenciamento: "",
      status: "Aberto",
      categoria: "Consultas",
      dataAbertura: "",
      dataEncerramento: "",
      procedimentosVinculados: [],
    });

    setModalOpen({ ...modalOpen, processo: false });
  };

  /* ===============================
     ESTILOS (INALTERADOS)
  ================================ */
  const styles = {
    header: {
      backgroundColor: "#1e90ff",
      color: "white",
      padding: "20px",
      textAlign: "center",
    },
    nav: {
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      margin: "15px 0",
    },
    navButton: {
      padding: "10px 15px",
      backgroundColor: "#1e90ff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    container: {
      padding: "20px",
      position: "relative",
    },
    novoBtn: {
      position: "absolute",
      top: "0",
      right: "0",
      padding: "10px 15px",
      backgroundColor: "orange",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  /* ===============================
     LOGIN TELA
  ================================ */
  if (!loggedIn) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#e6f0ff",
        }}
      >
        <form onSubmit={handleLogin}>
          <h2>AMVAP SAÚDE - GESTÃO DE CREDENCIAMENTOS</h2>
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
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  /* ===============================
     TELA PRINCIPAL
  ================================ */
  return (
    <div>
      <header style={styles.header}>
        <h1>AMVAP SAÚDE - Gestão de Credenciamentos</h1>
      </header>

      <nav style={styles.nav}>
        <button
          style={styles.navButton}
          onClick={() => setSection("processos")}
        >
          Processos Licitatórios
        </button>
      </nav>

      <div style={styles.container}>
        <button
          style={styles.novoBtn}
          onClick={() => setModalOpen({ processo: true })}
        >
          Novo Processo
        </button>

        {modalOpen.processo && (
          <form onSubmit={addProcesso}>
            <input
              name="numeroProcesso"
              placeholder="Número do Processo"
              value={formProcesso.numeroProcesso}
              onChange={handleProcessoChange}
            />
            <input
              name="numeroCredenciamento"
              placeholder="Número do Credenciamento"
              value={formProcesso.numeroCredenciamento}
              onChange={handleProcessoChange}
            />
            <button type="submit">Salvar</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
