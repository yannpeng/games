/**
 * Cyberpunk Arcade Game Lobby Portal Controller
 * Manages user session, dynamic game catalog, i18n localization, and cross-game Top 50 leaderboards.
 */

(function () {
  'use strict';

  let currentUser = null;
  let authToken = localStorage.getItem('arcade_token') || localStorage.getItem('tetris_token') || null;
  let activeLeaderboardGame = 'tetris';
  let activeLeaderboardMode = 'solo';

  // DOM Elements
  const btnUserAuth = document.getElementById('btn-user-auth');
  const userDisplayName = document.getElementById('user-display-name');
  const modalAuth = document.getElementById('modal-auth');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-modal-title');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authUsername = document.getElementById('auth-username');
  const authPassword = document.getElementById('auth-password');
  const authError = document.getElementById('auth-error-msg');
  const btnAuthSubmit = document.getElementById('btn-auth-submit');

  const btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');
  const modalLeaderboard = document.getElementById('modal-leaderboard');
  const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
  const btnCloseLeaderboardFooter = document.getElementById('btn-close-leaderboard-footer');
  const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
  const leaderboardTbody = document.getElementById('leaderboard-tbody');
  const lbGameTabs = document.querySelectorAll('.lb-game-tab');
  const toast = document.getElementById('toast');

  let isRegistering = false;

  // Initialize
  async function init() {
    ArcadeI18n.initLanguageUI();
    setupAuthListeners();
    setupLeaderboardListeners();
    await verifyUserToken();
  }

  function showToast(msg, duration = 2500) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // --- Auth Handlers ---
  async function verifyUserToken() {
    if (!authToken) {
      userDisplayName.textContent = ArcadeI18n.t('hub.login_btn');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        currentUser = await res.json();
        userDisplayName.textContent = `👤 ${currentUser.username}`;
        // Sync token
        localStorage.setItem('arcade_token', authToken);
        localStorage.setItem('tetris_token', authToken);

        // Sync user preferred language if set on account
        if (currentUser.language && currentUser.language !== ArcadeI18n.getLanguage()) {
          ArcadeI18n.setLanguage(currentUser.language, false);
        }
      } else {
        localStorage.removeItem('arcade_token');
        localStorage.removeItem('tetris_token');
        authToken = null;
        userDisplayName.textContent = ArcadeI18n.t('hub.login_btn');
      }
    } catch (e) {
      console.warn('Auth verification skipped.');
    }
  }

  function setupAuthListeners() {
    btnUserAuth.addEventListener('click', () => {
      if (currentUser) {
        if (confirm(ArcadeI18n.t('auth.confirm_logout'))) {
          localStorage.removeItem('arcade_token');
          localStorage.removeItem('tetris_token');
          authToken = null;
          currentUser = null;
          userDisplayName.textContent = ArcadeI18n.t('hub.login_btn');
          showToast('👋 Logged out successfully');
        }
      } else {
        openAuthModal(false);
      }
    });

    btnCloseAuth.addEventListener('click', () => {
      modalAuth.classList.add('hidden');
    });

    tabLogin.addEventListener('click', () => openAuthModal(false));
    tabRegister.addEventListener('click', () => openAuthModal(true));

    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      authError.classList.add('hidden');

      const username = authUsername.value.trim();
      const password = authPassword.value;

      if (!username || !password) {
        showAuthError('Please fill in username and password');
        return;
      }

      btnAuthSubmit.disabled = true;
      btnAuthSubmit.textContent = '...';

      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
          authToken = data.token;
          currentUser = data.user;
          localStorage.setItem('arcade_token', authToken);
          localStorage.setItem('tetris_token', authToken);
          userDisplayName.textContent = `👤 ${currentUser.username}`;
          modalAuth.classList.add('hidden');

          // Sync preferred language from account
          if (currentUser.language) {
            ArcadeI18n.setLanguage(currentUser.language, false);
          } else {
            ArcadeI18n.setLanguage(ArcadeI18n.getLanguage(), true);
          }

          showToast(isRegistering ? `🎉 Welcome ${currentUser.username}!` : `👋 Welcome back, ${currentUser.username}!`);
        } else {
          showAuthError(data.detail || 'Authentication failed');
        }
      } catch (err) {
        showAuthError('Network error, please try again.');
      } finally {
        btnAuthSubmit.disabled = false;
        btnAuthSubmit.textContent = isRegistering ? ArcadeI18n.t('auth.btn_reg') : ArcadeI18n.t('auth.btn_login');
      }
    });
  }

  function openAuthModal(registerMode) {
    isRegistering = registerMode;
    authError.classList.add('hidden');
    authUsername.value = '';
    authPassword.value = '';

    if (registerMode) {
      authTitle.textContent = ArcadeI18n.t('auth.reg_title');
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      btnAuthSubmit.textContent = ArcadeI18n.t('auth.btn_reg');
    } else {
      authTitle.textContent = ArcadeI18n.t('auth.login_title');
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      btnAuthSubmit.textContent = ArcadeI18n.t('auth.btn_login');
    }

    modalAuth.classList.remove('hidden');
  }

  function showAuthError(msg) {
    authError.textContent = msg;
    authError.classList.remove('hidden');
  }

  // --- Leaderboard Handlers ---
  function setupLeaderboardListeners() {
    btnOpenLeaderboard.addEventListener('click', () => {
      modalLeaderboard.classList.remove('hidden');
      loadLeaderboardData();
    });

    btnCloseLeaderboard.addEventListener('click', () => modalLeaderboard.classList.add('hidden'));
    btnCloseLeaderboardFooter.addEventListener('click', () => modalLeaderboard.classList.add('hidden'));
    btnRefreshLeaderboard.addEventListener('click', loadLeaderboardData);

    lbGameTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        lbGameTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        activeLeaderboardGame = tab.dataset.game;
        activeLeaderboardMode = tab.dataset.mode || (activeLeaderboardGame === 'tetris' ? 'solo' : 'classic');
        loadLeaderboardData();
      });
    });
  }

  async function loadLeaderboardData() {
    leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell">${ArcadeI18n.t('lb.loading')}</td></tr>`;

    try {
      const res = await fetch(`/api/scores/top50?game_id=${activeLeaderboardGame}&mode=${activeLeaderboardMode}`);
      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      const scores = data.scores || [];

      if (scores.length === 0) {
        leaderboardTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#8a99b5;">${ArcadeI18n.t('lb.empty')}</td></tr>`;
        return;
      }

      leaderboardTbody.innerHTML = scores
        .map((item, idx) => {
          let rankBadge = `${idx + 1}`;
          if (idx === 0) rankBadge = '🥇 1';
          else if (idx === 1) rankBadge = '🥈 2';
          else if (idx === 2) rankBadge = '🥉 3';

          const clearBadge = item.is_cleared ? `<span style="color:#ffd700;font-weight:bold;">${ArcadeI18n.t('lb.cleared')}</span>` : `<span style="color:#8a99b5;">${ArcadeI18n.t('lb.active')}</span>`;
          const timeFormatted = item.played_at ? item.played_at.replace('T', ' ').substring(0, 16) : '-';

          return `
            <tr>
              <td><strong style="color:var(--color-primary);font-family:var(--font-digital);">${rankBadge}</strong></td>
              <td><strong>${item.username}</strong></td>
              <td><span style="color:var(--color-warning);font-weight:bold;font-family:var(--font-digital);">${item.score.toLocaleString()}</span></td>
              <td>${item.lines}</td>
              <td>Lv.${item.level}</td>
              <td>${clearBadge}</td>
              <td style="color:#8a99b5;font-size:0.8rem;">${timeFormatted}</td>
            </tr>
          `;
        })
        .join('');
    } catch (e) {
      leaderboardTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#ff3366;">Failed to load leaderboard data.</td></tr>`;
    }
  }

  // Boot on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
