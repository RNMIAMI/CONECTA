const { jsPDF } = window.jspdf;

const login = document.getElementById("login");
const senha = document.getElementById("senha");
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const condominioBox = document.getElementById("condominioBox");
const painelAdm = document.getElementById("painelAdm");
const mesSelecionado = document.getElementById("mesSelecionado");
const condominio = document.getElementById("condominio");
const lista = document.getElementById("lista");
const dashboard = document.getElementById("dashboard");
const gridPreventivas = document.getElementById("gridPreventivas");
const nome = document.getElementById("nome");
const data = document.getElementById("data");
const descricao = document.getElementById("descricao");
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const foto = document.getElementById("foto");

let perfilAtual="", condFixado="";
let tipoLogin="zelador";

const obrigatorias=["Elevador","Gerador","Bombas","Portões","Piscina"];

function trocarLogin(tipo){
  tipoLogin=tipo;
  const slider=document.getElementById("slider");
  const btnZ=document.getElementById("btnZelador");
  const btnA=document.getElementById("btnAdm");

  if(tipo==="adm"){
    slider.style.left="50%";
    btnA.classList.add("active");
    btnZ.classList.remove("active");
  }else{
    slider.style.left="0%";
    btnZ.classList.add("active");
    btnA.classList.remove("active");
  }

  login.value="";
  senha.value="";
}

function mostrarErro(){
  document.getElementById("modalErro").style.display="flex";
}

function fecharModal(){
  document.getElementById("modalErro").style.display="none";
}

function doLogin(){

  if(tipoLogin==="adm"){
    if(login.value==="ADM" && senha.value==="777"){
      perfilAtual="ADM";
    }else{return mostrarErro();}
  }

  if(tipoLogin==="zelador"){
    if(login.value==="ZELADOR" && senha.value==="HB"){
      perfilAtual="ZELADOR";
      condFixado="Haus Mitre Butantã";
    }
    else if(login.value==="ZELADOR" && senha.value==="IMAGE"){
      perfilAtual="ZELADOR";
      condFixado="Image";
    }
    else{return mostrarErro();}
  }

  loginScreen.style.display="none";
  app.style.display="block";

  if(perfilAtual==="ZELADOR"){
    condominioBox.style.display="none";
    painelAdm.style.display="none";
  }

  render();
}

function logout(){location.reload();}
function getData(){return JSON.parse(localStorage.getItem("manutencoes")||"[]")}
function setData(d){localStorage.setItem("manutencoes",JSON.stringify(d))}
function getPrev(){return JSON.parse(localStorage.getItem("preventivas")||"{}")}
function setPrev(d){localStorage.setItem("preventivas",JSON.stringify(d))}
function keyPrev(cond,mes){return cond+"-"+mes;}

function salvarPreventivas(){
  const mes=mesSelecionado.value;
  const cond=condFixado||condominio.value;
  const dados=getPrev();
  dados[keyPrev(cond,mes)]=obrigatorias.map(o=>{
    const data=document.getElementById("prev_"+o)?.value||"";
    const naoTem=document.getElementById("nao_"+o)?.checked||false;
    return{item:o,data,naoTem};
  });
  setPrev(dados);
  render();
}

function render(){
  const mes=mesSelecionado.value;
  const cond=condFixado||condominio.value;
  const dados=getData().filter(m=>m.cond===cond && new Date(m.data).getMonth()==mes);

lista.innerHTML="";
dados.forEach((m,index)=>{
  lista.innerHTML+=`
    <div class="item">
      <b>${m.nome}</b> (${m.tipo}) - ${m.categoria}<br>
      ${m.data}<br>${m.desc||""}
      ${m.foto?`<img src="${m.foto}">`:""}
      ${perfilAtual==="ZELADOR"
        ? `<br><button onclick="excluirManutencao(${index})" style="background:#d9534f;margin-top:8px">Excluir</button>`
        : ""
      }
    </div>`;
});

  dashboard.innerHTML=`<h3>Dashboard do Mês</h3>
    <div class="dashboard">
      <div class="kpi">Manutenções: ${dados.length}</div>
      <div class="kpi">Preventivas: ${dados.filter(m=>m.tipo==="Preventiva").length}</div>
      <div class="kpi">Corretivas: ${dados.filter(m=>m.tipo==="Corretiva").length}</div>
    </div>`;

gridPreventivas.innerHTML = obrigatorias.map(o=>{
  return `
    <div class="card">
      <b>${o}</b>
      <input type="date" id="prev_${o}">
      ${(o==="Piscina" || o==="Gerador")
        ? `<label>
            <input type="checkbox" id="nao_${o}">
            Prédio não possui ${o.toLowerCase()}
           </label>`
        : ""
      }
    </div>
  `;
}).join("");
}

