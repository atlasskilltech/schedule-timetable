let filters = {
  date: new Date().toISOString().split('T')[0]
};

let unscheduledData = null;

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker();
  loadUnscheduled();
  setupTabs();
});

// ─── Multi-select dropdown toggle ───────────────────────────
function toggleMultiSelect(displayEl) {
  const container = displayEl.parentElement;
  const wasOpen = container.classList.contains('open');
  document.querySelectorAll('.multi-select.open').forEach(ms => ms.classList.remove('open'));
  if (!wasOpen) container.classList.add('open');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.multi-select')) {
    document.querySelectorAll('.multi-select.open').forEach(ms => ms.classList.remove('open'));
  }
});

// ─── Date Picker ────────────────────────────────────────────
function initDatePicker() {
  const container = document.getElementById('filterDate');
  const today = new Date();
  const currentYear = today.getFullYear();
  const format = d => d.toISOString().split('T')[0];
  const todayStr = format(today);
  filters.date = todayStr;

  let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      DATE
    </label>
    <div class="relative min-w-[120px] multi-select group">
      <div class="flex items-center justify-between
        py-[6px] px-[10px]
        bg-[#ffffff]
        border border-[#e2e8f0]
        rounded-[8px]
        cursor-pointer
        text-[0.85rem]
        min-h-[32px]
        gap-[4px]
        transition-all duration-[150ms] ease-in-out text-[#64748b] hover:border-[#10b981] group-[.open]:border-[#10b981] group-[.open]:ring-2 group-[.open]:ring-[rgba(16,185,129,0.1)]"
        onclick="toggleMultiSelect(this)">
        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis" id="dateHeaderText">
          ${todayStr}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="w-[14px] h-[14px] shrink-0 transition-transform duration-[150ms]
          ease-in-out text-[#94a3b8] group-[.open]:rotate-180">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="absolute
        top-[calc(100%+4px)]
        left-0
        min-w-[160px]
        bg-[#ffffff]
        border border-[#e2e8f0]
        rounded-[8px]
        shadow-[0_10px_15px_-3px_rgb(0_0_0_/_0.1),_0_4px_6px_-4px_rgb(0_0_0_/_0.1)]
        z-[1]
        max-h-[250px]
        overflow-y-auto
        hidden group-[.open]:block">
  `;

  for (let month = 0; month < 12; month++) {
    const monthName = new Date(currentYear, month, 1).toLocaleString('en-US', { month: 'long' });
    html += `
      <div class="px-[12px] py-[6px] text-[0.65rem] font-[700] text-[#64748b] bg-[#f8fafc] uppercase tracking-[0.05em] sticky top-0">
        ${monthName} ${currentYear}
      </div>
    `;
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, month, day);
      const value = format(d);
      const isToday = value === todayStr;
      html += `
        <div class="dropdown-option py-[6px] px-[12px]
                    cursor-pointer
                    text-[0.7rem] font-[600] ${isToday ? 'text-[#1e293b] selected' : 'text-[#94a3b8]'} uppercase tracking-[0.05em]
                    hover:bg-[#f1f5f9]
                    transition-colors duration-[150ms] ease-in-out"
             data-value="${value}">
          ${value}
        </div>
      `;
    }
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.addEventListener('click', (e) => {
    const option = e.target.closest('.dropdown-option');
    if (!option) return;
    const value = option.dataset.value;

    container.querySelectorAll('.dropdown-option').forEach(o => {
      o.classList.remove('selected', 'text-[#1e293b]');
      o.classList.add('text-[#94a3b8]');
    });
    option.classList.add('selected');
    option.classList.remove('text-[#94a3b8]');
    option.classList.add('text-[#1e293b]');

    filters.date = value;
    document.getElementById('dateHeaderText').textContent = value;
    container.querySelector('.multi-select')?.classList.remove('open');
    loadUnscheduled();
  });

  const trigger = container.querySelector('[onclick]');
  if (trigger) {
    trigger.setAttribute('onclick', '');
    trigger.addEventListener('click', function handler() {
      toggleMultiSelect(this);
      const selected = container.querySelector('.dropdown-option.selected');
      if (selected) selected.scrollIntoView({ block: 'center' });
    });
  }
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
