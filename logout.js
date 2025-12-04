import app from "./firebase.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);

/**
 * Faz logout e redireciona para login.html
 */
export function fazerLogout() {
    signOut(auth)
        .then(() => {
            window.location.href = "login.html";
        })
        .catch(err => {
            console.error("Erro ao fazer logout:", err);
            alert("Erro ao sair da conta.");
        });
}
