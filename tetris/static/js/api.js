/**
 * API client for user authentication, multi-mode score submission, and leaderboards.
 */

const API = {
  TOKEN_KEY: 'tetris_auth_token',
  USER_KEY: 'tetris_auth_user',

  getToken() {
    return localStorage.getItem('arcade_token') || 
           localStorage.getItem('tetris_auth_token') || 
           localStorage.getItem('tetris_token') || 
           localStorage.getItem('snake_token') || null;
  },

  setAuth(token, user) {
    localStorage.setItem('arcade_token', token);
    localStorage.setItem('tetris_auth_token', token);
    localStorage.setItem('tetris_token', token);
    localStorage.setItem('snake_token', token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('arcade_token');
    localStorage.removeItem('tetris_auth_token');
    localStorage.removeItem('tetris_token');
    localStorage.removeItem('snake_token');
    localStorage.removeItem(this.USER_KEY);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
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
  },

  // Auth Endpoints
  async register(username, password) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setAuth(data.token, data.user);
    return data.user;
  },

  async login(username, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setAuth(data.token, data.user);
    return data.user;
  },

  async getProfile() {
    if (!this.getToken()) return null;
    try {
      const user = await this.request('/api/auth/me');
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch (e) {
      this.clearAuth();
      return null;
    }
  },

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore error on logout
    }
    this.clearAuth();
  },

  // Score & Leaderboard Endpoints
  async submitScore(mode, score, lines, level, startLevel = 1, isCleared = false, durationSeconds = 0) {
    if (!this.getToken()) return null;
    return await this.request('/api/scores/submit', {
      method: 'POST',
      body: JSON.stringify({
        mode,
        score,
        lines,
        level,
        start_level: startLevel,
        is_cleared: isCleared,
        duration_seconds: durationSeconds,
      }),
    });
  },

  async getTop50(mode = 'solo') {
    return await this.request(`/api/scores/top50?mode=${encodeURIComponent(mode)}`);
  },

  async getMyScores(mode = null) {
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : '';
    return await this.request(`/api/scores/my${query}`);
  },
};
