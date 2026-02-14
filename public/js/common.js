// ─── Shared Searchable Dropdown Utilities ────────────────────

// Multi-select dropdown toggle (with search focus/clear)
function toggleMultiSelect(displayEl) {
  const container = displayEl.parentElement;
  const wasOpen = container.classList.contains('open');

  // Close all other dropdowns and clear their search
  document.querySelectorAll('.multi-select.open').forEach(ms => {
    ms.classList.remove('open');
    const si = ms.querySelector('.dropdown-search-input');
    if (si) {
      si.value = '';
      ms.querySelectorAll('.dropdown-option').forEach(o => o.style.display = '');
    }
  });

  // Toggle this one
  if (!wasOpen) {
    container.classList.add('open');
    const searchInput = container.querySelector('.dropdown-search-input');
    if (searchInput) {
      searchInput.value = '';
      container.querySelectorAll('.dropdown-option').forEach(o => o.style.display = '');
      setTimeout(() => searchInput.focus(), 50);
    }
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.multi-select')) {
    document.querySelectorAll('.multi-select.open').forEach(ms => {
      ms.classList.remove('open');
      const si = ms.querySelector('.dropdown-search-input');
      if (si) {
        si.value = '';
        ms.querySelectorAll('.dropdown-option').forEach(o => o.style.display = '');
      }
    });
  }
});

// Filter dropdown options based on search input
function filterDropdownOptions(input) {
  var query = input.value.toLowerCase().trim();
  var wrapper = input.closest('.dropdown-search-wrapper');
  var panel = wrapper.parentElement;
  var options = panel.querySelectorAll('.dropdown-option');
  var hasVisible = false;

  options.forEach(function(opt) {
    // Always show the "all" / placeholder option
    if (opt.dataset.value === 'all' || opt.dataset.value === '') {
      opt.style.display = '';
      return;
    }
    var text = opt.textContent.toLowerCase();
    if (text.includes(query)) {
      opt.style.display = '';
      hasVisible = true;
    } else {
      opt.style.display = 'none';
    }
  });

  // Show/hide "no results" message
  var noResults = panel.querySelector('.dropdown-no-results');
  if (!hasVisible && query) {
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.className = 'dropdown-no-results';
      noResults.style.cssText = 'padding:12px;text-align:center;color:#94a3b8;font-size:0.75rem;';
      noResults.textContent = 'No results found';
      panel.appendChild(noResults);
    }
    noResults.style.display = '';
  } else if (noResults) {
    noResults.style.display = 'none';
  }
}

// Build searchable select dropdown HTML
// allValue defaults to 'all'; pass '' for cascading dropdowns
function buildSelectDropdownHTML(label, placeholder, items, idPrefix, allValue) {
  if (allValue === undefined) allValue = 'all';

  var html = '\
    <label class="flex items-center gap-[4px]\
      text-[0.7rem] font-[600]\
      text-[#94a3b8]\
      uppercase tracking-[0.05em]">\
      ' + label + '\
    </label>\
    <div class="relative min-w-[120px] multi-select group">\
      <div class="flex items-center justify-between\
        py-[6px] px-[10px]\
        bg-[#ffffff]\
        border border-[#e2e8f0]\
        rounded-[8px]\
        cursor-pointer\
        text-[0.85rem]\
        min-h-[32px]\
        gap-[4px]\
        transition-all duration-[150ms] ease-in-out text-[#64748b] hover:border-[#10b981] group-[.open]:border-[#10b981] group-[.open]:ring-2 group-[.open]:ring-[rgba(16,185,129,0.1)]"\
        onclick="toggleMultiSelect(this)">\
        <span class="text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis" id="' + idPrefix + 'HeaderText">\
          ' + placeholder + '\
        </span>\
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"\
          class="w-[14px] h-[14px] shrink-0 transition-transform duration-[150ms]\
          ease-in-out text-[#94a3b8] group-[.open]:rotate-180">\
          <polyline points="6 9 12 15 18 9"></polyline>\
        </svg>\
      </div>\
      <div class="absolute\
        top-[calc(100%+4px)]\
        left-0 right-0\
        bg-[#ffffff]\
        border border-[#e2e8f0]\
        rounded-[8px]\
        shadow-[0_10px_15px_-3px_rgb(0_0_0_/_0.1),_0_4px_6px_-4px_rgb(0_0_0_/_0.1)]\
        z-[1]\
        max-h-[250px]\
        overflow-y-auto\
        hidden group-[.open]:block">\
        <div class="dropdown-search-wrapper" style="position:sticky;top:0;background:#fff;padding:6px 8px;border-bottom:1px solid #e2e8f0;z-index:2;">\
          <input type="text" class="dropdown-search-input" placeholder="Search..."\
            onclick="event.stopPropagation()"\
            oninput="filterDropdownOptions(this)"\
            style="width:100%;padding:5px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:0.8rem;outline:none;font-family:inherit;" />\
        </div>';

  html += '\
    <div class="dropdown-option selected py-[8px] px-[12px]\
                cursor-pointer\
                text-[0.7rem] font-[600] text-[#1e293b] uppercase tracking-[0.05em]\
                hover:bg-[#f1f5f9]\
                transition-colors duration-[150ms] ease-in-out"\
         data-value="' + allValue + '">\
      ' + placeholder + '\
    </div>';

  items.forEach(function(item) {
    html += '\
      <div class="dropdown-option py-[8px] px-[12px]\
                  cursor-pointer\
                  text-[0.7rem] font-[600] text-[#94a3b8] uppercase tracking-[0.05em]\
                  hover:bg-[#f1f5f9]\
                  transition-colors duration-[150ms] ease-in-out"\
           data-value="' + item.value + '">\
        ' + item.label + '\
      </div>';
  });

  html += '\
      </div>\
    </div>';

  return html;
}
