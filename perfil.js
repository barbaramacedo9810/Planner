import app, { db } from "./firebase.js";

import {
    getAuth,
    updateProfile,
    updatePassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ============================================================
   CONFIGURAÇÕES
============================================================ */
const auth = getAuth(app);
const storage = getStorage(app);

/* ============================================================
   ELEMENTOS
============================================================ */
const avatarPreview = document.getElementById("avatarPreview");
const photoFile = document.getElementById("photoFile");
const displayNameInput = document.getElementById("displayName");
const newPassword = document.getElementById("newPassword");
const newPassword2 = document.getElementById("newPassword2");
const saveProfileBtn = document.getElementById("saveProfile");
const changePasswordBtn = document.getElementById("changePassword");
const profileMsg = document.getElementById("profileMsg");

/* ============================================================
   CARREGAR DADOS DO USUÁRIO
============================================================ */
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Preenche nome e foto do Auth
    displayNameInput.value = user.displayName || "";
    if (user.photoURL) avatarPreview.src = user.photoURL;

    // Carregar do Firestore
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const data = snap.data();

            if (data.nome) displayNameInput.value = data.nome;
            if (data.foto) avatarPreview.src = data.foto;
        }
    } catch (err) {
        console.warn("Erro ao carregar Firestore:", err);
    }
});

/* ============================================================
   SALVAR PERFIL
============================================================ */
saveProfileBtn.addEventListener("click", async () => {
    profileMsg.textContent = "";
    const user = auth.currentUser;
    if (!user) return;

    try {
        let photoURL = user.photoURL || null;

        // Upload da foto
        if (photoFile.files.length > 0) {
            const file = photoFile.files[0];

            if (!file.type.startsWith("image/")) {
                profileMsg.textContent = "Envie apenas imagens!";
                return;
            }

            const arquivoRef = ref(storage, `users/${user.uid}/avatar_${Date.now()}`);
            await uploadBytes(arquivoRef, file);
            photoURL = await getDownloadURL(arquivoRef);
        }

        const nome = displayNameInput.value.trim();

        // Atualizar AUTH
        await updateProfile(user, {
            displayName: nome,
            photoURL: photoURL || null
        });

        // Atualizar Firestore
        await setDoc(doc(db, "users", user.uid), {
            nome,
            foto: photoURL,
            updatedAt: new Date()
        }, { merge: true });

        profileMsg.style.color = "green";
        profileMsg.textContent = "Perfil atualizado com sucesso!";
        avatarPreview.src = photoURL || "img/login.png";

    } catch (err) {
        console.error(err);
        profileMsg.style.color = "red";
        profileMsg.textContent = "Erro ao salvar perfil: " + err.message;
    }
});

/* ============================================================
   ALTERAR SENHA
============================================================ */
changePasswordBtn.addEventListener("click", async () => {
    profileMsg.textContent = "";

    const user = auth.currentUser;
    if (!user) return;

    const p1 = newPassword.value;
    const p2 = newPassword2.value;

    if (!p1 || p1 !== p2) {
        profileMsg.style.color = "red";
        profileMsg.textContent = "As senhas não coincidem!";
        return;
    }

    if (p1.length < 6) {
        profileMsg.style.color = "red";
        profileMsg.textContent = "Senha mínima: 6 caracteres.";
        return;
    }

    try {
        await updatePassword(user, p1);

        profileMsg.style.color = "green";
        profileMsg.textContent = "Senha atualizada!";
        newPassword.value = "";
        newPassword2.value = "";

    } catch (err) {
        console.error(err);

        if (err.code === "auth/requires-recent-login") {
            profileMsg.style.color = "red";
            profileMsg.textContent =
                "Faça login novamente para alterar a senha.";
            return;
        }

        profileMsg.style.color = "red";
        profileMsg.textContent = "Erro: " + err.message;
    }
});
