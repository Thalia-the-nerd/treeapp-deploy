document
  .getElementById("business-login-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const stayLoggedIn = document.getElementById("stayLoggedIn").checked;

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        isBusiness: true,
        stayLoggedIn,
      }),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "business-dashboard.html";
    } else {
      alert(data.message);
    }
  });
