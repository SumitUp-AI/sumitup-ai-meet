import { Upload, Folder, Video, Sparkles, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";

const NewMeetingPage: React.FC = () => {
  const [showGoogleMeetModal, setShowGoogleMeetModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  const handleGoogleMeetConnect = () => {
    setShowGoogleMeetModal(true);
  };

  const handleModalClose = () => {
    setShowGoogleMeetModal(false);
    setMeetingLink('');
  };

  const handleSubmitMeetingLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingLink.trim()) {
      // Handle the meeting link submission
      console.log('Meeting link:', meetingLink);
      handleModalClose();
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">New Meeting Session</h1>
            <p className="text-gray-600">Upload a recording or connect your calendar to get started with AI insights</p>
          </div>

          {/* File Upload Area */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 mb-8 text-center hover:border-blue-400 transition-colors">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag & drop video or audio files here</h3>
            <p className="text-gray-500 mb-6">Supports MP4, MOV, MP3, WAV up to 500MB</p>
            
            <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Folder className="w-5 h-5 mr-2" />
              Browse Files
            </button>
            
            <p className="text-xs text-gray-400 mt-4">AI Processing ~2 mins per hour of video</p>
          </div>

          {/* Import Options */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import directly from</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zoom Connect */}
              <button className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Connect Zoom</h4>
                      <p className="text-sm text-gray-500">Import cloud recordings automatically</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>

              {/* Google Meet Connect */}
              <button 
                onClick={handleGoogleMeetConnect}
                className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-green-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Connect Google Meet</h4>
                      <p className="text-sm text-gray-500">Sync from your calendar events</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </button>
            </div>
          </div>

          {/* Generate AI Summary Button */}
          <div className="text-center mb-8">
            <button className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Summary
            </button>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your data is encrypted (AES-256) and never used for training public models.</span>
          </div>
        </div>
      </div>

      {/* Google Meet Modal */}
      {showGoogleMeetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Google Meet</h3>
              <p className="text-gray-600">Enter your Google Meet link to import the recording</p>
            </div>

            <form onSubmit={handleSubmitMeetingLink} className="space-y-4">
              <div>
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Link
                </label>
                <input
                  id="meetingLink"
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Connect
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