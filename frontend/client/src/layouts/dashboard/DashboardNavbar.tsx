// DashboardNavbar.tsx
import React from "react";
import { Search, Bell, Menu } from "lucide-react";

export const DashboardNavbar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-transform duration-300"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcripts, meetings, insights..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Search className="w-5 h-5 text-gray-600" />
        </button>

        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
            AM
          </div>
          <div className="hidden sm:block text-sm">
            <div className="font-medium">Alex Morgan</div>
            <div className="text-gray-500 text-xs">Product Lead</div>
          </div>
        </div>
      </div>

    </nav>
  );
};
