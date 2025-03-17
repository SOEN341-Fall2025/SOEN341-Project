import './style/app.css';
import './style/settings.css';
import './style/style.css';
import React, { useState, useEffect } from 'react';
import Login from './pages/Login.js';
import Main from './pages/Main.js';
function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [users, setUsers] = useState([]);

  //const [token, setToken] = useState('');
  
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Expiration in days
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`; // Set cookie
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');  // Get token from localStorage (ensure it's stored when the user logs in)

    console.log('Authorization token:', token);
    
    if (!token) {
      setError('Authentication token is missing.');
      return;
    }

    try {
      // Make GET request to the backend with the Authorization header
      const response = await fetch('/dm/fetch-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Add token to Authorization header
        },
      });

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        const result = await response.json();
        setError(result.msg || 'Failed to retrieve galleries');
        return;
      }

      // Parse and set the galleries data
      const result = await response.json();
      setUsers(result);
      
      setError(null);  // Clear any previous errors

    } catch (error) {
      setError('An error occurred while fetching galleries: ' + error.message);
    }
  };
  
    const fetchUserGalleries = async () => {
      const token = localStorage.getItem('authToken');  // Get token from localStorage (ensure it's stored when the user logs in)

      console.log('Authorization token:', token);
      
      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      try {
        // Make GET request to the backend with the Authorization header
        const response = await fetch('/gal/retrieve', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Add token to Authorization header
          },
        });

        // Check if the response is ok (status 200-299)
        if (!response.ok) {
          const result = await response.json();
          setError(result.msg || 'Failed to retrieve galleries');
          return;
        }

        // Parse and set the galleries data
        const result = await response.json();
        const modifiedGalleries = result.galleries.map(gallery => ({
          ...gallery,
          icon: ''  // Add the 'icon' property with an empty string as the default value
        }));
        console.log(modifiedGalleries);
        setGalleries(prevGalleries => [...prevGalleries, ...modifiedGalleries]);
        setError(null);  // Clear any previous errors

      } catch (error) {
        setError('An error occurred while fetching galleries: ' + error.message);
      }
    };
  

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserGalleries(); // Fetch galleries after successful login
      fetchUsers();
    }
  }, [isLoggedIn]);
  useEffect(() => {
    console.log('Updated galleries:', galleries);
    
  }, [galleries]);

  useEffect(() => {
    console.log('Updated Users:', users);
    
  }, [users]);
  
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
      {isLoggedIn ? (
        galleries.length > 0 ? (  // Only render Main if galleries are not empty
          <Main userData={userData} galleries={galleries} users={users} />
        ) : (
          <p>Loading galleries...</p>  // Show loading message if galleries are still being fetched
        )
      ) : (
        <Login onLogin={handleLogin} />  // Show Login if the user is not logged in
      )}
    </section>
  );
}

export default App;