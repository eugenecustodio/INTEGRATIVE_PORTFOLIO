const calendarData = {
    currentDate: new Date(),
    events: []
};

function updateMonthDisplay() {
    const options = { month: 'long', year: 'numeric' };
    document.getElementById('currentMonth').textContent =
        calendarData.currentDate.toLocaleDateString('en-US', options);
}

function generateCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';

    const startDate = new Date(calendarData.currentDate);
    startDate.setDate(1);

    for (let i = 0; i < startDate.getDay(); i++) {
        calendarBody.innerHTML += `<div class="calendar-cell"></div>`;
    }

    while (startDate.getMonth() === calendarData.currentDate.getMonth()) {
        const dayEvents = calendarData.events.filter(e =>
            e.date.toDateString() === startDate.toDateString()
        );

        const cellDate = new Date(startDate);
        const isFuture = cellDate > new Date();

        calendarBody.innerHTML += `
            <div class="calendar-cell ${isFuture ? 'future-date' : ''}">
                <div class="fw-bold">${startDate.getDate()}</div>
                ${dayEvents.map(e => `
                    <div class="event-badge" 
                         style="background: ${e.color}20; color: ${e.color}"
                         onclick="showEventDetails('${e.title}', '${e.description}', '${e.date}', '${e.color}')">
                        <i class="fas fa-circle me-1" style="font-size: 6px; color: ${e.color}"></i>
                        ${e.title}
                    </div>
                `).join('')}
            </div>
        `;

        startDate.setDate(startDate.getDate() + 1);
    }
    updateMonthDisplay();
}

function changeMonth(offset) {
    calendarData.currentDate.setMonth(calendarData.currentDate.getMonth() + offset);
    generateCalendar();
}

function addEvent() {
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    const eventDate = new Date(document.getElementById('eventDate').value);
    const colorSelect = document.getElementById('eventColor');
    const customColor = document.getElementById('customColor').value;

    let color = colorSelect.value;
    if (color === 'custom') color = customColor;

    calendarData.events.push({
        title: title.trim(),
        description: description.trim(),
        color,
        date: eventDate
    });

    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventDate').value = '';

    $('#addEventModal').modal('hide');
    generateCalendar();
}

function showEventDetails(title, description, dateString, color) {
    const date = new Date(dateString);
    document.getElementById('eventDetailTitle').textContent = title;
    document.getElementById('eventDetailDescription').textContent = description;
    document.getElementById('eventDetailDate').textContent =
        date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('eventDetailColor').style.backgroundColor = color;
    $('#eventDetailsModal').modal('show');
}

document.getElementById('eventColor').addEventListener('change', function () {
    document.getElementById('customColor').classList.toggle('d-none', this.value !== 'custom');
});

document.getElementById('eventDate').min = new Date().toISOString().split('T')[0];

generateCalendar();
