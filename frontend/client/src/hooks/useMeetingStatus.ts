import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuthHeaders } from '../utils/apiHeaders';
import { usePolling } from './usePolling';

interface Meeting {
  id: string;
  name: string;
  platform: string;
  meeting_link: string;
  started_at: string | null;
  ended_at: string | null;
  state: string;
}

interface UseMeetingStatusOptions {
  pollingInterval?: number; // Default: 5 seconds
  enabled?: boolean; // Default: true
}

export const useMeetingStatus = (options: UseMeetingStatusOptions = {}) => {
  const { pollingInterval = 5000, enabled = true } = options;
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  
  // Track previous states to detect changes
  const previousStatesRef = useRef<Map<string, string>>(new Map());
  
  // Use ref for callback to avoid stale closure
  const onStatusChangeRef = useRef<((meetings: Meeting[]) => void) | null>(null);

  const fetchMeetings = useCallback(async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/get_all_meetings`, {
        method: "GET",
        headers: getAuthHeaders(token, user.tenant_id),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch meetings: ${response.status}`);
      }

      const data: Meeting[] = await response.json();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data:', data);
        setMeetings([]);
        return;
      }
      
      // Check for status changes
      const currentStates = new Map<string, string>();
      const changedMeetings: Meeting[] = [];
      
      data.forEach(meeting => {
        currentStates.set(meeting.id, meeting.state);
        const previousState = previousStatesRef.current.get(meeting.id);
        
        if (previousState && previousState !== meeting.state) {
          changedMeetings.push(meeting);
          console.log(`Meeting ${meeting.name} status changed: ${previousState} → ${meeting.state}`);
        }
      });
      
      // Update previous states
      previousStatesRef.current = currentStates;
      
      setMeetings(data);
      
      // Optional: Trigger callbacks for status changes
      if (changedMeetings.length > 0 && onStatusChangeRef.current) {
        onStatusChangeRef.current(changedMeetings);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meetings';
      setError(errorMessage);
      console.error('Error fetching meetings:', err);
      // Set empty array on error to prevent null issues
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [token, user, BASE_URL]);

  // Set up polling
  const { startPolling, stopPolling } = usePolling(fetchMeetings, {
    interval: pollingInterval,
    enabled: enabled && !!token && !!user,
    immediate: true
  });

  const refreshMeetings = useCallback(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const setOnStatusChange = useCallback((callback: ((meetings: Meeting[]) => void) | null) => {
    onStatusChangeRef.current = callback;
  }, []);

  return {
    meetings,
    loading,
    error,
    refreshMeetings,
    startPolling,
    stopPolling,
    setOnStatusChange
  };
};