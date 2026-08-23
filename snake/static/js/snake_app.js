/**
 * Cyberpunk Snake Master Application Controller & Canvas Renderer
 * Connects game engine, audio synthesizer, AI rival, touch gamepad, and REST APIs.
 */

(function () {
  'use strict';

  // Game Engine & Controllers
  const sound = new SnakeAudioController();
  const engine = new SnakeEngine('classic');
  const aiAgent = new SnakeAiAgent(engine);

  let currentMode = 'classic'; // 'classic' or 'battle'
  let selectedStartLevel = 1;
  let currentUser = null;
  let lastTime = 0;
  let tickCounter = 0;
  let isRegistering = false;

  // DOM Elements
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');

  const modeBtnClassic = document.getElementById('mode-btn-classic');
  const modeBtnBattle = document.getElementById('mode-btn-battle');
  const snakeTitleLabel = document.getElementById('snake-title-label');
  const targetScoreBadge = document.getElementById('target-score-badge');

  const startLevelSlider = document.getElementById('start-level-slider');
  const selectedLevelVal = document.getElementById('selected-level-val');
  const hintSpeed = document.getElementById('hint-speed');
  const hintTarget = document.getElementById('hint-target');
  const classicIntroBox = document.getElementById('classic-intro-box');
  const battleIntroBox = document.getElementById('battle-intro-box');

  const overlayStart = document.getElementById('overlay-start');
  const overlayPause = document.getElementById('overlay-pause');
  const overlayGameOver = document.getElementById('overlay-game-over');
  const btnGameStart = document.getElementById('btn-game-start');
  const btnResumeGame = document.getElementById('btn-resume-game');
  const btnRestartFromPause = document.getElementById('btn-restart-from-pause');
  const btnRestartGame = document.getElementById('btn-restart-game');

  const statScore = document.getElementById('stat-score');
  const statLength = document.getElementById('stat-length');
  const statLevel = document.getElementById('stat-level');
  const statTime = document.getElementById('stat-time');

  const goTitle = document.getElementById('go-title');
  const goSubtitle = document.getElementById('go-subtitle');
  const goFinalScore = document.getElementById('go-final-score');
  const goFinalLength = document.getElementById('go-final-length');
  const goFinalLevel = document.getElementById('go-final-level');
  const goFinalRank = document.getElementById('go-final-rank');
  const goClearRow = document.getElementById('go-clear-row');
  const goLoginHint = document.getElementById('go-login-hint');
  const btnGoLogin = document.getElementById('btn-go-login');

  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const btnMobilePause = document.getElementById('btn-mobile-pause');

  const btnLeaderboard = document.getElementById('btn-leaderboard');
  const modalLeaderboard = document.getElementById('modal-leaderboard');
  const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
  const btnCloseLeaderboardFooter = document.getElementById('btn-close-leaderboard-footer');
  const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
  const leaderboardTbody = document.getElementById('leaderboard-tbody');
  const lbTabClassic = document.getElementById('lb-tab-classic');
  const lbTabBattle = document.getElementById('lb-tab-battle');

  const btnOpenLogin = document.getElementById('btn-open-login');
  const userBadge = document.getElementById('user-badge');
  const userAvatar = document.getElementById('user-avatar');
  const displayUsername = document.getElementById('display-username');
  const displayUserBest = document.getElementById('display-user-best');
  const btnLogout = document.getElementById('btn-logout');

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
  const toast = document.getElementById('toast');

  let activeLeaderboardTab = 'classic';

  // Initialize
  async function init() {
    if (window.ArcadeI18n) {
      ArcadeI18n.initLanguageUI();
    }
    setupCanvas();
    setupEventListeners();
    setupModalListeners();
    setupEngineCallbacks();
    updateSoundIcon();
    await checkUserAuth();
    requestAnimationFrame(renderLoop);

    window.addEventListener('arcadeLanguageChanged', () => {
      updateDynamicTexts();
      updateSliderHints();
      updateUserAuthUI();
    });
  }

  function setupCanvas() {
    // Sharp high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 600 * dpr;
    canvas.height = 600 * dpr;
    ctx.scale(dpr, dpr);
  }

  function showToast(msg, duration = 2000) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
  }

  function setupEngineCallbacks() {
    engine.onEatFood = (food) => {
      if (food.type === 'APPLE') {
        sound.playEat();
      } else {
        sound.playPowerup();
        const foodName = ArcadeI18n.t(`snake.food_${food.type.toLowerCase()}`);
        showToast(ArcadeI18n.t('snake.toast_eat_bonus', { name: foodName, score: food.score * engine.level }), 1500);
      }
      updateStatsDisplay();
    };

    engine.onLevelUp = (newLevel) => {
      sound.playLevelUp();
      showToast(ArcadeI18n.t('snake.toast_levelup', { level: newLevel }), 2500);
      updateStatsDisplay();
    };

    engine.onDeath = (reasonKey) => {
      sound.playDie();
      handleGameOver(false, reasonKey);
    };

    engine.onAiDefeated = (reasonKey) => {
      sound.playLevelUp();
      const reasonText = ArcadeI18n.t(reasonKey);
      showToast(ArcadeI18n.t('snake.toast_ai_defeated', { reason: reasonText }), 2500);
      updateStatsDisplay();
    };

    engine.onVictory = () => {
      sound.playVictory();
      handleGameOver(true, 'snake.toast_victory');
    };
  }

  function setupEventListeners() {
    // Mode Switcher
    modeBtnClassic.addEventListener('click', () => switchMode('classic'));
    modeBtnBattle.addEventListener('click', () => switchMode('battle'));

    // Slider
    startLevelSlider.addEventListener('input', (e) => {
      selectedStartLevel = parseInt(e.target.value, 10);
      updateSliderHints();
    });

    // Start / Pause
    btnGameStart.addEventListener('click', startGame);
    btnResumeGame.addEventListener('click', resumeGame);
    btnRestartFromPause.addEventListener('click', startGame);
    btnRestartGame.addEventListener('click', startGame);

    if (btnMobilePause) {
      btnMobilePause.addEventListener('click', togglePause);
    }

    // Sound Toggle
    btnSoundToggle.addEventListener('click', () => {
      sound.init();
      const isMuted = sound.toggleMute();
      updateSoundIcon();
      showToast(isMuted ? ArcadeI18n.t('common.sound_off') : ArcadeI18n.t('common.sound_on'));
    });

    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);

    // Touch controls
    setupTouchControls();

    // Modals
    setupModalListeners();

    // Re-render dynamic elements when language changes
    window.addEventListener('arcadeLanguageChanged', () => {
      updateDynamicTexts();
      updateStatsDisplay();
      updateSliderHints();
    });
  }

  function updateDynamicTexts() {
    if (currentMode === 'classic') {
      snakeTitleLabel.textContent = ArcadeI18n.t('snake.player_label');
    } else {
      snakeTitleLabel.textContent = ArcadeI18n.t('snake.battle_label');
    }
  }

  function updateSliderHints() {
    selectedLevelVal.textContent = `Lv.${selectedStartLevel}`;
    hintSpeed.textContent = `${SNAKE_CONFIG.SPEED_CURVE[selectedStartLevel - 1]}${ArcadeI18n.t('common.ms')}`;
    hintTarget.textContent = `${SNAKE_CONFIG.LEVEL_TARGET_SCORES[selectedStartLevel - 1].toLocaleString()} ${ArcadeI18n.t('common.pts')}`;
  }

  function switchMode(mode) {
    if (engine.isPlaying) {
      if (!confirm(ArcadeI18n.t('auth.confirm_logout') ? 'Reset game?' : 'Reset game?')) return;
    }

    currentMode = mode;
    engine.mode = mode;

    if (mode === 'classic') {
      modeBtnClassic.classList.add('active');
      modeBtnBattle.classList.remove('active');
      classicIntroBox.classList.remove('hidden');
      battleIntroBox.classList.add('hidden');
      snakeTitleLabel.textContent = ArcadeI18n.t('snake.player_label');
      targetScoreBadge.classList.remove('hidden');
    } else {
      modeBtnBattle.classList.add('active');
      modeBtnClassic.classList.remove('active');
      classicIntroBox.classList.add('hidden');
      battleIntroBox.classList.remove('hidden');
      snakeTitleLabel.textContent = ArcadeI18n.t('snake.battle_label');
      targetScoreBadge.classList.add('hidden');
    }

    overlayPause.classList.add('hidden');
    overlayGameOver.classList.add('hidden');
    overlayStart.classList.remove('hidden');
    engine.reset(selectedStartLevel);
    updateStatsDisplay();
  }

  function startGame() {
    sound.init();
    overlayStart.classList.add('hidden');
    overlayPause.classList.add('hidden');
    overlayGameOver.classList.add('hidden');

    engine.reset(selectedStartLevel);
    engine.isPlaying = true;
    engine.startTime = Date.now();
    lastTime = performance.now();
    tickCounter = 0;
    updateStatsDisplay();
  }

  function updateSoundIcon() {
    const isMuted = sound.isMuted();
    if (btnSoundToggle) {
      btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
      btnSoundToggle.setAttribute('title', isMuted ? (ArcadeI18n ? ArcadeI18n.t('defense.mute') : 'Mute') : (ArcadeI18n ? ArcadeI18n.t('defense.audio') : 'Sound'));
    }
  }

  function togglePause() {
    if (!engine.isPlaying || engine.isGameOver) return;
    if (engine.isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }

  function pauseGame() {
    engine.isPaused = true;
    overlayPause.classList.remove('hidden');
    if (btnMobilePause) {
      btnMobilePause.textContent = '▶';
      btnMobilePause.setAttribute('title', ArcadeI18n ? ArcadeI18n.t('defense.resume') : 'Resume');
    }
  }

  function resumeGame() {
    engine.isPaused = false;
    overlayPause.classList.add('hidden');
    lastTime = performance.now();
    if (btnMobilePause) {
      btnMobilePause.textContent = '⏸';
      btnMobilePause.setAttribute('title', ArcadeI18n ? ArcadeI18n.t('defense.pause') : 'Pause');
    }
  }

  async function handleGameOver(isVictory, messageKey = '') {
    engine.isPlaying = false;
    overlayGameOver.classList.remove('hidden');

    goTitle.textContent = isVictory ? ArcadeI18n.t('tetris.go_victory') : ArcadeI18n.t('tetris.go_title');
    goTitle.style.color = isVictory ? '#ffd700' : '#ff3366';
    
    // Translate message key properly
    let subtitleText = ArcadeI18n.t(messageKey);
    if (!subtitleText || subtitleText === messageKey) {
      subtitleText = isVictory ? ArcadeI18n.t('snake.toast_victory') : ArcadeI18n.t('tetris.go_summary');
    }
    goSubtitle.textContent = subtitleText;

    goFinalScore.textContent = engine.score.toLocaleString();
    goFinalLength.textContent = engine.snake.length;
    goFinalLevel.textContent = `Lv.${engine.level}`;

    if (isVictory) {
      goClearRow.classList.remove('hidden');
    } else {
      goClearRow.classList.add('hidden');
    }

    // Submit score if logged in
    if (currentUser) {
      goLoginHint.classList.add('hidden');
      const res = await SnakeAPI.submitScore({
        mode: currentMode,
        score: engine.score,
        length: engine.snake.length,
        level: engine.level,
        startLevel: selectedStartLevel,
        isCleared: isVictory,
        durationSeconds: engine.elapsedSeconds,
      });

      if (res && res.rank) {
        goFinalRank.textContent = `Top ${res.rank}`;
      } else {
        goFinalRank.textContent = ArcadeI18n.t('common.recorded');
      }
    } else {
      goLoginHint.classList.remove('hidden');
      goFinalRank.textContent = ArcadeI18n.t('common.guest');
    }
  }

  function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    // Start / Restart
    if (!engine.isPlaying) {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyR') {
        startGame();
        return;
      }
    }

    // Pause toggle
    if (e.code === 'KeyP' || e.code === 'Escape') {
      togglePause();
      return;
    }

    // Direction Controls
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        engine.setDirection(0, -1);
        break;
      case 'ArrowDown':
      case 'KeyS':
        engine.setDirection(0, 1);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        engine.setDirection(-1, 0);
        break;
      case 'ArrowRight':
      case 'KeyD':
        engine.setDirection(1, 0);
        break;
    }
  }

  function setupTouchControls() {
    const btnUp = document.getElementById('btn-touch-up');
    const btnDown = document.getElementById('btn-touch-down');
    const btnLeft = document.getElementById('btn-touch-left');
    const btnRight = document.getElementById('btn-touch-right');

    if (btnUp && btnDown && btnLeft && btnRight) {
      const addTouch = (btn, dx, dy) => {
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          sound.init();
          engine.setDirection(dx, dy);
        });
      };
      addTouch(btnUp, 0, -1);
      addTouch(btnDown, 0, 1);
      addTouch(btnLeft, -1, 0);
      addTouch(btnRight, 1, 0);
    }

    // Canvas Touch Swipe
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

      sound.init();
      if (Math.abs(dx) > Math.abs(dy)) {
        engine.setDirection(dx > 0 ? 1 : -1, 0);
      } else {
        engine.setDirection(0, dy > 0 ? 1 : -1);
      }
    });
  }

  function updateStatsDisplay() {
    statScore.textContent = engine.score.toLocaleString();
    statLength.textContent = engine.snake.length;
    statLevel.textContent = engine.level;

    if (currentMode === 'classic') {
      const target = SNAKE_CONFIG.LEVEL_TARGET_SCORES[engine.level - 1] || 20000;
      targetScoreBadge.textContent = `${ArcadeI18n.t('snake.target_badge')} ${target.toLocaleString()} ${ArcadeI18n.t('common.pts')}`;
    }
  }

  function updateSoundIcon() {
    if (sound.isMuted) {
      iconSoundOn.classList.add('hidden');
      iconSoundOff.classList.remove('hidden');
    } else {
      iconSoundOn.classList.remove('hidden');
      iconSoundOff.classList.add('hidden');
    }
  }

  // --- Rendering Loop ---
  function renderLoop(time) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (engine.isPlaying && !engine.isPaused && !engine.isGameOver) {
      tickCounter += deltaTime;
      const speed = engine.getSpeedMs();

      if (currentMode === 'battle') {
        aiAgent.decideNextMove();
      }

      if (tickCounter >= speed) {
        tickCounter = 0;
        engine.tick();
        updateStatsDisplay();
      }

      // Update timer
      engine.elapsedSeconds = Math.floor((Date.now() - engine.startTime) / 1000);
      const mins = String(Math.floor(engine.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(engine.elapsedSeconds % 60).padStart(2, '0');
      statTime.textContent = `${mins}:${secs}`;
    }

    drawScene();
    requestAnimationFrame(renderLoop);
  }

  function drawScene() {
    const cellSize = 600 / engine.cols;

    // Clear Screen
    ctx.fillStyle = '#0a0c16';
    ctx.fillRect(0, 0, 600, 600);

    // Draw Subtle Cyberpunk Grid Lines
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= engine.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, 600);
      ctx.stroke();
    }
    for (let r = 0; r <= engine.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(600, r * cellSize);
      ctx.stroke();
    }

    // Draw Obstacles (Neon Laser Barriers)
    for (const obs of engine.obstacles) {
      const ox = obs.x * cellSize;
      const oy = obs.y * cellSize;
      ctx.fillStyle = 'rgba(255, 0, 127, 0.35)';
      ctx.fillRect(ox + 1, oy + 1, cellSize - 2, cellSize - 2);
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 1, oy + 1, cellSize - 2, cellSize - 2);
    }

    // Draw Foods
    for (const food of engine.foods) {
      const fx = food.x * cellSize + cellSize / 2;
      const fy = food.y * cellSize + cellSize / 2;

      ctx.save();
      ctx.shadowColor = food.glow;
      ctx.shadowBlur = 15;
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(fx, fy, cellSize * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Food Inner core
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(fx, fy, cellSize * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw AI Snake (Battle Mode)
    if (engine.mode === 'battle' && engine.aiSnake && engine.aiAlive) {
      drawSnakeBody(engine.aiSnake, '#00f0ff', '#0077b6', engine.aiDir, cellSize, 'AI');
    }

    // Draw Player Snake
    drawSnakeBody(engine.snake, '#00ff88', '#00994d', engine.dir, cellSize, 'YOU');

    // Draw Particle Explosions
    for (const p of engine.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawSnakeBody(snakeSegments, primaryColor, secondaryColor, dir, cellSize, label) {
    if (!snakeSegments || snakeSegments.length === 0) return;

    // Draw Body Segments with smooth connected rounded rects
    for (let i = snakeSegments.length - 1; i >= 0; i--) {
      const seg = snakeSegments[i];
      const sx = seg.x * cellSize;
      const sy = seg.y * cellSize;
      const isHead = (i === 0);

      ctx.save();
      if (isHead) {
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 18;
        ctx.fillStyle = primaryColor;
      } else {
        const ratio = i / snakeSegments.length;
        ctx.fillStyle = isHead ? primaryColor : (i % 2 === 0 ? primaryColor : secondaryColor);
      }

      ctx.beginPath();
      ctx.roundRect(sx + 2, sy + 2, cellSize - 4, cellSize - 4, 6);
      ctx.fill();

      // Draw Head Directional Eyes
      if (isHead) {
        ctx.fillStyle = '#000';
        const eyeOffset = cellSize * 0.28;
        const eyeSize = cellSize * 0.18;

        let eye1X = sx + cellSize / 2 - eyeOffset;
        let eye1Y = sy + cellSize / 2 - eyeOffset;
        let eye2X = sx + cellSize / 2 + eyeOffset;
        let eye2Y = sy + cellSize / 2 - eyeOffset;

        if (dir.x === 1) { // Moving Right
          eye1X = sx + cellSize * 0.65; eye1Y = sy + cellSize * 0.3;
          eye2X = sx + cellSize * 0.65; eye2Y = sy + cellSize * 0.7;
        } else if (dir.x === -1) { // Moving Left
          eye1X = sx + cellSize * 0.35; eye1Y = sy + cellSize * 0.3;
          eye2X = sx + cellSize * 0.35; eye2Y = sy + cellSize * 0.7;
        } else if (dir.y === 1) { // Moving Down
          eye1X = sx + cellSize * 0.3; eye1Y = sy + cellSize * 0.65;
          eye2X = sx + cellSize * 0.7; eye2Y = sy + cellSize * 0.65;
        } else if (dir.y === -1) { // Moving Up
          eye1X = sx + cellSize * 0.3; eye1Y = sy + cellSize * 0.35;
          eye2X = sx + cellSize * 0.7; eye2Y = sy + cellSize * 0.35;
        }

        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Eye Pupils
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(eye1X + dir.x * 1.5, eye1Y + dir.y * 1.5, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.arc(eye2X + dir.x * 1.5, eye2Y + dir.y * 1.5, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- Auth & Leaderboard Handlers ---
  async function checkUserAuth() {
    currentUser = SnakeAPI.getCurrentUser();
    if (currentUser) {
      updateUserAuthUI();
    }
    try {
      const freshUser = await SnakeAPI.getProfile();
      if (freshUser) {
        currentUser = freshUser;
        if (currentUser.language && currentUser.language !== ArcadeI18n.getLanguage()) {
          ArcadeI18n.setLanguage(currentUser.language, false);
        }
        updateUserAuthUI();
      } else if (!currentUser) {
        currentUser = null;
        updateUserAuthUI();
      }
    } catch {
      if (!currentUser) {
        currentUser = null;
        updateUserAuthUI();
      }
    }
  }

  function updateUserAuthUI() {
    if (currentUser) {
      if (btnOpenLogin) {
        btnOpenLogin.classList.add('hidden');
        btnOpenLogin.style.display = 'none';
      }
      if (userBadge) {
        userBadge.classList.remove('hidden');
        userBadge.style.display = 'inline-flex';
        if (displayUsername) displayUsername.textContent = currentUser.username;
        if (userAvatar) userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
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

  function setupModalListeners() {
    // Auth Modal
    btnOpenLogin.addEventListener('click', () => openAuthModal(false));
    btnGoLogin.addEventListener('click', () => openAuthModal(false));
    btnCloseAuth.addEventListener('click', () => modalAuth.classList.add('hidden'));
    tabLogin.addEventListener('click', () => openAuthModal(false));
    tabRegister.addEventListener('click', () => openAuthModal(true));

    btnLogout.addEventListener('click', () => {
      if (confirm(ArcadeI18n.t('auth.confirm_logout'))) {
        SnakeAPI.clearToken();
        currentUser = null;
        updateUserAuthUI();
        showToast('👋 Logged out successfully');
      }
    });

    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      authError.classList.add('hidden');
      const u = authUsername.value.trim();
      const p = authPassword.value;

      btnAuthSubmit.disabled = true;
      try {
        if (isRegistering) {
          await SnakeAPI.register(u, p);
          showToast(`🎉 Welcome ${u}!`);
        } else {
          await SnakeAPI.login(u, p);
          showToast(`👋 Welcome back, ${u}!`);
        }
        await checkUserAuth();
        modalAuth.classList.add('hidden');
      } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove('hidden');
      } finally {
        btnAuthSubmit.disabled = false;
      }
    });

    // Leaderboard Modal
    btnLeaderboard.addEventListener('click', () => {
      modalLeaderboard.classList.remove('hidden');
      loadLeaderboardData();
    });
    btnCloseLeaderboard.addEventListener('click', () => modalLeaderboard.classList.add('hidden'));
    btnCloseLeaderboardFooter.addEventListener('click', () => modalLeaderboard.classList.add('hidden'));
    btnRefreshLeaderboard.addEventListener('click', loadLeaderboardData);

    lbTabClassic.addEventListener('click', () => {
      lbTabClassic.classList.add('active');
      lbTabBattle.classList.remove('active');
      activeLeaderboardTab = 'classic';
      loadLeaderboardData();
    });

    lbTabBattle.addEventListener('click', () => {
      lbTabBattle.classList.add('active');
      lbTabClassic.classList.remove('active');
      activeLeaderboardTab = 'battle';
      loadLeaderboardData();
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

  async function loadLeaderboardData() {
    leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell">${ArcadeI18n.t('lb.loading')}</td></tr>`;

    try {
      const data = await SnakeAPI.getTop50(activeLeaderboardTab);
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

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
