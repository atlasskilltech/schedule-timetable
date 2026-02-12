export default function Header() {
  return (
   <header className="bg-[#ffffff] border-b border-[#e2e8f0]
            py-[16px] px-[32px]
            flex justify-between items-center
            sticky top-0 z-[50]">
       
          <div className="">
            <h1 className="text-[1.5rem] font-[600] text-[#1e293b] mb-[2px]">Dashboard</h1>
            <p className="text-[0.85rem] text-[#64748b]">Overview of timetable statistics and metrics</p>
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="flex gap-[24px] pr-[24px] border-r border-[#e2e8f0]">
            <div className="text-center">
              <div className="text-[1.25rem] font-[700] text-[#10b981]" id="totalScheduled">111</div>
              <div className="text-[0.7rem] text-[#94a3b8] uppercase tracking-[0.05em]">SCHEDULED</div>
            </div>
            <div className="text-center">
              <div className="text-[1.25rem] font-[700] text-[#10b981]" id="totalUnscheduled">355</div>
              <div className="text-[0.7rem] text-[#94a3b8] uppercase tracking-[0.05em]">UNSCHEDULED</div>
            </div>
            </div>
            <button  className="bg-transparent text-[#64748b] border border-[#e2e8f0] inline-flex items-center gap-[8px]
         py-[8px] px-[16px]
         rounded-[8px]
         text-[0.85rem] font-[500]
         cursor-pointer
         transition-all duration-[150ms] ease-in-out hover:bg-[#f1f5f9] hover:text-[#1e293b]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="w-[16px] h-[16px]">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>Feedback
            </button>
          </div>
        
      </header>
  );
}
