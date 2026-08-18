import React, { useState, useEffect, useCallback } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import { api } from '../../services/api';

export default function QuestionThreadModal({ questionId, currentUser, onClose, onRefreshList, onOpenAuth }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadQuestion = useCallback(async () => {
    try {
      const { ok, data } = await api.getQuestionById(questionId);
      if (ok) setQuestion(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

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
        content: replyText,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorRole: currentUser.role,
        isLawyer: Boolean(isLawyer),
        licenseNumber: isLawyer ? currentUser.licenseNumber : null,
        specialization: isLawyer ? currentUser.specialization : null,
        elo: isLawyer ? currentUser.elo : null,
        profilePic: currentUser.profilePic || null,
        city: currentUser.city || 'Ethiopia'
      };

      const { ok } = await api.addAnswer(questionId, payload);
      if (ok) {
        setReplyText('');
        loadQuestion();
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
        <div className="qa-thread-modal" style={{ padding: '4rem', textAlign: 'center' }}>
          <span className="loading-dots"><span/><span/><span/></span>
        </div>
      </ModalBackdrop>
    );
  }

  if (!question) return null;

  const lawyerAnswers = (question.answers || []).filter(a => a.isLawyer);
  const communityAnswers = (question.answers || []).filter(a => !a.isLawyer);
  const isAuthor = currentUser && currentUser.id === question.authorId;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="qa-thread-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="qa-thread-header">
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div className="qa-tag">{question.category} Law</div>
            {question.isPrivate ? (
              <span style={{ fontSize: '1.2rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.8rem', borderRadius: 99, fontWeight: 700 }}>
                Private Consultation
              </span>
            ) : (
              <span style={{ fontSize: '1.2rem', background: '#f0fdf4', color: '#166534', padding: '0.2rem 0.8rem', borderRadius: 99, fontWeight: 700 }}>
                Public Forum
              </span>
            )}
          </div>
          <h2 className="qa-thread-title">{question.title}</h2>
          <div className="qa-thread-meta">
            <span>Location: {question.city || 'Ethiopia'}</span>
            <span>Asked by {question.authorName || 'Litigant'}</span>
            <span>Date: {new Date(question.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>Responses: {(question.answers || []).length}</span>
          </div>
          <button className="lawyer-modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        {/* Body */}
        <div className="qa-thread-body">
          {/* Question Description Box */}
          <div className="qa-question-box">
            <h4 style={{ fontSize: '1.3rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>
              Question Details & Facts
            </h4>
            <p className="qa-question-desc">{question.description}</p>
          </div>

          {/* Author Publish-to-Public Banner for Private Inquiries */}
          {question.isPrivate && isAuthor && (
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1.5px solid #86efac',
                borderRadius: 8,
                padding: '1.6rem 2rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.2rem'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#166534', marginBottom: '0.2rem' }}>
                  Share this Legal Guidance with the Public?
                </div>
                <div style={{ fontSize: '1.3rem', color: '#15803d' }}>
                  Once you agree, this question and the advocate's response will be published to the public Q&A forum for other citizens to benefit.
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ background: '#16a34a', borderColor: '#16a34a', whiteSpace: 'nowrap' }}
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
              <span>Legal Answers & Discussion</span>
              <span style={{ fontSize: '1.4rem', color: 'var(--gray-500)', fontWeight: 400 }}>
                ({(question.answers || []).length} total)
              </span>
            </div>
            {lawyerAnswers.length > 0 && (
              <span className="qa-advocate-badge-count">
                {lawyerAnswers.length} Verified Advocate Answer{lawyerAnswers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Lawyer Answers (Prominent Top Section) */}
          {lawyerAnswers.map(ans => {
            const hasUpvoted = currentUser && Array.isArray(ans.upvotedBy) && ans.upvotedBy.includes(currentUser.id);
            return (
              <div key={ans.id} className="qa-lawyer-card">
                <div className="qa-lawyer-banner">
                  <div className="qa-lawyer-banner-tag">
                    <span>VERIFIED ADVOCATE ANSWER</span>
                  </div>
                  <span>MoJ Licensed Practitioner</span>
                </div>
                <div className="qa-lawyer-card-inner">
                  <div className="qa-lawyer-header">
                    <img
                      src={ans.profilePic}
                      alt={ans.authorName}
                      className="qa-lawyer-avatar"
                      onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <div className="qa-lawyer-info">
                      <div className="qa-lawyer-name">{ans.authorName}</div>
                      <div className="qa-lawyer-meta-tags">
                        {ans.specialization && <span className="qa-tag-license">{ans.specialization} Advocate</span>}
                        {ans.licenseNumber && <span className="qa-tag-license">License: {ans.licenseNumber}</span>}
                        {ans.elo && <span className="qa-tag-elo">ELO: {ans.elo}</span>}
                        {ans.city && <span style={{ fontSize: '1.2rem', color: 'var(--gray-500)' }}>Location: {ans.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="qa-lawyer-content">{ans.content}</div>
                  <div className="qa-answer-footer">
                    <span>Answered {new Date(ans.createdAt).toLocaleDateString()}</span>
                    <button
                      className="qa-upvote-btn"
                      style={hasUpvoted ? { background: '#e8f4fb', borderColor: 'var(--blue)', color: 'var(--blue)', fontWeight: 800 } : {}}
                      onClick={() => handleUpvote(ans.id)}
                      title={currentUser ? (hasUpvoted ? 'Click to remove upvote' : 'Mark as helpful') : 'Sign in to mark as helpful'}
                    >
                      {hasUpvoted ? 'Helpful (Selected)' : 'Helpful'} ({ans.upvotes || 0})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Community Answers */}
          {communityAnswers.map(ans => {
            const hasUpvoted = currentUser && Array.isArray(ans.upvotedBy) && ans.upvotedBy.includes(currentUser.id);
            return (
              <div key={ans.id} className="qa-client-card">
                <div className="qa-client-header">
                  <img
                    src={ans.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt={ans.authorName}
                    className="qa-client-avatar"
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  <div>
                    <div className="qa-client-name">{ans.authorName}</div>
                    <div className="qa-client-role">Litigant / Community Contributor</div>
                  </div>
                </div>
                <div className="qa-client-content">{ans.content}</div>
                <div className="qa-answer-footer">
                  <span>Posted {new Date(ans.createdAt).toLocaleDateString()}</span>
                  <button
                    className="qa-upvote-btn"
                    style={hasUpvoted ? { background: '#e8f4fb', borderColor: 'var(--blue)', color: 'var(--blue)', fontWeight: 800 } : {}}
                    onClick={() => handleUpvote(ans.id)}
                    title={currentUser ? (hasUpvoted ? 'Click to remove upvote' : 'Mark as helpful') : 'Sign in to mark as helpful'}
                  >
                    {hasUpvoted ? 'Helpful (Selected)' : 'Helpful'} ({ans.upvotes || 0})
                  </button>
                </div>
              </div>
            );
          })}

          {/* No answers yet */}
          {(question.answers || []).length === 0 && (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '2.4rem', textAlign: 'center', color: 'var(--gray-500)' }}>
              <p style={{ fontWeight: 700, fontSize: '1.6rem', color: 'var(--gray-700)', marginBottom: '0.4rem' }}>No responses yet</p>
              <p style={{ fontSize: '1.4rem' }}>
                {question.isPrivate
                  ? 'Nearby advocates have received your inquiry and will respond soon.'
                  : 'Be the first to provide legal guidance or community insight on this matter!'}
              </p>
            </div>
          )}

          {/* Reply Submission Box */}
          {currentUser ? (
            <div className="qa-reply-box">
              <div className="qa-reply-title">
                {currentUser.role === 'lawyer'
                  ? `Post Verified Advocate Answer as ${currentUser.name}`
                  : `Post a Reply as ${currentUser.name}`}
              </div>
              <div className="qa-reply-sub">
                {currentUser.role === 'lawyer'
                  ? 'Your reply will be displayed with your verified Ministry of Justice credentials and ELO rating badge.'
                  : 'Share your perspective, question clarification, or legal experience.'}
              </div>

              <form onSubmit={handlePostAnswer}>
                <textarea
                  className="qa-reply-textarea"
                  placeholder={
                    currentUser.role === 'lawyer'
                      ? 'Write your professional legal opinion citing relevant Ethiopian laws or proclamations…'
                      : 'Share your perspective, experience, or advice…'
                  }
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', color: 'var(--gray-500)' }}>
                    {currentUser.role === 'lawyer' ? 'Verified Advocate Response' : 'Community Post'}
                  </span>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !replyText.trim()}
                    style={{ background: currentUser.role === 'lawyer' ? '#1c3024' : 'var(--orange)' }}
                  >
                    {submitting ? 'Posting…' : currentUser.role === 'lawyer' ? 'Post Advocate Answer' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="qa-reply-box" style={{ textAlign: 'center', padding: '3.2rem 2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.6rem' }}>
                Sign In to Answer or Comment
              </h3>
              <p style={{ fontSize: '1.45rem', color: 'var(--gray-500)', maxWidth: 480, margin: '0 auto 2rem' }}>
                Registered litigants and licensed advocates can answer or comment on questions. Unregistered visitors can freely browse and read all discussions.
              </p>
              <button className="btn btn-primary btn-lg" onClick={onOpenAuth}>
                Sign In / Register to Participate &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
