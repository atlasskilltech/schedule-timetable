// Global state
let filters = {
  date: new Date().toISOString().split("T")[0],
  program: [],
  year: [],
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



// Load filter options from API
async function loadFilterOptions() {
  try {
    const response = await fetch("/api/dashboard/filters");
    const data = await response.json();
    console.log("/api/dashboard/filters console",data);

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
    console.error("Error loading filter options:", error);
  }
}


function populateDateFilter() {
  const dateFilter = document.getElementById("filterDate");

  const today = new Date();
  const currentYear = today.getFullYear();

  const format = d => d.toISOString().split("T")[0];
  const todayStr = format(today);

  // Default = today
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

  // 🔥 Loop through 12 months
  for (let month = 0; month < 12; month++) {
    const monthName = new Date(currentYear, month, 1).toLocaleString("en-US", {
      month: "long",
    });

    // Month header
    html += `
      <div class="px-[12px] py-[6px] text-[0.7rem]
                  font-bold text-slate-500 bg-slate-100">
        ${monthName} ${currentYear}
      </div>
    `;

    // Days in month
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, month, day);
      const value = format(d);

      html += `
        <div class="flex items-center gap-[8px] py-[6px] px-[12px]
                    cursor-pointer text-[0.85rem]">
          <input
            type="radio"
            name="dateRadio"
            value="${value}"
            class="dateRadio accent-[#10b981]"
            ${value === todayStr ? "checked" : ""} />

          <label class="text-[0.7rem] font-[600] text-[#94a3b8] uppercase">
            ${value}
          </label>
        </div>
      `;
    }
  }

  html += `
      </div>
    </div>
  `;

  dateFilter.innerHTML = html;

  // 🔥 Handle change
  dateFilter.addEventListener("change", (e) => {
    if (!e.target.classList.contains("dateRadio")) return;

    filters.date = e.target.value;
    document.getElementById("dateHeaderText").textContent = e.target.value;

    console.log("filters.date:", filters.date);

    loadData();
  });
  
}


function populatePrograms(programs) {
  console.log("populatePrograms",programs);
    const programFilter = document.getElementById("filterProgram");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      PROGRAM
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Programs
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

  // 2️⃣ Dynamic years loop
  programs.forEach(program => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${program.school_code}">

        <input
          type="checkbox"
          id="dashProgram_${program.school_code}"
          value="${program.school_code}"
          class="programBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashProgram_${program.school_code}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${program.school_name}ddd
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  programFilter.innerHTML = html;

  programFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("programBox")) return;

  // Saare checked years nikalo
  const selectedPrograms = Array.from(
    programFilter.querySelectorAll(".programBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.program = selectedPrograms;

  console.log("filters.program (array):", filters.program);

  loadData();
});
  
}




function populateYears(years) {
   
    const yearFilter = document.getElementById("filterYear");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      YEAR
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Years
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

  // 2️⃣ Dynamic years loop
  years.forEach(year => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${year}">

        <input
          type="checkbox"
          id="dashYear_${year}"
          value="${year}"
          class="yearBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashYear_${year}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${year}
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  yearFilter.innerHTML = html;

  yearFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("yearBox")) return;

  // Saare checked years nikalo
  const selectedYears = Array.from(
    yearFilter.querySelectorAll(".yearBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.year = selectedYears;

  console.log("filters.year (array):", filters.year);

  loadData();
});
    

}




function populateSections(sections) {
  console.log("populateSections",sections);
    const sectionFilter = document.getElementById("filterSection");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      SECTION
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Sections
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

  // 2️⃣ Dynamic years loop
  sections.forEach(section => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${section.class_id}">

        <input
          type="checkbox"
          id="dashSection_${section.class_id}"
          value="${section.class_id}"
          class="sectionBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashSection_${section.class_id}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${section.class_name}
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  sectionFilter.innerHTML = html;

  sectionFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("sectionBox")) return;

  // Saare checked years nikalo
  const selectedSection = Array.from(
    sectionFilter.querySelectorAll(".sectionBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.section = selectedSection;

  console.log("filters.section (array):", filters.section);

  loadData();
});
  
}

