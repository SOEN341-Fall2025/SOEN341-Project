import './style/app.css';
import './style/settings.css';
import './style/style.css';
import React, { useState } from 'react';
import Login from './pages/Login.js';
import Main from './pages/Main.js';
import { Loader } from 'lucide-react';
function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [galleries, setGalleries] = useState([]);
  
    // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getCookie('authToken');
      if (token) {
        try {
          const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            setUserData(userInfo);
            setIsLoggedIn(true);
          } else {
            // Token is invalid or expired
            deleteCookie('authToken');
          }
        } catch (error) {
          console.error("Error checking auth status:", error);
        }
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Expiration in days
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`; // Set cookie
  };
    const getCookie = (name) => {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return null;
  };
  
  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
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
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password }),
          });
          
            if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.msg || 'Login failed');
      }
      
      const { token, msg } = await loginResponse.json();
      console.log("Login Success:", msg);  

          
          // Step 2: Get user info using token
          const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }, // Pass token in Authorization header
          });
       if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const userInfo = await userResponse.json();
      setUserData(userInfo);
      setIsLoggedIn(true);
      setCookie('authToken', token, 7); // Cookie valid for 7 days

    } catch (error) {
      console.error("Error during login:", error);
      alert(`Login failed: ${error.message}`);
      setIsLoggedIn(false);
    }
  };
    const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Clear user data regardless of response
      setIsLoggedIn(false);
      setUserData(null);
      deleteCookie('authToken');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <section>
    
     {/* Step 3: Conditionally render Login page or App page */}
      {isLoggedIn ? (
        <Main userData={userData} galleries={galleries} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </section>
  );
}

export default App;

