let filters = {
  date: new Date().toISOString().split('T')[0],
  building: 'all',
  floor: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  loadFilterOptions();
  loadClassrooms();
  attachEventListeners();
});

function initializeFilters() {
  document.getElementById('dateFilter').value = filters.date;
}

async function loadFilterOptions() {
  try {
    const response = await fetch('/api/dashboard/filters');
    const data = await response.json();
    
    if (data.success) {
      // Populate buildings
      const buildingSelect = document.getElementById('buildingFilter');
      const buildings = [...new Set(data.data.rooms.map(r => r.floor_building))];
      buildings.forEach(building => {
        const option = document.createElement('option');
        option.value = building;
        option.textContent = building;
        buildingSelect.appendChild(option);
      });
      
      // Populate floors
      const floorSelect = document.getElementById('floorFilter');
      const floors = [...new Set(data.data.rooms.map(r => r.floor_name))];
      floors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor;
        option.textContent = floor;
        floorSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

async function loadClassrooms() {
  showLoading();
  
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`/resources/api/classrooms?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      renderClassrooms(data.data);
    }
  } catch (error) {
    console.error('Error loading classrooms:', error);
  } finally {
    hideLoading();
  }
}

function renderClassrooms(classrooms) {
  const container = document.getElementById('classroomsContainer');
  const emptyState = document.getElementById('emptyState');
  
  if (classrooms.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  const html = `
    <div class="class-cards-grid">
      ${classrooms.map(room => {
        const statusColor = room.status === 'Available' ? 'var(--success-color)' : 'var(--primary-color)';
        return `
          <div class="class-card" onclick="viewClassroomSchedule(${room.room_id})" style="cursor: pointer;">
            <div class="card-subject">
              <span class="subject-badge" style="background: ${statusColor};">
                ${room.status === 'Available' ? '✓' : '●'}
              </span>
              <div class="subject-name">${room.room_name}</div>
            </div>
            
            <div class="card-info">
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span>${room.floor_building}</span>
              </div>
              
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>${room.floor_name}</span>
              </div>
              
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${room.classes_today} ${room.classes_today === 1 ? 'class' : 'classes'} today</span>
              </div>
              
              ${room.first_class ? `
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${room.first_class} - ${room.last_class}</span>
              </div>
              ` : `
              <div class="card-info-row" style="color: var(--success-color);">
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

async function viewClassroomSchedule(roomId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Classroom Schedule</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">×</button>
      </div>
      <div class="modal-body">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  try {
    const response = await fetch(`/resources/api/classroom-schedule?roomId=${roomId}&date=${filters.date}`);
    const data = await response.json();
    
    if (data.success) {
      const modalBody = modal.querySelector('.modal-body');
      
      if (data.data.length === 0) {
        modalBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <h3>Room Available</h3>
            <p>This classroom has no scheduled classes today</p>
          </div>
        `;
      } else {
        modalBody.innerHTML = `
          <div class="schedule-list">
            ${data.data.map(cls => `
              <div class="schedule-item">
                <div class="schedule-time-badge">${cls.start_time} - ${cls.end_time}</div>
                <div class="schedule-details">
                  <div class="schedule-subject">
                    ${cls.subject_code ? `[${cls.subject_code}] ` : ''}${cls.subject_name || 'N/A'}
                  </div>
                  <div class="schedule-meta">
                    👥 ${cls.class_name || 'N/A'} • 
                    👨‍🏫 ${cls.faculty_first_name || ''} ${cls.faculty_last_name || 'N/A'}
                    ${cls.school_name ? '• 🎓 ' + cls.school_code : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading classroom schedule:', error);
    modal.querySelector('.modal-body').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Error loading schedule</h3>
        <p>Please try again</p>
      </div>
    `;
  }
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('classroomsContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('classroomsContainer').style.display = 'grid';
}

function attachEventListeners() {
  document.getElementById('dateFilter').addEventListener('change', (e) => {
    filters.date = e.target.value;
    loadClassrooms();
  });
  
  document.getElementById('buildingFilter').addEventListener('change', (e) => {
    filters.building = e.target.value;
    loadClassrooms();
  });
  
  document.getElementById('floorFilter').addEventListener('change', (e) => {
    filters.floor = e.target.value;
    loadClassrooms();
  });
}
