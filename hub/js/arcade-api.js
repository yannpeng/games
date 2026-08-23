/**
 * ARCADE API CORE - Unified REST API Client
 * Single source of truth for JWT Authentication, Multi-Game Score Submissions & Leaderboards.
 * Shared across Hub, Tetris, Snake, Cyber Defense, and future arcade games.
 */

const ArcadeAPI = (function () {
  'use strict';

  const TOKEN_KEY = 'arcade_token';
  const USER_KEY = 'arcade_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) ||
           localStorage.getItem('tetris_auth_token') ||
           localStorage.getItem('tetris_token') ||
           localStorage.getItem('snake_token') || null;
  }

  function setAuth(token, user) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('tetris_auth_token', token);
      localStorage.setItem('tetris_token', token);
      localStorage.setItem('snake_token', token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem('tetris_auth_user', JSON.stringify(user));
    }
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('tetris_auth_token');
    localStorage.removeItem('tetris_token');
    localStorage.removeItem('snake_token');
    localStorage.removeItem('tetris_auth_user');
  }

  function getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY) || localStorage.getItem('tetris_auth_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred during API request');
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  // --- Auth APIs ---
  async function register(username, password) {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuth(data.token, data.user);
    return data.user;
  }

  async function login(username, password) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuth(data.token, data.user);
    return data.user;
  }

  async function getProfile() {
    const token = getToken();
    if (!token) return getCurrentUser();
    try {
      const user = await request('/api/auth/me');
      setAuth(token, user);
      return user;
    } catch (e) {
      clearAuth();
      return null;
    }
  }

  // --- Multi-Game Score & Leaderboard APIs ---
  async function submitScore(gameId, mode, score, lines = 0, level = 1, startLevel = 1, isCleared = false, durationSeconds = 0) {
    const token = getToken();
    if (!token) return null;

    try {
      return await request('/api/scores', {
        method: 'POST',
        body: JSON.stringify({
          game_id: gameId,
          mode: mode,
          score: score,
          lines: lines,
          level: level,
          start_level: startLevel,
          is_cleared: isCleared,
          duration_seconds: durationSeconds,
        }),
      });
    } catch (err) {
      console.error(`[ArcadeAPI] Failed to submit score for ${gameId}:`, err);
      return null;
    }
  }

  async function getLeaderboard(gameId, mode = null) {
    const url = mode 
      ? `/api/scores/leaderboard/${gameId}?mode=${encodeURIComponent(mode)}&limit=50`
      : `/api/scores/leaderboard/${gameId}?limit=50`;
    return await request(url);
  }

  async function getUserBest(gameId = null) {
    const token = getToken();
    if (!token) return null;
    const url = gameId ? `/api/scores/user/best?game_id=${gameId}` : '/api/scores/user/best';
    return await request(url);
  }

  async function getUserRecent(gameId = null) {
    const token = getToken();
    if (!token) return [];
    const url = gameId ? `/api/scores/user/recent?game_id=${gameId}&limit=20` : '/api/scores/user/recent?limit=20';
    return await request(url);
  }

  return {
    getToken,
    setAuth,
    clearAuth,
    getCurrentUser,
    request,
    register,
    login,
    getProfile,
    submitScore,
    getLeaderboard,
    getUserBest,
    getUserRecent,
  };
})();

// Global aliases for complete compatibility across all sub-games
window.ArcadeAPI = ArcadeAPI;
window.API = ArcadeAPI;
window.SnakeAPI = ArcadeAPI;
window.DefenseAPI = ArcadeAPI;
