# TreePlace App

TreePlace is a web application dedicated to improving the environment by planting trees in Miami. Our mission is to create a greener, healthier city for all residents and visitors.

## Features

- User authentication (login/register)
- Dashboard for tracking tree planting activities
- Interactive map for tree locations
- Blog for environmental news and updates
- Sponsorship opportunities

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT, bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/treeplace-app.git
   cd treeplace-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/treeplace
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. Start MongoDB:
   - If using local MongoDB, make sure the MongoDB service is running
   - If using MongoDB Atlas, update the MONGODB_URI in your .env file

5. Start the server:
   ```
   npm start
   ```

6. For development with auto-restart:
   ```
   npm run dev
   ```

7. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
treeplace-app/
├── public/              # Static files
│   ├── index.html       # Main page
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── dashboard.html   # User dashboard
│   ├── styles.css       # Main styles
│   ├── login.css        # Login/Register styles
│   ├── script.js        # Main JavaScript
│   ├── login.js         # Login functionality
│   └── register.js      # Registration functionality
├── server.js            # Express server
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md            # Documentation
```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. When a user logs in or registers, they receive a token that is stored in localStorage. This token is then used for authenticated requests to the server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Directed by Ms. Albarran
- Made by Thalia Webb and Franco Betancourt
- Version Beta-R-81
