import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader } from "lucide-react";

interface Summary {
  summary: string;
  dated_at?: string;
  organization?: string;
}

const SummaryPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!meetingId) {
        setError("Meeting ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch meeting details first to get transcript
        const meetingResponse = await fetch(
          `http://localhost:3000/api/v1/get_meeting_status/${meetingId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!meetingResponse.ok) {
          throw new Error("Failed to fetch meeting details");
        }

        const meetingData = await meetingResponse.json();

        // If we have transcripts in the meeting data, generate summary
        if (meetingData.transcripts && meetingData.transcripts.length > 0) {
          const summaryResponse = await fetch(
            `http://localhost:3000/api/v1/create_summary`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                transcript: meetingData.transcripts,
              }),
            }
          );

          if (!summaryResponse.ok) {
            throw new Error("Failed to generate summary");
          }

          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        } else {
          setError("No transcripts available for this meeting yet");
        }
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
  }, [meetingId]);

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
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meeting Summary
          </h1>

          {error ? (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          ) : summary ? (
            <div className="mt-6 space-y-4">
              {summary.dated_at && (
                <div className="text-sm text-gray-500">
                  <strong>Date:</strong> {summary.dated_at}
                </div>
              )}
              {summary.organization && (
                <div className="text-sm text-gray-500">
                  <strong>Organization:</strong> {summary.organization}
                </div>
              )}
              <div className="mt-6 prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {summary.summary}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">No summary available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
