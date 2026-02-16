import React, { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

export const DashboardContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

export const DashboardContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [menuOpen, setMenuOpen] = useState(false); // ✅ starts fully open
  return (
    <div className="flex h-screen bg-gray-50">

      {/* LEFT SIDEBAR */}
      <div className={`bg-white border-r border-gray-200 flex flex-col justify-between p-4 transition-all duration-300
                       ${menuOpen ? "w-60" : "w-16"}`}>
        {/* TOP SECTION */}
        <div>
          {/* LOGO */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            {menuOpen && <span className="font-semibold text-lg">SumItUP</span>}
          </div>

          {/* HAMBURGER */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 mb-4 rounded-lg hover:bg-gray-100 transform transition-transform duration-300
                        ${menuOpen ? "rotate-90" : "rotate-0"}`}
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* MENU ITEMS */}
          <div className="flex flex-col gap-3">
            {["Dashboard", "Meetings", "AI Chat", "Insights"].map((item, idx) => (
              <button
                key={idx}
                className={`flex items-center w-full text-left px-3 py-2 rounded hover:bg-blue-100 transition-colors duration-200
                           ${menuOpen ? "justify-start" : "justify-center"}`}
              >
                <span className={`${menuOpen ? "ml-0" : "hidden"}`}>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM SETTINGS */}
        <div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-black">
            <Settings className="w-5 h-5" />
            {menuOpen && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar onMenuClick={() => setMenuOpen(!menuOpen)} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

    </div>
  );
};
