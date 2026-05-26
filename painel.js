import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// SUAS CHAVES DO PROJETO LEVI
const firebaseConfig = {
  apiKey: "AIzaSyCDS9f64ipLVNi9E4JUY7QRfA5WG6YvqzQ",
  authDomain: "levi-7f46e.firebaseapp.com",
  projectId: "levi-7f46e",
  storageBucket: "levi-7f46e.firebasestorage.app",
  messagingSenderId: "1007406602576",
  appId: "1:1007406602576:web:faa333338264df31317455"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Seleção de Elementos UI
const userEmailSpan = document.getElementById("userEmail");
const btnSair = document.getElementById("btnSair");
const btnSalvarAlvo = document.getElementById("btnSalvarAlvo");
const listaAlvosDiv = document.getElementById("listaAlvos");
const totalLinksH2 = document.getElementById("total-links");

let usuarioAtual = null;

// Observador de Autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        usuarioAtual = user;
        userEmailSpan.innerText = user.email;
        escutarAlvos(); // Inicia a escuta em tempo real
    }
});

// Logout
btnSair.addEventListener("click", () => signOut(auth));

// Salvar Novo Alvo
btnSalvarAlvo.addEventListener("click", async () => {
    const titulo = document.getElementById("vaga-titulo").value.trim();
    const cor = document.getElementById("vaga-cor").value;
    const videoId = document.getElementById("vaga-video").value.trim();
    const msg = document.getElementById("vaga-msg").value.trim();

    if(!titulo || !videoId) return alert("Preencha o título e o vídeo!");

    try {
        await addDoc(collection(db, "alvos"), {
            company_id: usuarioAtual.uid,
            titulo, cor, video_id: videoId, instrucoes: msg,
            dataCriacao: serverTimestamp()
        });
        alert("Link gerado com sucesso!");
    } catch (e) { console.error(e); }
});

// Escuta em tempo real dos Alvos daquela Empresa
function escutarAlvos() {
    const q = query(collection(db, "alvos"), where("company_id", "==", usuarioAtual.uid));
    
    onSnapshot(q, (snapshot) => {
        totalLinksH2.innerText = snapshot.size;
        listaAlvosDiv.innerHTML = "";
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const urlVaga = `${window.location.origin}${window.location.pathname.replace('painel.html', 'vaga.html')}?id=${doc.id}`;
            
            const div = document.createElement("div");
            div.className = "target-item";
            div.innerHTML = `
                <div>
                    <strong>${data.titulo}</strong>
                    <div class="target-meta">ID: ${doc.id} | Vídeo: ${data.video_id}</div>
                </div>
                <button class="btn-action" onclick="navigator.clipboard.writeText('${urlVaga}'); alert('Link copiado!')">
                    COPIAR LINK
                </button>
            `;
            listaAlvosDiv.appendChild(div);
        });
    });
}

#### 2. `script.js` (O Motor da Vaga/Candidato)
*Este arquivo torna o link do candidato funcional e inteligente.*

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CHAVES LEVI
const firebaseConfig = {
  apiKey: "AIzaSyCDS9f64ipLVNi9E4JUY7QRfA5WG6YvqzQ",
  authDomain: "levi-7f46e.firebaseapp.com",
  projectId: "levi-7f46e",
  storageBucket: "levi-7f46e.firebasestorage.app",
  messagingSenderId: "1007406602576",
  appId: "1:1007406602576:web:faa333338264df31317455"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const alvoId = params.get('id');

async function carregarConfiguracoes() {
    if(!alvoId) return;
    
    const docRef = doc(db, "alvos", alvoId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Aplica a Identidade Visual da Empresa
        document.getElementById('titulo-vaga').innerText = data.titulo;
        document.getElementById('mensagem-vaga').innerText = data.instrucoes;
        document.getElementById('video-container').innerHTML = `
            <iframe src="https://www.youtube.com/embed/${data.video_id}?autoplay=1&mute=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>
        `;
        
        // Estilo Dinâmico
        const btn = document.getElementById('btn');
        btn.style.background = `linear-gradient(90deg, ${data.cor}, #16a34a)`;
    }
}

carregarConfiguracoes();
// (A lógica de captura da câmera que já tínhamos continua abaixo deste código)

**O que fazer agora para finalizar:**
1. Atualize o `painel.js` e o `script.js` no seu GitHub com estes códigos acima.
2. Certifique-se de que o e-mail e senha que você criou no Firebase estão ativos.
3. Acesse o seu site, faça o login, crie um "Alvo" e clique em **COPIAR LINK**.
4. Cole esse link em uma nova aba e veja a mágica acontecer: a página vai carregar exatamente o que você configurou no painel!

Seu SaaS agora é funcional. Qual a próxima funcionalidade que você quer adicionar? Gráficos de barra reais no Dashboard?
