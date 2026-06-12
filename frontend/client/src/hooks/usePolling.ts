import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval: number; // Polling interval in milliseconds
  enabled: boolean; // Whether polling is active
  immediate?: boolean; // Whether to call immediately on mount
}

export const usePolling = (
  callback: () => void | Promise<void>,
  options: UsePollingOptions
) => {
  const { interval, enabled, immediate = true } = options;
  const intervalRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (enabled) {
      // Call immediately if requested
      if (immediate) {
        callbackRef.current();
      }

      // Set up interval
      intervalRef.current = window.setInterval(() => {
        callbackRef.current();
      }, interval);
    }
  }, [interval, enabled, immediate]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return { startPolling, stopPolling };
};