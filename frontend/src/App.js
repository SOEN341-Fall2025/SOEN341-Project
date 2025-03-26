import React, { useState, useEffect } from 'react';  
import './style/app.css';
import './style/settings.css';
import './style/style.css';
import Login from './pages/Login.js';
import Main from './pages/Main.js';
import { Loader } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'authenticated', or 'unauthenticated'
  const savedSession = localStorage.getItem('authToken');

  const fetchUserGalleries = async (token) => {
    try {
      const response = await fetch('/gal/retrieve', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to retrieve galleries');
      const result = await response.json();
      setGalleries(result.galleries);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!data.token) throw new Error('Login failed');
      
      localStorage.setItem('authToken', data.token);
      setUserData(data.user);
      setAuthStatus('authenticated');
      fetchUserGalleries(data.token);
      setIsLoggedIn(true)

    } catch (error) {
      console.error('Login failed:', error);
      setAuthStatus('unauthenticated');
      setIsLoggedIn(false);
    }
  };

  //Check if authToken exists first
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setAuthStatus('unauthenticated');
      return;
    }
  
    // Fetch the auth status of the user using the token
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(data => {
        if (data.valid) {
          setUserData(data.user);
          setAuthStatus('authenticated');
          fetchUserGalleries(token);
        } else {
          throw new Error('Invalid token');
        }
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        setAuthStatus('unauthenticated');
      });
  }, []); 
  
  // Fetch galleries when user data is changed
  useEffect(() => {
    if (userData) {
      const token = localStorage.getItem('authToken');
      if (token) {
        fetchUserGalleries(token);
      }
    }
  }, [userData]);
  
  // Auth status and user data is updated whenever authToken is modified
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            setUserData(data.user);
            setAuthStatus('authenticated');
          } else {
            throw new Error('Invalid token');
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setAuthStatus('unauthenticated');
        });
    } else {
      setAuthStatus('unauthenticated');
    }
  }, [authStatus]); 

  return (
    <section>
      {authStatus === 'checking' ? (
        <Loader />
      ) : authStatus === 'authenticated' && userData && galleries.length > 0 ? (
        <Main userData={userData} galleries={galleries} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </section>
  );
}

export default App;

