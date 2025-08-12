document.addEventListener("DOMContentLoaded", async () => {
    const qrCodeDisplay = document.getElementById("qr-code-display");
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");

    if (!eventId) {
        qrCodeDisplay.innerHTML = '<p class="error">No event ID provided.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/events/${eventId}/qr-code`, {
            headers: { "x-admin": "true" }, // Assuming this might still be needed
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        qrCodeDisplay.innerHTML = `<img src="${data.qrCodeUrl}" alt="Event QR Code">`;
    } catch (error) {
        console.error("Failed to generate QR code:", error);
        qrCodeDisplay.innerHTML = '<p class="error">Could not load QR code. Please try again.</p>';
    }
});
