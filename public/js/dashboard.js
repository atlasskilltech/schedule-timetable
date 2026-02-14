// Global state
let filters = {
  date: new Date().toISOString().split("T")[0],
  program: "all",
  year: "all",
  section: "all",
  faculty: "all",
  room: "all",
  subject: "all",
  day: "all",
  time: "all",
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadFilterOptions();
  loadData();
  attachEventListeners();
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
    loadData();
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
    loadData();
  });
}

// ─── Load filter options from API ───────────────────────────
async function loadFilterOptions() {
  try {
    const response = await fetch("/api/dashboard/filters");
    const data = await response.json();

    if (data.success) {
      initDatePicker();
      populatePrograms(data.data.programs);
      populateYears(data.data.years);
      populateSections(data.data.sections);
      populateFaculties(data.data.faculties);
      populateRooms(data.data.rooms);
      populateSubjects(data.data.subjects);
      populateDays(data.data.days);
      populateTimes(data.data.times);
    }
  } catch (error) {
    console.error("Error loading filter options:", error);
  }
}

function populatePrograms(programs) {
  const el = document.getElementById("filterProgram");
  const items = programs.map(p => ({ value: p.school_code, label: p.school_name }));
  el.innerHTML = buildSelectDropdownHTML('PROGRAM', 'All Programs', items, 'program');
  attachDropdownClick(el, 'program', 'All Programs');
}

function populateYears(years) {
  const el = document.getElementById("filterYear");
  const items = years.map(y => ({ value: y, label: y }));
  el.innerHTML = buildSelectDropdownHTML('YEAR', 'All Years', items, 'year');
  attachDropdownClick(el, 'year', 'All Years');
}

function populateSections(sections) {
  const el = document.getElementById("filterSection");
  const items = sections.map(s => ({ value: s.class_id, label: s.class_name }));
  el.innerHTML = buildSelectDropdownHTML('SECTION', 'All Sections', items, 'section');
  attachDropdownClick(el, 'section', 'All Sections');
}

function populateFaculties(faculties) {
  const el = document.getElementById("filterFaculty");
  const items = faculties.map(f => ({ value: f.faculty_id, label: `${f.faculty_first_name} ${f.faculty_last_name}` }));
  el.innerHTML = buildSelectDropdownHTML('FACULTY', 'All Faculty', items, 'faculty');
  attachDropdownClick(el, 'faculty', 'All Faculty');
}

function populateRooms(rooms) {
  const el = document.getElementById("filterRoom");
  const items = rooms.map(r => ({ value: r.room_id, label: `${r.room_name} (${r.floor_name} ${r.floor_building})` }));
  el.innerHTML = buildSelectDropdownHTML('ROOM', 'All Rooms', items, 'room');
  attachDropdownClick(el, 'room', 'All Rooms');
}

function populateSubjects(subjects) {
  const el = document.getElementById("filterSubject");
  const items = subjects.map(s => ({ value: s.subject_id, label: `${s.subject_code} ${s.subject_name}` }));
  el.innerHTML = buildSelectDropdownHTML('SUBJECT', 'All Subjects', items, 'subject');
  attachDropdownClick(el, 'subject', 'All Subjects');
}

function populateDays(days) {
  const el = document.getElementById("filterDay");
  const items = days.map(d => ({ value: d, label: d }));
  el.innerHTML = buildSelectDropdownHTML('DAY', 'All Days', items, 'day');
  attachDropdownClick(el, 'day', 'All Days');
}

function populateTimes(times) {
  const el = document.getElementById("filterTime");
  const items = times.map(t => ({ value: t.value, label: t.label }));
  el.innerHTML = buildSelectDropdownHTML('TIME', 'All Times', items, 'time');
  attachDropdownClick(el, 'time', 'All Times');
}

// Load timetable data
async function loadData() {
  showLoading();

  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== "all") {
        queryParams.append(key, filters[key]);
      }
    });

    const [timetableRes, statsRes] = await Promise.all([
      fetch(`/api/dashboard/timetable?${queryParams}`),
      fetch(`/api/dashboard/stats?${queryParams}`),
    ]);

    const timetableData = await timetableRes.json();
    const statsData = await statsRes.json();

    if (timetableData.success) {
      updateStatistics(statsData.data, timetableData.total);
      renderTimetable(timetableData.data);
    }
  } catch (error) {
    console.error("Error loading data:", error);
    showError("Failed to load timetable data");
  } finally {
    hideLoading();
  }
}

function updateStatistics(stats, total) {
  document.getElementById("totalScheduled").textContent =
    stats?.total_scheduled || total || 0;
  document.getElementById("totalUnscheduled").textContent =
    stats?.total_unscheduled || 0;
  document.getElementById("totalEvents").textContent = total || 0;
  document.getElementById("generatedDate").textContent =
    new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
}