function populateFaculties(faculties) {
   console.log("populatefaculties",faculties);
    const facultyFilter = document.getElementById("filterFaculty");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      FACULTY
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Faculty
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

  // 2️⃣ Dynamic years loop
  faculties.forEach(facultie => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${facultie.faculty_id}">

        <input
          type="checkbox"
          id="dashFaculty_${facultie.faculty_id}"
          value="${facultie.faculty_id}"
          class="facultyBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashFaculty_${facultie.faculty_id}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${facultie.faculty_first_name} ${facultie.faculty_last_name}
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  facultyFilter.innerHTML = html;

  facultyFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("facultyBox")) return;

  // Saare checked years nikalo
  const selectedFaculty = Array.from(
    facultyFilter.querySelectorAll(".facultyBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.faculty = selectedFaculty;

  console.log("filters.faculty (array):", filters.faculty);

  loadData();
});
  
}

function populateRooms(rooms) {
   console.log("populateRooms",rooms);
    const roomFilter = document.getElementById("filterRoom");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      ROOM
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Rooms
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

  // 2️⃣ Dynamic years loop
  rooms.forEach(room => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${room.room_id}">

        <input
          type="checkbox"
          id="dashRoom_${room.room_id}"
          value="${room.room_id}"
          class="roomBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashRoom_${room.room_id}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${room.room_name}  (${room.floor_name} ${room.floor_building})
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  roomFilter.innerHTML = html;

  roomFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("roomBox")) return;

  // Saare checked years nikalo
  const selectedRoom = Array.from(
    roomFilter.querySelectorAll(".roomBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.room = selectedRoom;

  console.log("filters.room (array):", filters.room);

  loadData();
});
  
}

function populateSubjects(subjects) {
   console.log("populateSubjects",subjects);
    const subjectFilter = document.getElementById("filterSubject");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      SUBJECT
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Subjects
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

  // 2️⃣ Dynamic years loop
  subjects.forEach(subject => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${subject.subject_id}">

        <input
          type="checkbox"
          id="dashSubject_${subject.subject_id}"
          value="${subject.subject_id}"
          class="subjectBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashSubject_${subject.subject_id}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${subject.subject_code}   ${subject.subject_name}
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  subjectFilter.innerHTML = html;

  subjectFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("subjectBox")) return;

  // Saare checked years nikalo
  const selectedSubject = Array.from(
    subjectFilter.querySelectorAll(".subjectBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.subject = selectedSubject;

  console.log("filters.subject (array):", filters.subject);

  loadData();
});
}

function populateDays(days) {
 console.log("populateDays",days);
    const dayFilter = document.getElementById("filterDay");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      DAY
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Days
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

  // 2️⃣ Dynamic years loop
  days.forEach(day => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${day}">

        <input
          type="checkbox"
          id="dashDay_${day}"
          value="${day}"
          class="dayBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashDay_${day}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${day}
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  dayFilter.innerHTML = html;

  dayFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("dayBox")) return;

  // Saare checked years nikalo
  const selectedDay = Array.from(
    dayFilter.querySelectorAll(".dayBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.day = selectedDay;

  console.log("filters.day (array):", filters.day);

  loadData();
});
}

