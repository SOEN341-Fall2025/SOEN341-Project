import './style/app.css';
import './style/settings.css';
import './style/style.css';
import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import Login from './pages/Login.js';
import Main from './pages/Main.js';
import { Loader } from 'lucide-react';
import { Loader } from 'lucide-react';
function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [galleryChannels, setGalleryChannels] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'authenticated', or 'unauthenticated'  
  const savedSession = JSON.parse(localStorage.getItem('auth-token'));
  useEffect(() => {
    const checkAuth = async () => {
      const token = savedSession;
      if (!token) {
        setAuthStatus('unauthenticated');
        return;
      }
  
      if (token) {
        //console.log("Attempting to validate token...");
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
          //console.log("Token validation response status:", response.status);
          return response.json();
        })
        .then(data => {
          //console.log("Token validation response:", data.valid);
          if (data.valid) {
            //console.log("Token is valid, fetching user data and galleries...");
            return Promise.all([
              fetch('/api/get/me', { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch('/api/gallery/all', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
          } else {
            throw new Error('Invalid token');
          }
        })
        .then(([userResponse, galleriesResponse, channelResponse]) => {
          ////console.log("Galleries response status:", galleriesResponse.status);
          return Promise.all([userResponse.json(), galleriesResponse.json()]);
        })
        .then(([userData, galleriesData]) => {
          //console.log("User data received:", userData);
          //console.log("Galleries data received:", galleriesData);
          setUserData(userData);
          setGalleries(galleriesData);
          setAuthStatus('authenticated');
          //setIsLoggedIn(true);
        })
        .catch(error => {
          //console.error('Authentication failed:', error);
          localStorage.removeItem('auth-token');
          //setIsLoggedIn(false);
          setAuthStatus('unauthenticated');
          //setIsLoading(false);
        })
        //.finally(() => {setIsLoading(false);})
        ;
      } else {
        //console.log("No token found, user is not logged in");
        //setIsLoggedIn(false);
        setAuthStatus('unauthenticated');
        //setIsLoading(false);
      }
    };
  
    checkAuth();
  }, []);
  
  
  return (
    <section>   
    {authStatus === 'checking' ? (
      <Loader />
    ) : authStatus === 'authenticated' && userData && galleries ? (
      <Main userData={userData} galleries={galleries} />
    ) : (
      <Login onLogin={login} />
    )}    
  </section>
    <section>   
    {authStatus === 'checking' ? (
      <Loader />
    ) : authStatus === 'authenticated' && userData && galleries ? (
      <Main userData={userData} galleries={galleries} />
    ) : (
      <Login onLogin={login} />
    )}    
  </section>
  );
}

export default App;