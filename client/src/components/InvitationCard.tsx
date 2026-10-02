/**
 * InvitationCard Component
 * Displays a single received invitation with accept/decline buttons.
 * Used on the invitation response pages (/invitation/accept and /invitation/decline).
 */

import { CheckCircle, XCircle, Clock, Loader } from "lucide-react";

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface Invitation {
  id: string;
  meeting_name: string;
  meeting_platform: string;
  invited_by_name: string;
  custom_message: string | null;
  status: InvitationStatus;
  sent_at: string;
  expires_at: string;
}

interface InvitationCardProps {
  invitation: Invitation;
  isLoading?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

// Platform display name mapping
const PLATFORM_LABELS: Record<string, string> = {
  GMEET: "Google Meet",
  ZOOM: "Zoom",
  MSTEAMS: "Microsoft Teams",
};

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  isLoading = false,
  onAccept,
  onDecline,
}) => {
  const isPending = invitation.status === "pending";
  const isExpired = invitation.status === "expired";
  const platformLabel = PLATFORM_LABELS[invitation.meeting_platform] || invitation.meeting_platform;

  // Format the sent date nicely
  const sentDate = new Date(invitation.sent_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-md w-full">
      {/* ── Header ── */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Meeting Invitation</h2>
        <p className="text-sm text-gray-500 mt-1">from SumitUp</p>
      </div>

      {/* ── Meeting Details ── */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Meeting</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{invitation.meeting_name}</p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Platform</p>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {platformLabel}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Invited by</p>
            <p className="text-sm text-gray-700 mt-0.5">{invitation.invited_by_name}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Sent</p>
          <p className="text-sm text-gray-600 mt-0.5">{sentDate}</p>
        </div>
      </div>

      {/* ── Custom Message ── */}
      {invitation.custom_message && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-amber-700 mb-1">Personal Message</p>
          <p className="text-sm text-amber-800 italic">"{invitation.custom_message}"</p>
        </div>
      )}

      {/* ── Status / Actions ── */}
      {invitation.status === "accepted" && (
        <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Invitation Accepted</span>
        </div>
      )}

      {invitation.status === "declined" && (
        <div className="flex items-center justify-center gap-2 py-3 bg-red-50 rounded-xl text-red-600">
          <XCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Invitation Declined</span>
        </div>
      )}

      {isExpired && (
        <div className="flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-gray-500">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-semibold">Invitation Expired</span>
        </div>
      )}

      {isPending && (
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Accept
          </button>
        </div>
      )}

      {/* Footer note */}
      <p className="text-xs text-center text-gray-400 mt-4">
        This invitation expires on{" "}
        {new Date(invitation.expires_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
};

export default InvitationCard;