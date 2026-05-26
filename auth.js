import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const emailInput = document.getElementById("email");
const passInput = document.getElementById("pass");
const btnLogin = document.getElementById("btnLogin");
const statusText = document.getElementById("status");

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "painel.html";
    }
});

btnLogin.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();

    if(!email || !pass) {
        statusText.innerHTML = "❌ Preencha todos os campos.";
        return;
    }

    try {
        btnLogin.disabled = true;
        btnLogin.innerHTML = "CONECTANDO...";
        statusText.innerHTML = "🟡 Validando credenciais...";
        
        await signInWithEmailAndPassword(auth, email, pass);
        statusText.innerHTML = "✅ Sucesso! Redirecionando...";
        window.location.href = "painel.html";
    } catch (error) {
        console.error(error);
        statusText.innerHTML = "❌ Erro: Email ou senha inválidos.";
        btnLogin.disabled = false;
        btnLogin.innerHTML = "ENTRAR NO PAINEL";
    }
});