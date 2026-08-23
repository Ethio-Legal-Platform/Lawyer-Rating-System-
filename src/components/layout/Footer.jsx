import React from 'react';

export default function Footer({ onNavigate, onSearchSpec, onOpenAuth }) {
  return (
    <footer className="lex-footer">
      <div className="lex-footer-container">
        {/* Brand Column */}
        <div className="lex-footer-col lex-footer-brand-col">
          <div 
            className="lex-footer-logo"
            onClick={() => onNavigate && onNavigate('home')} 
            style={{ cursor: 'pointer' }}
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
          </div>
          <p className="lex-footer-desc">
            LEX is a platform that promotes trust and transparency between clients and legal professionals in Ethiopia.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="lex-footer-col">
          <h4 className="lex-footer-title">Quick Links</h4>
          <ul className="lex-footer-links">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>Home</a></li>
            <li><a href="#lawyers" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('directory'); }}>Lawyers</a></li>
            <li><a href="#reviews" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('directory'); }}>Reviews</a></li>
            <li><a href="#qa" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('qa'); }}>Q&A</a></li>
            <li><a href="#resources" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('guides'); }}>Resources</a></li>
          </ul>
        </div>

        {/* For Lawyers Column */}
        <div className="lex-footer-col">
          <h4 className="lex-footer-title">For Lawyers</h4>
          <ul className="lex-footer-links">
            <li><a href="#create" onClick={(e) => { e.preventDefault(); onOpenAuth && onOpenAuth(); }}>Create Profile</a></li>
            <li><a href="#verification" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }}>Verification</a></li>
            <li><a href="#how" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }}>How It Works</a></li>
            <li><a href="#guidelines" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('guides'); }}>Lawyer Guidelines</a></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="lex-footer-col">
          <h4 className="lex-footer-title">Support</h4>
          <ul className="lex-footer-links">
            <li><a href="#help" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }}>Help Center</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }}>Contact Us</a></li>
            <li><a href="#terms" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }}>Terms of Use</a></li>
            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }}>Privacy Policy</a></li>
          </ul>
        </div>

        {/* Social Column */}
        <div className="lex-footer-col lex-footer-social-col">
          <h4 className="lex-footer-title">Follow Us</h4>
          <div className="lex-footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="lex-social-icon" aria-label="Facebook">f</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="lex-social-icon" aria-label="Twitter">t</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="lex-social-icon" aria-label="LinkedIn">in</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="lex-social-icon" aria-label="Instagram">ig</a>
          </div>
        </div>
      </div>

      <div className="lex-footer-bottom">
        <p>© 2024 LEX. All rights reserved.</p>
      </div>
    </footer>
  );
}
