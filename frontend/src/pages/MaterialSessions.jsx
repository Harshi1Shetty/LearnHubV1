import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadMaterial, getMaterials } from '../api/materials';
import { Plus, X, FileText, Loader2, ArrowLeft } from 'lucide-react';
import './MaterialSessions.css';

const AddSessionModal = ({ onClose, onUploadSuccess }) => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [difficulty, setDifficulty] = useState('Novice');
    const [interest, setInterest] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            await uploadMaterial(file, difficulty, interest, user.id);
            onUploadSuccess();
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="material-modal-overlay">
            <div className="material-modal-content">
                <div className="material-modal-header">
                    <h3 className="material-modal-title">New Learning Session</h3>
                    <button onClick={onClose} className="material-close-button">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="material-form-group">
                        <label className="material-label">Upload PDF Material</label>
                        <input 
                            type="file" 
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="material-file-input"
                            required
                        />
                    </div>
                    <div className="material-form-group">
                        <label className="material-label">Difficulty Level</label>
                        <select 
                            value={difficulty} 
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="material-select"
                        >
                            <option value="Novice">Novice</option>
                            <option value="Competent">Competent</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </div>
                    <div className="material-form-group">
                        <label className="material-label">Interest (Optional)</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Harry Potter, Soccer, Cooking"
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                            className="material-input"
                        />
                        <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                            We'll explain concepts using analogies from this interest.
                        </small>
                    </div>
                    <button type="submit" className="material-submit-button" disabled={loading}>
                        {loading ? <Loader2 className="spinner" /> : <Plus size={20} />}
                        {loading ? "Processing Material..." : "Create Session"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const MaterialSessions = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        if (!user) return;
        try {
            const data = await getMaterials(user.id);
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [user]);

    const handleSessionClick = (id) => {
        window.location.href = `/roadmap/${id}`; // Redirect to standard Roadmap View
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="header-content">
                     <button onClick={() => window.location.href = '/'} className="back-button" style={{background: 'none', border:'none', cursor:'pointer', marginRight: '1rem'}}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Learn Your Material</h1>
                </div>
            </header>

            <main className="main-content">
                <div className="content-wrapper">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Your Material Sessions</h2>
                            <p className="section-subtitle">Upload PDFs and learn from them interactively</p>
                        </div>
                    </div>

                    <div className="material-grid">
                        <div className="material-card material-add-card" onClick={() => setShowModal(true)}>
                            <div className="material-icon-wrapper">
                                <Plus size={24} />
                            </div>
                            <span style={{fontWeight: 500, color: '#374151'}}>Import New Material</span>
                        </div>

                        {loading ? (
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '2rem'}}>
                                <Loader2 className="spinner" />
                            </div>
                        ) : sessions.map(session => (
                            <div key={session.id} className="material-card" onClick={() => handleSessionClick(session.id)}>
                                <div className="material-icon-wrapper">
                                    <FileText size={24} />
                                </div>
                                <h3 className="material-card-title" title={session.title}>{session.title}</h3>
                                <div className="material-card-meta">
                                    <span>{session.difficulty}</span>
                                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                                </div>
                                {session.interest && (
                                     <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#8b5cf6'}}>
                                        Theme: {session.interest}
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {showModal && (
                <AddSessionModal 
                    onClose={() => setShowModal(false)}
                    onUploadSuccess={fetchSessions}
                />
            )}
        </div>
    );
};

export default MaterialSessions;
