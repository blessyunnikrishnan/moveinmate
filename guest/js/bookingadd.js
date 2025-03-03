async function submitBookingRequest() {
    // Extract house_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const house_id = urlParams.get('house_id');

    if (!house_id) {
        console.error('house_id not found in URL.');
        alert('Property information is missing!');
        return;
    }

    // Get user data from sessionStorage
    const user = JSON.parse(sessionStorage.getItem("user"));
    const user_id = user && user.id ? user.id : null;

    if (!user_id) {
        console.error('User not logged in or session expired.');
        alert('Please log in to proceed.');
        return;
    }

    // Get start and end dates from HTML inputs
    const start_date = document.getElementById('start_date').value;
    const end_date = document.getElementById('end_date').value;

    if (!start_date || !end_date) {
        console.error('Start date and/or end date is missing.');
        alert('Please select both start and end dates.');
        return;
    }

    // Create booking JSON object
    const bookingData = {
        house_id: house_id,
        user_id: user_id,
        start_date: start_date,
        end_date: end_date,
        special_requests: "", // Empty string for special requests
        booking_status: "Pending", // Default value
        payment_status: "Pending", // Default value
        is_approved: false, // Default value
    };

    console.log('Booking request being sent:', bookingData);

    try {
        // Send the booking request to the API
        const response = await fetch('http://127.0.0.1:5000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Booking added successfully:', result);
            alert('Booking submitted successfully!');
            window.location.href = "guestindex.html";
        } else {
            console.error('Error adding booking:', result);
            alert(`Error: ${result.message || 'Failed to submit booking.'}`);
        }
    } catch (error) {
        console.error('Error during booking request:', error);
        alert('An error occurred while submitting your booking. Please try again.');
    }
}
// Function to set the default start and end dates

