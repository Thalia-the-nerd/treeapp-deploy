document.addEventListener('DOMContentLoaded', () => {
    const usersTable = document.querySelector('#users-table tbody');
    const eventsTable = document.querySelector('#events-table tbody');
    const createEventForm = document.getElementById('create-event-form');

    // Fetch and display users
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td><input type="number" value="${user.timeDonated || 0}" data-id="${user._id}" data-field="timeDonated"></td>
                    <td><input type="number" value="${user.moneyDonated || 0}" data-id="${user._id}" data-field="moneyDonated"></td>
                    <td><input type="checkbox" ${user.isAdmin ? 'checked' : ''} data-id="${user._id}" data-field="isAdmin"></td>
                    <td><button data-id="${user._id}" class="update-user">Update</button></td>
                `;
                usersTable.appendChild(row);
            });
        });

    // Fetch and display events
    fetch('/api/events')
        .then(response => response.json())
        .then(events => {
            events.forEach(event => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${event.name}</td>
                    <td>${new Date(event.date).toLocaleDateString()}</td>
                    <td>${event.location}</td>
                    <td>
                        <button data-id="${event._id}" class="get-qr-code">Get QR Code</button>
                        <button data-id="${event._id}" class="delete-event">Delete</button>
                    </td>
                `;
                eventsTable.appendChild(row);
            });
        });

    // Handle user updates
    usersTable.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-user')) {
            const button = e.target;
            const id = button.dataset.id;
            const row = button.closest('tr');
            const timeDonated = row.querySelector('[data-field="timeDonated"]').value;
            const moneyDonated = row.querySelector('[data-field="moneyDonated"]').value;
            const isAdmin = row.querySelector('[data-field="isAdmin"]').checked;

            fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timeDonated, moneyDonated, isAdmin })
            }).then(response => {
                if (response.ok) {
                    alert('User updated successfully');
                } else {
                    alert('Failed to update user');
                }
            });
        }
    });

    // Handle event creation
    createEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('event-name').value;
        const date = document.getElementById('event-date').value;
        const location = document.getElementById('event-location').value;

        fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date, location })
        }).then(response => {
            if (response.ok) {
                alert('Event created successfully');
                location.reload();
            } else {
                alert('Failed to create event');
            }
        });
    });

    // Handle event deletion
    eventsTable.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-event')) {
            const button = e.target;
            const id = button.dataset.id;

            if (confirm('Are you sure you want to delete this event?')) {
                fetch(`/api/events/${id}`, {
                    method: 'DELETE'
                }).then(response => {
                    if (response.ok) {
                        alert('Event deleted successfully');
                        location.reload();
                    } else {
                        alert('Failed to delete event');
                    }
                });
            }
        }
    });

    // Handle "Get QR Code" button click
    eventsTable.addEventListener('click', (e) => {
        if (e.target.classList.contains('get-qr-code')) {
            const eventId = e.target.dataset.id;
            fetch(`/api/events/${eventId}/qr-code`)
                .then(response => response.json())
                .then(data => {
                    const qrCodeContainer = document.getElementById('qr-code-container');
                    qrCodeContainer.innerHTML = `<img src="${data.qrCodeUrl}" alt="Event QR Code">`;
                    const modal = document.getElementById('qr-code-modal');
                    modal.style.display = 'block';
                });
        }
    });

    // Close the modal
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        const modal = document.getElementById('qr-code-modal');
        modal.style.display = 'none';
    });
});