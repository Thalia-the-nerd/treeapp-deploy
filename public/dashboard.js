document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!username) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("username").textContent = username;

  const adminLinkContainer = document.getElementById("admin-link-container");
  adminLinkContainer.style.display = "none";

  if (isAdmin) {
    if (adminLinkContainer) {
      adminLinkContainer.style.display = "list-item";
    }
  }

  const rewards = [
    { name: "T-Shirt", type: "money", threshold: 150 },
    { name: "T-Shirt", type: "time", threshold: 50 },
    { name: "Mug", type: "money", threshold: 300 },
    { name: "Mug", type: "time", threshold: 100 },
    { name: "Tote Bag", type: "money", threshold: 500 },
    { name: "Tote Bag", type: "time", threshold: 200 },
    { name: "Engraved Plaque", type: "money", threshold: 1000 },
    { name: "Engraved Plaque", type: "time", threshold: 500 },
  ];

  // Fetch dashboard data
  fetch(`/api/user/dashboard?username=${username}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    })
    .then((data) => {
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

      // Populate rewards
      const rewardsContainer = document.getElementById("rewards-container");
      rewardsContainer.innerHTML = "";

      const moneyRewards = rewards
        .filter((r) => r.type === "money")
        .sort((a, b) => a.threshold - b.threshold);
      const timeRewards = rewards
        .filter((r) => r.type === "time")
        .sort((a, b) => a.threshold - b.threshold);

      const nextMoneyReward = moneyRewards.find(
        (r) => data.moneyDonated < r.threshold,
      );
      const nextTimeReward = timeRewards.find(
        (r) => data.timeDonated < r.threshold,
      );

      if (nextMoneyReward) {
        rewardsContainer.appendChild(
          createRewardCard(nextMoneyReward, data.moneyDonated),
        );
      }
      if (nextTimeReward) {
        rewardsContainer.appendChild(
          createRewardCard(nextTimeReward, data.timeDonated),
        );
      }

      // Populate badges
      const badgesContainer = document.getElementById("badges-container");
      badgesContainer.innerHTML = "";
      if (data.badges && data.badges.length > 0) {
          data.badges.forEach(badge => {
              badgesContainer.appendChild(createBadgeCard(badge));
          });
      } else {
          badgesContainer.innerHTML = "<p>No badges earned yet. Keep up the great work!</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching dashboard data:", error);
      const mainContainer = document.querySelector("main.container");
      mainContainer.innerHTML =
        '<p style="color: red;">Could not load dashboard data. Please try again later.</p>';
    });

  function createRewardCard(reward, currentValue) {
    const card = document.createElement("div");
    card.className = "feature-card reward-card";
    const progress = Math.min((currentValue / reward.threshold) * 100, 100);
    const unit = reward.type === "money" ? "$" : "hrs";
    const currentDisplay =
      reward.type === "money"
        ? currentValue.toFixed(2)
        : currentValue.toFixed(1);

    card.innerHTML = `
            <i class="fas fa-trophy"></i>
            <div class="reward-info">
                <h4>Next Reward: ${reward.name}</h4>
                <p>Reach ${reward.threshold} ${unit} donated to unlock</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <p class="progress-text">${currentDisplay} / ${reward.threshold} ${unit}</p>
            </div>
        `;
    return card;
  }

  function createBadgeCard(badge) {
    const card = document.createElement("div");
    card.className = "feature-card badge-card";
    card.innerHTML = `
        <i class="fas fa-medal"></i>
        <div class="badge-info">
            <h4>${badge.name}</h4>
            <p>${badge.description}</p>
        </div>
    `;
    return card;
  }

  // Logout functionality
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("username");
      localStorage.removeItem("isAdmin");
      window.location.href = "login.html";
    });
  }
});
