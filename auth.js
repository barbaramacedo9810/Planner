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

/* ======================================================
   IGNORAR EXECUÇÃO EM PÁGINAS SEM NAVBAR (ex: recuperarsenha.html)
   NÃO usar `return` no top-level (causa SyntaxError)
====================================================== */
const paginasIgnoradas = ["recuperarsenha.html"];
const paginaAtual = window.location.pathname.split("/").pop();
const executarAuth = !paginasIgnoradas.includes(paginaAtual);

if (!executarAuth) {
    console.log("auth.js não será executado nesta página:", paginaAtual);
} else {

    /* ======================================================
       AUTENTICAÇÃO
    ====================================================== */
    export const auth = getAuth(app);

    // Elementos opcionais do layout
    const menuLogado = document.getElementById("menuLogado");
    const menuDeslogado = document.getElementById("menuDeslogado");
    const logoutBtn = document.getElementById("logoutBtn");

    /* ======================================================
       CONTROLE DE SESSÃO
    ====================================================== */
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (menuLogado) menuLogado.style.display = "flex";
            if (menuDeslogado) menuDeslogado.style.display = "none";

            // Usuário já logado → impedir acesso ao login
            if (paginaAtual === "login.html") {
                window.location.href = "calendario.html";
            }
        } else {
            if (menuLogado) menuLogado.style.display = "none";
            if (menuDeslogado) menuDeslogado.style.display = "flex";
        }
    });

    /* ======================================================
       LOGIN
    ====================================================== */
    document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const errorMsg = document.getElementById("errorMsg");

        if (errorMsg) errorMsg.textContent = "";

        try {
            await signInWithEmailAndPassword(auth, email, senha);
            window.location.href = "calendario.html";
        } catch (error) {
            console.error("Erro login:", error);
            if (errorMsg) errorMsg.textContent = "E-mail ou senha incorretos!";
        }
    });

    /* ======================================================
       BOTÃO CRIAR CONTA
    ====================================================== */
    document.getElementById("btnCriarConta")?.addEventListener("click", () => {
        window.location.href = "criarconta.html";
    });

    /* ======================================================
       RECUPERAR SENHA (na tela de login)
    ====================================================== */
    document.getElementById("forgotPassword")?.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();

        if (!email) {
            alert("Digite o e-mail no campo antes de recuperar a senha.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Enviamos um link para redefinir sua senha. Verifique seu e-mail.");
        } catch (err) {
            console.error("Erro ao enviar reset:", err);

            if (err.code === "auth/user-not-found") {
                alert("Este e-mail não está cadastrado.");
            } else if (err.code === "auth/invalid-email") {
                alert("E-mail inválido.");
            } else {
                alert("Erro: " + err.message);
            }
        }
    });

    /* ======================================================
       LOGOUT
    ====================================================== */
    logoutBtn?.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (err) {
            console.error("Erro ao sair:", err);
            alert("Erro ao sair: " + err.message);
        }
    });

    /* ======================================================
       EXPORTA FUNÇÕES (se necessário)
    ====================================================== */
    export {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        sendPasswordResetEmail,
        signOut,
        updatePassword,
        onAuthStateChanged
    };
} // fim do else executarAuth
