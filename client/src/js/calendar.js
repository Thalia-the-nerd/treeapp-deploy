document.addEventListener("DOMContentLoaded", () => {
    const monthYear = document.getElementById("month-year");
    const calendarGrid = document.getElementById("calendar-grid");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    let currentDate = new Date();

    const renderCalendar = async () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        calendarGrid.innerHTML = "";

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.innerHTML += '<div class="calendar-day empty"></div>';
        }

        for (let i = 1; i <= daysInMonth; i++) {
            calendarGrid.innerHTML += `<div class="calendar-day">${i}</div>`;
        }

        // Fetch and display events
        const events = await fetchEvents();
        events.forEach(event => {
            const eventDate = new Date(event.date);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                const dayElement = calendarGrid.children[firstDayOfMonth + eventDate.getDate() - 1];
                if (dayElement) {
                    dayElement.classList.add("event");
                    dayElement.innerHTML += `<div class="event-tooltip">${event.name}</div>`;
                }
            }
        });
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch("/api/events");
            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    };

    prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});
