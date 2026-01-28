import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  MessageSquare,
  TrendingUp,
  Settings,
  X,
  ChevronDown,
  Menu
} from "lucide-react";

export const DashboardSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  // 🔴 IMPORTANT: menu by default CLOSED
  const [menuOpen, setMenuOpen] = useState(false);

  // Sidebar band ho → menu bhi band
  useEffect(() => {
    if (!isOpen) {
      setMenuOpen(false);
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b">
          <span className="font-semibold text-lg">SumItUP</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* MENU SECTION */}
        <div className="flex-1 px-4 py-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Menu className="w-5 h-5" />
              Menu
            </div>

            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Collapsible items */}
          {menuOpen && (
            <div className="mt-2 space-y-1 pl-4">
              <SidebarItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" />
              <SidebarItem icon={<Calendar className="w-5 h-5" />} label="Meetings" />
              <SidebarItem icon={<MessageSquare className="w-5 h-5" />} label="AI Chat" />
              <SidebarItem icon={<TrendingUp className="w-5 h-5" />} label="Insights" />
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="p-4 border-t">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
    {icon}
    <span>{label}</span>
  </button>
);


