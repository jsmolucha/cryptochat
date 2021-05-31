import React, {useRef, useState} from 'react'
import './app2.css'

import firebase, {db,auth} from './services/firebase'
import {useCollectionData} from 'react-firebase-hooks/firestore'

//swithed to using classes because we want to be able to use states within our app.
//props are data in components that dont change, states are data that do change.
class App2 extends React.Component {
    state = {
        user: null
    }
    
    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if(user) {
                this.setState({
                    user: {
                        photoURL: user.photoURL,
                        email: user.email,
                        displayName: user.displayName,
                        uid: user.uid,
                        color: randUserColor(),
                        authprovider: user.providerData[0].providerId

                    }
                })
            } else {
                this.setState({user:null})
            }
        })
    }
    signInUserGit = () => {
        const provider2 = new firebase.auth.GithubAuthProvider();
        auth.signInWithPopup(provider2)
        .then((result) => {
            var user = result.user;
            console.log(user)
            this.setState({
                user: {
                    photoURL: user.photoURL,
                    displayName: user.displayName,
                    color: randUserColor(),
                    authprovider: user.providerData[0].providerId

                }
            })
        }).catch(function(error){
            console.log(error)
        })

    }

    signInUserGoogle = () => {  
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
        .then((result) => {
            var user = result.user;
            console.log(user)
            this.setState({
                user: {
                    photoURL: user.photoURL,
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid,
                    authprovider: user.providerData[0].providerId,
                    color: randUserColor()
                }
            })
        }).catch(function(error){
            console.log(error)
        })
    }

    signOutUser = () => {
        auth.signOut()

    }

// reformat structure to have just the homepage and then the dynamically rendered page where if the user is logged in it renders chatrrom
// and if theyre note logged in it renders the login page. Along with that, the signout button should be dynamic as well. 
// Previously had routing but routing was unnecessary since all we are doing is logging in and rendering page based on auth status.

    render() {
        return (
            <div className='App'>
                <section>
                    {this.state.user ? <ChatRoom /> : <LogIn signin={this.signInUserGoogle} signin2={this.signInUserGit}/>}
                </section>
                <footer>
                    <Signout signout={this.signOutUser} user={this.state.user}/>
                </footer>
                {
                    this.state.user &&
                <div>
                    <p>Current UID: {this.state.user.uid}</p>
                    <p>Authenticated with: {this.state.user.authprovider}</p>
                    <img src={this.state.user.photoURL} alt=''></img>
                </div>
                }
        </div>
        )
    }
}

function Signout(props) {
    return auth.currentUser && (
        <div>
          <button onClick={props.signout}> Sign out</button>
        </div>
      )
}

function LogIn(props) {
    return(
        <div>
            <h3>Log In</h3>
            <button onClick={props.signin}>Google Sign In</button>
            <button onClick={props.signin2}>GitHub Sign In</button>
        </div>
    )
}

function ChatRoom(props) {
    //making a dummy div to reference in order to keep scrolling towards the bottom ALWAYS
    const dummy = useRef()

    const messagesRef = db.collection('messages')
    const query = messagesRef.orderBy('createdAt').limit(25)
    const [messages] = useCollectionData(query, {idField: 'id'})
    const [formValue, setFormValue] = useState('')

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

    return (
    <div style={{backgroundColor:"#242C37"}}>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send message"/>
        <button type="submit">Submit</button>
      </form>
    </div>
    )
  }

function randUserColor() {
    //this function will set the users color to random to differentiate chats
    //progress: currently makes a random color for every single message. We want this on a user to user basis.
    var letters = '0123456789ABCDEF'
    var color = '#'
    for(var i=0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
      return color
    }

function ChatMessage(props) {
    const {text, uid} = props.message;  
    //checks to see if the message was sent or recieved from the user
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved'
    //okedoke big to do because now we gotta get that color form the DB and set a live listener on that user
    return(
        <div className={`message${messageClass}`}>
            <p style={{color:`${randUserColor()}`}}>{uid}: </p>
            <p style={{color: "rgba(255,255,255)"}}>{text}</p>
        </div>
    )
}

export default App2;