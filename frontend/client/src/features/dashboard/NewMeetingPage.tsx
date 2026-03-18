import {
  Upload,
  Folder,
  Video,
  Shield,
  ChevronRight,
  Loader,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeeting } from "../../context/MeetingContext";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";
import GoogleMeetIcon from "../../../public/google-meet-svgrepo-com.svg";
import MSTeamsIcon from "../../../public/icons8-microsoft-teams-96.png";
import ZoomMeetIcon from "../../../public/zoomus-ar21.svg";
const NewMeetingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentMeeting } = useMeeting();
  const { token, user } = useAuth();
  
  // Modal States
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  
  // Form States
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:3000/api/v1";

  const handleModalClose = () => {
    setShowMeetModal(false);
    setShowZoomModal(false);
    setMeetingLink("");
    setMeetingTitle("");
    setError(null);
  };

  const handleSubmitMeetingLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingLink.trim() || !meetingTitle.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!token || !user) {
        setError("Token or User must not be null!");
        return;
      }
        
      const response = await fetch(
        `${BASE_URL}/create_meeting`,
        {
          method: "POST",
          headers: getAuthHeaders(token, user?.tenant_id),
          body: JSON.stringify({
            name: meetingTitle,
            meeting_url: meetingLink,
            provider: "assemblyai" 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create meeting");
      }

      const data = await response.json();
      const meetingId = data.meeting_id;

      setCurrentMeeting({
        id: meetingId,
        name: meetingTitle,
        meeting_link: meetingLink,
        state: "joining",
      });

      handleModalClose();

      setTimeout(() => {
        navigate("/dashboard/meetings");
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error creating meeting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              New Meeting Session
            </h1>
            <p className="text-gray-600">
              Upload a recording or connect your calendar to get started with AI insights
            </p>
          </div>

          {/* File Upload Area */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 mb-8 text-center hover:border-blue-400 transition-colors">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag & drop files here</h3>
            <p className="text-gray-500 mb-6">Supports MP4, MOV, MP3, WAV up to 500MB</p>
            <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Folder className="w-5 h-5 mr-2" /> Browse Files
            </button>
          </div>

          {/* Import Options */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Platform, Start from here</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zoom Connect */}
              <button 
                onClick={() => setShowZoomModal(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-cyan-600 rounded-sm flex items-center justify-center">
                      <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Zoom Video Call</h4>
                      <p className="text-sm text-gray-500">Enter Zoom Link to get started</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>

              {/* Google Meet / Teams Connect */}
              <button
                onClick={() => setShowMeetModal(true)}
                className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-cyan-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-cyan-600 rounded-sm flex items-center justify-center">
                      <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Google Meet or MS Teams</h4>
                      <p className="text-sm text-gray-500">Enter Meeting Link to get started</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                </div>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your data is encrypted (AES-256) and never used for training models.</span>
          </div>
        </div>
      </div>

      {/* Shared Modal Logic */}
      {(showMeetModal || showZoomModal) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                {showZoomModal ? (
                   <div className="p-2">
                      <img src={ZoomMeetIcon} width={88} alt="Zoom" />
                    </div>
                ) : (
                  <>
                    <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-100">
                      <img src={GoogleMeetIcon} width={32} alt="Google Meet" />
                    </div>
                    <span className="text-gray-400 font-medium">or</span>
                    <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                      <img src={MSTeamsIcon} width={32} alt="MS Teams" />
                    </div>
                  </>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {showZoomModal ? "Connect Zoom Meeting" : "Connect Meet or Teams"}
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitMeetingLink} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder={showZoomModal ? "https://zoom.us/j/..." : "https://meet.google.com/..."}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Q4 Strategy Sync"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-shadow shadow-lg shadow-cyan-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    "Join Meeting"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NewMeetingPage;