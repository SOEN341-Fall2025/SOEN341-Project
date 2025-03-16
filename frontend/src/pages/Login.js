import React, { useState } from 'react';
import '../style/style.css';
import "boxicons/css/boxicons.min.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('Weak');
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
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
        if (registerPassword !== value) {
            setPasswordMatch(false);
        } else {
            setPasswordMatch(true);
        }
    };

    return (
        <div>
            {showLogin ? (
                <div className="wrapper">
                    <form onSubmit={handleSubmit}>
                        <h1>Login</h1>
                        <div className="input-box">
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <i className='bx bxs-user'></i>
                        </div>
                        <div className="input-box">
                            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <i className={`bx ${showPassword ? 'bx bxs-lock-open-alt' : 'bx bxs-lock-alt'}`} onClick={togglePasswordVisibility}></i>
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
                    <form>
                        <h1>Sign Up</h1>
                        <div className="input-box">
                            <input type="text" placeholder="Username" required />
                            <i className='bx bxs-user'></i>
                        </div>
                        <div className="input-box">
                            <input type="email" placeholder="Email" required />
                            <i className='bx bxs-envelope'></i>
                        </div>
                        <div className="input-box">
                            <input type={showPassword ? "text" : "password"} placeholder="Create password" value={registerPassword} onChange={handlePasswordChange} required />
                            <i className={`bx ${showPassword ? 'bx bxs-lock-open-alt' : 'bx bxs-lock-alt'}`} onClick={togglePasswordVisibility}></i>
                        </div>
                        <div className="input-box">
                            <input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={handleConfirmPassword} required />
                            <i className={`bx ${showPassword ? 'bx bxs-lock-open-alt' : 'bx bxs-lock-alt'}`} onClick={togglePasswordVisibility}></i>
                        </div>
                        {!passwordMatch && <p style={{ color: '#0052A5' }}> Passwords do not match</p>}
                        <button type="submit" className="button">Sign Up</button>
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