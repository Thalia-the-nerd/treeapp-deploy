document.addEventListener("DOMContentLoaded", () => {
  const userInfoContainer = document.getElementById("user-info");
  const userActivityContainer = document.getElementById("user-activity-table-container");
  const userDetailsTitle = document.getElementById("user-details-title");

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  if (!userId) {
    window.location.href = "admin.html";
    return;
  }

  const fetchData = async (url) => {
    const response = await fetch(url, {
      headers: { "x-admin": "true" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const loadUserDetails = async () => {
    try {
      const user = await fetchData(`/api/users/${userId}`);
      userDetailsTitle.textContent = `User Details: ${user.username}`;
      userInfoContainer.innerHTML = `
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Money Donated:</strong> ${(user.moneyDonated || 0).toFixed(2)}</p>
        <p><strong>Time Donated:</strong> ${(user.timeDonated || 0).toFixed(1)} hours</p>
        <p><strong>Admin:</strong> ${user.isAdmin ? "Yes" : "No"}</p>
        <p><strong>Suspended:</strong> ${user.isSuspended ? "Yes" : "No"}</p>
        <p><strong>Flagged:</strong> ${user.isFlagged ? "Yes" : "No"}</p>
      `;

      const suspendBtn = document.getElementById("suspend-user-btn");
      if (user.isSuspended) {
        suspendBtn.textContent = "Unsuspend User";
        suspendBtn.onclick = () => {
          if (confirm("Are you sure you want to unsuspend this user?")) {
            handleAction(postData, `/api/users/${userId}/unsuspend`, "User unsuspended.");
          }
        };
      } else {
        suspendBtn.textContent = "Suspend User";
        suspendBtn.onclick = () => {
          if (confirm("Are you sure you want to suspend this user?")) {
            handleAction(postData, `/api/users/${userId}/suspend`, "User suspended.");
          }
        };
      }
    } catch (error) {
      console.error("Failed to load user details:", error);
      userInfoContainer.innerHTML = `<p class="error">Could not load user details. Error: ${error.message}</p>`;
    }
  };

  const loadUserActivity = async (filter = "") => {
    try {
      const activity = await fetchData(`/api/users/${userId}/activity`);
      let filteredActivity = activity;
      if (filter) {
        filteredActivity = activity.filter(log => log.action.includes(filter));
      }
      let tableHtml = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (filteredActivity.length > 0) {
        tableHtml += filteredActivity.map(log => `
          <tr>
            <td>${log.action}</td>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
          </tr>
        `).join("");
      } else {
        tableHtml += '<tr><td colspan="2">No activity found.</td></tr>';
      }
      tableHtml += '</tbody></table>';
      userActivityContainer.innerHTML = tableHtml;
    } catch (error) {
      console.error("Failed to load user activity:", error);
      userActivityContainer.innerHTML = '<p class="error">Could not load user activity.</p>';
    }
  };

  document.getElementById("view-login-history-btn").addEventListener("click", () => loadUserActivity("login"));
  document.getElementById("view-donations-btn").addEventListener("click", () => loadUserActivity("donated"));
  document.getElementById("view-event-history-btn").addEventListener("click", () => loadUserActivity("event"));

  const postData = async (url, data = {}) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "x-admin": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.text();
  };

  const deleteData = async (url) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { "x-admin": "true" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.text();
  };

  const handleAction = async (action, url, successMessage) => {
    try {
      const message = await action(url);
      alert(successMessage || message);
      loadUserDetails();
      loadUserActivity();
    } catch (error) {
      console.error(`Failed to ${url}:`, error);
      alert(`Failed to perform action. See console for details.`);
    }
  };

  document.getElementById("reset-password-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to send a password reset link to this user?")) {
      handleAction(postData, `/api/users/${userId}/reset-password`, "Password reset link sent.");
    }
  });

  document.getElementById("manual-verify-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to manually verify this user's email?")) {
      handleAction(postData, `/api/users/${userId}/manual-verify`, "User email verified.");
    }
  });

  document.getElementById("flag-account-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to flag this account?")) {
      handleAction(postData, `/api/users/${userId}/flag`, "Account flagged.");
    }
  });

  document.getElementById("unflag-account-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to unflag this account?")) {
      handleAction(postData, `/api/users/${userId}/unflag`, "Account unflagged.");
    }
  });

  document.getElementById("delete-account-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      handleAction(deleteData, `/api/users/${userId}`, "User deleted successfully.");
      // Redirect to admin page after deletion
      setTimeout(() => window.location.href = 'admin.html', 2000);
    }
  });

  const modal = document.getElementById("action-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalForm = document.getElementById("modal-form");
  const modalBody = document.getElementById("modal-body");
  const closeModal = document.querySelector(".close-button");

  closeModal.onclick = () => modal.style.display = "none";
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  const openModal = (title, formHtml, onSubmit) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = formHtml;
    modal.style.display = "block";
    modalForm.onsubmit = (e) => {
      e.preventDefault();
      onSubmit(new FormData(e.target));
      modal.style.display = "none";
    };
  };

  document.getElementById("send-warning-btn").addEventListener("click", () => {
    openModal("Send Warning", '<textarea name="message" rows="5" required placeholder="Warning message..."></textarea>', (formData) => {
      const message = formData.get("message");
      handleAction( (url) => postData(url, { message }), `/api/users/${userId}/send-warning`, "Warning sent.");
    });
  });

  document.getElementById("assign-badge-btn").addEventListener("click", () => {
    openModal("Assign Badge", '<input type="text" name="badge" required placeholder="Badge name...">', (formData) => {
      const badge = formData.get("badge");
      handleAction( (url) => postData(url, { badge }), `/api/users/${userId}/assign-badge`, "Badge assigned.");
    });
  });

  document.getElementById("add-note-btn").addEventListener("click", () => {
    openModal("Add Note", '<textarea name="note" rows="5" required placeholder="Note..."></textarea>', (formData) => {
      const note = formData.get("note");
      handleAction( (url) => postData(url, { note }), `/api/users/${userId}/add-note`, "Note added.");
    });
  });

  document.getElementById("change-username-btn").addEventListener("click", () => {
    openModal("Change Username", '<input type="text" name="username" required placeholder="New username...">', (formData) => {
      const username = formData.get("username");
      handleAction( (url) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin': 'true' }, body: JSON.stringify({ username }) }), `/api/users/${userId}/change-username`, "Username changed.");
    });
  });

  document.getElementById("change-email-btn").addEventListener("click", () => {
    openModal("Change Email", '<input type="email" name="email" required placeholder="New email...">', (formData) => {
      const email = formData.get("email");
      handleAction( (url) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin': 'true' }, body: JSON.stringify({ email }) }), `/api/users/${userId}/change-email`, "Email changed.");
    });
  });

  document.getElementById("export-data-btn").addEventListener("click", async () => {
    try {
      const data = await fetchData(`/api/users/${userId}/export`);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `user_${userId}_export.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data. See console for details.");
    }
  });

  document.getElementById("anonymize-user-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to anonymize this user? This will remove their personal information and cannot be undone.")) {
      handleAction(postData, `/api/users/${userId}/anonymize`, "User anonymized.");
    }
  });

  document.getElementById("view-ip-history-btn").addEventListener("click", async () => {
    try {
      const user = await fetchData(`/api/users/${userId}`);
      const ipHistory = user.ipHistory || [];
      let historyHtml = "<h3>IP History</h3><ul>";
      if (ipHistory.length > 0) {
        historyHtml += ipHistory.map(entry => `<li>${entry.ip} at ${new Date(entry.timestamp).toLocaleString()}</li>`).join("");
      } else {
        historyHtml += "<li>No IP history found.</li>";
      }
      historyHtml += "</ul>";
      const newWindow = window.open();
      newWindow.document.write(historyHtml);
    } catch (error) {
      console.error("Failed to get IP history:", error);
      alert("Failed to get IP history. See console for details.");
    }
  });

  // Placeholder buttons
  document.getElementById("clear-cache-btn").addEventListener("click", () => alert("Functionality not yet implemented."));
  document.getElementById("recalculate-stats-btn").addEventListener("click", () => alert("Functionality not yet implemented."));
  document.getElementById("merge-account-btn").addEventListener("click", () => alert("Functionality not yet implemented."));
  document.getElementById("view-sent-emails-btn").addEventListener("click", () => alert("Functionality not yet implemented."));

  loadUserDetails();
  loadUserActivity();
});

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
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
});