import React from 'react'
import './app2.css'
import {
    BrowserRouter as Router,
    Route,
    NavLink
} from 'react-router-dom'

import firebase, {db,auth} from './services/firebase'

//swithed to using classes because we want to be able to use states within our app.
//props are data in components that dont change, states are data that do change.
class App2 extends React.Component {
    state = {
        user: null
    }

    signInUser = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
        .then(function(result) {
            var user = result.user;
            console.log(user)
        }).catch(function(error){
            console.log(error)
        })
    }
    render() {
        return (
            <div className='App'>
            <Router>
                <Route exact path='/' component={Home} />
                <Route path='/login' component={() => <LogIn signin={this.signInUser} />} />
                <Route path='/signup' component={SignUp} />
            </Router>
        </div>

        )
    }
}

function LogIn(props) {
    return(
        <div>
            <h3>Log In</h3>
            <button onClick={props.signin}>Google Sign In</button>
        </div>
    )
}

function SignUp() {
    return(
        <div>
            <h3>Sign Up</h3>
        </div>
    )
}

function Home() {
    return(
        <h1>cryptochat</h1>
    )
}

export default App2;