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
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* =========================================================
   CONFIG
========================================================= */
const auth = getAuth(app);
const storage = getStorage(app);

/* =========================================================
   UPLOAD DA FOTO DE PERFIL
========================================================= */
async function uploadProfilePhoto(file, uid) {
    const storageRef = ref(storage, `usuarios/${uid}/perfil.jpg`);

    // envia arquivo
    await uploadBytes(storageRef, file);

    // retorna URL
    return await getDownloadURL(storageRef);
}

/* =========================================================
   CARREGAR DADOS AO ABRIR A PÁGINA
========================================================= */
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // email vem do Auth
    document.getElementById("email").value = user.email;
    const nameInput = document.getElementById("displayName");

    try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));

        if (snap.exists() && snap.data().nome) {
            nameInput.value = snap.data().nome;
        } else if (user.displayName) {
            nameInput.value = user.displayName;
        } else {
            nameInput.value = "";
        }
    } catch (error) {
        console.error("Erro ao carregar nome:", error);
        nameInput.value = "";
    }

    // foto
    const avatar = document.getElementById("avatarPreview");
    if (user.photoURL) {
        avatar.src = user.photoURL;
    }
});

/* =========================================================
   PRÉ-VISUALIZAÇÃO DA FOTO
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
   SALVAR PERFIL (nome + foto)
========================================================= */
document.getElementById("saveProfile").addEventListener("click", async () => {
    const name = document.getElementById("displayName").value.trim();
    const msg = document.getElementById("profileMsg");
    const file = document.getElementById("photoFile").files[0];
    const uid = auth.currentUser.uid;

    msg.textContent = "";
    msg.style.color = "red";

    if (!name) {
        msg.textContent = "O nome não pode ser vazio!";
        return;
    }

    try {
        /* -----------------------------
            1. Atualiza nome no Auth
        ------------------------------ */
        await updateProfile(auth.currentUser, { displayName: name });

        /* -----------------------------
            2. Upload da foto (se existir)
        ------------------------------ */
        let photoURL = auth.currentUser.photoURL;

        if (file) {
            photoURL = await uploadProfilePhoto(file, uid);
            await updateProfile(auth.currentUser, { photoURL });
        }

        /* -----------------------------
            3. Salva no Firestore
        ------------------------------ */
        await setDoc(
            doc(db, "usuarios", uid),
            {
                nome: name,
                fotoURL: photoURL || null,
                ultAtualizacao: new Date()
            },
            { merge: true }
        );

        msg.style.color = "green";
        msg.textContent = "Perfil atualizado com sucesso!";

        if (photoURL) {
            document.getElementById("avatarPreview").src = photoURL;
        }

    } catch (error) {
        msg.textContent = "Erro ao salvar: " + error.message;
    }
});
