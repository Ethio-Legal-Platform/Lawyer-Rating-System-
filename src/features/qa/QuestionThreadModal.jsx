import React, { useState, useEffect, useCallback } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import { api } from '../../services/api';

export default function QuestionThreadModal({
  questionId,
  initialQuestion = null,
  currentUser,
  onClose,
  onRefreshList,
  onOpenAuth
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(!initialQuestion);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadQuestion = useCallback(async () => {
    try {
      const { ok, data } = await api.getQuestionById(questionId);
      if (ok && data) {
        setQuestion(data);
      } else if (initialQuestion) {
        setQuestion(initialQuestion);
      }
    } catch (e) {
      console.error('Error fetching question thread:', e);
      if (initialQuestion) setQuestion(initialQuestion);
    } finally {
      setLoading(false);
    }
  }, [questionId, initialQuestion]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleUpvote = async (answerId) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    try {
      await api.upvoteAnswer(questionId, answerId, currentUser.id);
      loadQuestion();
      if (onRefreshList) onRefreshList();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublish = async () => {
    if (!currentUser || currentUser.id !== question?.authorId) return;
    setPublishing(true);
    try {
      await api.publishQuestion(questionId, currentUser.id);
      await loadQuestion();
      if (onRefreshList) onRefreshList();
    } catch (e) {
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!replyText.trim()) return;
    setSubmitting(true);

    try {
      const isLawyer = currentUser.role === 'lawyer';
      const payload = {
        content: replyText.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '_'),
        authorRole: currentUser.role,
        isLawyer: Boolean(isLawyer),
        licenseNumber: isLawyer ? currentUser.licenseNumber : null,
        specialization: isLawyer ? currentUser.specialization : null,
        elo: isLawyer ? currentUser.elo : null,
        profilePic: null,
        city: currentUser.city || 'Ethiopia'
      };

      const { ok } = await api.addAnswer(questionId, payload);
      if (ok) {
        setReplyText('');
        await loadQuestion();
        if (onRefreshList) onRefreshList();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!question && loading) {
    return (
      <ModalBackdrop onClose={onClose}>
        <div className="qa-thread-modal" style={{ padding: '6rem', textAlign: 'center' }}>
          <div className="loading-dots"><span/><span/><span/></div>
          <p style={{ color: 'var(--text-muted)', marginTop: '1.2rem' }}>Loading question discussion…</p>
        </div>
      </ModalBackdrop>
    );
  }

  if (!question) return null;

  const answers = Array.isArray(question.answers) ? question.answers : [];
  const lawyerAnswers = answers.filter(a => a.isLawyer || a.authorRole === 'lawyer');
  const isAuthor = currentUser && currentUser.id === question.authorId;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="qa-thread-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="qa-thread-header">
          <div className="qa-thread-badges">
            <span className="qa-tag gold">{question.category} Law</span>
            {question.isPrivate ? (
              <span className="qa-pill-private">Private Consultation</span>
            ) : (
              <span className="qa-pill-public">Public Forum</span>
            )}
          </div>
          <h2 className="qa-thread-title">{question.title}</h2>
          <div className="qa-thread-meta">
            <span>Location: <strong>{question.city || 'Ethiopia'}</strong></span>
            <span>·</span>
            <span>Asked by <strong>{question.authorName || 'Litigant'}</strong></span>
            <span>·</span>
            <span>{new Date(question.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>·</span>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{answers.length} Responses</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        {/* Body */}
        <div className="qa-thread-body">
          {/* Question Details Card */}
          <div className="qa-question-box">
            <div className="qa-question-box-label">Inquiry Facts & Details</div>
            <p className="qa-question-desc">{question.description}</p>
          </div>

          {/* Author Publish-to-Public Banner for Private Inquiries */}
          {question.isPrivate && isAuthor && (
            <div className="qa-publish-banner">
              <div>
                <div className="qa-publish-title">Share this Legal Guidance with the Public?</div>
                <div className="qa-publish-sub">
                  Once published, this question and advocate replies will help other citizens with similar legal questions.
                </div>
              </div>
              <button
                className="btn btn-gold btn-sm"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? 'Publishing…' : 'Publish to Public Forum'}
              </button>
            </div>
          )}

          {/* Answers Header */}
          <div className="qa-answers-header">
            <div className="qa-answers-title">
              <span>Legal Responses & Answers</span>
              <span className="qa-answers-count">({answers.length})</span>
            </div>
            {lawyerAnswers.length > 0 && (
              <span className="qa-advocate-badge-count">
                {lawyerAnswers.length} Verified Advocate Response{lawyerAnswers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* All Answers / Responses List */}
          {answers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {answers.map(ans => {
                const isLawyerAns = Boolean(ans.isLawyer || ans.authorRole === 'lawyer');
                const hasUpvoted = currentUser && Array.isArray(ans.upvotedBy) && ans.upvotedBy.includes(currentUser.id);
                return (
                  <div
                    key={ans.id}
                    className={`qa-response-attached-block ${isLawyerAns ? 'advocate-block' : 'community-block'}`}
                  >
                    {/* Respondent Account Profile Header */}
                    <div className="qa-account-header-bar">
                      <div className="qa-account-info-col">
                        <div className="qa-account-identity-row">
                          <span className="qa-account-fullname">{ans.authorName || (isLawyerAns ? 'Licensed Advocate' : 'Litigant')}</span>
                          {ans.authorUsername && (
                            <span className="qa-account-handle">@{ans.authorUsername}</span>
                          )}
                          {isLawyerAns ? (
                            <>
                              {ans.specialization && (
                                <span className="qa-tag-spec">{ans.specialization} Law</span>
                              )}
                            </>
                          ) : (
                            <span className="qa-tag-community-role">Litigant / Citizen Contributor</span>
                          )}
                        </div>
                        <div className="qa-account-details-sub">
                          {isLawyerAns && ans.elo && (
                            <span className="qa-account-elo-chip">
                              Advocate ELO: <strong>{ans.elo}</strong>
                            </span>
                          )}
                          <span className="qa-account-loc">Jurisdiction: {ans.city || 'Ethiopia'}</span>
                          <span className="qa-account-date">
                            Responded: {new Date(ans.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attached Legal Analysis / Response Body */}
                    <div className="qa-attached-content-box">
                      <div className="qa-opinion-label">
                        {isLawyerAns ? 'Verified Legal Opinion & Statutory Citation:' : 'Community Perspective & Insight:'}
                      </div>
                      <div className="qa-opinion-text">{ans.content}</div>

                      <div className="qa-attached-footer-bar">
                        <span className="qa-footer-auth-note">
                          {isLawyerAns ? 'Authentic Ministry of Justice advocate record' : 'Community contributor response'}
                        </span>
                        <button
                          className={`qa-upvote-btn${hasUpvoted ? ' upvoted' : ''}`}
                          onClick={() => handleUpvote(ans.id)}
                          title={currentUser ? (hasUpvoted ? 'Remove helpful vote' : 'Mark as helpful') : 'Sign in to mark as helpful'}
                        >
                          <span>Helpful</span>
                          <strong className="qa-upvote-count">({ans.upvotes || 0})</strong>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="qa-no-answers">
              <h4>No responses yet</h4>
              <p>
                {question.isPrivate
                  ? 'Nearby advocates have received your private inquiry and will respond directly.'
                  : 'Be the first to provide certified legal guidance or community insights on this matter.'}
              </p>
            </div>
          )}

          {/* Reply Submission Box */}
          {currentUser ? (
            <div className="qa-reply-box">
              <div className="qa-reply-title">
                {currentUser.role === 'lawyer'
                  ? `Provide Legal Advice as Advocate ${currentUser.name}`
                  : `Post a Reply as ${currentUser.name}`}
              </div>
              <p className="qa-reply-sub">
                {currentUser.role === 'lawyer'
                  ? 'Your response will be attached to your verified Ministry of Justice credentials and ELO ranking.'
                  : 'Share your perspective, question clarification, or legal experience.'}
              </p>

              <form onSubmit={handlePostAnswer}>
                <textarea
                  className="qa-reply-textarea"
                  rows={4}
                  placeholder={
                    currentUser.role === 'lawyer'
                      ? 'Write your legal analysis citing relevant Ethiopian proclamations or civil/penal codes…'
                      : 'Write your reply or clarification here…'
                  }
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  required
                />

                <div className="qa-reply-action-row">
                  <span className="qa-reply-hint">
                    Respondent Account: <strong>{currentUser.name}</strong> ({currentUser.role === 'lawyer' ? 'Licensed Advocate' : 'Litigant'})
                  </span>
                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={submitting || !replyText.trim()}
                  >
                    {submitting ? 'Submitting…' : currentUser.role === 'lawyer' ? 'Submit Advocate Analysis' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="qa-signin-prompt">
              <h3>Sign In to Answer or Comment</h3>
              <p>
                Registered litigants and licensed advocates can answer or comment on questions. Unregistered visitors can browse all discussions.
              </p>
              <button className="btn btn-gold" onClick={onOpenAuth}>
                Sign In / Register &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
