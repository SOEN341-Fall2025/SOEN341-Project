
import React, { useState } from 'react';
import '../style/style.css';
import "boxicons/css/boxicons.min.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('Weak');
    const [passwordMatch, setPasswordMatch] = useState(true);

    // Handle form submission
    const handleLoginSubmit = (e) => {
        console.log("DEBUG: handleSubmit has been called.");
        e.preventDefault();
        onLogin(email, password);
    };

    // Handle registration form submission
    const handleRegisterSubmit = async (e) => {
        console.log("DEBUG: handleRegisterSubmit has been called.");
        e.preventDefault();
        
        // Check if passwords match
        if (registerPassword !== confirmPassword) {
            setPasswordMatch(false);
            return;
        }
        setPasswordMatch(true);
        
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

    // Toggle between login and register views
    const handleToggleView = () => setShowLogin(!showLogin);
    
    // Toggle password visibility
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
        setPasswordMatch(registerPassword === value);
    };

    return (
        <div>
            <div className="flex justify-center items-center h-screen w-screen">
  <div>
    <img 
      src="https://syipugxeidvveqpbpnum.supabase.co/storage/v1/object/public/gallery_uploads//3b910723-2325-4972-bb45-9f6d831f94a4-2.png" 
      alt="Post" 
      className="w-full h-full object-cover max-w-md max-h-[90vh] rounded-lg shadow-xl"
      style={{animation: `float2 1.5s ease-in-out infinite`}}
    />
  </div>
</div>
            {showLogin ? (
                
                <div className="wrapper">
                    
                    <form onSubmit={handleLoginSubmit}>
                        <h1>Login</h1>
                        <div className="input-box">
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <i className='bx bxs-user'></i>
                        </div>
                        <div className="input-box">
                            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <i className={`bx ${showPassword ? 'bxs-lock-open-alt' : 'bxs-lock-alt'}`} onClick={togglePasswordVisibility}></i>
                        </div>
                        <div className="text">
                            <label><input type="checkbox" />Remember Me</label>
                            <a href="#">Forgot Password</a>
                        </div>
                        <button type="submit" className="button">Login</button>
                        <div className="register-link">
                            <p>Don't have an account? <a onClick={handleToggleView}>Register</a></p>
                        </div>
                    </form>
                </div>
                
            ) : (
                <div className="wrapper">
                    <form onSubmit={handleRegisterSubmit}>
                        <h1>Sign Up</h1>
                        <div className="input-box">
                            <input type="text" placeholder="Username" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} required />
                            <i className='bx bxs-user'></i>
                        </div>
                        <div className="input-box">
                            <input type="email" placeholder="Email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                            <i className='bx bxs-envelope'></i>
                        </div>
                        <div className="input-box">
                            <input type={showPassword ? "text" : "password"} placeholder="Create password" value={registerPassword} onChange={handlePasswordChange} required />
                            <i className={`bx ${showPassword ? 'bxs-lock-open-alt' : 'bxs-lock-alt'}`} onClick={togglePasswordVisibility}></i>
                        </div>
                        <div className="input-box">
                            <input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={handleConfirmPassword} required />
                            <i className={`bx ${showPassword ? 'bxs-lock-open-alt' : 'bxs-lock-alt'}`} onClick={togglePasswordVisibility}></i>
                        </div>
                        {!passwordMatch && <p style={{ color: '#0052A5' }}>Passwords do not match</p>}
                        <button type="submit" className="button" disabled={!passwordMatch}>Sign Up</button>
                        <div className="login-link">
                            <p>Already have an account? <a onClick={handleToggleView}>Login</a></p>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Login;

