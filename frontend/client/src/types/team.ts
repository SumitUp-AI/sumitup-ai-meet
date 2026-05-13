/**
 * Team-related TypeScript interfaces
 * Centralized types used across team components and hooks
 */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  profile_picture: string | null;
  last_login: string | null;
  is_active: boolean;
  role: string;
}