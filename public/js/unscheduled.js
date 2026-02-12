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
  
  const html = `
    <div class="unscheduled-items">
      ${classes.map(cls => `
        <div class="unscheduled-item">
          <div class="unscheduled-icon">📚</div>
          <div class="unscheduled-details">
            <div class="unscheduled-name">${cls.class_name}</div>
            <div class="unscheduled-meta">
              🎓 ${cls.school_name} • Year ${cls.class_year || 'N/A'}
            </div>
            <div class="unscheduled-reason">${cls.reason}</div>
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
  
  const html = `
    <div class="unscheduled-items">
      ${faculties.map(faculty => `
        <div class="unscheduled-item">
          <div class="unscheduled-icon">👨‍🏫</div>
          <div class="unscheduled-details">
            <div class="unscheduled-name">
              ${faculty.faculty_first_name} ${faculty.faculty_last_name}
            </div>
            <div class="unscheduled-reason">${faculty.reason}</div>
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
  
  const html = `
    <div class="unscheduled-items">
      ${rooms.map(room => `
        <div class="unscheduled-item">
          <div class="unscheduled-icon">🏢</div>
          <div class="unscheduled-details">
            <div class="unscheduled-name">${room.room_name}</div>
            <div class="unscheduled-meta">
              ${room.floor_building} • ${room.floor_name}
            </div>
            <div class="unscheduled-reason">${room.reason}</div>
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
