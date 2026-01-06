import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* ================= SUPABASE ================= */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  /* ================= STATE ================= */
  const [processos, setProcessos] = useState([]);
  const [form, setForm] = useState({
    numeroProcesso: "",
    numeroCredenciamento: "",
    dataInicioVigencia: "",
    dataFimVigencia: "",
  });

  /* ================= LOAD ================= */
  useEffect(() => {
    carregarProcessos();
  }, []);

  async function carregarProcessos() {
    const { data, error } = await supabase
      .from("processos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProcessos(data || []);
  }

  /* ================= HANDLERS ================= */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvarProcesso(e) {
    e.preventDefault();

    const { error } = await supabase.from("processos").insert([form]);
    if (error) {
      alert("Erro ao salvar processo");
      return;
    }

    setForm({
      numeroProcesso: "",
      numeroCredenciamento: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
    });

    carregarProcessos();
  }

  async function excluirProcesso(id) {
    if (!window.confirm("Deseja excluir este processo?")) return;
    await supabase.from("processos").delete().eq("id", id);
    carregarProcessos();
  }

  /* ================= UI ================= */
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          background: "#1e90ff",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h1>AMVAP SAÚDE – Gestão de Credenciamentos</h1>
      </header>

      <main style={{ padding: "20px" }}>
        <h2>Processos</h2>

        <form
          onSubmit={salvarProcesso}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <input
            name="numeroProcesso"
            placeholder="Número do Processo"
            value={form.numeroProcesso}
            onChange={handleChange}
            required
          />

          <input
            name="numeroCredenciamento"
            placeholder="Número do Credenciamento"
            value={form.numeroCredenciamento}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="dataInicioVigencia"
            value={form.dataInicioVigencia}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="dataFimVigencia"
            value={form.dataFimVigencia}
            onChange={handleChange}
            required
          />

          <button type="submit">Adicionar</button>
        </form>

        <table
          width="100%"
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse" }}
        >
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>Processo</th>
              <th>Credenciamento</th>
              <th>Início Vigência</th>
              <th>Fim Vigência</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {processos.map((p) => (
              <tr key={p.id}>
                <td>{p.numeroProcesso}</td>
                <td>{p.numeroCredenciamento}</td>
                <td>{p.dataInicioVigencia}</td>
                <td>{p.dataFimVigencia}</td>
                <td>
                  <button onClick={() => excluirProcesso(p.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {processos.length === 0 && (
              <tr>
                <td colSpan="5" align="center">
                  Nenhum processo cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
