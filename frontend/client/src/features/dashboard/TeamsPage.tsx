/**
 * TeamsPage
 * Main page for managing team members and sending meeting invitations
 * Matches the design: Invite panel (left) + Active Members table (right)
 * + Recent Activity + Workspace Insight at the bottom
 */

import { useEffect } from "react";
import AOS from "aos";
import { useTeamMembers } from "../../hooks/useTeamMembers";
import InvitePanel from "./teams/InvitePanel";
import ActiveMembersTable from "./teams/ActiveMembersTable";
import RecentActivity from "./teams/RecentActivity";
import WorkspaceInsight from "./teams/WorkspaceInsight";

const TeamsPage: React.FC = () => {
  // Refresh AOS animations on mount
  useEffect(() => {
    AOS.refresh();
  }, []);

  const { members, invitations, loading, error, fetchMembers } = useTeamMembers();

  // Fetch members on mount
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div data-aos="fade-up">
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your team members and invites to collaborate effectively.
          </p>
        </div>

        {/* ── Top Section: Invite Panel + Active Members ── */}
        <div
          data-aos="fade-up"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left: Invite Panel (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <InvitePanel onInviteSent={fetchMembers} />
          </div>

          {/* Right: Active Members Table (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <ActiveMembersTable
              members={members}
              invitations={invitations}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* ── Bottom Section: Recent Activity + Workspace Insight ── */}
        <div
          data-aos="fade-up"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Recent Activity (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Workspace Insight (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <WorkspaceInsight />
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamsPage;