import React, { useEffect } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';

export default function GuideModal({ guide, onClose, onConsultAdvocate }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!guide) return null;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="lex-guide-reader-modal" role="dialog" aria-modal="true">
        {/* Close Button */}
        <button className="lex-drawer-close" onClick={onClose} aria-label="Close">×</button>

        {/* Hero Header */}
        <div className="lex-guide-modal-header">
          <div className="lex-guide-modal-top-row">
            <span className="lex-guide-cat-badge">{guide.cat}</span>
            <span className="lex-guide-read-time">{guide.read} read</span>
          </div>
          <h2 className="lex-guide-modal-title">{guide.title}</h2>
          <p className="lex-guide-modal-sub">{guide.subtitle}</p>
          <div className="lex-guide-modal-meta">
            <span>Author: <strong>{guide.author}</strong></span>
            <span className="lex-dot">•</span>
            <span>{guide.updated}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="lex-guide-modal-body">
          {/* Executive Summary Box */}
          <div className="lex-info-card" style={{ marginBottom: '2.4rem' }}>
            <h4 className="lex-info-card-title">Executive Summary</h4>
            <p style={{ fontSize: '1.35rem', lineHeight: '1.6' }}>{guide.summary}</p>
          </div>

          {/* Governing Proclamations */}
          {guide.proclamations && guide.proclamations.length > 0 && (
            <div className="lex-info-card" style={{ marginBottom: '2.4rem' }}>
              <h4 className="lex-info-card-title">Governing Ethiopian Statutes & Proclamations</h4>
              <ul className="lex-simple-list">
                {guide.proclamations.map((p, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ color: '#2563EB', fontWeight: 800 }}>§</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Sections */}
          {guide.sections && guide.sections.map((sec, idx) => (
            <div key={idx} className="lex-guide-section-block">
              <h3 className="lex-section-heading" style={{ fontSize: '1.6rem', marginTop: '2rem' }}>{sec.heading}</h3>
              <p className="lex-about-text" style={{ fontSize: '1.4rem', lineHeight: '1.65' }}>{sec.content}</p>
              {sec.alert && (
                <div className="lex-privacy-notice-box" style={{ background: '#FFFBEB', borderColor: '#FCD34D' }}>
                  <span style={{ fontSize: '1.6rem' }}>ℹ️</span>
                  <div>
                    <strong style={{ color: '#92400E', display: 'block', marginBottom: '0.2rem' }}>Important Legal Note:</strong>
                    <span style={{ color: '#78350F' }}>{sec.alert.text}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Key Takeaways & Checklist */}
          {guide.keyTakeaways && (
            <div className="lex-info-card" style={{ margin: '2.4rem 0' }}>
              <h4 className="lex-info-card-title">Key Takeaways & Citizen Checklist</h4>
              <ul className="lex-check-list">
                {guide.keyTakeaways.map((item, idx) => (
                  <li key={idx}>
                    <span className="lex-check-icon">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQs */}
          {guide.faqs && guide.faqs.length > 0 && (
            <div className="lex-guide-faqs-block" style={{ margin: '2.4rem 0' }}>
              <h3 className="lex-section-heading">Frequently Asked Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
                {guide.faqs.map((faq, idx) => (
                  <div key={idx} className="lex-info-card">
                    <h5 className="lex-info-card-title">Q: {faq.q}</h5>
                    <p style={{ fontSize: '1.35rem', color: '#475569' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advocate Consultation CTA */}
          <div className="lex-cta-banner" style={{ margin: '3rem 0 1rem 0', padding: '2.8rem 2rem' }}>
            <div className="lex-cta-info">
              <h3 className="lex-cta-title" style={{ fontSize: '2rem' }}>Need Personalized Legal Advice in {guide.cat}?</h3>
              <p className="lex-cta-sub">
                Connect with licensed Ethiopian advocates specialized in {guide.cat} to represent your case or review your contracts.
              </p>
            </div>
            <button
              type="button"
              className="lex-btn-dark-lg"
              onClick={() => {
                onClose();
                if (onConsultAdvocate) onConsultAdvocate(guide.cat);
              }}
            >
              Find {guide.cat} Advocates →
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
