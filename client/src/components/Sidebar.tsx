
import { Link } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
   <aside className={`w-[260px] bg-[#1e293b] text-[#e2e8f0] flex flex-col fixed inset-y-0 left-0 z-[100] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
  <div className="p-[24px] border-b border-white/10">
    <div className="flex items-center gap-[8px]">
      <div className="w-[36px] h-[36px] bg-[#10b981] rounded-[8px] flex items-center justify-center font-bold text-[1.1rem] text-white">A</div>
      <span className="text-[1.1rem] font-semibold tracking-[-0.02em]">ATLAS Timetable</span>
    </div>
  </div>

  <nav className="flex-1 py-4 px-0 overflow-y-auto">

    <div className="mb-[24px]">
      <h3 className="py-[8px] px-[24px] text-[0.7rem] uppercase tracking-[0.08em] text-[#94a3b8] font-[600]">OVERVIEW</h3>
      <Link to="/" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8]
 bg-[#10b981] text-white rounded-r-[8px] mr-[16px]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                            <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                            <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                            <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                            <rect x="3" y="16" width="7" height="5" rx="1"></rect>
                        </svg>
        Dashboard
      </Link>
    </div>


    <div className="mb-[24px]">
      <h3 className="py-[8px] px-[24px] text-[0.7rem] uppercase tracking-[0.08em] text-[#94a3b8] font-[600]">TIMETABLE VIEWS</h3>


      <Link to="/timetable/by-division" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal   text-[#94a3b8]
  hover:bg-[#334155] hover:text-[#e2e8f0]">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
        <span>By Division</span>
      </Link>
      <Link to="/timetable/by-faculty" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8]
  hover:bg-[#334155] hover:text-[#e2e8f0]">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
        <span>By Faculty</span>
      </Link>
      <Link to="/timetable/by-day" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8]  hover:bg-[#334155] hover:text-[#e2e8f0]">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
        <span>By Day</span>
      </Link>
    </div>


    <div className="mb-[24px]">
      <h3 className="py-[8px] px-[24px] text-[0.7rem] uppercase tracking-[0.08em] text-[#94a3b8] font-[600]">RESOURCES</h3>
      <Link to="/resources/classNamerooms" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9,22 9,12 15,12 15,22"></polyline>
                        </svg>
        <span>classNamerooms</span>
      </Link>
      <Link to="/resources/unscheduled" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
        <span>Unscheduled</span>
      </Link>
    </div>

    {/* Management Section */}
    <div className="mb-[24px]">
      <h3 className="py-[8px] px-[24px] text-[0.7rem] uppercase tracking-[0.08em] text-[#94a3b8] font-[600]">MANAGEMENT</h3>
      <Link to="/management/analytics" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <span>Analytics</span>
      </Link>
      <Link to="/management/reports" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span>Reports</span>
      </Link>
      <Link to="/management/settings" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>Settings</span>
      </Link>
      <Link to="/management/help" onClick={onClose} className="flex items-center gap-[8px] py-[8px] px-[24px] text-[0.9rem] font-[500] cursor-pointer transition-all duration-[150ms] ease-in-out
         border-none w-full text-left  leading-normal text-[#94a3b8] hover:bg-[#334155] hover:text-[#e2e8f0]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>Help & Support</span>
      </Link>
    </div>
  </nav>

    </aside>
  );
}
