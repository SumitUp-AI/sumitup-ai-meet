/**
 * InviteTeamModal Component
 * A modal that pops up after meeting creation (or from the meetings list)
 * so the host can quickly invite registered SumitUp members to a meeting.
 *
 * Phase 3.2 / Phase 4.1 — used in NewMeetingPage after a meeting is created.
 */

import { useState } from "react";
import { X, UserPlus, Loader, Plus, Trash2 } from "lucide-react";
import { useTeamMembers } from "../hooks/useTeamMembers";

interface InviteTeamModalProps {
  meetingId: string;       // The meeting to invite people to
  meetingName: string;     // Shown in the modal header
  onClose: () => void;     // Called when the user dismisses the modal
}

const InviteTeamModal: React.FC<InviteTeamModalProps> = ({
  meetingId,
  meetingName,
  onClose,
}) => {
  // Start with one empty email row — user can add more
  const [emails, setEmails] = useState<string[]>([""]);
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { sendInvitation } = useTeamMembers();

  // Add another email input row
  const addEmailRow = () => setEmails((prev) => [...prev, ""]);

  // Remove a specific email row
  const removeEmailRow = (index: number) =>
    setEmails((prev) => prev.filter((_, i) => i !== index));

  // Update a specific email row value
  const updateEmail = (index: number, value: string) =>
    setEmails((prev) => prev.map((e, i) => (i === index ? value : e)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty rows before sending
    const validEmails = emails.filter((e) => e.trim() !== "");
    if (validEmails.length === 0) {
      setError("Please enter at least one email address");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendInvitation(
        validEmails,
        meetingId,
        customMessage.trim() || undefined
      );
      setSuccess(
        `${result.invitations_sent} invitation${result.invitations_sent !== 1 ? "s" : ""} sent successfully!`
      );
      // Reset form after success
      setEmails([""]);
      setCustomMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitations");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-50 rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Invite Team Members</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-55">{meetingName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Feedback */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Email rows */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Addresses
            </label>
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="colleague@company.com"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all disabled:bg-gray-50"
                  />
                  {/* Only show remove button if there's more than one row */}
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailRow(index)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add another email */}
            <button
              type="button"
              onClick={addEmailRow}
              disabled={isLoading}
              className="mt-2 flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another email
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Only registered SumitUp members can be invited.
            </p>
          </div>

          {/* Optional personal message */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Personal Message <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Hey! Join our meeting to discuss the project updates..."
              rows={3}
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none disabled:bg-gray-50"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {success ? "Close" : "Skip for now"}
            </button>
            {!success && (
              <button
                type="submit"
                disabled={isLoading || emails.every((e) => !e.trim())}
                className="flex-1 px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Send Invites"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteTeamModal;