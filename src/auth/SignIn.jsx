import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import supabaseClient from '../config/supabaseClient';

const SignIn = () => {
  const { user, setUser } = useAuth();

  if (user) {
    return <Navigate to="/" />;
  }

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      setUser(data.user);
    } catch (error) {
      console.error('Google Sign-In Error:', error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  px-4 py-6">
      <h1 className="text-3xl font-semibold text-center text-yellow-600 mb-6">
        Welcome Back to <span className='font-bold text-4xl'>Masroofy</span>
      </h1>
      <p className="text-lg text-gray-200 text-center mb-8 max-w-lg">
        Sign in to manage your finances, track your spending, and stay on top of your budgeting goals.
        Your data is securely stored, and we help you keep track of everything in one place.
      </p>
      <button
        onClick={handleGoogleSignIn}
        className="bg-yellow-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-800 transition-all duration-300"
      >
        Sign in with Google
      </button>
      <p className="text-sm text-center text-gray-500 mt-4">
        Don't have an account?{' '}
        <a href="" className="text-yellow-600 hover:text-yellow-700 font-medium">
          Sign up here
        </a>
      </p>
    </div>
  );
};

export default SignIn;
