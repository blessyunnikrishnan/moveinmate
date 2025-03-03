document.addEventListener('DOMContentLoaded', function () {
    if (!sessionStorage.getItem("user")) window.location.href = "../login.html";
    const user = JSON.parse(sessionStorage.getItem("user"));
    const user_id = user && user.id ? user.id : null;
    const apiUrl = `http://127.0.0.1:5000/api/bookings/${user_id}`;

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
                    console.log(booking)
                    const row = document.createElement("tr");
                    row.id = `booking-${booking.booking_id}`; // Add ID to the row for easier targeting

                    // Booking Request ID
                    const bookingIdCell = document.createElement("td");
                    bookingIdCell.textContent = booking.booking_id;
                    row.appendChild(bookingIdCell);

                    // User's Name (Placeholder, assuming the user name is available, or fetch separately)
                    const userNameCell = document.createElement("td");
                    userNameCell.textContent = `User ${booking.user_id}`;  // Update with actual user data if available
                    row.appendChild(userNameCell);

                   // Property Name (with hyperlink)
const propertyNameCell = document.createElement("td");

// Create the hyperlink
const propertyLink = document.createElement("a");
propertyLink.href = `individualProp.html?house_id=${booking.house_id}`; // Set the URL dynamically
propertyLink.textContent = "View Property"; // Text for the hyperlink

// Append the hyperlink to the cell
propertyNameCell.appendChild(propertyLink);
row.appendChild(propertyNameCell);




                    // Approve/Deny buttons
                    const actionButtonsCell = document.createElement("td");
                    actionButtonsCell.classList.add("action-buttons");

                    const approveButton = document.createElement("button");
                    approveButton.classList.add("approve-btn");
                    approveButton.textContent = "Approve";
                    approveButton.onclick = function () {
                        handleBookingAction(booking.booking_id, 'approved');
                    };

                    const denyButton = document.createElement("button");
                    denyButton.classList.add("deny-btn");
                    denyButton.textContent = "Deny";
                    denyButton.onclick = function () {
                        handleBookingAction(booking.booking_id, 'denied');
                    };

                    actionButtonsCell.appendChild(approveButton);
                    actionButtonsCell.appendChild(denyButton);
                    row.appendChild(actionButtonsCell);

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

const updateBooking = async (bookingId, bookingStatus, isApproved) => {
    console.log('Updating booking...');
    const data = {};

    // Only add fields to data if they have changed
    if (bookingStatus) {
        data.booking_status = bookingStatus;
    }

    if (isApproved !== undefined) {
        data.is_approved = isApproved;
    }

    // If no fields to update, exit early
    if (Object.keys(data).length === 0) {
        console.error('No valid fields provided for update');
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            // After the booking is updated, update the buttons
            const bookingRow = document.querySelector(`#booking-${bookingId}`);
            if (bookingRow) {
                const approveButton = bookingRow.querySelector('.approve-btn');
                const denyButton = bookingRow.querySelector('.deny-btn');

                if (bookingStatus === 'approved') {
                    // Remove the Deny button, and update the Approve button
                    if (denyButton) {
                        denyButton.remove();
                    }
                    if (approveButton) {
                        approveButton.textContent = 'Approved';  // Or hide it, as it's no longer actionable
                    }
                } else if (bookingStatus === 'denied') {
                    // Remove the Approve button, and update the Deny button
                    if (approveButton) {
                        approveButton.remove();
                    }
                    if (denyButton) {
                        denyButton.textContent = 'Denied';  // Or hide it, as it's no longer actionable
                    }
                }
            }
            console.log('Booking updated successfully:', result);
        } else {
            console.error('Error updating booking:', result);
        }
    } catch (error) {
        console.error('Error during the request:', error);
    }
};

function handleBookingAction(bookingId, action) {
    // Determine if booking is approved or denied
    const isApproved = action === 'approved' ? 1 : 0;

    // Call the updateBooking function to update the booking status
    updateBooking(bookingId, action, isApproved);
}
window.handleLogout = function () {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../login.html";
    console.log("User logged out successfully");
};