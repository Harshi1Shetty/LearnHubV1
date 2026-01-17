from fastapi import APIRouter, HTTPException
from app.models.content import ContentRequest, ContentResponse
from app.agents.content import generate_content
from app.agents.material_rag import get_material_content
from app.db import get_db
import json
from pydantic import BaseModel

router = APIRouter()

class DBContentRequest(ContentRequest):
    roadmap_id: int

@router.post("/generate", response_model=ContentResponse)
async def create_content(request: DBContentRequest):
    try:
        # Check DB first
        with get_db() as conn:
            c = conn.cursor()
            c.execute("""
                SELECT content_json FROM node_content 
                WHERE roadmap_id = ? AND node_label = ? AND mode = ?
            """, (request.roadmap_id, request.subtopic, request.mode))
            row = c.fetchone()
            
            if row:
                return json.loads(row["content_json"])

        # Fetch Roadmap Metadata to determine source type
        with get_db() as conn:
            c = conn.cursor()
            c.execute("SELECT user_id, topics as topic, source_type, vector_db_path, difficulty, interest FROM roadmaps WHERE id = ?", (request.roadmap_id,))
            roadmap_row = c.fetchone()
            
        if not roadmap_row:
             raise HTTPException(status_code=404, detail="Roadmap not found")
             
        user_id = roadmap_row["user_id"]
        source_type = roadmap_row["source_type"] if "source_type" in roadmap_row.keys() else "generative"
        vector_db_path = roadmap_row["vector_db_path"] if "vector_db_path" in roadmap_row.keys() else None
        
        # Route to logic based on source type
        content_data = None
        
        if source_type == 'upload' and vector_db_path:
             # USE RAG AGENT
             content_data = await get_material_content(
                 vector_db_path=vector_db_path,
                 node_label=request.subtopic,
                 difficulty=request.difficulty,
                 interest=request.interest
             )
             # Adapt structure to match standard ContentResponse (convert dict to object if needed)
             # But our get_material_content now returns a dict that matches format
             # Just need to wrap it in the Pydantic model at the end
             pass
             
        else:
            # USE STANDARD GENERATIVE AGENT
            # Get knowledge status
            user_status = "novice"
            with get_db() as conn:
                c = conn.cursor()
                c.execute("SELECT status FROM user_knowledge WHERE user_id = ? AND topic = ? AND subtopic = ?", 
                          (user_id, roadmap_row["topic"], request.subtopic))
                knowledge_row = c.fetchone()
                if knowledge_row:
                    user_status = knowledge_row["status"]

            # Generate if not found
            content_data = await generate_content(
                request.topic, 
                request.subtopic, 
                request.mode, 
                request.difficulty, 
                request.language,
                request.images,
                request.videos,
                user_status=user_status,
                interest=request.interest
            )
            content_data = content_data.dict() # Convert model to dict for storage
        
        # Save to DB
        with get_db() as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO node_content (roadmap_id, node_label, mode, content_json)
                VALUES (?, ?, ?, ?)
            """, (request.roadmap_id, request.subtopic, request.mode, json.dumps(content_data)))
            conn.commit()
            
        return content_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
