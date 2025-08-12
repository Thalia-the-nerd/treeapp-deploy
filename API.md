# TreeApp API Documentation

This document provides a comprehensive overview of the TreeApp API endpoints. It includes descriptions of each endpoint, the required parameters, and examples of how to use them in a React application.

---

## Authentication & Users

### 1. User Signup

-   **Endpoint:** `POST /api/signup`
-   **Description:** Creates a new user account.
-   **Request Body:**
    -   `firstName` (String, required)
    -   `lastName` (String, required)
    -   `username` (String, required)
    -   `email` (String, required)
    -   `password` (String, required)
    -   `isBusiness` (Boolean, optional)
    -   `businessName` (String, optional)
-   **React Example:**

    ```jsx
    import React, { useState } from 'react';

    const SignupForm = () => {
      const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
      });

      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const data = await response.text();
          alert(data);
        } catch (error) {
          console.error('Signup failed:', error);
        }
      };

      return (
        <form onSubmit={handleSubmit}>
          {/* Add form inputs for each field */}
          <button type="submit">Sign Up</button>
        </form>
      );
    };

    export default SignupForm;
    ```

### 2. Email Verification

-   **Endpoint:** `GET /api/verify`
-   **Description:** Verifies a user's email address using a token sent to their email.
-   **Query Parameters:**
    -   `token` (String, required)
-   **React Example:**

    ```jsx
    import React, { useEffect, useState } from 'react';
    import { useLocation } from 'react-router-dom';

    const VerifyEmail = () => {
      const [message, setMessage] = useState('Verifying...');
      const location = useLocation();

      useEffect(() => {
        const token = new URLSearchParams(location.search).get('token');
        if (token) {
          fetch(`/api/verify?token=${token}`)
            .then(res => res.text())
            .then(setMessage)
            .catch(err => setMessage('Verification failed.'));
        }
      }, [location]);

      return <div>{message}</div>;
    };

    export default VerifyEmail;
    ```

### 3. User Login

-   **Endpoint:** `POST /api/login`
-   **Description:** Authenticates a user and returns a JWT.
-   **Request Body:**
    -   `username` (String, required)
    -   `password` (String, required)
    -   `isBusiness` (Boolean, optional)
-   **React Example:**

    ```jsx
    import React, { useState } from 'react';

    const LoginForm = () => {
      const [credentials, setCredentials] = useState({ username: '', password: '' });

      const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          const data = await response.json();
          if (data.success) {
            localStorage.setItem('token', data.token);
            // Redirect to dashboard
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      };

      return (
        <form onSubmit={handleSubmit}>
          {/* Add form inputs for username and password */}
          <button type="submit">Login</button>
        </form>
      );
    };

    export default LoginForm;
    ```

### 4. User Logout

-   **Endpoint:** `POST /api/logout`
-   **Description:** Logs out a user.
-   **Request Body:**
    -   `username` (String, required)
-   **React Example:**

    ```jsx
    const handleLogout = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // Redirect to login page
    };
    ```

### 5. Forgot Password

-   **Endpoint:** `POST /api/forgot-password`
-   **Description:** Initiates the password reset process.
-   **Request Body:**
    -   `email` (String, required)
-   **React Example:**

    ```jsx
    const handleForgotPassword = async (email) => {
      try {
        const response = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const message = await response.text();
        alert(message);
      } catch (error) {
        console.error('Forgot password request failed:', error);
      }
    };
    ```

### 6. Reset Password

-   **Endpoint:** `POST /api/reset-password`
-   **Description:** Resets the user's password using a token.
-   **Request Body:**
    -   `token` (String, required)
    -   `password` (String, required)
-   **React Example:**

    ```jsx
    const handleResetPassword = async (token, password) => {
      try {
        const response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const message = await response.text();
        alert(message);
      } catch (error) {
        console.error('Password reset failed:', error);
      }
    };
    ```

---

## Admin User Management

*Note: All admin endpoints require a valid JWT with admin privileges in the `Authorization` header.*

### 7. Get All Users

-   **Endpoint:** `GET /api/users`
-   **Description:** Retrieves a list of all users.
-   **Query Parameters:**
    -   `search` (String, optional): Filters users by username or email.
-   **React Example:**

    ```jsx
    const fetchUsers = async (token) => {
      try {
        const response = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const users = await response.json();
        return users;
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    ```

### 8. Get User by ID

-   **Endpoint:** `GET /api/users/:id`
-   **Description:** Retrieves a single user by their ID.
-   **React Example:**

    ```jsx
    const fetchUserById = async (userId, token) => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const user = await response.json();
        return user;
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    ```

### 9. Update User

-   **Endpoint:** `PUT /api/users/:id`
-   **Description:** Updates a user's information.
-   **Request Body:**
    -   `moneyDonated` (Number, optional)
    -   `timeDonated` (Number, optional)
    -   `isAdmin` (Boolean, optional)
