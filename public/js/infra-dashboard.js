// Global state
let allRooms = [];
let filteredRooms = [];
let filters = {
  date: new Date().toISOString().split('T')[0],
  program: [],
  year: [],
  section: [],
  faculty: [],
  room: [],
  subject: [],
  day: [],
  time: []
};

// Day operating hours for occupancy rate calculation
const DAY_START_HOUR = 7;
const DAY_END_HOUR   = 19;
const DAY_TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFilterOptions();
  loadData();
  attachEventListeners();
});

// ─── Multi-select dropdown toggle ──────────────────────────
function toggleMultiSelect(displayEl) {
  const container = displayEl.parentElement;
  const wasOpen = container.classList.contains('open');

  // Close all other dropdowns
  document.querySelectorAll('.multi-select.open').forEach(ms => {
    ms.classList.remove('open');
  });

  // Toggle this one
  if (!wasOpen) {
    container.classList.add('open');
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.multi-select')) {
    document.querySelectorAll('.multi-select.open').forEach(ms => {
      ms.classList.remove('open');
    });
  }
});

// ─── Filter dropdown builder helper ────────────────────────
function buildDropdownHTML(label, placeholder, items, inputClass, idPrefix) {
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
        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
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

  items.forEach(item => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${item.value}">
        <input
          type="checkbox"
          id="${idPrefix}_${item.value}"
          value="${item.value}"
          class="${inputClass} w-[16px] h-[16px] accent-[#10b981] cursor-pointer">
        <label
          for="${idPrefix}_${item.value}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${item.label}
        </label>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

// ─── Load filter options from API ──────────────────────────
async function loadFilterOptions() {
  try {
    const response = await fetch('/infra/api/extended-filter-options');
    const data = await response.json();

    if (data.success) {
      populateDateFilter();
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
    console.error('Error loading filter options:', error);
  }
}

function populateDateFilter() {
  const dateFilter = document.getElementById('filterDate');
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
        <span id="dateHeaderText">${todayStr}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="w-[14px] h-[14px] shrink-0 text-[#94a3b8]">
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

  for (let month = 0; month < 12; month++) {
    const monthName = new Date(currentYear, month, 1).toLocaleString('en-US', { month: 'long' });
    html += `
      <div class="px-[12px] py-[6px] text-[0.7rem] font-bold text-slate-500 bg-slate-100">
        ${monthName} ${currentYear}
      </div>
    `;
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, month, day);
      const value = format(d);
      html += `
        <div class="flex items-center gap-[8px] py-[6px] px-[12px] cursor-pointer text-[0.85rem]">
          <input type="radio" name="dateRadio" value="${value}"
            class="dateRadio accent-[#10b981]" ${value === todayStr ? 'checked' : ''} />
          <label class="text-[0.7rem] font-[600] text-[#94a3b8] uppercase">${value}</label>
        </div>
      `;
    }
  }

  html += `
      </div>
    </div>
  `;

  dateFilter.innerHTML = html;

  dateFilter.addEventListener('change', (e) => {
    if (!e.target.classList.contains('dateRadio')) return;
    filters.date = e.target.value;
    document.getElementById('dateHeaderText').textContent = e.target.value;
    loadData();
  });
}

function populatePrograms(programs) {
  const el = document.getElementById('filterProgram');
  const items = programs.map(p => ({ value: p.school_code, label: p.school_name }));
  el.innerHTML = buildDropdownHTML('PROGRAM', 'All Programs', items, 'programBox', 'infraProgram');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('programBox')) return;
    filters.program = Array.from(el.querySelectorAll('.programBox:checked')).map(cb => cb.value);
    loadData();
  });
}

function populateYears(years) {
  const el = document.getElementById('filterYear');
  const items = years.map(y => ({ value: y, label: String(y) }));
  el.innerHTML = buildDropdownHTML('YEAR', 'All Years', items, 'yearBox', 'infraYear');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('yearBox')) return;
    filters.year = Array.from(el.querySelectorAll('.yearBox:checked')).map(cb => cb.value);
    loadData();
  });
}

function populateSections(sections) {
  const el = document.getElementById('filterSection');
  const items = sections.map(s => ({ value: s.class_id, label: s.class_name }));
  el.innerHTML = buildDropdownHTML('SECTION', 'All Sections', items, 'sectionBox', 'infraSection');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('sectionBox')) return;
    filters.section = Array.from(el.querySelectorAll('.sectionBox:checked')).map(cb => cb.value);
    loadData();
  });
}

function populateFaculties(faculties) {
  const el = document.getElementById('filterFaculty');
  const items = faculties.map(f => ({
    value: f.faculty_id,
    label: `${f.faculty_first_name} ${f.faculty_last_name}`
  }));
  el.innerHTML = buildDropdownHTML('FACULTY', 'All Faculty', items, 'facultyBox', 'infraFaculty');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('facultyBox')) return;
    filters.faculty = Array.from(el.querySelectorAll('.facultyBox:checked')).map(cb => cb.value);
    loadData();
  });
}

