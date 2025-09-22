import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-800">
      <Sidebar />
      <MobileSidebar open={open} onClose={() => setOpen(false)} />
      <main className="flex-1 p-4 md:p-6 lg:ml-6">
        <Header onMenuClick={() => setOpen(true)} />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
