import React, { useState } from "react";
import { ArrowLeft, Mic, Brain, BookOpen } from 'lucide-react';

const InterviewMode = () => {
  const [started, setStarted] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");

  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;

  const speak = (text) => {
    if (!text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(u);
  };

  const startInterview = async () => {
    if (!topic) {
      alert("Please enter a subject");
      return;
    }

    const res = await fetch("/api/interview/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty }),
    });

    const data = await res.json();
    setStarted(true);
    setQuestion(data.question);
    speak(data.question);
  };

  const startListening = () => {
    setListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      const answer = event.results[0][0].transcript;
      setTranscript(answer);
      setListening(false);

      const res = await fetch("/api/interview/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          difficulty,
          previous_question: question,
          answer,
        }),
      });

      const data = await res.json();

      setFeedback(`Score: ${data.score}/10 — ${data.feedback}`);
      setQuestion(data.next_question);
      speak(data.next_question);
    };
  };

  if (!started) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '2rem 1rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 200px)'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '3rem',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mic size={32} style={{ color: '#2563eb' }} />
              </div>

              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>
                Interview / Viva Practice
              </h2>

              <p style={{
                fontSize: '1rem',
                color: '#64748b',
                marginBottom: '2rem',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                Practice answering questions in a real interview-style environment
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '0.5rem'
                }}>
                  Subject
                  <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>
                </label>
                <input
                  placeholder="e.g., Operating Systems"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '0.5rem'
                }}>
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <button
                onClick={startInterview}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div style={{
              width: '1px',
              height: '1.5rem',
              backgroundColor: '#e2e8f0'
            }}></div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0
            }}>
              Interview Practice Session
            </h1>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.875rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '0.5rem'
            }}>
              <BookOpen size={16} style={{ color: '#64748b' }} />
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                {topic}
              </span>
            </div>
            <div style={{
              padding: '0.5rem 0.875rem',
              backgroundColor: difficulty === 'Easy' ? '#dcfce7' : difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
              color: difficulty === 'Easy' ? '#16a34a' : difficulty === 'Medium' ? '#ca8a04' : '#dc2626',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {difficulty}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        padding: '2rem 1rem',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={20} style={{ color: '#2563eb' }} />
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#0f172a',
              margin: 0
            }}>
              AI Question
            </h3>
          </div>
          <p style={{
            fontSize: '1rem',
            color: '#334155',
            lineHeight: '1.6',
            margin: 0
          }}>
            {question}
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={startListening}
            disabled={listening}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              background: listening ? '#cbd5e1' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: listening ? 'not-allowed' : 'pointer',
              boxShadow: listening ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s',
              opacity: listening ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!listening) {
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!listening) {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <Mic size={20} />
            {listening ? "Listening..." : "Answer by Voice"}
          </button>
        </div>

        {transcript && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '1rem'
            }}>
              Your Answer
            </h4>
            <p style={{
              fontSize: '1rem',
              color: '#334155',
              lineHeight: '1.6',
              margin: 0
            }}>
              {transcript}
            </p>
          </div>
        )}

        {feedback && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '1rem'
            }}>
              Feedback
            </h4>
            <p style={{
              fontSize: '1rem',
              color: '#334155',
              lineHeight: '1.6',
              margin: 0
            }}>
              {feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewMode;