import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Plus, Upload, X, Search, MonitorPlay, Brain, LogOut } from 'lucide-react';
import { resourcesApi } from '../api/resources';
import { useAuth } from '../context/AuthContext';
import './SimulationHub.css';
import './home.css';

const SimulationHub = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [simulations, setSimulations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: '',
      file: null
  });

  useEffect(() => {
    fetchSimulations();
    if (user && user.id) {
        fetchRecommendations(user.id);
    }
  }, [user]);

  const fetchSimulations = async () => {
    try {
        const data = await resourcesApi.getAll();
        // Filter only 'simulation' type
        const sims = data.filter(r => r.type === 'simulation');
        setSimulations(sims);
    } catch (error) {
        console.error("Failed to load simulations", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchRecommendations = async (userId) => {
    console.log(`%c[DEBUG] Fetching recommendations for User ID: ${userId}`, "color: blue; font-weight: bold;");
    try {
        const startTime = performance.now();
        const data = await resourcesApi.getRecommendations(userId);
        const endTime = performance.now();
        // Filter only 'simulation' type from recommendations
        const recs = data.filter(r => r.type === 'simulation');

        console.log(`%c[DEBUG] Recommendations fetched in ${(endTime - startTime).toFixed(2)}ms. Found: ${recs.length} simulations`, "color: green");
        console.table(recs); 

        setRecommendations(recs);
    } catch (error) {
        console.error("%c[DEBUG] Failed to fetch recommendations", "color: red; font-weight: bold;", error);
    }
  };

  const handleUpload = async (e) => {
      e.preventDefault();
      if (!formData.file || !formData.title || !formData.file.name.endsWith('.html')) {
          alert("Please verify fields. File must be HTML.");
          return;
      }

      setUploading(true);
      const data = new FormData();
      data.append('user_id', user.id);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('type', 'simulation'); // Force type
      data.append('category', formData.category);
      data.append('file', formData.file);

      try {
          await resourcesApi.upload(data);
          setShowModal(false);
          setFormData({ title: '', description: '', category: '', file: null });
          fetchSimulations(); // Refresh list
      } catch (error) {
          console.error("Upload failed", error);
          alert("Upload failed");
      } finally {
          setUploading(false);
      }
  };

  const filteredSimulations = simulations.filter(sim => 
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sim.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sim.category && sim.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <header className="home-header">
            <div className="header-content">
            <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                <div className="logo-icon">
                <Brain className="icon" />
                </div>
                <h1 className="logo-title">Learnhub.SAKEC</h1>
            </div>
            <div className="header-actions">
                <span className="welcome-text">Welcome, {user?.username}</span>
                <button 
                onClick={logout}
                className="logout-button"
                title="Logout"
                >
                <LogOut size={20} />
                </button>
            </div>
            </div>
        </header>

        <div className="simulation-container" style={{ flex: 1 }}>
            <div className="simulation-header">
                <div className="simulation-title">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                            background: 'none',
                            border: 'none',
                            color: '#6366f1',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            width: 'fit-content',
                            padding: '0'
                            }}
                        >
                            <ArrowLeft size={18} />
                            Back to Home
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <h1 style={{ margin: 0 }}>Simulation Hub</h1>
                        </div>
                    </div>
                    <p style={{ marginTop: '0.5rem' }}>Interactive simulations tailored to your learning path</p>
                </div>
                <button className="primary-button" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Simulation
                </button>
            </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
            <>
                <div className="section-label">
                    <MonitorPlay size={16} />
                    Recommended for You
                </div>
                <div className="simulation-grid">
                    {recommendations.map(sim => (
                        <div key={sim.id} className="simulation-card" onClick={() => navigate(`/simulation/${sim.id}`)}>
                            <div className="simulation-thumbnail">
                                <PlayCircle size={48} />
                            </div>
                            <div className="simulation-content">
                                <h3 className="simulation-card-title">{sim.title}</h3>
                                <p className="simulation-description">{sim.description}</p>
                                <div className="simulation-meta">
                                    <span className="simulation-tag">{sim.category || 'General'}</span>
                                    <span className="play-button">Start Simulation <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }}/></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

        {/* All Simulations with Search */}
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <div className="section-label" style={{ marginBottom: 0 }}>
                All Simulations
            </div>
            <div className="search-bar" style={{ maxWidth: '300px' }}>
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Search simulations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>
        </div>

        {loading ? (
             <div className="loading-state">Loading simulations...</div>
        ) : filteredSimulations.length > 0 ? (
            <div className="simulation-grid">
                {filteredSimulations.map(sim => (
                    <div key={sim.id} className="simulation-card" onClick={() => navigate(`/simulation/${sim.id}`)}>
                        <div className="simulation-thumbnail">
                            <MonitorPlay size={48} />
                        </div>
                        <div className="simulation-content">
                            <h3 className="simulation-card-title">{sim.title}</h3>
                            <p className="simulation-description">{sim.description}</p>
                            <div className="simulation-meta">
                                <span className="simulation-tag">{sim.category || 'General'}</span>
                                <span className="play-button">Launch <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }}/></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="empty-state">
                <p>No simulations found. Try uploading one!</p>
            </div>
        )}

        {/* Upload Modal */}
        {showModal && (
            <div className="upload-modal-overlay">
                <div className="upload-modal">
                    <div className="modal-header">
                        <h2>Upload HTML Simulation</h2>
                        <button onClick={() => setShowModal(false)} className="close-button">
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleUpload}>
                        <div className="form-group">
                            <label>Title</label>
                            <input 
                                type="text" 
                                required 
                                className="form-input"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                className="form-input"
                                rows="3"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Category (e.g. Physics, Coding)</label>
                            <input 
                                type="text" 
                                className="form-input"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>HTML File</label>
                            <div className="file-upload-box">
                                <Upload size={24} />
                                <span>{formData.file ? formData.file.name : "Click to select HTML file"}</span>
                                <input 
                                    type="file" 
                                    accept=".html"
                                    required
                                    onChange={e => setFormData({...formData, file: e.target.files[0]})}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={uploading} className="submit-button">
                            {uploading ? 'Uploading...' : 'Upload Simulation'}
                        </button>
                    </form>
                </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default SimulationHub;
