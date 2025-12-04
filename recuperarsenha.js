import app from "./firebase.js";
import {
    getAuth,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);

const emailRec = document.getElementById("emailRec");
const msgRec = document.getElementById("msgRec");
const btnRec = document.getElementById("btnRec");

btnRec.addEventListener("click", async () => {
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
        } else if (err.code === "auth/invalid-email") {
            msgRec.style.color = "red";
            msgRec.textContent = "E-mail inválido!";
        } else {
            msgRec.style.color = "red";
            msgRec.textContent = "Erro: " + err.message;
        }
    }
});