function populateRooms(rooms) {
  const el = document.getElementById('filterRoom');
  const items = rooms.map(r => ({
    value: r.room_id,
    label: `${r.room_name} (${r.floor_name} ${r.floor_building})`
  }));
  el.innerHTML = buildDropdownHTML('ROOM', 'All Rooms', items, 'roomBox', 'infraRoom');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('roomBox')) return;
    filters.room = Array.from(el.querySelectorAll('.roomBox:checked')).map(cb => cb.value);
    loadData();
  });
}

function populateSubjects(subjects) {
  const el = document.getElementById('filterSubject');
  const items = subjects.map(s => ({
    value: s.subject_id,
    label: `${s.subject_code} ${s.subject_name}`
  }));
  el.innerHTML = buildDropdownHTML('SUBJECT', 'All Subjects', items, 'subjectBox', 'infraSubject');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('subjectBox')) return;
    filters.subject = Array.from(el.querySelectorAll('.subjectBox:checked')).map(cb => cb.value);
    loadData();
  });
}

function populateDays(days) {
  const el = document.getElementById('filterDay');
  const items = days.map(d => ({ value: d, label: d }));
  el.innerHTML = buildDropdownHTML('DAY', 'All Days', items, 'dayBox', 'infraDay');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('dayBox')) return;
    filters.day = Array.from(el.querySelectorAll('.dayBox:checked')).map(cb => cb.value);
    loadData();
  });
}

function populateTimes(times) {
  const el = document.getElementById('filterTime');
  const items = times.map(t => ({ value: t.value, label: t.label }));
  el.innerHTML = buildDropdownHTML('TIME', 'All Times', items, 'timeBox', 'infraTime');
  el.addEventListener('change', (e) => {
    if (!e.target.classList.contains('timeBox')) return;
    filters.time = Array.from(el.querySelectorAll('.timeBox:checked')).map(cb => cb.value);
    loadData();
  });
}

// ─── Load room data ────────────────────────────────────────
async function loadData() {
  showLoading();
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('date', filters.date);

    ['program', 'year', 'section', 'faculty', 'room', 'subject', 'day', 'time'].forEach(key => {
      if (Array.isArray(filters[key]) && filters[key].length > 0) {
        queryParams.append(key, filters[key].join(','));
      }
    });

    const roomsRes = await fetch(`/infra/api/rooms?${queryParams}`);
    const roomsData = await roomsRes.json();
    if (roomsData.success) {
      allRooms = roomsData.data;
      filteredRooms = allRooms;
      updateStatistics();
      renderGanttChart();
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    hideLoading();
  }
}

// ─── Statistics ────────────────────────────────────────────
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function calculateOccupiedMinutes(schedules) {
  const dayStartMin = DAY_START_HOUR * 60;
  const dayEndMin   = DAY_END_HOUR * 60;
  return schedules.reduce((total, s) => {
    const start = Math.max(timeToMinutes(s.start), dayStartMin);
    const end   = Math.min(timeToMinutes(s.end), dayEndMin);
    return total + Math.max(0, end - start);
  }, 0);
}

function updateStatistics() {
  const totalRooms     = filteredRooms.length;
  const occupiedRooms  = filteredRooms.filter(r => r.schedules.length > 0).length;
  const availableRooms = totalRooms - occupiedRooms;

  const totalAvailableMinutes = totalRooms * DAY_TOTAL_HOURS * 60;
  const totalOccupiedMinutes  = filteredRooms.reduce((sum, room) =>
    sum + calculateOccupiedMinutes(room.schedules), 0);

  const occupancyRate = totalAvailableMinutes > 0
    ? Math.round((totalOccupiedMinutes / totalAvailableMinutes) * 100) : 0;

  document.getElementById('totalRooms').textContent     = totalRooms;
  document.getElementById('occupiedRooms').textContent  = occupiedRooms;
  document.getElementById('availableRooms').textContent = availableRooms;
  document.getElementById('occupancyRate').textContent  = occupancyRate + '%';
}

// ─── School colour helpers ─────────────────────────────────
function getSchoolColor(schoolId) {
  const colors = {
    7:       '#e12a7b',
    8:       '#009fe0',
    11:      '#ed1a3b',
    13:      '#ed1a3b',
    16:      '#CC5500',
    default: '#342b7c'
  };
  return colors[schoolId] || colors.default;
}

function getSchoolGradient(schoolId) {
  const color = getSchoolColor(schoolId);
  const lighten = (c, pct) => {
    const num = parseInt(c.replace('#', ''), 16);
    const amt = Math.round(2.55 * pct);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0xFF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };
  return `linear-gradient(135deg, ${color} 0%, ${lighten(color, 15)} 100%)`;
}

