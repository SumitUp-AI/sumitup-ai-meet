/**
 * MemberRow Component
 * Renders a single team member row in the Active Members table
 */

import { MoreVertical } from "lucide-react";
import type { TeamMember } from "../../../types/team";
import MemberAvatar from "./MemberAvatar";

interface MemberRowProps {
  member: TeamMember;
}

const MemberRow: React.FC<MemberRowProps> = ({ member }) => {
  // Role badge styling
  const getRoleBadge = (role: string) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (role.toUpperCase()) {
      case "ADMIN":
        return <span className={`${base} bg-purple-100 text-purple-700`}>Admin</span>;
      case "LEADER":
        return <span className={`${base} bg-blue-100 text-blue-700`}>Leader</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-600`}>Member</span>;
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Member info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <MemberAvatar name={member.name} profilePicture={member.profile_picture} />
          <div>
            <p className="text-sm font-medium text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-400">{member.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">{getRoleBadge(member.role)}</td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              member.is_active ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-gray-600">
            {member.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </td>
    </tr>
  );
};

export default MemberRow;