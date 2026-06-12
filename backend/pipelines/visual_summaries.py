import json
import os
import logging
from typing import List, Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config.settings import settings

logger = logging.getLogger(__name__)

# Use SLM (8B) for faster, cheaper diagram generation
# The 70B model is overkill for structured JSON output
visual_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model="llama-3.1-8b-instant",  # 8B model - faster, cheaper
    temperature=0.2,  # Low temp for consistent JSON output
    max_retries=2
)

# More capable model for complex meetings (fallback)
capable_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    max_retries=2
)


def get_flow_diagram_prompt() -> ChatPromptTemplate:
    """Returns the prompt template for generating React Flow diagrams"""
    
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert at creating flowchart diagrams from meeting summaries and action items.
Generate a React Flow JSON structure that visualizes the meeting's key decisions and action items.

RULES:
1. Create a "start" node (blue) as the root
2. Create decision nodes (purple) for key decisions made
3. Create action nodes (yellow) for each action item
4. Connect start → decisions → action items
5. Position nodes using a tree layout:
   - x: increment by 250 for each level (start:250, decisions:250, actions:500)
   - y: space by 100 for sibling nodes
6. Limit to 10-12 nodes total (keep diagram clean)
7. Output ONLY valid JSON, no explanations

NODE STYLES:
- Start node: {{"backgroundColor": "#e0f2fe", "border": "1px solid #0284c7", "borderRadius": "8px"}}
- Decision node: {{"backgroundColor": "#f3e8ff", "border": "1px solid #9333ea", "borderRadius": "8px"}}
- Action node: {{"backgroundColor": "#fef3c7", "border": "1px solid #d97706", "borderRadius": "8px"}}

OUTPUT FORMAT:
{{
  "nodes": [
    {{"id": "start", "type": "input", "position": {{"x": 250, "y": 0}}, "data": {{"label": "Meeting Title"}}, "style": {{"backgroundColor": "#e0f2fe"}}}}
  ],
  "edges": []
}}

Do not include markdown formatting or explanations. Return raw JSON only."""),
        ("user", """Meeting Summary:
{summary}

Action Items:
{action_items}

Generate a React Flow JSON diagram for this meeting."""),
    ])


def get_compact_prompt() -> ChatPromptTemplate:
    """Compact prompt for short meetings with few action items"""
    
    return ChatPromptTemplate.from_messages([
        ("system", """Create a simple React Flow diagram from meeting data.
Start node (blue) → Action nodes (yellow).
Output JSON only.

Format: {{"nodes": [{{"id": "start", "position": {{"x": 250, "y": 0}}, "data": {{"label": "Meeting"}}, "style": {{"backgroundColor": "#e0f2fe"}}}}], "edges": []}}"""),
        ("user", "Summary: {summary}\nActions: {action_items}"),
    ])


def parse_llm_response(content: str) -> Dict[str, Any]:
    """Parse LLM response and extract valid JSON"""
    
    # Remove markdown code blocks if present
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
        content = content.split("```")[1].split("```")[0]
    
    content = content.strip()
    
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        logger.error(f"Raw content: {content[:500]}")
        
        # Return minimal fallback structure
        return {
            "nodes": [
                {
                    "id": "start",
                    "position": {"x": 250, "y": 0},
                    "data": {"label": "Meeting Summary"},
                    "style": {"backgroundColor": "#e0f2fe", "borderRadius": "8px"}
                }
            ],
            "edges": []
        }


async def generate_visual_summary(
    summary: str,
    action_items: List[Dict[str, Any]],
    meeting_title: str = "Meeting",
    use_fallback_model: bool = False
) -> Dict[str, Any]:
    """
    Generate React Flow JSON diagram from meeting summary and action items.
    
    Args:
        summary: Meeting summary text
        action_items: List of action items with title and assignee
        meeting_title: Title of the meeting
        use_fallback_model: Use 70B model if 8B produces poor results
    
    Returns:
        Dict with 'nodes' and 'edges' arrays for React Flow
    """
    
    if not summary and not action_items:
        return _get_empty_diagram(meeting_title)
    
    # Format action items as text
    action_text = ""
    for i, item in enumerate(action_items, 1):
        action_text += f"{i}. {item.get('title', 'Untitled')}"
        if item.get('assignee'):
            action_text += f" (Assignee: {item['assignee']})"
        action_text += "\n"
    
    if not action_text:
        action_text = "No action items extracted from this meeting."
    
    # Choose prompt based on content length
    if len(summary) < 500 and len(action_items) <= 5:
        prompt_template = get_compact_prompt()
    else:
        prompt_template = get_flow_diagram_prompt()
    
    # Choose model
    llm = capable_llm if use_fallback_model else visual_llm
    
    chain = prompt_template | llm | StrOutputParser()
    
    try:
        response = await chain.ainvoke({
            "summary": summary[:2000] if summary else "No summary available.",
            "action_items": action_text
        })
        
        result = parse_llm_response(response)
        
        # Add meeting title to start node if exists
        if result.get("nodes") and len(result["nodes"]) > 0:
            start_node = result["nodes"][0]
            if "data" in start_node and not start_node["data"].get("label"):
                start_node["data"]["label"] = meeting_title[:50]
        
        return result
        
    except Exception as e:
        logger.error(f"Visual summary generation failed: {e}")
        return _get_fallback_diagram(meeting_title, summary, action_items)


def _get_empty_diagram(title: str) -> Dict[str, Any]:
    """Return empty diagram when no data available"""
    return {
        "nodes": [
            {
                "id": "start",
                "position": {"x": 250, "y": 0},
                "data": {"label": title[:50] or "No Meeting Data"},
                "style": {"backgroundColor": "#e0f2fe", "borderRadius": "8px"}
            },
            {
                "id": "empty",
                "position": {"x": 250, "y": 100},
                "data": {"label": "No summary or action items available"},
                "style": {"backgroundColor": "#f3f4f6", "borderRadius": "8px"}
            }
        ],
        "edges": [
            {"id": "e_start_empty", "source": "start", "target": "empty"}
        ]
    }


def _get_fallback_diagram(
    title: str, 
    summary: str, 
    action_items: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Simple fallback diagram when LLM generation fails"""
    
    nodes = [
        {
            "id": "start",
            "position": {"x": 250, "y": 0},
            "data": {"label": title[:50] or "Meeting Summary"},
            "style": {"backgroundColor": "#e0f2fe", "borderRadius": "8px"}
        }
    ]
    
    edges = []
    
    # Add action items as nodes
    for idx, item in enumerate(action_items[:8]):  # Max 8 action items
        node_id = f"action_{idx}"
        nodes.append({
            "id": node_id,
            "position": {"x": 250, "y": 100 + (idx * 70)},
            "data": {
                "label": f"✅ {item.get('title', 'Untitled')[:60]}",
                "assignee": item.get('assignee')
            },
            "style": {"backgroundColor": "#fef3c7", "borderRadius": "8px"}
        })
        edges.append({
            "id": f"edge_start_{idx}",
            "source": "start",
            "target": node_id
        })
    
    if len(nodes) == 1:
        nodes.append({
            "id": "info",
            "position": {"x": 250, "y": 100},
            "data": {"label": "Review meeting for details"},
            "style": {"backgroundColor": "#f3f4f6", "borderRadius": "8px"}
        })
        edges.append({
            "id": "edge_start_info",
            "source": "start",
            "target": "info"
        })
    
    return {"nodes": nodes, "edges": edges}