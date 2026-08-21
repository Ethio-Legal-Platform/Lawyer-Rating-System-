import React, { useState } from "react";
import ModalBackdrop from "../common/ModalBackdrop";
import { api } from "../../services/api";
import { storeUser } from "../../utils/storage";

export default function ProfileModal({
  currentUser,
  onClose,
  onProfileUpdated,
}) {
  const [name, setName] = useState(currentUser?.name || "");
  const [city, setCity] = useState(currentUser?.city || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.updateProfile({
        userId: currentUser.id,
        name,
        city,
        bio,
      });
      if (res.ok) {
        const updated = { ...currentUser, name, city, bio };
        storeUser(updated);
        setSuccess("Profile updated successfully.");
        if (onProfileUpdated) onProfileUpdated(updated);
      } else {
        setError(res.data?.error || "Failed to update profile.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">My Profile</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
        >
          {/* Avatar & Role */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              marginBottom: "0.4rem",
            }}
          >
            <img
              src={
                currentUser?.profilePic ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"
              }
              alt={currentUser?.name}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--border)",
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.5rem" }}>
                {currentUser?.name}
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  color: "var(--text-muted)",
                  textTransform: "capitalize",
                }}
              >
                {currentUser?.role} · {currentUser?.city || "Ethiopia"}
              </div>
              {currentUser?.licenseNumber && (
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--accent)",
                    marginTop: 2,
                  }}
                >
                  License: {currentUser.licenseNumber}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Display Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="form-label">City</label>
            <input
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Addis Ababa"
            />
          </div>

          {currentUser?.role === "lawyer" && (
            <div>
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Brief professional biography…"
                style={{ resize: "vertical" }}
              />
            </div>
          )}

          {error && (
            <p style={{ color: "var(--error, #e53e3e)", fontSize: "1.2rem" }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: "var(--success, #38a169)", fontSize: "1.2rem" }}>
              {success}
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-gold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
