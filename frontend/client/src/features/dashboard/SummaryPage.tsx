import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, CircleXIcon, Loader, CheckCircle2,
  AlertCircle, Copy, RefreshCw, HelpCircle, Tag,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";
import { formatDate } from "../../utils/dateFormatter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionItem {
  id: string;
  title: string;
  assignee?: string | null;
  deadline?: string | null;
  description?: string | null;
  confidence: number;
}

interface Summary {
  summary: string;
  title: string;
  platform?: string;
  duration?: string;
  host?: string;
  key_topics?: string[];
  decisions?: { text: string; context?: string | null }[];
  open_questions?: { text: string; asked_by?: string | null; timestamp?: string | null }[];
  started_at?: string;
  summary_status?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ w = "100%", h = "1rem" }: { w?: string; h?: string }) => (
  <div
    style={{ width: w, height: h }}
    className="rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
  />
);

// ─── Platform Badge ───────────────────────────────────────────────────────────
const PlatformBadge = ({ platform }: { platform?: string }) => {
  const label = platform?.toUpperCase() ?? "RECORDING";
  const colors: Record<string, string> = {
    ZOOM: "bg-cyan-100 text-cyan-700",
    GMEET: "bg-green-100 text-green-700",
    MSTEAMS: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-widest ${colors[label] ?? "bg-gray-100 text-gray-600"}`}>
      {label} RECORDING
    </span>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50">
    <p className="text-sm text-gray-400 italic">{label}</p>
  </div>
);

// ─── Processing Banner ────────────────────────────────────────────────────────
const ProcessingBanner = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3 p-4 bg-cyan-50 border border-cyan-100 rounded-xl mb-6">
    <Loader className="w-4 h-4 text-cyan-500 animate-spin shrink-0" />
    <p className="text-sm text-cyan-700 font-medium">{message}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabKey = "summary" | "transcript" | "flowDiagram" | "actionItems" | "aiChat";

const SummaryPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [summary, setSummary]           = useState<Summary | null>(null);
  const [items, setItems]               = useState<ActionItem[]>([]);
  const [transcripts, setTranscripts]   = useState<string>("");
  const [activeTab, setActiveTab]       = useState<TabKey>("summary");

  // Separate loading states per section
  const [summaryLoading, setSummaryLoading]         = useState(true);
  const [itemsLoading, setItemsLoading]             = useState(false);
  const [transcriptLoading, setTranscriptLoading]   = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("Generating summary...");

  const [error, setError]   = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Refs to track loaded tabs and polling interval
  const loadedTabs   = useRef<Set<TabKey>>(new Set());
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

  // ── Helpers ────────────────────────────────────────────────────────────────
  const authHeaders = () => getAuthHeaders(token!, user!.tenant_id);

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  // ── Poll meeting status ────────────────────────────────────────────────────
  const startPolling = () => {
    stopPolling(); // Clear any existing interval first

    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/get_meeting_processing_update?meeting_id=${meetingId}`,
          { headers: authHeaders() }
        );
        const data = await res.json();

        if (data.status === "ready") {
          stopPolling();
          setIsProcessing(false);
          await loadSummary();
        }
        
        if (data.status === "failed") {
          stopPolling();
          setIsProcessing(false);
          setError(data.error || "Processing failed. Please try again.");
          setSummaryLoading(false);
        }

        // Update message based on status
        if (data.status === "processing") {
          setProcessingMsg("Generating your meeting summary...");
        }

      } catch {
        // Silent fail on poll — keep trying
      }
    }, 5000);
  };

  // ── Load Summary ───────────────────────────────────────────────────────────
  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch(
        `${BASE_URL}/create_summary?meeting_id=${meetingId}`,
        { headers: authHeaders() }
      );

      // 202 = still processing — start polling
      if (res.status === 202) {
        setIsProcessing(true);
        startPolling();
        return;
      }

      if (!res.ok) throw new Error("Failed to load summary");

      const data = await res.json();

      if (data.status === "failed") {
        setError(data.error || "Processing failed");
        return;
      }

      setSummary(data);
      loadedTabs.current.add("summary");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── Load Action Items (lazy — only when tab opens) ─────────────────────────
  const loadActionItems = async () => {
    if (loadedTabs.current.has("actionItems")) return; // Already loaded
    try {
      setItemsLoading(true);
      const res = await fetch(
        `${BASE_URL}/create_action_items?meeting_id=${meetingId}`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Failed to load action items");
      const data = await res.json();
      setItems(data.items || []);
      loadedTabs.current.add("actionItems");
    } catch (err) {
      console.error("Action items error:", err);
    } finally {
      setItemsLoading(false);
    }
  };

  // ── Load Transcript (lazy — only when tab opens) ───────────────────────────
  const loadTranscript = async () => {
    if (loadedTabs.current.has("transcript")) return; // Already loaded
    try {
      setTranscriptLoading(true);
      const res = await fetch(
        `${BASE_URL}/view-transcripts?meeting_id=${meetingId}`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Failed to load transcript");
      const data = await res.json();
      setTranscripts(data.transcript || "");
      loadedTabs.current.add("transcript");
    } catch (err) {
      console.error("Transcript error:", err);
    } finally {
      setTranscriptLoading(false);
    }
  };

  // ── Tab Change Handler ─────────────────────────────────────────────────────
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);

    // Lazy load only when tab opens for first time
    if (tab === "actionItems" && !loadedTabs.current.has("actionItems")) {
      loadActionItems();
    }
    if (tab === "transcript" && !loadedTabs.current.has("transcript")) {
      loadTranscript();
    }
  };

  // ── Single useEffect — only on mount ──────────────────────────────────────
  useEffect(() => {
    if (!meetingId || !user || !token) {
      setError(!meetingId ? "Meeting ID not provided" : "User not authenticated");
      setSummaryLoading(false);
      return;
    }
    loadSummary();

    // Cleanup polling on unmount
    return () => stopPolling();
  }, [meetingId, user, token]); // Only these deps — no function deps

  // ── Copy Handler ───────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (summary?.summary) {
      navigator.clipboard.writeText(summary.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Tabs Config ────────────────────────────────────────────────────────────
  const tabs = [
    { key: "summary"     as TabKey, label: "Summary" },
    { key: "transcript"  as TabKey, label: "Transcript" },
    { key: "flowDiagram" as TabKey, label: "Flow Diagram" },
    { key: "actionItems" as TabKey, label: "Action Items", count: items.length },
    { key: "aiChat"      as TabKey, label: "✦ AI Chat" },
  ];

  // ── Error State ────────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Top Nav */}
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

        {/* Processing Banner — shows when pipeline is running */}
        {isProcessing && <ProcessingBanner message={processingMsg} />}

        {/* Meeting Header */}
        <div className="mb-6">
          {summaryLoading && !isProcessing ? (
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
                      month: "short", day: "numeric", year: "numeric",
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
                  Host: <span className="font-semibold text-cyan-600">{summary.host}</span>
                </p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={loadSummary}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
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

        {/* Tab Content */}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Executive Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-500 text-lg">✦</span>
                    <h2 className="text-lg font-bold text-gray-900">Executive Summary</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-gray-600 transition">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={loadSummary} className="p-1.5 text-gray-400 hover:text-gray-600 transition">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {summaryLoading ? (
                  <div className="space-y-3">
                    <Skeleton /><Skeleton w="90%" /><Skeleton w="95%" /><Skeleton w="80%" />
                  </div>
                ) : isProcessing ? (
                  <EmptyState label="Summary is being generated. Please wait..." />
                ) : summary?.summary ? (
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                ) : (
                  <EmptyState label="No summary available yet." />
                )}
              </div>

              {/* Decisions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-bold text-gray-900">Decisions Tracked</h2>
                </div>
                {summaryLoading ? (
                  <div className="space-y-3"><Skeleton h="3rem" /><Skeleton h="3rem" /></div>
                ) : summary?.decisions && summary.decisions.length > 0 ? (
                  <div className="space-y-3">
                    {summary.decisions.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{d.text}</p>
                          {d.context && <p className="text-xs text-cyan-500 mt-0.5">{d.context}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label="No decisions tracked for this meeting." />
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">

              {/* Key Topics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Key Topics</h3>
                </div>
                {summaryLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[80, 100, 70, 90, 60].map((w, i) => <Skeleton key={i} w={`${w}px`} h="1.75rem" />)}
                  </div>
                ) : summary?.key_topics && summary.key_topics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {summary.key_topics.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition cursor-default">
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No topics detected.</p>
                )}
              </div>

              {/* Open Questions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Open Questions</h3>
                </div>
                {summaryLoading ? (
                  <div className="space-y-3"><Skeleton h="3.5rem" /><Skeleton h="3.5rem" /></div>
                ) : summary?.open_questions && summary.open_questions.length > 0 ? (
                  <div className="space-y-3">
                    {summary.open_questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50 border border-orange-100">
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
                  <p className="text-sm text-gray-400 italic">No open questions recorded.</p>
                )}
                <button className="mt-4 w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
                  Ask AI a question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Items Tab */}
        {activeTab === "actionItems" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-gray-900">Action Items</h2>
              {items.length > 0 && (
                <span className="ml-auto text-sm text-gray-400">
                  {items.length} item{items.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {itemsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} h="4rem" />)}
              </div>
            ) : items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50 transition">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {item.assignee && (
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                            {item.assignee}
                          </span>
                        )}
                        {item.deadline && (
                          <span className="text-xs text-gray-400">Due: {formatDate(item.deadline)}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.confidence >= 0.7 ? "bg-green-100 text-green-700"
                          : item.confidence >= 0.5 ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}>
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

        {/* Transcript Tab */}
        {activeTab === "transcript" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Transcript</h2>
            {transcriptLoading ? (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="1rem" />)}
              </div>
            ) : transcripts ? (
              <div className="py-4 px-5 rounded-xl bg-gray-50 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {transcripts}
                </p>
              </div>
            ) : (
              <EmptyState label="No transcript available." />
            )}
          </div>
        )}

        {/* Flow Diagram Tab */}
        {activeTab === "flowDiagram" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Flow Diagram</h2>
            <EmptyState label="Visual flow diagram coming soon." />
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === "aiChat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">AI Chat</h2>
            <EmptyState label="AI chat across meetings coming soon." />
          </div>
        )}

      </div>
    </div>
  );
};

export default SummaryPage;