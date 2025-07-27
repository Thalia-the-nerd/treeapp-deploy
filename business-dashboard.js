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

      // Fetch sponsorship data
      fetch(`/api/sponsorship?username=${username}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to fetch sponsorship data");
          }
          return response.json();
        })
        .then(data => {
          document.getElementById("sponsor-name").value = data.name;
          document.getElementById("sponsor-description").value = data.description;
          document.getElementById("sponsor-logo").value = data.logo;
          document.getElementById("current-tier").textContent = data.tier;
        })
        .catch(error => {
          console.error("Error fetching sponsorship data:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching dashboard data:", error);
      const mainContainer = document.querySelector("main.container");
      mainContainer.innerHTML =
        '<p style="color: red;">Could not load dashboard data. Please try again later.</p>';
    });

  // Sponsorship form submission
  const sponsorshipForm = document.getElementById("sponsorship-form");
  if (sponsorshipForm) {
    sponsorshipForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(sponsorshipForm);
      const data = Object.fromEntries(formData.entries());
      data.username = username;

      fetch("/api/sponsorship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to save sponsorship details");
          }
          alert("Sponsorship details saved successfully!");
        })
        .catch(error => {
          console.error("Error saving sponsorship details:", error);
          alert("Failed to save sponsorship details. Please try again later.");
        });
    });
  }

  // Upgrade tier button
  const upgradeTierButton = document.getElementById("upgrade-tier");
  if (upgradeTierButton) {
    upgradeTierButton.addEventListener("click", () => {
      fetch("/api/sponsorship/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to submit upgrade request");
          }
          alert("Your request to upgrade your sponsorship tier has been submitted. The admin team will contact you shortly.");
        })
        .catch(error => {
          console.error("Error submitting upgrade request:", error);
          alert("Failed to submit upgrade request. Please try again later.");
        });
    });
  }

  // Contact admin button
  const contactAdminButton = document.getElementById("contact-admin");
  if (contactAdminButton) {
    contactAdminButton.addEventListener("click", () => {
      // For now, I'll just use a simple prompt. I can implement a modal later if needed.
      const message = prompt("Enter your message to the admin team:");
      if (message) {
        fetch("/api/contact-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, message }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to send message");
            }
            alert("Your message has been sent to the admin team.");
          })
          .catch(error => {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again later.");
          });
      }
    });
  }

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