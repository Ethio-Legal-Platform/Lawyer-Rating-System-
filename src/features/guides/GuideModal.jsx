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
        <div
          className="guide-reader-header"
          style={{ background: `linear-gradient(135deg, #003366, ${guide.color || '#005a9e'})` }}
        >
          <div className="guide-cat">{guide.cat}</div>
          <h2 className="guide-reader-title">{guide.title}</h2>
          <p className="guide-reader-subtitle">{guide.subtitle}</p>
          <div className="guide-reader-meta">
            <span>Author: {guide.author}</span>
            <span>Date: {guide.updated}</span>
            <span>Read time: {guide.read}</span>
          </div>
          <button className="lawyer-modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        {/* Body */}
        <div className="guide-reader-body">
          {/* Summary Box */}
          <div className="guide-summary-box">
            <strong>Executive Summary</strong>
            {guide.summary}
          </div>

          {/* Proclamations & Statutes cited */}
          {guide.proclamations && guide.proclamations.length > 0 && (
            <div className="guide-proclamations-box">
              <div className="guide-proclamations-title">
                <span>Governing Ethiopian Laws & Proclamations</span>
              </div>
              <ul className="guide-proclamations-list">
                {guide.proclamations.map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Sections */}
          {guide.sections && guide.sections.map((sec, idx) => (
            <div key={idx} className="guide-article-section">
              <h3>{sec.heading}</h3>
              <p>{sec.content}</p>
              {sec.alert && (
                <div className="guide-alert-box">
                  <strong>Important Note:</strong> {sec.alert.text}
                </div>
              )}
            </div>
          ))}

          {/* Key Takeaways */}
          {guide.keyTakeaways && (
            <div className="guide-takeaways-box">
              <div className="guide-takeaways-title">
                <span>Key Takeaways & Checklist</span>
              </div>
              <ul className="guide-takeaways-list">
                {guide.keyTakeaways.map((item, idx) => (
                  <li key={idx}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQs */}
          {guide.faqs && guide.faqs.length > 0 && (
            <div className="guide-faqs-section">
              <h3 className="guide-faqs-title">Frequently Asked Questions</h3>
              {guide.faqs.map((faq, idx) => (
                <div key={idx} className="guide-faq-item">
                  <div className="guide-faq-q">Q: {faq.q}</div>
                  <div className="guide-faq-a">{faq.a}</div>
                </div>
              ))}
            </div>
          )}

          {/* Advocate CTA */}
          <div className="guide-advocate-cta">
            <h4>Need Personalized Representation or Document Review?</h4>
            <p>
              Connect with MoJ-verified Ethiopian advocates specialized in {guide.cat} to represent you or review your legal files.
            </p>
            <button
              className="btn btn-white btn-lg"
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
