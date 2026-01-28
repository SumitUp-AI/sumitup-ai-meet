import { Search, ChevronDown, Eye, RotateCcw, Clock } from "lucide-react";
import { useState } from "react";

const MeetingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy meeting data
  const meetings = [
    {
      id: 1,
      title: "Q3 Roadmap Sync",
      team: "Product Team",
      date: "Oct 24, 2:00 PM",
      duration: "45m",
      status: "Processed",
      statusColor: "green",
      icon: "🚀",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: 2,
      title: "Weekly Design Sync",
      team: "Design Team",
      date: "Oct 24, 10:00 AM",
      duration: "32m",
      status: "Processed",
      statusColor: "green",
      icon: "✏️",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: 3,
      title: "Client Intro: Acme Corp",
      team: "Sales",
      date: "Oct 23, 4:00 PM",
      duration: "1h 10m",
      status: "Processing",
      statusColor: "blue",
      icon: "💎",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: 4,
      title: "Product Marketing Sync",
      team: "Marketing",
      date: "Oct 22, 11:30 AM",
      duration: "50m",
      status: "Processed",
      statusColor: "green",
      icon: "🧡",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      id: 5,
      title: "Engineering Standup",
      team: "Engineering",
      date: "Oct 22, 9:00 AM",
      duration: "15m",
      status: "Failed",
      statusColor: "red",
      icon: "🔴",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  const getStatusBadge = (status: string, color: string) => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";

    switch (color) {
      case "green":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "blue":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "red":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getActionButton = (status: string) => {
    if (status === "Failed") {
      return (
        <button className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <RotateCcw className="w-4 h-4 mr-1" />
          Retry
        </button>
      );
    } else if (status === "Processing") {
      return (
        <button className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <Clock className="w-4 h-4 mr-1" />
          Wait...
        </button>
      );
    } else {
      return (
        <button className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
          <Eye className="w-4 h-4 mr-1" />
          View Summary
        </button>
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600 mt-1">
              Access your past recordings, transcripts, and AI-generated
              insights.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, participant, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Date Range
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Status
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Meetings Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Meeting Title</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Action</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Meeting Title */}
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${meeting.iconBg} rounded-lg flex items-center justify-center text-lg`}
                  >
                    {meeting.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-gray-500">{meeting.team}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-900">{meeting.date}</span>
                </div>

                {/* Duration */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-900">
                    {meeting.duration}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  <span
                    className={getStatusBadge(
                      meeting.status,
                      meeting.statusColor,
                    )}
                  >
                    {meeting.status === "Processed" && "●"} {meeting.status}
                  </span>
                </div>

                {/* Action */}
                <div className="col-span-2 flex items-center">
                  {getActionButton(meeting.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">5</span> of{" "}
                <span className="font-medium">24</span> results
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
