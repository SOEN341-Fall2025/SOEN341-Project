import './style/app.css';
import './style/settings.css';
import './style/style.css';
import React, { useState, useCallback } from 'react';
import Login from './pages/Login.js';
import Main from './pages/Main.js';
function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState("false");
  const [userData, setUserData] = useState(null);
  const [galleries, setGalleries] = useState([]);
  //const [token, setToken] = useState('');
  
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
          //if (!token.token) { console.error("Invalid login response:", loginResponse); throw new Error('No token received'); }
          console.log("Login Success:", JSON.stringify({ email, password }));   
          // Step 2: Get user info using token
          const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }, // Pass token in Authorization header
          });
          if (!userResponse.ok) throw new Error('Failed to fetch user info');
          const userInfo = await userResponse.json();
          setUserData(userInfo); // Save user info
          console.log("userResponse Success:", userInfo);   
          // Step 3: Fetch galleries using user ID
          const galleriesResponse = await fetch(`/api/user/galleries?id=${userInfo.user.id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }, // Pass token in Authorization header
          });
          if (!galleriesResponse.ok) throw new Error('Failed to fetch galleries');
          const galleryData = await galleriesResponse.json();
          console.log("galleriesResponse Success:", galleryData);   
          setGalleries(galleryData); // Save galleries
          setIsLoggedIn(true); // Mark as logged in 
          
        } catch (error) {
          console.error("Error during login:", error);
          setIsLoggedIn(false);
        }      
  };
  
  /* Wrap fetchUserData with useCallback to stabilize its reference
  const fetchUserData = useCallback(async () => {
    console.log("DEBUG: getUserData called with:", userEmail);

    try {
      const response = await fetch(`/api/auth/me?email=${userEmail}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      //console.log("Successful:", data);
      setUserData(data);
      return data;
    } catch (error) {
      console.error("Error during fetching user data:", error);
      setUserData({});
    }
  }, [userEmail, token]); // Dependencies for useCallback
*/
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