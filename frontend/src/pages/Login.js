import React, { useState } from 'react';
import '../style/style.css';
import "boxicons/css/boxicons.min.css";

function Login({onLogin}){
    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //Registration state
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
  
    const [showLogin, setLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('Weak');
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleLoginSubmit = (e) => {
        console.log("DEBUG: handleSubmit has been called.");
        e.preventDefault();
        if (showLogin) {
            onLogin(email, password);
        } else {
            if (!passwordMatch || passwordStrength !== "Strong") {
                alert("Passwords must match and be strong.");
                return;
            }
        }
    };

    // Toggle between login and register views
    const handleToggleView = () => setShowLogin(!showLogin);

    // Toggle password visibility
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    
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


    // Password strength checker
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setRegisterPassword(value);
        
        let strength = "Weak";
        if (value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[!@#$%^&*]/.test(value)) {
            strength = "Strong";
        } else if (value.length >= 6) {
            strength = "Medium";
        }
        setPasswordStrength(strength);
    };

    const handleConfirmPassword = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (registerPassword !== value) {
            setPasswordMatch(false);
        } else {
            setPasswordMatch(true);
        }
    };

    return (
    <div>
        {showLogin ? (

            <div class="wrapper" id = "loginWrapper">
            <form id = "loginForm" onSubmit={handleSubmit}>
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