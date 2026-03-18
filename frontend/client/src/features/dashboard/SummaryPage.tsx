import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";

interface Summary {
  summary: string;
  dated_at?: string;
  title?: string;
}

const SummaryPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:3000/api/v1"

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

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Generating summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="w-full mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <button
          // Fixed navigation path
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-blue-600">Back to Dashboard</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Overall Meeting Summary
          </h1>

          {error ? (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          ) : summary ? (
            <div className="mt-6 space-y-4">
              {summary.title && (
                <div className="text-sm text-gray-800">
                  <strong>Title :</strong> {summary.title}
                </div>
              )}
              {summary.dated_at && (
                <div className="text-sm text-gray-800">
                  <strong>Date:</strong> {summary.dated_at}
                </div>
              )}
              <div className="mt-6 prose prose-sm max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {summary.summary}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">No summary available yet</p>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-3">
            Action Items (Todo Detected)
          </h1>
          {/* Action Items here */}
          </div>
          <div className="flex items-center justify-content-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-3">
              Visualized Overview
            </h1>
            <canvas>
              {/* Canvas Here for visualized summary */}
            </canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
