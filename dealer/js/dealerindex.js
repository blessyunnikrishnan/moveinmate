document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const user_id = user.id; // Current dealer ID
    const API_URL = `http://127.0.0.1:5000/api/properties/${user_id}`; // Replace with your API endpoint
    const dealerPropertyStatsContainer = document.querySelector("#dealer-property-stats");
    console.log("teeerrr")
    // Fetch dealer properties
    async function fetchDealerProperties() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);

            const data = await response.json();
            if (data.status === "success") {
                calculateAndRenderStats(data.properties);
            } else {
                console.error("Failed to retrieve dealer properties:", data.message);
            }
        } catch (error) {
            console.error("Error fetching dealer properties:", error);
        }
    }

    // Calculate counts and render stats dynamically
    function calculateAndRenderStats(properties) {
        // Count property types
        const stats = properties.reduce((acc, property) => {
            const type = property.house_type.toLowerCase(); // Normalize type (e.g., "Apartment" -> "apartment")
            acc[type] = (acc[type] || 0) + 1; // Increment count
            return acc;
        }, {});

        renderDealerPropertyStats(stats);
    }

    // Render dealer property stats dynamically
    function renderDealerPropertyStats(stats) {
        // Clear existing stats
        dealerPropertyStatsContainer.innerHTML = "";

        const categories = [
            { type: "apartment", label: "My Apartments", icon: "img/icon-apartment.png" },
            { type: "villa", label: "My Villas", icon: "img/icon-villa.png" },
            { type: "home", label: "My Homes", icon: "img/icon-house.png" },
            { type: "building", label: "My Buildings", icon: "img/icon-building.png" },
        ];

        categories.forEach(category => {
            const count = stats[category.type] || 0; // Default to 0 if not provided
            const colDiv = document.createElement("div");
            colDiv.classList.add("col-lg-3", "col-sm-6", "wow", "fadeInUp");
            colDiv.setAttribute("data-wow-delay", "0.1s");

            colDiv.innerHTML = `
                <a class="cat-item d-block bg-light text-center rounded p-3" href="my-properties.html">
                    <div class="rounded p-4">
                        <div class="icon mb-3">
                            <img class="img-fluid" src="${category.icon}" alt="${category.label}">
                        </div>
                        <h6>${category.label}</h6>
                        <span>${count}</span>
                    </div>
                </a>
            `;
            dealerPropertyStatsContainer.appendChild(colDiv);
        });
    }
Console.log("testedd")
    // Fetch stats on page load
    fetchDealerProperties();
});
window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};
