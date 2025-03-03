// Function to fetch property types from the API

document.addEventListener("DOMContentLoaded", () => {
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";})

async function fetchPropertyTypes() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/property_types'); // Replace with your actual API endpoint
        const data = await response.json(); // Assuming the response contains a list of property types

        const propertyTypeDropdown = document.getElementById('property-type-dropdown');
    
        // Clear the dropdown before populating
        propertyTypeDropdown.innerHTML = '<option selected>Property Types</option>';
    
        // Populate the dropdown with locations
        data.locations.forEach(type => {
            const option = document.createElement('option');
            option.value = type; // 'location' is the value you want to set
            option.textContent = type; // 'location' is also the display text
            propertyTypeDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching property locations:', error);
    }
    
}
// Function to fetch property types from the API
async function fetchPropertyLocations() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/property_locations'); // Replace with your actual API endpoint
        const data = await response.json(); // Assuming the response contains a list of locations
    
        const LocationTypeDropdown = document.getElementById('location-dropdown');
    
        // Clear the dropdown before populating
        LocationTypeDropdown.innerHTML = '<option selected>Locations</option>';
    
        // Populate the dropdown with locations
        data.locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location; // 'location' is the value you want to set
            option.textContent = location; // 'location' is also the display text
            LocationTypeDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching property locations:', error);
    }
    
}

// Function to handle the search when the search button is clicked
async function handleSearch() {
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
    if (results.status === "noValue" || results.properties.length === 0) {
        // If no properties are found, display a message
        document.getElementById("property-list").innerHTML = "<p>No properties found for the given search criteria.</p>";
    } else {
        // If properties are found, display them
        renderProperties(results.properties);
    }

    console.log('Search results:', results); // Handle/display the results here (you can update the page with the results)
}
 // Fetch properties from API
 async function fetchProperties() {
    const API_URL = "http://127.0.0.1:5000/api/properties"; // API Endpoint
    const propertyListContainer = document.querySelector("#property-list");

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        renderProperties(data.properties); // Limit to 6 properties
    } catch (error) {
        console.error("Error fetching properties:", error);
    }
}

function renderProperties(properties) {
    const propertyListContainer = document.querySelector("#property-list");
    console.log('Rendering properties:', properties); // Check what properties are passed here

    // Clear container before rendering
    propertyListContainer.innerHTML = "";
    if (properties.length === 0) {
        propertyListContainer.innerHTML = "<p>No properties found for the given search criteria.</p>";
        return;
    }

    // Create property cards dynamically
    properties.forEach(property => {
        const propertyCard = createPropertyCard(property);
        propertyListContainer.appendChild(propertyCard);
    });
}

// Create property card element
 // Create property card element
 function createPropertyCard(property) {
    console.log("pokemon")
    const colDiv = document.createElement("div");
    colDiv.classList.add("col-lg-4", "col-md-6", "card");
    colDiv.setAttribute("property-dealer-name", property.dealer_id);

    colDiv.innerHTML = `
    <div class="property-item rounded overflow-hidden m-2">
        <div class="position-relative overflow-hidden">
            <a href="individualProp.html?house_id=${property.house_id}">
                <img class="img-fluid" src="${property.image_url}" alt="Property Image" 
                    style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
            </a>
            <div class="bg-primary text-white position-absolute start-0 top-0 m-3 py-1 px-3 rounded-pill">
                ${property.status}
            </div>
            <div class="bg-white text-primary position-absolute start-0 bottom-0 m-3 py-1 px-3 rounded-pill">
                ${property.house_type}
            </div>
        </div>
        <div class="p-4 pb-0">
            <h5 class="text-primary mb-3">€${property.cost.toLocaleString()}</h5>
            <a class="d-block h5 mb-2" href="individualProp.html?house_id=${property.house_id}">${property.name}</a>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}"  target="_blank" rel="noopener noreferrer">
    <p><i class="fa fa-map-marker-alt text-primary me-2"></i>Location</p>
</a>
        </div>
        <div class="d-flex border-top">
           
            <small class="flex-fill text-center border-end py-2">
                <i class="fa fa-bed text-primary me-2"></i>${property.bedrooms} Bed
            </small>
            <small class="flex-fill text-center py-2">
                <i class="fa fa-clock text-primary me-2"></i>${new Date(property.updated_at).toLocaleDateString()}
            </small>
        </div>
    </div>
`;


    return colDiv;
}
 // Global filterRooms function to be used by event listeners
 window.filterRooms = function(category) {
        
    const rooms = document.querySelectorAll('.card');  // Get all room cards
    
    // Loop through each room card and hide/show based on category
    rooms.forEach(room => {
        const roomCategory = room.getAttribute('data-room-category');
        console.log('tested');
        console.log(roomCategory)
        console.log(category)
        if (category === 'all' || roomCategory === category) {
            room.style.display = 'block';  // Show the room
        } else {
            room.style.display = 'none';  // Hide the room
        }
    });
}


// Event listener for DOMContentLoaded to populate dropdown
document.addEventListener("DOMContentLoaded", () => {
    fetchPropertyTypes();
    fetchPropertyLocations();
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    fetchProperties();

    window.onload = () => {
        filterRooms('All');  
    };
});



window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};
