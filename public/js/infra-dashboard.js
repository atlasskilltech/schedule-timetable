// Global state
let allRooms = [];
let filteredRooms = [];
let filters = {
  date: new Date().toISOString().split('T')[0],
  building: 'all',
  floor: 'all',
  class: 'all',
  category: 'all',
  school: 'all',
  showAvailable: true,
  showOccupied: true
};

// Day operating hours for occupancy rate calculation
const DAY_START_HOUR = 7;
const DAY_END_HOUR   = 19;
const DAY_TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

// ─── Initialize ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  loadFilterOptions();
  loadData();
  attachEventListeners();
  initializePalette();
  initializeSidebar();
});

function initializeFilters() {
  document.getElementById('dateFilter').value = filters.date;
}

// ─── Sidebar toggle (mobile) ────────────────────────────────
function initializeSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.querySelector('[data-sidebar-toggle]');

  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
}

// ─── Palette (school chips in sidebar) ──────────────────────
function initializePalette() {
  const chips = document.querySelectorAll('.school-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const schoolId = chip.dataset.school;

      chips.forEach(c => c.classList.remove('palette-selected'));

      if (schoolId === 'all' || filters.school === schoolId) {
        filters.school = 'all';
        document.querySelector('.school-chip[data-school="all"]').classList.add('palette-selected');
      } else {
        filters.school = schoolId;
        chip.classList.add('palette-selected');
      }

      applyFilters();

      // Close sidebar on mobile after selection
      if (window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('active');
      }
    });
  });
}

// ─── Load filter options from API ───────────────────────────
async function loadFilterOptions() {
  try {
    const response = await fetch('/infra/api/filter-options');
    const data = await response.json();
    if (data.success) {
      populateSelect('buildingFilter', data.data.buildings);
      populateSelect('floorFilter', data.data.floors);
      populateSelect('classFilter', data.data.classes);
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

function populateSelect(id, options) {
  const select = document.getElementById(id);
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}

// ─── Load room data ─────────────────────────────────────────
async function loadData() {
  showLoading();
  try {
    const roomsRes = await fetch(`/infra/api/rooms?date=${filters.date}`);
    const roomsData = await roomsRes.json();
    if (roomsData.success) {
      allRooms = roomsData.data;
      applyFilters();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Failed to load data. Please check your database connection.');
  } finally {
    hideLoading();
  }
}

// ─── Schedule-level filter helpers ──────────────────────────
function scheduleMatchesSchool(schedule) {
  if (filters.school === 'all') return true;
  if (filters.school === 'default') return !schedule.school_id;
  const schoolId = schedule.school_id ? String(schedule.school_id) : '';
  const mergedKey = filters.school === '11' ? ['11', '13'] : [filters.school];
  return mergedKey.includes(schoolId);
}

function scheduleMatchesClass(schedule) {
  if (filters.class === 'all') return true;
  return schedule.class === filters.class;
}

// ─── Apply all filters ──────────────────────────────────────
function applyFilters() {
  filteredRooms = [];

  allRooms.forEach(room => {
    if (filters.building !== 'all' && room.building !== filters.building) return;
    if (filters.floor !== 'all' && room.floor !== filters.floor) return;

    if (filters.category !== 'all') {
      const roomCat = (room.room_category || 'Others').trim();
      if (roomCat !== filters.category) return;
    }

    // Filter schedules within this room
    const matchedSchedules = room.schedules.filter(s =>
      scheduleMatchesSchool(s) && scheduleMatchesClass(s)
    );

    const hasMatched = matchedSchedules.length > 0;
    if (!filters.showAvailable && !hasMatched) return;
    if (!filters.showOccupied && hasMatched) return;

    // If school or class filter active, skip rooms with no matching schedules
    if ((filters.school !== 'all' || filters.class !== 'all') && !hasMatched) return;

    filteredRooms.push({ ...room, schedules: matchedSchedules });
  });

  updateFilteredStatistics();
  renderGanttChart();
}

// ─── Statistics ─────────────────────────────────────────────
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

function updateFilteredStatistics() {
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

  // Update header stats too
  document.getElementById('headerOccupied').textContent  = occupiedRooms;
  document.getElementById('headerAvailable').textContent = availableRooms;
}

// ─── School colour helpers ──────────────────────────────────
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

// ─── Gantt Chart rendering ──────────────────────────────────
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

// ─── CSV Export ─────────────────────────────────────────────
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

// ─── Clear filters ──────────────────────────────────────────
function clearFilters() {
  filters.building = 'all';
  filters.floor = 'all';
  filters.class = 'all';
  filters.category = 'all';
  filters.school = 'all';
  filters.showAvailable = true;
  filters.showOccupied = true;

  document.getElementById('buildingFilter').value = 'all';
  document.getElementById('floorFilter').value = 'all';
  document.getElementById('classFilter').value = 'all';
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('showAvailable').checked = true;
  document.getElementById('showOccupied').checked = true;

  // Reset school chips
  document.querySelectorAll('.school-chip').forEach(c => c.classList.remove('palette-selected'));
  document.querySelector('.school-chip[data-school="all"]').classList.add('palette-selected');

  applyFilters();
}

// ─── Loading helpers ────────────────────────────────────────
function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('ganttChart').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('ganttChart').style.display = 'block';
}

// ─── Event listeners ────────────────────────────────────────
function attachEventListeners() {
  document.getElementById('dateFilter').addEventListener('change', e => {
    filters.date = e.target.value;
    loadData();
  });

  document.getElementById('buildingFilter').addEventListener('change', e => {
    filters.building = e.target.value;
    applyFilters();
  });

  document.getElementById('floorFilter').addEventListener('change', e => {
    filters.floor = e.target.value;
    applyFilters();
  });

  document.getElementById('classFilter').addEventListener('change', e => {
    filters.class = e.target.value;
    applyFilters();
  });

  document.getElementById('categoryFilter').addEventListener('change', e => {
    filters.category = e.target.value;
    applyFilters();
  });

  document.getElementById('showAvailable').addEventListener('change', e => {
    filters.showAvailable = e.target.checked;
    applyFilters();
  });

  document.getElementById('showOccupied').addEventListener('change', e => {
    filters.showOccupied = e.target.checked;
    applyFilters();
  });

  document.getElementById('refreshBtn').addEventListener('click', e => {
    e.preventDefault();
    location.reload();
  });

  // Export CSV — both sidebar nav and any export button
  document.getElementById('exportNavBtn')?.addEventListener('click', e => {
    e.preventDefault();
    exportToCSV();
  });

  // Clear filters button
  document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
}
