let filters = {
  date: new Date().toISOString().split('T')[0],
  building: 'all',
  floor: 'all',
  category: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  loadFilterOptions();
  loadStatistics();
  loadRooms();
  attachEventListeners();
});

function initializeFilters() {
  document.getElementById('dateFilter').value = filters.date;
}

async function loadFilterOptions() {
  try {
    const response = await fetch('/infra/api/filter-options');
    const data = await response.json();

    if (data.success) {
      const buildingSelect = document.getElementById('buildingFilter');
      data.data.buildings.forEach(building => {
        const option = document.createElement('option');
        option.value = building;
        option.textContent = building;
        buildingSelect.appendChild(option);
      });

      const floorSelect = document.getElementById('floorFilter');
      data.data.floors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor;
        option.textContent = floor;
        floorSelect.appendChild(option);
      });

      const categorySelect = document.getElementById('categoryFilter');
      data.data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

async function loadStatistics() {
  try {
    const response = await fetch(`/infra/api/statistics?date=${filters.date}`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('totalRooms').textContent = data.data.total_rooms;
      document.getElementById('occupiedRooms').textContent = data.data.occupied_rooms;
      document.getElementById('availableRooms').textContent = data.data.available_rooms;
      document.getElementById('occupancyRate').textContent = data.data.occupancy_rate + '%';
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

async function loadRooms() {
  showLoading();

  try {
    const response = await fetch(`/infra/api/rooms?date=${filters.date}`);
    const data = await response.json();

    if (data.success) {
      let rooms = data.data;

      // Client-side filtering
      if (filters.building !== 'all') {
        rooms = rooms.filter(r => r.building === filters.building);
      }
      if (filters.floor !== 'all') {
        rooms = rooms.filter(r => r.floor === filters.floor);
      }
      if (filters.category !== 'all') {
        rooms = rooms.filter(r => r.room_category === filters.category);
      }

      renderRooms(rooms);
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
  } finally {
    hideLoading();
  }
}

function renderRooms(rooms) {
  const container = document.getElementById('roomsContainer');
  const emptyState = document.getElementById('emptyState');

  if (rooms.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  const html = `
    <div class="class-cards-grid">
      ${rooms.map(room => {
        const isOccupied = room.schedules.length > 0;
        const statusColor = isOccupied ? 'var(--primary-color, #3b82f6)' : 'var(--success-color, #10b981)';
        return `
          <div class="class-card" onclick="viewRoomSchedule(${JSON.stringify(room).replace(/"/g, '&quot;')})" style="cursor: pointer;">
            <div class="card-subject">
              <span class="subject-badge" style="background: ${statusColor};">
                ${isOccupied ? '●' : '✓'}
              </span>
              <div class="subject-name">${room.room_name}</div>
            </div>

            <div class="card-info">
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span>${room.building} - ${room.floor}</span>
              </div>

              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                <span>Capacity: ${room.room_capacity || 'N/A'}</span>
              </div>

              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>${room.room_category}</span>
              </div>

              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${room.schedules.length} ${room.schedules.length === 1 ? 'class' : 'classes'} scheduled</span>
              </div>

              ${isOccupied ? `
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${room.schedules[0].start} - ${room.schedules[room.schedules.length - 1].end}</span>
              </div>
              ` : `
              <div class="card-info-row" style="color: var(--success-color, #10b981);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Available all day</span>
              </div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function viewRoomSchedule(room) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${room.room_name} - Schedule</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${room.schedules.length === 0 ? `
          <div class="empty-state">
            <h3>Room Available</h3>
            <p>No classes scheduled for this room today</p>
          </div>
        ` : `
          <div class="schedule-list">
            ${room.schedules.map(s => `
              <div class="schedule-item">
                <div class="schedule-time-badge">${s.start} - ${s.end}</div>
                <div class="schedule-details">
                  <div class="schedule-subject">${s.subject_name || 'N/A'}</div>
                  <div class="schedule-meta">
                    ${s.class || 'N/A'} &bull;
                    ${s.faculty_first_name || ''} ${s.faculty_last_name || 'N/A'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('roomsContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('roomsContainer').style.display = 'grid';
}

function attachEventListeners() {
  document.getElementById('dateFilter').addEventListener('change', (e) => {
    filters.date = e.target.value;
    loadStatistics();
    loadRooms();
  });

  document.getElementById('buildingFilter').addEventListener('change', (e) => {
    filters.building = e.target.value;
    loadRooms();
  });

  document.getElementById('floorFilter').addEventListener('change', (e) => {
    filters.floor = e.target.value;
    loadRooms();
  });

  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    filters.category = e.target.value;
    loadRooms();
  });
}
