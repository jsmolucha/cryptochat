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
                    {this.state.user ? <ChatRoom uid={this.state.user.uid} authprovider={this.state.user.authprovider} /> : 
                    <LogIn signin={this.signInUserGoogle} signin2={this.signInUserGit}/>}
                </section>
                <footer>
                    <Signout signout={this.signOutUser} user={this.state.user}/>
                </footer>
            </div>
        )
    }
}

function Signout(props) {
    return auth.currentUser && (
        <div>
          <button className='signout' onClick={props.signout}> Sign out</button>
        </div>
      )
}

function LogIn(props) {
    return(
        <div className='login-page'>
            <h3>Log in</h3>
            <button onClick={props.signin} className='google-auth'>Log in with Google</button>
            <button onClick={props.signin2} className='github-auth'>Log in with Github</button>
            <p className='terms'>By signing in, you are accepting our</p>
            <p className='tandc'>Terms and Conditions.</p>
        </div>
    )
}

function ChatRoom(props) {
    const dummy = useRef()
/* 
    const messagesRef = db.collection('messages')
    const query = messagesRef.orderBy('createdAt').limit(25)
    const [messages] = useCollectionData(query, {idField: 'id'}) */

    const [formValue, setFormValue] = useState('')
    const [currentRoom, setcurrentRoom] = useState('messages')

    const chatRoom = db.collection(currentRoom)
    const customQuery = chatRoom.orderBy("createdAt").limitToLast(25)
    const [room] = useCollectionData(customQuery, {idField:'id'})

    const sendMessage = async(e) => {
      e.preventDefault();
      const {uid} = auth.currentUser;

      //had to add filtering function to prevent submitting empty strings
      if (formValue === '') {
        alert("Please type something first")
      } else {
        await chatRoom.add({
          text: formValue,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid,
        });
      }

      setFormValue('')
      dummy.current.scrollIntoView({behavior: 'smooth'})
    }

    console.log(currentRoom)
    return (
    <div className="chat-room ">
        <div className='room-dropdown'>
            <label for="rooms"></label>
                <select name="rooms" value={currentRoom} onChange={(e) => setcurrentRoom(e.target.value)} className="drop-down-menu">
                    <option value="messages">General</option>
                    <option value="bitcoin">BTC</option>
                    <option value="dogecoin">DOGE</option>
                    <option value="etherium">ETH</option>
                </select>
        </div>
      <div className='chat-container'>
        <main className='chat-feed'>
            {room && room.map(msg => <ChatMessage key={msg.id} message={msg} chatRoom={chatRoom}  />)}
            <span ref={dummy}></span>
        </main>
        <form onSubmit={sendMessage} className='message-form'>
            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message" className='message-field'/>
            <button type="submit" className='message-send'>Send</button>
        </form>
      </div>
      <div className='info-area'>
        <div className='info-card'>
            <p style={{color: "white"}}>Current UID: {props.uid}</p>
            <p style={{color: "white"}}>Authenticated with: {props.authprovider}</p>
            <p style={{color: "white"}}>Current Room: {currentRoom}</p>
        </div>
      </div>
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
    const [colorValue] = useState(randUserColor());
    
    //checks to see if the message was sent or recieved from the user
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved'

    
    return(
        <div className={`message${messageClass}`} >
            <p className="chat-name" style={{color:colorValue}}>{uid}</p>
            <p style={{color: "rgba(255,255,255)"}}>: {text}</p>
        </div>
    )
}

export default App2;