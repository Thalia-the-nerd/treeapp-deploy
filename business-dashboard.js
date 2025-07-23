document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const isBusiness = localStorage.getItem("isBusiness") === "true";

  if (!username || !isBusiness) {
    window.location.href = "login.html";
    return;
  }

  // Fetch business data
  fetch(`/api/user/dashboard?username=${username}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("business-name").textContent = data.businessName;

      // Populate stats
      const statsContainer = document.querySelector(".dashboard-stats");
      statsContainer.innerHTML = `
                <div class="feature-card">
                    <i class="fas fa-dollar-sign"></i>
                    <h3>Money Donated</h3>
                    <div class="counter">
                        <span class="number">$${data.moneyDonated.toFixed(2)}</span>
                    </div>
                </div>
                <div class="feature-card">
                    <i class="fas fa-clock"></i>
                    <h3>Time Donated</h3>
                    <div class="counter">
                        <span class="number">${data.timeDonated.toFixed(1)}</span>
                        <span class="label">hours</span>
                    </div>
                </div>
            `;

      // Populate locations
      const locationsGrid = document.querySelector(".locations-grid");
      locationsGrid.innerHTML = "";
      if (data.nextEvent) {
        const eventCard = document.createElement("div");
        eventCard.className = "location-card-new";
        const eventDate = new Date(data.nextEvent.date).toLocaleDateString(
          "en-US",
          { weekday: "long", year: "numeric", month: "long", day: "numeric" },
        );
        eventCard.innerHTML = `
                    <img src="${data.nextEvent.image}" alt="${data.nextEvent.name}" class="card-image">
                    <div class="card-content">
                        <h4 class="card-title">${data.nextEvent.name}</h4>
                        <p class="card-address"><strong>Date:</strong> ${eventDate}</p>
                        <p class="card-address">${data.nextEvent.address}</p>
                        <a href="location.html?id=${data.nextEvent.id}" class="btn primary">View Details</a>
                    </div>
                `;
        locationsGrid.appendChild(eventCard);
      } else {
        locationsGrid.innerHTML =
          "<p>No upcoming events scheduled. Check back soon!</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching dashboard data:", error);
      const mainContainer = document.querySelector("main.container");
      mainContainer.innerHTML =
        '<p style="color: red;">Could not load dashboard data. Please try again later.</p>';
    });

  // Logout functionality
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("username");
      localStorage.removeItem("isBusiness");
      window.location.href = "login.html";
    });
  }
});