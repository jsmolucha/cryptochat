import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

if (firebase.apps.length === 0) {
    firebase.initializeApp({
      apiKey: process.env.REACT_APP_API_KEY,
      authDomain: "cryptochat-913b6.firebaseapp.com",
      projectId: "cryptochat-913b6",
      storageBucket: "cryptochat-913b6.appspot.com",
      messagingSenderId: "1020396926070",
      appId: "1:1020396926070:web:385932d1345bb712b79b57",
      measurementId: "G-8TZ4YR5ZCN"
      //added measurement ID for analytics data modeling..
    })
  }
export const auth = firebase.auth();
export const db = firebase.firestore()

export default firebase