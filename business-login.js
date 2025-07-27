document
  .getElementById("business-login-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, isBusiness: true }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("username", data.username);
      localStorage.setItem("isBusiness", data.isBusiness);
      window.location.href = "business-dashboard.html";
    } else {
      alert(data.message);
    }
  });
