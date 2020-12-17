import React, {useState, useRef} from 'react'
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  //Your Configuration
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {

  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛💬</h1>
        Welcome To My Chat App: Jad Sultan
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn(){

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <button className="sign-in" onClick={signInWithGoogle}>Sign In with Google</button>
  )

}

function SignOut(){
  return auth.currentUser && (<button onClick={() => auth.signOut()}>Sign Out</button>)
}

function ChatRoom(){

  const dummy = useRef()

  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, {idField:'id'}) 
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }
  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>

    </div>

  )
}

export default App;
