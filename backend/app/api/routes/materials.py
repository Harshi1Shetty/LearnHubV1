import os
import shutil
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.db import DB_NAME
import sqlite3
from app.agents.material_rag import process_pdf_and_create_roadmap, get_material_content

router = APIRouter()

UPLOAD_DIR = "uploads"
VECTOR_DB_DIR = "vector_stores"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_DB_DIR, exist_ok=True)

class MaterialResponse(BaseModel):
    id: int
    title: str
    difficulty: str
    interest: Optional[str]
    created_at: str

@router.post("/upload")
async def upload_material(
    file: UploadFile = File(...),
    difficulty: str = Form(...),
    user_id: int = Form(...),
    interest: Optional[str] = Form(None)
):
    # Save the file
    file_location = f"{UPLOAD_DIR}/{user_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process PDF and Generate Roadmap (This handles Vector DB creation too)
    try:
        roadmap_json, vector_db_path = await process_pdf_and_create_roadmap(
            file_path=file_location,
            filename=file.filename,
            user_id=user_id,
            difficulty=difficulty,
            interest=interest
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Save to DB (Roadmaps Table)
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        INSERT INTO roadmaps (user_id, topics, difficulty, interest, language, roadmap_json, source_type, file_path, vector_db_path, objective)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id, 
        file.filename, # Using filename as "topics" for list view
        difficulty, 
        interest, 
        "English", # Default language for docs
        json.dumps(roadmap_json),
        'upload',
        file_location,
        vector_db_path,
        "Study Material"
    ))
    material_id = c.lastrowid
    conn.commit()
    conn.close()

    return {"id": material_id, "message": "Material processed successfully"}

@router.get("/user/{user_id}", response_model=List[MaterialResponse])
async def list_materials(user_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Fetch from roadmaps where source_type is 'upload'
    c.execute('''
        SELECT id, topics, difficulty, interest, created_at 
        FROM roadmaps 
        WHERE user_id = ? AND source_type = 'upload'
        ORDER BY created_at DESC
    ''', (user_id,))
    rows = c.fetchall()
    conn.close()
    
    return [
        MaterialResponse(
            id=row[0], 
            title=row[1], 
            difficulty=row[2], 
            interest=row[3],
            created_at=row[4]
        ) for row in rows
    ]

@router.get("/{material_id}")
async def get_material(material_id: int, user_id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        SELECT roadmap_json, title, difficulty, interest
        FROM materials 
        WHERE id = ? AND user_id = ?
    ''', (material_id, user_id))
    row = c.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Material not found")
        
    return {
        "roadmap": json.loads(row[0]),
        "title": row[1],
        "difficulty": row[2],
        "interest": row[3]
    }

@router.post("/{material_id}/content")
async def generate_node_content(
    material_id: int, 
    node_label: str = Form(...),
    user_id: int = Form(...)
):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Check cache first
    c.execute('''
        SELECT content_json FROM material_content 
        WHERE material_id = ? AND node_label = ?
    ''', (material_id, node_label))
    cached = c.fetchone()
    
    if cached:
        conn.close()
        return json.loads(cached[0])
        
    # Get material details
    c.execute('''
        SELECT vector_db_path, difficulty, interest, title
        FROM materials 
        WHERE id = ? AND user_id = ?
    ''', (material_id, user_id))
    material = c.fetchone()
    
    if not material:
        conn.close()
        raise HTTPException(status_code=404, detail="Material not found")
        
    vector_db_path, difficulty, interest, title = material
    
    # Generate content using RAG
    content = await get_material_content(
        vector_db_path=vector_db_path,
        node_label=node_label,
        difficulty=difficulty,
        interest=interest
    )
    
    # Save to cache
    c.execute('''
        INSERT INTO material_content (material_id, node_label, content_json)
        VALUES (?, ?, ?)
    ''', (material_id, node_label, json.dumps(content)))
    conn.commit()
    conn.close()
    
    return content
