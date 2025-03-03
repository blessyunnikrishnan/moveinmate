// Function to fetch property types from the API
async function fetchPropertyTypes() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/property_types'); // Replace with your actual API endpoint
        const data = await response.json(); // Assuming the response contains a list of property types

        const propertyTypeDropdown = document.getElementById('property-type-dropdown');

        // Clear the dropdown before populating
        propertyTypeDropdown.innerHTML = '<option selected>Property Type</option>';

        // Populate the dropdown with property types
        data.property_types.forEach(type => {
            const option = document.createElement('option');
            option.value = type; // 'type' is the value you want to set
            option.textContent = type; // 'type' is also the display text
            propertyTypeDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching property types:', error);
    }
}

// Function to handle the search when the search button is clicked
async function handleSearch() {
    console.log('test');
    let keyword = document.getElementById('search-keyword').value.trim() || ''; 
    let propertyType = document.getElementById('property-type-dropdown').value || ''; 
    let location = document.getElementById('location-dropdown').value || ''; 

    if (!keyword && !propertyType && !location) {
        alert("Please provide at least one filter (Keyword, Property Type, or Location).");
       return;
    }


    // Send GET request with selected parameters
    const searchResults = await fetch(`http://127.0.0.1:5000/api/search?keyword=${keyword}&property_type=${propertyType}&location=${location}`);
    const results = await searchResults.json();

    console.log('Search results:', results); // Handle/display the results here (you can update the page with the results)
}

// Event listener for DOMContentLoaded to populate dropdown
document.addEventListener("DOMContentLoaded", () => {
    // Call the fetchPropertyTypes function to populate the dropdown when the page loads
    fetchPropertyTypes();

    // Attach the handleSearch function to the search button click event
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
});
