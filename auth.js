import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
