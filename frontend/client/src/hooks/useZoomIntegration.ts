import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../utils/apiHeaders";

export const useZoomIntegration = () => {
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
  const { token, user } = useAuth();

  // ─── Fetch Status ───────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!token || !user) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/zoom/status`, {
        headers: getAuthHeaders(token, user?.tenant_id),
      });
      const data = await res.json();
      setStatus(data.zoom_connected);
    } catch (err) {
      console.error("Failed to fetch Zoom status", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  // ─── Connect — just redirect, browser handles the rest ──────
  const connect = () => {
    window.location.href = `${BASE_URL}/zoom/authorize`;
  };

  // ─── Save tokens after OAuth callback ───────────────────────
  const saveTokens = useCallback(
    async (access_token: string, refresh_token: string) => {
      if (!token || !user) return;
      try {
        setSaving(true);
        await fetch(`${BASE_URL}/zoom/save-token`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(token, user?.tenant_id),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token, refresh_token }),
        });
        setStatus(true);
      } catch (err) {
        console.error("Failed to save Zoom token", err);
      } finally {
        setSaving(false);
      }
    },
    [token, user],
  );

  // ─── Disconnect ──────────────────────────────────────────────
  // const disconnect = useCallback(async () => {
  //     if (!token || !user) return
  //     try {
  //         await fetch(`${BASE_URL}/zoom/disconnect`, {
  //             method: "DELETE",
  //             headers: getAuthHeaders(token, user?.tenant_id)
  //         })
  //         setStatus(false)
  //     } catch (err) {
  //         console.error("Failed to disconnect Zoom", err)
  //     }
  // }, [token, user])

  // ─── Handle OAuth callback redirect ─────────────────────────
  useEffect(() => {
    if (!token || !user) return; // wait for auth

    const params = new URLSearchParams(window.location.search);
    if (params.get("zoom") === "connected") {
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        saveTokens(access_token, refresh_token);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [token, user, saveTokens]); // ← depends on token and user now

  // ─── Fetch status on mount ───────────────────────────────────
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, saving, connect, fetchStatus };
};