// ─── Gantt Chart rendering ─────────────────────────────────
function renderGanttChart() {
  const container = document.getElementById('ganttChart');
  const noData    = document.getElementById('noData');

  if (filteredRooms.length === 0) {
    container.innerHTML = '';
    noData.style.display = 'block';
    return;
  }
  noData.style.display = 'none';

  const startHour = DAY_START_HOUR;
  const endHour   = DAY_END_HOUR;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  let html = `
    <div class="gantt-header">
      <div class="gantt-room-header">Room</div>
      <div class="gantt-timeline-header">
        ${hours.map(h => `<div class="gantt-hour">${h}:00</div>`).join('')}
      </div>
    </div>
  `;

  filteredRooms.forEach(room => {
    const capacityText = room.room_capacity ? `Cap: ${room.room_capacity}` : '';
    html += `
      <div class="gantt-row">
        <div class="gantt-room-info">
          <div class="gantt-room-name">${room.room_name}</div>
          <div class="gantt-room-detail">${capacityText}</div>
        </div>
        <div class="gantt-timeline">
          <div class="gantt-grid">
            ${hours.map(() => '<div class="gantt-grid-line"></div>').join('')}
          </div>
          ${renderSchedules(room.schedules, startHour, endHour)}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderSchedules(schedules, startHour, endHour) {
  if (schedules.length === 0) {
    return '<div class="gantt-available">Available All Day</div>';
  }

  return schedules.map(schedule => {
    const left  = calculatePosition(schedule.start, startHour, endHour);
    const width = calculateWidth(schedule.start, schedule.end, startHour, endHour);
    const faculty = `${schedule.faculty_first_name || ''} ${schedule.faculty_last_name || ''}`.trim() || 'N/A';
    const gradient = getSchoolGradient(schedule.school_id);
    const subjectDisplay = schedule.subject_code || schedule.subject_name;

    return `
      <div class="gantt-schedule"
           style="left:${left}%;width:${width}%;background:${gradient};"
           title="${schedule.subject_name}\n${schedule.class} · ${faculty}\n${schedule.start} – ${schedule.end}">
        <div class="schedule-title">${subjectDisplay}</div>
        <div class="schedule-info">${schedule.class}</div>
        <div class="schedule-time">${schedule.start} – ${schedule.end}</div>
      </div>
    `;
  }).join('');
}

function calculatePosition(time, startHour, endHour) {
  const [h, m] = time.split(':').map(Number);
  return ((h - startHour) * 60 + m) / ((endHour - startHour) * 60) * 100;
}

function calculateWidth(startTime, endTime, startHour, endHour) {
  return calculatePosition(endTime, startHour, endHour) - calculatePosition(startTime, startHour, endHour);
}

// ─── CSV Export ────────────────────────────────────────────
function exportToCSV() {
  const rows = [['Room','Category','Building','Floor','Subject','Class','Faculty','Start','End','School']];

  filteredRooms.forEach(room => {
    if (room.schedules.length === 0) {
      rows.push([room.room_name, room.room_category||'Others', room.building, room.floor, 'Available','-','-','-','-','-']);
    } else {
      room.schedules.forEach(s => {
        rows.push([
          room.room_name, room.room_category||'Others', room.building, room.floor,
          csvSafe(s.subject_name), s.class,
          `${s.faculty_first_name} ${s.faculty_last_name}`, s.start, s.end,
          getSchoolLabel(s.school_id)
        ]);
      });
    }
  });

  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `room-occupancy-${filters.date}.csv`;
  a.click();
}

function csvSafe(value) {
  if (value == null) return '';
  const str = String(value).trim().replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
}

const schoolMap = {
  default: 'Elective', 7: 'ATLAS ISDI', 8: 'ATLAS ISME',
  11: 'ATLAS INSOFE / UGDX', 13: 'ATLAS INSOFE / UGDX', 16: 'ATLAS LAW'
};

function getSchoolLabel(id) {
  if (id == null || id === '') return 'Elective';
  return schoolMap[id] || 'Unknown';
}

// ─── Clear filters ─────────────────────────────────────────
function clearAllFilters() {
  filters = {
    date: new Date().toISOString().split('T')[0],
    program: [],
    year: [],
    section: [],
    faculty: [],
    room: [],
    subject: [],
    day: [],
    time: []
  };

  // Uncheck all checkboxes
  document.querySelectorAll('.programBox, .yearBox, .sectionBox, .facultyBox, .roomBox, .subjectBox, .dayBox, .timeBox').forEach(cb => {
    cb.checked = false;
  });

  // Reset date radio
  const todayStr = filters.date;
  const dateHeaderText = document.getElementById('dateHeaderText');
  if (dateHeaderText) dateHeaderText.textContent = todayStr;
  const todayRadio = document.querySelector(`input.dateRadio[value="${todayStr}"]`);
  if (todayRadio) todayRadio.checked = true;

  loadData();
}

// ─── Loading helpers ───────────────────────────────────────
function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('ganttChart').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('ganttChart').style.display = 'block';
}

// ─── Event listeners ───────────────────────────────────────
function attachEventListeners() {
  // Clear filters button
  document.getElementById('clearFilters')?.addEventListener('click', clearAllFilters);
}
