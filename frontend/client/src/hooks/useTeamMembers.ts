/**
 * useTeamMembers Hook
 * Fetches team members (registered users) AND meeting invitations.
 * The Teams page shows both — who's already on SumitUp and who's been invited.
 */

import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../utils/apiHeaders";
import type { TeamMember } from "../types/team";

export type { TeamMember };

// Shape of an invitation returned by GET /api/v1/team/invitations
export interface TeamInvitation {
  id: string;
  meeting_name: string;
  meeting_platform: string;
  invited_by_name: string;
  custom_message: string | null;
  status: "pending" | "accepted" | "declined" | "expired";
  sent_at: string;
  expires_at: string;
}

export const useTeamMembers = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token, user } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

  // Fetch both registered members and sent invitations in parallel
  const fetchMembers = useCallback(async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders(token, user.tenant_id);

      // Run both requests at the same time
      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`${BASE_URL}/team/members`, { method: "GET", headers }),
        fetch(`${BASE_URL}/team/invitations`, { method: "GET", headers }),
      ]);

      // Parse members
      if (membersRes.ok) {
        const data: TeamMember[] = await membersRes.json();
        setMembers(Array.isArray(data) ? data : []);
      } else {
        setMembers([]);
      }

      // Parse invitations — don't fail the whole page if this errors
      if (invitationsRes.ok) {
        const data: TeamInvitation[] = await invitationsRes.json();
        setInvitations(Array.isArray(data) ? data : []);
      } else {
        setInvitations([]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team data");
      setMembers([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [token, user, BASE_URL]);

  const sendInvitation = useCallback(
    async (emails: string[], meetingId: string, customMessage?: string) => {
      if (!token || !user) throw new Error("Not authenticated");

      const response = await fetch(`${BASE_URL}/team/invite`, {
        method: "POST",
        headers: getAuthHeaders(token, user.tenant_id),
        body: JSON.stringify({
          meeting_id: meetingId,
          user_emails: emails,
          custom_message: customMessage || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send invitations");
      }

      return await response.json();
    },
    [token, user, BASE_URL]
  );

  return { members, invitations, loading, error, fetchMembers, sendInvitation };
};