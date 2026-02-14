import { useState } from "react";
import Sidebar from "../components/Sidebar.tsx";
import Header from "../components/Header.tsx";
import Dashboard from "../components/Dashboard.tsx";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        className="fixed top-3 left-3 z-[200] w-10 h-10 bg-[#1e293b] border-none rounded-lg flex items-center justify-center cursor-pointer text-white shadow-md md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-[260px] min-h-screen">
        <Header />
        <Dashboard />
      </div>
    </>
  );
}
