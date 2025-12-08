import app, { db } from "./firebase.js";
import {
    getAuth,
    onAuthStateChanged,
    updateProfile,
    updatePassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(app);

/* =========================================================
   CARREGAR DADOS DO USUÁRIO AO ABRIR A PÁGINA
========================================================= */
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Preenche e-mail (vem do Auth)
    const emailInput = document.getElementById("email");
    emailInput.value = user.email;

    // Preenche nome (Firestore → Auth → vazio)
    const nameInput = document.getElementById("displayName");

    try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists() && snap.data().nome) {
            // Nome existe no Firestore
            nameInput.value = snap.data().nome;
        } else if (user.displayName) {
            // Nome existe no Auth
            nameInput.value = user.displayName;
        } else {
            // Nenhum nome → campo vazio
            nameInput.value = "";
        }

    } catch (error) {
        console.error("Erro ao carregar nome:", error);
        nameInput.value = "";
    }


    // Foto
    const avatar = document.getElementById("avatarPreview");
    if (user.photoURL) {
        avatar.src = user.photoURL;
    }
});


/* =========================================================
   ALTERAR FOTO (pré-visualização simples)
========================================================= */
document.getElementById("photoFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById("avatarPreview").src = URL.createObjectURL(file);
    }
});


/* =========================================================
   ALTERAR SENHA
========================================================= */
document.getElementById("changePassword").addEventListener("click", async () => {
    const newPass = document.getElementById("newPassword").value.trim();
    const newPass2 = document.getElementById("newPassword2").value.trim();
    const msg = document.getElementById("profileMsg");

    msg.textContent = "";

    if (newPass.length < 6) {
        msg.textContent = "A senha deve ter pelo menos 6 caracteres!";
        return;
    }

    if (newPass !== newPass2) {
        msg.textContent = "As senhas não coincidem!";
        return;
    }

    try {
        await updatePassword(auth.currentUser, newPass);
        msg.style.color = "green";
        msg.textContent = "Senha alterada com sucesso!";
    } catch (error) {
        msg.textContent = "Erro ao mudar senha: " + error.message;
    }
});


/* =========================================================
   SALVAR ALTERAÇÕES (nome)
========================================================= */
document.getElementById("saveProfile").addEventListener("click", async () => {
    const name = document.getElementById("displayName").value.trim();
    const msg = document.getElementById("profileMsg");
    msg.textContent = "";

    if (!name) {
        msg.textContent = "O nome não pode ser vazio!";
        return;
    }

    try {
        // Salva no Auth
        await updateProfile(auth.currentUser, { displayName: name });

        // Salva no Firestore
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            nome: name,
            ultAtualizacao: new Date()
        });

        msg.style.color = "green";
        msg.textContent = "Perfil atualizado com sucesso!";
    } catch (error) {
        msg.style.color = "red";
        msg.textContent = "Erro ao salvar: " + error.message;
    }
});
