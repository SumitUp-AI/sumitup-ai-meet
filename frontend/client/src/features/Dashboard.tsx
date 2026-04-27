import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../utils/apiHeaders";
import { StatCard } from "../components/StatCard";
import { formatDate, getMeetingDuration } from "../utils/dateFormatter";
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  CircleX,
  Loader,
  VideoIcon,
  Sparkle,
  Ellipsis,
} from "lucide-react";
import AOS from "aos";

const Dashboard: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

  const traverseToSummary = (id: string) => {
    navigate(`/dashboard/summary/${id}`);
  };

  useEffect(() => {
    if (!user || !token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMeetings([]);
    setError(null);

    fetch(`${BASE_URL}/get_all_meetings`, {
      headers: getAuthHeaders(token, user.tenant_id),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch meetings`);
        return res.json();
      })
      .then((data) => {
        const mapped = (data || [])
        
          .sort(
            (a: any, b: any) =>
              new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          )
          .slice(0, 4) 
          .map((m: any) => ({
            id: m.id,
            title: m.name,
            date: formatDate(m.started_at),
            duration: getMeetingDuration(m.started_at, m.ended_at),
            status: m.state,
          }));

        setMeetings(mapped);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load meetings");
      })
      .finally(() => setIsLoading(false));

  }, [user?.tenant_id, token]); 

  const stats = [
    {
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Total meetings processed",
      value: "42",
      bgColor: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Follow-up Automated",
      value: "8",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Decisions tracked",
      value: "15",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Time saved this week",
      value: "4.5 hrs",
      bgColor: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "ended":
        return <span className={`${base} bg-teal-100 text-teal-800`}>Ready</span>;
      case "fatal_error":
        return <span className={`${base} bg-red-100 text-red-800`}>Failed</span>;
      case "joining":
        return <span className={`${base} bg-cyan-100 text-cyan-500`}>Joining</span>;
      case "joined_recording":
        return <span className={`${base} bg-cyan-100 text-cyan-800`}>Recording</span>;
      case "post_processing":
        return <span className={`${base} bg-gray-100 text-gray-800`}>Processing</span>;
      case "waiting_room":
        return <span className={`${base} bg-cyan-100 text-cyan-700`}>In Waiting Room</span>;
      case "scheduled":
        return <span className={`${base} bg-blue-100 text-blue-700`}>Scheduled</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  const getActionButton = (status: string, id: string) => {
    if (status === "fatal_error") {
      return (
        <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 transition-colors">
          <CircleX className="w-4 h-4" />
          Failed
        </button>
      );
    } else if (status === "joining") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-600 hover:text-cyan-700 cursor-wait transition-colors">
          <Ellipsis className="w-4 h-4" />
          Joining
        </div>
      );
    } 
    else if (status === "joined_recording" || status === "waiting_room") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 hover:text-teal-800 cursor-wait transition-colors">
          <VideoIcon className="w-4 h-4" />
          Recording
        </div>
      );
    } else if (status === "post_processing") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 hover:text-teal-800 cursor-wait transition-colors">
          <Loader className="w-4 h-4 animate-spin" />
          Processing
        </div>
      );
    } else if (status === "scheduled") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 hover:text-teal-800 cursor-wait transition-colors">
          <Clock className="w-4 h-4" />
          Scheduled
        </div>
      );
    } else {
      return (
        <button
          onClick={() => traverseToSummary(id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-600 hover:text-cyan-700 cursor-pointer transition-colors"
        >
          <Sparkle className="w-4 h-4" />
          Recap
        </button>
      );
    }
  };


  return (
    <div data-aos="fade-up" className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Your meetings, finally understood
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Here's what happened while you were busy building
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Recent Meetings
          </h2>
          <button
            onClick={() => navigate("/dashboard/meetings")}
            className="text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            View all →
          </button>
        </div>

        {isLoading && (
          <div className="px-6 py-12 flex items-center justify-center gap-3">
            <Loader className="w-5 h-5 animate-spin text-cyan-600" />
            <span className="text-gray-600 text-sm">Loading meetings…</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="px-6 py-12 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && meetings.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">
              No meetings yet. Start by creating a new meeting!
            </p>
          </div>
        )}

        {!isLoading && !error && meetings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-3 text-left">Title</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Duration</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <VideoIcon className="w-4 h-4" stroke="none" fill="darkcyan" />
                        </div>
                        <span className="font-medium text-gray-900 truncate">
                          {meeting.title || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 whitespace-nowrap">
                      {meeting.date}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 whitespace-nowrap">
                      {meeting.duration || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {getStatusBadge(meeting.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {getActionButton(meeting.status, meeting.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;