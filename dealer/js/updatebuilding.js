window.onload = async () => {
    console.log("DOMContentLoaded fired");
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const houseId = urlParams.get("house_id");  // Extract house_id from the URL

        if (houseId) {
            console.log("House ID: ", houseId);  // Log the house ID to the console

            // Make an API call to fetch property data
            const response = await fetch(`http://127.0.0.1:5000/api/properties/${houseId}`);
            const propertyData = await response.json();
            
            console.log(propertyData.property.name); // Log property name to check

            if (response.ok) {
                // Prepopulate the form with property data
                document.getElementById('name').value = propertyData.property.name || '';
                document.getElementById('location').value = propertyData.property.location || '';
                document.getElementById('bedrooms').value = propertyData.property.bedrooms || '';
                document.getElementById('status').value = propertyData.property.status || 'available'; // Default to available if not present
                document.getElementById('cost').value = propertyData.property.cost || '';
                document.getElementById('house_type').value = propertyData.property.house_type || 'apartment'; // Default to apartment if not present
                document.getElementById('image_url').value = propertyData.property.image_url || '';
            } else {
                console.error('Error fetching property data:', propertyData.message);
            }
        } else {
            console.log("House ID is missing from the URL");
            alert('House ID is missing. Please check the URL.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

async function updateBuilding(event) {
    const user = JSON.parse(sessionStorage.getItem("user")); // Retrieve user data from sessionStorage
    const dealer_id = user && user.id ? user.id : null; // Extract dealer ID

    event.preventDefault();  // Prevent form submission to handle via AJAX

    // Gather the form data
    dealer_id: dealer_id;
    const houseId = new URLSearchParams(window.location.search).get("house_id");
    const name = document.getElementById("name").value;
    const location = document.getElementById("location").value;
    const bedrooms = document.getElementById("bedrooms").value;
    const status = document.getElementById("status").value;
    const cost = document.getElementById("cost").value;
    const houseType = document.getElementById("house_type").value;
    const imageUrl = document.getElementById("image_url").value;
    
    const data = {
        house_id: houseId,
        dealer_id:dealer_id,
        name,
        location,
        bedrooms,
        status,
        cost,
        house_type: houseType,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
    };

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/updatebuilding/${houseId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = "propertypage.html";  // Redirect to the property page or another page after update
        } else {
            alert(result.message);  // Show error message from API response
        }
    } catch (error) {
        console.error("Error updating building:", error);
        alert("An error occurred while updating the building.");
    }
}


document.querySelector("button.btn.btn-primary.btn-block").addEventListener("click", updateBuilding);
window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};
