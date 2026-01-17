import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Brain, LogOut } from 'lucide-react';
import { resourcesApi } from '../api/resources';
import { useAuth } from '../context/AuthContext';
import './SimulationHub.css';
import './home.css'; // Global/Home styles for Navbar

const SimulationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimulation();
  }, [id]);

  const fetchSimulation = async () => {
    try {
      const data = await resourcesApi.getMetadata(id);
      setSimulation(data);
    } catch (error) {
      console.error("Failed to load simulation", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        background: '#f8fafc', 
        color: '#64748b' 
    }}>
        Loading Simulation...
    </div>
  );
  
  if (!simulation) return <div className="error-state">Simulation not found</div>;

  const fileUrl = `/${simulation.file_path.replace(/\\/g, '/')}`;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Navbar */}
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

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem', gap: '1rem', overflow: 'hidden' }}>
        {/* Header / Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                    onClick={() => navigate('/simulation-hub')}
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
                        padding: '0',
                        fontWeight: '500',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#4f46e5'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#6366f1'}
                >
                    <ArrowLeft size={18} />
                    Back to Hub
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0.5rem 0 0 0' }}>
                    {simulation.title}
                </h2>
            </div>

            <button 
                className="secondary-button"
                onClick={() => document.getElementById('sim-frame').contentWindow.location.reload()}
                title="Reset"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = 'white';
                }}
            >
                <RotateCcw size={16} />
                Reset Simulation
            </button>
        </div>

        {/* Simulation Frame */}
        <div style={{ 
            flex: 1, 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            position: 'relative'
        }}>
            <iframe
            id="sim-frame"
            src={fileUrl}
            title={simulation.title}
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
        </div>
      </div>
    </div>
  );
};

export default SimulationView;
