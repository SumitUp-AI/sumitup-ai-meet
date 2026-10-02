/**
 * RecentActivity Component
 * Shows recent team activity feed at the bottom of the Teams page
 */

import { UserPlus, Settings, UserMinus } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "invite" | "update" | "remove";
  actor: string;
  action: string;
  target: string;
  time: string;
}

// Static placeholder data — replace with API data when available
const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "1",
    type: "invite",
    actor: "Sarah Chen",
    action: "invited",
    target: "Jason Lee",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "update",
    actor: "Marcus Thorne",
    action: "updated permissions for",
    target: "Project Alpha",
    time: "Yesterday at 4:30 PM",
  },
  {
    id: "3",
    type: "remove",
    actor: "Alex Rivera",
    action: "removed",
    target: "Inactive Guest",
    time: "3 days ago",
  },
];

// Icon per activity type
const getActivityIcon = (type: ActivityItem["type"]) => {
  const base = "w-9 h-9 rounded-full flex items-center justify-center shrink-0";
  switch (type) {
    case "invite":
      return (
        <div className={`${base} bg-cyan-50`}>
          <UserPlus className="w-4 h-4 text-cyan-600" />
        </div>
      );
    case "update":
      return (
        <div className={`${base} bg-blue-50`}>
          <Settings className="w-4 h-4 text-blue-600" />
        </div>
      );
    case "remove":
      return (
        <div className={`${base} bg-red-50`}>
          <UserMinus className="w-4 h-4 text-red-500" />
        </div>
      );
  }
};

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Recent Team Activity
        </h2>
        <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {ACTIVITY_ITEMS.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            {getActivityIcon(item.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{item.actor}</span>{" "}
                {item.action}{" "}
                <span className="font-semibold">{item.target}</span>
                {item.type === "invite" ? " to the team." : "."}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;