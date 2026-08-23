/**
 * Wildwood Defenders - API Service
 * Handles unified user authentication checks, score submissions, and leaderboard syncing.
 */

const DefenseAPI = (function () {
  'use strict';

  const TOKEN_KEY = 'arcade_token';

  function getToken() {
    return localStorage.getItem('arcade_token') || 
           localStorage.getItem('tetris_auth_token') || 
           localStorage.getItem('tetris_token') || 
           localStorage.getItem('snake_token') || null;
  }

  function setAuth(token, user) {
    localStorage.setItem('arcade_token', token);
    localStorage.setItem('tetris_auth_token', token);
    localStorage.setItem('tetris_token', token);
    localStorage.setItem('snake_token', token);
    if (user) {
      localStorage.setItem('arcade_user', JSON.stringify(user));
      localStorage.setItem('tetris_auth_user', JSON.stringify(user));
    }
  }

  function clearToken() {
    localStorage.removeItem('arcade_token');
    localStorage.removeItem('tetris_auth_token');
    localStorage.removeItem('tetris_token');
    localStorage.removeItem('snake_token');
    localStorage.removeItem('arcade_user');
    localStorage.removeItem('tetris_auth_user');
  }

  function getCachedUser() {
    const userStr = localStorage.getItem('arcade_user') || localStorage.getItem('tetris_auth_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  async function register(username, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    setAuth(data.token, data.user);
    return data;
  }

  async function login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    setAuth(data.token, data.user);
    return data;
  }

  async function getCurrentUser() {
    const token = getToken();
    if (!token) {
      return getCachedUser();
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        clearToken();
        return null;
      }
      if (res.ok) {
        const user = await res.json();
        setAuth(token, user);
        return user;
      }
      return getCachedUser();
    } catch (e) {
      return getCachedUser();
    }
  }

  async function submitScore(score, wave, mapId) {
    const token = getToken();
    if (!token) return { success: false, offline: true };

    try {
      const res = await fetch('/api/scores/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          game_id: 'defense',
          mode: 'campaign',
          score: score,
          level: wave,
          lines: wave,
        }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function getTop50() {
    try {
      const res = await fetch('/api/scores/top50?game_id=defense&mode=campaign');
      if (res.ok) {
        return await res.json();
      }
      return { scores: [] };
    } catch (e) {
      return { scores: [] };
    }
  }

  return {
    getToken,
    setToken,
    clearToken,
    register,
    login,
    getCurrentUser,
    submitScore,
    getTop50,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DefenseAPI;
}
