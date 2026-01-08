import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
}


export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, bgColor, iconColor }) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-lg flex items-center justify-center ${iconColor} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-500 text-xs sm:text-sm mb-1">{label}</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
};