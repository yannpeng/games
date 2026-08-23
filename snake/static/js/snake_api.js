/**
 * REST API client for Snake Sub-Game.
 * Connects to unified Arcade backend with game_id="snake".
 */

const SnakeAPI = {
  GAME_ID: 'snake',

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
    if (user) {
      localStorage.setItem('arcade_user', JSON.stringify(user));
      localStorage.setItem('tetris_auth_user', JSON.stringify(user));
    }
  },

  clearToken() {
    localStorage.removeItem('arcade_token');
    localStorage.removeItem('tetris_auth_token');
    localStorage.removeItem('tetris_token');
    localStorage.removeItem('snake_token');
    localStorage.removeItem('arcade_user');
    localStorage.removeItem('tetris_auth_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('arcade_user') || localStorage.getItem('tetris_auth_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  async register(username, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    this.setAuth(data.token, data.user);
    return data;
  },

  async login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    this.setAuth(data.token, data.user);
    return data;
  },

  async getProfile() {
    const token = this.getToken();
    if (!token) {
      return this.getCurrentUser();
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        this.clearToken();
        return null;
      }
      if (res.ok) {
        const user = await res.json();
        this.setAuth(token, user);
        return user;
      }
      return this.getCurrentUser();
    } catch (e) {
      return this.getCurrentUser();
    }
  },

  async submitScore({ mode, score, length, level, startLevel = 1, isCleared = false, durationSeconds = 0 }) {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/scores/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          game_id: this.GAME_ID,
          mode: mode,
          score: score,
          lines: length, // Snake length mapped to lines field
          level: level,
          start_level: startLevel,
          is_cleared: isCleared,
          duration_seconds: durationSeconds,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getTop50(mode = 'classic') {
    const res = await fetch(`/api/scores/top50?game_id=${this.GAME_ID}&mode=${mode}`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return await res.json();
  },
};
