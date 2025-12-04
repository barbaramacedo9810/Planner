import app from "./firebase.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

/* =================================================
   FUNÇÃO PARA VALIDAR FORÇA DA SENHA
=================================================== */
function validarSenha(senha) {
    const regras = {
        minimo: senha.length >= 6,
        letra: /[A-Za-z]/.test(senha),
        numero: /[0-9]/.test(senha),
        simbolo: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
    };

    return regras.minimo && regras.letra && regras.numero && regras.simbolo;
}

/* =================================================
   CRIAÇÃO DE NOVO USUÁRIO
=================================================== */
const form = document.getElementById("registerForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const senha2 = document.getElementById("senha2").value.trim();
        const errorMsg = document.getElementById("errorMsg");

        errorMsg.textContent = "";

        // Campos vazios
        if (!email || !senha || !senha2) {
            errorMsg.textContent = "Preencha todos os campos!";
            return;
        }

        // Senhas iguais?
        if (senha !== senha2) {
            errorMsg.textContent = "As senhas não coincidem!";
            return;
        }

        // Senha forte
        if (!validarSenha(senha)) {
            errorMsg.textContent =
                "A senha deve ter no mínimo 6 caracteres e incluir letra, número e símbolo.";
            return;
        }

        try {
            // 🔥 Cria usuário no Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            // 🔥 Cria documento no Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                nome: "",
                foto: "",
                criadoEm: new Date(),
                ultAtualizacao: new Date(),
                preferencias: {
                    tema: "claro",
                    notificacoes: true
                }
            });

            // 👍 Redireciona após criar conta
            window.location.href = "calendario.html";

        } catch (error) {
            console.error("Erro criar conta:", error);

            if (error.code === "auth/email-already-in-use") {
                errorMsg.textContent = "Este e-mail já está cadastrado!";
            } else if (error.code === "auth/invalid-email") {
                errorMsg.textContent = "Digite um e-mail válido!";
            } else if (error.code === "auth/weak-password") {
                errorMsg.textContent = "Senha muito fraca!";
            } else {
                errorMsg.textContent = "Erro ao criar conta: " + error.message;
            }
        }
    });
}
