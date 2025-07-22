document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }

    // Fetch dashboard data
    fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => {
            document.getElementById('money-donated').textContent = data.moneyDonated;
            document.getElementById('time-donated').textContent = data.timeDonated;
            const locationsGrid = document.querySelector('.locations-grid');
            data.locations.forEach(location => {
                const locationCard = document.createElement('div');
                locationCard.classList.add('location-card');
                locationCard.innerHTML = `
                    <img src="${location.image}" alt="${location.name}" class="location-image">
                    <div class="location-info">
                        <h3 class="location-name">${location.name}</h3>
                        <p class="location-address">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${location.address}</span>
                        </p>
                        <p class="location-description">${location.description}</p>
                    </div>
                    <div class="location-actions">
                        <a href="location.html?id=${location.id}" class="btn primary">View Details</a>
                        <a href="#" class="btn secondary">Plant Here</a>
                    </div>
                `;
                locationsGrid.appendChild(locationCard);
            });
        })
        .catch(error => console.error('Error fetching dashboard data:', error));

    // Fetch and display next event
    fetch('/api/events')
        .then(response => response.json())
        .then(events => {
            const nextEventContainer = document.getElementById('next-event');
            if (events.length > 0) {
                const nextEvent = events.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                nextEventContainer.innerHTML = `
                    <h4>${nextEvent.name}</h4>
                    <p>${new Date(nextEvent.date).toLocaleDateString()}</p>
                    <p>${nextEvent.location}</p>
                `;
            } else {
                nextEventContainer.innerHTML = '<p>No upcoming events.</p>';
            }
        });

    // Logout functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }
});
