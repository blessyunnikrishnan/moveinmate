window.onload = async () => {
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const houseId = urlParams.get("house_id");  // Extract house_id from the URL

        if (houseId) {
            console.log("House ID: ", houseId);  // Log the house ID to the console

            // Make an API call to fetch property data
            const response = await fetch(`http://127.0.0.1:5000/api/properties/${houseId}`);
            const propertyData = await response.json();
           console.log(propertyData.property);
            if (response.ok) {
                console.log('helo')
                setDefaultDates()
                document.getElementById('property-location-link').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyData.property.location)}`;

                
                // Prepopulate the page with property data
                document.getElementById('property-name').textContent = propertyData.property.name || '';
                document.getElementById('property-image').src = propertyData.property.image_url || '';  // Corrected part
                document.getElementById('property-cost').textContent = `$${propertyData.property.cost.toLocaleString()}` || '';
                document.getElementById('property-location').textContent = propertyData.property.location || '';
                document.getElementById('property-status').textContent = propertyData.property.status || 'Not Available';
                document.getElementById('property-type').textContent = propertyData.property.house_type || 'N/A';
                document.getElementById('property-bedrooms').textContent = propertyData.property.bedrooms || 'Not specified';
            } else {
                console.error('Error fetching property data:', propertyData.message);
                alert('Unable to fetch property data. Please try again later.');
            }
        } else {
            console.log("House ID is missing from the URL");
            alert('House ID is missing. Please check the URL.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('All data has been loaded');
    }
};

function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0]; // Format as yyyy-mm-dd
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // Format as yyyy-mm-dd

    document.getElementById('start_date').value = todayStr;  // Set today's date
    document.getElementById('end_date').value = tomorrowStr; // Set tomorrow's date
}

window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};
