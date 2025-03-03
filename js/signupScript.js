async function submitSignup(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Gather form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const irp = document.getElementById("irp2").value;
    const mobile = document.getElementById("mobile").value;
    const passport = document.getElementById("passport").value;
    const mobileRegex = /^[0-9]{10}$/; 

    if (!mobileRegex.test(mobile)) {
        alert("Mobile number must be exactly 10 digits.");
    }


    try {
        // Call the API
        const response = await fetch("http://127.0.0.1:5000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, role, password,irp,mobile }),
        });

        // Handle the response
        if (response.ok) {
            const result = await response.json();
           
            alert("Registration successful: " + result.message);
            window.location.href = "login.html"; // Redirect to login page
        } else {
            const error = await response.json();
            alert("Registration failed: " + error.message);
        }
    } catch (error) {
        console.error("Error occurred during registration:", error);
        alert("An error occurred. Please try again later.");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.clear();
    localStorage.clear();
});
function togglePasswordField() {
    const role = document.getElementById("role").value;
    const irp = document.getElementById("irp");
    const pasport = document.getElementById("pasport");
    console.log(role)
    if (role === "dealer") {
        irp.style.display = "block";
        pasport.style.display = "none";
    } else if(role === "guest"){
        pasport.style.display = "block";
        irp.style.display = "none";
    }
}