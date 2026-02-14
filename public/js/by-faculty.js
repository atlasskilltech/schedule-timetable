let filters = {
  date: new Date().toISOString().split('T')[0],
  facultyId: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker();
  loadFilterOptions();
  loadFaculties();
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

// ─── Dropdown builder helper ────────────────────────────────
function buildSelectDropdownHTML(label, placeholder, items, idPrefix) {
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
        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis" id="${idPrefix}HeaderText">
          ${placeholder}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="w-[14px] h-[14px] shrink-0 transition-transform duration-[150ms]
          ease-in-out text-[#94a3b8] group-[.open]:rotate-180">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="absolute
        top-[calc(100%+4px)]
        left-0 right-0
        bg-[#ffffff]
        border border-[#e2e8f0]
        rounded-[8px]
        shadow-[0_10px_15px_-3px_rgb(0_0_0_/_0.1),_0_4px_6px_-4px_rgb(0_0_0_/_0.1)]
        z-[1]
        max-h-[250px]
        overflow-y-auto
        hidden group-[.open]:block">
  `;

  html += `
    <div class="dropdown-option selected py-[8px] px-[12px]
                cursor-pointer
                text-[0.7rem] font-[600] text-[#1e293b] uppercase tracking-[0.05em]
                hover:bg-[#f1f5f9]
                transition-colors duration-[150ms] ease-in-out"
         data-value="all">
      ${placeholder}
    </div>
  `;

  items.forEach(item => {
    html += `
      <div class="dropdown-option py-[8px] px-[12px]
                  cursor-pointer
                  text-[0.7rem] font-[600] text-[#94a3b8] uppercase tracking-[0.05em]
                  hover:bg-[#f1f5f9]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${item.value}">
        ${item.label}
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

function attachDropdownClick(container, filterKey, placeholder) {
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
    document.getElementById(`${filterKey}HeaderText`).textContent =
      value === 'all' ? placeholder : option.textContent.trim();

    container.querySelector('.multi-select')?.classList.remove('open');
    loadFaculties();
  });
}

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
    loadFaculties();
  });
}

// ─── Load filter options ────────────────────────────────────
async function loadFilterOptions() {
  try {
    const response = await fetch('/api/dashboard/filters');
    const data = await response.json();

    if (data.success) {
      const el = document.getElementById('filterFaculty');
      const items = data.data.faculties.map(f => ({
        value: f.faculty_id,
        label: `${f.faculty_first_name} ${f.faculty_last_name}`
      }));
      el.innerHTML = buildSelectDropdownHTML('FACULTY', 'All Faculty', items, 'facultyId');
      attachDropdownClick(el, 'facultyId', 'All Faculty');
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

// ─── Load faculties ─────────────────────────────────────────
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

// ─── Clear filters ──────────────────────────────────────────
function clearFilters() {
  filters.facultyId = 'all';

  const todayStr = new Date().toISOString().split('T')[0];
  filters.date = todayStr;
  const dateInput = document.getElementById('dateInput');
  if (dateInput) dateInput.value = todayStr;

  const headerText = document.getElementById('facultyIdHeaderText');
  if (headerText) headerText.textContent = 'All Faculty';
  const facultyContainer = document.getElementById('filterFaculty');
  if (facultyContainer) {
    facultyContainer.querySelectorAll('.dropdown-option').forEach(o => {
      o.classList.remove('selected', 'text-[#1e293b]');
      o.classList.add('text-[#94a3b8]');
    });
    const allOption = facultyContainer.querySelector('.dropdown-option[data-value="all"]');
    if (allOption) {
      allOption.classList.add('selected', 'text-[#1e293b]');
      allOption.classList.remove('text-[#94a3b8]');
    }
  }

  loadFaculties();
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('facultiesContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('facultiesContainer').style.display = 'grid';
}

document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
