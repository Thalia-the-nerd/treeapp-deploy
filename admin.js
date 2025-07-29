document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".admin-section");
  const userModal = document.getElementById("edit-user-modal");
  const qrCodeModal = document.getElementById("qr-code-modal");
  const closeButtons = document.querySelectorAll(".close-button");
  const token = localStorage.getItem("token");

  // --- Basic Setup & Navigation ---
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href").substring(1);
      if (!document.getElementById(targetId)) return;

      e.preventDefault();

      navLinks.forEach((l) => l.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      link.classList.add("active");
      document.getElementById(targetId).classList.add("active");

      // Load content for the clicked section
      if (targetId === "users") loadUsers();
      if (targetId === "events") loadEvents();
      if (targetId === "sponsors") loadSponsors();
      if (targetId === "notifications") loadNotifications();
    });
  });

  closeButtons.forEach(button => {
    button.onclick = () => {
        userModal.style.display = "none";
        qrCodeModal.style.display = "none";
    }
  });

  window.onclick = (event) => {
    if (event.target == userModal || event.target == qrCodeModal) {
      userModal.style.display = "none";
      qrCodeModal.style.display = "none";
    }
  };

  // --- API Fetch Functions ---
  const fetchData = async (url) => {
    const response = await fetch(url, {
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  // --- User Management ---
  const loadUsers = async (query = "") => {
    try {
      const url = query ? `/api/users?search=${query}` : "/api/users";
      const users = await fetchData(url);
      const container = document.getElementById("users-table-container");
      container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Money Donated</th>
                            <th>Time Donated</th>
                            <th>Admin?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users
                          .map(
                            (user) => `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td>${(user.moneyDonated || 0).toFixed(2)}</td>
                                <td>${(user.timeDonated || 0).toFixed(1)} hrs</td>
                                <td>${user.isAdmin ? "Yes" : "No"}</td>
                                <td>
                                    <button class="btn btn-sm primary edit-user-btn" data-id="${user._id}">Edit</button>
                                    <a href="user-details.html?id=${user._id}" class="btn btn-sm info">View</a>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            `;
      document.querySelectorAll(".edit-user-btn").forEach((button) => {
        button.addEventListener("click", () =>
          openEditUserModal(users.find((u) => u._id === button.dataset.id)),
        );
      });
    } catch (error) {
      console.error("Failed to load users:", error);
      document.getElementById("users-table-container").innerHTML =
        '<p class="error">Could not load users.</p>';
    }
  };

  const userSearchInput = document.getElementById("user-search-input");

  userSearchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        loadUsers(userSearchInput.value);
    }
  });

  const openEditUserModal = (user) => {
    document.getElementById("edit-userId").value = user._id;
    document.getElementById("edit-username").value = user.username;
    document.getElementById("edit-moneyDonated").value = user.moneyDonated || 0;
    document.getElementById("edit-timeDonated").value = user.timeDonated || 0;
    document.getElementById("edit-isAdmin").checked = user.isAdmin;
    userModal.style.display = "block";
  };

  document
    .getElementById("edit-user-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const userId = document.getElementById("edit-userId").value;
      const body = {
        moneyDonated: parseFloat(
          document.getElementById("edit-moneyDonated").value,
        ),
        timeDonated: parseFloat(
          document.getElementById("edit-timeDonated").value,
        ),
        isAdmin: document.getElementById("edit-isAdmin").checked,
      };

      try {
        await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(body),
        });
        userModal.style.display = "none";
        loadUsers(); // Refresh the list
      } catch (error) {
        console.error("Failed to update user:", error);
      }
    });

  // --- Event Management ---
  const loadEvents = async () => {
    try {
      const events = await fetchData("/api/events");
      const container = document.getElementById("events-table-container");
      container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Attendance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events
                          .map(
                            (event) => `
                            <tr>
                                <td>${event.name}</td>
                                <td>${new Date(event.date).toLocaleString()}</td>
                                <td>${event.location}</td>
                                <td>${event.attendance.length}</td>
                                <td>
                                    <button class="btn btn-sm info qr-code-btn" data-id="${event._id}">QR Code</button>
                                    <button class="btn btn-sm danger delete-event-btn" data-id="${event._id}">Delete</button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            `;
      document.querySelectorAll(".delete-event-btn").forEach((button) => {
        button.addEventListener("click", () => deleteEvent(button.dataset.id));
      });
      document.querySelectorAll(".qr-code-btn").forEach((button) => {
        button.addEventListener("click", () => generateQrCode(button.dataset.id));
      });
    } catch (error) {
      console.error("Failed to load events:", error);
      document.getElementById("events-table-container").innerHTML =
        '<p class="error">Could not load events.</p>';
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      loadEvents(); // Refresh
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const generateQrCode = (eventId) => {
    window.open(`qr-code-page.html?eventId=${eventId}`, '_blank');
  };

  document
    .getElementById("create-event-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append("name", document.getElementById("eventName").value);
      formData.append("date", document.getElementById("eventDate").value);
      formData.append("location", document.getElementById("eventLocation").value);

      try {
        await fetch("/api/events", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData,
        });
        e.target.reset();
        loadEvents(); // Refresh
      } catch (error) {
        console.error("Failed to create event:", error);
      }
    });

  // --- Notifications ---
  const loadNotifications = async () => {
    try {
      const notifications = await fetchData("/api/notifications");
      const container = document.getElementById("notifications-list");
      if (notifications.length === 0) {
        container.innerHTML = "<p>No notifications yet.</p>";
        return;
      }
      container.innerHTML = notifications
        .map(
          (n) => `
                <div class="notification-item">
                    <p><strong>${n.username}</strong>: ${n.message}</p>
                    <span class="timestamp">${new Date(n.timestamp).toLocaleString()}</span>
                </div>
            `,
        )
        .join("");
    } catch (error) {
      console.error("Failed to load notifications:", error);
      document.getElementById("notifications-list").innerHTML =
        '<p class="error">Could not load notifications.</p>';
    }
  };

  // --- Sponsor Management ---
  const loadSponsors = async () => {
    try {
      const sponsors = await fetchData("/api/sponsors");
      const container = document.getElementById("sponsors-table-container");
      container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Level</th>
                            <th>Logo</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sponsors
                          .map(
                            (sponsor) => `
                            <tr>
                                <td>${sponsor.name}</td>
                                <td>${sponsor.level}</td>
                                <td>${sponsor.logo ? `<img src="${sponsor.logo}" alt="${sponsor.name} Logo" style="width: 50px; height: auto;">` : 'N/A'}</td>
                                <td>
                                    <button class="btn btn-sm danger delete-sponsor-btn" data-id="${sponsor._id}">Delete</button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            `;
      document.querySelectorAll(".delete-sponsor-btn").forEach((button) => {
        button.addEventListener("click", () => deleteSponsor(button.dataset.id));
      });
    } catch (error) {
      console.error("Failed to load sponsors:", error);
      document.getElementById("sponsors-table-container").innerHTML =
        '<p class="error">Could not load sponsors.</p>';
    }
  };

  const addSponsor = async (sponsorData) => {
    try {
      await fetch("/api/sponsors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(sponsorData),
      });
      loadSponsors(); // Refresh the list
    } catch (error) {
      console.error("Failed to add sponsor:", error);
    }
  };

  const deleteSponsor = async (sponsorId) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    try {
      await fetch(`/api/sponsors/${sponsorId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      loadSponsors(); // Refresh
    } catch (error) {
      console.error("Failed to delete sponsor:", error);
    }
  };

  document.getElementById("add-sponsor-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const sponsorName = document.getElementById("sponsorName").value;
    const sponsorLevel = document.getElementById("sponsorLevel").value;
    const sponsorLogo = document.getElementById("sponsorLogo").value;

    await addSponsor({ name: sponsorName, level: sponsorLevel, logo: sponsorLogo });
    e.target.reset();
  });

  // --- Initial Load ---
  loadUsers();

  document.getElementById('logout-button').addEventListener('click', async function() {
      const username = localStorage.getItem('username');
      if (username) {
          await fetch('/api/logout', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username })
          });
      }

      // Clear local storage or any session variables
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin');

      // Redirect to login page
      window.location.href = 'login.html';
  });
});

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });

  const input = document.getElementById("eventLocation");
  const autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.bindTo("bounds", map);

  const marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener("place_changed", () => {
    marker.setVisible(false);
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17); // Why 17? Because it looks good.
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
  });
}

