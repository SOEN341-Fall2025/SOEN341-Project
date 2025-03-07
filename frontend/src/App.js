import './style/app.css';
import './style/settings.css';
import React, { useState } from 'react';
import AppContext from './AppContext';
import Settings from './pages/Settings.js';
import './style/style.css';
import Login from './pages/Login.js';
import Main from './pages/Main.js'
function App() {
  

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (email, password) => {
    // Here, you can add authentication logic (API call or checking credentials)
    // For now, just set it to true to simulate successful login

    console.log("DEBUG: handleLogin called with:", email, password);
    //setIsLoggedIn(true);
    try{
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.token) {
        console.log("Login was unsuccessful.", data);
        setIsLoggedIn(false);
        return;
      }

      console.log("Login was successful.", data);
      setIsLoggedIn(true);

    }catch(error){
      console.error("There was an error during login.");
    }
  };

  return (
    <section>
    
      {/* Step 3: Conditionally render Login page or App page */}
      {isLoggedIn ? (
        <Main />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </section>
  );
}

export default App;
