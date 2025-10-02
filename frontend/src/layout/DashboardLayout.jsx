import React from "react";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { MobileSidebar } from "../components/Mobilesidebar";

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 relative">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex pl-4 pt-6 pb-6">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar open={open} onClose={() => setOpen(false)} />
      {open && (
        <div
          className="fixed inset-0 bg-opacity-40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen transition-all duration-200 ">
        <Header onMenuClick={() => setOpen(true)} />
        <div className="flex-1 mt-2 px-2 md:px-6 pb-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
