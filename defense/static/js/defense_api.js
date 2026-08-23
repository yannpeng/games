/**
 * Wildwood Defenders - API Service
 * Handles user authentication checks, score submissions, and leaderboard syncing.
 */

const DefenseAPI = (function () {
  'use strict';

  const TOKEN_KEY = 'arcade_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('tetris_token');
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
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
          score: score,
          level: wave,
          lines_cleared: wave, // Wave count
        }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function getLeaderboard(limit = 20) {
    try {
      const res = await fetch(`/api/scores/leaderboard?game_id=defense&limit=${limit}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  return {
    getToken,
    setToken,
    getCurrentUser,
    submitScore,
    getLeaderboard,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DefenseAPI;
}
