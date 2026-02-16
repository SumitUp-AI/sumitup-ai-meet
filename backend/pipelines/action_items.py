from langchain_core.output_parsers import PydanticOutputParser
from langchain_groq import ChatGroq
from typing import List, Optional
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv
import os
load_dotenv(find_dotenv())

groq_apikey = os.getenv("GROQ_API_KEY")

class ActionItemObject(BaseModel):
    action: str
    assignee: Optional[str] = None
    deadline: Optional[str] = None
    feedback: Optional[str] = None
    confidence: float
    
class ActionItems(BaseModel):
    items: List[ActionItemObject]
    

def create_action_items_json(summary):
    """This function extracts action items from the summary and return action items"""
    parser = PydanticOutputParser(pydantic_object=ActionItems)
    prompt_action_items = f"""You are an meeting analyst, Given the generated summary by a large language model, your work is to extract action items in JSON format as schema specified as under:

    Schema Instructions:
    {parser.get_format_instructions()}

    Core Instructions:
    - Only add doable points discussed in meetings, if there are no action items simply return no action item of it.
    - Deadline should be in timezone format otherwise None
    - Include feedback also, add confidence scoring 0.5 above for grounded action items and below 0.5 for non-relevant.
    
    
    Summary:
    {summary}
    """
    llm = ChatGroq(
        api_key=groq_apikey,
        model="llama-3.1-8b-instant",
        temperature=0.0,
        max_retries=2
    )

    response = llm.invoke(prompt_action_items)
    json_output = response.content
    action_items = parser.parse(json_output)
    
    return action_items.model_dump()


