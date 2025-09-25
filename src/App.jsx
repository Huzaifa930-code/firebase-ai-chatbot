import { useState, useEffect } from 'react'
import Chatbot from './components/Chatbot'
import ChatLogin from './components/ChatLogin'
import { auth } from './config/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email || 'guest')
        setIsLoggedIn(true)
      } else {
        setCurrentUser(null)
        setIsLoggedIn(false)
      }
    }, (error) => {
      // Handle Firebase auth errors gracefully
      console.error('Firebase auth error:', error);
    });

    return () => unsubscribe();
  }, [])

  const handleLogin = (username) => {
    // For local guest mode when Firebase isn't working
    if (username === 'guest') {
      setCurrentUser('guest')
      setIsLoggedIn(true)
    }
    // Firebase auth state will be handled by onAuthStateChanged for other cases
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Firebase auth state will be handled by onAuthStateChanged
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {!isLoggedIn ? (
        <ChatLogin onLogin={handleLogin} />
      ) : (
        <Chatbot user={currentUser} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
