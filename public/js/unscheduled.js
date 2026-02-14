let filters = {
  date: new Date().toISOString().split('T')[0]
};

let unscheduledData = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  loadUnscheduled();
  attachEventListeners();
  setupTabs();
});

function initializeFilters() {
  document.getElementById('dateFilter').value = filters.date;
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabName = button.getAttribute('data-tab');
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });
}

async function loadUnscheduled() {
  showLoading();
  
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/resources/api/unscheduled?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      unscheduledData = data.data;
      updateCounts(data.data);
      renderUnscheduled(data.data);
    }
  } catch (error) {
    console.error('Error loading unscheduled items:', error);
  } finally {
    hideLoading();
  }
}

function updateCounts(data) {
  document.getElementById('totalUnscheduled').textContent = data.total || 0;
  document.getElementById('classesCount').textContent = data.classes?.length || 0;
  document.getElementById('facultiesCount').textContent = data.faculties?.length || 0;
  document.getElementById('roomsCount').textContent = data.rooms?.length || 0;
}

function renderUnscheduled(data) {
  const emptyState = document.getElementById('emptyState');
  
  if (data.total === 0) {
    emptyState.style.display = 'block';
    document.getElementById('classesContainer').innerHTML = '';
    document.getElementById('facultiesContainer').innerHTML = '';
    document.getElementById('roomsContainer').innerHTML = '';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Render classes
  renderClasses(data.classes);
  
  // Render faculties
  renderFaculties(data.faculties);
  
  // Render rooms
  renderRooms(data.rooms);
}

function renderClasses(classes) {
  const container = document.getElementById('classesContainer');

  if (classes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>All classes are scheduled</h3>
        <p>No unscheduled classes for this date</p>
      </div>
    `;
    return;
  }

  const colors = ['#16A085','#3b82f6','#8b5cf6','#f59e0b','#ec4899','#06b6d4'];
  const html = `
    <div class="class-cards-grid">
      ${classes.map((cls, i) => `
        <div class="class-card">
          <div class="card-subject">
            <span class="subject-badge" style="background:${colors[i % colors.length]}">CLS</span>
            <div class="subject-name">${cls.class_name}</div>
          </div>
          <div class="card-info">
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/><path d="M3 21h18"/></svg>
              <span>${cls.school_name}</span>
            </div>
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Year ${cls.class_year || 'N/A'}</span>
            </div>
            <div class="card-info-row" style="color:var(--warning-color, #f59e0b)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>${cls.reason}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function renderFaculties(faculties) {
  const container = document.getElementById('facultiesContainer');

  if (faculties.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>All faculty are assigned</h3>
        <p>No unassigned faculty for this date</p>
      </div>
    `;
    return;
  }

  const colors = ['#16A085','#3b82f6','#8b5cf6','#f59e0b','#ec4899','#06b6d4'];
  const html = `
    <div class="class-cards-grid">
      ${faculties.map((faculty, i) => `
        <div class="class-card">
          <div class="card-subject">
            <span class="subject-badge" style="background:${colors[i % colors.length]}">FAC</span>
            <div class="subject-name">${faculty.faculty_first_name} ${faculty.faculty_last_name}</div>
          </div>
          <div class="card-info">
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Faculty</span>
            </div>
            <div class="card-info-row" style="color:var(--warning-color, #f59e0b)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>${faculty.reason}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function renderRooms(rooms) {
  const container = document.getElementById('roomsContainer');

  if (rooms.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>All rooms are utilized</h3>
        <p>No unscheduled rooms for this date</p>
      </div>
    `;
    return;
  }

  const colors = ['#16A085','#3b82f6','#8b5cf6','#f59e0b','#ec4899','#06b6d4'];
  const html = `
    <div class="class-cards-grid">
      ${rooms.map((room, i) => `
        <div class="class-card">
          <div class="card-subject">
            <span class="subject-badge" style="background:${colors[i % colors.length]}">RM</span>
            <div class="subject-name">${room.room_name}</div>
          </div>
          <div class="card-info">
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <span>${room.floor_building}</span>
            </div>
            <div class="card-info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>${room.floor_name}</span>
            </div>
            <div class="card-info-row" style="color:var(--warning-color, #f59e0b)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>${room.reason}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'block');
  // Show only active tab
  document.querySelectorAll('.tab-content').forEach(tab => {
    if (!tab.classList.contains('active')) {
      tab.style.display = 'none';
    }
  });
}

function attachEventListeners() {
  document.getElementById('dateFilter').addEventListener('change', (e) => {
    filters.date = e.target.value;
    loadUnscheduled();
  });
}
