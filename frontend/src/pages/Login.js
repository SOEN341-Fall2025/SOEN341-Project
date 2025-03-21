import React, { useState } from 'react';
import '../style/style.css'

function Login({onLogin}){
    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //Registration state
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const [showLogin, setLogin] = useState(true);

    // Handle form submission
    const handleLoginSubmit = (e) => {
        console.log("DEBUG: handleSubmit has been called.");
        e.preventDefault();
        onLogin(email, password);  // Call onLogin passed from the parent (App)
    };

    
      // Handle registration form submission
    const handleRegisterSubmit = async (e) => {
    console.log("DEBUG: handleRegisterSubmit has been called.");
    e.preventDefault();
    
    // Check if passwords match
    if (registerPassword !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    setPasswordsMatch(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: registerEmail, 
          password: registerPassword,
          username: registerUsername 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("Registration successful:", data);
        // Auto-login after successful registration
        onLogin(registerEmail, registerPassword);
      } else {
        console.error("Registration error:", data);
        alert(`Registration failed: ${data.msg || data.error}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
  };


    // Step 2: Create a function to toggle between the two divs
    const handleClick = () => {
    setLogin(prevState => !prevState);  // Toggle the state between true and false
    };
    

    return (
    <div>
        {showLogin ? (

            <div class="wrapper" id = "loginWrapper">
            <form id = "loginForm" onSubmit={handleLoginSubmit}>
                <h1>Login</h1>
                <div class="input-box">
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}required/>
                    <i class='bx bxs-user'></i>
                </div>
                <div class="input-box">
                    <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}required/>
                    <i class='bx bxs-lock-alt' ></i>
                </div>
                <div class="text">
                    <label><input type="checkbox"/>Remember Me</label>
                    <a href="#">Forgot Password</a>
                </div>
                <button type="submit" class="button">Login</button>
                <div class="register-link">
                    <p>Don't have an account? <a onClick={handleClick} id = "openRegister">Register</a></p>
                </div>
            </form>
            </div>

        ):(

            <div class="wrapper" id="registerWrapper" style={{display: 'block'}}>
            <form id="registerForm" onSubmit={handleRegisterSubmit}>
                <span class="close" id="closeRegister" onClick={handleClick}>&times;</span>
                    <h1>Sign Up</h1>
                    <div class="input-box">
                        <input type="text" placeholder="Username" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} required/>
                        <i class='bx bxs-user'></i>
                    </div>
                    <div class="input-box">
                        <input type="email" placeholder="Email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required/>
                        <i class='bx bxs-envelope'></i>
                    </div>
                    <div class="input-box">
                        <input type="password" placeholder="Create password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required/>
                        <i class='bx bxs-lock-alt'></i>
                    </div>
                    <div class="input-box">
                        <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                        <i class='bx bxs-lock-alt'></i>
                    </div>
                     {!passwordsMatch && (
              <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>
                Passwords do not match
              </div>
            )}
                    <button type="submit" class="button">Sign Up</button>
                    <div class="login-link">
                        <p>Already have an account? <a onClick={handleClick} id="backToLogin">Login</a></p>
                    </div>
                </form>
            </div>
        )}

        
    </div>
    );
}

export default Login;