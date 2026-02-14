let filters = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
};

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker('filterStartDate', 'startDate', 'START DATE', 'startDateHeaderText');
  initDatePicker('filterEndDate', 'endDate', 'END DATE', 'endDateHeaderText');
  loadDays();
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
function initDatePicker(containerId, filterKey, label, headerTextId) {
  const container = document.getElementById(containerId);
  const today = new Date();
  const currentYear = today.getFullYear();
  const format = d => d.toISOString().split('T')[0];
  const selectedStr = filters[filterKey];

  let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      ${label}
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
        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis" id="${headerTextId}">
          ${selectedStr}
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
      const isSelected = value === selectedStr;
      html += `
        <div class="dropdown-option py-[6px] px-[12px]
                    cursor-pointer
                    text-[0.7rem] font-[600] ${isSelected ? 'text-[#1e293b] selected' : 'text-[#94a3b8]'} uppercase tracking-[0.05em]
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

    filters[filterKey] = value;
    document.getElementById(headerTextId).textContent = value;
    container.querySelector('.multi-select')?.classList.remove('open');
    loadDays();
  });

  // Scroll to selected date on first open
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

// ─── Load days ──────────────────────────────────────────────
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

// ─── Clear filters ──────────────────────────────────────────
function clearFilters() {
  const todayStr = new Date().toISOString().split('T')[0];
  const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  filters.startDate = todayStr;
  filters.endDate = weekLater;

  document.getElementById('startDateHeaderText').textContent = todayStr;
  const startContainer = document.getElementById('filterStartDate');
  startContainer.querySelectorAll('.dropdown-option').forEach(o => {
    o.classList.remove('selected', 'text-[#1e293b]');
    o.classList.add('text-[#94a3b8]');
  });
  const startOption = startContainer.querySelector(`.dropdown-option[data-value="${todayStr}"]`);
  if (startOption) {
    startOption.classList.add('selected', 'text-[#1e293b]');
    startOption.classList.remove('text-[#94a3b8]');
  }

  document.getElementById('endDateHeaderText').textContent = weekLater;
  const endContainer = document.getElementById('filterEndDate');
  endContainer.querySelectorAll('.dropdown-option').forEach(o => {
    o.classList.remove('selected', 'text-[#1e293b]');
    o.classList.add('text-[#94a3b8]');
  });
  const endOption = endContainer.querySelector(`.dropdown-option[data-value="${weekLater}"]`);
  if (endOption) {
    endOption.classList.add('selected', 'text-[#1e293b]');
    endOption.classList.remove('text-[#94a3b8]');
  }

  loadDays();
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('daysContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('daysContainer').style.display = 'grid';
}

document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
