import React from 'react';

export default function Navbar({ user, page, onNavigate, onSignIn, onSignOut }) {
  return (
    <nav className="avvo-nav">
      <div className="avvo-nav-inner">
        <button
          className="avvo-logo"
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="avvo-logo-icon">⚖</span>
          <span>LEX-RATING</span>
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
          {user ? (
            <>
              <div className="avvo-nav-user">
                <img
                  src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                  alt={user.name}
                  className="avvo-nav-avatar"
                  onError={e => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                  }}
                />
                <span className="avvo-nav-username">{user.name}</span>
                {user.role === 'lawyer' && (
                  <span
                    style={{
                      background: '#f55d25',
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 99
                    }}
                  >
                    Advocate
                  </span>
                )}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={onSignIn}>
                Sign In
              </button>
              <button className="btn btn-primary btn-sm" onClick={onSignIn}>
                For Lawyers
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
