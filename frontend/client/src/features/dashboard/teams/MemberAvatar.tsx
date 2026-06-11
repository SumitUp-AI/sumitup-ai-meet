/**
 * MemberAvatar Component
 * Displays user avatar with fallback initials
 */

interface MemberAvatarProps {
  name: string;
  profilePicture: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const MemberAvatar: React.FC<MemberAvatarProps> = ({
  name,
  profilePicture,
  size = "md",
}) => {
  // Generate initials from name (e.g. "John Doe" → "JD")
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-cyan-100 text-cyan-700 font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
};

export default MemberAvatar;