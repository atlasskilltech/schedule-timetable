let filters = {
  date: new Date().toISOString().split('T')[0],
  program: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  loadFilterOptions();
  loadDivisions();
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
      const select = document.getElementById('programFilter');
      data.data.programs.forEach(prog => {
        const option = document.createElement('option');
        option.value = prog.school_id;
        option.textContent = `${prog.school_code} - ${prog.school_name}`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

async function loadDivisions() {
  showLoading();
  
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`/timetable/api/by-division?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      renderDivisions(data.data);
    }
  } catch (error) {
    console.error('Error loading divisions:', error);
  } finally {
    hideLoading();
  }
}

function renderDivisions(divisions) {
  const container = document.getElementById('divisionsContainer');
  const emptyState = document.getElementById('emptyState');
  
  if (divisions.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  const html = `
    <div class="class-cards-grid">
      ${divisions.map(div => `
        <div class="class-card" onclick="viewDivisionDetails(${div.class_id})" style="cursor: pointer;">
          <div class="card-subject">
            <span class="subject-badge">${div.school_code}</span>
            <div class="subject-name">${div.class_name}</div>
          </div>
          
          <div class="card-info">
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"></path>
              </svg>
              <span>${div.school_name}</span>
            </div>
            
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${div.total_classes} classes today</span>
            </div>
            
            ${div.first_class ? `
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${div.first_class} - ${div.last_class}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  container.innerHTML = html;
}

async function viewDivisionDetails(classId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Division Schedule</h2>
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
    const response = await fetch(`/timetable/api/division-details?classId=${classId}&date=${filters.date}`);
    const data = await response.json();
    
    if (data.success) {
      const modalBody = modal.querySelector('.modal-body');
      modalBody.innerHTML = `
        <div class="schedule-list">
          ${data.data.map(cls => `
            <div class="schedule-item">
              <div class="schedule-time-badge">${cls.start_time} - ${cls.end_time}</div>
              <div class="schedule-details">
                <div class="schedule-subject">${cls.subject_name}</div>
                <div class="schedule-meta">
                  👨‍🏫 ${cls.faculty_first_name} ${cls.faculty_last_name} • 
                  🏢 ${cls.room_name} (${cls.floor_building})
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading division details:', error);
  }
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('divisionsContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('divisionsContainer').style.display = 'grid';
}

function attachEventListeners() {
  document.getElementById('dateFilter').addEventListener('change', (e) => {
    filters.date = e.target.value;
    loadDivisions();
  });
  
  document.getElementById('programFilter').addEventListener('change', (e) => {
    filters.program = e.target.value;
    loadDivisions();
  });
}
