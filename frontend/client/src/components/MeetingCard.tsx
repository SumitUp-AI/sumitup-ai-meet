import React from "react";
import { CheckCircle, Clock } from "lucide-react";

interface MeetingCardProps {
  logo: React.ReactNode;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  status: "Processed" | "Processing" | "Analyzing";
  statusColor: string;
  onViewSummary?: () => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  logo,
  title,
  date,
  duration,
  participants,
  status,
  onViewSummary,
}) => {
  const statusStyles = {
    Processed: "bg-green-50 text-green-700 border-green-200",
    Processing: "bg-blue-50 text-blue-700 border-blue-200",
    Analyzing: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-shadow">
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
          {logo}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 mb-1">{title}</div>
          <div className="text-sm text-gray-500">{date}</div>
        </div>

        <div className="text-sm text-gray-600 font-medium w-16 text-center">
          {duration}
        </div>

        <div className="flex -space-x-2 w-20">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
            >
              {participant}
            </div>
          ))}
          {participants.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
              +{participants.length - 3}
            </div>
          )}
        </div>

        <div className="w-32">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}
          >
            {status === "Processed" && <CheckCircle className="w-3 h-3" />}
            {status === "Processing" && <Clock className="w-3 h-3" />}
            {status}
          </span>
        </div>

        <button
          onClick={onViewSummary}
          className="text-blue-600 text-sm font-medium hover:text-blue-700 whitespace-nowrap"
        >
          View Summary
        </button>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
            {logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 mb-1">{title}</div>
            <div className="text-sm text-gray-500 mb-2">{date}</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                {duration}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}
              >
                {status === "Processed" && <CheckCircle className="w-3 h-3" />}
                {status === "Processing" && <Clock className="w-3 h-3" />}
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
              >
                {participant}
              </div>
            ))}
            {participants.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                +{participants.length - 3}
              </div>
            )}
          </div>

          <button
            onClick={onViewSummary}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            View Summary
          </button>
        </div>
      </div>
    </div>
  );
};
