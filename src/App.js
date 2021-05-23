import React, { useRef, useState } from 'react'

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

function randUserId() {
//this function will randomise the user id and will display it to increase anonimoty

}

//array of possible random colors to get


function randUserColor() {
//this function will set the users color to random to differentiate chats
//progress: currently makes a random color for every single message. We want this on a user to user basis.
//still kinda crude b/c its manual BUT it works well for the time being, plus colors are very bad.. not coherent at ALL.

var chatcolors = [
  '#C0C0C0',
  '#808080',
  '#000000',
  '#FF0000',
  '#800000',
  '#FFFF00',
  '#00FF00',
  '#008000',
  '#00FFFF',
  '#008080'
]

var number = Math.floor(Math.random() * 10)
var color = chatcolors[number]
return color;

}

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

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send message"/>
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
          <p style={{backgroundColor: `${randUserColor()}`}} >{uid}</p>
          <p >{text}</p>

    </div>
  )
}

//this is strictly just for testing the recieving user information.
//currently works and returns the info of the current use to the console when called.
function userinfotest() {
  var user = firebase.auth().currentUser;

  if (user != null) {
    user.providerData.forEach(function (profile) {
      console.log("Sign-in provider: " + profile.providerId);
      console.log("Provider-specific UID: " + profile.uid);
      console.log("Name: " + profile.displayName);
      console.log("Email: " + profile.email);
      console.log("Photo URL: " + profile.photoURL);
    });
  }
}

export default App;
