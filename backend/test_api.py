import unittest
from app import app  # Import the Flask app from your app module
from unittest.mock import patch, MagicMock

class TestFlaskRoutes(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()  # Create a test client for Flask
        self.app.testing = True      # Enable testing mode

    @patch('app.get_db_connection')  # Mock the database connection function
    def test_login_success(self, mock_db_conn):
        # Mock a successful database connection and query
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, 'John Doe', 'admin')  # Mock user data
        mock_conn.cursor.return_value = mock_cursor
        mock_db_conn.return_value = mock_conn

        response = self.app.post('http://127.0.0.1:5000/api/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('Welcome back, John Doe!', response.get_json()['message'])

    @patch('app.get_db_connection')
    def test_login_invalid_credentials(self, mock_db_conn):
        # Mock a successful database connection and query with no user found
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_db_conn.return_value = mock_conn

        response = self.app.post('http://127.0.0.1:5000/api/login', json={
            'email': 'wrong@example.com',
            'password': 'wrongpassword'
        })

        self.assertEqual(response.status_code, 401)
        self.assertIn('Invalid email or password', response.get_json()['message'])

    @patch('app.get_db_connection')
    def test_update_user_success(self, mock_db_conn):
        # Mock a successful database connection and update
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 1  # Simulate successful update
        mock_conn.cursor.return_value = mock_cursor
        mock_db_conn.return_value = mock_conn

        response = self.app.put('http://127.0.0.1:5000/api/updateuser/1', json={
            'name': 'John Updated',
            'email': 'john.updated@example.com',
            'role': 'admin',
            'irp': 'Updated IRP',
            'mobile': '1234567890'
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('User updated successfully', response.get_json()['message'])

    @patch('app.get_db_connection')
    def test_update_user_not_found(self, mock_db_conn):
        # Mock a database connection with no row updated
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.rowcount = 0  # No rows updated
        mock_conn.cursor.return_value = mock_cursor
        mock_db_conn.return_value = mock_conn

        response = self.app.put('http://127.0.0.1:5000/api/updateuser/999', json={
            'name': 'John Updated',
            'email': 'john.updated@example.com',
            'role': 'admin',
            'irp': 'Updated IRP',
            'mobile': '1234567890'
        })

        self.assertEqual(response.status_code, 404)
        self.assertIn('User not found or no changes made', response.get_json()['message'])

    @patch('app.get_db_connection')
    def test_update_user_missing_fields(self, mock_db_conn):
        response = self.app.put('http://127.0.0.1:5000/api/updateuser/1', json={
            'email': 'john.updated@example.com',
            'role': 'admin'
        })

        self.assertEqual(response.status_code, 400)
        self.assertIn('Name, email, and role are required', response.get_json()['message'])

if __name__ == '__main__':
    unittest.main()
