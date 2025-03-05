document.addEventListener("DOMContentLoaded", function() {
    const loginWrapper = document.getElementById("loginWrapper");
    const registerWrapper = document.getElementById("registerWrapper");
    const loginForm = document.getElementById("loginForm");
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
    //login form submission
     loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
           try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful!");
                console.log("Token:", data.token); 
            } else {
                alert("Login failed: " + data.msg);
            }
        } catch (error) {     
               alert("Error: " + error.message);
        }
    });
    //register form submission
     registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const username = document.getElementById("registerUsername").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, username }),
            });
                   const data = await response.json();

            if (response.ok) {
                alert("Registration successful!");
                console.log("User:", data.user); // Log the user data
                // Switch to the login form
                registerWrapper.style.display = "none";
                loginWrapper.style.display = "block";
            } else {
                alert("Registration failed: " + data.msg);
            }
        } catch (error) {
            alert("Error: " + error.message);
        }

    window.addEventListener("click", function(event) {
        if (event.target === registerForm) {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
        }
    });
});

});