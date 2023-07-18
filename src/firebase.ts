// firebase.ts
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
    apiKey: "AIzaSyBf4_MrCK_DiEtV79rw1ICraTYa4XuM7yM",
    authDomain: "flying-cards-d9d8a.firebaseapp.com",
    projectId: "flying-cards-d9d8a",
    storageBucket: "flying-cards-d9d8a.appspot.com",
    messagingSenderId: "185655424208",
    appId: "1:185655424208:web:41e5d342350c3b4794dad5",
    measurementId: "G-NZ8PLMD63Z"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
let analyticsPromise = isSupported().then((isSupported) => {
  if (isSupported) {
    return getAnalytics(app)
  }
})

export { db, analyticsPromise }
