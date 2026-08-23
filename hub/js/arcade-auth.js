/**
 * ARCADE AUTH CORE - Unified User Authentication & Toast Controller
 * Automatically manages login/register modals, user avatar cards, session status, and toasts.
 * Shared across Hub, Tetris, Snake, Cyber Defense, and future arcade games.
 */

const ArcadeAuth = (function () {
  'use strict';

  let currentUser = null;
  let authCallbacks = [];
  let toastTimer = null;

  function getCurrentUser() {
    return currentUser;
  }

  function onAuthChange(callback) {
    if (typeof callback === 'function') {
      authCallbacks.push(callback);
      // Immediately invoke with current state
      callback(currentUser);
    }
  }

  function notifyAuthChange() {
    authCallbacks.forEach(cb => {
      try { cb(currentUser); } catch (e) { console.error('[ArcadeAuth] Callback error:', e); }
    });
  }

  // --- Toast Notification ---
  function showToast(message, duration = 3000) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;

    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }

    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    toastEl.style.display = 'block';

    toastTimer = setTimeout(() => {
      toastEl.classList.add('hidden');
      toastEl.style.display = 'none';
      toastTimer = null;
    }, duration);
  }

  // --- Modal Visibility Controls ---
  function openAuthModal(isRegister = false) {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    switchAuthTab(isRegister);
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    const usernameInput = document.getElementById('auth-username');
    if (usernameInput) usernameInput.focus();
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    modal.style.display = 'none';

    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      errorEl.style.display = 'none';
    }

    const form = document.getElementById('auth-form');
    if (form) form.reset();
  }

  function switchAuthTab(isRegister) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const titleEl = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('btn-auth-submit');
    const pwdConfirmGroup = document.getElementById('auth-confirm-group');
    const errorEl = document.getElementById('auth-error');

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      errorEl.style.display = 'none';
    }

    if (isRegister) {
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabRegister) tabRegister.classList.add('active');
      if (titleEl) titleEl.textContent = window.ArcadeI18n ? ArcadeI18n.t('auth.reg_title') : 'Register';
      if (submitBtn) submitBtn.textContent = window.ArcadeI18n ? ArcadeI18n.t('auth.btn_reg') : 'Register Now';
      if (pwdConfirmGroup) {
        pwdConfirmGroup.classList.remove('hidden');
        pwdConfirmGroup.style.display = 'flex';
      }
    } else {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (titleEl) titleEl.textContent = window.ArcadeI18n ? ArcadeI18n.t('auth.login_title') : 'Login';
      if (submitBtn) submitBtn.textContent = window.ArcadeI18n ? ArcadeI18n.t('auth.btn_login') : 'Login Now';
      if (pwdConfirmGroup) {
        pwdConfirmGroup.classList.add('hidden');
        pwdConfirmGroup.style.display = 'none';
      }
    }
  }

  // --- Auth Actions ---
  async function handleAuthSubmit(e) {
    if (e) e.preventDefault();

    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const confirmInput = document.getElementById('auth-confirm');
    const tabRegister = document.getElementById('tab-register');
    const errorEl = document.getElementById('auth-error');

    const isRegister = tabRegister && tabRegister.classList.contains('active');
    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPwd = confirmInput ? confirmInput.value : '';

    if (!username || !password) {
      if (errorEl) {
        errorEl.textContent = window.ArcadeI18n ? ArcadeI18n.t('auth.fill_fields') : 'Please fill in all fields.';
        errorEl.classList.remove('hidden');
        errorEl.style.display = 'block';
      }
      return;
    }

    if (isRegister && password !== confirmPwd) {
      if (errorEl) {
        errorEl.textContent = window.ArcadeI18n ? ArcadeI18n.t('auth.pwd_mismatch') : 'Passwords do not match.';
        errorEl.classList.remove('hidden');
        errorEl.style.display = 'block';
      }
      return;
    }

    try {
      let user;
      if (isRegister) {
        user = await ArcadeAPI.register(username, password);
        showToast(window.ArcadeI18n ? ArcadeI18n.t('auth.welcome_new', { user: user.username }) : `Welcome ${user.username}!`);
      } else {
        user = await ArcadeAPI.login(username, password);
        showToast(window.ArcadeI18n ? ArcadeI18n.t('auth.welcome_back', { user: user.username }) : `Welcome back ${user.username}!`);
      }

      currentUser = user;
      updateUI();
      closeAuthModal();
      notifyAuthChange();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Authentication failed.';
        errorEl.classList.remove('hidden');
        errorEl.style.display = 'block';
      }
    }
  }

  function handleLogout() {
    const confirmMsg = window.ArcadeI18n ? ArcadeI18n.t('auth.confirm_logout') : 'Are you sure you want to log out?';
    if (confirm(confirmMsg)) {
      ArcadeAPI.clearAuth();
      currentUser = null;
      updateUI();
      showToast(window.ArcadeI18n ? ArcadeI18n.t('auth.logged_out') : 'Logged out.');
      notifyAuthChange();
    }
  }

  async function checkAuthStatus() {
    currentUser = await ArcadeAPI.getProfile();
    updateUI();
    notifyAuthChange();
    return currentUser;
  }

  function updateUI() {
    const btnOpenLogin = document.getElementById('btn-open-login');
    const userBadge = document.getElementById('user-badge');
    const displayUsername = document.getElementById('display-username');
    const userAvatar = document.getElementById('user-avatar');

    if (currentUser) {
      if (btnOpenLogin) {
        btnOpenLogin.classList.add('hidden');
        btnOpenLogin.style.display = 'none';
      }
      if (userBadge) {
        userBadge.classList.remove('hidden');
        userBadge.style.display = 'inline-flex';
        const bestScoreStr = currentUser.best_score ? currentUser.best_score.toLocaleString() : '0';
        userBadge.title = `Player: ${currentUser.username} | High Score: ${bestScoreStr}`;
      }
      if (displayUsername) {
        displayUsername.textContent = currentUser.username;
      }
      if (userAvatar) {
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
      }
      const displayUserBest = document.getElementById('display-user-best');
      if (displayUserBest) {
        displayUserBest.textContent = `Best: ${(currentUser.best_score || 0).toLocaleString()}`;
      }
    } else {
      if (btnOpenLogin) {
        btnOpenLogin.classList.remove('hidden');
        btnOpenLogin.style.display = 'inline-flex';
      }
      if (userBadge) {
        userBadge.classList.add('hidden');
        userBadge.style.display = 'none';
      }
    }
  }

  // --- Auto Initialization ---
  function init() {
    // Buttons
    const btnOpenLogin = document.getElementById('btn-open-login');
    if (btnOpenLogin) {
      btnOpenLogin.addEventListener('click', () => openAuthModal(false));
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }

    // Modal tabs
    const tabLogin = document.getElementById('tab-login');
    if (tabLogin) {
      tabLogin.addEventListener('click', () => switchAuthTab(false));
    }

    const tabRegister = document.getElementById('tab-register');
    if (tabRegister) {
      tabRegister.addEventListener('click', () => switchAuthTab(true));
    }

    // Close buttons
    const btnCloseAuth = document.getElementById('btn-close-auth');
    if (btnCloseAuth) {
      btnCloseAuth.addEventListener('click', closeAuthModal);
    }
    const btnCloseAuthX = document.getElementById('btn-close-auth-x');
    if (btnCloseAuthX) {
      btnCloseAuthX.addEventListener('click', closeAuthModal);
    }

    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
      });
    }

    // Auth Form Submit
    const authForm = document.getElementById('auth-form');
    if (authForm) {
      authForm.addEventListener('submit', handleAuthSubmit);
    }

    // Check initial auth status
    checkAuthStatus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    getCurrentUser,
    onAuthChange,
    checkAuthStatus,
    openAuthModal,
    closeAuthModal,
    showToast,
    handleLogout,
  };
})();

// Global alias for compatibility
window.ArcadeAuth = ArcadeAuth;
window.showToast = ArcadeAuth.showToast;
