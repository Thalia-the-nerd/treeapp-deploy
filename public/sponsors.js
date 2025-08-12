document.addEventListener("DOMContentLoaded", () => {
  const sponsorsContainer = document.getElementById("sponsors-container");

  fetch("/api/sponsors")
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch sponsors");
      }
      return response.json();
    })
    .then(sponsors => {
      const sponsorsByTier = sponsors.reduce((acc, sponsor) => {
        if (!acc[sponsor.tier]) {
          acc[sponsor.tier] = [];
        }
        acc[sponsor.tier].push(sponsor);
        return acc;
      }, {});

      const tierOrder = ["Platinum", "Gold", "Silver", "Bronze"];

      tierOrder.forEach(tier => {
        if (sponsorsByTier[tier]) {
          const tierSection = document.createElement("div");
          tierSection.className = "sponsor-category animate-on-scroll";
          tierSection.innerHTML = `
            <h2>${tier} Sponsors</h2>
            <div class="sponsor-grid">
              ${sponsorsByTier[tier]
                .map(
                  sponsor => `
                <div class="sponsor-card">
                  <div class="sponsor-logo">
                    ${
                      sponsor.logo
                        ? `<img src="${sponsor.logo}" alt="${sponsor.name}">`
                        : '<i class="fas fa-leaf"></i>'
                    }
                  </div>
                  <h3>${sponsor.name}</h3>
                  <p>${sponsor.description}</p>
                  <a href="sponsor-profile.html?id=${sponsor._id}" class="btn secondary">Learn More</a>
                </div>
              `
                )
                .join("")}
            </div>
          `;
          sponsorsContainer.appendChild(tierSection);
        }
      });
    })
    .catch(error => {
      console.error("Error fetching sponsors:", error);
      sponsorsContainer.innerHTML = "<p>Could not load sponsors at this time. Please try again later.</p>";
    });
});
