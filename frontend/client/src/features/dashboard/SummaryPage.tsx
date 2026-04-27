import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, CircleXIcon, Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";
import AOS from "aos";

interface Summary {
  summary: string;
  title: string;
}

interface SkeletonLoaderProps {
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ lines = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

const SummaryPage: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

  useEffect(() => {
    const fetchSummary = async () => {
      if (!meetingId) {
        setError("Meeting ID not provided");
        setLoading(false);
        return;
      }

      if (!user || !token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${BASE_URL}/create_summary?meeting_id=${meetingId}`,
          {
            method: "GET",
            headers: getAuthHeaders(token, user.tenant_id),
          }
        );

        if (!response.ok) {
          throw new Error("Meeting Transcription Failed!");
        }

        const data = await response.json();
        setSummary({
          summary: data.summary,
          title: data.title,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [meetingId, user, token]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div
          data-aos="zoom-in"
          className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-md w-full border-l-4 border-red-500"
        >
          <CircleXIcon className="w-12 h-12 text-red-500" />
          <p className="text-red-600 text-center font-semibold text-lg">
            Failed to Process Meeting Summary
          </p>
          <p className="text-gray-600 text-sm text-center">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-cyan-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 transition-all rounded-lg font-medium group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading ? (
            <div className="space-y-6">
              {/* Summary Section Skeleton */}
              <div
                data-aos="fade-up"
                className="bg-white rounded-xl shadow-md p-8 border-t-4 border-cyan-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 bg-cyan-200 rounded-lg animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-lg w-48 animate-pulse" />
                </div>
                <SkeletonLoader lines={6} />
              </div>

              {/* Action Items Section Skeleton */}
              <div
                data-aos="fade-up"
                className="bg-white rounded-xl shadow-md p-8 border-t-4 border-cyan-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 bg-cyan-200 rounded-lg animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-lg w-64 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Visualization Section Skeleton */}
              <div
                className="bg-white rounded-xl shadow-md p-8 border-t-4 border-cyan-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 bg-cyan-200 rounded-lg animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-lg w-56 animate-pulse" />
                </div>
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg animate-pulse" />
              </div>

              {/* Loading Indicator */}
              <div className="flex justify-center items-center gap-3 py-8">
                <Loader className="w-6 h-6 text-cyan-600 animate-spin" />
                <p className="text-cyan-600 font-semibold">Generating summary...</p>
              </div>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Summary Section */}
              <div
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border-t-4 border-cyan-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Meeting Summary
                  </h1>
                </div>

                <div className="space-y-6">
                  {/* Title Section */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wide mb-2">
                      Title
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {summary.title}
                    </h2>
                  </div>

                  {/* Summary Content */}
                  <div className="bg-cyan-50 p-6 max-h-96 overflow-y-auto">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                      Summary Details
                    </p>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap font-medium">
                      {summary.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Items Section */}
              <div
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border-t-4 border-cyan-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Action Items
                  </h2>
                </div>

                <div className="bg-cyan-50 rounded-lg p-6 border border-cyan-200 text-center">
                  <p className="text-cyan-700 font-semibold">
                    Action items will be displayed here
                  </p>
                </div>
              </div>

              {/* Visualization Section */}
              <div
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-8 border-t-4 border-cyan-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Visualized Overview
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-12 border border-cyan-200 flex items-center justify-center min-h-80">
                  <canvas className="w-full h-full" />
                  <p className="text-cyan-600 font-semibold text-center absolute">
                    Visualization will appear here
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              data-aos="zoom-in"
              className="bg-white rounded-xl shadow-md p-8 border-l-4 border-yellow-500 text-center"
            >
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-yellow-700 font-semibold text-lg">
                No summary available yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
