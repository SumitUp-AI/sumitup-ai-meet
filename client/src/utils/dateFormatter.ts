/**
 * Format ISO date string to user's local timezone and regional format
 * Automatically detects browser timezone and language
 */
export const formatDate = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat(navigator.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error("Date formatting error:", error);
    return isoDateString;
  }
};

/**
 * Get meeting duration in readable format
 */
export const getMeetingDuration = (startedAt?: string, endedAt?: string): string => {
  if (!startedAt || !endedAt) return "N/A";
  try {
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";
    
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) return `${hours}h ${remainingMinutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return "< 1m";
  } catch {
    return "N/A";
  }
};

/**
 * Get initials from participant names
 */
export const getInitials = (names: string[]): string[] => {
  return names.slice(0, 3).map((name) => name.charAt(0).toUpperCase());
};