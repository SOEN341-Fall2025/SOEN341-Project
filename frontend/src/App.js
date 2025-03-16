import './style/app.css';
import './style/settings.css';
import React, { useState } from 'react';
import {AppContext} from './AppContext';
import Settings from './pages/Settings.js';
import './style/style.css';
import Login from './pages/Login.js';


import $ from 'jquery';
import { Resizable } from 're-resizable';

import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'



import * as icons from 'lucide-react';
import { LoaderPinwheel } from 'lucide-react';
import { CircleUser } from 'lucide-react';
import { MessageCircleDashed } from 'lucide-react';
import { Camera } from 'lucide-react';
import { Mic } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { User } from 'lucide-react';
import { Plus } from 'lucide-react';

function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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