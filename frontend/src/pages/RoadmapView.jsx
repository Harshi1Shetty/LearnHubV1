import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { getRoadmap } from '../api/roadmap';
import { generateContent } from '../api/content';
import ContentPanel from '../components/ContentPanel';
import { Brain, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import './RoadmapView.css';

const nodeWidth = 180;
const nodeHeight = 70;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

const CustomNode = ({ data, selected }) => {
  const getStatusClass = () => {
    if (selected) return 'custom-node-selected';
    
    switch (data.status) {
      case 'expert':
        return 'custom-node-expert';
      case 'competent':
        return 'custom-node-competent';
      default:
        return 'custom-node-default';
    }
  };

  return (
    <div className={`custom-node ${getStatusClass()}`}>
      <Handle type="target" position={Position.Top} className="custom-handle" />
      <div className="custom-node-content">
        <div className="custom-node-header">
          <span className="node-id-badge">{data.nodeId}</span>
          <span className="node-label">{data.label}</span>
        </div>
        {data.mastery_score > 0 && (
          <div className="mastery-progress-bar">
            <div 
              className="mastery-progress-fill" 
              style={{ width: `${data.mastery_score}%` }}
            />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
};

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('story');
  const contentCache = useRef({});

  const nodeTypes = React.useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    fetchRoadmapData();
  }, [id]);

  const processRoadmapData = (data) => {
    const newNodes = [];
    const newEdges = [];
    
    const traverse = (node, parentId = null) => {
      newNodes.push({
        id: node.id,
        type: 'custom',
        data: { 
          label: node.label,
          nodeId: node.id,
          status: node.status,
          mastery_score: node.mastery_score
        },
        position: { x: 0, y: 0 },
      });

      if (parentId) {
        newEdges.push({
          id: `e${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: 'smoothstep',
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
        });
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, node.id));
      }
    };

    data.roadmap.forEach((rootNode) => traverse(rootNode));
    return { nodes: newNodes, edges: newEdges };
  };

  const fetchRoadmapData = async () => {
    try {
      const data = await getRoadmap(id);
      setRoadmapData(data);
      const { nodes: rawNodes, edges: rawEdges } = processRoadmapData(data);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges, 'TB');
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error("Failed to fetch roadmap", error);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const getExistingMedia = (nodeLabel) => {
    const cache = contentCache.current;
    for (const key in cache) {
      if (key.startsWith(`${nodeLabel}-`)) {
        const data = cache[key];
        if (data?.images?.length || data?.videos?.length) {
          return { images: data.images, videos: data.videos };
        }
      }
    }
    return { images: null, videos: null };
  };

  const handleNodeClick = async (event, node) => {
    setSelectedNode(node);
    
    const cacheKey = `${id}-${node.data.label}-${currentMode}`;
    if (contentCache.current[cacheKey]) {
      setContentData(contentCache.current[cacheKey]);
      return;
    }

    setContentLoading(true);
    setContentData(null);
    
    const { images, videos } = getExistingMedia(node.data.label);

    try {
      const data = await generateContent(
        roadmapData.topic, 
        node.data.label, 
        currentMode, 
        roadmapData.difficulty || 'Normal', 
        roadmapData.language || 'English', 
        images, 
        videos,
        id
      );
      setContentData(data);
      contentCache.current[cacheKey] = data;
    } catch (error) {
      console.error("Failed to fetch content", error);
    } finally {
      setContentLoading(false);
    }
  };

  const handleModeChange = async (mode) => {
    setCurrentMode(mode);
    if (!selectedNode) return;

    const cacheKey = `${id}-${selectedNode.data.label}-${mode}`;
    if (contentCache.current[cacheKey]) {
      setContentData(contentCache.current[cacheKey]);
      return;
    }

    setContentLoading(true);
    
    const { images, videos } = getExistingMedia(selectedNode.data.label);

    try {
      const data = await generateContent(
        roadmapData.topic, 
        selectedNode.data.label, 
        mode, 
        roadmapData.difficulty || 'Normal', 
        roadmapData.language || 'English', 
        images, 
        videos,
        id
      );
      setContentData(data);
      contentCache.current[cacheKey] = data;
    } catch (error) {
      console.error("Failed to change mode", error);
    } finally {
      setContentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="roadmap-loading">
        <Loader2 className="loading-spinner" size={40} />
        <span className="loading-text">Loading your learning path...</span>
      </div>
    );
  }

  return (
    <div className="roadmap-container">
      {/* Top Bar */}
      <div className="roadmap-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/')}
            className="back-button"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="header-logo">
            <div className="logo-icon">
              <Brain size={20} />
            </div>
            <span className="logo-text">LearnHub</span>
          </div>
          <div className="header-divider"></div>
          <div className="roadmap-info">
            <BookOpen size={18} className="roadmap-icon" />
            <h2 className="roadmap-title">{roadmapData?.topic}</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="roadmap-main">
        {/* Left Panel - Roadmap */}
        <div className="roadmap-panel">
          <div className="panel-header">
            <h3 className="panel-title">Learning Path</h3>
            <p className="panel-subtitle">Click on any node to explore</p>
          </div>
          <div className="reactflow-wrapper">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={1.5}
            >
              <Controls className="flow-controls" />
              <Background variant="dots" gap={16} size={1} color="#e2e8f0" />
            </ReactFlow>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="content-panel-wrapper">
          <ContentPanel 
            data={contentData}
            topic={roadmapData?.topic}
            subtopic={selectedNode?.data?.label}
            onModeChange={handleModeChange}
            loading={contentLoading}
            currentMode={currentMode}
            difficulty={roadmapData?.difficulty}
            language={roadmapData?.language}
            roadmapId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;