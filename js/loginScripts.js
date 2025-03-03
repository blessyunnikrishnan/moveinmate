async function submitLogin(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form data
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Call the login API
        const response = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const result = await response.json();
            alert("Login successful: " + result.message);
            sessionStorage.setItem("user", JSON.stringify(result.user));
            // Redirect to a dashboard based on user role
            console.log(result.user.role);
            if (result.user.role === "guest") {
                window.location.href = "guest/guestindex.html";
            } else {
                window.location.href = "dealer/dealerindex.html";
            }
        } else {
            const error = await response.json();
            alert("Login failed: " + error.message);
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
        alert("An error occurred. Please try again later.");
    }
}
document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.clear();
    localStorage.clear();
});