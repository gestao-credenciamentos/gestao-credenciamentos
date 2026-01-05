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

  useEffect(() => { localStorage.setItem("users", JSON.stringify(users)); }, [users]);

  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(u => u.username === loginUser.trim() && u.password === loginPass.trim());
    if (found) setLoggedIn(true);
    else alert("Usuário ou senha incorretos!");
  };

  // ---------------- MENU ----------------
  const [section, setSection] = useState("processos");

  // ---------------- ESTADOS PERSISTENTES ----------------
  const [processos, setProcessos] = useState(() => JSON.parse(localStorage.getItem("processos") || "[]"));
  const [prestadores, setPrestadores] = useState(() => JSON.parse(localStorage.getItem("prestadores") || "[]"));
  const [procedimentos, setProcedimentos] = useState(() => JSON.parse(localStorage.getItem("procedimentos") || "[]"));
  const [credenciados, setCredenciados] = useState(() => JSON.parse(localStorage.getItem("credenciados") || "[]"));

  useEffect(() => { localStorage.setItem("processos", JSON.stringify(processos)); }, [processos]);
  useEffect(() => { localStorage.setItem("prestadores", JSON.stringify(prestadores)); }, [prestadores]);
  useEffect(() => { localStorage.setItem("procedimentos", JSON.stringify(procedimentos)); }, [procedimentos]);
  useEffect(() => { localStorage.setItem("credenciados", JSON.stringify(credenciados)); }, [credenciados]);

  // ---------------- MODAIS ----------------
  const [modalOpen, setModalOpen] = useState({
    processo:false, prestador:false, procedimento:false, credenciado:false
  });

  // ---------------- FORMULÁRIOS ----------------
  const [formProcesso, setFormProcesso] = useState({
    numeroProcesso:"", numeroCredenciamento:"", status:"Aberto", categoria:"Consultas", dataAbertura:"", dataEncerramento:"", procedimentosVinculados:[]
  });
  const [formPrestador, setFormPrestador] = useState({ nome:"", cnpj:"", local:"" });
  const [formProcedimento, setFormProcedimento] = useState({ codigo:"", nome:"", tipo:"Consultas", especificacoes:[{codigo:"",descricao:""}] });
  const [formCredenciado, setFormCredenciado] = useState({ processo:"", prestador:"", procedimentos:[], data:"" });

  // ---------------- FILTROS ----------------
  const [filtroPrestador, setFiltroPrestador] = useState("");
  const [filtroProcedimento, setFiltroProcedimento] = useState("");
  const [filtroCredenciado, setFiltroCredenciado] = useState("");
  const [filtroProcesso, setFiltroProcesso] = useState("");

  // ---------------- FUNÇÕES ----------------
  const handleProcessoChange = e => {
    const { name, value } = e.target;
    setFormProcesso({...formProcesso, [name]:value});
  };

  const handlePrestadorChange = async e => {
    const { name, value } = e.target;
    setFormPrestador({...formPrestador, [name]:value});
    if(name==="cnpj" && value.replace(/\D/g,"").length===14){
      const data = await fetchCNPJ(value.replace(/\D/g,""));
      if(data) setFormPrestador(prev=>({...prev, nome:data.razao_social||prev.nome, local:data.municipio||prev.local}));
    }
  };

  const handleProcedimentoChange = e => setFormProcedimento({...formProcedimento, [e.target.name]:e.target.value});
  const handleEspecificacaoChange = (i, field, value) => {
    const especs = [...formProcedimento.especificacoes];
    especs[i][field] = value;
    setFormProcedimento({...formProcedimento, especificacoes:especs});
  };
  const addEspecificacao = () => setFormProcedimento({...formProcedimento, especificacoes:[...formProcedimento.especificacoes,{codigo:"",descricao:""}]});
  const removeEspecificacao = i => { const especs=[...formProcedimento.especificacoes]; especs.splice(i,1); setFormProcedimento({...formProcedimento, especificacoes:especs});};

  const handleCredenciadoChange = e => {
    const { name, value } = e.target;
    setFormCredenciado({...formCredenciado, [name]:value});
  };

  // ---------------- CRUD ----------------
  const addProcesso = e => {
    e.preventDefault();
    setProcessos([formProcesso,...processos]);
    setFormProcesso({ numeroProcesso:"", numeroCredenciamento:"", status:"Aberto", categoria:"Consultas", dataAbertura:"", dataEncerramento:"", procedimentosVinculados:[] });
    setModalOpen({...modalOpen, processo:false});
  };
  const editProcesso = i => setFormProcesso({...processos[i]}) || setModalOpen({...modalOpen, processo:true});
  const deleteProcesso = i => { if(window.confirm("Deseja excluir este processo?")) { const tmp=[...processos]; tmp.splice(i,1); setProcessos(tmp); } };

  const addPrestador = e => {
    e.preventDefault();
    if(prestadores.some(p=>p.cnpj===formPrestador.cnpj)) { alert("CNPJ já cadastrado!"); return; }
    setPrestadores([...prestadores, formPrestador].sort((a,b)=>a.nome.localeCompare(b.nome)));
    setFormPrestador({ nome:"", cnpj:"", local:"" });
    setModalOpen({...modalOpen, prestador:false});
  };
  const editPrestador = i => setFormPrestador({...prestadores[i]}) || setModalOpen({...modalOpen, prestador:true});
  const deletePrestador = i => { if(window.confirm("Deseja excluir este prestador?")) { const tmp=[...prestadores]; tmp.splice(i,1); setPrestadores(tmp); } };

  const addProcedimento = e => { e.preventDefault(); setProcedimentos([...procedimentos, formProcedimento]); setFormProcedimento({ codigo:"", nome:"", tipo:"Consultas", especificacoes:[{codigo:"",descricao:""}] }); setModalOpen({...modalOpen, procedimento:false}); };
  const editProcedimento = i => setFormProcedimento({...procedimentos[i]}) || setModalOpen({...modalOpen, procedimento:true});
  const deleteProcedimento = i => { if(window.confirm("Deseja excluir este procedimento?")) { const tmp=[...procedimentos]; tmp.splice(i,1); setProcedimentos(tmp); } };

  const addCredenciado = e => { e.preventDefault(); setCredenciados([...credenciados, formCredenciado]); setFormCredenciado({ processo:"", prestador:"", procedimentos:[], data:"" }); setModalOpen({...modalOpen, credenciado:false}); };
  const editCredenciado = i => setFormCredenciado({...credenciados[i]}) || setModalOpen({...modalOpen, credenciado:true});
  const deleteCredenciado = i => { if(window.confirm("Deseja excluir este credenciado?")) { const tmp=[...credenciados]; tmp.splice(i,1); setCredenciados(tmp); } };

  // ---------------- ESTILOS ----------------
  const styles = {
    body:{fontFamily:"sans-serif"},
    header:{backgroundColor:"#1e90ff", color:"white", padding:"20px", textAlign:"center"},
    nav:{display:"flex", justifyContent:"center", gap:"15px", margin:"15px 0"},
    navButton:{padding:"10px 15px", backgroundColor:"#1e90ff", color:"white", border:"none", borderRadius:"5px", cursor:"pointer"},
    container:{padding:"20px", position:"relative"},
    formLabel:{display:"block", marginTop:"8px"},
    formInput:{width:"100%", padding:"6px", marginTop:"4px"},
    formButton:{marginTop:"15px", padding:"10px 15px", backgroundColor:"#1e90ff", color:"white", border:"none", borderRadius:"5px", cursor:"pointer"},
    table:{width:"100%", borderCollapse:"collapse", marginTop:"15px"},
    th:{border:"1px solid #ddd", padding:"8px", backgroundColor:"#1e90ff", color:"white"},
    td:{border:"1px solid #ddd", padding:"8px"},
    deleteBtn:{backgroundColor:"#d9534f", color:"white", padding:"5px 10px", border:"none", borderRadius:"4px", cursor:"pointer"},
    editBtn:{backgroundColor:"#4CAF50", color:"white", padding:"5px 10px", border:"none", borderRadius:"4px", cursor:"pointer", marginRight:"5px"},
    novoBtn:{position:"absolute", top:"0", right:"0", padding:"10px 15px", backgroundColor:"orange", color:"white", border:"none", borderRadius:"5px", cursor:"pointer"},
    modal:{position:"fixed", top:"0", left:"0", width:"100%", height:"100%", backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center"},
    modalContent:{backgroundColor:"white", padding:"20px", borderRadius:"10px", width:"500px", maxHeight:"90%", overflowY:"auto"},
    closeModalBtn:{backgroundColor:"#d9534f", color:"white", border:"none", padding:"5px 10px", borderRadius:"4px", cursor:"pointer", float:"right"}
  };

  // ---------------- LOGIN ----------------
  if(!loggedIn){
    return (
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", backgroundColor:"#e6f0ff"}}>
        <form onSubmit={handleLogin} style={{border:"1px solid #ddd", padding:"30px", borderRadius:"10px", backgroundColor:"#ffffff", textAlign:"center"}}>
          <h2 style={{color:"#1e90ff"}}>AMVAP SAÚDE - GESTÃO DE CREDENCIAMENTOS</h2>
          <input type="text" placeholder="Usuário" value={loginUser} onChange={e=>setLoginUser(e.target.value)} style={{display:"block", margin:"10px auto"}}/>
          <input type="password" placeholder="Senha" value={loginPass} onChange={e=>setLoginPass(e.target.value)} style={{display:"block", margin:"10px auto"}}/>
          <button type="submit" style={{...styles.formButton, backgroundColor:"#1e90ff"}}>Entrar</button>
        </form>
      </div>
    );
  }

  // ---------------- RENDER PRINCIPAL ----------------
  return (
    <div style={styles.body}>
      <header style={styles.header}><h1>AMVAP SAÚDE - Gestão de Credenciamentos</h1></header>
      <nav style={styles.nav}>
        <button style={styles.navButton} onClick={()=>setSection("processos")}>Processos Licitatórios</button>
        <button style={styles.navButton} onClick={()=>setSection("prestadores")}>Prestadores</button>
        <button style={styles.navButton} onClick={()=>setSection("procedimentos")}>Procedimentos Médicos</button>
        <button style={styles.navButton} onClick={()=>setSection("credenciados")}>Credenciados</button>
      </nav>
      <div style={styles.container}>
        {/* Processos Licitatórios */}
        {section==="processos" && (
          <div>
            <button style={styles.novoBtn} onClick={()=>setModalOpen({...modalOpen, processo:true})}>Novo Processo</button>
            <input placeholder="🔍 Pesquisar processo" style={{marginTop:"50px", marginBottom:"10px", width:"100%", padding:"6px"}} value={filtroProcesso} onChange={e=>setFiltroProcesso(e.target.value)}/>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Número do Processo</th>
                  <th style={styles.th}>Número do Credenciamento</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Categoria</th>
                  <th style={styles.th}>Data Abertura</th>
                  <th style={styles.th}>Data Encerramento</th>
                  <th style={styles.th}>Procedimentos Vinculados</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {processos.filter(p=>p.numeroProcesso.toLowerCase().includes(filtroProcesso.toLowerCase())).map((p,i)=>(
                  <tr key={i}>
                    <td style={styles.td}>{i+1}</td>
                    <td style={styles.td}>{p.numeroProcesso}</td>
                    <td style={styles.td}>{p.numeroCredenciamento}</td>
                    <td style={styles.td}>{p.status}</td>
                    <td style={styles.td}>{p.categoria}</td>
                    <td style={styles.td}>{p.dataAbertura}</td>
                    <td style={styles.td}>{p.dataEncerramento}</td>
                    <td style={styles.td}>
                      {p.procedimentosVinculados.map((proc,j)=>(
                        <div key={j}>{proc.codigo} - {proc.nome}</div>
                      ))}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={()=>editProcesso(i)}>✎</button>
                      <button style={styles.deleteBtn} onClick={()=>deleteProcesso(i)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {modalOpen.processo && (
              <div style={styles.modal}>
                <div style={styles.modalContent}>
                  <button style={styles.closeModalBtn} onClick={()=>setModalOpen({...modalOpen, processo:false})}>X</button>
                  <h3>Novo Processo Licitatório</h3>
                  <form onSubmit={addProcesso}>
                    <label style={styles.formLabel}>Número do Processo</label>
                    <input style={styles.formInput} name="numeroProcesso" value={formProcesso.numeroProcesso} onChange={handleProcessoChange}/>

                    <label style={styles.formLabel}>Número do Credenciamento</label>
                    <input style={styles.formInput} name="numeroCredenciamento" value={formProcesso.numeroCredenciamento} onChange={handleProcessoChange}/>

                    <label style={styles.formLabel}>Status</label>
                    <select style={styles.formInput} name="status" value={formProcesso.status} onChange={handleProcessoChange}>
                      <option>Aberto</option>
                      <option>Encerrado</option>
                      <option>Prorrogado</option>
                    </select>

                    <label style={styles.formLabel}>Categoria</label>
                    <select style={styles.formInput} name="categoria" value={formProcesso.categoria} onChange={handleProcessoChange}>
                      <option>Consultas</option>
                      <option>Exames</option>
                      <option>Procedimentos Médicos</option>
                      <option>Cirurgias</option>
                      <option>Outros</option>
                    </select>

                    <label style={styles.formLabel}>Data de Abertura</label>
                    <input type="date" style={styles.formInput} name="dataAbertura" value={formProcesso.dataAbertura} onChange={handleProcessoChange}/>

                    <label style={styles.formLabel}>Data de Encerramento</label>
                    <input type="date" style={styles.formInput} name="dataEncerramento" value={formProcesso.dataEncerramento} onChange={handleProcessoChange}/>

                    {/* Procedimentos Vinculados será implementado depois com dropdown auto-complete */}
                    <button style={styles.formButton} type="submit">Salvar</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prestadores */}
        {section==="prestadores" && (
          <div>
            <button style={styles.novoBtn} onClick={()=>setModalOpen({...modalOpen, prestador:true})}>Novo Prestador</button>
            <input placeholder="🔍 Pesquisar prestador" style={{marginTop:"50px", marginBottom:"10px", width:"100%", padding:"6px"}} value={filtroPrestador} onChange={e=>setFiltroPrestador(e.target.value)}/>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>CNPJ</th>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Local</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {prestadores.filter(p=>p.nome.toLowerCase().includes(filtroPrestador.toLowerCase())).map((p,i)=>(
                  <tr key={i}>
                    <td style={styles.td}>{p.cnpj}</td>
                    <td style={styles.td}>{p.nome}</td>
                    <td style={styles.td}>{p.local}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={()=>editPrestador(i)}>✎</button>
                      <button style={styles.deleteBtn} onClick={()=>deletePrestador(i)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {modalOpen.prestador && (
              <div style={styles.modal}>
                <div style={styles.modalContent}>
                  <button style={styles.closeModalBtn} onClick={()=>setModalOpen({...modalOpen, prestador:false})}>X</button>
                  <h3>Novo Prestador</h3>
                  <form onSubmit={addPrestador}>
                    <label style={styles.formLabel}>CNPJ</label>
                    <input style={styles.formInput} name="cnpj" value={formPrestador.cnpj} onChange={handlePrestadorChange}/>
                    <label style={styles.formLabel}>Nome</label>
                    <input style={styles.formInput} name="nome" value={formPrestador.nome} onChange={handlePrestadorChange}/>
                    <label style={styles.formLabel}>Local de Atendimento</label>
                    <input style={styles.formInput} name="local" value={formPrestador.local} onChange={handlePrestadorChange}/>
                    <button style={styles.formButton} type="submit">Salvar</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
