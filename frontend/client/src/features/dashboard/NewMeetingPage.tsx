import {
  Upload,
  Folder,
  Video,
  Shield,
  ChevronRight,
  Loader,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeeting } from "../../context/MeetingContext";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";
import GoogleMeetIcon from "../../assets/google-meet-svgrepo-com.svg";
import MSTeamsIcon from "../../assets/icons8-microsoft-teams-96.png";
import ZoomMeetIcon from "../../assets/zoomus-ar21.svg";
import InviteTeamModal from "../../components/InviteTeamModal";
import AOS from "aos";

const NewMeetingPage: React.FC = () => {

  useEffect(() => {
    AOS.refresh()
  }, [])

  const navigate = useNavigate();
  const { setCurrentMeeting } = useMeeting();
  const { token, user } = useAuth();
  
  // Modal States
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  // After a meeting is created, show the invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  const [createdMeetingName, setCreatedMeetingName] = useState<string>("");
  
  // Form States
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  // Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav'];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|mp3|wav)$/i)) {
      setUploadError("Invalid file type. Please upload MP4, MOV, MP3, or WAV.");
      return false;
    }
    if (file.size > maxSize) {
      setUploadError("File is too large. Maximum size is 500MB.");
      return false;
    }
    return true;
  };

  const processUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setUploadStatus('uploading');
    setUploadError(null);
    setUploadProgress(0);

    // Simulate upload progress
    const duration = 2000; // 2 seconds to simulate upload
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      setUploadProgress(Math.min((currentStep / steps) * 100, 99));
      
      if (currentStep >= steps) {
        clearInterval(progressTimer);
        completeUpload(file);
      }
    }, interval);
  };

  const completeUpload = async (file: File) => {
    try {
      if (!token || !user) throw new Error("Authentication required");

      const response = await fetch(`${BASE_URL}/create_meeting`, {
        method: "POST",
        headers: getAuthHeaders(token, user?.tenant_id),
        body: JSON.stringify({
          name: file.name,
          meeting_url: "local_upload_" + Date.now(), // Simulated URL
          provider: "upload" 
        }),
      });

      if (!response.ok) throw new Error("Failed to process uploaded file");

      const data = await response.json();
      
      setUploadProgress(100);
      setUploadStatus('success');
      
      setCurrentMeeting({
        id: data.meeting_id,
        name: file.name,
        meeting_link: "local_upload",
        state: "joining",
      });

      setTimeout(() => {
        navigate("/dashboard/meetings");
      }, 1000);

    } catch (err) {
      setUploadStatus('error');
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

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

      // Show the invite modal so the host can immediately invite team members
      setCreatedMeetingId(meetingId);
      setCreatedMeetingName(meetingTitle);
      setShowInviteModal(true);
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
      <div data-aos="fade-up" className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
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
          <div 
            className={`bg-white rounded-2xl border-2 border-dashed p-12 mb-8 text-center transition-colors relative
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              ${uploadStatus === 'error' ? 'border-red-400 bg-red-50' : ''}
              ${uploadStatus === 'success' ? 'border-green-400 bg-green-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file"
              accept=".mp4,.mov,.mp3,.wav,video/mp4,video/quicktime,audio/mpeg,audio/wav"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
            />

            {uploadStatus === 'idle' || uploadStatus === 'error' ? (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${uploadStatus === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag & drop files here</h3>
                <p className="text-gray-500 mb-6">Supports MP4, MOV, MP3, WAV up to 500MB</p>
                
                {uploadError && (
                  <div className="mb-4 text-sm font-medium text-red-600 bg-red-100/50 py-2 px-4 rounded-lg inline-block">
                    {uploadError}
                  </div>
                )}
                
                <div className="block">
                  <button type="button" className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors pointer-events-none">
                    <Folder className="w-5 h-5 mr-2" /> Browse Files
                  </button>
                </div>
              </>
            ) : (
              <div className="max-w-md mx-auto">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${uploadStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {uploadStatus === 'success' ? <Folder className="w-8 h-8" /> : <Loader className="w-8 h-8 animate-spin" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate px-4" title={selectedFile?.name}>
                  {selectedFile?.name}
                </h3>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 mt-6 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-300 ease-out ${uploadStatus === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {uploadStatus === 'success' ? 'Processing Complete' : `Uploading... ${Math.round(uploadProgress)}%`}
                </p>
              </div>
            )}
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

      {/* Invite Team Modal — shown after a meeting is successfully created */}
      {showInviteModal && createdMeetingId && (
        <InviteTeamModal
          meetingId={createdMeetingId}
          meetingName={createdMeetingName}
          onClose={() => {
            setShowInviteModal(false);
            navigate("/dashboard/meetings");
          }}
        />
      )}

      {/* Meeting link modal (Google Meet / Teams / Zoom) */}
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