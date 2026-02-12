let filters = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
};

document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  loadDays();
  attachEventListeners();
});

function initializeFilters() {
  document.getElementById('startDateFilter').value = filters.startDate;
  document.getElementById('endDateFilter').value = filters.endDate;
}

async function loadDays() {
  showLoading();
  
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/timetable/api/by-day?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      renderDays(data.data);
    }
  } catch (error) {
    console.error('Error loading days:', error);
  } finally {
    hideLoading();
  }
}

function renderDays(days) {
  const container = document.getElementById('daysContainer');
  const emptyState = document.getElementById('emptyState');
  
  if (days.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  const html = `
    <div class="class-cards-grid">
      ${days.map(day => {
        const date = new Date(day.timetable_date);
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        return `
          <div class="class-card" onclick="viewDayDetails('${day.timetable_date}')" style="cursor: pointer;">
            <div class="card-subject">
              <span class="subject-badge">📅</span>
              <div class="subject-name">${day.day_name || formattedDate}</div>
            </div>
            
            <div class="card-info">
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${day.total_classes} classes</span>
              </div>
              
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span>${day.rooms_used} rooms used</span>
              </div>
              
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>${day.faculties_involved} faculties</span>
              </div>
              
              ${day.first_class ? `
              <div class="card-info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${day.first_class} - ${day.last_class}</span>
              </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  container.innerHTML = html;
}

async function viewDayDetails(date) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 1000px;">
      <div class="modal-header">
        <h2>Schedule for ${formattedDate}</h2>
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
    const response = await fetch(`/timetable/api/day-details?date=${date}`);
    const data = await response.json();
    
    if (data.success) {
      const modalBody = modal.querySelector('.modal-body');
      
      if (data.data.length === 0) {
        modalBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>No classes scheduled</h3>
            <p>No classes found for this date</p>
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
                    👨‍🏫 ${cls.faculty_first_name || ''} ${cls.faculty_last_name || 'N/A'} • 
                    🏢 ${cls.room_name || 'N/A'} ${cls.floor_building ? '(' + cls.floor_building + ')' : ''}
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
    console.error('Error loading day details:', error);
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
  document.getElementById('daysContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('daysContainer').style.display = 'grid';
}

function attachEventListeners() {
  document.getElementById('startDateFilter').addEventListener('change', (e) => {
    filters.startDate = e.target.value;
    loadDays();
  });
  
  document.getElementById('endDateFilter').addEventListener('change', (e) => {
    filters.endDate = e.target.value;
    loadDays();
  });
}
