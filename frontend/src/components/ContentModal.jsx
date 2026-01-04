import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Play, BookOpen, Brain, GraduationCap, Loader2, ExternalLink, Trophy } from 'lucide-react';
import QuizModal from './QuizModal';

const ContentModal = ({ 
  isOpen, 
  onClose, 
  data, 
  topic, 
  subtopic, 
  onModeChange, 
  loading,
  currentMode = 'story',
  difficulty,
  roadmapId
}) => {
  const [showQuiz, setShowQuiz] = useState(false);

  if (!isOpen) return null;

  const modes = [
    { id: 'story', label: 'Story Mode', icon: BookOpen, color: 'purple', desc: 'Learn through analogies' },
    { id: 'deep', label: 'Deep Dive', icon: Brain, color: 'blue', desc: 'Technical depth' },
    { id: 'exam', label: 'Exam Prep', icon: GraduationCap, color: 'green', desc: 'Quick revision' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl bg-[#0f0f1a] rounded-2xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-[#1a1a2e] to-[#0f0f1a] border-b border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white truncate">{subtopic || 'Loading...'}</h2>
                <p className="text-sm text-gray-400 mt-1">{topic}</p>
              </div>
              <button 
                onClick={onClose}
                className="ml-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 mt-4">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = currentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    disabled={loading}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? `bg-${mode.color}-500/20 text-${mode.color}-400 border border-${mode.color}-500/50` 
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-300'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    style={isActive ? {
                      backgroundColor: mode.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' : 
                                       mode.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 
                                       'rgba(34, 197, 94, 0.2)',
                      color: mode.color === 'purple' ? '#c084fc' : 
                             mode.color === 'blue' ? '#60a5fa' : 
                             '#4ade80',
                      borderColor: mode.color === 'purple' ? 'rgba(168, 85, 247, 0.5)' : 
                                   mode.color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : 
                                   'rgba(34, 197, 94, 0.5)'
                    } : {}}
                  >
                    <Icon size={16} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f0f1a]/95 backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-blue-400 font-medium">Generating content...</p>
                <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
              </div>
            )}

            {/* Scrollable Content */}
            {data && !loading && (
              <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="p-6 md:p-8 max-w-4xl mx-auto">
                  
                  {/* Media Grid */}
                  {(data.videos?.length > 0) && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Play size={20} className="text-red-500" />
                        Related Videos
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.videos.map((vid, i) => (
                          <a
                            key={i}
                            href={vid}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-video rounded-xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-red-500/50 transition-all"
                          >
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 text-white ml-1" fill="white" />
                              </div>
                              <span className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                Watch on YouTube <ExternalLink size={12} />
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="prose-custom">
                    <ReactMarkdown>{data.content}</ReactMarkdown>
                  </div>

                  {/* Quiz Button */}
                  <div className="mt-12 pt-8 border-t border-gray-800 flex justify-center">
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-bold shadow-lg shadow-blue-500/20 flex items-center gap-3 transition-all transform hover:scale-105"
                    >
                      <Trophy size={24} />
                      Attempt Quiz for {subtopic}
                    </button>
                  </div>

                  {/* Bottom Padding */}
                  <div className="h-8" />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!data && !loading && (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No content available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <QuizModal 
        isOpen={showQuiz} 
        onClose={() => setShowQuiz(false)}
        topic={topic}
        subtopic={subtopic}
        difficulty={difficulty}
        language="English" // Defaulting to English for now as it's not passed explicitly
        roadmapId={roadmapId}
      />
    </div>
  );
};

export default ContentModal;
