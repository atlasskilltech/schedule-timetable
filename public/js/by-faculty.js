let filters = {
  date: new Date().toISOString().split('T')[0],
  facultyId: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  loadFilterOptions();
  loadFaculties();
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
      const select = document.getElementById('facultyFilter');
      data.data.faculties.forEach(faculty => {
        const option = document.createElement('option');
        option.value = faculty.faculty_id;
        option.textContent = `${faculty.faculty_first_name} ${faculty.faculty_last_name}`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

async function loadFaculties() {
  showLoading();
  
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`/timetable/api/by-faculty?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      renderFaculties(data.data);
    }
  } catch (error) {
    console.error('Error loading faculties:', error);
  } finally {
    hideLoading();
  }
}

function renderFaculties(faculties) {
  const container = document.getElementById('facultiesContainer');
  const emptyState = document.getElementById('emptyState');
  
  if (faculties.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  const html = `
    <div class="class-cards-grid">
      ${faculties.map(faculty => `
        <div class="class-card" onclick="viewFacultyDetails(${faculty.faculty_id})" style="cursor: pointer;">
          <div class="card-subject">
            <span class="subject-badge">👨‍🏫</span>
            <div class="subject-name">${faculty.faculty_first_name} ${faculty.faculty_last_name}</div>
          </div>
          
          <div class="card-info">
            ${faculty.schools ? `
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"></path>
              </svg>
              <span>${faculty.schools}</span>
            </div>
            ` : ''}
            
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${faculty.total_classes} classes today</span>
            </div>
            
            ${faculty.first_class ? `
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${faculty.first_class} - ${faculty.last_class}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  container.innerHTML = html;
}

async function viewFacultyDetails(facultyId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Faculty Schedule</h2>
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
    const response = await fetch(`/timetable/api/faculty-details?facultyId=${facultyId}&date=${filters.date}`);
    const data = await response.json();
    
    if (data.success) {
      const modalBody = modal.querySelector('.modal-body');
      
      if (data.data.length === 0) {
        modalBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>No classes scheduled</h3>
            <p>This faculty has no classes on this date</p>
          </div>
        `;
      } else {
        modalBody.innerHTML = `
          <div class="schedule-list">
            ${data.data.map(cls => `
              <div class="schedule-item">
                <div class="schedule-time-badge">${cls.start_time} - ${cls.end_time}</div>
                <div class="schedule-details">
                  <div class="schedule-subject">${cls.subject_name || 'N/A'}</div>
                  <div class="schedule-meta">
                    👥 ${cls.class_name || 'N/A'} • 
                    🏢 ${cls.room_name || 'N/A'} ${cls.floor_building ? '(' + cls.floor_building + ')' : ''}
                    ${cls.school_name ? '• 🎓 ' + cls.school_name : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading faculty details:', error);
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
  document.getElementById('facultiesContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('facultiesContainer').style.display = 'grid';
}

function attachEventListeners() {
  document.getElementById('dateFilter').addEventListener('change', (e) => {
    filters.date = e.target.value;
    loadFaculties();
  });
  
  document.getElementById('facultyFilter').addEventListener('change', (e) => {
    filters.facultyId = e.target.value;
    loadFaculties();
  });
}
