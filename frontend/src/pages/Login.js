import React, { useState } from 'react';
import '../style/style.css'

function Login({onLogin}){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Handle form submission
    const handleSubmit = (e) => {
        console.log("DEBUG: handleSubmit has been called.");
        e.preventDefault();
        onLogin(email, password);  // Call onLogin passed from the parent (App)
    };

    
    
    const [showLogin, setLogin] = useState(true);

    // Step 2: Create a function to toggle between the two divs
    const handleClick = () => {
    setLogin(prevState => !prevState);  // Toggle the state between true and false
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
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}required/>
                    <i class='bx bxs-lock-alt' ></i>
                </div>
                <div class="text">
                    <label><input type="checkbox"/>Remeber Me</label>
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
            <form id="registerForm">
                <span class="close" id="closeRegister">&times;</span>
                    <h1>Sign Up</h1>
                    <div class="input-box">
                        <input type="text" placeholder="Username" required/>
                        <i class='bx bxs-user'></i>
                    </div>
                    <div class="input-box">
                        <input type="email" placeholder="Email" required/>
                        <i class='bx bxs-envelope'></i>
                    </div>
                    <div class="input-box">
                        <input type="password" placeholder="Create password" required/>
                        <i class='bx bxs-lock-alt'></i>
                    </div>
                    <div class="input-box">
                        <input type="password" placeholder="Confirm password" required/>
                        <i class='bx bxs-lock-alt'></i>
                    </div>
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

export default Login