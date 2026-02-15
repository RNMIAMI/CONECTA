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
  dados.forEach(m=>{
    lista.innerHTML+=`
      <div class="item">
        <b>${m.nome}</b> (${m.tipo}) - ${m.categoria}<br>
        ${m.data}<br>${m.desc||""}
        ${m.foto?`<img src="${m.foto}">`:""}
      </div>`;
  });

  dashboard.innerHTML=`<h3>Dashboard do Mês</h3>
    <div class="dashboard">
      <div class="kpi">Manutenções: ${dados.length}</div>
      <div class="kpi">Preventivas: ${dados.filter(m=>m.tipo==="Preventiva").length}</div>
      <div class="kpi">Corretivas: ${dados.filter(m=>m.tipo==="Corretiva").length}</div>
    </div>`;

  gridPreventivas.innerHTML=obrigatorias.map(o=>`
    <div class="card">
      <b>${o}</b>
      <input type="date" id="prev_${o}">
      ${o==="Piscina"?`<label><input type="checkbox" id="nao_${o}"> Prédio não possui piscina</label>`:""}
    </div>`).join("");
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
  if(perfilAtual!=="ADM")return;
  const doc=new jsPDF();
  doc.text("JORNAL DE MANUTENÇÕES",20,30);
  doc.save("jornal-manutencoes.pdf");
}
