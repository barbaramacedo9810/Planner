// auth.js
import app, { db } from "./firebase.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updatePassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(app);

// Helper: mostra/oculta menus
const menuLogado = document.getElementById("menuLogado");
const menuDeslogado = document.getElementById("menuDeslogado");
const logoutBtn = document.getElementById("logoutBtn");

// Atualiza menus conforme autenticação
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (menuLogado) menuLogado.style.display = "flex";
        if (menuDeslogado) menuDeslogado.style.display = "none";

        // Se estiver em login.html redireciona para calendário
        if (window.location.pathname.includes("login.html")) {
            window.location.href = "calendario.html";
        }
    } else {
        if (menuLogado) menuLogado.style.display = "none";
        if (menuDeslogado) menuDeslogado.style.display = "flex";
    }
});

/* ------------------------------
   LOGIN
--------------------------------*/
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        // Redireciona para calendário
        window.location.href = "calendario.html";
    } catch (error) {
        console.error("Erro login:", error);
        if (errorMsg) errorMsg.textContent = "E-mail ou senha incorretos!";
    }
});

/* ------------------------------
   CRIAR NOVO USUÁRIO
   (se você usar criarconta.html com registerForm, prefira criarconta.js)
--------------------------------*/
document.getElementById("btnCriarConta")?.addEventListener("click", () => {
    // abre a página de criar conta
    window.location.href = "criarconta.html";
});

/* ------------------------------
   RECUPERAR SENHA (esqueci senha)
--------------------------------*/
document.getElementById("forgotPassword")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Digite o e-mail no campo antes de clicar em recuperar senha.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Um link para redefinição de senha foi enviado para o seu e-mail.");
    } catch (err) {
        console.error("Erro ao enviar reset:", err);
        alert("Erro ao enviar e-mail: " + err.message);
    }
});

/* ------------------------------
   LOGOUT INTELIGENTE
--------------------------------*/
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            // volta para a página de login
            window.location.href = "login.html";
        } catch (err) {
            console.error("Erro ao sair:", err);
            alert("Erro ao sair: " + err.message);
        }
    });
}
