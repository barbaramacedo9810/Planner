import app from "./firebase.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);

/* ------------------------------
   LOGIN DO USUÁRIO
--------------------------------*/
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const errorMsg = document.getElementById("errorMsg");

    try {
        await signInWithEmailAndPassword(auth, email, senha);

        // Redirecionar após login
        window.location.href = "calendario.html";

    } catch (error) {
        errorMsg.textContent = "E-mail ou senha incorretos!";
        console.error("Erro ao fazer login:", error);
    }
});

/* ------------------------------
   SE O USUÁRIO JÁ ESTIVER LOGADO
--------------------------------*/
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Redireciona se tentar voltar para a página de login logado
        if (window.location.pathname.includes("login.html")) {
            window.location.href = "calendario.html";
        }
    }
});
