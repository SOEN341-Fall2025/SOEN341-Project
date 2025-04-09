import './style/app.css';
import './style/settings.css';
import './style/style.css';
import React, { useState, useEffect } from 'react';
import Login from './pages/Login.js';
import Main from './pages/Main.js';
import Exhibit from './pages/Exhibit';
import { Loader } from 'lucide-react';
function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking', 'authenticated', or 'unauthenticated'
  const savedSession = localStorage.getItem('authToken');

  const post = {
    imageUrl: "../assets/background.jpg",
    username: "Alice",
    caption: "I love Bubbles!",
    timestamp: "2025-03-27T15:00:00-06:00",
    likes: 4,
    comments: [
      {
        id: 1,
        username: "user1",
        text: "loveeeee",
        timestamp: "2025-03-27T15:05:00-06:00"
      },
      {
        id: 2,
        username: "user2",
        text: "cute pic ;)",
        timestamp: "2025-03-27T15:10:00-06:00"
      }
    ]
  };

  // Define user data (current viewer)
  const user = {
    username: "alice" // The logged-in user's username
  };

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
          setUserData(userData.user[0]);
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
  
  /*useEffect(() => {
    const token = savedSession;
    //console.log("Token found in localStorage:", token ? "Yes" : "No");
  
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
      .then(([userResponse, galleriesResponse]) => {
        //console.log("Galleries response status:", galleriesResponse.status);
        return Promise.all([userResponse.json(), galleriesResponse.json()]);
      })
      .then(([userData, galleriesData]) => {
        //console.log("User data received:", userData);
        //console.log("Galleries data received:", galleriesData);
        setUserData(userData);
        setGalleries(galleriesData);
        setAuthStatus('authenticated');
        setIsLoggedIn(true);
      })
      .catch(error => {
        //console.error('Authentication failed:', error);
        localStorage.removeItem('auth-token');
        setIsLoggedIn(false);
        setAuthStatus('unauthenticated');
        setIsLoading(false);
      })
      .finally(() => {setIsLoading(false);});
    } else {
      //console.log("No token found, user is not logged in");
      setIsLoggedIn(false);
      setAuthStatus('unauthenticated');
      setIsLoading(false);
    }
  }, []);*/
  
  const login = async (email, password) => {
    try {
      // Perform login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('auth-token', JSON.stringify(data.token));        
        
        // Fetch user data
        const userResponse = await fetch('/api/get/me', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const userData = await userResponse.json();
        setUserData(userData.user[0]);
        // Fetch user galleries
        const galleriesResponse = await fetch('/api/gallery/all', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const galleriesData = await galleriesResponse.json();
        setGalleries(galleriesData);        
        setAuthStatus('authenticated');
        //setIsLoggedIn(true);
      }
    } catch (error) {
      //console.error('Login failed:', error);
    }
  };
  
  /*
  const handleLogin = async (email, password) => { //console.log("DEBUG: handleLogin called with:", email, password);
    const userToken = localStorage.getItem('auth-token');    
    try {
      // Step 1: Login and get token
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });          
      if (!loginResponse.ok) throw new Error('Login failed');
      const { token } = await loginResponse.json();          
      //console.log("Login Success:", JSON.stringify({ email, password }));             
      
      // Step 2: Get user info using token
      const userResponse = await fetch('/api/get/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }, // Pass token in Authorization header
      });
      if (!userResponse.ok) throw new Error('Failed to fetch user info');
      const userInfo = await userResponse.json();
      setUserData(userInfo); // Save user info
      //console.log("userResponse Success:", userInfo);   
      
      // Step 3: Fetch galleries using user ID
      const galleriesResponse = await fetch('/api/gallery/all', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }, // Pass token in Authorization header
      });
      if (!galleriesResponse.ok) throw new Error('Failed to fetch galleries');
      const galleryData = await galleriesResponse.json();
      //console.log("galleriesResponse Success:", galleryData);   
      
      setGalleries(galleryData); // Save galleries
      setIsLoggedIn(true); // Mark as logged in 
      localStorage.setItem('auth-token', token);
      //console.log(localStorage.getItem('auth-token'));
    } catch (error) {
      //console.error("Error during login:", error);
      setIsLoggedIn(false);
    }  
  };*/
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
  );

}

export default App;