import React, { useRef, useState } from 'react'
import './App.css';

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
    appId: "1:1020396926070:web:385932d1345bb712b79b57"
  
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
     
       console.log(error.code)
       console.log(error.message)
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
//add drop down with the diff chat rooms
//drop down will have a value
//insert that value into

function ChatRoom() {
  const dummy = useRef()
  //                                        ' here '
  //this will switch chatrooms effectively
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)
  const [messages] = useCollectionData(query, {idField: 'id'})
  const [formValue, setFormValue] = useState('')

  const sendMessage = async(e) => {

    e.preventDefault();
    const {uid} = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid

    });

    setFormValue('')
    dummy.current.scrollIntoView({behavior: 'smooth'})
  }
  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <div ref={dummy}></div>
    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice"/>
      <button type="submit">Submit</button>
    </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid} = props.message;
  //checks to see if the message was sent or recieved from the user
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved'
  return(
    <div className={`message ${messageClass}`}>
          <p>{uid}</p>
          <p>{text}</p>

    </div>
  )
}
export default App;
