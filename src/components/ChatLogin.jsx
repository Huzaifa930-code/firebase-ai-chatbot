import { useState } from 'react';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';

const ChatLogin = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (isSignup) {
        // Create new user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        onLogin(user.email);
      } else {
        // Sign in existing user with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        onLogin(user.email);
      }
    } catch (error) {
      console.error('Authentication error:', error);

      // Check if it's a Firebase configuration issue
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/invalid-app-credential' || error.message.includes('Firebase')) {
        setError('Firebase not configured. Please set up your Firebase credentials or use guest mode.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email already exists. Try logging in instead.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Authentication failed. Please try again or use guest mode.');
      }
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    try {
      // Try Firebase anonymous auth first
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      console.log('Firebase anonymous login successful');
      onLogin('guest');
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      console.log('Falling back to local guest mode');

      // Always fall back to local guest mode if Firebase fails
      onLogin('guest');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Chatbot</h1>
          <p className="text-white/70">
            {isSignup ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm text-base"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 sm:py-4 rounded-xl bg-white/30 text-white hover:bg-white/40 transition-all duration-200 backdrop-blur-sm border border-white/30 flex items-center justify-center gap-2 font-semibold text-base min-h-[44px] sm:min-h-[48px]"
          >
            {isSignup ? (
              <>
                <UserPlus className="w-5 h-5" />
                Sign Up
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-white/80 hover:text-white transition-colors text-sm py-2 px-4 rounded-lg min-h-[44px] flex items-center justify-center"
          >
            {isSignup
              ? 'Already have an account? Login'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleGuestLogin}
            className="text-white/60 hover:text-white/80 transition-colors text-sm py-2 px-4 rounded-lg min-h-[44px] flex items-center justify-center"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLogin;