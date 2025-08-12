document
  .getElementById("business-signup-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const businessName = document.getElementById("business-name").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessName,
        email,
        username,
        password,
        isBusiness: true,
      }),
    });

    const data = await response.text();
    alert(data);
    if (response.ok) {
      window.location.href = "business-login.html";
    }
  });
