import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4tZjjfiOauLn2PPxYAp6ylNqB9LWJkI0",
  authDomain: "rv-grup.firebaseapp.com",
  projectId: "rv-grup",
  storageBucket: "rv-grup.firebasestorage.app",
  messagingSenderId: "1061419825993",
  appId: "1:1061419825993:web:5cb7b020efd40b8cf13898"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userEmailSpan = document.getElementById("userEmail");
const btnSair = document.getElementById("btnSair");
const btnSalvarAlvo = document.getElementById("btnSalvarAlvo");
const listaAlvosDiv = document.getElementById("listaAlvos");
const statusForm = document.getElementById("status-form");

let usuarioAtual = null;

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        usuarioAtual = user;
        userEmailSpan.innerText = user.email;
        carregarAlvos();
    }
});

btnSair.addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});

btnSalvarAlvo.addEventListener("click", async () => {
    const titulo = document.getElementById("vaga-titulo").value.trim();
    const cor = document.getElementById("vaga-cor").value;
    const videoId = document.getElementById("vaga-video").value.trim();
    const instrucoes = document.getElementById("vaga-msg").value.trim();

    if(!titulo || !videoId || !instrucoes) {
        statusForm.innerHTML = "❌ Preencha todos os campos obrigatórios.";
        return;
    }

    try {
        btnSalvarAlvo.disabled = true;
        statusForm.innerHTML = "🟡 Gravando no banco de dados...";

        await addDoc(collection(db, "alvos"), {
            company_id: usuarioAtual.uid,
            titulo: titulo,
            cor: cor,
            video_id: videoId,
            instrucoes: instrucoes,
            dataCriacao: serverTimestamp()
        });

        statusForm.innerHTML = "✅ Alvo criado com sucesso!";
        document.getElementById("vaga-titulo").value = "";
        document.getElementById("vaga-video").value = "";
        document.getElementById("vaga-msg").value = "";
        
        carregarAlvos();
    } catch (e) {
        console.error(e);
        statusForm.innerHTML = "❌ Falha ao criar alvo.";
    } finally {
        btnSalvarAlvo.disabled = false;
    }
});

async function carregarAlvos() {
    if(!usuarioAtual) return;
    try {
        const q = query(collection(db, "alvos"), where("company_id", "==", usuarioAtual.uid));
        const querySnapshot = await getDocs(q);
        
        if(querySnapshot.empty) {
            listaAlvosDiv.innerHTML = "<p style='color: #94a3b8; text-align: center;'>Nenhum alvo ativo encontrado.</p>";
            return;
        }

        listaAlvosDiv.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const dados = doc.data();
            const urlVaga = `${window.location.origin}${window.location.pathname.replace('painel.html', 'vaga.html')}?id=${doc.id}`;
            
            const item = document.createElement("div");
            item.className = "item-alvo";
            item.innerHTML = `
                <div>
                    <strong>${dados.titulo}</strong>
                    <p>ID: ${doc.id}</p>
                </div>
                <button class="btn-copy" data-link="${urlVaga}">Copiar Link</button>
            `;
            listaAlvosDiv.appendChild(item);
        });

        document.querySelectorAll(".btn-copy").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const link = e.target.getAttribute("data-link");
                navigator.clipboard.writeText(link);
                e.target.innerText = "Copiado!";
                setTimeout(() => { btn.innerText = "Copiar Link"; }, 2000);
            });
        });

    } catch (e) {
        console.error(e);
        listaAlvosDiv.innerHTML = "<p style='color: #ef4444;'>Erro ao carregar links ativos.</p>";
    }
}