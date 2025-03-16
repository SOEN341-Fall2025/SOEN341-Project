import './style/app.css';
import './style/settings.css';
import React, { useState, createContext } from 'react';
import AppContext from './AppContext';
import Settings from './pages/Settings.js';
import './style/style.css';
import './style/style.css';
import React, { useState } from 'react';
import Login from './pages/Login.js';
import Main from './pages/Main.js';
function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [galleries, setGalleries] = useState([]);
  //const [token, setToken] = useState('');
  
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Expiration in days
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`; // Set cookie
  };
  
  const handleLogin = async (email, password) => {
    // Here, you can add authentication logic (API call or checking credentials)
    // For now, just set it to true to simulate successful login
    console.log("DEBUG: handleLogin called with:", email, password);
    //setIsLoggedIn(true);
        try {
          // Step 1: Login and get token
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          if (!loginResponse.ok) throw new Error('Login failed');
          const { token } = await loginResponse.json();
          
          console.log("Login Success:", JSON.stringify({ email, password }));   

          
          // Step 2: Get user info using token
          const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }, // Pass token in Authorization header
          });
          if (!userResponse.ok) throw new Error('Failed to fetch user info');
          const userInfo = await userResponse.json();
          setUserData(userInfo); // Save user info
          //console.log("userResponse Success:", userInfo);   
          
          setIsLoggedIn(true); // Mark as logged in 
          // Example usage after login
          setCookie('authToken', token, 1); // Cookie valid for 7 days          
          
        } catch (error) {
          console.error("Error during login:", error);
          setIsLoggedIn(false);
        }      
  };
  return (
    <section>
    
      {/* Step 3: Conditionally render Login page or App page */}
      {isLoggedIn ? (
        <Main userData={userData} galleries={galleries}/>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </section>
  );
}
export default App;