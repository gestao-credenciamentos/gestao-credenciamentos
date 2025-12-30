import { useState, useEffect } from "react";

// Buscar CNPJ via BrasilAPI
async function fetchCNPJ(cnpj) {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!response.ok) throw new Error("CNPJ inválido");
    return await response.json();
  } catch {
    return null;
  }
}

function App() {
  // ---------------- LOGIN ----------------
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [{ username: "admin", password: "admin" }];
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

  // ---------------- MENU ----------------
  const [section, setSection] = useState("processos");

  // ---------------- ESTADOS PERSISTENTES ----------------
  const [processos, setProcessos] = useState(() =>
    JSON.parse(localStorage.getItem("processos") || "[]")
  );
  const [prestadores, setPrestadores] = useState(() =>
    JSON.parse(localStorage.getItem("prestadores") || "[]")
  );
  const [procedimentos, setProcedimentos] = useState(() =>
    JSON.parse(localStorage.getItem("procedimentos") || "[]")
  );
  const [credenciados, setCredenciados] = useState(() =>
    JSON.parse(localStorage.getItem("credenciados") || "[]")
  );

  useEffect(() => {
    localStorage.setItem("processos", JSON.stringify(processos));
  }, [processos]);

  useEffect(() => {
    localStorage.setItem("prestadores", JSON.stringify(prestadores));
  }, [prestadores]);

  useEffect(() => {
    localStorage.setItem("procedimentos", JSON.stringify(procedimentos));
  }, [procedimentos]);

  useEffect(() => {
    localStorage.setItem("credenciados", JSON.stringify(credenciados));
  }, [credenciados]);

  // ---------------- BACKUP ----------------
  const exportBackup = () => {
    const backup = {
      dataBackup: new Date().toISOString(),
      processos,
      prestadores,
      procedimentos,
      credenciados,
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-credenciamentos-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (
          !data.processos ||
          !data.prestadores ||
          !data.procedimentos ||
          !data.credenciados
        ) {
          alert("Arquivo de backup inválido.");
          return;
        }

        if (
          !window.confirm(
            "Esta ação substituirá TODOS os dados atuais. Deseja continuar?"
          )
        ) {
          return;
        }

        setProcessos(data.processos);
        setPrestadores(data.prestadores);
        setProcedimentos(data.procedimentos);
        setCredenciados(data.credenciados);

        alert("Backup importado com sucesso!");
      } catch {
        alert("Erro ao importar backup.");
      }
    };

    reader.readAsText(file);
  };

  // ---------------- MODAIS ----------------
  const [modalOpen, setModalOpen] = useState({
    processo: false,
    prestador: false,
    procedimento: false,
    credenciado: false,
  });

  // ---------------- FORMULÁRIOS ----------------
  const [formProcesso, setFormProcesso] = useState({
    numeroProcesso: "",
    numeroCredenciamento: "",
    status: "Aberto",
    categoria: "Consultas",
    dataAbertura: "",
    dataEncerramento: "",
    procedimentosVinculados: [],
  });

  const [formPrestador, setFormPrestador] = useState({
    nome: "",
    cnpj: "",
    local: "",
  });

  const [formProcedimento, setFormProcedimento] = useState({
    codigo: "",
    nome: "",
    tipo: "Consultas",
    especificacoes: [{ codigo: "", descricao: "" }],
  });

  const [formCredenciado, setFormCredenciado] = useState({
    processo: "",
    prestador: "",
    procedimentos: [],
    data: "",
  });

  // ---------------- FILTROS ----------------
  const [filtroPrestador, setFiltroPrestador] = useState("");
  const [filtroProcesso, setFiltroProcesso] = useState("");

  // ---------------- FUNÇÕES ----------------
  const handleProcessoChange = (e) => {
    const { name, value } = e.target;
    setFormProcesso({ ...formProcesso, [name]: value });
  };

  const handlePrestadorChange = async (e) => {
    const { name, value } = e.target;
    setFormPrestador({ ...formPrestador, [name]: value });

    if (name === "cnpj" && value.replace(/\D/g, "").length === 14) {
      const data = await fetchCNPJ(value.replace(/\D/g, ""));
      if (data) {
        setFormPrestador((prev) => ({
          ...prev,
          nome: data.razao_social || prev.nome,
          local: data.municipio || prev.local,
        }));
      }
    }
  };

  // ---------------- CRUD ----------------
  const addProcesso = (e) => {
    e.preventDefault();
    setProcessos([formProcesso, ...processos]);
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

  const deleteProcesso = (i) => {
    if (window.confirm("Deseja excluir este processo?")) {
      const tmp = [...processos];
      tmp.splice(i, 1);
      setProcessos(tmp);
    }
  };

  // ---------------- ESTILOS ----------------
  const styles = {
    body: { fontFamily: "sans-serif" },
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
  };

  // ---------------- LOGIN ----------------
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
        <form
          onSubmit={handleLogin}
          style={{
            border: "1px solid #ddd",
            padding: "30px",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#1e90ff" }}>
            AMVAP SAÚDE - GESTÃO DE CREDENCIAMENTOS
          </h2>
          <input
            type="text"
            placeholder="Usuário"
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Senha"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
          />
          <br />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  // ---------------- RENDER PRINCIPAL ----------------
  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <h1>AMVAP SAÚDE - Gestão de Credenciamentos</h1>

        <button onClick={exportBackup}>📦 Backup</button>

        <input
          type="file"
          accept=".json"
          id="importBackup"
          style={{ display: "none" }}
          onChange={importBackup}
        />

        <button onClick={() => document.getElementById("importBackup").click()}>
          📥 Importar Backup
        </button>
      </header>

      <nav style={styles.nav}>
        <button
          style={styles.navButton}
          onClick={() => setSection("processos")}
        >
          Processos Licitatórios
        </button>
        <button
          style={styles.navButton}
          onClick={() => setSection("prestadores")}
        >
          Prestadores
        </button>
      </nav>
    </div>
  );
}

export default App;
