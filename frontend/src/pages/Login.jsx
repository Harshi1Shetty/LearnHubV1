import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin, signup as apiSignup } from '../api/auth';
import { Brain, Target, TrendingUp, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = isLogin 
        ? await apiLogin(username, password)
        : await apiSignup(username, password);
      
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding & Info */}
      <div className="branding-section">
        {/* Subtle background pattern */}
        <div className="background-pattern">
          <div className="pattern-circle pattern-circle-1"></div>
          <div className="pattern-circle pattern-circle-2"></div>
        </div>

        <div className="branding-content">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo-icon">
              <Brain className="icon" />
            </div>
            <span className="logo-text">LearnHub</span>
          </div>

          {/* Main Heading */}
          <div className="heading-container">
            <h1 className="main-heading">
              Personalized Learning.<br />
              Powered by AI.
            </h1>
            <p className="main-subtext">
              Adaptive learning paths, intelligent assessments, and AI-generated roadmaps tailored to your goals.
            </p>
          </div>

          {/* Features */}
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon feature-icon-blue">
                <Target className="icon" />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">AI-Generated Learning Roadmaps</h3>
                <p className="feature-description">Personalized pathways based on your current knowledge and goals</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon feature-icon-indigo">
                <BarChart3 className="icon" />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">Skill Gap Analysis</h3>
                <p className="feature-description">Identify knowledge gaps and receive targeted recommendations</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon feature-icon-violet">
                <TrendingUp className="icon" />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">Progress Insights & Tracking</h3>
                <p className="feature-description">Visualize your learning journey with detailed analytics</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon feature-icon-purple">
                <CheckCircle className="icon" />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">Personalized Quizzes</h3>
                <p className="feature-description">Adaptive assessments that adjust to your skill level in real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="branding-footer">
          <p className="footer-text">
            Trusted by over 50,000 learners worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="form-section">
        <div className="form-wrapper">
          {/* Mobile Logo */}
          <div className="mobile-logo">
            <div className="logo-icon">
              <Brain className="icon" />
            </div>
            <span className="logo-text">LearnHub</span>
          </div>

          {/* Auth Card */}
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="auth-subtitle">
                {isLogin ? 'Access your personalized learning journey' : 'Start your adaptive learning experience'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight className="button-icon" />}
              </button>
            </form>

            <div className="toggle-auth">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="toggle-button"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          {/* Mobile Features Preview */}
          <div className="mobile-features">
            <div className="mobile-feature-item">
              <CheckCircle className="mobile-feature-icon" />
              <span>AI-powered adaptive learning</span>
            </div>
            <div className="mobile-feature-item">
              <CheckCircle className="mobile-feature-icon" />
              <span>Personalized study roadmaps</span>
            </div>
            <div className="mobile-feature-item">
              <CheckCircle className="mobile-feature-icon" />
              <span>Progress tracking & analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;