// Render timetable cards
function renderTimetable(data) {
  const container = document.getElementById("timetableContainer");
  const emptyState = document.getElementById("emptyState");

  const hasData =
    Object.keys(data).length > 0 &&
    Object.values(data).some((day) => day.length > 0);

  if (!hasData) {
    container.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  let html = "";

  Object.keys(data).forEach((dayName) => {
    const classes = data[dayName];
    if (classes.length === 0) return;

    html += `
        <div class="px-[24px] py-[16px] bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-[8px]">
        <svg viewBox="0 0 24 24" fill="none" class="text-[#94a3b8]" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
          <h3 class="text-[1rem] font-[600] text-[#1e293b] m-0">${dayName}</h3>
          <span class="text-[0.85rem] text-[#64748b] font-[400]">(${classes.length} classes)</span>
        </div>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[16px] p-[24px] bg-white">
          ${classes.map((cls) => renderClassCard(cls)).join("")}
        </div>
    `;
  });

  container.innerHTML = html;
}

// Render individual class card
function renderClassCard(cls) {
  const schoolId = cls.school_id || "default";
  const schoolCode = cls.school_code || "";
  const facultyName =
    `${cls.faculty_first_name || ""} ${cls.faculty_last_name || ""}`.trim() ||
    "N/A";
  const roomInfo = cls.room_name ? `${cls.room_name}` : "N/A";
  const buildingInfo = cls.floor_building
    ? `${cls.floor_building} - ${cls.floor_name}`
    : "";
  const years = cls.class_year || "";

  return `
    <div class="relative cursor-pointer bg-white border border-[#e2e8f0] rounded-[8px] p-[16px] transition-all duration-[150ms] ease-in-out hover:border-[#10b981] hover:shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1),_0_2px_4px_-2px_rgb(0_0_0_/_0.1)] hover:-translate-y-[1px]" data-school="${schoolId}">
      <div class="flex justify-between items-center mb-[8px] pb-[8px] border-b border-[#f1f5f9]">
        <span class="flex items-center gap-[6px] text-[0.85rem] font-[500] text-[#64748b]">
        <svg class="w-[14px] h-[14px] text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${cls.start_time} - ${cls.end_time}
        </span>
        <span class="text-[0.8rem] font-[600] bg-[#f1f5f9] px-[10px] py-[4px] rounded-[4px] text-[#1e293b] border border-[#e2e8f0]">101-B</span>
      </div>

      <div class="mb-[8px]">
      <div class="inline-flex items-center gap-[4px] text-[0.75rem] font-[700] text-[#10b981] bg-[rgba(16,185,129,0.1)] px-[8px] py-[3px] rounded-[4px] mb-[6px] uppercase tracking-[0.02em]" data-school="${schoolId}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[14px] h-[14px]">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <path d="M7 7h10M7 12h10M7 17h6"></path>
                    </svg>  ${schoolCode === "" ? "No Data" : schoolCode}
                    </div>

        <div class="text-[0.85rem] font-[500] text-[#64748b] leading-[1.4] line-clamp-2">${cls.subject_name || "N/A"}</div>
      </div>

      <div class="flex flex-col gap-[6px] text-[0.8rem] text-[#64748b] mt-[8px] pt-[8px] border-t border-[#f1f5f9]">
        <div class="flex items-center gap-[6px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[14px] h-[14px] shrink-0 text-[#94a3b8]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          ${facultyName}
        </div>
        <div class="flex items-center gap-[6px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[14px] h-[14px] shrink-0 text-[#94a3b8]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
         ${years || 0} Years
        </div>
        ${
          cls.class_name
            ? `
        <div class="flex items-center gap-[6px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[14px] h-[14px] shrink-0 text-[#94a3b8]">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
         ${cls.class_name}
        </div>
        `
            : ""
        }


        <div class="flex items-center gap-[6px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[14px] h-[14px] shrink-0 text-[#94a3b8]">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          <span>${roomInfo}${buildingInfo ? " • " + buildingInfo : ""}</span>
        </div>
      </div>
    </div>
  `;
}

// Show loading state
function showLoading() {
  document.getElementById("loadingState").style.display = "block";
  document.getElementById("timetableContainer").style.display = "none";
  document.getElementById("emptyState").style.display = "none";
}

// Hide loading state
function hideLoading() {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("timetableContainer").style.display = "grid";
}

// Show error message
function showError(message) {
  alert(message);
}

// ─── Clear filters ──────────────────────────────────────────
function clearFilters() {
  const todayStr = new Date().toISOString().split("T")[0];
  filters = {
    date: todayStr,
    program: "all",
    year: "all",
    section: "all",
    faculty: "all",
    room: "all",
    subject: "all",
    day: "all",
    time: "all",
  };

  // Reset date
  const dateInput = document.getElementById('dateInput');
  if (dateInput) dateInput.value = todayStr;

  // Reset all other dropdowns
  const labels = {
    program: 'All Programs',
    year: 'All Years',
    section: 'All Sections',
    faculty: 'All Faculty',
    room: 'All Rooms',
    subject: 'All Subjects',
    day: 'All Days',
    time: 'All Times'
  };

  Object.keys(labels).forEach(key => {
    const headerText = document.getElementById(`${key}HeaderText`);
    if (headerText) headerText.textContent = labels[key];

    const containerEl = document.getElementById(`filter${key.charAt(0).toUpperCase() + key.slice(1)}`);
    if (containerEl) {
      containerEl.querySelectorAll('.dropdown-option').forEach(o => {
        o.classList.remove('selected', 'text-[#1e293b]');
        o.classList.add('text-[#94a3b8]');
      });
      const allOption = containerEl.querySelector('.dropdown-option[data-value="all"]');
      if (allOption) {
        allOption.classList.add('selected', 'text-[#1e293b]');
        allOption.classList.remove('text-[#94a3b8]');
      }
    }
  });

  loadData();
}

// Attach event listeners
function attachEventListeners() {
  document.getElementById("clearFilters").addEventListener("click", clearFilters);
}
