/**
 * Wildwood Defenders - UI Controller & Application Bridge
 * Handles user interactions, canvas clicks, tower placement, skills, and HUD.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('defense-canvas');
  if (!canvas) return;

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
  const btnSpeed1x = document.getElementById('btn-speed-1x');
  const btnSpeed2x = document.getElementById('btn-speed-2x');
  const btnSpeed4x = document.getElementById('btn-speed-4x');
  const btnAutoWave = document.getElementById('btn-auto-wave');
  const btnPause = document.getElementById('btn-pause');
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

  // Modals
  const gameOverModal = document.getElementById('game-over-modal');
  const victoryModal = document.getElementById('victory-modal');
  const finalScoreSpan = document.getElementById('final-score-val');
  const finalWaveSpan = document.getElementById('final-wave-val');
  const victoryScoreSpan = document.getElementById('victory-score-val');
  const btnRetry = document.getElementById('btn-retry-game');
  const btnVictoryRestart = document.getElementById('btn-victory-restart');

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

      const nameStr = (window.ArcadeI18n && window.ArcadeI18n.t(t.nameKey)) || t.nameKey;
      const traitStr = (window.ArcadeI18n && window.ArcadeI18n.t(t.traitKey)) || t.traitKey;

      const isLocked = (t.unlockWave && t.unlockWave > 0) ? engine.wave < t.unlockWave : false;

      card.innerHTML = `
        <div class="card-icon" style="background: ${t.color}22; border-color: ${t.color};">${t.icon}</div>
        <div class="card-info">
          <div class="card-title">${nameStr}</div>
          <div class="card-trait">${isLocked ? `🔒 第 ${t.unlockWave} 波解锁` : traitStr}</div>
          <div class="card-cost">${isLocked ? `W${t.unlockWave}` : `💰 ${t.cost}G`}</div>
        </div>
        ${isLocked ? `<div class="lock-overlay">🔒 W${t.unlockWave}</div>` : ''}
      `;

      card.addEventListener('click', () => {
        if ((t.unlockWave && t.unlockWave > 0) && engine.wave < t.unlockWave) {
          engine.createFloatingText(engine.width / 2, engine.height / 2, `第 ${t.unlockWave} 波后解锁该神兽！`, '#ffd700', 20);
          return;
        }

        if (engine.placingTowerType === key) {
          engine.placingTowerType = null; // Cancel
        } else {
          engine.placingTowerType = key;
          engine.selectedTower = null; // Deselect inspector
        }
        updateDeckStates();
        updateInspector();
      });

      towerDeckContainer.appendChild(card);
    });
  }

  function updateDeckStates() {
    const isMaxed = engine.towers.length >= engine.maxTowers;

    document.querySelectorAll('.tower-card').forEach((card) => {
      const type = card.dataset.towerType;
      const proto = DefenseConfig.TOWERS[type];
      const isLocked = (proto.unlockWave && proto.unlockWave > 0) ? engine.wave < proto.unlockWave : false;

      card.classList.toggle('active', engine.placingTowerType === type);
      card.classList.toggle('disabled', isLocked || engine.gold < proto.cost || isMaxed);
      card.classList.toggle('locked', isLocked);
    });
  }

  // --- Update HUD & Inspector ---
  function updateHUD(state) {
    if (goldDisplay) goldDisplay.textContent = state.gold;
    if (livesDisplay) livesDisplay.textContent = state.lives;
    if (scoreDisplay) scoreDisplay.textContent = state.score;
    if (waveDisplay) waveDisplay.textContent = state.wave;
    if (maxWaveDisplay) maxWaveDisplay.textContent = state.maxWaves;
    if (towersDisplay) towersDisplay.textContent = state.towerCount;
    if (maxTowersDisplay) maxTowersDisplay.textContent = state.maxTowers;

    if (towersDisplay && towersDisplay.parentElement) {
      towersDisplay.parentElement.classList.toggle('limit-reached', state.towerCount >= state.maxTowers);
    }

    if (btnStartWave) {
      btnStartWave.disabled = engine.waveActive || state.isGameOver || state.isVictory;
    }

    if (btnPause) {
      btnPause.textContent = state.isPaused ? '▶️ 继续' : '⏸️ 暂停';
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
    const nameStr = (window.ArcadeI18n && window.ArcadeI18n.t(t.nameKey)) || t.nameKey;
    const traitStr = (window.ArcadeI18n && window.ArcadeI18n.t(t.traitKey)) || t.traitKey;

    let badgeText = `Lv.${t.level}`;
    if (t.level === 2) badgeText = '⭐⭐ 进阶';
    if (t.level === 3) badgeText = '⭐⭐⭐ 大师';
    if (t.level === 4) badgeText = '👑 终极觉醒';

    if (inspectorTitle) inspectorTitle.innerHTML = `${t.icon} ${nameStr} <span class="badge-lvl lvl-${t.level}">${badgeText}</span>`;
    if (inspectorDesc) inspectorDesc.textContent = traitStr;
    if (inspectorDmg) inspectorDmg.textContent = t.damage;
    if (inspectorRng) inspectorRng.textContent = t.range >= 9000 ? '全图' : t.range;
    if (inspectorSpd) inspectorSpd.textContent = `${(1 / t.cooldown).toFixed(1)}/s`;

    if (btnUpgrade) {
      if (t.level >= 4) {
        btnUpgrade.disabled = true;
        if (upgradeCostSpan) upgradeCostSpan.textContent = 'MAX';
      } else {
        btnUpgrade.disabled = engine.gold < t.upgradeCost;
        if (upgradeCostSpan) {
          const nextLvlLabel = t.level === 3 ? '👑 觉醒' : '⭐ 强化';
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

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

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

  canvas.addEventListener('click', (e) => {
    const { col, row } = getCanvasTileCoords(e);
    if (col < 0 || col >= engine.cols || row < 0 || row >= engine.rows) return;

    if (engine.placingTowerType) {
      // Attempt building tower
      const success = engine.buildTower(engine.placingTowerType, col, row);
      if (success) {
        if (!e.shiftKey) {
          engine.placingTowerType = null;
        }
      }
    } else {
      // Select clicked tower if present
      const cell = engine.grid[row][col];
      engine.selectedTower = cell.tower || null;
    }

    updateDeckStates();
    updateInspector();
  });

  // Right-click to cancel placement
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    engine.placingTowerType = null;
    engine.selectedTower = null;
    updateDeckStates();
    updateInspector();
  });

  // --- Controls & Speed ---
  if (btnStartWave) {
    btnStartWave.addEventListener('click', () => {
      engine.startNextWave();
      renderTowerDeck(); // Refresh unlocks
    });
  }

  function setSpeedUI(speed) {
    engine.setSpeed(speed);
    [btnSpeed1x, btnSpeed2x, btnSpeed4x].forEach((btn) => {
      if (btn) btn.classList.remove('active');
    });
    if (speed === 1 && btnSpeed1x) btnSpeed1x.classList.add('active');
    if (speed === 2 && btnSpeed2x) btnSpeed2x.classList.add('active');
    if (speed === 4 && btnSpeed4x) btnSpeed4x.classList.add('active');
  }

  if (btnSpeed1x) btnSpeed1x.addEventListener('click', () => setSpeedUI(1));
  if (btnSpeed2x) btnSpeed2x.addEventListener('click', () => setSpeedUI(2));
  if (btnSpeed4x) btnSpeed4x.addEventListener('click', () => setSpeedUI(4));

  if (btnAutoWave) {
    btnAutoWave.addEventListener('click', () => {
      const active = engine.toggleAutoWave();
      btnAutoWave.classList.toggle('active', active);
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', () => engine.pause());
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      if (confirm('确定要重新开始当前关卡吗？')) {
        engine.resetGame();
        renderTowerDeck();
        engine.start();
      }
    });
  }

  if (btnAudioToggle) {
    btnAudioToggle.addEventListener('click', () => {
      const muted = DefenseAudio.toggleMute();
      btnAudioToggle.textContent = muted ? '🔇 静音' : '🔊 音效';
    });
  }

  // --- Upgrade & Sell Handlers ---
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

  // --- Engine Callbacks ---
  engine.onStateChange = (state) => {
    updateHUD(state);
  };

  engine.onWaveComplete = (wave) => {
    renderTowerDeck(); // Unlock cats when wave reaches threshold!
  };

  engine.onGameOver = (res) => {
    if (finalScoreSpan) finalScoreSpan.textContent = res.score;
    if (finalWaveSpan) finalWaveSpan.textContent = res.wave;
    if (gameOverModal) gameOverModal.style.display = 'flex';
    DefenseAPI.submitScore(res.score, res.wave, engine.map.id);
  };

  engine.onVictory = (res) => {
    if (victoryScoreSpan) victoryScoreSpan.textContent = res.score;
    if (victoryModal) victoryModal.style.display = 'flex';
    DefenseAPI.submitScore(res.score, res.wave, engine.map.id);
  };

  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      if (gameOverModal) gameOverModal.style.display = 'none';
      engine.resetGame();
      renderTowerDeck();
      engine.start();
    });
  }

  if (btnVictoryRestart) {
    btnVictoryRestart.addEventListener('click', () => {
      if (victoryModal) victoryModal.style.display = 'none';
      engine.resetGame();
      renderTowerDeck();
      engine.start();
    });
  }

  // Listen to Language Changes
  window.addEventListener('arcadeLanguageChanged', () => {
    renderTowerDeck();
    updateHUD(engine);
  });

  // Start initial game loop
  renderTowerDeck();
  engine.start();
});
