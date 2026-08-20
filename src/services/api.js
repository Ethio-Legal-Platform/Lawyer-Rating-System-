import { getToken } from '../utils/storage';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function authFetch(path, options = {}) {
  const token = getToken();
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  return response;
}

export const api = {
  // Lawyers & Directory
  searchLawyers: async (specialization = '', city = '', search = '') => {
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (city) params.append('city', city);
    if (search) params.append('search', search);
    const res = await authFetch(`/lawyers/search?${params}`);
    return res.json();
  },

  getLeaderboard: async () => {
    const res = await authFetch('/lawyers/leaderboard');
    return res.json();
  },

  getLawyerRating: async (licenseNumber) => {
    const res = await authFetch(`/court/lawyer-rating/${encodeURIComponent(licenseNumber)}`);
    return res.json();
  },

  // Q&A & Inquiries
  getQuestions: async (category = 'All', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const res = await authFetch(`/qa/questions?${params}`);
    return res.json();
  },

  getInquiries: async (user) => {
    if (!user) return [];
    const params = new URLSearchParams();
    params.append('userId', user.id);
    params.append('role', user.role || 'client');
    if (user.city) params.append('city', user.city);
    if (user.specialization) params.append('specialization', user.specialization);
    const res = await authFetch(`/qa/inquiries?${params}`);
    return res.json();
  },

  getQuestionById: async (questionId) => {
    const res = await authFetch(`/qa/questions/${questionId}`);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  createQuestion: async (payload) => {
    const res = await authFetch('/qa/questions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  publishQuestion: async (questionId, userId) => {
    const res = await authFetch(`/qa/questions/${questionId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  addAnswer: async (questionId, payload) => {
    const res = await authFetch(`/qa/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  upvoteAnswer: async (questionId, answerId, userId) => {
    const res = await authFetch(`/qa/questions/${questionId}/answers/${answerId}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // Authentication
  login: async (credentials) => {
    const res = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  register: async (payload) => {
    const res = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  verifyRegistration: async (payload) => {
    const res = await authFetch('/auth/register-verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  resendOtp: async (email) => {
    const res = await authFetch('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  getMe: async (userId) => {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await authFetch(`/auth/me${params}`);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  updateProfile: async (payload) => {
    const res = await authFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }
};

export { authFetch, API_BASE };
