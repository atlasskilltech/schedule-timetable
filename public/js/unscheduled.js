let filters = {
  date: new Date().toISOString().split('T')[0]
};

let unscheduledData = null;

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker();
  loadUnscheduled();
  setupTabs();
});

// ─── Dropdown toggle and search are in /js/common.js ───

// ─── Date Picker ────────────────────────────────────────────
function initDatePicker() {
  const container = document.getElementById('filterDate');
  const todayStr = new Date().toISOString().split('T')[0];
  filters.date = todayStr;

  container.innerHTML = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      DATE
    </label>
    <input type="date" id="dateInput" value="${todayStr}"
      class="py-[6px] px-[10px]
        bg-[#ffffff]
        border border-[#e2e8f0]
        rounded-[8px]
        text-[0.85rem]
        min-h-[32px]
        transition-all duration-[150ms] ease-in-out
        text-[#64748b]
        hover:border-[#10b981]
        focus:border-[#10b981] focus:ring-2 focus:ring-[rgba(16,185,129,0.1)] focus:outline-none
        w-full cursor-pointer" />
  `;

  document.getElementById('dateInput').addEventListener('change', (e) => {
    filters.date = e.target.value;
    loadUnscheduled();
  });
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

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

  renderClasses(data.classes);
  renderFaculties(data.faculties);
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
  document.querySelectorAll('.tab-content').forEach(tab => {
    if (!tab.classList.contains('active')) {
      tab.style.display = 'none';
    }
  });
}
