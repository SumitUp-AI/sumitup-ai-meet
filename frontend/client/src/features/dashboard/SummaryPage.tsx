import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CircleXIcon,
  Loader,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  HelpCircle,
  Tag,
} from "lucide-react";
import GoogleMeetIcon from "../../../public/google-meet-svgrepo-com.svg";
import MicrosoftTeamsIcon from "../../../public/icons8-microsoft-teams-96.png";
import ZoomIcon from "../../../public/zoom.avif";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionItem {
  title: string;
  assignee?: string | null;
  deadline?: string | null;
  description?: string | null;
  confidence: number;
}

interface OpenQuestion {
  text: string;
  asked_by?: string | null;
  timestamp?: string | null;
}

interface Decision {
  text: string;
  context?: string | null;
}

interface Summary {
  summary: string;
  title: string;
  platform?: string;
  duration?: string;
  host?: string;
  key_topics?: string[];
  decisions?: Decision[];
  action_items?: ActionItem[];
  open_questions?: OpenQuestion[];
  started_at?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ w = "100%", h = "1rem" }: { w?: string; h?: string }) => (
  <div
    style={{ width: w, height: h }}
    className="rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
  />
);

// ─── Badge ────────────────────────────────────────────────────────────────────

const PlatformBadge = ({ platform }: { platform?: string }) => {
  const label = platform?.toUpperCase() ?? "RECORDING";
  const colors: Record<string, string> = {
    ZOOM: "bg-cyan-100 text-cyan-700",
    GMEET: "bg-green-100 text-green-700",
    MSTEAMS: "bg-purple-100 text-purple-700",
  };
  const cls = colors[label] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-widest ${cls}`}>
      {label} RECORDING
    </span>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50">
    <p className="text-sm text-gray-400 italic">{label}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const SummaryPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "summary" | "transcript" | "flowDiagram" | "actionItems" | "aiChat"
  >("summary");

  const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

  const fetchSummary = async () => {
    if (!meetingId || !user || !token) {
      setError(!meetingId ? "Meeting ID not provided" : "User not authenticated");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/create_summary?meeting_id=${meetingId}`, {
        headers: getAuthHeaders(token, user.tenant_id),
      });
      if (!res.ok) throw new Error("Failed to generate summary.");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [meetingId, user, token]);

  const handleCopy = () => {
    if (summary?.summary) {
      navigator.clipboard.writeText(summary.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Error state ──────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-4 max-w-md w-full border-l-4 border-red-500">
          <CircleXIcon className="w-12 h-12 text-red-500" />
          <p className="text-red-600 text-center font-semibold text-lg">
            Failed to Process Meeting Summary
          </p>
          <p className="text-gray-500 text-sm text-center">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Tabs config ──────────────────────────────────────────────────────────────

  const tabs = [
    { key: "summary", label: "Summary" },
    { key: "transcript", label: "Transcript" },
    { key: "flowDiagram", label: "Flow Diagram" },
    {
      key: "actionItems",
      label: "Action Items",
      count: summary?.action_items?.length,
    },
    { key: "aiChat", label: "✦ AI Chat" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Top nav ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Meeting header ── */}
        <div className="mb-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton w="120px" h="1.25rem" />
              <Skeleton w="60%" h="2.25rem" />
              <Skeleton w="40%" h="1rem" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <PlatformBadge platform={summary?.platform} />
                {summary?.started_at && (
                  <span className="text-sm text-gray-400">
                    {new Date(summary.started_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {summary?.duration && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-400">{summary.duration}</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {summary?.title ?? "Meeting Summary"}
              </h1>

              {summary?.host && (
                <p className="text-sm text-gray-500 mt-1">
                  Host:{" "}
                  <span className="font-semibold text-cyan-600">{summary.host}</span>
                </p>
              )}

              {/* Share / Export */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={fetchSummary}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-cyan-600 text-cyan-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {"count" in tab && tab.count != null && tab.count > 0 && (
                <span className="ml-1.5 bg-cyan-100 text-cyan-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Executive Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-500 text-lg">✦</span>
                    <h2 className="text-lg font-bold text-gray-900">
                      Executive Summary
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                      title="Copy summary"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={fetchSummary}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <Skeleton />
                    <Skeleton w="90%" />
                    <Skeleton w="95%" />
                    <Skeleton w="80%" />
                  </div>
                ) : summary?.summary ? (
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                ) : (
                  <EmptyState label="No summary available yet." />
                )}
              </div>

              {/* Decisions Tracked (was "Decisions Made" in screenshot) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Decisions Tracked
                  </h2>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <Skeleton h="3rem" />
                    <Skeleton h="3rem" />
                  </div>
                ) : summary?.decisions && summary.decisions.length > 0 ? (
                  <div className="space-y-3">
                    {summary.decisions.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {d.text}
                          </p>
                          {d.context && (
                            <p className="text-xs text-cyan-500 mt-0.5">
                              {d.context}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label="No decisions tracked for this meeting." />
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Key Topics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Key Topics
                  </h3>
                </div>

                {loading ? (
                  <div className="flex flex-wrap gap-2">
                    {[80, 100, 70, 90, 60].map((w, i) => (
                      <Skeleton key={i} w={`${w}px`} h="1.75rem" />
                    ))}
                  </div>
                ) : summary?.key_topics && summary.key_topics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {summary.key_topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition cursor-default"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No topics detected.
                  </p>
                )}
              </div>

              {/* Open Questions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Open Questions
                  </h3>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <Skeleton h="3.5rem" />
                    <Skeleton h="3.5rem" />
                  </div>
                ) : summary?.open_questions &&
                  summary.open_questions.length > 0 ? (
                  <div className="space-y-3">
                    {summary.open_questions.map((q, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50 border border-orange-100"
                      >
                        <HelpCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800">{q.text}</p>
                          {(q.asked_by || q.timestamp) && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {q.asked_by && `Asked by ${q.asked_by}`}
                              {q.asked_by && q.timestamp && " • "}
                              {q.timestamp}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No open questions recorded.
                  </p>
                )}

                <button className="mt-4 w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
                  Ask AI a question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Action Items tab ── */}
        {activeTab === "actionItems" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-gray-900">Action Items</h2>
              {summary?.action_items && summary.action_items.length > 0 && (
                <span className="ml-auto text-sm text-gray-400">
                  {summary.action_items.length} item
                  {summary.action_items.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} h="4rem" />
                ))}
              </div>
            ) : summary?.action_items && summary.action_items.length > 0 ? (
              <div className="space-y-3">
                {summary.action_items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50 transition"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {item.assignee && (
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                            {item.assignee}
                          </span>
                        )}
                        {item.deadline && (
                          <span className="text-xs text-gray-400">
                            Due: {item.deadline}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.confidence >= 0.7
                              ? "bg-green-100 text-green-700"
                              : item.confidence >= 0.5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No action items identified for this meeting." />
            )}
          </div>
        )}

        {/* ── Transcript tab ── */}
        {activeTab === "transcript" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Transcript</h2>
            <EmptyState label="Transcript view coming soon." />
          </div>
        )}

        {/* ── Flow Diagram tab ── */}
        {activeTab === "flowDiagram" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Flow Diagram
            </h2>
            <EmptyState label="Visual flow diagram coming soon." />
          </div>
        )}

        {/* ── AI Chat tab ── */}
        {activeTab === "aiChat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">AI Chat</h2>
            <EmptyState label="AI chat across meetings coming soon." />
          </div>
        )}

        {/* ── Global loading overlay ── */}
        {loading && (
          <div className="fixed bottom-6 right-6 bg-white shadow-lg border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-2.5 z-50">
            <Loader className="w-4 h-4 text-cyan-500 animate-spin" />
            <p className="text-sm text-gray-600 font-medium">
              Generating summary…
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPage;