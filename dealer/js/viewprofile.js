window.onload = async () => {
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    try {
        const user = JSON.parse(sessionStorage.getItem("user")); // Parse the string into an object
        if (user && user.id) {
            const userId = user.id;  // Access the 'id' value
            console.log(userId);  // Log the 'id' value
        } else {
            console.log("User data not found or ID is missing");
        } // Replace with actual user id from session or authentication

        // Make an API call to fetch user data
        const response = await fetch(`http://127.0.0.1:5000/api/getdealer/${user.id}`);
        const userData = await response.json();
console.log(userData);
        if (response.ok) {
            // Prepopulate the form with user data
            document.getElementById('profile-name').textContent  = userData.user.name || '';

            // Fill in the email field
            document.getElementById('profile-email').textContent  = userData.user.email || '';
            document.getElementById('profile-irp').textContent  = userData.user.irp || '';
            document.getElementById('profile-mobile').textContent  = userData.user.mobile_number || '';
            // Set the role in the dropdown
            const roleElement = document.getElementById('profile-role');
            roleElement.innerHTML = ''; // Clear existing options
            const roleOption = document.createElement('option');
            roleOption.value = userData.user.role || 'Dealer';
            roleOption.textContent = userData.user.role ? (userData.user.role) : 'Dealer';
            roleElement.appendChild(roleOption);

           
            

        } else {
            console.error('Error fetching user data:', userData.message);
            alert('Unable to fetch user data. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching user data.');
    }
};
function handleLogout() {
    // Clear user session or token
    sessionStorage.clear(); // Removes all session storage data
    localStorage.clear(); // Optional: Clears local storage if used for authentication

    // Redirect to login page or home page
    window.location.href = "../login.html";
    
    // Optional: Log out success message
    console.log("User logged out successfully");
}

window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};


