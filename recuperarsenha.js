import app from "./firebase.js";
import {
    getAuth,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);

/* --------------------------------------------------
   ELEMENTOS
-------------------------------------------------- */
const formEmail = document.getElementById("form-email");
const formNovaSenha = document.getElementById("form-nova-senha");

// Enviar email
const emailRec = document.getElementById("emailRec");
const msgRec = document.getElementById("msg");   // ✔ ID correto
const btnRec = document.getElementById("btnRec");

// Nova senha
const novaSenha = document.getElementById("novaSenha");
const btnNovaSenha = document.getElementById("btnNovaSenha");
const msgNova = document.getElementById("msg2"); // ✔ ID correto

/* --------------------------------------------------
   VERIFICA SE O LINK DO EMAIL FOI ABERTO
-------------------------------------------------- */
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const oobCode = params.get("oobCode");

if (mode === "resetPassword" && oobCode) {

    // Esconde o primeiro formulário
    formEmail.style.display = "none";
    formNovaSenha.style.display = "block";

    // Valida se o link ainda vale
    verifyPasswordResetCode(auth, oobCode)
        .catch(() => {
            msgNova.style.color = "red";
            msgNova.textContent = "Este link expirou ou é inválido.";
        });
}

/* --------------------------------------------------
   ENVIAR LINK DE RECUPERAÇÃO
-------------------------------------------------- */
btnRec?.addEventListener("click", async () => {
    msgRec.textContent = "";
    const email = emailRec.value.trim();

    if (!email) {
        msgRec.style.color = "red";
        msgRec.textContent = "Digite um e-mail válido!";
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);

        msgRec.style.color = "green";
        msgRec.textContent = "Enviamos um link para seu e-mail!";

        emailRec.value = "";

    } catch (err) {
        console.error(err);

        if (err.code === "auth/user-not-found") {
            msgRec.style.color = "red";
            msgRec.textContent = "Este e-mail não está cadastrado!";
        }
        else if (err.code === "auth/invalid-email") {
            msgRec.style.color = "red";
            msgRec.textContent = "E-mail inválido!";
        }
        else if (err.code === "auth/network-request-failed") {
            msgRec.style.color = "red";
            msgRec.textContent = "Sem conexão. Verifique sua internet.";
        }
        else {
            msgRec.style.color = "red";
            msgRec.textContent = "Erro ao enviar: " + err.message;
        }
    }
});

/* --------------------------------------------------
   CONFIRMAR NOVA SENHA
-------------------------------------------------- */
btnNovaSenha?.addEventListener("click", async () => {
    const senhaNova = novaSenha.value.trim();

    msgNova.textContent = "";

    if (senhaNova.length < 6) {
        msgNova.style.color = "red";
        msgNova.textContent = "A senha deve ter no mínimo 6 caracteres.";
        return;
    }

    try {
        await confirmPasswordReset(auth, oobCode, senhaNova);

        msgNova.style.color = "green";
        msgNova.textContent = "Senha alterada com sucesso!";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);

    } catch (err) {
        msgNova.style.color = "red";
        msgNova.textContent = "Erro ao salvar nova senha.";
        console.error(err);
    }
});
