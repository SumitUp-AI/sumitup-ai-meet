/**
 * InvitationResponsePage
 * Handles both accept and decline flows from the email invitation links.
 *
 * Routes:
 *   /invitation/accept?token=xxx  → auto-accepts and shows confirmation
 *   /invitation/decline?token=xxx → auto-declines and shows confirmation
 *
 * Phase 4.2 — Integration point for email invitation links.
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader, ArrowRight } from "lucide-react";
import InvitationCard, { type Invitation } from "../components/InvitationCard";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

type PageState = "loading" | "ready" | "submitting" | "success" | "error";

const InvitationResponsePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  // Determine intent from the URL path (/accept or /decline)
  const isAccept = window.location.pathname.includes("/accept");
  const responseType = isAccept ? "accept" : "decline";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  // If not logged in, redirect to login and come back after
  useEffect(() => {
    if (!authLoading && !user) {
      const returnPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(returnPath)}`, { replace: true });
    }
  }, [authLoading, user, navigate]);

  // On mount, fetch the invitation details using the token
  useEffect(() => {
    if (!token) {
      setErrorMessage("Invalid invitation link — no token found.");
      setPageState("error");
      return;
    }

    // Wait until auth is resolved before fetching
    if (authLoading || !user) return;

    // Fetch invitation details from the backend
    fetch(`${BASE_URL}/team/invitation/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invitation not found or already responded to.");
        return res.json();
      })
      .then((data) => {
        setInvitation(data);
        setPageState("ready");
      })
      .catch((err) => {
        setErrorMessage(err.message || "Failed to load invitation.");
        setPageState("error");
      });
  }, [token, authLoading, user]);

  // Submit the accept/decline response
  const handleRespond = async () => {
    if (!token) return;

    setPageState("submitting");

    try {
      const res = await fetch(`${BASE_URL}/team/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitation_token: token, response: responseType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to respond to invitation.");
      }

      setPageState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setPageState("error");
    }
  };

  // Auto-submit when the page loads and we have a valid token
  useEffect(() => {
    if (pageState === "ready" && invitation?.status === "pending") {
      handleRespond();
    }
  }, [pageState]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Loading state */}
        {(pageState === "loading" || pageState === "submitting") && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <Loader className="w-10 h-10 animate-spin text-cyan-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {pageState === "loading" ? "Loading invitation..." : `${isAccept ? "Accepting" : "Declining"} invitation...`}
            </p>
          </div>
        )}

        {/* Ready state — show the invitation card */}
        {pageState === "ready" && invitation && (
          <InvitationCard
            invitation={invitation}
            isLoading={false}
            onAccept={isAccept ? handleRespond : undefined}
            onDecline={!isAccept ? handleRespond : undefined}
          />
        )}

        {/* Success state */}
        {pageState === "success" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isAccept ? "bg-green-100" : "bg-gray-100"}`}>
              {isAccept
                ? <CheckCircle className="w-8 h-8 text-green-600" />
                : <XCircle className="w-8 h-8 text-gray-500" />
              }
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isAccept ? "You're in!" : "Invitation Declined"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isAccept
                ? "You've accepted the meeting invitation. Check your SumitUp dashboard for details."
                : "You've declined the invitation. The meeting host has been notified."
              }
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Error state */}
        {pageState === "error" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* SumitUp branding footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 SumitUp-Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default InvitationResponsePage;