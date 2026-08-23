/**
 * Wildwood Defenders - UI Controller & Application Bridge
 * Handles user interactions, canvas clicks, tower placement, skills, HUD, auth, and leaderboards.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('defense-canvas');
  if (!canvas) return;

  if (window.ArcadeI18n && typeof window.ArcadeI18n.initLanguageUI === 'function') {
    window.ArcadeI18n.initLanguageUI();
  }

  // Initialize Engine
  const engine = new DefenseEngine(canvas, DefenseConfig, DefenseAudio);

  // UI Element References
  const goldDisplay = document.getElementById('val-gold');
  const livesDisplay = document.getElementById('val-lives');
  const scoreDisplay = document.getElementById('val-score');
  const waveDisplay = document.getElementById('val-wave');
  const maxWaveDisplay = document.getElementById('val-max-wave');
  const towersDisplay = document.getElementById('val-towers');
  const maxTowersDisplay = document.getElementById('val-max-towers');

  const btnStartWave = document.getElementById('btn-start-wave');
  const speedButtons = document.querySelectorAll('.btn-speed');
  const btnAutoWave = document.getElementById('btn-auto-wave');
  const btnPause = document.getElementById('btn-pause');
  const btnHeaderPause = document.getElementById('btn-header-pause');
  const btnRestart = document.getElementById('btn-restart');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');

  // Tower Deck Container
  const towerDeckContainer = document.getElementById('tower-deck');

  // Inspector Panel for Selected Tower
  const inspectorPanel = document.getElementById('tower-inspector');
  const inspectorTitle = document.getElementById('inspector-title');
  const inspectorDesc = document.getElementById('inspector-desc');
  const inspectorDmg = document.getElementById('inspector-dmg');
  const inspectorRng = document.getElementById('inspector-rng');
  const inspectorSpd = document.getElementById('inspector-spd');
  const btnUpgrade = document.getElementById('btn-tower-upgrade');
  const btnSell = document.getElementById('btn-tower-sell');
  const upgradeCostSpan = document.getElementById('upgrade-cost-val');
  const sellRefundSpan = document.getElementById('sell-refund-val');

  // Skill Buttons
  const btnCarrotRain = document.getElementById('skill-carrot-rain');
  const btnGoldAirdrop = document.getElementById('skill-gold-airdrop');
  const btnAnimalFrenzy = document.getElementById('skill-animal-frenzy');

  // Game End Modals
  const gameOverModal = document.getElementById('game-over-modal');
  const victoryModal = document.getElementById('victory-modal');
  const finalScoreSpan = document.getElementById('final-score');
  const finalWaveSpan = document.getElementById('final-wave');
  const goWave = document.getElementById('go-wave');
  const goScore = document.getElementById('go-score');
  const vicScore = document.getElementById('vic-score');
  const btnModalRestart = document.getElementById('btn-modal-restart');
  const btnModalVicRestart = document.getElementById('btn-modal-vic-restart');

  // Auth & Leaderboard Elements
  const btnOpenLogin = document.getElementById('btn-open-login');
  const userBadge = document.getElementById('user-badge');
  const userAvatar = document.getElementById('user-avatar');
  const displayUsername = document.getElementById('display-username');
  const btnLogout = document.getElementById('btn-logout');
  const modalAuth = document.getElementById('modal-auth');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  const authTitle = document.getElementById('auth-modal-title');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authForm = document.getElementById('auth-form');
  const authUsername = document.getElementById('auth-username');
  const authPassword = document.getElementById('auth-password');
  const authError = document.getElementById('auth-error-msg');
  const btnAuthSubmit = document.getElementById('btn-auth-submit');

  const btnLeaderboard = document.getElementById('btn-leaderboard');
  const modalLeaderboard = document.getElementById('modal-leaderboard');
  const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
  const btnCloseLeaderboardFooter = document.getElementById('btn-close-leaderboard-footer');
  const btnRefreshLeaderboard = document.getElementById('btn-refresh-leaderboard');
  const leaderboardTbody = document.getElementById('leaderboard-tbody');
  const toast = document.getElementById('toast');

  let currentUser = null;
  let isRegistering = false;

  function showToast(msg, duration = 2000) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  }

  // --- Render Tower Deck ---
  function renderTowerDeck() {
    towerDeckContainer.innerHTML = '';
    const towers = DefenseConfig.TOWERS;

    Object.keys(towers).forEach((key) => {
      const t = towers[key];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `tower-card ${engine.placingTowerType === key ? 'active' : ''}`;
      card.dataset.towerType = key;

      const isLocked = engine.wave < t.unlockWave;
      if (isLocked) {
        card.classList.add('locked');
      }

      const nameStr = DefenseConfig.getLocalizedName(t);
      const traitStr = DefenseConfig.getLocalizedTrait(t);

      card.innerHTML = `
        <div class="card-icon" style="background: ${t.color}22; border-color: ${t.color}">${t.icon}</div>
        <div class="card-info">
          <div class="card-title" data-i18n="${t.nameKey}">${nameStr}</div>
          <div class="card-trait" data-i18n="${t.traitKey}">${traitStr}</div>
          <div class="card-cost">💰 ${t.cost}G</div>
        </div>
        ${isLocked ? `<div class="lock-overlay">🔒 ${window.ArcadeI18n ? (window.ArcadeI18n.t('defense.unlock_wave_prefix') + t.unlockWave + window.ArcadeI18n.t('defense.unlock_wave_suffix')) : ('Wave ' + t.unlockWave)}</div>` : ''}
      `;

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isLocked) return;

        if (engine.towers.length >= engine.maxTowers) {
          engine.createFloatingText(engine.width / 2, engine.height / 2, `MAX TOWERS LIMIT (${engine.maxTowers}) REACHED!`, '#ff0055', 20);
          engine.shake(0.2, 5);
          return;
        }

        if (engine.placingTowerType === key) {
          engine.placingTowerType = null;
        } else {
          engine.placingTowerType = key;
          engine.selectedTower = null;
        }
        updateDeckStates();
        updateInspector();
      });

      towerDeckContainer.appendChild(card);
    });

    updateDeckStates();
  }

  function updateDeckStates() {
    const cards = towerDeckContainer.querySelectorAll('.tower-card');
    cards.forEach((card) => {
      const typeKey = card.dataset.towerType;
      const t = DefenseConfig.TOWERS[typeKey];
      const isLocked = engine.wave < t.unlockWave;

      if (isLocked) {
        card.classList.add('disabled');
        return;
      }

      if (engine.placingTowerType === typeKey) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }

      const isMaxTowers = engine.towers.length >= engine.maxTowers;
      if (engine.gold < t.cost || isMaxTowers) {
        card.classList.add('disabled');
      } else {
        card.classList.remove('disabled');
      }
    });
  }

  // --- HUD Updates ---
  function updateHUD(state) {
    if (!state) return;
    if (goldDisplay) goldDisplay.textContent = state.gold;
    if (livesDisplay) livesDisplay.textContent = state.lives;
    if (scoreDisplay) scoreDisplay.textContent = state.score;
    if (waveDisplay) waveDisplay.textContent = state.wave;
    if (maxWaveDisplay) maxWaveDisplay.textContent = state.maxWave || state.maxWaves || 30;
    
    const towerCount = (state.towers && state.towers.length !== undefined) ? state.towers.length : (state.towerCount || 0);
    const maxTowers = state.maxTowers || 8;
    if (towersDisplay) {
      towersDisplay.textContent = towerCount;
      const statTowersContainer = towersDisplay.closest('.stat-towers');
      if (statTowersContainer) {
        if (towerCount >= maxTowers) {
          statTowersContainer.classList.add('limit-reached');
        } else {
          statTowersContainer.classList.remove('limit-reached');
        }
      }
    }
    if (maxTowersDisplay) maxTowersDisplay.textContent = maxTowers;

    if (btnStartWave) {
      btnStartWave.disabled = !!(state.waveActive || state.isGameOver || state.isVictory);
    }

    if (btnAutoWave) {
      if (state.autoWave) {
        btnAutoWave.classList.add('active');
      } else {
        btnAutoWave.classList.remove('active');
      }
    }

    if (btnPause) {
      const pauseLabel = state.isPaused ? (window.ArcadeI18n ? window.ArcadeI18n.t('defense.resume') : 'Resume') : (window.ArcadeI18n ? window.ArcadeI18n.t('defense.pause') : 'Pause');
      btnPause.innerHTML = `${state.isPaused ? '▶️' : '⏸️'} <span data-i18n="${state.isPaused ? 'defense.resume' : 'defense.pause'}">${pauseLabel}</span>`;
    }

    if (btnHeaderPause) {
      const pauseLabel = state.isPaused ? (window.ArcadeI18n ? window.ArcadeI18n.t('defense.resume') : 'Resume') : (window.ArcadeI18n ? window.ArcadeI18n.t('defense.pause') : 'Pause');
      btnHeaderPause.textContent = state.isPaused ? '▶' : '⏸';
      btnHeaderPause.setAttribute('title', pauseLabel);
    }

    // Update Skill Cooldowns
    if (btnCarrotRain) {
      const cd = state.skillCooldowns.carrot_rain;
      btnCarrotRain.disabled = cd > 0;
      const cdSpan = btnCarrotRain.querySelector('.skill-cd');
      if (cdSpan) cdSpan.textContent = cd > 0 ? `${Math.ceil(cd)}s` : '';
    }
    if (btnGoldAirdrop) {
      const cd = state.skillCooldowns.gold_airdrop;
      btnGoldAirdrop.disabled = cd > 0;
      const cdSpan = btnGoldAirdrop.querySelector('.skill-cd');
      if (cdSpan) cdSpan.textContent = cd > 0 ? `${Math.ceil(cd)}s` : '';
    }
    if (btnAnimalFrenzy) {
      const cd = state.skillCooldowns.animal_frenzy;
      btnAnimalFrenzy.disabled = cd > 0;
      const cdSpan = btnAnimalFrenzy.querySelector('.skill-cd');
      if (cdSpan) cdSpan.textContent = cd > 0 ? `${Math.ceil(cd)}s` : '';
    }

    updateDeckStates();
    updateInspector();
  }

  function updateInspector() {
    const t = engine.selectedTower;
    if (!t) {
      if (inspectorPanel) inspectorPanel.style.display = 'none';
      return;
    }

    if (inspectorPanel) inspectorPanel.style.display = 'flex';
    const nameStr = DefenseConfig.getLocalizedName(t);
    const traitStr = DefenseConfig.getLocalizedTrait(t);

    let badgeText = `v${t.level}`;
    if (t.level === 2) badgeText = window.ArcadeI18n ? window.ArcadeI18n.t('defense.lvl_2') : 'v2 Advanced';
    if (t.level === 3) badgeText = window.ArcadeI18n ? window.ArcadeI18n.t('defense.lvl_3') : 'v3 Master';
    if (t.level === 4) badgeText = window.ArcadeI18n ? window.ArcadeI18n.t('defense.lvl_4') : 'v4 Ultimate (MAX)';

    if (inspectorTitle) inspectorTitle.innerHTML = `${t.icon} ${nameStr} <span class="badge-lvl lvl-${t.level}">${badgeText}</span>`;
    if (inspectorDesc) inspectorDesc.textContent = traitStr;
    if (inspectorDmg) inspectorDmg.textContent = t.damage;
    if (inspectorRng) inspectorRng.textContent = t.range >= 9000 ? (window.ArcadeI18n ? window.ArcadeI18n.t('defense.global_range') : 'Global') : t.range;
    if (inspectorSpd) inspectorSpd.textContent = `${(1 / t.cooldown).toFixed(1)}/s`;

    if (btnUpgrade) {
      if (t.level >= 4) {
        btnUpgrade.disabled = true;
        if (upgradeCostSpan) upgradeCostSpan.textContent = window.ArcadeI18n ? window.ArcadeI18n.t('defense.max_level') : 'MAX';
      } else {
        btnUpgrade.disabled = engine.gold < t.upgradeCost;
        if (upgradeCostSpan) {
          const nextLvlLabel = t.level === 3 
            ? (window.ArcadeI18n ? window.ArcadeI18n.t('defense.upgrade_to_max') : 'Upgrade to v4 (MAX)')
            : (window.ArcadeI18n ? `${window.ArcadeI18n.t('defense.upgrade_to')}${t.level + 1}` : `Upgrade to v${t.level + 1}`);
          upgradeCostSpan.textContent = `${nextLvlLabel} (${t.upgradeCost}G)`;
        }
      }
    }

    if (sellRefundSpan) {
      const refund = Math.round(t.totalInvested * 0.7);
      sellRefundSpan.textContent = `${refund}G`;
    }
  }

  // --- Canvas Interaction (Placement & Selection) ---
  function getCanvasTileCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const col = Math.floor(x / engine.tileSize);
    const row = Math.floor(y / engine.tileSize);
    return { col, row, x, y };
  }

  canvas.addEventListener('mousemove', (e) => {
    const { col, row } = getCanvasTileCoords(e);
    if (col >= 0 && col < engine.cols && row >= 0 && row < engine.rows) {
      engine.hoverTile = { col, row };
    } else {
      engine.hoverTile = null;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    engine.hoverTile = null;
  });

  function handlePlacementClick(col, row, isShift = false) {
    if (col < 0 || col >= engine.cols || row < 0 || row >= engine.rows) return;

    if (engine.placingTowerType) {
      const success = engine.buildTower(engine.placingTowerType, col, row);
      if (success) {
        if (!isShift) {
          engine.placingTowerType = null;
        }
      }
    } else {
      const cell = engine.grid[row][col];
      engine.selectedTower = cell.tower || null;
    }

    updateDeckStates();
    updateInspector();
  }

  canvas.addEventListener('click', (e) => {
    const { col, row } = getCanvasTileCoords(e);
    handlePlacementClick(col, row, e.shiftKey);
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const { col, row } = getCanvasTileCoords(e);
      handlePlacementClick(col, row, false);
      e.preventDefault();
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const { col, row } = getCanvasTileCoords(e);
      if (col >= 0 && col < engine.cols && row >= 0 && row < engine.rows) {
        engine.hoverTile = { col, row };
      }
      e.preventDefault();
    }
  }, { passive: false });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    engine.placingTowerType = null;
    updateDeckStates();
  });

  // --- Controls Button Listeners ---
  if (btnStartWave) {
    btnStartWave.addEventListener('click', () => {
      engine.startNextWave();
    });
  }

  speedButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      speedButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const spd = parseInt(btn.dataset.speed, 10) || 1;
      engine.setSpeed(spd);
    });
  });

  if (btnAutoWave) {
    btnAutoWave.addEventListener('click', () => {
      engine.toggleAutoWave();
      updateHUD(engine);
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      engine.togglePause();
      updateHUD(engine);
    });
  }

  if (btnHeaderPause) {
    btnHeaderPause.addEventListener('click', () => {
      engine.togglePause();
      updateHUD(engine);
    });
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      if (confirm(window.ArcadeI18n ? window.ArcadeI18n.t('defense.confirm_restart') : 'Reset defense?')) {
        engine.resetGame();
        renderTowerDeck();
        engine.start();
      }
    });
  }

  if (btnAudioToggle) {
    btnAudioToggle.addEventListener('click', () => {
      const isMuted = engine.audio.toggleMute();
      const soundLabel = isMuted ? (window.ArcadeI18n ? window.ArcadeI18n.t('defense.mute') : 'Mute') : (window.ArcadeI18n ? window.ArcadeI18n.t('defense.audio') : 'Sound');
      btnAudioToggle.textContent = isMuted ? '🔇' : '🔊';
      btnAudioToggle.setAttribute('title', soundLabel);
    });
  }

  if (btnUpgrade) {
    btnUpgrade.addEventListener('click', () => {
      if (engine.selectedTower) {
        engine.upgradeTower(engine.selectedTower);
      }
    });
  }

  if (btnSell) {
    btnSell.addEventListener('click', () => {
      if (engine.selectedTower) {
        engine.sellTower(engine.selectedTower);
      }
    });
  }

  // --- Commander Skills ---
  if (btnCarrotRain) {
    btnCarrotRain.addEventListener('click', () => engine.triggerSkill('carrot_rain'));
  }
  if (btnGoldAirdrop) {
    btnGoldAirdrop.addEventListener('click', () => engine.triggerSkill('gold_airdrop'));
  }
  if (btnAnimalFrenzy) {
    btnAnimalFrenzy.addEventListener('click', () => engine.triggerSkill('animal_frenzy'));
  }


  function updateMapSelectOptions() {
    const mapSelectDropdown = document.getElementById('map-select-dropdown');
    if (!mapSelectDropdown) return;
    const currentVal = mapSelectDropdown.value || '0';
    mapSelectDropdown.innerHTML = `
      <option value="0">${ArcadeI18n.t('defense.map_meadow')}</option>
      <option value="1">${ArcadeI18n.t('defense.map_woods')}</option>
      <option value="2">${ArcadeI18n.t('defense.map_canyon')}</option>
    `;
    mapSelectDropdown.value = currentVal;
  }

  // --- Map Selector ---
  const mapSelectDropdown = document.getElementById('map-select-dropdown');
  if (mapSelectDropdown) {
    mapSelectDropdown.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      engine.setMap(idx);
      renderTowerDeck();
      engine.start();
    });
  }

  // --- Auth Handlers ---
  function updateUserAuthUI() {
    if (currentUser) {
      if (displayUsername) displayUsername.textContent = currentUser.username;
      if (userAvatar) userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
      if (btnOpenLogin) {
        btnOpenLogin.classList.add('hidden');
        btnOpenLogin.style.display = 'none';
      }
      if (userBadge) {
        userBadge.classList.remove('hidden');
        userBadge.style.display = 'inline-flex';
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

  async function checkAuthStatus() {
    currentUser = DefenseAPI.getCachedUser();
    if (currentUser) {
      updateUserAuthUI();
    }
    try {
      const user = await DefenseAPI.getCurrentUser();
      if (user) {
        currentUser = user;
        if (user.language && user.language !== ArcadeI18n.getLanguage()) {
          ArcadeI18n.setLanguage(user.language, false);
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

  function setupAuthListeners() {
    if (btnOpenLogin) {
      btnOpenLogin.addEventListener('click', () => openAuthModal(false));
    }
    if (btnCloseAuth) {
      btnCloseAuth.addEventListener('click', () => {
        if (modalAuth) modalAuth.style.display = 'none';
      });
    }
    if (tabLogin) {
      tabLogin.addEventListener('click', () => openAuthModal(false));
    }
    if (tabRegister) {
      tabRegister.addEventListener('click', () => openAuthModal(true));
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm(ArcadeI18n.t('auth.confirm_logout'))) {
          DefenseAPI.clearToken();
          currentUser = null;
          checkAuthStatus();
          showToast('👋 Logged out successfully');
        }
      });
    }
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.style.display = 'none';
        const uname = authUsername.value.trim();
        const pwd = authPassword.value;

        btnAuthSubmit.disabled = true;
        try {
          if (isRegistering) {
            await DefenseAPI.register(uname, pwd);
            showToast(`🎉 Welcome ${uname}!`);
          } else {
            await DefenseAPI.login(uname, pwd);
            showToast(`👋 Welcome back, ${uname}!`);
          }
          await checkAuthStatus();
          if (modalAuth) modalAuth.style.display = 'none';
        } catch (err) {
          authError.textContent = err.message;
          authError.style.display = 'block';
        } finally {
          btnAuthSubmit.disabled = false;
        }
      });
    }
  }

  function openAuthModal(registerMode) {
    isRegistering = registerMode;
    if (authError) authError.style.display = 'none';
    if (authUsername) authUsername.value = '';
    if (authPassword) authPassword.value = '';

    if (registerMode) {
      if (authTitle) authTitle.textContent = ArcadeI18n.t('auth.reg_title');
      if (tabRegister) tabRegister.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (btnAuthSubmit) btnAuthSubmit.textContent = ArcadeI18n.t('auth.btn_reg');
    } else {
      if (authTitle) authTitle.textContent = ArcadeI18n.t('auth.login_title');
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (btnAuthSubmit) btnAuthSubmit.textContent = ArcadeI18n.t('auth.btn_login');
    }
    if (modalAuth) modalAuth.style.display = 'flex';
  }

  // --- Leaderboard Modal ---
  function setupLeaderboardListeners() {
    if (btnLeaderboard) {
      btnLeaderboard.addEventListener('click', () => {
        if (modalLeaderboard) modalLeaderboard.style.display = 'flex';
        loadLeaderboardData();
      });
    }
    if (btnCloseLeaderboard) {
      btnCloseLeaderboard.addEventListener('click', () => {
        if (modalLeaderboard) modalLeaderboard.style.display = 'none';
      });
    }
    if (btnCloseLeaderboardFooter) {
      btnCloseLeaderboardFooter.addEventListener('click', () => {
        if (modalLeaderboard) modalLeaderboard.style.display = 'none';
      });
    }
    if (btnRefreshLeaderboard) {
      btnRefreshLeaderboard.addEventListener('click', loadLeaderboardData);
    }
  }

  async function loadLeaderboardData() {
    if (!leaderboardTbody) return;
    leaderboardTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;">${ArcadeI18n.t('lb.loading')}</td></tr>`;

    try {
      const data = await DefenseAPI.getTop50();
      const scores = data.scores || [];

      if (scores.length === 0) {
        leaderboardTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#81c784;">${ArcadeI18n.t('lb.empty')}</td></tr>`;
        return;
      }

      leaderboardTbody.innerHTML = scores
        .map((item, idx) => {
          let rankBadge = `${idx + 1}`;
          if (idx === 0) rankBadge = '🥇 1';
          else if (idx === 1) rankBadge = '🥈 2';
          else if (idx === 2) rankBadge = '🥉 3';

          const timeFormatted = item.played_at ? item.played_at.replace('T', ' ').substring(0, 16) : '-';

          return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
              <td style="padding: 8px 10px;"><strong style="color:var(--accent-green);font-family:monospace;">${rankBadge}</strong></td>
              <td style="padding: 8px 10px;"><strong>${item.username}</strong></td>
              <td style="padding: 8px 10px;"><span style="color:var(--accent-gold);font-weight:bold;font-family:monospace;">${item.score.toLocaleString()}</span></td>
              <td style="padding: 8px 10px;">Wave ${item.level}</td>
              <td style="padding: 8px 10px;color:#81c784;font-size:12px;">${timeFormatted}</td>
            </tr>
          `;
        })
        .join('');
    } catch (e) {
      leaderboardTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;color:#ff0055;">Failed to load leaderboard data.</td></tr>`;
    }
  }

  // --- Engine Callbacks ---
  engine.onStateChange = (state) => {
    updateHUD(state);
  };

  engine.onWaveComplete = (wave) => {
    renderTowerDeck();
  };

  engine.onGameOver = (res) => {
    if (goScore) goScore.textContent = res.score;
    if (goWave) goWave.textContent = res.wave;
    if (gameOverModal) gameOverModal.style.display = 'flex';
    DefenseAPI.submitScore(res.score, res.wave, engine.map.id);
  };

  engine.onVictory = (res) => {
    if (vicScore) vicScore.textContent = res.score;
    if (victoryModal) victoryModal.style.display = 'flex';
    DefenseAPI.submitScore(res.score, res.wave, engine.map.id);
  };

  if (btnModalRestart) {
    btnModalRestart.addEventListener('click', () => {
      if (gameOverModal) gameOverModal.style.display = 'none';
      engine.resetGame();
      renderTowerDeck();
      engine.start();
    });
  }

  if (btnModalVicRestart) {
    btnModalVicRestart.addEventListener('click', () => {
      if (victoryModal) victoryModal.style.display = 'none';
      engine.resetGame();
      renderTowerDeck();
      engine.start();
    });
  }

  // Listen to Language Changes
  window.addEventListener('arcadeLanguageChanged', () => {
    updateMapSelectOptions();
    renderTowerDeck();
    updateHUD(engine);
    updateUserAuthUI();
  });

  // Setup Auth & Leaderboards
  setupAuthListeners();
  setupLeaderboardListeners();
  checkAuthStatus();

  // Start initial game loop
  updateMapSelectOptions();
  renderTowerDeck();
  engine.start();
});
