/**
 * Universal Internationalization (i18n) Engine for Cyberpunk Arcade Platform.
 * Supports:
 * - English (en - default)
 * - Simplified Chinese (zh / 简体中文)
 * - Traditional Chinese (zh-TW / 繁體中文)
 * - Japanese (ja / 日本語)
 *
 * Automatically inherits language preference from localStorage and syncs with backend database.
 */

const ArcadeI18n = (function () {
  'use strict';

  const STORAGE_KEY = 'arcade_lang';
  const SUPPORTED_LANGS = ['en', 'zh', 'zh-TW', 'ja'];

  function normalizeLang(lang) {
    if (!lang) return 'en';
    const l = String(lang).toLowerCase().replace('_', '-');
    if (l === 'zh-tw' || l === 'zh-hk' || l === 'zh-hant' || l === 'zh-mo') return 'zh-TW';
    if (l === 'zh' || l === 'zh-cn' || l === 'zh-sg' || l === 'zh-hans') return 'zh';
    if (l === 'ja' || l === 'jp') return 'ja';
    return 'en';
  }
  
  // Read existing preference from localStorage, default to 'en'
  let currentLang = 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      currentLang = normalizeLang(saved);
    }
  } catch (e) {}

  // Complete translation dictionary
  const TRANSLATIONS = {
    en: {
      // Platform & Hub
      'hub.title': 'CYBERPUNK ARCADE',
      'hub.hero_tag': '⚡ NEXT-GEN RETRO ARCADE ⚡',
      'hub.hero_title': 'CHOOSE YOUR UNIVERSE',
      'hub.hero_desc': 'Adaptive Web Arcade Platform · Real-time AI Battles · 50-Level High Speed · Global Top 50 Leaderboards',
      'hub.login_btn': 'Login / Register',
      'hub.leaderboard_btn': '🏆 Leaderboard',
      'hub.play_now': '🎮 Play Now',
      'hub.play_snake': '🐍 Play Snake',
      'hub.coming_soon_btn': '⏳ Coming Soon',
      'hub.footer': 'CYBERPUNK ARCADE PLATFORM · Unified Account & Cross-Game Leaderboards · Powered by FastAPI',
      
      // Game Cards
      'tetris.title': 'TETRIS PRO',
      'tetris.tagline': '7-Bag SRS Competitive Engine · 50-Level Campaign · Real-time AI Duel',
      'tetris.engine_sub': 'COMPETITIVE SRS ENGINE',
      'tetris.badge': '🔥 POPULAR',
      'tetris.feat1': 'SRS Wall Kicks',
      'tetris.feat2': 'Dual Battle',
      'tetris.feat3': '50-Level Gravity',
      
      'snake.title': 'NEON SNAKE',
      'snake.tagline': 'Dynamic Particle Light Burst · Mutated Energy Food Items · Dual Snake Battle Arena',
      'snake.badge': '✨ NEW GAME',
      'snake.feat1': 'Particle Effects',
      'snake.feat2': 'Energy Items',
      'snake.feat3': 'A* AI Duel',
      
      'more.title': 'MORE GAMES',
      'more.tagline': 'Pacman, Minesweeper, and classic retro arcade games coming soon...',
      'more.badge': '🚀 EXPANDABLE',
      'more.feat1': 'Seamless Mount',
      'more.feat2': 'Unified Profile',

      // Shared Navigation & Auth
      'nav.hub': 'Hub',
      'nav.login': 'Login',
      'nav.logout': 'Logout',
      'nav.profile': 'Player Profile',
      'nav.guest': 'Guest',
      'auth.login_title': 'Player Login',
      'auth.reg_title': 'Register Arcade Account',
      'auth.tab_login': 'Login',
      'auth.tab_register': 'Register',
      'auth.username_label': 'Username',
      'auth.username_ph': '3-20 characters (letters/numbers)',
      'auth.pwd_label': 'Password',
      'auth.pwd_ph': 'At least 6 characters',
      'auth.pwd_confirm_label': 'Confirm Password',
      'auth.pwd_confirm_ph': 'Re-enter your password',
      'auth.btn_login': 'Login Now',
      'auth.btn_reg': 'Register Now',
      'auth.confirm_logout': 'Are you sure you want to log out?',
      'auth.welcome_new': '🎉 Welcome new player {user}!',
      'auth.welcome_back': '👋 Welcome back, {user}!',
      'auth.logged_out': '👋 Logged out successfully.',
      'auth.pwd_mismatch': 'Passwords do not match!',
      'auth.fill_fields': 'Please fill in username and password.',

      // Leaderboard
      'lb.title': '🏆 Global Top 50 Leaderboard',
      'lb.tab_tetris': '🕹️ Tetris Pro',
      'lb.tab_snake': '🐍 Neon Snake',
      'lb.tab_my': '📜 My Records',
      'lb.col_rank': 'Rank',
      'lb.col_player': 'Player',
      'lb.col_score': 'Score',
      'lb.col_lines': 'Lines',
      'lb.col_length': 'Length',
      'lb.col_extra': 'Lines / Length',
      'lb.col_level': 'Level',
      'lb.col_status': 'Status',
      'lb.col_time': 'Time',
      'lb.refresh': '🔄 Refresh',
      'lb.close': 'Close',
      'lb.cleared': '🏆 Cleared',
      'lb.active': 'In Progress',
      'lb.empty': 'No records found yet. Be the first to set a high score!',
      'lb.loading': 'Loading leaderboard data...',
      'lb.login_required': 'Please login to view personal records.',

      // Common Terms
      'common.score': 'Score',
      'common.lines': 'Lines',
      'common.length': 'Length',
      'common.level': 'Level',
      'common.time': 'Time',
      'common.rank': 'Rank',
      'common.status': 'Status',
      'common.target': 'Target',
      'common.speed': 'Speed',
      'common.gravity': 'Gravity',
      'common.sec': 's',
      'common.ms': 'ms',
      'common.pts': 'pts',
      'common.nodes': 'nodes',
      'common.sound_on': '🔊 Sound Enabled',
      'common.sound_off': '🔇 Sound Muted',
      'common.top50': 'Top 50',
      'common.recorded': 'Recorded',
      'common.guest': 'Guest',

      // Tetris Sub-Game Specific
      'tetris.mode_solo': '50-Level Campaign',
      'tetris.mode_vs': 'VS AI Battle',
      'tetris.hold': 'HOLD',
      'tetris.next': 'NEXT',
      'tetris.keys_title': '💻 Keyboard Guide',
      'tetris.touch_title': '📱 Touch Controls',
      'tetris.touch_desc': 'Use on-screen glowing virtual buttons to move, rotate, soft drop, and hold.',
      'tetris.realtime_title': '📊 Realtime Stats',
      'tetris.action_move': 'Move',
      'tetris.action_rotate': 'Rotate',
      'tetris.action_rotate_cw': 'Rotate CW',
      'tetris.action_rotate_ccw': 'Rotate CCW',
      'tetris.action_soft_drop': 'Soft Drop',
      'tetris.action_hard_drop': 'Hard Drop',
      'tetris.action_hold': 'Hold',
      'tetris.action_pause': 'Pause',
      'tetris.action_restart': 'Restart',
      'tetris.action_pause_restart': 'Pause / Reset',
      'tetris.stat_score': 'SCORE',
      'tetris.stat_lines': 'LINES',
      'tetris.stat_level': 'LEVEL',
      'tetris.stat_time': 'TIME',
      'tetris.start_title': 'TETRIS PRO',
      'tetris.select_level': 'Starting Level:',
      'tetris.select_ai_diff': 'AI Difficulty:',
      'tetris.diff_easy': 'Beginner',
      'tetris.diff_med': 'Standard',
      'tetris.diff_hard': 'Advanced',
      'tetris.diff_master': 'Master',
      'tetris.seq_title': '🎲 Piece Sequence Mode:',
      'tetris.seq_sync': 'Synchronized Fair (Recommended)',
      'tetris.seq_sync_sub': 'Same piece queue for both · Fair duel',
      'tetris.seq_rand': 'Independent 7-Bag',
      'tetris.seq_rand_sub': 'Independent shuffle per player',
      'tetris.garbage_title': '💥 Garbage Hole Alignment:',
      'tetris.garbage_std': 'Standard Competitive (Recommended)',
      'tetris.garbage_std_sub': 'Same burst aligned · Shift on new attack',
      'tetris.garbage_cheesy': 'Cheesy Chaos',
      'tetris.garbage_cheesy_sub': 'Independent random hole per row',
      'tetris.garbage_classic': 'Classic Fixed',
      'tetris.garbage_classic_sub': 'Fixed hole · Easy downstacking',
      'tetris.btn_start': 'START GAME',
      'tetris.shortcut_hint': 'Press Enter or Space to quickly start',
      'tetris.paused_title': 'GAME PAUSED',
      'tetris.paused_sub': 'Press P or Esc to resume',
      'tetris.btn_resume': 'Resume Game',
      'tetris.go_title': 'GAME OVER',
      'tetris.go_victory': 'VICTORY!',
      'tetris.go_summary': 'Match Summary',
      'tetris.btn_play_again': 'Play Again',
      'tetris.btn_back_hub': 'Back to Arcade Hub',
      'tetris.player_label': 'Player (YOU)',
      'tetris.ai_label': 'AI Rival',
      'tetris.attack_label': 'Attack',
      'tetris.ko_player_win': '💥 Knocked out AI Rival! Victory!',
      'tetris.ko_player_lose': '⚠️ Matrix topped out. Game Over.',
      'tetris.ko_ai_lose': 'AI Matrix topped out!',
      'tetris.all_clear_achieved': '🌟 ALL 50 LEVELS CLEARED!',
      'tetris.login_save_hint': '💡 Login to save your score to the Global Top 50 Leaderboard!',
      'tetris.clear_bonus_label': 'Clear Bonus:',

      // Snake Sub-Game Specific
      'snake.mode_classic': '10-Level Campaign',
      'snake.mode_battle': 'Dual Snake Arena',
      'snake.food_title': '⚡ Energy Items',
      'snake.food_apple': 'Energy Core',
      'snake.food_apple_desc': '+100 pts · Length +1',
      'snake.food_golden': 'Golden Star',
      'snake.food_golden_desc': '+500 pts · Temporary Bonus',
      'snake.food_speed': 'Speed Surge',
      'snake.food_speed_desc': '+250 pts · Fast Charge',
      'snake.food_shrink': 'Phase Shifter',
      'snake.food_shrink_desc': '+300 pts · Shrink Length -1',
      'snake.action_turn': 'Turn Direction',
      'snake.stat_length': 'LENGTH',
      'snake.target_badge': 'Target:',
      'snake.player_label': '🟢 Player (YOU)',
      'snake.battle_label': '🟢 Player vs 🔵 AI Rival',
      'snake.battle_intro': 'Compete for energy items against an A* Pathfinding AI Snake!',
      'snake.touch_desc': 'Swipe on screen or use on-screen glowing virtual D-Pad to turn.',
      'snake.start_title': 'NEON SNAKE',
      'snake.start_sub': 'CYBERPUNK ARENA',
      
      // Snake Death & Elimination Messages
      'snake.death_wall': 'Crashed into outer energy barrier!',
      'snake.death_obstacle': 'Crashed into laser barrier!',
      'snake.death_self': 'Collided with own snake body!',
      'snake.death_ai': 'Head-on collision with AI rival body!',
      'snake.ai_death_wall': 'AI crashed into energy barrier!',
      'snake.ai_death_self': 'AI collided with own body!',
      'snake.ai_death_player': 'AI crashed into player snake!',
      
      // Snake Dynamic Toasts
      'snake.toast_eat_bonus': '✨ Acquired [{name}]: +{score} pts!',
      'snake.toast_levelup': '⚡ Level Up to Lv.{level}! Speed increased!',
      'snake.toast_ai_defeated': '🏆 Defeated AI Rival! +5,000 pts! ({reason})',
      'snake.toast_victory': '🎉 Victory! Cleared all 10 Campaign Levels!',
      'snake.login_hint': '💡 Login to save your score to the Global Top 50 Leaderboard!',
      'snake.all_clear_achieved': '🌟 ALL 10 LEVELS CLEARED!'
    },

    zh: {
      'hub.title': '赛博街机大厅',
      'hub.hero_tag': '⚡ 现代化复古街机宇宙 ⚡',
      'hub.hero_title': '选择你的游戏世界',
      'hub.hero_desc': '全自适应网页街机平台 · 实时人机对决 · 50级极限速度 · 全球 Top 50 积分排行榜',
      'hub.login_btn': '登录 / 注册',
      'hub.leaderboard_btn': '🏆 排行榜',
      'hub.play_now': '🎮 立即游玩',
      'hub.play_snake': '🐍 立即游玩',
      'hub.coming_soon_btn': '⏳ 敬请期待',
      'hub.footer': '赛博街机平台 · 统一账号与跨游戏积分体系 · Powered by FastAPI',
      'tetris.title': '俄罗斯方块 PRO',
      'tetris.tagline': '7-Bag SRS 竞技引擎 · 50级极速冲关 · 实时人机对决',
      'tetris.engine_sub': 'SRS 现代电竞引擎',
      'tetris.badge': '🔥 热门电竞',
      'tetris.feat1': 'SRS 旋转系统',
      'tetris.feat2': '双人实时对决',
      'tetris.feat3': '50级速度曲线',
      'snake.title': '赛博贪吃蛇 NEON',
      'snake.tagline': '霓虹粒子动态光效 · 道具能量变异 · 双蛇领地竞技场',
      'snake.badge': '✨ 全新上线',
      'snake.feat1': '粒子光爆',
      'snake.feat2': '变异能量道具',
      'snake.feat3': 'A* 寻路对决',
      'more.title': '更多经典小游戏',
      'more.tagline': '吃豆人 (Pacman)、经典扫雷 (Minesweeper) 等新游戏正在火热接入中...',
      'more.badge': '🚀 持续扩展',
      'more.feat1': '一键无缝挂载',
      'more.feat2': '统一账号体系',
      'nav.hub': '大厅',
      'nav.login': '登录',
      'nav.logout': '退出登录',
      'nav.profile': '玩家档案',
      'nav.guest': '游客',
      'auth.login_title': '玩家登录',
      'auth.reg_title': '注册街机新账号',
      'auth.tab_login': '登录账号',
      'auth.tab_register': '注册新账号',
      'auth.username_label': '玩家昵称',
      'auth.username_ph': '3-20位中英文、数字',
      'auth.pwd_label': '访问密码',
      'auth.pwd_ph': '至少6位密码',
      'auth.pwd_confirm_label': '确认密码',
      'auth.pwd_confirm_ph': '请再次输入密码',
      'auth.btn_login': '立即登录',
      'auth.btn_reg': '立即注册',
      'auth.confirm_logout': '是否确认退出当前登录？',
      'auth.welcome_new': '🎉 欢迎新玩家 {user}！',
      'auth.welcome_back': '👋 欢迎回来，{user}！',
      'auth.logged_out': '👋 已安全退出登录。',
      'auth.pwd_mismatch': '两次输入的密码不一致！',
      'auth.fill_fields': '请完整填写用户名和密码。',
      'lb.title': '🏆 街机全球 Top 50 排行榜',
      'lb.tab_tetris': '🕹️ 俄罗斯方块',
      'lb.tab_snake': '🐍 赛博贪吃蛇',
      'lb.tab_my': '📜 我的历史战绩',
      'lb.col_rank': '排名',
      'lb.col_player': '玩家',
      'lb.col_score': '得分',
      'lb.col_lines': '行数',
      'lb.col_length': '长度',
      'lb.col_extra': '消除行数 / 长度',
      'lb.col_level': '等级/关卡',
      'lb.col_status': '状态',
      'lb.col_time': '达成时间',
      'lb.refresh': '🔄 刷新数据',
      'lb.close': '关闭',
      'lb.cleared': '🏆 全部通关',
      'lb.active': '进行中',
      'lb.empty': '暂无本模式榜单战绩，快去刷新纪录吧！',
      'lb.loading': '正在拉取全球排行榜数据...',
      'lb.login_required': '请先登录账号以查看个人历史战绩。',
      'common.score': '分数',
      'common.lines': '行数',
      'common.length': '长度',
      'common.level': '关卡',
      'common.time': '用时',
      'common.rank': '排名',
      'common.status': '状态',
      'common.target': '目标',
      'common.speed': '速度',
      'common.gravity': '重力',
      'common.sec': '秒',
      'common.ms': '毫秒',
      'common.pts': '分',
      'common.nodes': '节',
      'common.sound_on': '🔊 音效已开启',
      'common.sound_off': '🔇 音效已静音',
      'common.top50': 'Top 50',
      'common.recorded': '已收录',
      'common.guest': '游客',
      'tetris.mode_solo': '50级冲关',
      'tetris.mode_vs': '人机对战',
      'tetris.hold': '暂存',
      'tetris.next': '下一个',
      'tetris.keys_title': '💻 键盘操作指南',
      'tetris.touch_title': '📱 触控操作提示',
      'tetris.touch_desc': '使用屏幕发光虚拟按键进行平移、旋转、加速软降与暂存。',
      'tetris.realtime_title': '📊 实时数据',
      'tetris.action_move': '平移',
      'tetris.action_rotate': '旋转',
      'tetris.action_rotate_cw': '顺旋',
      'tetris.action_rotate_ccw': '逆旋',
      'tetris.action_soft_drop': '软降',
      'tetris.action_hard_drop': '硬降',
      'tetris.action_hold': '暂存',
      'tetris.action_pause': '暂停',
      'tetris.action_restart': '重开',
      'tetris.action_pause_restart': '暂停 / 重开',
      'tetris.stat_score': '得分',
      'tetris.stat_lines': '消行',
      'tetris.stat_level': '关卡',
      'tetris.stat_time': '用时',
      'tetris.start_title': '俄罗斯方块 PRO',
      'tetris.select_level': '初始关卡：',
      'tetris.select_ai_diff': 'AI 初始难度：',
      'tetris.diff_easy': '萌新',
      'tetris.diff_med': '普通',
      'tetris.diff_hard': '进阶',
      'tetris.diff_master': '宗师',
      'tetris.seq_title': '🎲 双方方块序列模式：',
      'tetris.seq_sync': '电竞镜像同序 (推荐)',
      'tetris.seq_sync_sub': '双方每块完全同序 · 绝对公平',
      'tetris.seq_rand': '独立随机洗牌',
      'tetris.seq_rand_sub': '双方各自独立洗牌 · 随机出块',
      'tetris.garbage_title': '💥 垃圾行缺口对齐模式：',
      'tetris.garbage_std': '标准电竞 (推荐)',
      'tetris.garbage_std_sub': '单次攻击同列 · 再次攻击换列',
      'tetris.garbage_cheesy': '奶酪死斗',
      'tetris.garbage_cheesy_sub': '每行缺口独立随机 · 极难挖掘',
      'tetris.garbage_classic': '经典同列',
      'tetris.garbage_classic_sub': '缺口长久固定 · 利于连续反打',
      'tetris.btn_start': '开始游戏',
      'tetris.shortcut_hint': '按 Enter 或 Space 键快速开始',
      'tetris.paused_title': '游戏已暂停',
      'tetris.paused_sub': '按 P 或 Esc 键继续游戏',
      'tetris.btn_resume': '继续游戏',
      'tetris.go_title': '游戏结束',
      'tetris.go_victory': '获胜通关！',
      'tetris.go_summary': '本局结算',
      'tetris.btn_play_again': '再来一局',
      'tetris.btn_back_hub': '返回游戏大厅',
      'tetris.player_label': '玩家 (YOU)',
      'tetris.ai_label': 'AI 对手',
      'tetris.attack_label': '蓄力',
      'tetris.ko_player_win': '💥 击溃 AI 获得胜利！',
      'tetris.ko_player_lose': '⚠️ 场地已被方块填满，本局结束',
      'tetris.ko_ai_lose': 'AI 场地填满出局！',
      'tetris.all_clear_achieved': '🌟 全部 50 关通关达成！',
      'tetris.login_save_hint': '💡 登录账号即可将本次高分录入全球 Top 50 排行榜！',
      'tetris.clear_bonus_label': '通关奖励：',
      'snake.mode_classic': '10级闯关',
      'snake.mode_battle': '双蛇对决',
      'snake.food_title': '⚡ 能量道具',
      'snake.food_apple': '能量晶核',
      'snake.food_apple_desc': '+100分 · 长度+1',
      'snake.food_golden': '黄金超载星',
      'snake.food_golden_desc': '+500分 · 临时限时',
      'snake.food_speed': '疾风蓝核',
      'snake.food_speed_desc': '+250分 · 极速充能',
      'snake.food_shrink': '相位紫菌',
      'snake.food_shrink_desc': '+300分 · 缩短蛇身-1',
      'snake.action_turn': '转向',
      'snake.stat_length': '长度',
      'snake.target_badge': '目标：',
      'snake.player_label': '🟢 玩家蛇 (YOU)',
      'snake.battle_label': '🟢 玩家 vs 🔵 AI 对手',
      'snake.battle_intro': '与 A* 寻路 AI 蛇在同一竞技场抢夺能量晶核，封堵对手路径！',
      'snake.touch_desc': '在屏幕上滑动或使用虚拟方向键控制蛇头转向。',
      'snake.start_title': '赛博贪吃蛇 NEON',
      'snake.start_sub': '霓虹竞技场',
      'snake.death_wall': '撞击外侧能量护盾！',
      'snake.death_obstacle': '撞击激光路障！',
      'snake.death_self': '追尾撞击自身蛇躯！',
      'snake.death_ai': '正面撞击 AI 对手蛇身！',
      'snake.ai_death_wall': 'AI 撞击护盾阵亡！',
      'snake.ai_death_self': 'AI 自身追尾自爆！',
      'snake.ai_death_player': 'AI 撞击玩家蛇躯阵亡！',
      'snake.toast_eat_bonus': '✨ 获得【{name}】：+{score}分！',
      'snake.toast_levelup': '⚡ 恭喜突破进入 Lv.{level}！障碍已刷新，速度加快！',
      'snake.toast_ai_defeated': '🏆 击败 AI 对手！+5,000分奖励！({reason})',
      'snake.toast_victory': '🎉 恭喜通关 10 级巅峰贪吃蛇挑战！',
      'snake.login_hint': '💡 登录账号即可将本次高分录入全球 Top 50 排行榜！',
      'snake.all_clear_achieved': '🌟 全部 10 关通关达成！',
    },

    'zh-TW': {
      'hub.title': '賽博街機大廳',
      'hub.hero_tag': '⚡ 現代化復古街機宇宙 ⚡',
      'hub.hero_title': '選擇你的遊戲世界',
      'hub.hero_desc': '全自適應網頁街機平台 · 即時人機對決 · 50級極限速度 · 全球 Top 50 積分排行榜',
      'hub.login_btn': '登入 / 註冊',
      'hub.leaderboard_btn': '🏆 排行榜',
      'hub.play_now': '🎮 立即遊玩',
      'hub.play_snake': '🐍 立即遊玩',
      'hub.coming_soon_btn': '⏳ 敬請期待',
      'hub.footer': '賽博街機平台 · 統一帳號與跨遊戲積分體系 · Powered by FastAPI',
      'tetris.title': '俄羅斯方塊 PRO',
      'tetris.tagline': '7-Bag SRS 競技引擎 · 50級極速衝關 · 即時人機對決',
      'tetris.engine_sub': 'SRS 現代電競引擎',
      'tetris.badge': '🔥 熱門電競',
      'tetris.feat1': 'SRS 旋轉系統',
      'tetris.feat2': '雙人即時對決',
      'tetris.feat3': '50級速度曲線',
      'snake.title': '賽博貪吃蛇 NEON',
      'snake.tagline': '霓虹粒子動態光效 · 道具能量變異 · 雙蛇領地競技場',
      'snake.badge': '✨ 全新上線',
      'snake.feat1': '粒子光爆',
      'snake.feat2': '變異能量道具',
      'snake.feat3': 'A* 尋路對決',
      'more.title': '更多經典小遊戲',
      'more.tagline': '小精靈 (Pacman)、經典踩地雷 (Minesweeper) 等新遊戲正在火熱接入中...',
      'more.badge': '🚀 持續擴展',
      'more.feat1': '一鍵無縫掛載',
      'more.feat2': '統一帳號體系',
      'nav.hub': '大廳',
      'nav.login': '登入',
      'nav.logout': '登出',
      'nav.profile': '玩家檔案',
      'nav.guest': '訪客',
      'auth.login_title': '玩家登入',
      'auth.reg_title': '註冊街機新帳號',
      'auth.tab_login': '登入帳號',
      'auth.tab_register': '註冊新帳號',
      'auth.username_label': '玩家暱稱',
      'auth.username_ph': '3-20位中英文、數字',
      'auth.pwd_label': '訪問密碼',
      'auth.pwd_ph': '至少6位密碼',
      'auth.pwd_confirm_label': '確認密碼',
      'auth.pwd_confirm_ph': '請再次輸入密碼',
      'auth.btn_login': '立即登入',
      'auth.btn_reg': '立即註冊',
      'auth.confirm_logout': '是否確認登出當前帳號？',
      'auth.welcome_new': '🎉 歡迎新玩家 {user}！',
      'auth.welcome_back': '👋 歡迎回來，{user}！',
      'auth.logged_out': '👋 已安全登出。',
      'auth.pwd_mismatch': '兩次輸入的密碼不一致！',
      'auth.fill_fields': '請完整填寫使用者名稱與密碼。',
      'lb.title': '🏆 街機全球 Top 50 排行榜',
      'lb.tab_tetris': '🕹️ 俄羅斯方塊',
      'lb.tab_snake': '🐍 賽博貪吃蛇',
      'lb.tab_my': '📜 我的歷史戰績',
      'lb.col_rank': '排名',
      'lb.col_player': '玩家',
      'lb.col_score': '得分',
      'lb.col_lines': '行數',
      'lb.col_length': '長度',
      'lb.col_extra': '消除行數 / 長度',
      'lb.col_level': '等級/關卡',
      'lb.col_status': '狀態',
      'lb.col_time': '達成時間',
      'lb.refresh': '🔄 重新整理',
      'lb.close': '關閉',
      'lb.cleared': '🏆 全部通關',
      'lb.active': '進行中',
      'lb.empty': '暫無本模式榜單戰績，快去刷新紀錄吧！',
      'lb.loading': '正在載入全球排行榜數據...',
      'lb.login_required': '請先登入帳號以查看個人歷史戰績。',
      'common.score': '分數',
      'common.lines': '行数',
      'common.length': '長度',
      'common.level': '關卡',
      'common.time': '用時',
      'common.rank': '排名',
      'common.status': '狀態',
      'common.target': '目標',
      'common.speed': '速度',
      'common.gravity': '重力',
      'common.sec': '秒',
      'common.ms': '毫秒',
      'common.pts': '分',
      'common.nodes': '節',
      'common.sound_on': '🔊 音效已開啟',
      'common.sound_off': '🔇 音效已靜音',
      'common.top50': 'Top 50',
      'common.recorded': '已收錄',
      'common.guest': '訪客',
      'tetris.mode_solo': '50級衝關',
      'tetris.mode_vs': '人機對戰',
      'tetris.hold': '暫存',
      'tetris.next': '下一個',
      'tetris.keys_title': '💻 鍵盤操作指南',
      'tetris.touch_title': '📱 觸控操作提示',
      'tetris.touch_desc': '使用螢幕發光虛擬按鍵進行平移、旋轉、加速軟降與暫存。',
      'tetris.realtime_title': '📊 即時數據',
      'tetris.action_move': '平移',
      'tetris.action_rotate': '旋轉',
      'tetris.action_rotate_cw': '順旋',
      'tetris.action_rotate_ccw': '逆旋',
      'tetris.action_soft_drop': '軟降',
      'tetris.action_hard_drop': '硬降',
      'tetris.action_hold': '暫存',
      'tetris.action_pause': '暫停',
      'tetris.action_restart': '重開',
      'tetris.action_pause_restart': '暫停 / 重開',
      'tetris.stat_score': '得分',
      'tetris.stat_lines': '消行',
      'tetris.stat_level': '關卡',
      'tetris.stat_time': '用時',
      'tetris.start_title': '俄羅斯方塊 PRO',
      'tetris.select_level': '初始關卡：',
      'tetris.select_ai_diff': 'AI 初始難度：',
      'tetris.diff_easy': '萌新',
      'tetris.diff_med': '普通',
      'tetris.diff_hard': '進階',
      'tetris.diff_master': '宗師',
      'tetris.seq_title': '🎲 雙方方塊序列模式：',
      'tetris.seq_sync': '電競鏡像同序 (推薦)',
      'tetris.seq_sync_sub': '雙方每塊完全同序 · 絕對公平',
      'tetris.seq_rand': '獨立隨機洗牌',
      'tetris.seq_rand_sub': '雙方各自獨立洗牌 · 隨機出塊',
      'tetris.garbage_title': '💥 垃圾行缺口對齊模式：',
      'tetris.garbage_std': '標準電競 (推薦)',
      'tetris.garbage_std_sub': '單次攻擊同列 · 再次攻擊換列',
      'tetris.garbage_cheesy': '乳酪死鬥',
      'tetris.garbage_cheesy_sub': '每行缺口獨立隨機 · 極難挖掘',
      'tetris.garbage_classic': '經典同列',
      'tetris.garbage_classic_sub': '缺口長久固定 · 利於連續反打',
      'tetris.btn_start': '開始遊戲',
      'tetris.shortcut_hint': '按 Enter 或 Space 鍵快速開始',
      'tetris.paused_title': '遊戲已暫停',
      'tetris.paused_sub': '按 P 或 Esc 鍵繼續遊戲',
      'tetris.btn_resume': '繼續遊戲',
      'tetris.go_title': '遊戲結束',
      'tetris.go_victory': '獲勝通關！',
      'tetris.go_summary': '本局結算',
      'tetris.btn_play_again': '再來一局',
      'tetris.btn_back_hub': '返回遊戲大廳',
      'tetris.player_label': '玩家 (YOU)',
      'tetris.ai_label': 'AI 對手',
      'tetris.attack_label': '蓄力',
      'tetris.ko_player_win': '💥 擊潰 AI 獲得勝利！',
      'tetris.ko_player_lose': '⚠️ 場地已被方塊填滿，本局結束',
      'tetris.ko_ai_lose': 'AI 場地填滿出局！',
      'tetris.all_clear_achieved': '🌟 全部 50 關通關達成！',
      'tetris.login_save_hint': '💡 登入帳號即可將本次高分錄入全球 Top 50 排行榜！',
      'tetris.clear_bonus_label': '通關獎勵：',
      'snake.mode_classic': '10級闖關',
      'snake.mode_battle': '雙蛇對決',
      'snake.food_title': '⚡ 能量道具',
      'snake.food_apple': '能量晶核',
      'snake.food_apple_desc': '+100分 · 長度+1',
      'snake.food_golden': '黃金超載星',
      'snake.food_golden_desc': '+500分 · 臨時限時',
      'snake.food_speed': '疾風藍核',
      'snake.food_speed_desc': '+250分 · 極速充能',
      'snake.food_shrink': '相位紫菌',
      'snake.food_shrink_desc': '+300分 · 縮短蛇身-1',
      'snake.action_turn': '轉向',
      'snake.stat_length': '長度',
      'snake.target_badge': '目標：',
      'snake.player_label': '🟢 玩家蛇 (YOU)',
      'snake.battle_label': '🟢 玩家 vs 🔵 AI 對手',
      'snake.battle_intro': '與 A* 尋路 AI 蛇在同一競技場搶奪能量晶核，封堵對手路徑！',
      'snake.touch_desc': '在螢幕上滑動或使用虛擬方向鍵控制蛇頭轉向。',
      'snake.start_title': '賽博貪吃蛇 NEON',
      'snake.start_sub': '霓虹競技場',
      'snake.death_wall': '撞擊外側能量護盾！',
      'snake.death_obstacle': '撞擊雷射路障！',
      'snake.death_self': '追尾撞擊自身蛇軀！',
      'snake.death_ai': '正面撞擊 AI 對手蛇身！',
      'snake.ai_death_wall': 'AI 撞擊護盾陣亡！',
      'snake.ai_death_self': 'AI 自身追尾自爆！',
      'snake.ai_death_player': 'AI 撞擊玩家蛇軀陣亡！',
      'snake.toast_eat_bonus': '✨ 獲得【{name}】：+{score}分！',
      'snake.toast_levelup': '⚡ 恭喜突破進入 Lv.{level}！障礙已刷新，速度加快！',
      'snake.toast_ai_defeated': '🏆 擊敗 AI 對手！+5,000分獎勵！({reason})',
      'snake.toast_victory': '🎉 恭喜通關 10 級巔峰貪吃蛇挑戰！',
      'snake.login_hint': '💡 登入帳號即可將本次高分錄入全球 Top 50 排行榜！',
      'snake.all_clear_achieved': '🌟 全部 10 關通關達成！',
    },

    ja: {
      // Platform & Hub
      'hub.title': 'サイバーアーケード',
      'hub.hero_tag': '⚡ 次世代レトロアーケード ⚡',
      'hub.hero_title': 'ゲームの世界を選択',
      'hub.hero_desc': 'マルチ対応ウェブアーケード · リアルタイムAIバトル · 50段階重力スピード · 世界ランキングTop50',
      'hub.login_btn': 'ログイン / 登録',
      'hub.leaderboard_btn': '🏆 ランキング',
      'hub.play_now': '🎮 今すぐプレイ',
      'hub.play_snake': '🐍 今すぐプレイ',
      'hub.coming_soon_btn': '⏳ まもなく公開',
      'hub.footer': 'サイバーアーケード · 統合アカウント＆クロスゲームランキング · Powered by FastAPI',

      // Game Cards
      'tetris.title': 'テトリス PRO',
      'tetris.tagline': '7-Bag SRS公式競技エンジン · 50段階チャレンジ · リアルタイムAI対決',
      'tetris.engine_sub': 'SRS 公式競技エンジン',
      'tetris.badge': '🔥 大人気',
      'tetris.feat1': 'SRS回転キック',
      'tetris.feat2': 'AI対戦バトル',
      'tetris.feat3': '50段階スピード',

      'snake.title': 'ネオンスネーク',
      'snake.tagline': 'ネオンパーティクル光彩 · 変異エナジーアイテム · 二匹のヘビによる領土アリーナ',
      'snake.badge': '✨ 新登場',
      'snake.feat1': '光彩エフェクト',
      'snake.feat2': '変異アイテム',
      'snake.feat3': 'A* AI対戦',

      'more.title': 'その他のレトロゲーム',
      'more.tagline': 'パックマン (Pacman) やマインスイーパなど、続々追加予定...',
      'more.badge': '🚀 拡張中',
      'more.feat1': 'シームレス追加',
      'more.feat2': '共通アカウント',

      // Shared Navigation & Auth
      'nav.hub': 'ロビー',
      'nav.login': 'ログイン',
      'nav.logout': 'ログアウト',
      'nav.profile': 'プレイヤー情報',
      'nav.guest': 'ゲスト',
      'auth.login_title': 'プレイヤーログイン',
      'auth.reg_title': '新規アカウント登録',
      'auth.tab_login': 'ログイン',
      'auth.tab_register': '新規登録',
      'auth.username_label': 'ユーザー名',
      'auth.username_ph': '3〜20文字の英数字',
      'auth.pwd_label': 'パスワード',
      'auth.pwd_ph': '6文字以上',
      'auth.pwd_confirm_label': 'パスワード再確認',
      'auth.pwd_confirm_ph': 'もう一度パスワードを入力',
      'auth.btn_login': 'ログインする',
      'auth.btn_reg': '登録する',
      'auth.confirm_logout': 'ログアウトしますか？',
      'auth.welcome_new': '🎉 ようこそ {user} さん！',
      'auth.welcome_back': '👋 おかえりなさい、{user} さん！',
      'auth.logged_out': '👋 ログアウトしました。',
      'auth.pwd_mismatch': 'パスワードが一致しません！',
      'auth.fill_fields': 'ユーザー名とパスワードを入力してください。',

      // Leaderboard
      'lb.title': '🏆 世界Top 50ランキング',
      'lb.tab_tetris': '🕹️ テトリス',
      'lb.tab_snake': '🐍 スネーク',
      'lb.tab_my': '📜 プレイ履歴',
      'lb.col_rank': '順位',
      'lb.col_player': 'プレイヤー',
      'lb.col_score': 'スコア',
      'lb.col_lines': 'ライン数',
      'lb.col_length': '体長',
      'lb.col_extra': 'ライン数 / 体長',
      'lb.col_level': 'レベル',
      'lb.col_status': '状態',
      'lb.col_time': '日時',
      'lb.refresh': '🔄 更新',
      'lb.close': '閉じる',
      'lb.cleared': '🏆 クリア達成',
      'lb.active': '挑戦中',
      'lb.empty': 'まだランキング記録がありません。ハイスコアを目指しましょう！',
      'lb.loading': 'ランキングを読み込み中...',
      'lb.login_required': '履歴を見るにはログインしてください。',

      // Common Terms
      'common.score': 'スコア',
      'common.lines': 'ライン',
      'common.length': '体長',
      'common.level': 'レベル',
      'common.time': 'タイム',
      'common.rank': '順位',
      'common.status': '状態',
      'common.target': '目標',
      'common.speed': '速度',
      'common.gravity': '重力',
      'common.sec': '秒',
      'common.ms': 'ミリ秒',
      'common.pts': '点',
      'common.nodes': '節',
      'common.sound_on': '🔊 サウンドON',
      'common.sound_off': '🔇 消音モード',
      'common.top50': 'Top 50',
      'common.recorded': '記録済み',
      'common.guest': 'ゲスト',

      // Tetris Sub-Game Specific
      'tetris.mode_solo': '50段階チャレンジ',
      'tetris.mode_vs': 'AI対決バトル',
      'tetris.hold': 'ホールド',
      'tetris.next': 'ネクスト',
      'tetris.keys_title': '💻 キー操作ガイド',
      'tetris.touch_title': '📱 タッチ操作ヒント',
      'tetris.touch_desc': '画面上の仮想ボタンで移動、回転、落下、ホールドを操作します。',
      'tetris.realtime_title': '📊 リアルタイム戦況',
      'tetris.action_move': '移動',
      'tetris.action_rotate': '回転',
      'tetris.action_rotate_cw': '右回転',
      'tetris.action_rotate_ccw': '左回転',
      'tetris.action_soft_drop': 'ソフト',
      'tetris.action_hard_drop': 'ハード',
      'tetris.action_hold': 'ホールド',
      'tetris.action_pause': '停止',
      'tetris.action_restart': '再開',
      'tetris.action_pause_restart': '停止 / 再開',
      'tetris.stat_score': 'スコア',
      'tetris.stat_lines': 'ライン',
      'tetris.stat_level': 'レベル',
      'tetris.stat_time': 'タイム',
      'tetris.start_title': 'テトリス PRO',
      'tetris.select_level': '開始レベル：',
      'tetris.select_ai_diff': 'AI 難易度：',
      'tetris.diff_easy': '初心者',
      'tetris.diff_med': '普通',
      'tetris.diff_hard': '上級',
      'tetris.diff_master': '達人',
      'tetris.seq_title': '🎲 ブロック出現順モード：',
      'tetris.seq_sync': 'ミラー同期 (おすすめ)',
      'tetris.seq_sync_sub': '双方全く同じ出現順 · 公平対決',
      'tetris.seq_rand': '独立 7-Bag ランダム',
      'tetris.seq_rand_sub': '各プレイヤー独立ランダム',
      'tetris.garbage_title': '💥 お邪魔ライン穴の配置：',
      'tetris.garbage_std': '標準競技 (おすすめ)',
      'tetris.garbage_std_sub': '同回攻撃は同列 · 新攻撃で列切替',
      'tetris.garbage_cheesy': 'カオスチーズ',
      'tetris.garbage_cheesy_sub': '各行バラバラの穴 · 掘削困難',
      'tetris.garbage_classic': 'クラシック固定',
      'tetris.garbage_classic_sub': '同じ列に穴固定 · 連続カウンター用',
      'tetris.btn_start': 'ゲーム開始',
      'tetris.shortcut_hint': 'Enter または Space キーでクイックスタート',
      'tetris.paused_title': '一時停止中',
      'tetris.paused_sub': 'P または Esc キーで再開',
      'tetris.btn_resume': '再開する',
      'tetris.go_title': 'ゲームオーバー',
      'tetris.go_victory': '完全勝利！',
      'tetris.go_summary': '試合結果サマリー',
      'tetris.btn_play_again': 'もう一度プレイ',
      'tetris.btn_back_hub': 'ロビーに戻る',
      'tetris.player_label': 'プレイヤー (YOU)',
      'tetris.ai_label': 'AI ライバル',
      'tetris.attack_label': 'チャージ',
      'tetris.ko_player_win': '💥 AIライバルを撃破！勝利！',
      'tetris.ko_player_lose': '⚠️ マトリクスが埋まりました。敗北。',
      'tetris.ko_ai_lose': 'AIのマトリクスが埋まりました！',
      'tetris.all_clear_achieved': '🌟 全50レベル完全クリア達成！',
      'tetris.login_save_hint': '💡 ログインしてスコアを世界Top50ランキングに記録しよう！',
      'tetris.clear_bonus_label': 'クリアボーナス：',

      // Snake Sub-Game Specific
      'snake.mode_classic': '10段階チャレンジ',
      'snake.mode_battle': '二匹のヘビ対決',
      'snake.food_title': '⚡ エナジーアイテム',
      'snake.food_apple': 'エナジーコア',
      'snake.food_apple_desc': '+100点 · 体長+1',
      'snake.food_golden': 'ゴールデンスター',
      'snake.food_golden_desc': '+500点 · 期間限定ボーナス',
      'snake.food_speed': 'スピードサージ',
      'snake.food_speed_desc': '+250点 · 高速チャージ',
      'snake.food_shrink': 'フェーズマッシュ',
      'snake.food_shrink_desc': '+300点 · 体長-1縮小',
      'snake.action_turn': '方向転換',
      'snake.stat_length': '体長',
      'snake.target_badge': '目標：',
      'snake.player_label': '🟢 プレイヤー (YOU)',
      'snake.battle_label': '🟢 プレイヤー vs 🔵 AI',
      'snake.battle_intro': 'A* 探索AIのヘビとエナジーを奪い合い、相手の進路を塞ごう！',
      'snake.touch_desc': '画面をスワイプするか仮想十字キーで方向転換します。',
      'snake.start_title': 'ネオンスネーク',
      'snake.start_sub': 'サイバーアリーナ',

      // Snake Death & Elimination Messages
      'snake.death_wall': '外周のエナジーバリアに衝突！',
      'snake.death_obstacle': 'レーザー障害物に衝突！',
      'snake.death_self': '自身の身体に激突！',
      'snake.death_ai': 'AIライバルの身体に激突！',
      'snake.ai_death_wall': 'AIがバリアに衝突して消滅！',
      'snake.ai_death_self': 'AIが自身の身体に激突して自爆！',
      'snake.ai_death_player': 'AIがプレイヤーに衝突して撃沈！',

      // Snake Dynamic Toasts
      'snake.toast_eat_bonus': '✨ 【{name}】獲得：+{score}点！',
      'snake.toast_levelup': '⚡ Lv.{level} に昇格！スピードアップ！',
      'snake.toast_ai_defeated': '🏆 AIライバルを撃破！ボーナス+5,000点！({reason})',
      'snake.toast_victory': '🎉 祝・全10レベル完全制覇！',
      'snake.login_hint': '💡 ログインしてスコアを世界Top50ランキングに記録しよう！',
      'snake.all_clear_achieved': '🌟 全10レベル完全クリア達成！'
    }
  };

  function t(key, params = {}) {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    let str = langDict[key] || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
      });
    }
    return str;
  }

  function getLanguage() {
    return currentLang;
  }

  async function setLanguage(lang, syncBackend = true) {
    const validLang = normalizeLang(lang);
    currentLang = validLang;
    try {
      localStorage.setItem(STORAGE_KEY, validLang);
    } catch (e) {}

    // 1. Update HTML lang tag
    if (document.documentElement) {
      document.documentElement.lang = validLang;
    }

    // 2. Apply translations across DOM
    applyToDOM();

    // 3. Sync to backend if logged in
    if (syncBackend) {
      const token = localStorage.getItem('arcade_token') || localStorage.getItem('tetris_token');
      if (token) {
        try {
          await fetch('/api/auth/language', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ language: validLang }),
          });
        } catch (e) {
          // Ignore network errors
        }
      }
    }

    // 4. Trigger custom event for dynamic components
    window.dispatchEvent(new CustomEvent('arcadeLanguageChanged', { detail: { lang: validLang } }));
  }

  function applyToDOM() {
    // 1. Text content
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) el.textContent = val;
    });

    // 2. HTML content
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(key);
      if (val) el.innerHTML = val;
    });

    // 3. Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val) el.setAttribute('placeholder', val);
    });

    // 4. Titles / Tooltips
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      const val = t(key);
      if (val) el.setAttribute('title', val);
    });

    // 5. Update Language Switcher UI
    const langSelect = document.getElementById('lang-select-dropdown');
    if (langSelect) {
      langSelect.value = currentLang;
    }
  }

  function initLanguageUI() {
    // Read stored language or default to en
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        currentLang = normalizeLang(saved);
      }
    } catch (e) {}

    if (document.documentElement) {
      document.documentElement.lang = currentLang;
    }

    // Dropdown change listener
    const langSelect = document.getElementById('lang-select-dropdown');
    if (langSelect) {
      langSelect.value = currentLang;
      langSelect.onchange = (e) => {
        setLanguage(e.target.value, true);
      };
    }

    // Apply translations on load
    applyToDOM();
  }

  // Self-initialize on DOM readiness
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initLanguageUI());
    } else {
      initLanguageUI();
    }
  }

  return {
    t,
    getLanguage,
    setLanguage,
    applyToDOM,
    initLanguageUI,
    TRANSLATIONS,
  };
})();
