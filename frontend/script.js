document.addEventListener("DOMContentLoaded", function() {
    const loginWrapper = document.getElementById("loginWrapper");
    const registerForm = document.getElementById("registerForm");
    const openRegister = document.getElementById("openRegister");
    const closeRegister = document.getElementById("closeRegister");
    const backToLogin = document.getElementById("backToLogin");

    // Open Register Modal
    openRegister.addEventListener("click", function(event) {
        event.preventDefault();
        loginWrapper.style.display = "none";
        registerWrapper.style.display = "block";
    });

    // Close Register Modal
    closeRegister.addEventListener("click", function() {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
    });

    // Go back to Login
    backToLogin.addEventListener("click", function(event) {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
    });

    // Close modal when clicking outside of it
    window.addEventListener("click", function(event) {
        if (event.target === registerForm) {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
        }
    });
});