import React from 'react';

export default function Navbar({ 
  user, 
  page, 
  theme = 'dark',
  onToggleTheme,
  onNavigate, 
  onSignIn, 
  onSignOut,
  onOpenProfile
}) {
  return (
    <nav className="avvo-nav">
      <div className="avvo-nav-inner">
        <button
          className="avvo-logo"
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img
            src="/images/lex-logo.png"
            alt="LEX - Lawyer Rating Logo"
            className="avvo-logo-img"
          />
          <div className="avvo-logo-text-wrap">
            <span className="avvo-logo-title">LEX-RATING</span>
            <span className="avvo-logo-sub">Lawyer Experience</span>
          </div>
        </button>

        <div className="avvo-nav-links">
          <button
            className={`avvo-nav-link${page === 'directory' ? ' active' : ''}`}
            onClick={() => onNavigate('directory')}
          >
            Find a Lawyer
          </button>
          <button
            className={`avvo-nav-link${page === 'qa' ? ' active' : ''}`}
            onClick={() => onNavigate('qa')}
          >
            Legal Q&A
          </button>
          <button
            className={`avvo-nav-link${page === 'guides' ? ' active' : ''}`}
            onClick={() => onNavigate('guides')}
          >
            Legal Guides
          </button>
          <button
            className={`avvo-nav-link${page === 'about' ? ' active' : ''}`}
            onClick={() => onNavigate('about')}
          >
            About
          </button>
        </div>

        <div className="avvo-nav-actions">
          {/* Theme Toggle Button (Light / Dark Mode) */}
          <button
            type="button"
            className="avvo-theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="theme-toggle-icon">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="theme-toggle-text">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {user ? (
            <>
              {/* Clickable Profile Card to edit profile */}
              <button 
                type="button"
                className="avvo-nav-user avvo-nav-user-clickable"
                onClick={onOpenProfile}
                title="Click to view and edit your profile"
              >
                <img
                  src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt={user.name}
                  className="avvo-nav-avatar"
                  onError={e => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                  }}
                />
                <div className="avvo-nav-user-info">
                  <span className="avvo-nav-username">{user.name}</span>
                  <span className="avvo-nav-edit-hint">Edit Profile ✎</span>
                </div>
                {user.role === 'lawyer' && (
                  <span className="avvo-nav-role-badge lawyer">
                    Advocate
                  </span>
                )}
              </button>

              <button className="btn btn-ghost btn-sm" onClick={onSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => onSignIn({ tab: 'login' })}>
                Sign In
              </button>
              <button className="btn btn-gold btn-sm" onClick={() => onSignIn({ tab: 'register', role: 'lawyer' })}>
                For Lawyers
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
