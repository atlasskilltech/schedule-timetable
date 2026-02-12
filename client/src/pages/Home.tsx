import Sidebar from "../components/Sidebar.tsx";
import Header from "../components/Header.tsx";
import Dashboard from "../components/Dashboard.tsx";

export default function Home() {
  return (
     <>
      <Sidebar />
      <div className="flex-1 ml-[260px] min-h-screen">
        <Header />
        <Dashboard />
      </div>
    </>
  );
}