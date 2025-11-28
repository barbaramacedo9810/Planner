import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA_Al0b-GSkj2rB98hY9LogbxVTbZIPQPU",
    authDomain: "planner-3127a.firebaseapp.com",
    projectId: "planner-3127a",
    storageBucket: "planner-3127a.firebasestorage.app",
    messagingSenderId: "236636645828",
    appId: "1:236636645828:web:0c4445bb4e43ed2cb01c91",
    measurementId: "G-F733M6GBZZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
