/**
 * Format ISO date string to readable format
 * Example: "2026-01-28T15:45:00Z" → "Jan 28, 2026, 3:45 PM"
 */
export const formatDate = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Date formatting error:", error);
    return isoDateString; // Return original if formatting fails
  }
};

/**
 * Get meeting duration in readable format
 * For now, returns a placeholder. Update based on your API response
 */
export const getMetingDuration = (): string => {
  return "N/A"; // You can calculate this from ended_at - started_at if available
};

/**
 * Get initials from participant names
 */
export const getInitials = (names: string[]): string[] => {
  return names.slice(0, 3).map((name) => name.charAt(0).toUpperCase());
};
