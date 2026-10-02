/**
 * InvitePanel Component
 * Left panel on the Teams page — lets you pick a meeting and invite
 * a registered SumitUp member to it via email.
 */

import { useState, useEffect } from "react";
import { UserPlus, Loader, ChevronDown } from "lucide-react";
import { useTeamMembers } from "../../../hooks/useTeamMembers";
import { useAuth } from "../../../context/AuthContext";
import { getAuthHeaders } from "../../../utils/apiHeaders";

interface Meeting {
  id: string;
  name: string;
  state: string;
}

interface InvitePanelProps {
  onInviteSent: () => void; // Refresh the members list after a successful invite
}

const ROLE_OPTIONS = ["Member", "Leader", "Admin"];

const InvitePanel: React.FC<InvitePanelProps> = ({ onInviteSent }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { sendInvitation } = useTeamMembers();
  const { token, user } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  // Placeholder seat data — wire to tenant settings when ready
  const seatsUsed = 12;
  const seatsTotal = 20;
  const seatsPercent = (seatsUsed / seatsTotal) * 100;

  // Load the user's meetings so they can pick which one to invite to
  useEffect(() => {
    if (!token || !user) return;

    fetch(`${BASE_URL}/get_all_meetings`, {
      headers: getAuthHeaders(token, user.tenant_id),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMeetings(data);
          if (data.length > 0) setSelectedMeetingId(data[0].id);
        }
      })
      .catch(() => setMeetings([]));
  }, [token, user, BASE_URL]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !selectedMeetingId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendInvitation([email], selectedMeetingId, undefined);
      setSuccess(`Invitation sent to ${email}`);
      setEmail("");
      onInviteSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Invite Form Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Invite Member</h2>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSendInvite} className="space-y-4">
          {/* Meeting picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Select Meeting
            </label>
            <div className="relative">
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                disabled={isLoading || meetings.length === 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white disabled:bg-gray-50"
              >
                {meetings.length === 0 ? (
                  <option value="">No meetings available</option>
                ) : (
                  meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || "Untitled Meeting"}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Must be a registered SumitUp member
            </p>
          </div>

          {/* Role picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Assign Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white disabled:bg-gray-50"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !selectedMeetingId}
            className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Send Invite"}
          </button>
        </form>

        {/* Seats progress */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Seats Remaining</span>
            <span className="text-xs font-semibold text-gray-700">{seatsUsed} / {seatsTotal}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-cyan-600 h-1.5 rounded-full transition-all"
              style={{ width: `${seatsPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Upgrade nudge ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <p className="text-sm font-semibold text-blue-900 mb-1">Need more seats?</p>
        <p className="text-xs text-blue-700 mb-3 leading-relaxed">
          Upgrade to the Enterprise plan for unlimited team members and advanced permission controls.
        </p>
        <button className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">
          Upgrade Plan →
        </button>
      </div>
    </div>
  );
};

export default InvitePanel;