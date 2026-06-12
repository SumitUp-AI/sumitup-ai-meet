import logging
from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from config.settings import settings

logger = logging.getLogger(__name__)

class NodePosition(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    label: str
    assignee: Optional[str] = None

class FlowNode(BaseModel):
    id: str
    type: Optional[str] = None
    position: NodePosition
    data: NodeData
    style: Optional[Dict[str, Any]] = None

class FlowEdge(BaseModel):
    id: str
    source: str
    target: str
    markerEnd: Optional[Dict[str, Any]] = None

class FlowDiagram(BaseModel):
    nodes: List[FlowNode] = Field(description="List of React Flow nodes")
    edges: List[FlowEdge] = Field(description="List of React Flow edges")

# ─── LLM setup ────────────────────────────────────────────────────────────────

visual_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model="llama-3.1-8b-instant",
    temperature=0.2,
    max_retries=2
)

capable_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    max_retries=2
)

# ─── Parser ───────────────────────────────────────────────────────────────────

parser = PydanticOutputParser(pydantic_object=FlowDiagram)

# ─── Prompts ──────────────────────────────────────────────────────────────────

def get_flow_diagram_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert at creating flowchart diagrams from meeting summaries.
Generate a React Flow JSON structure that visualizes the meeting decisions and action items.

RULES:
1. Start node (blue) as root — id must be "start"
2. Decision nodes (purple) for key decisions
3. Action nodes (yellow) for each action item
4. Connect: start → decisions → action items
5. x: increment by 250 per level, y: space by 100 per sibling
6. Maximum 12 nodes total

NODE STYLES:
- Start: {{"backgroundColor": "#e0f2fe", "border": "1px solid #0284c7", "borderRadius": "8px"}}
- Decision: {{"backgroundColor": "#f3e8ff", "border": "1px solid #9333ea", "borderRadius": "8px"}}
- Action: {{"backgroundColor": "#fef3c7", "border": "1px solid #d97706", "borderRadius": "8px"}}

{format_instructions}"""),
        ("user", """Meeting Summary:
{summary}

Action Items:
{action_items}

Generate the React Flow JSON diagram."""),
    ])


def get_compact_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """Create a simple React Flow diagram from meeting data.
Start node (blue) → Action nodes (yellow).

{format_instructions}"""),
        ("user", "Summary: {summary}\nActions: {action_items}"),
    ])

# ─── Fallbacks ────────────────────────────────────────────────────────────────

def _get_empty_diagram(title: str) -> FlowDiagram:
    return FlowDiagram(
        nodes=[
            FlowNode(
                id="start",
                position=NodePosition(x=250, y=0),
                data=NodeData(label=title[:50] or "No Meeting Data"),
                style={"backgroundColor": "#e0f2fe", "borderRadius": "8px"}
            ),
            FlowNode(
                id="empty",
                position=NodePosition(x=250, y=100),
                data=NodeData(label="No summary or action items available"),
                style={"backgroundColor": "#f3f4f6", "borderRadius": "8px"}
            )
        ],
        edges=[
            FlowEdge(id="e_start_empty", source="start", target="empty")
        ]
    )


def _get_fallback_diagram(
    title: str,
    action_items: List[Dict[str, Any]]
) -> FlowDiagram:
    nodes = [
        FlowNode(
            id="start",
            position=NodePosition(x=250, y=0),
            data=NodeData(label=title[:50] or "Meeting Summary"),
            style={"backgroundColor": "#e0f2fe", "borderRadius": "8px"}
        )
    ]
    edges = []

    for idx, item in enumerate(action_items[:8]):
        node_id = f"action_{idx}"
        nodes.append(FlowNode(
            id=node_id,
            position=NodePosition(x=250, y=100 + idx * 70),
            data=NodeData(
                label=item.get("title", "Untitled")[:60],
                assignee=item.get("assignee")
            ),
            style={"backgroundColor": "#fef3c7", "borderRadius": "8px"}
        ))
        edges.append(FlowEdge(
            id=f"edge_start_{idx}",
            source="start",
            target=node_id,
            markerEnd={"type": "arrowclosed"}
        ))

    return FlowDiagram(nodes=nodes, edges=edges)

# ─── Main function ────────────────────────────────────────────────────────────

async def generate_visual_summary(
    summary: str,
    action_items: List[Dict[str, Any]],
    meeting_title: str = "Meeting",
    use_fallback_model: bool = False
) -> Dict[str, Any]:
    if not summary and not action_items:
        return _get_empty_diagram(meeting_title).model_dump()

    # Format action items as text
    action_text = "\n".join([
        f"{i}. {item.get('title', 'Untitled')}"
        + (f" (Assignee: {item['assignee']})" if item.get('assignee') else "")
        for i, item in enumerate(action_items, 1)
    ]) or "No action items."

    # Choose prompt + model
    is_short = len(summary) < 500 and len(action_items) <= 5
    prompt_template = get_compact_prompt() if is_short else get_flow_diagram_prompt()
    llm = capable_llm if use_fallback_model else visual_llm

    chain = prompt_template | llm | parser

    try:
        result: FlowDiagram = await chain.ainvoke({
            "summary": summary[:2000] or "No summary available.",
            "action_items": action_text,
            "format_instructions": parser.get_format_instructions()
        })
        return result.model_dump()

    except Exception as e:
        logger.error(f"Visual summary generation failed: {e}")
        return _get_fallback_diagram(meeting_title, action_items).model_dump()