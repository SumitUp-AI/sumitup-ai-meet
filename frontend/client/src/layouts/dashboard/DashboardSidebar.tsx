import React from "react";
import {
  BarChart3,
  Calendar,
  MessageSquare,
  TrendingUp,
  Settings,
  X,
  Plus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const DashboardSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Meetings",
      path: "/dashboard/meetings",
    },
    {
      icon: <Plus className="w-5 h-5" />,
      label: "New Meeting",
      path: "/dashboard/new-meetings",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "AI Chat",
      path: "/dashboard/ai-chat",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Insights",
      path: "/dashboard/insights",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

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
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">SumItUP</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 py-6">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => onClose()}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="p-4 border-t">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
            <div className="p-6 border-t border-gray-200">
              <Link
                to="/dashboard/settings"
                onClick={() => onClose()}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/dashboard/settings")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
