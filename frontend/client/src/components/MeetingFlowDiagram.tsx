import React, { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuthHeaders } from '../utils/apiHeaders';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlowNodeData = {
  label: string;
  assignee?: string;
  [key: string]: unknown; // required by React Flow v12 NodeData constraint
};

type FlowNode = Node<FlowNodeData>;
type FlowEdge = Edge;

interface ActionItem {
  title: string;
  assignee?: string | null;
}

interface FlowDiagramProps {
  meetingId: string;
  summary?: string;
  actionItems?: ActionItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const MeetingFlowDiagram: React.FC<FlowDiagramProps> = ({
  meetingId,
  summary,
  actionItems = [],
}) => {

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  const { token, user } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

  // ── Fallback diagram ───────────────────────────────────────────────────────

  const createFallbackDiagram = useCallback(() => {
    const fallbackNodes: FlowNode[] = [
      {
        id: 'start',
        type: 'input',
        position: { x: 250, y: 0 },
        data: { label: 'Meeting Summary' },
        style: {
          backgroundColor: '#e0f2fe',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
        },
      },
    ];

    const fallbackEdges: FlowEdge[] = [];

    if (actionItems.length === 0) {
      fallbackNodes.push({
        id: 'no_actions',
        position: { x: 250, y: 120 },
        data: { label: 'No action items extracted' },
        style: {
          backgroundColor: '#f3f4f6',
          border: '1px solid #9ca3af',
          borderRadius: '8px',
          fontSize: '12px',
        },
      });
      fallbackEdges.push({
        id: 'edge_start_no_actions',
        source: 'start',
        target: 'no_actions',
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    } else {
      actionItems.forEach((item, idx) => {
        const nodeId = `action_${idx}`;
        const truncated =
          item.title.length > 50
            ? `${item.title.substring(0, 50)}...`
            : item.title;

        fallbackNodes.push({
          id: nodeId,
          position: { x: 250, y: 120 + idx * 90 },
          data: {
            label: `${truncated}`,
            assignee: item.assignee ?? undefined,
          },
          style: {
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            fontSize: '12px',
          },
        });

        fallbackEdges.push({
          id: `edge_start_${idx}`,
          source: 'start',
          target: nodeId,
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      });
    }

    setNodes(fallbackNodes);
    setEdges(fallbackEdges);
  }, [actionItems, setNodes, setEdges]);

  // ── Generate diagram from API ──────────────────────────────────────────────

  const generateDiagram = useCallback(async () => {
    if (!summary && actionItems.length === 0) {
      setError('No meeting data available to generate diagram');
      setLoading(false);
      return;
    }

    if (!token || !user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/generate-flow-diagram`, {
        method: 'POST',
        headers: getAuthHeaders(token, user?.tenant_id),
        body: JSON.stringify({
          meeting_id: meetingId,
          summary,
          action_items: actionItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate diagram');

      const data = await res.json();

      if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
        setNodes(data.nodes as FlowNode[]);
        setEdges(data.edges as FlowEdge[]);
        setUsingCache(data.cached ?? false);
      } else {
        throw new Error('Invalid diagram data received');
      }
    } catch (err) {
      console.error('Error generating diagram:', err);
      setError('Could not generate diagram. Using fallback layout.');
      createFallbackDiagram();
    } finally {
      setLoading(false);
    }
  }, [
    meetingId,
    summary,
    actionItems,
    token,
    user,
    BASE_URL,
    setNodes,
    setEdges,
    createFallbackDiagram,
  ]);

  // ── On connect (user draws edge manually) ─────────────────────────────────

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed }, 
          },
          eds
        )
      ),
    [setEdges]
  );

  // ── Mount ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (summary || actionItems.length > 0) {
      generateDiagram();
    } else {
      setLoading(false);
      setError('No summary or action items available');
    }

  }, [generateDiagram]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <LoaderCircle className="w-8 h-8 animate-spin text-cyan-600 mb-3" />
        <p className="text-gray-500 text-sm">Generating visual diagram...</p>
        <p className="text-gray-400 text-xs mt-1">
          AI is mapping decisions and action items
        </p>
      </div>
    );
  }

  // ── Error with no nodes ────────────────────────────────────────────────────

  if (error && nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm text-center px-4">{error}</p>
        <button
          onClick={generateDiagram}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-[500px] bg-white rounded-xl border border-gray-200 overflow-hidden relative">
      {usingCache && (
        <div className="absolute top-2 right-2 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Cached
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        attributionPosition="bottom-left"
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{ backgroundColor: '#f8fafc' }}
        />
      </ReactFlow>
    </div>
  );
};

export default MeetingFlowDiagram;