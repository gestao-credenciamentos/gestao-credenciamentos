import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

/* ================= SUPABASE ================= */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [processos, setProcessos] = useState([]);

  const [form, setForm] = useState({
    numeroProcesso: "",
    numeroCredenciamento: "",
    dataInicioVigencia: "",
    dataFimVigencia: "",
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase
      .from("processos")
      .select("*")
      .order("created_at", { ascending: false });

    setProcessos(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar(e) {
    e.preventDefault();

    await supabase.from("processos").insert([form]);

    setForm({
      numeroProcesso: "",
      numeroCredenciamento: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
    });

    carregar();
  }

  async function excluir(id) {
    if (!window.confirm("Excluir processo?")) return;
    await supabase.from("processos").delete().eq("id", id);
    carregar();
  }

  return (
    <div>
      <header style={{ background: "#1e90ff", padding: 20, color: "#fff" }}>
        <h1>AMVAP SAÚDE – Gestão de Credenciamentos</h1>
      </header>

      <main style={{ padding: 20 }}>
        <h2>Processos</h2>

        <form onSubmit={salvar}>
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

        <ul>
          {processos.map((p) => (
            <li key={p.id}>
              <strong>{p.numeroProcesso}</strong> — Credenciamento{" "}
              {p.numeroCredenciamento} — Vigência {p.dataInicioVigencia} até{" "}
              {p.dataFimVigencia}
              <button onClick={() => excluir(p.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
