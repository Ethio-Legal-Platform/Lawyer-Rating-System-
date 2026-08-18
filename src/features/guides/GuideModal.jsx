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
      <div className="guide-reader-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="guide-reader-header">
          <div className="guide-reader-top-row">
            <span className="guide-cat-badge">{guide.cat}</span>
            <span className="guide-read-chip">⏱ {guide.read}</span>
          </div>
          <h2 className="guide-reader-title">{guide.title}</h2>
          <p className="guide-reader-subtitle">{guide.subtitle}</p>
          <div className="guide-reader-meta">
            <span>Author: <strong>{guide.author}</strong></span>
            <span>·</span>
            <span>{guide.updated}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        {/* Body */}
        <div className="guide-reader-body">
          {/* Executive Summary Box */}
          <div className="guide-summary-box">
            <div className="guide-summary-title">Executive Summary</div>
            <p className="guide-summary-text">{guide.summary}</p>
          </div>

          {/* Governing Proclamations & Statutes cited */}
          {guide.proclamations && guide.proclamations.length > 0 && (
            <div className="guide-proclamations-box">
              <div className="guide-proclamations-title">
                Governing Ethiopian Statutes & Proclamations
              </div>
              <ul className="guide-proclamations-list">
                {guide.proclamations.map((p, idx) => (
                  <li key={idx}>
                    <span className="proclamation-bullet">§</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Sections */}
          {guide.sections && guide.sections.map((sec, idx) => (
            <div key={idx} className="guide-article-section">
              <h3 className="guide-section-heading">{sec.heading}</h3>
              <p className="guide-section-content">{sec.content}</p>
              {sec.alert && (
                <div className="guide-alert-box">
                  <div className="guide-alert-icon">⚠️</div>
                  <div>
                    <strong className="guide-alert-title">Important Legal Note:</strong>
                    <div className="guide-alert-text">{sec.alert.text}</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Key Takeaways & Checklist */}
          {guide.keyTakeaways && (
            <div className="guide-takeaways-box">
              <div className="guide-takeaways-title">
                Key Takeaways & Citizen Checklist
              </div>
              <ul className="guide-takeaways-list">
                {guide.keyTakeaways.map((item, idx) => (
                  <li key={idx}>
                    <span className="takeaway-check">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Frequently Asked Questions */}
          {guide.faqs && guide.faqs.length > 0 && (
            <div className="guide-faqs-section">
              <h3 className="guide-faqs-title">Frequently Asked Questions</h3>
              <div className="guide-faqs-list">
                {guide.faqs.map((faq, idx) => (
                  <div key={idx} className="guide-faq-item">
                    <div className="guide-faq-q">Q: {faq.q}</div>
                    <div className="guide-faq-a">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advocate Consultation CTA */}
          <div className="guide-advocate-cta">
            <div className="guide-cta-content">
              <h4>Need Personalized Legal Advice in {guide.cat}?</h4>
              <p>
                Connect with licensed Ethiopian advocates specialized in {guide.cat} to represent your case or review your contracts.
              </p>
            </div>
            <button
              className="btn btn-gold btn-lg"
              onClick={() => {
                onClose();
                if (onConsultAdvocate) onConsultAdvocate(guide.cat);
              }}
            >
              Find {guide.cat} Advocates &rarr;
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
