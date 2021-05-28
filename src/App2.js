import React, {useRef, useState} from 'react'
import './app2.css'
import {
    BrowserRouter as Router,
    Route,
    NavLink,
    Redirect,
    useHistory
} from 'react-router-dom'

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
                        displayName: user.displayName
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
                    displayName: user.displayName
                }
            })
        }).catch(function(error){
            console.log(error)
        })

    }

    signInUser = () => {  
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
        .then((result) => {
            var user = result.user;
            console.log(user)
            this.setState({
                user: {
                    photoURL: user.photoURL,
                    email: user.email,
                    displayName: user.displayName
                }
            })
        }).catch(function(error){
            console.log(error)
        })
    }

    signOutUser = () => {
        auth.signOut()

    }

    render() {
        return (
            <div className='App'>
            <Router>
                <Route exact path='/' component={Home} />
                <Route path='/login' render={() => (!this.state.user ? <LogIn signin={this.signInUser} signin2={this.signInUserGit} /> :
                    <Redirect to='/chatroom'/> )} />
                <Route path='/chatroom' component={ChatRoom}/>
                <Nav signout={this.signOutUser} user={this.state.user}/>
            </Router>
{/* 
            {
                this.state.user &&
            <div>
                <h2>{this.state.user.displayName}</h2>
                <img src={this.state.user.photoURL}></img>
            </div>
            } */}
        </div>
        )
    }
}

function Nav(props) {
    return(
        <div>
            <button>
                <NavLink to='/'>Home</NavLink>
            </button>
            {
                props.user &&
                <button onClick={props.signout} >
                <NavLink to='/'>signout</NavLink>
                </button>

            }
            {
                !props.user &&
                <button>
                <NavLink to='/login'>login</NavLink>
                </button>
            }
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

function Home() {
    return(
        <h1>cryptochat</h1>
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
    //still kinda crude b/c its manual BUT it works well for the time being, plus colors are very bad.. not coherent at ALL.
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
      <div className={`message ${messageClass}`}>
            <p style={{color:`${randUserColor()}`}}>{uid}: </p>
            <p style={{color: "rgba(93, 114, 144)"}}>{text}</p>
      </div>
    )
  }

export default App2;