-   **React Example:**

    ```jsx
    const updateUser = async (userId, updateData, token) => {
      try {
        await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    };
    ```

### 10. Delete User

-   **Endpoint:** `DELETE /api/users/:id`
-   **Description:** Deletes a user account.
-   **React Example:**

    ```jsx
    const deleteUser = async (userId, token) => {
      if (window.confirm('Are you sure?')) {
        try {
          await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Failed to delete user:', error);
        }
      }
    };
    ```

---

## Events

### 11. Get All Events

-   **Endpoint:** `GET /api/events`
-   **Description:** Retrieves a list of all events.
-   **React Example:**

    ```jsx
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const events = await response.json();
        return events;
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    ```

### 12. Create Event

-   **Endpoint:** `POST /api/events`
-   **Description:** Creates a new event (Admin only).
-   **Request Body:**
    -   `name` (String, required)
    -   `date` (String, required)
    -   `location` (String, required)
-   **React Example:**

    ```jsx
    const createEvent = async (eventData, token) => {
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(eventData),
        });
      } catch (error) {
        console.error('Failed to create event:', error);
      }
    };
    ```

### 13. Delete Event

-   **Endpoint:** `DELETE /api/events/:id`
-   **Description:** Deletes an event (Admin only).
-   **React Example:**

    ```jsx
    const deleteEvent = async (eventId, token) => {
      if (window.confirm('Are you sure?')) {
        try {
          await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Failed to delete event:', error);
        }
      }
    };
    ```

### 14. Get Event QR Code

-   **Endpoint:** `GET /api/events/:id/qr-code`
-   **Description:** Generates a QR code for event check-in/out.
-   **React Example:**

    ```jsx
    const fetchQrCode = async (eventId) => {
      try {
        const response = await fetch(`/api/events/${eventId}/qr-code`);
        const data = await response.json();
        return data.qrCodeUrl;
      } catch (error) {
        console.error('Failed to get QR code:', error);
      }
    };
    ```

### 15. Check-In

-   **Endpoint:** `POST /api/check-in`
-   **Description:** Checks a user into an event.
-   **Request Body:**
    -   `eventId` (String, required)
    -   `username` (String, required)
-   **React Example:**

    ```jsx
    const checkInUser = async (eventId, username) => {
      try {
        await fetch('/api/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, username }),
        });
      } catch (error) {
        console.error('Check-in failed:', error);
      }
    };
    ```

### 16. Check-Out

-   **Endpoint:** `POST /api/check-out`
-   **Description:** Checks a user out of an event and calculates time donated.
-   **Request Body:**
    -   `eventId` (String, required)
    -   `username` (String, required)
-   **React Example:**

    ```jsx
    const checkOutUser = async (eventId, username) => {
      try {
        await fetch('/api/check-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, username }),
        });
      } catch (error) {
        console.error('Check-out failed:', error);
      }
    };
    ```

---

## Sponsors

### 17. Get All Sponsors

-   **Endpoint:** `GET /api/sponsors`
-   **Description:** Retrieves a list of all sponsors (Admin only).
-   **React Example:**

    ```jsx
    const fetchSponsors = async (token) => {
      try {
        const response = await fetch('/api/sponsors', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const sponsors = await response.json();
        return sponsors;
      } catch (error) {
        console.error('Failed to fetch sponsors:', error);
      }
    };
    ```

### 18. Add Sponsor

-   **Endpoint:** `POST /api/sponsors`
-   **Description:** Adds a new sponsor (Admin only).
-   **Request Body:**
    -   `name` (String, required)
    -   `level` (String, required)
    -   `logo` (String, optional)
-   **React Example:**

    ```jsx
    const addSponsor = async (sponsorData, token) => {
      try {
        await fetch('/api/sponsors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(sponsorData),
        });
      } catch (error) {
        console.error('Failed to add sponsor:', error);
      }
    };
    ```

### 19. Delete Sponsor

-   **Endpoint:** `DELETE /api/sponsors/:id`
-   **Description:** Deletes a sponsor (Admin only).
-   **React Example:**

    ```jsx
    const deleteSponsor = async (sponsorId, token) => {
      if (window.confirm('Are you sure?')) {
        try {
          await fetch(`/api/sponsors/${sponsorId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Failed to delete sponsor:', error);
        }
      }
    };
    ```

---

## General

### 20. Get Stats

-   **Endpoint:** `GET /api/stats`
-   **Description:** Retrieves general application statistics.
-   **React Example:**

    ```jsx
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        return stats;
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    ```

### 21. Get User Dashboard

-   **Endpoint:** `GET /api/user/dashboard`
-   **Description:** Retrieves dashboard data for the logged-in user.
-   **Query Parameters:**
    -   `username` (String, required)
-   **React Example:**

    ```jsx
    const fetchDashboardData = async (username) => {
      try {
        const response = await fetch(`/api/user/dashboard?username=${username}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    ```