function populateTimes(times) {
  console.log("populateTimes",times);
    const timeFilter = document.getElementById("filterTime");
   let html = `
    <label class="flex items-center gap-[4px]
      text-[0.7rem] font-[600]
      text-[#94a3b8]
      uppercase tracking-[0.05em]">
      TIME
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
        id="toggleMultiSelect"
        data-text="All Years"
        onclick="toggleMultiSelect(this)">

        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis">
          All Times
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

  // 2️⃣ Dynamic years loop
  times.forEach(time => {
    html += `
      <div class="flex items-center gap-[8px] py-[8px] px-[12px]
                  cursor-pointer text-[0.85rem]
                  transition-colors duration-[150ms] ease-in-out"
           data-value="${time.value}">

        <input
          type="checkbox"
          id="dashTime_${time.value}"
          value="${time.value}"
          class="timeBox w-[16px] h-[16px] accent-[#10b981] cursor-pointer " >

        <label
          for="dashTime_${time.value}"
          class="flex flex-1 items-center
                 cursor-pointer
                 whitespace-nowrap overflow-hidden text-ellipsis
                 gap-[var(--space-xs)]
                 text-[0.7rem] font-[600]
                 text-[#94a3b8]
                 uppercase tracking-[0.05em]">
          ${time.label}
        </label>
      </div>
    `;
  });

  // 3️⃣ Close dropdown container
  html += `
      </div>
    </div>
  `;

  timeFilter.innerHTML = html;

  timeFilter.addEventListener("change", (e) => {
  if (!e.target.classList.contains("timeBox")) return;

  // Saare checked years nikalo
  const selectedTime = Array.from(
    timeFilter.querySelectorAll(".timeBox:checked")
  ).map(cb => cb.value);

  // Global state update (ARRAY)
  filters.time = selectedTime;

  console.log("filters.time (array):", filters.time);

  loadData();
});
}

// Load timetable data
async function loadData() {
  showLoading();

  try {
    // Build query string
    const queryParams = new URLSearchParams();
    console.log(filters,"inside load data");
    Object.keys(filters).forEach((key) => {
        console.log(key,"filters[key]");
        if (filters[key] !== "all") {
            queryParams.append(key, filters[key]);
        }
    });
    
    console.log("Query params before filtering:", queryParams);
    const [timetableRes, statsRes] = await Promise.all(

    [
      fetch(`/api/dashboard/timetable?${queryParams}`),
      fetch(`/api/dashboard/stats?${queryParams}`),
    ]


);

    const timetableData = await timetableRes.json();
    const statsData = await statsRes.json();
    console.log(timetableData,"timetableData");
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

  // Check if data is empty
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

  // Group by day
  Object.keys(data).forEach((dayName) => {
    const classes = data[dayName];
    if (classes.length === 0) return;

    html += `
        <div class="day-header" style="padding:16px 24px;background:var(--bg-secondary);border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:8px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="color:var(--text-tertiary)">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3 style="font-size:1rem;font-weight:600;color:var(--text-primary);margin:0">${dayName}</h3>
          <span class="day-count">(${classes.length} classes)</span>
        </div>
        <div class="class-cards-grid" style="padding:24px">
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
    <div class="class-card" data-school="${schoolId}">
      <div class="card-time">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${cls.start_time} - ${cls.end_time}</span>
        <span class="card-time-value" style="margin-left:auto">${roomInfo}</span>
      </div>

      <div class="card-subject">
        <span class="subject-badge" data-school="${schoolId}">${schoolCode || "N/A"}</span>
        <div class="subject-name">${cls.subject_name || "N/A"}</div>
      </div>

      <div class="card-info">
        <div class="card-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>${facultyName}</span>
        </div>
        <div class="card-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${years || 0} Years</span>
        </div>
        ${cls.class_name ? `
        <div class="card-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>${cls.class_name}</span>
        </div>
        ` : ""}
        <div class="card-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          <span>${roomInfo}${buildingInfo ? " &bull; " + buildingInfo : ""}</span>
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

// Attach event listeners
function attachEventListeners() {
 

  // Clear filters
  document.getElementById("clearFilters").addEventListener("click", () => {
    filters = {
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

    // Reset all selects
    document.getElementById("dateFilter").value = filters.date;
    document.getElementById("programFilter").value = "all";
    document.getElementById("yearFilter").value = "all";
    document.getElementById("sectionFilter").value = "all";
    document.getElementById("facultyFilter").value = "all";
    document.getElementById("roomFilter").value = "all";
    document.getElementById("subjectFilter").value = "all";
    document.getElementById("dayFilter").value = "all";
    document.getElementById("timeFilter").value = "all";

    loadData();
  });
}

function toggleMultiSelect(displayEl) {
    console.log(displayEl,"displayEl");
      
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