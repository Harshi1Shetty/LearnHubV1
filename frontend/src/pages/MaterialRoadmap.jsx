import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMaterialRoadmap, getMaterialNodeContent } from '../api/materials';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import './MaterialRoadmap.css'; // We'll reuse similar styles or create new ones
import ContentModal from '../components/ContentModal'; 
// Note: We might need a slightly different modal or props if the content structure differs, 
// but for now, let's assume we can reuse ContentModal if we format the data correctly 
// or create a simple viewer here. given "getMaterialNodeContent" returns JSON similar to standard content.

const MaterialRoadmap = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState({});
    
    // Content Viewer State
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeContent, setNodeContent] = useState(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!user) return;
            try {
                const data = await getMaterialRoadmap(id, user.id);
                setMetadata({
                    title: data.title,
                    difficulty: data.difficulty,
                    interest: data.interest
                });
                
                // Process Layout (Simple vertical layout helper if positions aren't perfect)
                const processedNodes = data.roadmap.nodes.map(node => ({
                    ...node,
                    style: { 
                        background: '#fff', 
                        border: '1px solid #777', 
                        borderRadius: '8px', 
                        padding: '10px', 
                        width: 150,
                        fontSize: '12px',
                        textAlign: 'center',
                        cursor: 'pointer'
                    }
                }));
                
                const processedEdges = data.roadmap.edges.map(edge => ({
                    ...edge,
                    type: 'smoothstep',
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    },
                    animated: true
                }));

                setNodes(processedNodes);
                setEdges(processedEdges);
            } catch (error) {
                console.error("Failed to fetch material roadmap", error);
            } finally {
                setLoading(false);
            }
        };

        if (id && user) {
            fetchRoadmap();
        }
    }, [id, user]);

    const onNodeClick = useCallback(async (event, node) => {
        setSelectedNode(node);
        setShowContentModal(true);
        setContentLoading(true);
        
        try {
            const content = await getMaterialNodeContent(id, node.data.label, user.id);
            setNodeContent(content);
        } catch (error) {
            console.error("Failed to fetch node content", error);
        } finally {
            setContentLoading(false);
        }
    }, [id, user]);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="home-header" style={{flex: '0 0 auto'}}>
                <div className="header-content">
                     <button onClick={() => window.location.href = '/materials'} className="back-button" style={{background: 'none', border:'none', cursor:'pointer', marginRight: '1rem'}}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{fontSize: '1.2rem'}}>{metadata.title || 'Material Roadmap'}</h1>
                        <span style={{fontSize: '0.8rem', color: '#666'}}>
                            {metadata.difficulty} {metadata.interest ? `• ${metadata.interest}` : ''}
                        </span>
                    </div>
                </div>
            </header>

            <div style={{ flex: 1, position: 'relative' }}>
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spinner" size={40} />
                        <p className="loading-text">Loading roadmap...</p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        fitView
                    >
                        <Background color="#aaa" gap={16} />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                )}
            </div>

            {/* Reusing ContentModal or Simple Custom Viewer */}
            {showContentModal && (
                <div className="node-content-overlay">
                    <div className="node-content-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedNode?.data?.label}</h2>
                            <button onClick={() => setShowContentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        {contentLoading ? (
                            <div className="loading-state">
                                <Loader2 className="spinner" size={40} />
                                <p>Generative AI is creating your lesson...</p>
                            </div>
                        ) : nodeContent ? (
                            <div className="prose">
                                {/* Simple Renderer for the JSON structure */}
                                {nodeContent.sections?.map((section, idx) => (
                                    <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{section.heading}</h3>
                                        <p style={{ lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap' }}>{section.content}</p>
                                    </div>
                                ))}
                                
                                {nodeContent.quiz_question && (
                                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Quick Quiz</h4>
                                        <p style={{ marginBottom: '1rem' }}>{nodeContent.quiz_question}</p>
                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                            {nodeContent.options?.map((option, idx) => (
                                                <div 
                                                    key={idx} 
                                                    style={{ 
                                                        padding: '0.5rem', 
                                                        border: '1px solid #d1d5db', 
                                                        borderRadius: '4px',
                                                        background: 'white'
                                                    }}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.9rem', color: '#059669' }}>
                                            Correct Answer: {nodeContent.correct_answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p>No content available.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Close Icon component for local use if needed, though Lucide is imported
const X = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default MaterialRoadmap;
