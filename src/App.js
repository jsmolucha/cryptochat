import React, {useRef, useState} from 'react'

//firebase init
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

//firebase hooks for user state and authentication
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'

//firebase project variables
if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: "AIzaSyBp7N9DwpxrtuUIpLT8VqujGdUiiDocbw0",
    authDomain: "cryptochat-913b6.firebaseapp.com",
    projectId: "cryptochat-913b6",
    storageBucket: "cryptochat-913b6.appspot.com",
    messagingSenderId: "1020396926070",
    appId: "1:1020396926070:web:385932d1345bb712b79b57",
    measurementId: "G-8TZ4YR5ZCN"
    //added measurement ID for analytics data modeling..
  })
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  //the github provider address
  var provider = new firebase.auth.GithubAuthProvider();

  //github authentication
  function githubSignin() {
    firebase.auth().signInWithPopup(provider)
    .then(function(result) {
       var token = result.credential.accessToken;
       var user = result.user;
     
       console.log(token)
       console.log(user)
    }).catch(function(error) {
       var errorCode = error.code;
       var errorMessage = error.message;
     
       console.log(errorCode)
       console.log(errorMessage)
    });
 }

  return (
    <div>
      <button onClick={signInWithGoogle}> Sign in with google</button>
      <button onClick={githubSignin} > Sign in with github</button>
    </div>
    
  )
}

function SignOut() {
  return auth.currentUser && (
    <div>
      <button onClick={() => auth.signOut()}> Sign out</button>
    </div>
    
  )
}

function randUserColor() {
//this function will set the users color to random to differentiate chats
//progress: currently makes a random color for every single message. We want this on a user to user basis.
//still kinda crude b/c its manual BUT it works well for the time being, plus colors are very bad.. not coherent at ALL.
var letters = '0123456789ABCDEF'
var color = '#'
for(var i=0; i < 6; i++) {
  color += letters[Math.floor(Math.random() * 16)]
}
  return color
}

function ChatRoom() {
  //making a dummy div to reference in order to keep scrolling towards the bottom ALWAYS
  const dummy = useRef()
  //                                        ' here '
  //this will switch chatrooms effectively
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)
  const [messages] = useCollectionData(query, {idField: 'id'})
  const [formValue, setFormValue] = useState('')
  const currentUser = firebase.auth().currentUser;
  const uid = currentUser.uid
  const db = firebase.firestore()
  const colors  = db.collection('users')

  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid} = auth.currentUser;
    //had to add statement to prevent spamming empty messages.
    if (formValue === '') {
      alert("Please type something first")
    } else {
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
      });
    }

    setFormValue('')
    dummy.current.scrollIntoView({behavior: 'smooth'})
  }

  //takes the input and sends the field data into the database.
  const modifychatcolor = async(e) => {
    e.preventDefault();
    const userColor = {chatColor: randUserColor()}
    firebase.firestore().doc(`/users/${uid}`).set(userColor, {merge: true});
  }

  //make an async function that fetches the color from the firestore db
  const usercolor = async() => {
    const doc = await colors.doc(`${uid}`).get();
    if (doc.exists) {
      console.log(doc.data().chatColor)
      return doc.data().chatColor;
    } else {
      return 'color not found'
    }
  }

  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <div ref={dummy}></div>
    </main>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send message"/>
      <button type="submit">Submit</button>
    </form>

    <form onSubmit={modifychatcolor}>
      <button type='submit' onClick={usercolor}>change color</button>
    </form>
    <p>current user: {uid}</p>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid} = props.message;

  //checks to see if the message was sent or recieved from the user
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved'

  //okedoke big to do because now we gotta get that color form the DB and set a live listener on that user
  return(
    <div className={`message ${messageClass}`}>
          <p style={{color:`${randUserColor()}`}}>{uid}</p>
          <p >{text}</p>
    </div>
  )
}

//getting the color from the DB and converting it into a dataset that CSS can read.
function getColor() {
  const currentUser = firebase.auth().currentUser;
  const uid  = currentUser.uid
  firestore.collection('users').doc(`${uid}`)
    .onSnapshot((doc) =>  {
      var dataextracted = doc.data().chatColor
      console.log(dataextracted)
      return dataextracted
    })
}

export default App;
