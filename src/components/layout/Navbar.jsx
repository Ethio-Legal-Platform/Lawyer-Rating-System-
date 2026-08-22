import React from 'react';

export default function Navbar({ 
  user, 
  page, 
  onNavigate, 
  onSignIn, 
  onSignOut,
  onOpenProfile
}) {
  return (
    <header className="lex-navbar">
      <div className="lex-nav-container">
        {/* Brand Logo */}
        <button
          type="button"
          className="lex-logo-btn"
          onClick={() => onNavigate('home')}
        >
          <div className="lex-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3V21M12 3L4 7M12 3L20 7M4 7V11C4 13.2091 7.58172 15 12 15C16.4183 15 20 13.2091 20 11V7M4 7L12 11M20 7L12 11M7 18.5C7 19.3284 9.23858 20 12 20C14.7614 20 17 19.3284 17 18.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="lex-logo-text">
            <span className="lex-logo-title">LEX</span>
            <span className="lex-logo-subtitle">Find. Review. Trust.</span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="lex-nav-menu">
          <button
            type="button"
            className={`lex-nav-link${page === 'home' ? ' active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={`lex-nav-link${page === 'directory' ? ' active' : ''}`}
            onClick={() => onNavigate('directory')}
          >
            Lawyers
          </button>
          <button
            type="button"
            className={`lex-nav-link${page === 'qa' ? ' active' : ''}`}
            onClick={() => onNavigate('qa')}
          >
            Q&A
          </button>
          <button
            type="button"
            className={`lex-nav-link${page === 'guides' ? ' active' : ''}`}
            onClick={() => onNavigate('guides')}
          >
            Resources
          </button>
          <button
            type="button"
            className={`lex-nav-link${page === 'about' ? ' active' : ''}`}
            onClick={() => onNavigate('about')}
          >
            About Us
          </button>
          <button
            type="button"
            className="lex-nav-link"
            onClick={() => onNavigate('about')}
          >
            Contact
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="lex-nav-actions">
          {/* Search Trigger */}
          <button
            type="button"
            className="lex-icon-btn"
            onClick={() => onNavigate('directory')}
            title="Search Lawyers"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {user ? (
            <div className="lex-user-profile-group">
              <button 
                type="button"
                className="lex-user-card-btn"
                onClick={onOpenProfile}
                title="View & Edit Profile"
              >
                <img
                  src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt={user.name}
                  className="lex-user-avatar"
                  onError={e => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                  }}
                />
                <span className="lex-user-name">{user.name}</span>
              </button>
              <button 
                type="button" 
                className="lex-btn-outline-sm" 
                onClick={onSignOut}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="lex-auth-group">
              <button 
                type="button" 
                className="lex-nav-login-btn" 
                onClick={() => onSignIn({ tab: 'login' })}
              >
                Login
              </button>
              <button 
                type="button" 
                className="lex-btn-gold" 
                onClick={() => onSignIn({ tab: 'register' })}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
