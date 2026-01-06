import { useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/dashboard.css";

export default function Processos() {
  const [form, setForm] = useState({
    numeroProcesso: "",
    numeroCredenciamento: "",
    inicio: "",
    fim: "",
  });

  async function salvarProcesso() {
    const { error } = await supabase.from("processos").insert([{
      numero_processo: form.numeroProcesso,
      numero_credenciamento: form.numeroCredenciamento,
      status: "ativo",
      data_abertura: form.inicio || null,
      data_encerramento: form.fim || null,
      procedimentos: [],
    }]);

    if (error) {
      alert("Erro ao salvar processo");
      console.error(error);
      return;
    }

    alert("Processo salvo!");
  }

  return (
    <div>
      <h2>Processos</h2>

      <input placeholder="Número do Processo"
        onChange={e => setForm({ ...form, numeroProcesso: e.target.value })}
      />
      <input placeholder="Número do Credenciamento"
        onChange={e => setForm({ ...form, numeroCredenciamento: e.target.value })}
      />
      <input type="date"
        onChange={e => setForm({ ...form, inicio: e.target.value })}
      />
      <input type="date"
        onChange={e => setForm({ ...form, fim: e.target.value })}
      />

      <button onClick={salvarProcesso}>Adicionar</button>
    </div>
  );
}