function salvar(){
  if(!nome.value||!data.value)return;
  const file=foto.files[0];
  const reader=new FileReader();
  const save=(img)=>{
    const d=getData();
    d.push({
      cond:condFixado||condominio.value,
      nome:nome.value,data:data.value,desc:descricao.value,
      tipo:tipo.value,categoria:categoria.value,foto:img
    });
    setData(d);nome.value="";descricao.value="";foto.value="";render();
  }
  if(file){reader.onload=()=>save(reader.result);reader.readAsDataURL(file);}else save(null);
}

function gerarPDF(){
  if(perfilAtual!=="ADM") return;

  const doc = new jsPDF();

  // =========================
  // FUNÇÃO PARA DESENHAR BORDA PROFISSIONAL
  // =========================
  function desenharBorda(){
    doc.setDrawColor(65,105,225); // Azul Royal
    doc.setLineWidth(4);
    doc.rect(10,10,190,277); // Borda externa grossa

    doc.setLineWidth(1);
    doc.rect(15,15,180,267); // Borda interna fina
  }

  // =========================
  // CAPA
  // =========================
  desenharBorda();

  doc.setTextColor(65,105,225);
  doc.setFontSize(42);
  doc.text("JORNAL INFORMATIVO",105,130,{align:"center"});

  doc.setFontSize(22);
  doc.text("CITTIC",105,160,{align:"center"});

  doc.setFontSize(14);
  doc.setTextColor(0,0,0);
  doc.text("SÍNDICO RESPONSÁVEL PELO CONDOMÍNIO:",105,190,{align:"center"});
  doc.text("VALTER SANTANA",105,200,{align:"center"});

  doc.addPage();

  // =========================
  // PÁGINAS DE MANUTENÇÃO
  // =========================
  const mes = mesSelecionado.value;
  const cond = condFixado || condominio.value;
  const dados = getData().filter(m=>m.cond===cond && new Date(m.data).getMonth()==mes);

  let y=25;
  let contador=0;

  dados.forEach(m=>{

    if(contador===2){
      doc.addPage();
      desenharBorda();
      y=25;
      contador=0;
    }

    desenharBorda();

    doc.setFontSize(22);
    doc.setTextColor(65,105,225);
    doc.text(m.nome,105,y,{align:"center"});

    if(m.foto){
      doc.addImage(m.foto,"JPEG",25,y+10,160,110);
    }

    y+=135;
    contador++;
  });

  doc.save("jornal-informativo.pdf");
}

function excluirManutencao(index){
  const mes = mesSelecionado.value;
  const cond = condFixado || condominio.value;

  let dados = getData();
  const filtrados = dados.filter(m=>!(m.cond===cond && new Date(m.data).getMonth()==mes));
  
  const atuais = dados.filter(m=>m.cond===cond && new Date(m.data).getMonth()==mes);

  atuais.splice(index,1);

  setData([...filtrados,...atuais]);
  render();
}
function mostrarMensagem(texto, sucesso){

  const div = document.createElement("div");

  div.style.position="fixed";
  div.style.top="50%";
  div.style.left="50%";
  div.style.transform="translate(-50%,-50%)";
  div.style.padding="25px 40px";
  div.style.borderRadius="15px";
  div.style.fontWeight="bold";
  div.style.color="#fff";
  div.style.zIndex="9999";
  div.style.fontSize="18px";
  div.style.boxShadow="0 10px 25px rgba(0,0,0,0.3)";
  div.style.background = sucesso ? "#1aa06d" : "#d9534f";

  div.innerText = texto;

  document.body.appendChild(div);

  setTimeout(()=>div.remove(),2000);
}
