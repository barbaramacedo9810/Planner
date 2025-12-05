/* ======================================================
   IMPORTA FIREBASE (APP + FIRESTORE)
====================================================== */
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

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ======================================================
   INICIALIZA AUTENTICAÇÃO
====================================================== */
export const auth = getAuth(app); // ESSENCIAL - NÃO REMOVER


/* ======================================================
   FUNÇÃO PARA CRIAR USUÁRIO
====================================================== */
export async function criarUsuario(email, senha, nome) {
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);

        // salva dados do usuário
        await setDoc(doc(db, "usuarios", cred.user.uid), {
            nome: nome,
            email: email,
            criadoEm: new Date()
        });

        return { ok: true, user: cred.user };

    } catch (erro) {
        return { ok: false, erro };
    }
}


/* ======================================================
   FUNÇÃO PARA LOGIN
====================================================== */
export async function fazerLogin(email, senha) {
    try {
        const cred = await signInWithEmailAndPassword(auth, email, senha);
        return { ok: true, user: cred.user };
    } catch (erro) {
        return { ok: false, erro };
    }
}


/* ======================================================
   FUNÇÃO PARA RESET DE SENHA
====================================================== */
export async function resetSenha(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { ok: true };
    } catch (erro) {
        return { ok: false, erro };
    }
}


/* ======================================================
   FUNÇÃO PARA LOGOUT
====================================================== */
export async function fazerLogout() {
    try {
        await signOut(auth);
        return { ok: true };
    } catch (erro) {
        return { ok: false, erro };
    }
}


/* ======================================================
   MONITORAMENTO DE LOGIN AUTOMÁTICO
====================================================== */
export function observarUsuario(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // pega dados do Firestore
            const snap = await getDoc(doc(db, "usuarios", user.uid));
            const dados = snap.exists() ? snap.data() : null;

            callback({
                logado: true,
                user: user,
                dados: dados
            });
        } else {
            callback({
                logado: false,
                user: null,
                dados: null
            });
        }
    });
}
