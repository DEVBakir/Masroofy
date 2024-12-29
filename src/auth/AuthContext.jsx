import React, { createContext, useContext, useEffect, useState } from 'react';
import supabaseClient from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data:  userdata , error  } = await supabaseClient.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        setLoading(false);
      } else if (userdata) {
        setUser(userdata.user);  
        console.log('User data:', userdata);
        console.log('this from state user',user);
        setLoading(false);
        // navigate('/');
      } else {
        setLoading(false);  
        // navigate('/sign');
        // Redirect to sign-in if no user is found
      }
      
      
    };

    getUser();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe(); // Cleanup subscription
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
