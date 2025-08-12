document.addEventListener("DOMContentLoaded", () => {
  const adminLinkContainer = document.getElementById("admin-link-container");
  const loginLink = document.querySelector('a[href="login.html"]');
  const logoutButton = document.createElement("li");
  logoutButton.innerHTML = '<a href="#" id="logout-button">Logout</a>';

  fetch("/api/check-auth")
    .then((response) => response.json())
    .then((data) => {
      if (data.isAuthenticated) {
        if (loginLink) {
          const nav = loginLink.parentElement.parentElement;
          nav.removeChild(loginLink.parentElement);
          nav.appendChild(logoutButton);
        }

        if (data.user.isAdmin && adminLinkContainer) {
          adminLinkContainer.style.display = "list-item";
        }

        const logoutBtn = document.getElementById("logout-button");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            fetch("/api/logout", { method: "POST" }).then(() => {
              window.location.href = "login.html";
            });
          });
        }
      }
    });
});
