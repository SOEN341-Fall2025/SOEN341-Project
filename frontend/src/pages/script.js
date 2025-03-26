document.addEventListener("DOMContentLoaded", function() {
    const loginWrapper = document.getElementById("loginWrapper");
    const registerForm = document.getElementById("registerForm");
    const openRegister = document.getElementById("openRegister");
    const closeRegister = document.getElementById("closeRegister");
    const backToLogin = document.getElementById("backToLogin");

    openRegister.addEventListener("click", function(event) {
        event.preventDefault();
        loginWrapper.style.display = "none";
        registerWrapper.style.display = "block";
    });

    closeRegister.addEventListener("click", function() {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
    });

    backToLogin.addEventListener("click", function(event) {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
    });
    
    window.addEventListener("click", function(event) {
        if (event.target === registerForm) {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
        }
    });
     // Show/Hide password toggle
     togglePassword.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }
    });

    // Password Strength Checker
    registerPassword.addEventListener("input", function () {
        let value = registerPassword.value;
        let strength = "Weak";
        let color = "red";

        if (value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[!@#$%^&*]/.test(value)) {
            strength = "Strong";
            color = "green";
        } else if (value.length >= 6) {
            strength = "Medium";
            color = "orange";
        }
        passwordStrength.textContent = `Strength: ${strength}`;
        passwordStrength.style.color = color;
    });

    // Confirm Password Match
    confirmPassword.addEventListener("input", function () {
        if (registerPassword.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Passwords do not match");
        } else {
            confirmPassword.setCustomValidity("");
        }
    });
});
