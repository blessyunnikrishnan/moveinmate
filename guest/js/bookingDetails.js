document.addEventListener('DOMContentLoaded', function () {
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    const user = JSON.parse(sessionStorage.getItem("user"));
    const user_id = user && user.id ? user.id : null;
    console.log("japan")
    const apiUrl = `http://127.0.0.1:5000/api/userbookings/${user_id}`;

    // Fetch bookings data from the API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success" && data.bookings && data.bookings.length > 0) {
                // Display table and populate it with data
                document.getElementById("bookings-table").style.display = "table";
                const tableBody = document.getElementById("bookings-table-body");
                tableBody.innerHTML = ''; // Clear any existing rows

                data.bookings.forEach(booking => {
                    const row = document.createElement("tr");
                    row.id = `booking-${booking.booking_id}`; // Add ID to the row for easier targeting

                    // Booking Request ID
                    const bookingIdCell = document.createElement("td");
                    bookingIdCell.textContent = booking.booking_id;
                    row.appendChild(bookingIdCell);


                    const userNameCell = document.createElement("td");
                    userNameCell.textContent = `User ${booking.user_id}`;
                    row.appendChild(userNameCell);


                    // Property Name (with hyperlink)
                    const propertyNameCell = document.createElement("td");


                    const propertyLink = document.createElement("a");
                    propertyLink.href = `individualProp.html?house_id=${booking.house_id}`;
                    propertyLink.textContent = "View Property";

                    propertyNameCell.appendChild(propertyLink);
                    row.appendChild(propertyNameCell);



                    const startDateCell = document.createElement("td");
                    startDateCell.textContent = booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A';
                    row.appendChild(startDateCell);

                    // Date To (End Date)
                    const endDateCell = document.createElement("td");
                    endDateCell.textContent = booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A';
                    row.appendChild(endDateCell);

                    // Booking Status (Color-coded based on status)
                    const statusCell = document.createElement("td");
                    const statusText = booking.booking_status || "Unknown";
                    const statusClass = booking.booking_status === "pending" ? "pending-status" :
                        booking.booking_status === "approved" ? "approved-status" :
                            booking.booking_status === "denied" ? "denied-status" :
                                "unknown-status";

                    statusCell.textContent = statusText;
                    statusCell.classList.add(statusClass);
                    row.appendChild(statusCell);



                    tableBody.appendChild(row);
                });

            } else {
                // No bookings available, show the "No value" message
                document.getElementById("no-bookings-message").style.display = "block";
            }
        })
        .catch(error => {
            console.error('Error fetching bookings:', error);
            document.getElementById("no-bookings-message").style.display = "block";
        });
});



window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};