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

  function setToken(token) {
    localStorage.setItem('arcade_token', token);
    localStorage.setItem('tetris_auth_token', token);
    localStorage.setItem('tetris_token', token);
    localStorage.setItem('snake_token', token);
  }

  function clearToken() {
    localStorage.removeItem('arcade_token');
    localStorage.removeItem('tetris_auth_token');
    localStorage.removeItem('tetris_token');
    localStorage.removeItem('snake_token');
  }

  async function register(username, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    setToken(data.token);
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
    setToken(data.token);
    return data;
  }

  async function getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
      clearToken();
      return null;
    } catch (e) {
      return null;
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
