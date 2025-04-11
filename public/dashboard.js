// Initialize Chart.js
document.addEventListener('DOMContentLoaded', function() {
    // Sample data - replace with actual data from backend
    const progressData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Trees Planted',
            data: [5, 8, 12, 15, 20, 25],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
        }]
    };

    const ctx = document.getElementById('progress-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: progressData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            }
        }
    });

    // Initialize map
    initMap();

    // Load user data
    loadUserData();

    // Load events
    loadEvents();
});

// Initialize map with user's trees
function initMap() {
    // Sample tree locations - replace with actual data
    const treeLocations = [
        { lat: 25.7617, lng: -80.1918, name: "Tree #1" },
        { lat: 25.7742, lng: -80.1936, name: "Tree #2" },
        { lat: 25.7825, lng: -80.1340, name: "Tree #3" }
    ];

    const map = new google.maps.Map(document.getElementById('personal-tree-map'), {
        center: { lat: 25.7617, lng: -80.1918 },
        zoom: 12
    });

    treeLocations.forEach(location => {
        new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.name,
            icon: {
                url: 'tree-marker.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });
    });
}

// Load user data and update UI
function loadUserData() {
    // Sample user data - replace with actual API call
    const userData = {
        name: "John Doe",
        treesPlanted: 25,
        impactScore: 150,
        totalTrees: 25,
        monthlyGoal: 30,
        carbonOffset: 750
    };

    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('trees-planted').textContent = userData.treesPlanted;
    document.getElementById('impact-score').textContent = userData.impactScore;
    document.getElementById('total-trees').textContent = userData.totalTrees;
    document.getElementById('monthly-goal').textContent = userData.monthlyGoal;
    document.getElementById('carbon-offset').textContent = userData.carbonOffset;

    // Update achievements based on progress
    updateAchievements(userData);
}

// Update achievement badges
function updateAchievements(userData) {
    const achievements = {
        'first-tree': userData.treesPlanted >= 1,
        'tree-master': userData.treesPlanted >= 20,
        'community-leader': userData.impactScore >= 100
    };

    Object.entries(achievements).forEach(([id, achieved]) => {
        const element = document.getElementById(id);
        if (achieved) {
            element.classList.add('achieved');
        } else {
            element.classList.add('locked');
        }
    });
}

// Load and display upcoming events
function loadEvents() {
    // Sample events data - replace with actual API call
    const events = [
        {
            title: "Community Tree Planting Day",
            date: "2024-04-15",
            location: "Amelia Earhart Park",
            description: "Join us for a day of tree planting and community building."
        },
        {
            title: "Tree Care Workshop",
            date: "2024-04-20",
            location: "West Little River Park",
            description: "Learn about proper tree care and maintenance techniques."
        }
    ];

    const eventList = document.getElementById('event-list');
    eventList.innerHTML = events.map(event => `
        <div class="event-item">
            <h4>${event.title}</h4>
            <p><i class="far fa-calendar"></i> ${formatDate(event.date)}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p>${event.description}</p>
        </div>
    `).join('');
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Display user name
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && userData.name) {
        userNameElement.textContent = userData.name;
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            window.location.href = '/login.html';
        });
    }

    // Fetch user data from server
    fetchUserData();

    // Event registration buttons
    const registerButtons = document.querySelectorAll('.event-card .btn');
    registerButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const eventCard = e.target.closest('.event-card');
            const eventName = eventCard.querySelector('h4').textContent;
            
            // Toggle button text
            if (button.textContent === 'Register') {
                button.textContent = 'Registered';
                button.classList.add('registered');
                
                // Show confirmation message
                showNotification(`You've registered for ${eventName}`);
            } else {
                button.textContent = 'Register';
                button.classList.remove('registered');
                
                // Show cancellation message
                showNotification(`You've cancelled registration for ${eventName}`);
            }
        });
    });
});

// Fetch user data from server
async function fetchUserData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('User data:', userData);
            
            // Update dashboard with user data
            // This would typically update stats, achievements, etc.
        } else {
            // If token is invalid, redirect to login
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add show class after a small delay to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 