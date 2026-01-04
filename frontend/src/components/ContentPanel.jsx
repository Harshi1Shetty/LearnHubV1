import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Play, BookOpen, Brain, GraduationCap, Loader2, ExternalLink, Trophy, Image as ImageIcon } from 'lucide-react';
import QuizModal from './QuizModal';
import './ContentPanel.css';

const ContentPanel = ({ data, topic, subtopic, onModeChange, loading, currentMode, difficulty, language, roadmapId }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  
  if (!subtopic) {
    return (
      <div className="content-panel-empty">
        <div className="empty-icon-container">
          <BookOpen size={64} className="empty-icon" />
        </div>
        <h3 className="empty-title">Select a Topic to Begin</h3>
        <p className="empty-description">Click on any node from the learning path to explore detailed content</p>
      </div>
    );
  }

  return (
    <div className="content-panel-container">
      {/* Header */}
      <div className="content-panel-header">
        <h2 className="content-title">{subtopic}</h2>
        <p className="content-subtitle">{topic}</p>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <button 
          onClick={() => onModeChange('story')} 
          className={`mode-button ${currentMode === 'story' ? 'mode-button-active mode-button-story' : 'mode-button-inactive mode-button-story-inactive'}`}
        >
          <BookOpen size={16} />
          <span>Story Mode</span>
        </button>
        <button 
          onClick={() => onModeChange('deep')} 
          className={`mode-button ${currentMode === 'deep' ? 'mode-button-active mode-button-deep' : 'mode-button-inactive mode-button-deep-inactive'}`}
        >
          <Brain size={16} />
          <span>Deep Dive</span>
        </button>
        <button 
          onClick={() => onModeChange('exam')} 
          className={`mode-button ${currentMode === 'exam' ? 'mode-button-active mode-button-exam' : 'mode-button-inactive mode-button-exam-inactive'}`}
        >
          <GraduationCap size={16} />
          <span>Exam Prep</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {loading ? (
          <div className="content-loading">
            <Loader2 size={48} className="loading-spinner-large" />
            <p className="loading-message">Generating personalized content...</p>
          </div>
        ) : data ? (
          <div className="content-body">
            {/* Images Section */}
            {data.images?.length > 0 && (
              <div className="content-section">
                <div className="section-header">
                  <ImageIcon size={18} className="section-icon" />
                  <h3 className="section-title">Visual Aids</h3>
                </div>
                <div className="images-grid">
                  {data.images.map((img, i) => (
                    <div key={i} className="image-card">
                      <img 
                        src={img} 
                        alt={`Visual aid ${i + 1}`}
                        className="image-content"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {data.videos?.length > 0 && (
              <div className="content-section">
                <div className="section-header">
                  <Play size={18} className="section-icon" />
                  <h3 className="section-title">Related Videos</h3>
                </div>
                <div className="videos-list">
                  {data.videos.map((vid, i) => (
                    <a 
                      key={i} 
                      href={vid} 
                      target="_blank" 
                      rel="noreferrer"
                      className="video-link"
                    >
                      <div className="video-icon-wrapper">
                        <Play size={20} className="video-icon" />
                      </div>
                      <span className="video-title">{vid.replace('https://www.youtube.com/watch?v=', 'YouTube: ')}</span>
                      <ExternalLink size={16} className="external-icon" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="content-section">
              <div className="markdown-content">
                <ReactMarkdown>{data.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Sticky Quiz Button */}
      {data && !loading && (
        <div className="quiz-button-container">
          <button
            onClick={() => setShowQuiz(true)}
            className="quiz-button"
          >
            <Trophy size={20} />
            <span>Test Your Knowledge</span>
          </button>
        </div>
      )}

      <QuizModal 
        isOpen={showQuiz} 
        onClose={() => setShowQuiz(false)}
        topic={topic}
        subtopic={subtopic}
        difficulty={difficulty}
        language={language}
        roadmapId={roadmapId}
      />
    </div>
  );
};

export default ContentPanel;