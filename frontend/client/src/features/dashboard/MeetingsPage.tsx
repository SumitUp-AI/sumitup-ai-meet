import { Search, ChevronDown, Eye, CircleX, Clock, VideoIcon, Loader} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";
import { formatDate, getMeetingDuration } from "../../utils/dateFormatter";
import GoogleMeetIcon from "../../../public/google-meet-svgrepo-com.svg";
import MicrosoftTeamsIcon from "../../../public/icons8-microsoft-teams-96.png";
import ZoomIcon from "../../../public/zoom.avif";
import AOS from "aos";

// Assigned to Murtaza
const MeetingsPage: React.FC = () => {

  useEffect(()=> { AOS.refresh() }, [])
  const [searchQuery, setSearchQuery] = useState("");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:3000/api/v1";

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMeetings([]);

    fetch(`${BASE_URL}/get_all_meetings`, {
      headers: getAuthHeaders(token, user.tenant_id),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch meetings");
        return res.json();
      })
      .then((data) => {
        const mappedMeetings = data.map((m: any) => ({
          id: m.id,
          title: m.name,
          team: "General",
          platform: m.platform,
          date: formatDate(m.started_at),
          duration: getMeetingDuration(m.started_at, m.ended_at),
          status: m.state,
        }));
        setMeetings(mappedMeetings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user?.tenant_id, token]);

  // TODO (Murtaza): Map each meeting state to the correct badge style.
  // States from backend: "joining", "joined_recording", "post_processing",
  // "ended", "fatal_error", "leaving", "waiting_room", "scheduled"
  // Use the getStatusBadge function below and add cases for each state.
  // Example: "ended" → green badge, "fatal_error" → red badge, "joining" → cyan badge
  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    // TODO (Murtaza): Add all state cases here
    switch (status) {
      case "ended":
        return <span className={`${base} bg-green-100 text-green-800`}>Completed</span>;
      case "fatal_error":
        return <span className={`${base} bg-red-100 text-red-800`}>Failed</span>;
      case "joining":
        return <span className={`${base} bg-cyan-100 text-cyan-500`}>Joining</span>;
      case "joined_recording":
        return <span className={`${base} bg-cyan-100 text-cyan-800`}>Recording</span>;
      case "post_processing":
        return <span className={`${base} bg-gray-100 text-gray-800`}>Processing..</span>;
      default:
        // TODO (Murtaza): Handle remaining states — post_processing, leaving, waiting_room, scheduled
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  const traverseToSummary = (id: string) => {
    navigate(`/dashboard/summary/${id}`);
  };

  // Murtaza's work here
  const getActionButton = (status: string, id: string) => {
    if (status === "fatal_error") {
      return (
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 transition-colors">
          <CircleX className="w-4 h-4" />
          Failed
        </button>
      );
    } else if (status === "joining" || status === "joined_recording") {
      return (
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-600 hover:text-cyan-700 transition-colors">
          <Clock className="w-4 h-4" />
          Live
        </button>
      );
    } else {
      return (
        <button
          onClick={() => traverseToSummary(id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Summary
        </button>
      );
    }
  };

  const showMeetingPlatform = (str: string) => {
    switch (str) {
      case "GMEET":
        return (
          <div className="flex items-center p-2 w-10 h-10 bg-cyan-50 rounded-lg border border-cyan-100">
              <img src={GoogleMeetIcon} width={32} alt="GMEET" />
          </div>
        )
      case "MSTEAMS":
        return (
          <div className="flex items-center p-2 w-10 h-10 bg-cyan-50 rounded-lg border border-cyan-100">
              <img src={MicrosoftTeamsIcon} width={32} alt="MSTEAMS" />
          </div>
        )
      case "ZOOM":
        return (
          <div className="flex items-center p-2 w-10 h-10 bg-cyan-50 rounded-lg border border-cyan-100">
              <img src={ZoomIcon} width={32} alt="ZOOM" />
          </div>
        )
      default:
        return (
          <></>
        )
    }
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center gap-2">
      <Loader className="w-8 h-8 animate-spin text-cyan-700" />
      <span className="text-cyan-600">Loading Meetings</span>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div data-aos="fade-up" className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Access your past recordings, transcripts, and AI-generated insights.
          </p>
        </div>

        {/* Search and Filters */}
        <div data-aos="fade-up" className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, participant, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Date Range <ChevronDown className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Status <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
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
                          <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{meetings.length}</span> results
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">Previous</button>
              <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MeetingsPage;