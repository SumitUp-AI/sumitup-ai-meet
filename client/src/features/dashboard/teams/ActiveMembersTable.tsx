/**
 * ActiveMembersTable Component
 * Shows two sections:
 *   1. Registered SumitUp users in the same tenant (if any)
 *   2. People who have been invited via email (pending/accepted/declined)
 */

import { useState } from "react";
import { Filter, LoaderCircle, Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import type { TeamMember } from "../../../types/team";
import type { TeamInvitation } from "../../../hooks/useTeamMembers";
import MemberRow from "./MemberRow";

interface ActiveMembersTableProps {
  members: TeamMember[];
  invitations: TeamInvitation[];
  loading: boolean;
  error: string | null;
}

const PAGE_SIZE = 5;

// Status badge for invitation rows
const InvitationStatusBadge: React.FC<{ status: TeamInvitation["status"] }> = ({ status }) => {
  const base = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (status) {
    case "pending":
      return <span className={`${base} bg-amber-100 text-amber-700`}><Clock className="w-3 h-3" />Pending</span>;
    case "accepted":
      return <span className={`${base} bg-green-100 text-green-700`}><CheckCircle className="w-3 h-3" />Accepted</span>;
    case "declined":
      return <span className={`${base} bg-red-100 text-red-600`}><XCircle className="w-3 h-3" />Declined</span>;
    case "expired":
      return <span className={`${base} bg-gray-100 text-gray-500`}><Clock className="w-3 h-3" />Expired</span>;
    default:
      return null;
  }
};

const ActiveMembersTable: React.FC<ActiveMembersTableProps> = ({
  members,
  invitations,
  loading,
  error,
}) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(members.length / PAGE_SIZE);
  const paginatedMembers = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasAnything = members.length > 0 || invitations.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Active Members</h2>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12">
          <LoaderCircle className="w-6 h-6 animate-spin text-cyan-600" />
          <span className="text-sm text-gray-500">Loading members...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !hasAnything && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-gray-400">No team members yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Use the invite panel to send meeting invitations.
          </p>
        </div>
      )}

      {/* ── Registered members section ── */}
      {!loading && !error && members.length > 0 && (
        <>
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Registered Members
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Member</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMembers.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{paginatedMembers.length}</span> of{" "}
              <span className="font-medium">{members.length}</span> members
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Invitations section ── */}
      {!loading && !error && invitations.length > 0 && (
        <>
          <div className="px-6 py-2 bg-gray-50 border-t border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Sent Invitations
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Meeting</th>
                <th className="px-6 py-3 text-left">Invited By</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  {/* Meeting info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inv.meeting_name}</p>
                        <p className="text-xs text-gray-400">{inv.meeting_platform}</p>
                      </div>
                    </div>
                  </td>

                  {/* Invited by */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {inv.invited_by_name}
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4">
                    <InvitationStatusBadge status={inv.status} />
                  </td>

                  {/* Sent date */}
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(inv.sent_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer count */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{invitations.length}</span> invitation{invitations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveMembersTable;