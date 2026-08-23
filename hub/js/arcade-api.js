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

  function detectCurrentGameId() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('snake')) return 'snake';
    if (path.includes('defense')) return 'defense';
    if (path.includes('tetris')) return 'tetris';
    return 'tetris';
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

  async function getProfile(gameId = null) {
    const token = getToken();
    if (!token) return getCurrentUser();
    const gId = gameId || detectCurrentGameId();
    try {
      const user = await request(`/api/auth/me?game_id=${encodeURIComponent(gId)}`);
      setAuth(token, user);
      return user;
    } catch (e) {
      clearAuth();
      return null;
    }
  }

  // --- Multi-Game Score & Leaderboard APIs ---
  async function submitScore(...args) {
    const token = getToken();
    if (!token) return null;

    let payload = {
      game_id: detectCurrentGameId(),
      mode: 'solo',
      score: 0,
      lines: 0,
      level: 1,
      start_level: 1,
      is_cleared: false,
      duration_seconds: 0,
    };

    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      // Object signature (e.g. SnakeAPI.submitScore({...}))
      const obj = args[0];
      payload.game_id = (obj.gameId || obj.game_id || detectCurrentGameId()).toLowerCase();
      payload.mode = String(obj.mode || (payload.game_id === 'snake' ? 'classic' : 'solo'));
      payload.score = Math.max(0, parseInt(obj.score, 10) || 0);
      payload.lines = Math.max(0, parseInt(obj.lines ?? obj.length ?? 0, 10) || 0);
      payload.level = Math.max(1, parseInt(obj.level, 10) || 1);
      payload.start_level = Math.max(1, parseInt(obj.startLevel ?? obj.start_level ?? 1, 10) || 1);
      payload.is_cleared = Boolean(obj.isCleared ?? obj.is_cleared);
      payload.duration_seconds = Math.max(0, parseInt(obj.durationSeconds ?? obj.duration_seconds ?? 0, 10) || 0);
    } else if (typeof args[0] === 'number') {
      // Defense signature: submitScore(score, wave, mapId)
      payload.game_id = 'defense';
      payload.score = Math.max(0, parseInt(args[0], 10) || 0);
      payload.lines = Math.max(0, parseInt(args[1], 10) || 0);
      payload.level = Math.max(1, parseInt(args[1], 10) || 1);
      payload.mode = String(args[2] || 'classic');
      payload.start_level = 1;
      payload.is_cleared = false;
      payload.duration_seconds = 0;
    } else if (typeof args[0] === 'string') {
      const firstStr = args[0].toLowerCase();
      const knownGames = ['tetris', 'snake', 'defense'];
      if (knownGames.includes(firstStr)) {
        // (gameId, mode, score, lines, level, startLevel, isCleared, durationSeconds)
        payload.game_id = firstStr;
        payload.mode = String(args[1] || (firstStr === 'snake' ? 'classic' : 'solo'));
        payload.score = Math.max(0, parseInt(args[2], 10) || 0);
        payload.lines = Math.max(0, parseInt(args[3], 10) || 0);
        payload.level = Math.max(1, parseInt(args[4], 10) || 1);
        payload.start_level = Math.max(1, parseInt(args[5], 10) || 1);
        payload.is_cleared = Boolean(args[6]);
        payload.duration_seconds = Math.max(0, parseInt(args[7], 10) || 0);
      } else {
        // Mode signature: (mode, score, lines, level, startLevel, isCleared, durationSeconds) (Tetris)
        payload.game_id = detectCurrentGameId();
        payload.mode = firstStr;
        payload.score = Math.max(0, parseInt(args[1], 10) || 0);
        payload.lines = Math.max(0, parseInt(args[2], 10) || 0);
        payload.level = Math.max(1, parseInt(args[3], 10) || 1);
        payload.start_level = Math.max(1, parseInt(args[4], 10) || 1);
        payload.is_cleared = Boolean(args[5]);
        payload.duration_seconds = Math.max(0, parseInt(args[6], 10) || 0);
      }
    }

    try {
      return await request('/api/scores/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      try {
        return await request('/api/scores', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (err2) {
        console.error(`[ArcadeAPI] Failed to submit score for ${payload.game_id}:`, err);
        return null;
      }
    }
  }

  async function getTop50(arg0 = null, arg1 = null) {
    let gameId = detectCurrentGameId();
    let mode = (gameId === 'snake' || gameId === 'defense') ? 'classic' : 'solo';
    const knownGames = ['tetris', 'snake', 'defense'];

    if (arg0 && knownGames.includes(arg0.toLowerCase())) {
      gameId = arg0.toLowerCase();
      mode = arg1 || ((gameId === 'snake' || gameId === 'defense') ? 'classic' : 'solo');
    } else if (arg0) {
      mode = arg0;
    }

    const data = await request(`/api/scores/top50?game_id=${encodeURIComponent(gameId)}&mode=${encodeURIComponent(mode)}`);
    if (data && data.scores && !data.history) {
      data.history = data.scores;
    }
    return data;
  }

  async function getLeaderboard(gameId, mode = null) {
    return await getTop50(gameId, mode);
  }

  async function getMyScores(gameId = null) {
    const token = getToken();
    if (!token) return { game_id: gameId || detectCurrentGameId(), count: 0, scores: [], history: [] };
    const gId = gameId || detectCurrentGameId();
    const data = await request(`/api/scores/my?game_id=${encodeURIComponent(gId)}`);
    if (data && data.scores && !data.history) {
      data.history = data.scores;
    }
    return data;
  }

  async function getUserBest(gameId = null) {
    return await getMyScores(gameId);
  }

  async function getUserRecent(gameId = null) {
    return await getMyScores(gameId);
  }

  function getCachedUser() {
    return getCurrentUser();
  }

  function clearToken() {
    clearAuth();
  }

  return {
    getToken,
    setAuth,
    clearAuth,
    clearToken,
    getCurrentUser,
    getCachedUser,
    request,
    register,
    login,
    getProfile,
    submitScore,
    getLeaderboard,
    getTop50,
    getMyScores,
    getUserBest,
    getUserRecent,
  };
})();

// Global aliases for complete compatibility across all sub-games
window.ArcadeAPI = ArcadeAPI;
window.API = ArcadeAPI;
window.SnakeAPI = ArcadeAPI;
window.DefenseAPI = ArcadeAPI;
