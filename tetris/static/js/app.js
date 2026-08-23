/**
 * Main Application and UI Controller for TETRIS PRO.
 * Supports Dual Game Modes: Solo 50-Level Campaign & VS AI Battle Mode.
 * Full reactive multi-language internationalization (en, zh, ja).
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // 1. DOM Elements - Canvases
  const matrixCanvas = document.getElementById('matrix-canvas');
  const matrixCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
  const aiMatrixCanvas = document.getElementById('ai-matrix-canvas');
  const aiMatrixCtx = aiMatrixCanvas ? aiMatrixCanvas.getContext('2d') : null;
  const holdCanvas = document.getElementById('hold-canvas');
  const holdCtx = holdCanvas ? holdCanvas.getContext('2d') : null;
  const holdCanvasMobile = document.getElementById('hold-canvas-mobile');
  const holdCtxMobile = holdCanvasMobile ? holdCanvasMobile.getContext('2d') : null;

  const nextCanvas = document.getElementById('next-canvas');
  const nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;
  const nextCanvasMobile = document.getElementById('next-canvas-mobile');
  const nextCtxMobile = nextCanvasMobile ? nextCanvasMobile.getContext('2d') : null;

  // 2. DOM Elements - Layout & HUD
  const gameLayout = document.getElementById('game-layout');
  const aiSection = document.getElementById('ai-section');
  const playerMatrixLabel = document.getElementById('player-matrix-label');
  const playerAttackGauge = document.getElementById('player-attack-gauge');
  const aiAttackGauge = document.getElementById('ai-attack-gauge');

  const statScore = document.getElementById('stat-score');
  const statScoreMobile = document.getElementById('stat-score-mobile');
  const statLines = document.getElementById('stat-lines');
  const statLinesMobile = document.getElementById('stat-lines-mobile');
  const statLevel = document.getElementById('stat-level');
  const statLevelMobile = document.getElementById('stat-level-mobile');
  const statTime = document.getElementById('stat-time');
  const statTimeMobile = document.getElementById('stat-time-mobile');

  const soloHudCenter = document.getElementById('solo-hud-center');
  const vsHudCenter = document.getElementById('vs-hud-center');
  const mVsPlayerAttack = document.getElementById('m-vs-player-attack');
  const mVsRoundBadge = document.getElementById('m-vs-round-badge');
  const mVsAiAttack = document.getElementById('m-vs-ai-attack');

  // 3. DOM Elements - Mode Switcher Tabs
  const modeBtnSolo = document.getElementById('mode-btn-solo');
  const modeBtnVs = document.getElementById('mode-btn-vs');

  // 4. DOM Elements - Start Overlay & Sliders
  const overlayStart = document.getElementById('overlay-start');
  const startOverlayTitle = document.getElementById('start-overlay-title');
  const soloLevelSelectBox = document.getElementById('solo-level-select-box');
  const vsDifficultySelectBox = document.getElementById('vs-difficulty-select-box');
  const startLevelSlider = document.getElementById('start-level-slider');
  const selectedLevelVal = document.getElementById('selected-level-val');
  const hintGravity = document.getElementById('hint-gravity');
  const hintTarget = document.getElementById('hint-target');

  const aiDiffSlider = document.getElementById('ai-diff-slider');
  const selectedAiDiffVal = document.getElementById('selected-ai-diff-val');
  const aiMatchDiffVal = document.getElementById('ai-match-diff-val');
  const aiMatchSeqVal = document.getElementById('ai-match-seq-val');
  const btnGameStart = document.getElementById('btn-game-start');

  // Button Options for VS Mode
  const btnSeqSync = document.getElementById('btn-seq-sync');
  const btnSeqRand = document.getElementById('btn-seq-rand');
  const btnGarbageStandard = document.getElementById('btn-garbage-standard');
  const btnGarbageCheesy = document.getElementById('btn-garbage-cheesy');
  const btnGarbageClassic = document.getElementById('btn-garbage-classic');

  // 5. DOM Elements - Pause & Game Over Overlays
  const overlayPause = document.getElementById('overlay-pause');
  const btnResumeGame = document.getElementById('btn-resume-game');
  const btnRestartFromPause = document.getElementById('btn-restart-from-pause');

  const overlayGameOver = document.getElementById('overlay-game-over');
  const goTitle = document.getElementById('go-title');
  const goSubtitle = document.getElementById('go-subtitle');
  const goFinalScore = document.getElementById('go-final-score');
  const goFinalLines = document.getElementById('go-final-lines');
  const goFinalLevel = document.getElementById('go-final-level');
  const goFinalRank = document.getElementById('go-final-rank');
  const goRankRow = document.getElementById('go-rank-row');
  const goClearRow = document.getElementById('go-clear-row');
  const goLoginHint = document.getElementById('go-login-hint');
  const btnGoLogin = document.getElementById('btn-go-login');
  const btnRestartGame = document.getElementById('btn-restart-game');

  // 6. DOM Elements - Header Actions & Audio
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const btnLeaderboard = document.getElementById('btn-leaderboard');
  const btnOpenLogin = document.getElementById('btn-open-login');
  const userBadge = document.getElementById('user-badge');
  const userAvatar = document.getElementById('user-avatar');
  const displayUsername = document.getElementById('display-username');
  const displayUserBest = document.getElementById('display-user-best');
  const btnLogout = document.getElementById('btn-logout');

  // 7. DOM Elements - Modals
  const modalAuth = document.getElementById('modal-auth');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  const tabBtnLogin = document.getElementById('tab-btn-login');
  const tabBtnRegister = document.getElementById('tab-btn-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const loginError = document.getElementById('login-error');
  const regError = document.getElementById('reg-error');

  const modalLeaderboard = document.getElementById('modal-leaderboard');
  const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
  const btnCloseLeaderboardFooter = document.getElementById('btn-close-leaderboard-footer');
  const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
  const tabLeaderboardSolo = document.getElementById('tab-leaderboard-solo');
  const tabLeaderboardVs = document.getElementById('tab-leaderboard-vs');
  const tabLeaderboardMy = document.getElementById('tab-leaderboard-my');
  const leaderboardThead = document.getElementById('leaderboard-thead');
  const leaderboardTbody = document.getElementById('leaderboard-tbody');
  const toastEl = document.getElementById('toast');

  // 8. Game State Variables
  let currentMode = 'solo'; // 'solo' or 'vs_ai'
  let selectedStartLevel = 1;
  let selectedAiDifficulty = 2; // 1: Beginner, 2: Standard, 3: Advanced, 4: Master
  let selectedSequenceMode = 'sync'; // 'sync' or 'random'
  let selectedGarbageMode = 'standard'; // 'standard', 'cheesy', 'classic'

  const playerGame = new TetrisEngine('solo');
  const aiGame = new TetrisEngine('vs_ai');
  const aiAgent = new TetrisAI(aiGame);

  let lastTime = 0;
  let playerDropCounter = 0;
  let playerLockTimer = 0;
  let currentUser = null;
  let vsRound = 1;
  let isRoundTransitioning = false;
  let activeLeaderboardTab = 'solo';

  // Cross-link garbage in VS mode
  playerGame.onAttackCallback = (lines) => {
    if (currentMode === 'vs_ai') {
      aiGame.receiveGarbage(lines);
      sound.playHardDrop();
      showToast(ArcadeI18n.t('tetris.toast_attack', { lines }), 1200);
    }
  };

  aiGame.onAttackCallback = (lines) => {
    if (currentMode === 'vs_ai') {
      playerGame.receiveGarbage(lines);
      showToast(ArcadeI18n.t('tetris.toast_incoming_garbage', { lines }), 1200);
    }
  };

  aiGame.onGarbageApplied = () => {
    aiAgent.targetMove = null;
  };

  // --- Toast Function ---
  function showToast(message, duration = 2500) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    setTimeout(() => {
      toastEl.classList.add('hidden');
    }, duration);
  }

  // --- Sound UI ---
  function updateSoundUI() {
    const isMuted = sound.isMuted();
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.textContent = isMuted ? '🔇' : '🔊';
      btnSound.setAttribute('title', isMuted ? (ArcadeI18n ? ArcadeI18n.t('defense.mute') : 'Mute') : (ArcadeI18n ? ArcadeI18n.t('defense.audio') : 'Sound'));
    }
  }

  // --- Update Mode View ---
  function setGameMode(mode) {
    currentMode = mode;
    playerGame.mode = mode;
    playerGame.isPlaying = false;
    aiGame.isPlaying = false;

    if (mode === 'solo') {
      if (modeBtnSolo) modeBtnSolo.classList.add('active');
      if (modeBtnVs) modeBtnVs.classList.remove('active');
      if (gameLayout) {
        gameLayout.classList.remove('mode-vs_ai');
        gameLayout.classList.add('mode-solo');
      }
      if (aiSection) aiSection.classList.add('hidden');
      if (soloLevelSelectBox) soloLevelSelectBox.classList.remove('hidden');
      if (vsDifficultySelectBox) vsDifficultySelectBox.classList.add('hidden');
      if (soloHudCenter) soloHudCenter.classList.remove('hidden');
      if (vsHudCenter) vsHudCenter.classList.add('hidden');
    } else {
      if (modeBtnVs) modeBtnVs.classList.add('active');
      if (modeBtnSolo) modeBtnSolo.classList.remove('active');
      if (gameLayout) {
        gameLayout.classList.add('mode-vs_ai');
        gameLayout.classList.remove('mode-solo');
      }
      if (aiSection) aiSection.classList.remove('hidden');
      if (soloLevelSelectBox) soloLevelSelectBox.classList.add('hidden');
      if (vsDifficultySelectBox) vsDifficultySelectBox.classList.remove('hidden');
      if (soloHudCenter) soloHudCenter.classList.add('hidden');
      if (vsHudCenter) vsHudCenter.classList.remove('hidden');
    }

    if (overlayStart) overlayStart.classList.remove('hidden');
    if (overlayPause) overlayPause.classList.add('hidden');
    if (overlayGameOver) overlayGameOver.classList.add('hidden');

    updateSliderHints();
    updateScoreDisplays();
    drawAll();
  }

  function updateSliderHints() {
    if (selectedLevelVal) selectedLevelVal.textContent = `Lv.${selectedStartLevel}`;
    const speedMs = CONFIG.SPEED_CURVE[selectedStartLevel - 1] || 1000;
    if (hintGravity) hintGravity.textContent = `${speedMs}${ArcadeI18n.t('common.ms')}`;
    if (hintTarget) hintTarget.textContent = `${selectedStartLevel * 10} ${ArcadeI18n.t('common.lines')}`;

    if (selectedAiDiffVal) {
      const diffKeys = { 1: 'tetris.diff_easy', 2: 'tetris.diff_med', 3: 'tetris.diff_hard', 4: 'tetris.diff_master' };
      const diffLabel = ArcadeI18n.t(diffKeys[selectedAiDifficulty] || 'tetris.diff_med');
      selectedAiDiffVal.textContent = diffLabel;
      if (aiMatchDiffVal) {
        aiMatchDiffVal.textContent = diffLabel;
      }
      if (aiMatchSeqVal) {
        aiMatchSeqVal.textContent = selectedSequenceMode === 'sync' ? ArcadeI18n.t('tetris.seq_sync_short') : ArcadeI18n.t('tetris.seq_rand_short');
      }
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Mode Switcher Buttons
    if (modeBtnSolo) {
      modeBtnSolo.addEventListener('click', () => {
        if (currentMode === 'solo') return;
        setGameMode('solo');
      });
    }

    if (modeBtnVs) {
      modeBtnVs.addEventListener('click', () => {
        if (currentMode === 'vs_ai') return;
        setGameMode('vs_ai');
      });
    }

    // Sliders
    if (startLevelSlider) {
      startLevelSlider.addEventListener('input', (e) => {
        selectedStartLevel = parseInt(e.target.value, 10);
        updateSliderHints();
      });
    }

    if (aiDiffSlider) {
      aiDiffSlider.addEventListener('input', (e) => {
        selectedAiDifficulty = parseInt(e.target.value, 10);
        updateSliderHints();
      });
    }

    // Piece Sequence Button Options
    if (btnSeqSync && btnSeqRand) {
      btnSeqSync.addEventListener('click', () => {
        selectedSequenceMode = 'sync';
        btnSeqSync.classList.add('active');
        btnSeqRand.classList.remove('active');
        sound.init();
        sound.playMove();
      });

      btnSeqRand.addEventListener('click', () => {
        selectedSequenceMode = 'random';
        btnSeqRand.classList.add('active');
        btnSeqSync.classList.remove('active');
        sound.init();
        sound.playMove();
      });
    }

    // Garbage Hole Alignment Button Options
    if (btnGarbageStandard && btnGarbageCheesy && btnGarbageClassic) {
      btnGarbageStandard.addEventListener('click', () => {
        selectedGarbageMode = 'standard';
        btnGarbageStandard.classList.add('active');
        btnGarbageCheesy.classList.remove('active');
        btnGarbageClassic.classList.remove('active');
        sound.init();
        sound.playMove();
      });

      btnGarbageCheesy.addEventListener('click', () => {
        selectedGarbageMode = 'cheesy';
        btnGarbageCheesy.classList.add('active');
        btnGarbageStandard.classList.remove('active');
        btnGarbageClassic.classList.remove('active');
        sound.init();
        sound.playMove();
      });

      btnGarbageClassic.addEventListener('click', () => {
        selectedGarbageMode = 'classic';
        btnGarbageClassic.classList.add('active');
        btnGarbageStandard.classList.remove('active');
        btnGarbageCheesy.classList.remove('active');
        sound.init();
        sound.playMove();
      });
    }

    // Start / Resume / Restart
    if (btnGameStart) btnGameStart.addEventListener('click', startGame);
    if (btnResumeGame) btnResumeGame.addEventListener('click', pauseGame);
    if (btnRestartFromPause) btnRestartFromPause.addEventListener('click', startGame);
    if (btnRestartGame) btnRestartGame.addEventListener('click', startGame);

    // Audio Mute Toggle
    if (btnSoundToggle) {
      btnSoundToggle.addEventListener('click', () => {
        sound.init();
        sound.toggleMute();
        updateSoundUI();
        showToast(sound.isMuted() ? ArcadeI18n.t('common.sound_off') : ArcadeI18n.t('common.sound_on'));
      });
    }

    // Keyboard Controls
    window.addEventListener('keydown', handleKeyDown);

    // Mobile Touch Controllers
    setupTouchControls();

    // Modals
    setupModalListeners();

    // Reactive Language Switch Listener
    window.addEventListener('arcadeLanguageChanged', () => {
      updateSliderHints();
      updateScoreDisplays();
      drawAll();
    });
  }

  // --- Start Game ---
  function startGame() {
    sound.init();
    vsRound = 1;
    if (goClearRow) goClearRow.classList.add('hidden');
    if (goTitle) {
      goTitle.textContent = ArcadeI18n.t('tetris.go_title');
      goTitle.style.color = '';
    }
    if (goSubtitle) goSubtitle.textContent = ArcadeI18n.t('tetris.go_summary');

    if (currentMode === 'solo') {
      playerGame.reset(selectedStartLevel);
    } else {
      const AI_START_LEVELS = { 1: 1, 2: 10, 3: 20, 4: 30 };
      vsRound = AI_START_LEVELS[selectedAiDifficulty] || 1;
      isRoundTransitioning = false;

      const matchSeed = selectedSequenceMode === 'sync' ? Math.floor(Math.random() * 2147483647) : null;
      playerGame.reset(1, matchSeed, selectedGarbageMode);
      aiGame.reset(vsRound, matchSeed, selectedGarbageMode);
      aiAgent.setSpeedByLevel(vsRound);
      aiGame.isPlaying = true;
      aiGame.isGameOver = false;
      aiGame.spawnPiece();
    }

    playerGame.isPlaying = true;
    playerGame.isGameOver = false;
    playerGame.isPaused = false;
    playerGame.startTime = Date.now();
    playerGame.spawnPiece();

    if (overlayStart) overlayStart.classList.add('hidden');
    if (overlayPause) overlayPause.classList.add('hidden');
    if (overlayGameOver) overlayGameOver.classList.add('hidden');

    lastTime = performance.now();
    playerDropCounter = 0;
    playerLockTimer = 0;
  }

  // --- Pause Game ---
  function pauseGame() {
    if (!playerGame.isPlaying || playerGame.isGameOver) return;
    playerGame.isPaused = !playerGame.isPaused;
    if (currentMode === 'vs_ai') {
      aiGame.isPaused = playerGame.isPaused;
    }

    const headerPause = document.getElementById('btn-mobile-pause');
    if (headerPause) {
      headerPause.textContent = playerGame.isPaused ? '▶' : '⏸';
      headerPause.setAttribute('title', playerGame.isPaused ? (ArcadeI18n ? ArcadeI18n.t('defense.resume') : 'Resume') : (ArcadeI18n ? ArcadeI18n.t('defense.pause') : 'Pause'));
    }

    if (playerGame.isPaused) {
      if (overlayPause) overlayPause.classList.remove('hidden');
    } else {
      if (overlayPause) overlayPause.classList.add('hidden');
      lastTime = performance.now();
    }
  }

  // --- Game Loop ---
  function gameLoop(time = 0) {
    if (!playerGame.isPlaying || playerGame.isPaused || playerGame.isGameOver) {
      requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    // 1. Update Player Game
    playerDropCounter += deltaTime;
    const fallInterval = playerGame.getFallSpeed();

    if (playerDropCounter > fallInterval) {
      if (!playerGame.softDrop()) {
        playerLockTimer += playerDropCounter;
        if (playerLockTimer >= CONFIG.LOCK_DELAY_MS) {
          const cleared = playerGame.lockPiece();
          handlePlayerAfterLock(cleared);
          playerLockTimer = 0;
        }
      } else {
        playerLockTimer = 0;
      }
      playerDropCounter = 0;
    }

    // 2. Update AI Game in VS Mode
    if (currentMode === 'vs_ai') {
      if (aiGame.isGameOver && !isRoundTransitioning) {
        handleAiDefeated();
      } else if (aiGame.isPlaying && !aiGame.isGameOver && !isRoundTransitioning) {
        aiAgent.update(deltaTime);
        if (aiGame.isGameOver) {
          handleAiDefeated();
        }
      }
    }

    // 3. Render and Update Stats
    drawAll();
    updateScoreDisplays();

    requestAnimationFrame(gameLoop);
  }

  function handlePlayerAfterLock(cleared) {
    if (cleared > 0) {
      sound.playLineClear(cleared);
      if (currentMode === 'solo') {
        if (playerGame.isCleared) {
          sound.playLevelUp();
          handleGameVictory();
          return;
        }
        if (playerGame.linesInLevel === 0) {
          sound.playLevelUp();
          showToast(ArcadeI18n.t('tetris.toast_level', { level: playerGame.level }), 1800);
        }
      }
    }

    if (playerGame.isGameOver) {
      sound.playGameOver();
      handleGameOver(false);
    }
  }

  function handleAiDefeated() {
    if (isRoundTransitioning) return;
    isRoundTransitioning = true;

    sound.playLevelUp();
    showToast(ArcadeI18n.t('tetris.ko_player_win'), 2500);

    playerGame.score += 5000 * vsRound;
    vsRound++;
    playerGame.pendingGarbage = 0;

    setTimeout(() => {
      const roundSeed = selectedSequenceMode === 'sync' ? Math.floor(Math.random() * 2147483647) : null;
      aiGame.reset(vsRound, roundSeed, selectedGarbageMode);
      aiAgent.setSpeedByLevel(vsRound);
      aiGame.isPlaying = true;
      aiGame.isGameOver = false;
      aiGame.spawnPiece();
      isRoundTransitioning = false;
      updateScoreDisplays();
      showToast(ArcadeI18n.t('tetris.toast_round', { round: vsRound }), 1800);
    }, 1500);
  }

  function handleGameVictory() {
    playerGame.isPlaying = false;
    if (goTitle) {
      goTitle.textContent = ArcadeI18n.t('tetris.go_victory');
      goTitle.style.color = '#ffd700';
    }
    if (goSubtitle) goSubtitle.textContent = ArcadeI18n.t('tetris.all_clear_achieved');
    if (goClearRow) goClearRow.classList.remove('hidden');
    handleGameOver(true);
  }

  async function handleGameOver(isVictory = false) {
    const elapsed = Math.floor((Date.now() - playerGame.startTime) / 1000);
    playerGame.elapsedSeconds = elapsed;

    if (goFinalScore) goFinalScore.textContent = playerGame.score.toLocaleString();
    if (goFinalLines) goFinalLines.textContent = playerGame.lines;
    if (goFinalLevel) goFinalLevel.textContent = currentMode === 'solo' ? `Lv.${playerGame.level}` : `Round ${vsRound}`;
    if (goRankRow) goRankRow.classList.add('hidden');

    if (currentUser) {
      if (goLoginHint) goLoginHint.classList.add('hidden');
      try {
        const result = await API.submitScore(
          currentMode,
          playerGame.score,
          playerGame.lines,
          playerGame.level,
          playerGame.startLevel,
          isVictory || playerGame.isCleared,
          elapsed
        );

        if (result && result.rank) {
          if (goRankRow) goRankRow.classList.remove('hidden');
          if (goFinalRank) goFinalRank.textContent = `Top ${result.rank}`;
          if (result.is_top_50) {
            showToast(ArcadeI18n.t('tetris.toast_top_rank', { rank: result.rank }));
          }
        }
        await checkAuthStatus();
      } catch (err) {
        console.error('Failed to submit score:', err);
      }
    } else {
      if (goLoginHint) goLoginHint.classList.remove('hidden');
      if (goFinalRank) goFinalRank.textContent = ArcadeI18n.t('common.guest');
    }

    if (overlayGameOver) overlayGameOver.classList.remove('hidden');
  }

  // --- Rendering Helpers ---
  function drawBlock(ctx, x, y, color, size = CONFIG.BLOCK_SIZE, isGhost = false, isGarbage = false) {
    const px = x * size;
    const py = y * size;

    if (isGhost) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      return;
    }

    if (isGarbage) {
      ctx.fillStyle = '#444455';
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      ctx.strokeStyle = '#666677';
      ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
      return;
    }

    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(px + 1, py + 1, size - 2, 2);
    ctx.fillRect(px + 1, py + 1, 2, size - 2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(px + 1, py + size - 3, size - 2, 2);
    ctx.fillRect(px + size - 3, py + 1, 2, size - 2);
  }

  function drawMatrix(ctx, canvas, engine, isAI = false) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= CONFIG.COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CONFIG.BLOCK_SIZE, 0);
      ctx.lineTo(c * CONFIG.BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r <= CONFIG.ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CONFIG.BLOCK_SIZE);
      ctx.lineTo(canvas.width, r * CONFIG.BLOCK_SIZE);
      ctx.stroke();
    }

    // Locked blocks
    for (let r = CONFIG.BUFFER_ROWS; r < engine.rows; r++) {
      for (let c = 0; c < engine.cols; c++) {
        const cell = engine.grid[r][c];
        if (cell !== 0) {
          drawBlock(ctx, c, r - CONFIG.BUFFER_ROWS, cell.color, CONFIG.BLOCK_SIZE, false, cell.isGarbage);
        }
      }
    }

    // Active piece & Ghost piece
    if (engine.currentPiece) {
      if (!isAI) {
        const ghost = engine.getGhostPosition();
        if (ghost && ghost.y !== engine.currentPiece.y) {
          for (let r = 0; r < ghost.shape.length; r++) {
            for (let c = 0; c < ghost.shape[r].length; c++) {
              if (ghost.shape[r][c]) {
                const drawY = ghost.y + r - CONFIG.BUFFER_ROWS;
                if (drawY >= 0) {
                  drawBlock(ctx, ghost.x + c, drawY, ghost.color, CONFIG.BLOCK_SIZE, true);
                }
              }
            }
          }
        }
      }

      for (let r = 0; r < engine.currentPiece.shape.length; r++) {
        for (let c = 0; c < engine.currentPiece.shape[r].length; c++) {
          if (engine.currentPiece.shape[r][c]) {
            const drawY = engine.currentPiece.y + r - CONFIG.BUFFER_ROWS;
            if (drawY >= 0) {
              drawBlock(ctx, engine.currentPiece.x + c, drawY, engine.currentPiece.color);
            }
          }
        }
      }
    }
  }

  function drawPieceInBox(ctx, type, canvasWidth, canvasHeight, blockSize = 24, offsetY = 0, offsetX = 0) {
    if (!type || !ctx) return;
    const def = TETROMINOES[type];
    const shape = def.shapes[0];
    const pieceWidth = shape[0].length * blockSize;
    const pieceHeight = shape.length * blockSize;
    const startX = offsetX + (canvasWidth - pieceWidth) / 2;
    const boxOffsetY = offsetY + (canvasHeight - pieceHeight) / 2;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          ctx.fillStyle = def.color;
          ctx.fillRect(startX + c * blockSize + 1, boxOffsetY + r * blockSize + 1, blockSize - 2, blockSize - 2);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(startX + c * blockSize + 1, boxOffsetY + r * blockSize + 1, blockSize - 2, 2);
          ctx.fillRect(startX + c * blockSize + 1, boxOffsetY + r * blockSize + 1, 2, blockSize - 2);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(startX + c * blockSize + 1, boxOffsetY + (r + 1) * blockSize - 3, blockSize - 2, 2);
          ctx.fillRect(startX + (c + 1) * blockSize - 3, boxOffsetY + r * blockSize + 1, 2, blockSize - 2);
        }
      }
    }
  }

  function drawAll() {
    drawMatrix(matrixCtx, matrixCanvas, playerGame, false);
    if (currentMode === 'vs_ai') {
      drawMatrix(aiMatrixCtx, aiMatrixCanvas, aiGame, true);
    }

    if (holdCtx && holdCanvas) {
      holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
      if (playerGame.holdPiece) {
        drawPieceInBox(holdCtx, playerGame.holdPiece, holdCanvas.width, holdCanvas.height, 24);
      }
    }
    if (holdCtxMobile && holdCanvasMobile) {
      holdCtxMobile.clearRect(0, 0, holdCanvasMobile.width, holdCanvasMobile.height);
      if (playerGame.holdPiece) {
        drawPieceInBox(holdCtxMobile, playerGame.holdPiece, holdCanvasMobile.width, holdCanvasMobile.height, 20);
      }
    }

    if (nextCtx && nextCanvas) {
      nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
      const queue = playerGame.nextQueue.slice(0, 3);
      const boxHeight = nextCanvas.height / 3;
      queue.forEach((type, idx) => {
        drawPieceInBox(nextCtx, type, nextCanvas.width, boxHeight, 20, idx * boxHeight);
      });
    }
    if (nextCtxMobile && nextCanvasMobile) {
      nextCtxMobile.clearRect(0, 0, nextCanvasMobile.width, nextCanvasMobile.height);
      const queue = playerGame.nextQueue.slice(0, 3);
      const slotWidth = nextCanvasMobile.width / 3;
      queue.forEach((type, idx) => {
        drawPieceInBox(nextCtxMobile, type, slotWidth, nextCanvasMobile.height, 18, 0, idx * slotWidth);
      });
    }
  }

  function updateScoreDisplays() {
    const scoreStr = playerGame.score.toLocaleString();
    if (statScore) statScore.textContent = scoreStr;
    if (statScoreMobile) statScoreMobile.textContent = scoreStr;
    if (statLines) statLines.textContent = playerGame.lines;
    if (statLinesMobile) statLinesMobile.textContent = playerGame.lines;
    if (statLevel) {
      statLevel.textContent = currentMode === 'solo' ? `${playerGame.level}/50` : `Round ${vsRound}`;
    }
    if (statLevelMobile) {
      statLevelMobile.textContent = currentMode === 'solo' ? `${playerGame.level}/50` : `R${vsRound}`;
    }

    if (playerAttackGauge) {
      playerAttackGauge.textContent = `${ArcadeI18n.t('tetris.attack_label')}: ${playerGame.pendingGarbage}`;
    }
    if (aiAttackGauge) {
      aiAttackGauge.textContent = `${ArcadeI18n.t('tetris.attack_label')}: ${aiGame.pendingGarbage}`;
    }
    if (mVsPlayerAttack) {
      mVsPlayerAttack.textContent = `YOU: ${playerGame.pendingGarbage}`;
    }
    if (mVsAiAttack) {
      mVsAiAttack.textContent = `AI: ${aiGame.pendingGarbage}`;
    }
    if (mVsRoundBadge) {
      mVsRoundBadge.textContent = `Round ${vsRound}`;
    }

    if (playerMatrixLabel) {
      playerMatrixLabel.textContent = ArcadeI18n.t('tetris.player_label');
    }

    if (playerGame.isPlaying) {
      const elapsed = Math.floor((Date.now() - playerGame.startTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      if (statTime) statTime.textContent = `${mins}:${secs}`;
      if (statTimeMobile) statTimeMobile.textContent = `${mins}:${secs}`;
    }
  }

  // --- Auth Management ---
  function updateUserAuthUI() {
    if (currentUser && currentUser.username) {
      if (displayUsername) displayUsername.textContent = currentUser.username;
      if (displayUserBest) displayUserBest.textContent = `Best: ${(currentUser.best_score || 0).toLocaleString()}`;
      if (userAvatar) userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();

      if (btnOpenLogin) {
        btnOpenLogin.classList.add('hidden');
        btnOpenLogin.setAttribute('hidden', '');
        btnOpenLogin.style.setProperty('display', 'none', 'important');
      }
      if (userBadge) {
        userBadge.classList.remove('hidden');
        userBadge.removeAttribute('hidden');
        userBadge.style.setProperty('display', 'inline-flex', 'important');
      }
    } else {
      if (btnOpenLogin) {
        btnOpenLogin.classList.remove('hidden');
        btnOpenLogin.removeAttribute('hidden');
        btnOpenLogin.style.setProperty('display', 'inline-flex', 'important');
      }
      if (userBadge) {
        userBadge.classList.add('hidden');
        userBadge.setAttribute('hidden', '');
        userBadge.style.setProperty('display', 'none', 'important');
      }
    }
  }

  async function checkAuthStatus() {
    currentUser = API.getCurrentUser();
    if (currentUser) {
      updateUserAuthUI();
    }
    try {
      const user = await API.getProfile();
      if (user) {
        currentUser = user;
        if (user.language && user.language !== ArcadeI18n.getLanguage()) {
          ArcadeI18n.setLanguage(user.language, false);
        }
      } else {
        currentUser = null;
      }
      updateUserAuthUI();
    } catch {
      currentUser = null;
      updateUserAuthUI();
    }
  }

  // --- Modal Listeners ---
  function setupModalListeners() {
    // Auth Modal
    if (btnOpenLogin) {
      btnOpenLogin.addEventListener('click', () => {
        if (modalAuth) modalAuth.classList.remove('hidden');
        if (tabBtnLogin) tabBtnLogin.click();
      });
    }
    if (btnGoLogin) {
      btnGoLogin.addEventListener('click', () => {
        if (modalAuth) modalAuth.classList.remove('hidden');
        if (tabBtnLogin) tabBtnLogin.click();
      });
    }
    if (btnCloseAuth) {
      btnCloseAuth.addEventListener('click', () => {
        if (modalAuth) modalAuth.classList.add('hidden');
      });
    }

    if (tabBtnLogin) {
      tabBtnLogin.addEventListener('click', () => {
        tabBtnLogin.classList.add('active');
        if (tabBtnRegister) tabBtnRegister.classList.remove('active');
        if (formLogin) formLogin.classList.remove('hidden');
        if (formRegister) formRegister.classList.add('hidden');
        if (loginError) loginError.classList.add('hidden');
      });
    }

    if (tabBtnRegister) {
      tabBtnRegister.addEventListener('click', () => {
        tabBtnRegister.classList.add('active');
        if (tabBtnLogin) tabBtnLogin.classList.remove('active');
        if (formRegister) formRegister.classList.remove('hidden');
        if (formLogin) formLogin.classList.add('hidden');
        if (regError) regError.classList.add('hidden');
      });
    }

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const uname = document.getElementById('login-username').value.trim();
        const pwd = document.getElementById('login-password').value;

        try {
          await API.login(uname, pwd);
          if (modalAuth) modalAuth.classList.add('hidden');
          showToast(`👋 Welcome back, ${uname}!`);
          await checkAuthStatus();
        } catch (err) {
          if (loginError) {
            loginError.textContent = err.message;
            loginError.classList.remove('hidden');
          }
        }
      });
    }

    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const uname = document.getElementById('reg-username').value.trim();
        const pwd = document.getElementById('reg-password').value;

        try {
          await API.register(uname, pwd);
          if (modalAuth) modalAuth.classList.add('hidden');
          showToast(`🎉 Welcome ${uname}!`);
          await checkAuthStatus();
        } catch (err) {
          if (regError) {
            regError.textContent = err.message;
            regError.classList.remove('hidden');
          }
        }
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        if (confirm(ArcadeI18n.t('auth.confirm_logout'))) {
          await API.logout();
          showToast('👋 Logged out successfully.');
          await checkAuthStatus();
        }
      });
    }

    // Leaderboard Modal
    if (btnLeaderboard) {
      btnLeaderboard.addEventListener('click', () => {
        if (modalLeaderboard) modalLeaderboard.classList.remove('hidden');
        if (tabLeaderboardSolo) tabLeaderboardSolo.click();
      });
    }
    if (btnCloseLeaderboard) {
      btnCloseLeaderboard.addEventListener('click', () => {
        if (modalLeaderboard) modalLeaderboard.classList.add('hidden');
      });
    }
    if (btnCloseLeaderboardFooter) {
      btnCloseLeaderboardFooter.addEventListener('click', () => {
        if (modalLeaderboard) modalLeaderboard.classList.add('hidden');
      });
    }
    if (btnRefreshLeaderboard) {
      btnRefreshLeaderboard.addEventListener('click', () => loadLeaderboardData(activeLeaderboardTab));
    }

    if (tabLeaderboardSolo) {
      tabLeaderboardSolo.addEventListener('click', () => {
        tabLeaderboardSolo.classList.add('active');
        if (tabLeaderboardVs) tabLeaderboardVs.classList.remove('active');
        if (tabLeaderboardMy) tabLeaderboardMy.classList.remove('active');
        loadLeaderboardData('solo');
      });
    }

    if (tabLeaderboardVs) {
      tabLeaderboardVs.addEventListener('click', () => {
        tabLeaderboardVs.classList.add('active');
        if (tabLeaderboardSolo) tabLeaderboardSolo.classList.remove('active');
        if (tabLeaderboardMy) tabLeaderboardMy.classList.remove('active');
        loadLeaderboardData('vs_ai');
      });
    }

    if (tabLeaderboardMy) {
      tabLeaderboardMy.addEventListener('click', () => {
        tabLeaderboardMy.classList.add('active');
        if (tabLeaderboardSolo) tabLeaderboardSolo.classList.remove('active');
        if (tabLeaderboardVs) tabLeaderboardVs.classList.remove('active');
        loadLeaderboardData('my');
      });
    }
  }

  async function loadLeaderboardData(tab = 'solo') {
    activeLeaderboardTab = tab;
    if (!leaderboardTbody) return;
    leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell">${ArcadeI18n.t('lb.loading')}</td></tr>`;

    if (tab === 'my') {
      if (!currentUser) {
        leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell">${ArcadeI18n.t('lb.login_required')}</td></tr>`;
        return;
      }
      try {
        const data = await API.getMyScores();
        if (!data || !data.history || data.history.length === 0) {
          leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell">${ArcadeI18n.t('lb.empty')}</td></tr>`;
          return;
        }

        if (leaderboardThead) {
          leaderboardThead.innerHTML = `
            <tr>
              <th class="col-rank">${ArcadeI18n.t('lb.col_rank')}</th>
              <th class="col-user">${ArcadeI18n.t('lb.col_player')}</th>
              <th class="col-score">${ArcadeI18n.t('lb.col_score')}</th>
              <th class="col-lines">${ArcadeI18n.t('lb.col_lines')}</th>
              <th class="col-level">${ArcadeI18n.t('lb.col_level')}</th>
              <th class="col-status">${ArcadeI18n.t('lb.col_status')}</th>
              <th class="col-time">${ArcadeI18n.t('lb.col_time')}</th>
            </tr>
          `;
        }

        leaderboardTbody.innerHTML = data.history.map((item, idx) => `
          <tr>
            <td class="col-rank">#${idx + 1}</td>
            <td class="col-user">${item.mode === 'solo' ? `🚀 ${ArcadeI18n.t('tetris.mode_solo')}` : `⚔️ ${ArcadeI18n.t('tetris.mode_vs')}`}</td>
            <td class="col-score">${item.score.toLocaleString()}</td>
            <td class="col-lines">${item.lines}</td>
            <td class="col-level">Lv.${item.level}</td>
            <td class="col-status">${item.is_cleared ? `<span class="clear-badge">${ArcadeI18n.t('lb.cleared')}</span>` : ArcadeI18n.t('common.status')}</td>
            <td class="col-time">${item.played_at ? item.played_at.replace('T', ' ').substring(0, 16) : '-'}</td>
          </tr>
        `).join('');
      } catch (err) {
        leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell" style="color:var(--color-danger)">${err.message}</td></tr>`;
      }
      return;
    }

    try {
      const data = await API.getTop50(tab);
      if (leaderboardThead) {
        leaderboardThead.innerHTML = `
          <tr>
            <th class="col-rank">${ArcadeI18n.t('lb.col_rank')}</th>
            <th class="col-user">${ArcadeI18n.t('lb.col_player')}</th>
            <th class="col-score">${ArcadeI18n.t('lb.col_score')}</th>
            <th class="col-lines">${ArcadeI18n.t('lb.col_lines')}</th>
            <th class="col-level">${ArcadeI18n.t('lb.col_level')}</th>
            <th class="col-status">${ArcadeI18n.t('lb.col_status')}</th>
            <th class="col-time">${ArcadeI18n.t('lb.col_time')}</th>
          </tr>
        `;
      }

      if (!data || !data.scores || data.scores.length === 0) {
        leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell">${ArcadeI18n.t('lb.empty')}</td></tr>`;
        return;
      }

      leaderboardTbody.innerHTML = data.scores.map((item, idx) => {
        let rankBadge = `${idx + 1}`;
        if (idx === 0) rankBadge = '🥇 1';
        else if (idx === 1) rankBadge = '🥈 2';
        else if (idx === 2) rankBadge = '🥉 3';

        const statusBadge = item.is_cleared ? `<span class="clear-badge">${ArcadeI18n.t('lb.cleared')}</span>` : `<span style="color:var(--text-dim)">${ArcadeI18n.t('lb.active')}</span>`;

        return `
          <tr>
            <td class="col-rank"><strong style="color:var(--color-primary);">${rankBadge}</strong></td>
            <td class="col-user"><strong>${item.username}</strong></td>
            <td class="col-score"><span style="color:var(--color-warning);font-weight:bold;">${item.score.toLocaleString()}</span></td>
            <td class="col-lines">${item.lines}</td>
            <td class="col-level">Lv.${item.level}</td>
            <td class="col-status">${statusBadge}</td>
            <td class="col-time">${item.played_at ? item.played_at.replace('T', ' ').substring(0, 16) : '-'}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      leaderboardTbody.innerHTML = `<tr><td colspan="7" class="loading-cell" style="color:var(--color-danger)">${err.message}</td></tr>`;
    }
  }

  // --- Keyboard Control Binding ---
  function handleKeyDown(e) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    sound.init();

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (!playerGame.isPlaying || playerGame.isGameOver) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'KeyR' || e.code === 'Space') {
        e.preventDefault();
        startGame();
        return;
      }
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      pauseGame();
      return;
    }

    if (!playerGame.isPlaying || playerGame.isPaused || playerGame.isGameOver) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        if (playerGame.moveLeft()) sound.playMove();
        break;
      case 'ArrowRight':
      case 'KeyD':
        if (playerGame.moveRight()) sound.playMove();
        break;
      case 'ArrowDown':
      case 'KeyS':
        if (playerGame.softDrop()) sound.playSoftDrop();
        break;
      case 'ArrowUp':
      case 'KeyX':
      case 'KeyW':
        if (playerGame.rotate(1)) sound.playRotate();
        break;
      case 'KeyZ':
        if (playerGame.rotate(-1)) sound.playRotate();
        break;
      case 'Space':
        sound.playHardDrop();
        const cleared = playerGame.hardDrop();
        handlePlayerAfterLock(cleared);
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        if (playerGame.hold()) sound.playHold();
        break;
    }
  }

  // --- Touch Controls Binding ---
  function setupTouchControls() {
    const touchLeft = document.getElementById('btn-touch-left');
    const touchRight = document.getElementById('btn-touch-right');
    const touchDown = document.getElementById('btn-touch-down');
    const touchRotateCW = document.getElementById('btn-touch-rot-cw');
    const touchRotateCCW = document.getElementById('btn-touch-rot-ccw');
    const touchHardDrop = document.getElementById('btn-touch-harddrop');
    const touchHold = document.getElementById('btn-touch-hold');
    const touchPause = document.getElementById('btn-touch-pause');
    const headerPause = document.getElementById('btn-mobile-pause');

    if (touchPause) touchPause.addEventListener('click', pauseGame);
    if (headerPause) headerPause.addEventListener('click', pauseGame);

    const bindTouchAction = (el, action) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sound.init();
        if (playerGame.isPlaying && !playerGame.isPaused && !playerGame.isGameOver) {
          action();
        }
      }, { passive: false });
    };

    bindTouchAction(touchLeft, () => { if (playerGame.moveLeft()) sound.playMove(); });
    bindTouchAction(touchRight, () => { if (playerGame.moveRight()) sound.playMove(); });
    bindTouchAction(touchDown, () => { if (playerGame.softDrop()) sound.playSoftDrop(); });
    bindTouchAction(touchRotateCW, () => { if (playerGame.rotate(1)) sound.playRotate(); });
    bindTouchAction(touchRotateCCW, () => { if (playerGame.rotate(-1)) sound.playRotate(); });
    bindTouchAction(touchHold, () => { if (playerGame.hold()) sound.playHold(); });
    bindTouchAction(touchHardDrop, () => {
      sound.playHardDrop();
      const cleared = playerGame.hardDrop();
      handlePlayerAfterLock(cleared);
    });
  }

  // --- Initialization ---
  setupEventListeners();
  updateSoundUI();
  await checkAuthStatus();
  setGameMode('solo');
  requestAnimationFrame(gameLoop);
});
