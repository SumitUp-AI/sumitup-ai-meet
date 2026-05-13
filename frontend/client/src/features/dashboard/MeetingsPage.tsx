import { Plus, Search, ChevronDown, Eye, RotateCcw, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMeetingStatus } from "../../hooks/useMeetingStatus";
import { formatDate, getMeetingDuration } from "../../utils/dateFormatter";
import { getAuthHeaders } from "../../utils/apiHeaders";
import GoogleMeetIcon from "../../../public/google-meet-svgrepo-com.svg";
import MicrosoftTeamsIcon from "../../../public/icons8-microsoft-teams-96.png";
import ZoomIcon from "../../../public/zoom.avif";
import AOS from "aos";

// Assigned to Murtaza
const MeetingsPage: React.FC = () => {

  useEffect(()=> { AOS.refresh() }, [])
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use polling hook for real-time status updates
  const { 
    meetings: rawMeetings, 
    loading, 
    error,
    refreshMeetings,
    setOnStatusChange 
  } = useMeetingStatus({
    pollingInterval: 3000, // Poll every 3 seconds
    enabled: !!user // Only poll when user is authenticated
  });

  // Fetch shared meetings (accepted invitations from other hosts)
  const [sharedMeetings, setSharedMeetings] = useState<any[]>([]);
  const { token } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

  useEffect(() => {
    if (!token || !user) return;
    fetch(`${BASE_URL}/get_shared_meetings`, {
      headers: getAuthHeaders(token, user.tenant_id),
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setSharedMeetings(Array.isArray(data) ? data : []))
      .catch(() => setSharedMeetings([]));
  }, [token, user]);

  // Transform meetings data for display (with safety check)
  const ownedMeetings = (rawMeetings || []).map((m: any) => ({
    id: m.id,
    title: m.name,
    team: "General",
    platform: m.platform,
    date: formatDate(m.started_at),
    duration: getMeetingDuration(m.started_at, m.ended_at),
    status: m.state,
    isOwner: true,
  }));

  const invitedMeetings = sharedMeetings.map((m: any) => ({
    id: m.id,
    title: m.name,
    team: "Shared",
    platform: m.platform,
    date: formatDate(m.started_at),
    duration: getMeetingDuration(m.started_at, m.ended_at),
    status: m.state,
    isOwner: false,
  }));

  // Merge, deduplicate by id, owned meetings first
  const seenIds = new Set(ownedMeetings.map((m) => m.id));
  const meetings = [
    ...ownedMeetings,
    ...invitedMeetings.filter((m) => !seenIds.has(m.id)),
  ];

  // Optional: Handle status change notifications
  useEffect(() => {
    setOnStatusChange((changedMeetings) => {
      // Safety check for changedMeetings
      if (!changedMeetings || !Array.isArray(changedMeetings)) {
        return;
      }
      
      // You can add toast notifications here
      changedMeetings.forEach(meeting => {
        console.log(`Meeting "${meeting.name}" status updated to: ${meeting.state}`);
        // Example: show toast notification
        // toast.info(`Meeting "${meeting.name}" is now ${meeting.state}`);
      });
    });
  }, [setOnStatusChange]);

  
  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300";
    switch (status) {
      case "ended":
        return <span className={`${base} bg-teal-100 text-teal-800 animate-pulse`}>Ready</span>;
      case "fatal_error":
        return <span className={`${base} bg-red-100 text-red-800`}>Failed</span>;
      case "joining":
        return <span className={`${base} bg-cyan-100 text-cyan-500 animate-pulse`}>Joining</span>;
      case "joined_recording":
        return <span className={`${base} bg-cyan-100 text-cyan-800 animate-pulse`}>Recording</span>;
      case "post_processing":
        return <span className={`${base} bg-gray-100 text-gray-800 animate-pulse`}>Processing</span>;
      case "waiting_room":
        return <span className={`${base} bg-cyan-100 text-cyan-700 animate-pulse`}>In Waiting Room</span>;
      case "scheduled":
        return <span className={`${base} bg-blue-100 text-blue-700`}>Scheduled</span>;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getActionButton = (status: string) => {
    if (status === 'Failed') {
      return (
        <button className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <RotateCcw className="w-4 h-4 mr-1" />
          Retry
        </button>
      );
    } else if (status === 'Processing') {
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
            <p className="text-gray-600 mt-1">Access your past recordings, transcripts, and AI-generated insights.</p>
          </div>
          <button 
            onClick={handleNewMeeting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </button>
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
            <div className="flex gap-2">
              <button 
                onClick={refreshMeetings}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Date Range <ChevronDown className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Status
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Meetings Table */}
        <div data-aos="fade-up" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Meeting Title</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Duration</th>
                <th className="px-6 py-3 text-left">Platform</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No meetings found
                  </td>
                </tr>
              ) : (
                meetings
                  .filter((m) =>
                    m.title?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((meeting) => (
                    <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                            <VideoIcon className="w-4 h-4" stroke="none" fill="darkcyan" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{meeting.title || "Untitled"}</p>
                            <p className="text-xs text-gray-400">{meeting.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{meeting.date}</td>
                      <td className="px-6 py-4 text-gray-600">{meeting.duration}</td>
                      <td className="px-6 py-4 text-gray-600">{showMeetingPlatform(meeting.platform)}</td>
                      <td className="px-6 py-4">{getStatusBadge(meeting.status)}</td>
                      <td className="px-6 py-4">{getActionButton(meeting.status, meeting.id)}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
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