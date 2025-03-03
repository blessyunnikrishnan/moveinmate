document.addEventListener("DOMContentLoaded", () => {
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    const API_URL = `http://127.0.0.1:5000/api/properties/type-count`; // Replace with your API endpoint
    const dealerPropertyStatsContainer = document.querySelector("#dealer-property-stats");

    // Fetch property counts grouped by type
    async function fetchPropertyCounts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);

            const data = await response.json();
            if (data.status === "success") {
                renderPropertyStats(data.property_counts);
            } else {
                console.error("Failed to retrieve property counts:", data.message);
            }
        } catch (error) {
            console.error("Error fetching property counts:", error);
        }
    }

    // Render property stats dynamically
    function renderPropertyStats(propertyCounts) {
        // Clear existing stats
        dealerPropertyStatsContainer.innerHTML = "";

        const categories = [
            { type: "Apartment", label: "Apartments", icon: "../img/icon-apartment.png" },
            { type: "Villa", label: "Villas", icon: "../img/icon-villa.png" },
            { type: "Home", label: "Homes", icon: "../img/icon-house.png" },
            { type: "Building", label: "Buildings", icon: "../img/icon-building.png" },
        ];

        categories.forEach(category => {
            // Find the count for the current category type
            const property = propertyCounts.find(item => item.house_type === category.type);
            const count = property ? property.count : 0; // Default to 0 if not found

            // Create a new column for the stat
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

    // Fetch stats on page load
    fetchPropertyCounts();
});
