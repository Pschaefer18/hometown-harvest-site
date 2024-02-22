import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyD1XjZ4g6pbvTiwB-HxHczIBtEpOEg-RtI",
    authDomain: "csa-registration-1ed70.firebaseapp.com",
    databaseURL: "https://csa-registration-1ed70-default-rtdb.firebaseio.com",
    projectId: "csa-registration-1ed70",
    storageBucket: "csa-registration-1ed70.appspot.com",
    messagingSenderId: "953766080846",
    appId: "1:953766080846:web:77b75ab16b5a0369122e1f",
    measurementId: "G-63FF0HY6K3"
  };
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);