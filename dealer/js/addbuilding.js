 // Function to generate a random UUID
 function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

if (!sessionStorage.getItem("user")) window.location.href = "../login.html";

// Function to handle form submission
async function submitBuildingDetails(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const user = JSON.parse(sessionStorage.getItem("user")); // Retrieve user data from sessionStorage
    const dealer_id = user && user.id ? user.id : null; // Extract dealer ID

    if (!dealer_id) {
        alert("User session not found. Please log in again.");
        return;
    }

    const buildingData = {
        house_id: generateUUID(), // Generate random UUID for house_id
        dealer_id: dealer_id, // Retrieve dealer_id from session
        name: document.getElementById("name").value,
        location: document.getElementById("location").value,
        bedrooms: document.getElementById("bedrooms").value,
        status: document.getElementById("status").value,
        cost: document.getElementById("cost").value,
        house_type: document.getElementById("house_type").value,
        image_url: document.getElementById("image_url").value,
        created_at: new Date().toISOString(), // Automatically set current timestamp
        updated_at: new Date().toISOString() // Automatically set current timestamp
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/addbuilding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(buildingData)
        });

        if (response.ok) {
            alert("Building added successfully!");
            window.location.href = "dealerindex.html";
        } else {
            alert("Failed to add building. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the building.");
    }
}
window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};
