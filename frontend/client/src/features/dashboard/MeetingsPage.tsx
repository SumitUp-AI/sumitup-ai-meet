import { Search, ChevronDown, Eye, RotateCcw, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";

const MeetingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:3000/api/v1"
  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/get_all_meetings`, {
      headers: getAuthHeaders(token, user.tenant_id),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch meetings");
        return res.json();
      })
      .then((data) => {
        // Map backend data to frontend format
        const mappedMeetings = data.map((m: any, index: number) => ({
          id: m.id,
          title: m.name,
          team: "General", // Placeholder
          date: new Date(m.started_at).toLocaleString(),
          duration: "N/A", // Backend doesn't return duration yet
          status: m.state,
          statusColor: m.state === "completed" ? "green" : "blue",
          icon: "🎥",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
        }));
        setMeetings(mappedMeetings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user, token]);

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

  const traverseToSummary = (id: string) => {
    navigate(`/dashboard/summary/${id}`);
  };

  const getActionButton = (status: string, id: string) => {
    if (status === "Failed") {
      return (
        <button className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <RotateCcw className="w-4 h-4 mr-1" />
          Retry
        </button>
      );
    } else if (status === "Processing" || status === "joining" || status === "joined_recording") {
      return (
        <button className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <Clock className="w-4 h-4 mr-1" />
          Live
        </button>
      );
    } else {
      return (
        <button
          onClick={() => traverseToSummary(id)}
          className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Summary
        </button>
      );
    }
  };

  if (loading) return <div className="p-6">Loading meetings...</div>;

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
                    {meeting.status === "completed" ? "●" : ""} {meeting.status}
                  </span>
                </div>

                {/* Action */}
                <div className="col-span-2 flex items-center">
                  {getActionButton(meeting.status, meeting.id)}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{meetings.length}</span> of{" "}
                <span className="font-medium">{meetings.length}</span> results
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
