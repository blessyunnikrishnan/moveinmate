document.addEventListener("DOMContentLoaded", () => {
    // Redirect to login if user is not logged in
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    console.log("teeffffffffffe") 
    const user = JSON.parse(sessionStorage.getItem("user"));
    const user_id = user.id; // Current user ID
    const API_URL = "http://127.0.0.1:5000/api/properties"; // API Endpoint
    const propertyListContainer = document.querySelector("#property-list");

    // Fetch properties from API
    async function fetchProperties() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            
            const data = await response.json();
            renderProperties(data.properties.slice(0, 6)); // Limit to 6 properties
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    }

    // Fetch dealer-specific properties
    async function fetchDealerProperties(dealer_id) {
        try {
            const response = await fetch(`${API_URL}/${dealer_id}`);
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            
            const data = await response.json();
            if (data.status === "success") {
                renderProperties(data.properties);
            } else {
                console.error("Failed to retrieve properties:", data.message);
            }
        } catch (error) {
            console.error("Error fetching dealer properties:", error);
        }
    }

    // Render properties into the DOM
    function renderProperties(properties) {
        propertyListContainer.innerHTML = ""; // Clear container before rendering
        properties.forEach(property => {
            const propertyCard = createPropertyCard(property);
            propertyListContainer.appendChild(propertyCard);
        });
    }

    // Create property card element
    function createPropertyCard(property) {
        const colDiv = document.createElement("div");
        colDiv.classList.add("col-lg-4", "col-md-6", "card");
        colDiv.setAttribute("property-dealer-name", property.dealer_id);
print("house_id");
        colDiv.innerHTML = `
        <div class="property-item rounded overflow-hidden m-2">
            <div class="position-relative overflow-hidden">
                <a href="individualProp.html?house_id=${property.house_id}">
                    <img class="img-fluid" src="${property.image_url}" alt="Property Imageu" style="
                max-width: 300px;
            ">
                </a>
                <div class="bg-primary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">${property.status}</div>
                <div class="bg-white rounded-top text-primary position-absolute start-0 bottom-0 mx-4 pt-1 px-3">${property.house_type}</div>
            </div>
            <div class="p-4 pb-0">
                <h5 class="text-primary mb-3">€${property.cost.toLocaleString()}</h5>
                 <a class="d-block h5 mb-2" href="individualProp.html?house_id=${property.house_id}">${property.name}
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

    // Filter properties based on category
    function filterRooms(category) {
        const rooms = document.querySelectorAll(".card");

        if (category === "dealer prop") {
            // Fetch properties for the current dealer only
            fetchDealerProperties(user_id);
        } else {
            // Show/hide cards based on category
            rooms.forEach(room => {
                const dealer_id = room.getAttribute("property-dealer-name");
                if (category === "all" || category === "for sell") {
                    room.style.display = "block"; // Show all properties
                } else if (dealer_id === String(user_id)) {
                    room.style.display = "block"; // Show dealer's properties
                } else {
                    room.style.display = "none"; // Hide others
                }
            });
        }
    }

    // Add event listeners for category buttons
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(button => {
        button.addEventListener("click", function () {
            const category = this.getAttribute("href").replace("-", " ").toLowerCase();
            filterRooms(category);
        });
    });

    // Initialize by fetching all properties
    fetchProperties();

    // Default category filter on page load
    window.onload = () => {
        filterRooms("for sell");
    };

    // Handle logout
    window.handleLogout = function () {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "../login.html";
        console.log("User logged out successfully");
    };
});
