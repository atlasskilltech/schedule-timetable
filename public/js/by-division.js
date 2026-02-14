let filters = {
  date: new Date().toISOString().split('T')[0],
  program: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker();
  loadFilterOptions();
  loadDivisions();
});

// ─── Dropdown toggle, builder, and search are in /js/common.js ───

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
    loadDivisions();
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
    loadDivisions();
  });
}

// ─── Load filter options ────────────────────────────────────
async function loadFilterOptions() {
  try {
    const response = await fetch('/api/dashboard/filters');
    const data = await response.json();

    if (data.success) {
      const el = document.getElementById('filterProgram');
      const items = data.data.programs.map(prog => ({
        value: prog.school_id,
        label: `${prog.school_code} - ${prog.school_name}`
      }));
      el.innerHTML = buildSelectDropdownHTML('PROGRAM', 'All Programs', items, 'program');
      attachDropdownClick(el, 'program', 'All Programs');
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

// ─── Load divisions ─────────────────────────────────────────
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

// ─── Clear filters ──────────────────────────────────────────
function clearFilters() {
  filters.program = 'all';

  const todayStr = new Date().toISOString().split('T')[0];
  filters.date = todayStr;
  const dateInput = document.getElementById('dateInput');
  if (dateInput) dateInput.value = todayStr;

  const headerText = document.getElementById('programHeaderText');
  if (headerText) headerText.textContent = 'All Programs';
  const programContainer = document.getElementById('filterProgram');
  if (programContainer) {
    programContainer.querySelectorAll('.dropdown-option').forEach(o => {
      o.classList.remove('selected', 'text-[#1e293b]');
      o.classList.add('text-[#94a3b8]');
    });
    const allOption = programContainer.querySelector('.dropdown-option[data-value="all"]');
    if (allOption) {
      allOption.classList.add('selected', 'text-[#1e293b]');
      allOption.classList.remove('text-[#94a3b8]');
    }
  }

  loadDivisions();
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('divisionsContainer').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('divisionsContainer').style.display = 'grid';
}

document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
