import os
import json
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from app.core.config import settings

# Initialize Ollama
llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model="llama3:8b",
    temperature=0.3 # Lower temp for more factual extraction
)

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

VECTOR_DB_DIR = "vector_stores"

async def process_pdf_and_create_roadmap(file_path: str, filename: str, user_id: int, difficulty: str, interest: str = None):
    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    # 2. Split Text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    
    # 3. Create Vector Store
    vector_db_path = f"{VECTOR_DB_DIR}/{user_id}_{filename}_index"
    vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
    vectorstore.save_local(vector_db_path)
    
    # 4. Generate Roadmap (Ideation based on content)
    # We'll take a sampling of the text or a summary to generate the roadmap
    # For efficiency, let's grab the first few pages or a summary
    summary_text = ""
    for doc in splits[:5]: # Take first 5 chunks for context
        summary_text += doc.page_content + "\n"
        
    roadmap_prompt = ChatPromptTemplate.from_template(
        """You are an educational curriculum planner. Analyze the following text extracted from a study material (PDF).
        Create a structured learning roadmap with 5-10 key topics (nodes) that cover the main concepts in this material.
        
        Difficulty Level: {difficulty}
        
        Text Content Sample:
        {text}
        
        Refine the topics to be suitable for the difficulty level.
        
        Instructions:
        1. Output ONLY a valid JSON object.
        2. Do NOT include any introductory or concluding text.
        3. Do NOT include Markdown formatting like ```json ... ```.
        
        Format Requirement:
        {{
            "nodes": [
                {{ "id": "1", "data": {{ "label": "Topic Name" }}, "position": {{ "x": 100, "y": 100 }} }}
            ],
            "edges": [
                {{ "id": "e1-2", "source": "1", "target": "2" }}
            ]
        }}
        
        Make sure the layout (x,y positions) resembles a tree or flow chart (top to bottom).
        """
    )
    
    chain = roadmap_prompt | llm | StrOutputParser()
    
    raw_response = await chain.ainvoke({
        "difficulty": difficulty,
        "text": summary_text
    })
    
    # Clean up response to ensure valid JSON
    cleaned_response = raw_response.strip()
    if "```json" in cleaned_response:
        cleaned_response = cleaned_response.split("```json")[1].split("```")[0]
    elif "```" in cleaned_response:
        cleaned_response = cleaned_response.split("```")[1].split("```")[0]
        
    try:
        # Find the first { and last }
        start_idx = cleaned_response.find("{")
        end_idx = cleaned_response.rfind("}") + 1
        if start_idx != -1 and end_idx != -1:
             cleaned_response = cleaned_response[start_idx:end_idx]
             
        roadmap_json = json.loads(cleaned_response)
    except json.JSONDecodeError:
        # Fallback if parsing keeps failing
        print(f"Failed to parse JSON: {raw_response}")
        roadmap_json = {"nodes": [], "edges": []}
    
    return roadmap_json, vector_db_path

async def get_material_content(vector_db_path: str, node_label: str, difficulty: str, interest: str = None):
    # 1. Load Vector Store
    if not os.path.exists(vector_db_path):
        raise FileNotFoundError("Vector store not found for this material.")
        
    vectorstore = FAISS.load_local(vector_db_path, embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # 2. Retrieve Context
    docs = retriever.invoke(node_label)
    context_text = "\n\n".join([doc.page_content for doc in docs])
    
    # 3. Generate Content
    system_prompt = f"You are a helpful tutor. Explain the topic '{node_label}' based STRICTLY on the provided context."
    if interest:
         system_prompt += f" Connect the explanation to '{interest}' to make it engaging, but keep the core facts true to the context."

    content_prompt = ChatPromptTemplate.from_template(
        """{system_prompt}
        
        Target Audience: {difficulty}
        
        Context from Material:
        {context}
        
        Task:
        1. Explain '{topic}' using ONLY the information from the context.
        2. If the context doesn't fully cover it, generalize based on the topic but mention that it wasn't fully in the text.
        3. Format the output using clear Markdown (headings, bullet points, bold text).
        
        Output Format:
        Markdown text only. No JSON.
        """
    )
    
    chain = content_prompt | llm | StrOutputParser()
    
    markdown_content = await chain.ainvoke({
        "system_prompt": system_prompt,
        "difficulty": difficulty,
        "context": context_text,
        "topic": node_label
    })

    # Return standard format expected by frontend
    return {
        "content": markdown_content,
        "images": [], # Could implement RAG image retrieval later
        "videos": []
    }
