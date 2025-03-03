import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db
import os
from datetime import datetime
import pyodbc
from werkzeug.security import check_password_hash

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the database
init_db()

@app.route('/api/items', methods=['GET'])
def get_items():
    conn = get_db_connection()
    items = conn.execute('SELECT * FROM items').fetchall()
    conn.close()
    return jsonify([dict(item) for item in items])

# booking apis

@app.route('/api/bookings/<int:dealer_id>', methods=['GET'])
def get_bookings_by_dealer(dealer_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to fetch bookings for the given dealer_id
        query = '''
            SELECT 
                booking_id, 
                house_id, 
                user_id, 
                booking_date, 
                booking_status, 
                start_date, 
                end_date, 
                created_at, 
                updated_at, 
                allocated_to, 
                is_approved
            FROM Bookings
            WHERE house_id IN (SELECT house_id FROM Houses WHERE dealer_id = ?)
        '''
        cursor.execute(query, (dealer_id,))
        bookings = cursor.fetchall()

        # Check if no records found
        if not bookings:
            return jsonify({"message": "No bookings found for the given dealer_id", "status": "error"}), 404

        # Transforming the data into JSON format
        bookings_list = []
        for booking in bookings:
            booking_dict = {
                "booking_id": str(booking.booking_id),  # Convert UUID to string
                "house_id": str(booking.house_id),  # Convert UUID to string
                "user_id": booking.user_id,
                "booking_date": booking.booking_date.strftime('%Y-%m-%d %H:%M:%S') if booking.booking_date else None,
                "booking_status": booking.booking_status,
                "start_date": booking.start_date.strftime('%Y-%m-%d %H:%M:%S') if booking.start_date else None,
                "end_date": booking.end_date.strftime('%Y-%m-%d %H:%M:%S') if booking.end_date else None,
                "created_at": booking.created_at.strftime('%Y-%m-%d %H:%M:%S') if booking.created_at else None,
                "updated_at": booking.updated_at.strftime('%Y-%m-%d %H:%M:%S') if booking.updated_at else None,
                "allocated_to": booking.allocated_to,
                "is_approved": booking.is_approved
            }
            bookings_list.append(booking_dict)

        # Return the list of bookings
        return jsonify({
            "message": "Bookings retrieved successfully",
            "status": "success",
            "bookings": bookings_list
        }), 200
    except Exception as e:
        print(f"Error during bookings retrieval for dealer_id {dealer_id}: {e}")
        return jsonify({"message": "An error occurred while fetching bookings", "status": "error"}), 500
    finally:
        conn.close()

@app.route('/api/userbookings/<int:user_id>', methods=['GET'])
def get_bookings_by_user(user_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to fetch bookings for the given user_id
        query = '''
            SELECT 
                booking_id, 
                house_id, 
                user_id, 
                booking_date, 
                booking_status, 
                start_date, 
                end_date, 
                created_at, 
                updated_at, 
                allocated_to, 
                is_approved
            FROM Bookings
            WHERE user_id = ?
        '''
        cursor.execute(query, (user_id,))
        bookings = cursor.fetchall()

        # Check if no records found
        if not bookings:
            return jsonify({"message": "No bookings found for the given user_id", "status": "error"}), 404

        # Transforming the data into JSON format
        bookings_list = []
        for booking in bookings:
            booking_dict = {
                "booking_id": str(booking.booking_id),  # Convert UUID to string
                "house_id": str(booking.house_id),  # Convert UUID to string
                "user_id": booking.user_id,
                "booking_date": booking.booking_date.strftime('%Y-%m-%d %H:%M:%S') if booking.booking_date else None,
                "booking_status": booking.booking_status,
                "start_date": booking.start_date.strftime('%Y-%m-%d %H:%M:%S') if booking.start_date else None,
                "end_date": booking.end_date.strftime('%Y-%m-%d %H:%M:%S') if booking.end_date else None,
                "created_at": booking.created_at.strftime('%Y-%m-%d %H:%M:%S') if booking.created_at else None,
                "updated_at": booking.updated_at.strftime('%Y-%m-%d %H:%M:%S') if booking.updated_at else None,
                "allocated_to": booking.allocated_to,
                "is_approved": booking.is_approved
            }
            bookings_list.append(booking_dict)

        # Return the list of bookings
        return jsonify({
            "message": "Bookings retrieved successfully",
            "status": "success",
            "bookings": bookings_list
        }), 200
    except Exception as e:
        print(f"Error during bookings retrieval for user_id {user_id}: {e}")
        return jsonify({"message": "An error occurred while fetching bookings", "status": "error"}), 500
    finally:
        conn.close()


@app.route('/api/bookings/<uuid:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        # Parse the request data
        data = request.json
        fields_to_update = []
        params = []

        # Define the allowed fields for updates
        allowed_fields = {
            "booking_status": "booking_status = ?",
            "start_date": "start_date = ?",
            "end_date": "end_date = ?",
            "allocated_to": "allocated_to = ?",
            "is_approved": "is_approved = ?"
        }

        # Validate and prepare fields to update
        for field, query_snippet in allowed_fields.items():
            if field in data:
                fields_to_update.append(query_snippet)
                params.append(data[field])

        if not fields_to_update:
            return jsonify({"message": "No valid fields provided for update", "status": "error"}), 400

        # Add booking_id as the final parameter for the WHERE clause
        params.append(booking_id)

        # Construct the SQL query dynamically
        update_query = f'''
            UPDATE Bookings
            SET {', '.join(fields_to_update)}, updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        '''

        # Execute the update query
        cursor = conn.cursor()
        cursor.execute(update_query, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "No booking found with the given booking_id", "status": "error"}), 404

        # Return success response
        return jsonify({
            "message": "Booking updated successfully",
            "status": "success"
        }), 200
    except Exception as e:
        print(f"Error during booking update for booking_id {booking_id}: {e}")
        return jsonify({"message": "An error occurred while updating the booking", "status": "error"}), 500
    finally:
        conn.close()

@app.route('/api/bookings/<uuid:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        # Execute the delete query
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Bookings WHERE booking_id = ?", (booking_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "No booking found with the given booking_id", "status": "error"}), 404

        # Return success response
        return jsonify({
            "message": "Booking deleted successfully",
            "status": "success"
        }), 200
    except Exception as e:
        print(f"Error during booking deletion for booking_id {booking_id}: {e}")
        return jsonify({"message": "An error occurred while deleting the booking", "status": "error"}), 500
    finally:
        conn.close()


import uuid

@app.route('/api/bookings', methods=['POST'])
def add_booking():
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        # Parse the request data
        data = request.json

        # Ensure required fields are provided
        required_fields = ["house_id", "user_id", "start_date", "end_date", "booking_status"]
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify({
                "message": f"Missing required fields: {', '.join(missing_fields)}",
                "status": "error"
            }), 400

        # Extract the data from the request
        house_id = data["house_id"]
        user_id = data["user_id"]
        start_date = data["start_date"]
        end_date = data["end_date"]
        booking_status = data["booking_status"]
        allocated_to = data.get("allocated_to", None)
        is_approved = data.get("is_approved", 0)

        # Insert the new booking into the database
        insert_query = '''
            INSERT INTO Bookings (house_id, user_id, start_date, end_date, booking_status, 
                                  allocated_to, is_approved, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        '''
        params = (
            house_id, user_id, start_date, end_date, booking_status, 
            allocated_to, is_approved
        )

        cursor = conn.cursor()
        cursor.execute(insert_query, params)
        conn.commit()

        # Return success response
        return jsonify({
            "message": "Booking added successfully",
            "status": "success"
        }), 201

    except Exception as e:
        print(f"Error during booking addition: {e}")
        return jsonify({"message": "An error occurred while adding the booking", "status": "error"}), 500
    finally:
        conn.close()


# booking apis over


@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_db_connection()
    conn.execute('INSERT INTO items (name, description) VALUES (?, ?)', (name, description))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item created successfully'}), 201

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    conn = get_db_connection()
    conn.execute('UPDATE items SET name = ?, description = ? WHERE id = ?', (name, description, item_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item updated successfully'})

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM items WHERE id = ?', (item_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item deleted successfully'})



@app.route('/api/properties', methods=['GET'])
def get_properties():
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to fetch all house data
        cursor.execute('''
            SELECT 
                house_id, 
                dealer_id, 
                name, 
                location, 
                bedrooms, 
                status, 
                cost, 
                house_type, 
                image_url, 
                created_at, 
                updated_at, 
                allotted_to
            FROM Houses
        ''')
        houses = cursor.fetchall()

        # Transforming the data into JSON format
        houses_list = []
        for house in houses:
            house_dict = {
                "house_id": str(house.house_id),  # Convert UUID to string
                "dealer_id": house.dealer_id,
                "name": house.name,
                "location": house.location,  # Updated field
                "bedrooms": house.bedrooms,
                "status": house.status,
                "cost": float(house.cost),  # Ensure the cost is JSON serializable
                "house_type": house.house_type,
                "image_url": house.image_url,
                "created_at": house.created_at.strftime('%Y-%m-%d %H:%M:%S') if house.created_at else None,
                "updated_at": house.updated_at.strftime('%Y-%m-%d %H:%M:%S') if house.updated_at else None,
                "allotted_to": house.allotted_to  # Nullable field
            }
            houses_list.append(house_dict)

        # Return the list of houses
        return jsonify({
            "message": "Properties retrieved successfully",
            "status": "success",
            "properties": houses_list
        }), 200
    except Exception as e:
        print(f"Error during properties retrieval: {e}")
        return jsonify({"message": "An error occurred while fetching properties", "status": "error"}), 500
    finally:
        conn.close()
 
@app.route('/api/properties/type-count', methods=['GET'])
def get_property_count_by_type():
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to fetch the count of houses grouped by house_type
        query = '''
            SELECT 
                house_type, 
                COUNT(*) AS count
            FROM Houses
            GROUP BY house_type
        '''
        cursor.execute(query)
        house_counts = cursor.fetchall()

        # Check if no records found
        if not house_counts:
            return jsonify({"message": "No properties found", "status": "error"}), 404

        # Transforming the data into JSON format
        house_counts_list = []
        for row in house_counts:
            house_counts_list.append({
                "house_type": row.house_type,
                "count": row.count
            })

        # Return the count of houses by type
        return jsonify({
            "message": "Property counts retrieved successfully",
            "status": "success",
            "property_counts": house_counts_list
        }), 200
    except Exception as e:
        print(f"Error during property count retrieval: {e}")
        return jsonify({"message": "An error occurred while fetching property counts", "status": "error"}), 500
    finally:
        conn.close()

#property of the dealer http://127.0.0.1:5000/api/properties/2
@app.route('/api/properties/<int:dealer_id>', methods=['GET'])
def get_properties_by_dealer(dealer_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to fetch properties for the given dealer_id
        query = '''
            SELECT 
                house_id, 
                dealer_id, 
                name, 
                location, 
                bedrooms, 
                status, 
                cost, 
                house_type, 
                image_url, 
                created_at, 
                updated_at, 
                allotted_to
            FROM Houses
            WHERE dealer_id = ?
        '''
        cursor.execute(query, (dealer_id,))
        houses = cursor.fetchall()

        # Check if no records found
        if not houses:
            return jsonify({"message": "No properties found for the given dealer_id", "status": "error"}), 404

        # Transforming the data into JSON format
        houses_list = []
        for house in houses:
            house_dict = {
                "house_id": str(house.house_id),  # Convert UUID to string
                "dealer_id": house.dealer_id,
                "name": house.name,
                "location": house.location,
                "bedrooms": house.bedrooms,
                "status": house.status,
                "cost": float(house.cost),  # Ensure the cost is JSON serializable
                "house_type": house.house_type,
                "image_url": house.image_url,
                "created_at": house.created_at.strftime('%Y-%m-%d %H:%M:%S') if house.created_at else None,
                "updated_at": house.updated_at.strftime('%Y-%m-%d %H:%M:%S') if house.updated_at else None,
                "allotted_to": house.allotted_to
            }
            houses_list.append(house_dict)

        # Return the list of houses
        return jsonify({
            "message": "Properties retrieved successfully",
            "status": "success",
            "properties": houses_list
        }), 200
    except Exception as e:
        print(f"Error during properties retrieval for dealer_id {dealer_id}: {e}")
        return jsonify({"message": "An error occurred while fetching properties", "status": "error"}), 500
    finally:
        conn.close()
 
# propertylocation
@app.route('/api/property_locations', methods=['GET'])
def get_property_locations():
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to get all unique locations
        cursor.execute('''
            SELECT DISTINCT location FROM houses
        ''')
        locations = cursor.fetchall()

        if locations:
            # Return a list of unique locations
            location_list = [location[0] for location in locations]
            return jsonify({
                "message": "Locations fetched successfully",
                "status": "success",
                "locations": location_list
            }), 200
        else:
            # If no locations are found
            return jsonify({"message": "No locations found", "status": "error"}), 404
    except pyodbc.Error as e:
        print(f"Error during fetching locations query: {e}")
        return jsonify({"message": "An error occurred during fetching locations", "status": "error"}), 500
    finally:
        conn.close()

# property types
@app.route('/api/property_types', methods=['GET'])
def get_property_types():
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to get all unique locations
        cursor.execute('''
            SELECT DISTINCT house_type FROM houses
        ''')
        locations = cursor.fetchall()

        if locations:
            # Return a list of unique locations
            location_list = [location[0] for location in locations]
            return jsonify({
                "message": "Locations fetched successfully",
                "status": "success",
                "locations": location_list
            }), 200
        else:
            # If no locations are found
            return jsonify({"message": "No locations found", "status": "error"}), 404
    except pyodbc.Error as e:
        print(f"Error during fetching locations query: {e}")
        return jsonify({"message": "An error occurred during fetching locations", "status": "error"}), 500
    finally:
        conn.close()


@app.route('/api/properties/<string:house_id>', methods=['GET'])
def get_property_details(house_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500
    
    try:
        # Validate that house_id is a valid UUID
        house_id_obj = uuid.UUID(house_id)
    except ValueError:
        return jsonify({"message": "Invalid house UUID format", "status": "error"}), 400

    try:
        cursor = conn.cursor()

        # Query to fetch the details of the property based on house_id
        query = '''
            SELECT 
                house_id, 
                dealer_id, 
                name, 
                location, 
                bedrooms, 
                status, 
                cost, 
                house_type, 
                image_url, 
                created_at, 
                updated_at, 
                allotted_to
            FROM Houses
            WHERE house_id = CAST(? AS UNIQUEIDENTIFIER)
        '''
        
        cursor.execute(query, (house_id_obj,))
        house = cursor.fetchone()

        # Check if no records found
        if not house:
            return jsonify({"message": "No property found for the given house_id", "status": "error"}), 404

        # Transforming the data into JSON format
        house_dict = {
            "house_id": str(house.house_id),  # Convert UUID to string
            "dealer_id": str(house.dealer_id),  # UUID as string
            "name": house.name,
            "location": house.location,
            "bedrooms": house.bedrooms,
            "status": house.status,
            "cost": float(house.cost),  # Ensure the cost is JSON serializable
            "house_type": house.house_type,
            "image_url": house.image_url,
            "created_at": house.created_at.strftime('%Y-%m-%d %H:%M:%S') if house.created_at else None,
            "updated_at": house.updated_at.strftime('%Y-%m-%d %H:%M:%S') if house.updated_at else None,
            "allotted_to": house.allotted_to
        }

        # Return the property details
        return jsonify({
            "message": "Property retrieved successfully",
            "status": "success",
            "property": house_dict
        }), 200

    except Exception as e:
        print(f"Error during properties retrieval for house {house_id}: {e}")
        return jsonify({"message": "An error occurred while fetching property", "status": "error"}), 500

    finally:
        conn.close()  

#   searchinggg  
@app.route('/api/search', methods=['GET'])
def search_properties():
    # Get the search parameters from the query string
    keyword = request.args.get('keyword')
    property_type = request.args.get('property_type')
    location = request.args.get('location')

    # Validate input parameters
    if not any([keyword, property_type, location]):
        return jsonify({"message": "At least one search parameter (keyword, property_type, or location) is required", "status": "error"}), 400

    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500
    
    try:
        cursor = conn.cursor()

        # Build the SQL query dynamically based on the search parameters
        query = '''
            SELECT house_id, dealer_id, name, location, bedrooms, status, cost, house_type, image_url, created_at, updated_at
            FROM houses
            WHERE 1=1
        '''

        params = []

        # Check conditions for location and property_type filtering
        if location and location != 'Locations' and not property_type and not keyword:
            query += ' AND location = ?'
            params.append(location)
        elif property_type and not location and not keyword:
            query += ' AND house_type = ?'
            params.append(property_type)
        else:
            # If both location, property_type, or keyword are provided, apply filters accordingly
            if keyword:
                query += ' AND name LIKE ?'
                params.append(f'%{keyword}%')
            if property_type:
                query += ' AND house_type = ?'
                params.append(property_type)
            if location and location != 'Locations':  # Ignore 'Locations' as an invalid default value
                query += ' AND location = ?'
                params.append(location)


        print(f"Executing query: {query} with params {params}")
        
        # Execute the query
        cursor.execute(query, params)
        properties = cursor.fetchall()
        
        if properties:
            # Return the list of matching properties
            property_list = [{
                "id": property[0],
                "dealer_id": property[1],
                "name": property[2],
                "location": property[3],
                "bedrooms": property[4],
                "status": property[5],
                "cost": property[6],
                "house_type": property[7],
                "image_url": property[8],
                "created_at": property[9],
                "updated_at": property[10]
            } for property in properties]

            return jsonify({
                "message": "Search results fetched successfully",
                "status": "success",
                "properties": property_list
            }), 200
        else:
            # If no properties match the search criteria
            return jsonify({"message": "No properties found for the search criteria", "status": "noValue"}), 404
    except pyodbc.Error as e:
        print(f"Error during search query: {e}")
        return jsonify({"message": "An error occurred during search", "status": "error"}), 500
    finally:
        conn.close()

# get user

@app.route('/api/getuser/<int:user_id>', methods=['GET'])
def get_user(user_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to get user details
        cursor.execute('''
            SELECT id, name, email, role,mobile_number FROM users WHERE id = ?
        ''', (user_id,))
        user = cursor.fetchone()

        if user:
            user_details = {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
                "mobile_number": user[4],
                
            }
            return jsonify({"user": user_details, "status": "success"}), 200
        else:
            return jsonify({"message": "User not found", "status": "error"}), 404
    except Exception as e:
        return jsonify({"message": str(e), "status": "error"}), 500
    finally:
        conn.close()

@app.route('/api/getdealer/<int:user_id>', methods=['GET'])
def get_dealer(user_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Query to get user details
        cursor.execute('''
            SELECT id, name, email, role,mobile_number,irp FROM users WHERE id = ?
        ''', (user_id,))
        user = cursor.fetchone()
        print(user)
        if user:
            user_details = {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
                "mobile_number": user[4],
                "irp": user[5]
            }
            return jsonify({"user": user_details, "status": "success"}), 200
        else:
            return jsonify({"message": "User not found", "status": "error"}), 404
    except Exception as e:
        return jsonify({"message": str(e), "status": "error"}), 500
    finally:
        conn.close()


# login
@app.route('/api/login', methods=['POST'])
def login():
    # Parse JSON data from the request
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validate input
    if not all([email, password]):
        return jsonify({"message": "Email and password are required", "status": "error"}), 400

    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Check if the user exists and the password matches
        cursor.execute('''
            SELECT id, name, role FROM users WHERE email = ? AND password = ?
        ''', (email, password))
        user = cursor.fetchone()

        if user:
            # If user exists, return success response with user details
            user_id, name, role = user
            return jsonify({
                "message": f"Welcome back, {name}!",
                "status": "success",
                "user": {
                    "id": user_id,
                    "name": name,
                    "role": role,
                    "email": email
                }
            }), 200
        else:
            # If user does not exist or password is incorrect
            return jsonify({"message": "Invalid email or password", "status": "error"}), 401
    except pyodbc.Error as e:
        print(f"Error during login query: {e}")
        return jsonify({"message": "An error occurred during login", "status": "error"}), 500
    finally:
        conn.close()

@app.route('/api/updateuser/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    # Parse JSON data from the request
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')
    irp = data.get('irp')
    mobile = data.get('mobile')
  

    # Validate input
    if not all([name, email, role]):
        return jsonify({"message": "Name, email, and role are required", "status": "error"}), 400

    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Update user details
        cursor.execute('''
            UPDATE users
            SET name = ?, email = ?, role = ?,irp = ?,mobile_number = ?
            WHERE id = ?
        ''', (name, email, role,irp,mobile, user_id))
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({"message": "User updated successfully", "status": "success"}), 200
        else:
            return jsonify({"message": "User not found or no changes made", "status": "error"}), 404
    except Exception as e:
        return jsonify({"message": str(e), "status": "error"}), 500
    finally:
        conn.close()

# property add
@app.route('/api/addbuilding', methods=['POST'])
def add_building():
    # Parse JSON data from the request
    data = request.get_json()

    # Extract fields
    house_id = data.get('house_id')  # Should be provided as UUID
    dealer_id = data.get('dealer_id')
    name = data.get('name')
    eir = data.get('location')
    location = data.get('location')  # Matches the updated table schema
    bedrooms = int(data.get('bedrooms', 0))  # Cast to integer
    status = data.get('status', 'Rent')  # Default to 'Available'
    cost = float(data.get('cost', 0.0))  # Cast to float
    house_type = data.get('house_type').capitalize()  # Capitalize ENUM value
    image_url = data.get('image_url', '')
    created_at = data.get('created_at', datetime.utcnow().isoformat())  # Default to current timestamp
    updated_at = data.get('updated_at', datetime.utcnow().isoformat())  # Default to current timestamp
    allotted_to = data.get('allotted_to', None)  # Optional field, nullable

    # Validate input
    if not all([dealer_id, name, location, bedrooms, cost, house_type]):
        return jsonify({"message": "Required fields are missing", "status": "error"}), 400

    
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Prepare query and parameters
        query = '''
            INSERT INTO Houses (house_id, dealer_id, name, location, bedrooms, status, cost, house_type, image_url, created_at, updated_at, allotted_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        params = (
            house_id or None,  # Allow database to auto-generate if not provided
            dealer_id,
            name,
            location,
            bedrooms,
            status,
            cost,
            house_type,
            image_url,
            created_at,
            updated_at,
            allotted_to
        )

        # Log the query and parameters
        print("Executing query:")
        print("SQL Query:", query)
        print("Parameters:", params)

        # Execute query
        cursor.execute(query, params)
        conn.commit()

        return jsonify({"message": f"Building {name} added successfully!", "status": "success"}), 201
    except pyodbc.Error as e:
        print(f"Error while inserting building into the database: {e}")
        return jsonify({"message": "An error occurred while adding the building", "status": "error"}), 500
    finally:
        conn.close()
        
    # delete building
    
@app.route('/api/deletebuilding/<house_id>', methods=['DELETE'])
def delete_building(house_id):
    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Prepare query to delete the building
        query = "DELETE FROM Houses WHERE house_id = ?"
        
        # Log the query and parameters
        print("Executing query:")
        print("SQL Query:", query)
        print("Parameters:", (house_id,))

        # Execute query
        cursor.execute(query, (house_id,))
        conn.commit()

        # Check if any rows were deleted
        if cursor.rowcount == 0:
            return jsonify({"message": "Building not found", "status": "error"}), 404

        return jsonify({"message": f"Building with ID {house_id} deleted successfully", "status": "success"}), 200
    except pyodbc.Error as e:
        print(f"Error while deleting building from the database: {e}")
        return jsonify({"message": "An error occurred while deleting the building", "status": "error"}), 500
    finally:
        conn.close()

# update building

@app.route('/api/updatebuilding/<house_id>', methods=['PUT'])
def update_building(house_id):
    # Parse JSON data from the request
    data = request.get_json()

    # Extract fields
    dealer_id = data.get('dealer_id')
    name = data.get('name')
    location = data.get('location')
    bedrooms = int(data.get('bedrooms', 0))
    status = data.get('status', 'Available')
    cost = float(data.get('cost', 0.0))
    house_type = data.get('house_type').capitalize() if data.get('house_type') else None
    image_url = data.get('image_url', '')
    updated_at = data.get('updated_at', datetime.utcnow().isoformat())
    allotted_to = data.get('allotted_to', None)

    # Validate input
    if not all([name, location, bedrooms, cost, house_type]):
        return jsonify({"message": "Required fields are missing", "status": "error"}), 400

    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Prepare query to update building details
        query = '''
            UPDATE Houses
            SET dealer_id = ?, name = ?, location = ?, bedrooms = ?, status = ?, cost = ?, house_type = ?, image_url = ?, updated_at = ?, allotted_to = ?
            WHERE house_id = ?
        '''
        params = (
            dealer_id, name, location, bedrooms, status, cost, house_type, image_url, updated_at, allotted_to, house_id
        )

        # Log the query and parameters
        print("Executing query:")
        print("SQL Query:", query)
        print("Parameters:", params)

        # Execute query
        cursor.execute(query, params)
        conn.commit()

        # Check if any rows were updated
        if cursor.rowcount == 0:
            return jsonify({"message": "Building not found", "status": "error"}), 404

        return jsonify({"message": f"Building with ID {house_id} updated successfully", "status": "success"}), 200
    except pyodbc.Error as e:
        print(f"Error while updating building in the database: {e}")
        return jsonify({"message": "An error occurred while updating the building", "status": "error"}), 500
    finally:
        conn.close()


# register
@app.route('/api/register', methods=['POST'])
def register():
    # Parse JSON data from the request
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')
    password = data.get('password')
    irp = data.get('irp')
    mobile = data.get('mobile')

    # Validate input
    if not all([name, email, role, password]):
        return jsonify({"message": "All fields are required", "status": "error"}), 400

    # Establish a database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed", "status": "error"}), 500

    try:
        cursor = conn.cursor()

        # Insert user into the database
        cursor.execute('''
            INSERT INTO users (name, email, role, password,irp,mobile_number)
            VALUES (?, ?, ?, ?,?,?)
        ''', (name, email, role, password,irp,mobile))  # Use parameterized queries to prevent SQL injection
        conn.commit()

        return jsonify({"message": f"User {name} registered successfully!", "status": "success"}), 201
    except pyodbc.Error as e:
        print(f"Error while inserting user into the database: {e}")
        return jsonify({"message": "An error occurred during registration", "status": "error"}), 500
    finally:
        conn.close()

    
if __name__ == '__main__':
    app.run(debug=True)
