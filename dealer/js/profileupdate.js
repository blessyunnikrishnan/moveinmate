// Fetch user data when the page loads
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

        if (response.ok) {
            // Prepopulate the form with user data
console.log(userData.user)
            document.getElementById('name').value = userData.user.name || '';

            // Fill in the email field
            document.getElementById('email').value = userData.user.email || '';
            document.getElementById('mobile').value = userData.user.mobile_number || '';
            document.getElementById('irp').value = userData.user.irp || '';
            document.getElementById('role').value = userData.user.role || 'Dealer';

            // Set the role in the dropdown
            const roleElement = document.getElementById('role');
            roleElement.innerHTML = ''; // Clear existing options
            const roleOption = document.createElement('option');
           

        } else {
            console.error('Error fetching user data:', userData.message);
            alert('Unable to fetch user data. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching user data.');
    }
};

// Handle form submission
document.getElementById('update-profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevent form from submitting normally

    try {
        const user = JSON.parse(sessionStorage.getItem("user")); // Parse the string into an object
        if (user && user.id) {
            const userId = user.id;  // Access the 'id' value
            console.log(userId);  // Log the 'id' value
        } else {
            console.log("User data not found or ID is missing");
        }
         // Replace with actual user id from session or authentication
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const irp = document.getElementById("irp").value;
        const mobile = document.getElementById("mobile").value;

        // Make an API call to update user data
        const response = await fetch(`http://127.0.0.1:5000/api/updateuser/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                role,
                irp,
                mobile  // Send password only if it's updated
            }),
        });
        console.log("gdgdgdgd")

        const updateData = await response.json();

        if (response.ok) {
            alert('Profile updated successfully');
            window.location.href = "dealerindex.html";
            // Optionally, redirect or refresh page
        } else {
            alert('Error updating profile: ' + updateData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the profile.');
    }
});
window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};
