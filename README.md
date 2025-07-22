# TreePlace.App

![TreePlace.App Logo](logo-bad.png)

## 🌳 Project Overview

TreePlace.App is a community-driven platform dedicated to making Miami greener by facilitating tree planting initiatives. The application connects volunteers, provides planting locations, and tracks environmental impact. Visit [treeplace.app](https://treeplace.app) to see the live application.

## ✨ Key Features

- **Interactive Tree Planting Map**: Find suitable locations for planting trees in Miami
- **Tree Counter**: Track the community's progress toward the goal of 10,000 trees by 2025
- **Tree Stories**: Share personal memories and connect trees to family legacies
- **Urban Heat Impact Tracking**: Visualize how trees reduce local temperatures
- **Wildlife Connection**: Document biodiversity and create wildlife corridors
- **Community Events**: Join organized planting events with expert guidance
- **Tree Care Reminders**: Receive notifications for watering and maintenance
- **Educational Resources**: Learn about proper tree planting techniques and species

## 🚀 Getting Started

### Prerequisites
- Git
- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Thalia-the-nerd/treeapp-deploy.git
   ```
2. Install dependencies:
    ```bash
    npm install
    ```

### Backend Setup

1.  **Install and Run MongoDB:**

    If you don't have MongoDB installed, you can download it from the official website: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

    On many Linux distributions, you can install it using your package manager. For example, on Ubuntu/Debian:
    ```bash
    sudo apt update
    sudo apt install -y mongodb
    ```
    Once installed, make sure the MongoDB service is running:
    ```bash
    sudo systemctl start mongod
    sudo systemctl enable mongod
    ```

2.  **Seed the database:**

    You can use the MongoDB shell (`mongosh`) to insert some initial data.
    ```bash
    mongosh
    ```
    Inside the shell, run the following commands:
    ```javascript
    use treeApp
    db.stats.insertOne({
        "location1": 100,
        "location2": 250,
        "location3": 150
    })
    ```

### Running the Application

1.  Start the server:
    ```bash
    npm start
    ```
2.  Open your browser and navigate to `http://localhost:3000` (or your machine's IP address).

## 🛠️ Development

### Project Structure
- `index.html` - Main landing page
- `how-it-works.html` - Process explanation and features
- `map.html` - Interactive tree planting map
- `sponsors.html` - Information about project sponsors
- `styles.css` - Main stylesheet
- `script.js` - Core functionality
- `animations.js` - Animation effects
- `interactive.js` - Interactive elements
- `technical.js` - Technical utilities

### Deployment
To deploy changes:
1. Commit all modifications to the main branch
2. Push to the repository
3. Changes will be automatically deployed and live within a minute

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request

## 📝 Notes for Developers

- Always sign the IPA before uploading
- Maintain consistent styling across all pages
- Test responsive design on multiple devices
- Ensure all links are functional
- Follow accessibility guidelines

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Directed by**: Ms. Albarran
- **Developed by**: Thalia Webb and Franco Betancourt
- **Version**: Beta-R-81

## 📞 Contact

For questions or support, please contact:
- Email: [support@treeplace.app](mailto:support@treeplace.app)
- Website: [treeplace.app](https://treeplace.app)

---

*"Every tree planted is a step toward a greener Miami."* 🌱
