import React, { useState } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import { ETHIOPIAN_CITIES, SPECIALIZATION_LIST } from '../../data/constants';
import { api } from '../../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
];

const AVAILABLE_LANGUAGES = [
  'Amharic', 'English', 'Oromiffa', 'Tigrigna', 'Sidamigna', 'Somaligna', 'Afar', 'Guragigna'
];

export default function ProfileModal({ currentUser, onClose, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    city: currentUser?.city || 'Addis Ababa',
    bio: currentUser?.bio || '',
    profilePic: currentUser?.profilePic || PRESET_AVATARS[0],
    specialization: currentUser?.specialization || 'Corporate',
    yearsExperience: currentUser?.yearsExperience || 5,
    education: currentUser?.education || '',
    officeAddress: currentUser?.officeAddress || '',
    consultationFee: currentUser?.consultationFee || '',
    languages: Array.isArray(currentUser?.languages) ? currentUser.languages : ['Amharic', 'English'],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCustomAvatar, setShowCustomAvatar] = useState(false);

  const isLawyer = currentUser?.role === 'lawyer';

  const handleChange = (key, value) => {
    setError('');
    setSuccess('');
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleLanguage = (lang) => {
    setFormData(prev => {
      const current = prev.languages || [];
      const updated = current.includes(lang)
        ? current.filter(l => l !== lang)
        : [...current, lang];
      return { ...prev, languages: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: currentUser.id,
        ...formData
      };

      const res = await api.updateProfile(payload);
      if (res.ok && res.data?.user) {
        setSuccess('Profile updated successfully!');
        if (onProfileUpdated) {
          onProfileUpdated(res.data.user);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.data?.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop className="auth-backdrop" style={{ zIndex: 2000 }} onClose={onClose}>
      <div 
        className="profile-modal-dialog" 
        role="dialog" 
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-modal-user-preview">
            <div className="profile-avatar-wrapper">
              <img 
                src={formData.profilePic} 
                alt={formData.name} 
                className="profile-modal-avatar"
                onError={e => {
                  e.target.src = PRESET_AVATARS[0];
                }}
              />
              <span className="profile-avatar-badge">{isLawyer ? '⚖️' : '👤'}</span>
            </div>
            <div>
              <h2 className="profile-modal-title">{formData.name || 'Your Profile'}</h2>
              <div className="profile-modal-tags">
                <span className={`profile-role-tag ${isLawyer ? 'lawyer' : 'client'}`}>
                  {isLawyer ? 'Ministry of Justice Verified Advocate' : 'Registered Litigant'}
                </span>
                {isLawyer && currentUser?.licenseNumber && (
                  <span className="profile-license-tag">
                    🛡️ {currentUser.licenseNumber}
                  </span>
                )}
                {currentUser?.username && (
                  <span className="profile-username-tag">@{currentUser.username}</span>
                )}
              </div>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close profile modal">
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="profile-modal-body">
          {error && (
            <div className="auth-alert error">
              <span className="auth-alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-alert success">
              <span className="auth-alert-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form" noValidate>
            {/* Avatar Selector */}
            <div className="profile-section">
              <label className="profile-section-label">Profile Avatar</label>
              <div className="profile-avatar-presets">
                {PRESET_AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Preset ${idx + 1}`}
                    className={`preset-avatar-btn ${formData.profilePic === url ? 'active' : ''}`}
                    onClick={() => handleChange('profilePic', url)}
                  />
                ))}
                <button
                  type="button"
                  className={`preset-custom-toggle ${showCustomAvatar ? 'active' : ''}`}
                  onClick={() => setShowCustomAvatar(!showCustomAvatar)}
                  title="Custom Image Link"
                >
                  🔗 Custom URL
                </button>
              </div>

              {showCustomAvatar && (
                <div style={{ marginTop: '1rem' }}>
                  <input
                    type="url"
                    className="auth-input"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.profilePic}
                    onChange={e => handleChange('profilePic', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* General Information Grid */}
            <div className="profile-section">
              <label className="profile-section-label">Personal &amp; Contact Details</label>
              <div className="profile-grid-2">
                <div className="auth-field">
                  <label className="auth-label">Full Name *</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Email Address *</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Phone Number</label>
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="+251 9XX XXX XXX"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Primary City / Jurisdiction</label>
                  <select
                    className="auth-input"
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                  >
                    {ETHIOPIAN_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-field" style={{ marginTop: '1.4rem' }}>
                <label className="auth-label">Bio / Profile Summary</label>
                <textarea
                  className="auth-input"
                  rows={3}
                  placeholder="Share a brief overview of your legal background, focus areas, or consultation style..."
                  value={formData.bio}
                  onChange={e => handleChange('bio', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Advocate Specific Fields */}
            {isLawyer && (
              <div className="profile-section">
                <label className="profile-section-label">Advocate Credentials &amp; Practice Details</label>
                <div className="profile-grid-2">
                  <div className="auth-field">
                    <label className="auth-label">Primary Legal Specialization</label>
                    <select
                      className="auth-input"
                      value={formData.specialization}
                      onChange={e => handleChange('specialization', e.target.value)}
                    >
                      {SPECIALIZATION_LIST.map(spec => (
                        <option key={spec} value={spec}>{spec} Law</option>
                      ))}
                    </select>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Years of Active Bar Experience</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      className="auth-input"
                      value={formData.yearsExperience}
                      onChange={e => handleChange('yearsExperience', e.target.value)}
                    />
                  </div>

                  <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="auth-label">Academic Degrees &amp; Universities</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. LLB – Addis Ababa University (2012), LLM – London (2016)"
                      value={formData.education}
                      onChange={e => handleChange('education', e.target.value)}
                    />
                  </div>

                  <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="auth-label">Office Chamber Address</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Bole Medhanialem, Mega Center, 5th Floor, Suite 504, Addis Ababa"
                      value={formData.officeAddress}
                      onChange={e => handleChange('officeAddress', e.target.value)}
                    />
                  </div>

                  <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="auth-label">Consultation Fee Terms</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Free 20-min initial evaluation / Hourly corporate rate"
                      value={formData.consultationFee}
                      onChange={e => handleChange('consultationFee', e.target.value)}
                    />
                  </div>
                </div>

                {/* Spoken Languages */}
                <div style={{ marginTop: '1.6rem' }}>
                  <label className="auth-label">Languages Fluent In</label>
                  <div className="profile-lang-chips">
                    {AVAILABLE_LANGUAGES.map(lang => {
                      const selected = (formData.languages || []).includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          className={`profile-lang-chip ${selected ? 'active' : ''}`}
                          onClick={() => handleToggleLanguage(lang)}
                        >
                          {selected ? '✓ ' : '+ '}{lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="profile-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-gold"
                disabled={loading}
                style={{ minWidth: 160 }}
              >
                {loading ? 'Saving Changes…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalBackdrop>
  );
}
