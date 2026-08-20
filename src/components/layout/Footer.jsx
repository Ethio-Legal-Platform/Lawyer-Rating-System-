import React from 'react';
import { LEGAL_GUIDES } from '../../data/legalGuides';

export default function Footer({ onNavigate, onSearchSpec, onOpenAuth }) {
  return (
    <footer className="avvo-footer">
      <div className="avvo-footer-grid">
        <div className="avvo-footer-brand">
          <div 
            className="avvo-footer-logo-wrap" 
            onClick={() => onNavigate && onNavigate('home')} 
            style={{ cursor: 'pointer' }}
          >
            <img src="/images/lex-logo.png" alt="LEX Lawyer Rating Logo" className="avvo-footer-logo-img" />
            <div className="avvo-footer-logo">LEX-RATING</div>
          </div>
          <p className="avvo-footer-tagline">
            Ethiopia's official B2G legal directory. Powered by the <strong>LEX (Lawyer Experience)</strong> rating system — verified by the Ministry of Justice with real-time court performance data.
          </p>
        </div>

        <div className="avvo-footer-col">
          <h4>Find a Lawyer</h4>
          <ul>
            {['Criminal Law', 'Corporate Law', 'Family Law', 'Civil Law'].map(s => {
              const spec = s.replace(' Law', '');
              return (
                <li key={s}>
                  <a
                    href="#directory"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSearchSpec) onSearchSpec(spec);
                      if (onNavigate) onNavigate('directory');
                    }}
                  >
                    {s}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="avvo-footer-col">
          <h4>Legal Topics</h4>
          <ul>
            {LEGAL_GUIDES.slice(0, 4).map(g => (
              <li key={g.title}>
                <a
                  href="#guides"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('guides');
                  }}
                >
                  {g.cat}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="avvo-footer-col">
          <h4>Platform</h4>
          <ul>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('about');
                }}
              >
                About LEX-RATING
              </a>
            </li>
            <li>
              <a
                href="#directory"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('directory');
                }}
              >
                Lawyer Directory
              </a>
            </li>
            <li>
              <a
                href="#qa"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('qa');
                }}
              >
                Legal Q&A
              </a>
            </li>
            <li>
              <a
                href="#auth"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenAuth) onOpenAuth();
                }}
              >
                For Lawyers
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="avvo-footer-bottom">
        <span>© 2026 Ministry of Justice • Court Automation Department • Federal Democratic Republic of Ethiopia</span>
        <span>Privacy Policy • Terms of Use • Federal Registry</span>
      </div>
    </footer>
  );
}
