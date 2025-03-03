window.onload = async () => {
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    const user = JSON.parse(sessionStorage.getItem("user"));
    const user_id = user.id;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const houseId = urlParams.get("house_id");  // Extract house_id from the URL
        console.log("terwrwrwrwrwee")
        if (houseId) {
            console.log("House ID: ", houseId);  // Log the house ID to the console

            // Make an API call to fetch property data
            const response = await fetch(`http://127.0.0.1:5000/api/properties/${houseId}`);
            const propertyData = await response.json();
           console.log(propertyData.property.name);
            if (response.ok) {
                // Assuming `property.house_id` is available after fetching property data

                document.getElementById('modify-property-link').href = `UpdateBuilding.html?house_id=${houseId}`;
                console.log(propertyData.property)
                // Prepopulate the page with property data
                document.getElementById('property-name').textContent = propertyData.property.name || '';
                document.getElementById('property-image').src = propertyData.property.image_url || '';  
                document.getElementById('property-cost').textContent = `$${propertyData.property.cost.toLocaleString()}` || '';
                document.getElementById('property-status').textContent = propertyData.property.status || 'Not Available';
                document.getElementById('property-type').textContent = propertyData.property.house_type || 'N/A';
                document.getElementById('property-bedrooms').textContent = propertyData.property.bedrooms || 'Not specified';
                console.log(propertyData.property.dealer_id)
                 if(propertyData.property.dealer_id == user_id){
console.log("insiiideee")
                    const propertyActionsDiv = document.getElementById("propertyActions");
                    propertyActionsDiv.style.display = "block";
                 }
           } else {
                console.error('Error fetching property data:', propertyData.message);
            }
        } else {
            console.log("House ID is missing from the URL");
            alert('House ID is missing. Please check the URL.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('All Data has been loaded');
    }
};

async function deleteProperty() {
    const houseId = new URLSearchParams(window.location.search).get("house_id");
console.log("friens")
    if (confirm("Are you sure you want to delete this property?")) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/deletebuilding/${houseId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = "propertypage.html";  // Redirect to a list page or another page after deletion
            } else {
                alert(result.message);  // Show error message from API response
            }
        } catch (error) {
            console.error("Error deleting property:", error);
            alert("An error occurred while deleting the property.");
        }
    }
}

// Attach the deleteProperty function to the link click
document.querySelector("a.btn.btn-light").addEventListener("click", deleteProperty);


window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};
