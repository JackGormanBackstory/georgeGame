// Game Constants
const PLAYER_COLORS = ["#4fc3f7", "#81c784", "#ffd54f", "#e57373"];
const BOWSER_COLOR = "#b39ddb";
const PLAYER_MAX_HP = 30;
const BOWSER_MAX_HP = 100;

// Sprite Configuration
const SPRITES_FOLDER = "sprites/";
const SPRITE_FILES = [
  "Mario_Raccoon.png",
  "Mario_Cape.png",
  "Mario_Penguin.png",
  "Mario_Fire.png",
  "Mario_Cat.png",
  "Mario_Giant.png",
  "Sidekick_Waluigi.png",
  "Sidekick_Toad.png",
  "Sidekick_Wario.png",
  "Sidekick_Luigi.png",
  "Sidekick_Peach.png",
  "Sidekick_DK.png",
];

// Sprite Colors Mapping
const SPRITE_COLORS = {
  "Sidekick_Peach.png": "rgb(247,164,187)",
  "Mario_Penguin.png": "rgb(83,128,191)",
  "Mario_Cat.png": "rgb(255,219,26)",
  "Mario_Cape.png": "rgb(254,58,68)",
  "Mario_Giant.png": "rgb(158,94,64)",
  "Mario_Raccoon.png": "rgb(35,83,177)",
  "Sidekick_Waluigi.png": "rgb(110,58,183)",
  "Sidekick_Luigi.png": "rgb(95,179,70)",
  "Mario_Fire.png": "rgb(255,85,0)",
  "Sidekick_DK.png": "rgb(164,112,70)",
  "Sidekick_Wario.png": "rgb(183,67,173)",
};

// Animation Constants
const FIREBRO_FRAMES = 20;
const FIREBRO_WIDTH = 48;
const FIREBRO_HEIGHT = 48;
const BOO_FRAMES = 5;
const BOO_WIDTH = 32;
const BOO_HEIGHT = 32;

// Player 1 Animation Constants
const PLAYER1_COLS = 5;
const PLAYER1_ROWS = 2;
const PLAYER1_FRAME_W = 313;
const PLAYER1_FRAME_H = 348;
const PLAYER1_IDLE_FRAMES = 2;
const PLAYER1_ATTACK_FRAMES = 5;

// Boss Animation Constants
const BOWSER_FRAME_W = 626.35;
const BOWSER_FRAME_H = 698.61;
const BOWSER_IDLE_FRAMES = 6;
const BOWSER_IDLE_ROW = 2;
const BOWSER_IDLE_FRAME_DURATIONS = [18, 60, 24, 18, 32, 18];

// Boss Attack Animation Constants
const BOWSER_ATTACK_FRAME_W = 791.82;
const BOWSER_ATTACK_FRAME_H = 686;
const BOWSER_ATTACK_FRAMES = 4;

// Game Title
const GAME_TITLE = "SUPER SMASH SHOWDOWN";

// Sound Effects Path
const SOUND_PATH = "sounds/";

const SFX = {
  playerAttack: SOUND_PATH + "Squeak.wav",
  bowserAttack: SOUND_PATH + "Castle Explode.wav",
  playerHit: SOUND_PATH + "Boss Hit.wav",
  bossHit: SOUND_PATH + "Bowser Hit.wav",
  playerDeath: SOUND_PATH + "Enemy Tumble.wav",
  bowserDeath: SOUND_PATH + "Boss Defeat.wav",
  bowserExplode: SOUND_PATH + "Boss Explode.wav",
  win: SOUND_PATH + "World Complete.wav",
  gameOver: SOUND_PATH + "gameOver.mp3",
  select: SOUND_PATH + "Select.wav",
  pause: SOUND_PATH + "Pause.wav",
  wrong: SOUND_PATH + "Wrong.wav",
  clank1: SOUND_PATH + "Clank 1.wav",
  clank2: SOUND_PATH + "Clank 2.wav",
  pipe: SOUND_PATH + "Pipe.wav",
};

class Player {
  constructor(index, name = "", spriteFile = "") {
    this.index = index;
    this.name = name;
    this.spriteFile = spriteFile;
    this.hp = PLAYER_MAX_HP;
    this.displayHp = PLAYER_MAX_HP;
    this.alive = true;
    this.anim = 0;
    this.barShake = 0;
    this.attackOffset = { x: 0, y: 0 };
    this.specialCharge = 0;
    this.specialReady = false;
    this.teamBuff = 0;
    this._spriteImg = null;
  }

  reset() {
    this.hp = PLAYER_MAX_HP;
    this.displayHp = PLAYER_MAX_HP;
    this.alive = true;
    this.anim = 0;
    this.barShake = 0;
    this.attackOffset = { x: 0, y: 0 };
    this.specialCharge = 0;
    this.specialReady = false;
    this.teamBuff = 0;
    this._spriteImg = null;
  }

  takeDamage(damage) {
    this.hp = Math.max(0, this.hp - damage);
    this.anim = 1;
    this.barShake = 1;

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  heal(amount) {
    this.hp = Math.min(PLAYER_MAX_HP, this.hp + amount);
  }

  addSpecialCharge() {
    if (this.alive && this.specialCharge < 3) {
      this.specialCharge++;
      if (this.specialCharge >= 3) {
        this.specialReady = true;
      }
    }
  }

  useSpecialAttack() {
    this.specialCharge = 0;
    this.specialReady = false;
  }

  updateHealthBar() {
    if (Math.abs(this.displayHp - this.hp) > 0.1) {
      this.displayHp += (this.hp - this.displayHp) * 0.15;
    } else {
      this.displayHp = this.hp;
    }
  }

  updateBarShake() {
    if (this.barShake > 0) {
      this.barShake -= 0.1;
    }
  }

  toJSON() {
    return {
      index: this.index,
      name: this.name,
      spriteFile: this.spriteFile,
      hp: this.hp,
      displayHp: this.displayHp,
      alive: this.alive,
      anim: this.anim,
      barShake: this.barShake,
      attackOffset: this.attackOffset,
      specialCharge: this.specialCharge,
      specialReady: this.specialReady,
      teamBuff: this.teamBuff,
    };
  }

  fromJSON(data) {
    this.index = data.index;
    this.name = data.name || "";
    this.spriteFile = data.spriteFile || "";
    this.hp = data.hp;
    this.displayHp = data.displayHp;
    this.alive = data.alive;
    this.anim = data.anim;
    this.barShake = data.barShake;
    this.attackOffset = data.attackOffset || { x: 0, y: 0 };
    this.specialCharge = data.specialCharge;
    this.specialReady = data.specialReady;
    this.teamBuff = data.teamBuff;
    this._spriteImg = null; // Reset sprite image
  }
}

class Bowser {
  constructor() {
    this.hp = BOWSER_MAX_HP;
    this.displayHp = BOWSER_MAX_HP;
    this.alive = true;
    this.anim = 0;
    this.barShake = 0;
    this.attackOffset = { x: 0, y: 0 };
    this.statusEffects = {};
  }

  reset() {
    this.hp = BOWSER_MAX_HP;
    this.displayHp = BOWSER_MAX_HP;
    this.alive = true;
    this.anim = 0;
    this.barShake = 0;
    this.attackOffset = { x: 0, y: 0 };
    this.statusEffects = {};
  }

  takeDamage(damage) {
    this.hp = Math.max(0, this.hp - damage);
    this.anim = 1;
    this.barShake = 1;

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  addStatusEffect(effect, turns) {
    this.statusEffects[effect] = { turns };
  }

  processStatusEffects() {
    let skipTurn = false;

    if (this.statusEffects.burn) {
      this.takeDamage(2);
      this.statusEffects.burn.turns--;
      if (this.statusEffects.burn.turns <= 0) {
        delete this.statusEffects.burn;
      }
    }

    if (this.statusEffects.bleed) {
      this.takeDamage(2);
      this.statusEffects.bleed.turns--;
      if (this.statusEffects.bleed.turns <= 0) {
        delete this.statusEffects.bleed;
      }
    }

    if (this.statusEffects.poison) {
      this.takeDamage(2);
      this.statusEffects.poison.turns--;
      if (this.statusEffects.poison.turns <= 0) {
        delete this.statusEffects.poison;
      }
    }

    if (this.statusEffects.freeze) {
      skipTurn = true;
      this.statusEffects.freeze.turns--;
      if (this.statusEffects.freeze.turns <= 0) {
        delete this.statusEffects.freeze;
      }
    }

    if (this.statusEffects.distract) {
      skipTurn = true;
      this.statusEffects.distract.turns--;
      if (this.statusEffects.distract.turns <= 0) {
        delete this.statusEffects.distract;
      }
    }

    return skipTurn;
  }

  updateHealthBar() {
    if (Math.abs(this.displayHp - this.hp) > 0.1) {
      this.displayHp += (this.hp - this.displayHp) * 0.15;
    } else {
      this.displayHp = this.hp;
    }
  }

  updateBarShake() {
    if (this.barShake > 0) {
      this.barShake -= 0.1;
    }
  }

  toJSON() {
    return {
      hp: this.hp,
      displayHp: this.displayHp,
      alive: this.alive,
      anim: this.anim,
      barShake: this.barShake,
      attackOffset: this.attackOffset,
      statusEffects: this.statusEffects,
    };
  }

  fromJSON(data) {
    this.hp = data.hp;
    this.displayHp = data.displayHp;
    this.alive = data.alive;
    this.anim = data.anim;
    this.barShake = data.barShake;
    this.attackOffset = data.attackOffset || { x: 0, y: 0 };
    this.statusEffects = data.statusEffects || {};
  }
}

class AudioManager {
  constructor() {
    this.sfxVolume = 0.7;
    this.gameMusic = new Audio("music/bossMusic.mp3");
    this.menuMusic = new Audio("music/characterSelectMusic.mp3");
    this.pausedSFX = [];
    this.isGamePaused = false;

    this.initializeMusic();
  }

  initializeMusic() {
    this.gameMusic.loop = true;
    this.gameMusic.volume = 0.5;

    this.menuMusic.loop = true;
    this.menuMusic.volume = 0.5;
  }

  playSound(name, volume = 1) {
    const audio = new Audio(name);
    audio.volume = volume * this.sfxVolume;

    if (this.isGamePaused) {
      audio.pause();
      this.pausedSFX.push(audio);
    } else {
      audio.play();
    }
  }

  playSFX(sfxName, volume = 1) {
    if (SFX[sfxName]) {
      this.playSound(SFX[sfxName], volume);
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = volume;
  }

  setMusicVolume(volume) {
    this.gameMusic.volume = volume;
    this.menuMusic.volume = volume;
  }

  muteMusic() {
    this.gameMusic.muted = true;
    this.menuMusic.muted = true;
  }

  unmuteMusic() {
    this.gameMusic.muted = false;
    this.menuMusic.muted = false;
  }

  toggleMute() {
    const isMuted = this.gameMusic.muted && this.menuMusic.muted;
    if (isMuted) {
      this.unmuteMusic();
    } else {
      this.muteMusic();
    }
    return !isMuted;
  }

  playGameMusic() {
    this.menuMusic.pause();
    this.gameMusic.currentTime = 0;
    this.gameMusic.play();
  }

  playMenuMusic() {
    this.gameMusic.pause();
    this.menuMusic.currentTime = 0;
    this.menuMusic.play();
  }

  pauseAllSFX() {
    this.pausedSFX = [];
    document.querySelectorAll("audio").forEach((audio) => {
      if (!audio.paused && !audio.ended) {
        audio.pause();
        this.pausedSFX.push(audio);
      }
    });
  }

  resumeAllSFX() {
    this.pausedSFX.forEach((audio) => {
      try {
        audio.play();
      } catch (e) {}
    });
    this.pausedSFX = [];
  }

  pauseGame() {
    this.isGamePaused = true;
    this.pauseAllSFX();
  }

  resumeGame() {
    this.isGamePaused = false;
    this.resumeAllSFX();
  }

  stopAllMusic() {
    this.gameMusic.pause();
    this.menuMusic.pause();
  }
}

class SaveLoadManager {
  constructor() {
    this.storageKey = "gameSaves";
  }

  saveGameState(saveName, gameState) {
    const saveData = {
      players: gameState.players.map((player) => player.toJSON()),
      bowser: gameState.bowser.toJSON(),
      currentPlayer: gameState.currentPlayer,
      gameState: gameState.gameState,
      playersThisRound: [...gameState.playersThisRound],
      player1Frame: gameState.player1Frame,
      bowserFrame: gameState.bowserFrame,
      timestamp: Date.now(),
      saveName: saveName,
    };

    const saves = this.getSaves();
    saves[saveName] = saveData;
    localStorage.setItem(this.storageKey, JSON.stringify(saves));
  }

  loadGameState(saveName, gameState) {
    const saves = this.getSaves();
    const saveData = saves[saveName];

    if (saveData) {
      // Load players
      saveData.players.forEach((playerData, index) => {
        if (gameState.players[index]) {
          gameState.players[index].fromJSON(playerData);
        }
      });

      // Load bowser
      gameState.bowser.fromJSON(saveData.bowser);

      // Load game state
      gameState.currentPlayer = saveData.currentPlayer;
      gameState.gameState = saveData.gameState;
      gameState.playersThisRound = Array.isArray(saveData.playersThisRound)
        ? [...saveData.playersThisRound]
        : [];
      gameState.player1Frame = saveData.player1Frame;
      gameState.bowserFrame = saveData.bowserFrame;

      // Fix: If the saved currentPlayer is dead, find the next alive player
      if (
        !gameState.players[gameState.currentPlayer] ||
        !gameState.players[gameState.currentPlayer].alive
      ) {
        gameState.currentPlayer = gameState.players.findIndex((p) => p.alive);
        // If no players are alive, this is a game over state
        if (gameState.currentPlayer === -1) {
          gameState.gameState = "gameover";
          gameState.currentPlayer = 0; // fallback to prevent crashes
        }
      }

      return true;
    }
    return false;
  }

  deleteSave(saveName) {
    const saves = this.getSaves();
    delete saves[saveName];
    localStorage.setItem(this.storageKey, JSON.stringify(saves));
  }

  getSaves() {
    return JSON.parse(localStorage.getItem(this.storageKey) || "{}");
  }

  getAllSaveNames() {
    return Object.keys(this.getSaves());
  }

  getSaveInfo(saveName) {
    const saves = this.getSaves();
    const saveData = saves[saveName];
    if (saveData) {
      return {
        name: saveName,
        timestamp: saveData.timestamp,
        date: new Date(saveData.timestamp),
      };
    }
    return null;
  }

  getAllSaveInfos() {
    const saves = this.getSaves();
    return Object.keys(saves).map((saveName) => ({
      name: saveName,
      timestamp: saves[saveName].timestamp,
      date: new Date(saves[saveName].timestamp),
    }));
  }
}

class SpecialAttackService {
  constructor(audioManager) {
    this.audioManager = audioManager;
  }

  doSpecialAttack(player, boss, positions, gameState) {
    const charName = player.name || `Player ${player.index + 1}`;
    const bowserPos = positions.bowser;
    let damage = 0;
    let color = "#fff";
    let label = "SPECIAL!";
    let effect = null;

    // Determine special by character name
    if (/fire/i.test(charName)) {
      damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      color = "#ff5722";
      label = "BURN!";
      if (!bowser.statusEffects.burn) {
        bowser.addStatusEffect("burn", 3);
        effect = "Burn applied!";
      }
    } else if (/penguin/i.test(charName)) {
      damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      color = "#00e5ff";
      label = "FREEZE!";
      if (!bowser.statusEffects.freeze) {
        bowser.addStatusEffect("freeze", 1);
        effect = "Bowser frozen!";
      }
    } else if (/cape|raccoon|flying/i.test(charName)) {
      damage = 7 + player.teamBuff;
      color = "#ffd600";
      label = "CRIT!";
    } else if (/giant/i.test(charName)) {
      damage = (Math.floor(Math.random() * 6) + 1 + player.teamBuff) * 2;
      color = "#bdbdbd";
      label = "SMASH!";
      this.triggerScreenShake();
    } else if (/cat/i.test(charName)) {
      damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      color = "#ffb300";
      label = "BLEED!";
      if (!bowser.statusEffects.bleed) {
        bowser.addStatusEffect("bleed", 3);
        effect = "Bleed applied!";
      }
    } else if (/wario/i.test(charName)) {
      damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      color = "#8bc34a";
      label = "POISON!";
      if (!bowser.statusEffects.poison) {
        bowser.addStatusEffect("poison", 3);
        effect = "Poison applied!";
      }
    } else if (/toad/i.test(charName)) {
      damage = 0;
      color = "#fff";
      label = "BUFF!";
      gameState.players.forEach((pl) => {
        pl.teamBuff = (pl.teamBuff || 0) + 1;
      });
      if (!bowser.statusEffects.distract) {
        bowser.addStatusEffect("distract", 1);
        effect = "Bowser distracted!";
      }
    } else if (/waluigi/i.test(charName)) {
      damage = 7 + player.teamBuff;
      color = "#ba68c8";
      label = "BOMB!";
    } else if (/peach/i.test(charName)) {
      damage = 0;
      color = "#f06292";
      label = "HEAL!";
      let heal = (Math.floor(Math.random() * 6) + 1) * 2;
      gameState.players.forEach((pl) => {
        if (pl.alive) {
          pl.heal(heal);
          gameState.showFloatingDamage(
            positions.players[gameState.players.indexOf(pl)].x,
            positions.players[gameState.players.indexOf(pl)].y - 70,
            "+" + heal,
            "#f06292",
            "HEAL!"
          );
        }
      });
    } else if (/luigi/i.test(charName)) {
      damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      let damage2 = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      color = "#66bb6a";
      label = "DOUBLE!";
      bowser.takeDamage(damage2);
      gameState.showFloatingDamage(
        bowserPos.x,
        bowserPos.y - 110,
        "-" + damage2,
        color,
        label
      );
    } else {
      damage = 7 + player.teamBuff;
      color = "#fff";
      label = "SPECIAL!";
    }

    // Apply damage if not Peach/Toad
    if (damage > 0) {
      bowser.takeDamage(damage);
      this.audioManager.playSFX("bossHit", 0.7);
      gameState.showFloatingDamage(
        bowserPos.x,
        bowserPos.y - 70,
        "-" + damage,
        color,
        label
      );
    }

    // Show effect text if any
    if (effect) {
      gameState.showFloatingDamage(
        bowserPos.x,
        bowserPos.y - 120,
        effect,
        color,
        label
      );
    }

    // Reset special charge
    player.useSpecialAttack();
  }

  triggerScreenShake() {
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    gameContainer.classList.remove("screen-shake");
    void gameContainer.offsetWidth;
    gameContainer.classList.add("screen-shake");

    setTimeout(() => {
      gameContainer.classList.remove("screen-shake");
    }, 400);
  }
}

class AnimationManager {
  constructor() {
    this.fireBroFrame = 0;
    this.fireBroAnimTimer = 0;
    this.booFrame = 0;
    this.booAnimTimer = 0;
    this.bowserFrame = 0;
    this.player1Frame = 0;
    this.player1AnimTimer = 0;
    this.player1AttackAnim = false;
    this.player1AttackAnimFrame = 0;
    this.bowserAttackAnim = false;
    this.bowserAttackAnimFrame = 0;
    this.bowserIdleFrame = 0;
    this.bowserIdleFrameTimer = 0;

    // Boss death animation state
    this.bowserDeathAnim = false;
    this.bowserDeathFrame = 0;
    this.bowserDeathFrameTimer = 0;
    this.bowserDeathY = 0;
    this.bowserDeathDone = false;

    // Fireworks and screen state
    this.fireworks = [];
    this.showWinScreen = false;
    this.winScreenTimer = 0;
    this.showDeathScreen = false;
    this.deathScreenTimer = 0;
  }

  updatePlayer1Animation() {
    this.player1AnimTimer++;
    if (!this.player1AttackAnim && this.player1AnimTimer % 28 === 0) {
      this.player1Frame = (this.player1Frame + 1) % PLAYER1_IDLE_FRAMES;
    }
  }

  updateBossAnimation() {
    if (this.bowserDeathAnim) {
      this.updateBossDeathAnimation();
    } else if (!this.bowserAttackAnim) {
      this.updateBossIdleAnimation();
    } else {
      this.bowserIdleFrameTimer = 0;
    }
  }

  updateBossDeathAnimation() {
    if (!this.bowserDeathDone) {
      this.bowserDeathFrameTimer++;
      if (this.bowserDeathFrame < 2 && this.bowserDeathFrameTimer > 48) {
        this.bowserDeathFrame++;
        this.bowserDeathFrameTimer = 0;
      } else if (
        this.bowserDeathFrame === 2 &&
        this.bowserDeathFrameTimer > 80
      ) {
        this.bowserDeathDone = true;
        this.bowserDeathFrameTimer = 0;
      }
    } else {
      if (this.bowserDeathY < 900) {
        if (
          Math.floor(this.bowserDeathY / 60) !==
          Math.floor((this.bowserDeathY + 2) / 60)
        ) {
          if (!this.bowserDeathAnim._pause) {
            this.bowserDeathAnim._pause = true;
            setTimeout(() => {
              this.bowserDeathAnim._pause = false;
            }, 700);
          }
        }
        if (!this.bowserDeathAnim._pause) {
          this.bowserDeathY += 1.0;
        }
      }
    }
  }

  updateBossIdleAnimation() {
    this.bowserIdleFrameTimer++;
    if (
      this.bowserIdleFrameTimer >=
      BOWSER_IDLE_FRAME_DURATIONS[this.bowserIdleFrame]
    ) {
      this.bowserIdleFrame = this.getNextBowserIdleFrame(this.bowserIdleFrame);
      this.bowserIdleFrameTimer = 0;
    }
  }

  getNextBowserIdleFrame(current) {
    const weights = [0.12, 0.32, 0.12, 0.12, 0.24, 0.08];
    let r = Math.random();
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (r < acc) {
        if ((i === 1 || i === 4) && i === current && Math.random() < 0.35)
          return current;
        return i;
      }
    }
    return (current + 1) % BOWSER_IDLE_FRAMES;
  }

  updateFireworks() {
    if (Math.random() < 0.08 && this.fireworks.length < 12) {
      this.addFirework();
    }

    this.fireworks.forEach((fw) => {
      fw.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.vy += 0.04;
        p.alpha -= 0.018;
      });
    });

    this.fireworks = this.fireworks.filter((fw) =>
      fw.particles.some((p) => p.alpha > 0)
    );
  }

  addFirework() {
    const canvas = document.getElementById("game-canvas");
    if (!canvas) return;

    const cx = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5;
    const cy = canvas.height * 0.35 + Math.random() * canvas.height * 0.2;
    const color = `hsl(${Math.floor(Math.random() * 360)},90%,60%)`;
    const count = 18 + Math.floor(Math.random() * 8);
    let particles = [];

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const speed = 2.5 + Math.random() * 1.5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
      });
    }

    this.fireworks.push({ particles });
  }

  reset() {
    this.fireBroFrame = 0;
    this.booFrame = 0;
    this.bowserFrame = 0;
    this.player1Frame = 0;
    this.player1AttackAnim = false;
    this.player1AttackAnimFrame = 0;
    this.bowserAttackAnim = false;
    this.bowserAttackAnimFrame = 0;
    this.bowserDeathAnim = false;
    this.bowserDeathFrame = 0;
    this.bowserDeathFrameTimer = 0;
    this.bowserDeathY = 0;
    this.bowserDeathDone = false;
    this.showWinScreen = false;
    this.winScreenTimer = 0;
    this.showDeathScreen = false;
    this.deathScreenTimer = 0;
    this.fireworks = [];
  }
}

class CloudManager {
  constructor() {
    this.clouds = [];
    this.cloudImg = new Image();
    this.cloudImg.src = "cloud.png";
  }

  spawnCloud() {
    if (this.clouds.length >= 3) return;

    const y = 20 + Math.random() * 100;
    const speed = 0.5 + Math.random() * 0.5;

    this.clouds.push({
      x: -100,
      y,
      speed,
      w: 120,
      h: 60,
    });
  }

  updateClouds() {
    // Move clouds
    this.clouds.forEach((cloud) => {
      cloud.x += cloud.speed;
    });

    // Remove off-screen clouds
    this.clouds = this.clouds.filter((cloud) => {
      const canvas = document.getElementById("game-canvas");
      return canvas ? cloud.x < canvas.width + 100 : false;
    });

    // Randomly spawn new cloud
    if (this.clouds.length < 3 && Math.random() < 0.01) {
      this.spawnCloud();
    }
  }

  getClouds() {
    return this.clouds;
  }

  getCloudImage() {
    return this.cloudImg;
  }
}

class FloatingDamageManager {
  constructor() {
    this.floatingDamages = [];
  }

  showFloatingDamage(x, y, text, color = "#ff5252", label = "") {
    this.floatingDamages.push({
      x,
      y,
      text,
      color,
      label,
      vy: -1.2,
      life: 60,
      alpha: 1,
      size: label ? 38 : 28,
    });
  }

  updateFloatingDamages() {
    this.floatingDamages.forEach((fd) => {
      fd.y += fd.vy;
      fd.life--;
      fd.alpha = Math.max(0, fd.life / 60);
    });

    this.floatingDamages = this.floatingDamages.filter((fd) => fd.life > 0);
  }

  getFloatingDamages() {
    return this.floatingDamages;
  }

  clear() {
    this.floatingDamages = [];
  }
}

class CharacterSelectUI {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.selectedSprites = [];
    this.selectedNames = [];
  }

  showCharacterSelect() {
    document.getElementById("character-select-screen").style.display = "flex";
    document.getElementById("game-container").style.display = "none";

    this.renderSpriteGrid();
    this.updateSelectedCharacters();

    // Pause fight music, play menu music
    this.audioManager.playMenuMusic();
  }

  renderSpriteGrid() {
    const grid = document.getElementById("sprite-grid");
    grid.innerHTML = "";

    SPRITE_FILES.forEach((file, idx) => {
      const div = document.createElement("div");
      div.className = "sprite-option";
      div.dataset.idx = idx;

      // Set background color
      if (SPRITE_COLORS[file]) {
        div.style.background = SPRITE_COLORS[file];
      } else {
        div.style.background = "#4b367c";
      }

      const img = document.createElement("img");
      img.src = SPRITES_FOLDER + file;
      img.alt = file;

      // Special size for Mario_Fire and Mario_Giant in grid
      if (file === "Mario_Fire.png") {
        img.style.width = "120px";
        img.style.height = "120px";
      } else if (file === "Mario_Giant.png") {
        img.style.width = "142px";
        img.style.height = "142px";
        img.style.marginTop = "-24px";
      } else if (file === "Sidekick_DK.png") {
        img.style.width = "120px";
        img.style.height = "120px";
      }

      div.appendChild(img);

      // Add character name label
      const label = document.createElement("div");
      label.className = "sprite-label";
      label.textContent = file.replace(/\.[^.]+$/, "").replace(/_/g, " ");
      div.appendChild(label);

      div.onclick = () => {
        this.audioManager.playSFX("select", 0.5);
        this.toggleSelectSprite(idx, file);
      };

      grid.appendChild(div);
    });
  }

  toggleSelectSprite(idx, file) {
    const alreadyIdx = this.selectedSprites.findIndex((s) => s.idx === idx);

    if (alreadyIdx !== -1) {
      // Deselect
      this.audioManager.playSFX("clank1", 0.7);
      this.selectedSprites.splice(alreadyIdx, 1);
      this.selectedNames.splice(alreadyIdx, 1);
    } else if (this.selectedSprites.length < 4) {
      // Add to first empty slot
      this.selectedSprites.push({ idx, file });
      this.selectedNames.push("");
    } else {
      // All 4 selected, and user clicked a new character
      this.audioManager.playSFX("clank2", 0.7);
    }

    this.updateSelectedCharacters();
  }

  updateSelectedCharacters() {
    const container = document.getElementById("selected-characters");
    container.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      const div = document.createElement("div");
      div.className = "selected-char";

      // Set background color if a sprite is selected
      if (
        this.selectedSprites[i] &&
        SPRITE_COLORS[this.selectedSprites[i].file]
      ) {
        div.style.background = SPRITE_COLORS[this.selectedSprites[i].file];
      } else if (this.selectedSprites[i]) {
        div.style.background = "#3a235a";
      }

      if (this.selectedSprites[i]) {
        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-char-btn";
        removeBtn.innerHTML = "&times;";
        removeBtn.title = "Remove character";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          this.audioManager.playSFX("clank1", 0.7);
          this.selectedSprites.splice(i, 1);
          this.selectedNames.splice(i, 1);
          this.updateSelectedCharacters();
        };
        div.appendChild(removeBtn);

        // Sprite
        const img = document.createElement("img");
        img.src = SPRITES_FOLDER + this.selectedSprites[i].file;
        img.alt = this.selectedSprites[i].file;
        img.classList.add("bobbing");
        img.style.animationDelay = `${(i * 0.5 + Math.random() * 0.5).toFixed(
          2
        )}s`;

        // Special size for Mario_Fire and Mario_Giant
        if (this.selectedSprites[i].file === "Mario_Fire.png") {
          img.style.width = "140px";
          img.style.height = "140px";
        } else if (this.selectedSprites[i].file === "Mario_Giant.png") {
          img.style.width = "160px";
          img.style.height = "160px";
          img.style.marginTop = "-24px";
        }

        div.appendChild(img);

        // Name input
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Name...";
        input.value = this.selectedNames[i] || "";
        input.oninput = (e) => {
          this.selectedNames[i] = e.target.value;
          this.checkStartFightEnabled();
        };
        div.appendChild(input);
      } else {
        // Empty slot
        div.classList.add("empty");
      }

      container.appendChild(div);
    }

    // Highlight selected and update grid box styles
    document.querySelectorAll(".sprite-option").forEach((opt) => {
      opt.classList.remove("selected");
      const idx = parseInt(opt.dataset.idx);
      const file = SPRITE_FILES[idx];
      const isSelected = this.selectedSprites.some((s) => s.idx === idx);

      // Always set background color
      if (SPRITE_COLORS[file]) {
        opt.style.background = SPRITE_COLORS[file];
      } else {
        opt.style.background = "#4b367c";
      }

      if (isSelected) {
        opt.classList.add("selected");
        opt.style.outline = "4px solid #2ecc40";
        opt.style.filter = "brightness(0.85)";
      } else {
        opt.style.outline = "";
        opt.style.filter = "";
      }
    });

    this.checkStartFightEnabled();
  }

  checkStartFightEnabled() {
    const btn = document.getElementById("start-fight");
    const allNamed =
      this.selectedNames.length === 4 &&
      this.selectedNames.every((n) => n.trim().length > 0);
    btn.disabled = !allNamed;
  }

  getSelectedCharacters() {
    return {
      sprites: this.selectedSprites,
      names: this.selectedNames,
    };
  }

  reset() {
    this.selectedSprites = [];
    this.selectedNames = [];
  }
}

class GameUI {
  constructor(audioManager, saveLoadManager) {
    this.audioManager = audioManager;
    this.saveLoadManager = saveLoadManager;
    this.attackBtn = document.getElementById("attack-btn");
    this.specialAttackBtn = document.getElementById("special-attack-btn");
    this.turnIndicator = document.getElementById("turn-indicator");
    this.selectedSaveForLoad = null; // Track selected save for loading

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Attack button
    if (this.attackBtn) {
      this.attackBtn.addEventListener("click", () => {
        // This will be handled by the game controller
        if (window.gameController) {
          window.gameController.handlePlayerAttack();
        }
      });
    }

    // Special attack button
    if (this.specialAttackBtn) {
      this.specialAttackBtn.addEventListener("click", () => {
        if (window.gameController) {
          window.gameController.handleSpecialAttack();
        }
      });
    }

    // Music volume control
    const musicVolume = document.getElementById("music-volume");
    if (musicVolume) {
      musicVolume.addEventListener("input", (e) => {
        this.audioManager.setMusicVolume(parseFloat(e.target.value));
      });
    }

    // Music mute button
    const musicMuteBtn = document.getElementById("music-mute");
    if (musicMuteBtn) {
      musicMuteBtn.onclick = () => {
        const isMuted = this.audioManager.toggleMute();
        musicMuteBtn.textContent = isMuted ? "🔇" : "🔊";
      };
    }

    // Save/Load buttons
    const saveGameBtn = document.getElementById("save-game");
    if (saveGameBtn) {
      saveGameBtn.addEventListener("click", () => {
        this.openModal("save");
      });
    }

    const loadGameBtn = document.getElementById("load-game");
    if (loadGameBtn) {
      loadGameBtn.addEventListener("click", () => {
        this.openModal("load");
      });
    }

    // Modal controls
    const confirmSaveBtn = document.getElementById("confirm-save");
    if (confirmSaveBtn) {
      confirmSaveBtn.addEventListener("click", () => {
        this.handleSave();
      });
    }

    const closeModalBtn = document.getElementById("close-modal");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        this.closeModal();
      });
    }

    // Load modal button event listeners
    const confirmLoadBtn = document.getElementById("confirm-load");
    if (confirmLoadBtn) {
      confirmLoadBtn.addEventListener("click", () => {
        if (this.selectedSaveForLoad && window.gameController) {
          window.gameController.loadGame(this.selectedSaveForLoad);
          this.closeModal();
        }
      });
    }

    const cancelLoadBtn = document.getElementById("cancel-load");
    if (cancelLoadBtn) {
      cancelLoadBtn.addEventListener("click", () => {
        this.closeModal();
      });
    }

    // Close modal when clicking outside (only for save mode, not load mode)
    window.addEventListener("click", (e) => {
      const modal = document.getElementById("save-modal");
      const loadSection = document.getElementById("load-section");
      const saveSection = document.getElementById("save-input-section");

      if (e.target === modal) {
        // Only close automatically if in save mode, not load mode
        if (loadSection && loadSection.style.display === "block") {
          // In load mode - don't close automatically, user must use Cancel button
          return;
        }
        this.closeModal();
      }
    });

    // Return to main menu
    const returnMainMenuBtn = document.getElementById("return-main-menu");
    const confirmModal = document.getElementById("confirm-modal");
    const confirmYesBtn = document.getElementById("confirm-yes");
    const confirmNoBtn = document.getElementById("confirm-no");

    if (returnMainMenuBtn) {
      returnMainMenuBtn.addEventListener("click", () => {
        this.audioManager.pauseGame();
        confirmModal.style.display = "flex";
      });
    }

    if (confirmNoBtn) {
      confirmNoBtn.addEventListener("click", () => {
        confirmModal.style.display = "none";
        // Resume game since user chose not to return to main menu
        this.audioManager.gameMusic.play().catch((error) => {
          console.log("Music playback failed:", error.message);
        });
        this.audioManager.resumeGame();
      });
    }

    if (confirmYesBtn) {
      confirmYesBtn.addEventListener("click", () => {
        confirmModal.style.display = "none";
        if (window.gameController) {
          window.gameController.returnToMainMenu();
        }
      });
    }
  }

  updateTurnIndicator(gameState, currentPlayer, players) {
    if (gameState === "player") {
      const name = players[currentPlayer].name || `Player ${currentPlayer + 1}`;
      this.turnIndicator.textContent = `${name}'s Turn`;
    } else if (gameState === "bowser") {
      this.turnIndicator.textContent = `Bowser Attacking!`;
    }
  }

  updateSpecialAttackBtn(currentPlayer, players, gameState) {
    const p = players[currentPlayer];
    this.specialAttackBtn.disabled =
      !p.alive || !p.specialReady || gameState !== "player";

    if (!p.specialReady) {
      this.specialAttackBtn.textContent = `Special (${p.specialCharge}/3)`;
    } else {
      this.specialAttackBtn.textContent = "Special Attack!";
    }
  }

  setAttackButtonEnabled(enabled) {
    this.attackBtn.disabled = !enabled;
  }

  setSpecialAttackButtonEnabled(enabled) {
    this.specialAttackBtn.disabled = !enabled;
  }

  openModal(mode) {
    const modal = document.getElementById("save-modal");
    const title = document.getElementById("modal-title");
    const saveSection = document.getElementById("save-input-section");
    const loadSection = document.getElementById("load-section");
    const saveSlotsSave = document.getElementById("save-slots-save");

    // Get button containers
    const loadButtons = modal.querySelector(".modal-buttons:has(#cancel-load)");
    const saveButtons = modal.querySelector(
      ".modal-buttons:has(#confirm-save)"
    );

    // Set data-mode attribute for CSS styling
    modal.setAttribute("data-mode", mode);

    if (mode === "save") {
      title.textContent = "Save Game";
      saveSection.style.display = "block";
      loadSection.style.display = "none";

      // Show save buttons, hide load buttons
      if (saveButtons) saveButtons.style.display = "flex";
      if (loadButtons) loadButtons.style.display = "none";

      // Change "Close" to "Cancel" for consistency
      const closeBtn = document.getElementById("close-modal");
      if (closeBtn) closeBtn.textContent = "Cancel";
      this.updateSaveSlotsForSave();
    } else {
      title.textContent = "Load Game";
      saveSection.style.display = "none";
      loadSection.style.display = "block";

      // Show load buttons, hide save buttons
      if (loadButtons) loadButtons.style.display = "flex";
      if (saveButtons) saveButtons.style.display = "none";

      this.updateSaveSlots();
    }

    modal.style.display = "block";
  }

  closeModal() {
    document.getElementById("save-modal").style.display = "none";
    document.getElementById("save-name").value = "";

    // Don't reset game state when closing modal - this was causing turn indicator to reset!
    // if (window.gameController && window.gameController.animationManager) {
    //   window.gameController.animationManager.reset();
    // }
  }

  updateSaveSlots() {
    const saveSlots = document.getElementById("save-slots");
    const saveInfos = this.saveLoadManager.getAllSaveInfos();

    saveSlots.innerHTML = "";
    this.selectedSaveForLoad = null; // Reset selection

    // Disable load button when no save is selected
    const loadBtn = document.getElementById("confirm-load");
    if (loadBtn) loadBtn.disabled = true;

    saveInfos.forEach((saveInfo) => {
      const slot = document.createElement("div");
      slot.className = "save-slot";

      // Get the save data to access character information
      const saves = this.saveLoadManager.getSaves();
      const saveData = saves[saveInfo.name];

      // Create the info section
      const infoDiv = document.createElement("div");
      infoDiv.className = "save-slot-info";

      // Basic save info
      const basicInfo = document.createElement("div");
      basicInfo.innerHTML = `
        <strong>${saveInfo.name}</strong><br>
        <small>${saveInfo.date.toLocaleString()}</small>
      `;
      infoDiv.appendChild(basicInfo);

      // Character information
      if (saveData && saveData.players) {
        const charactersDiv = document.createElement("div");
        charactersDiv.className = "save-slot-characters";

        saveData.players.forEach((player, index) => {
          if (player && (player.mainCharacter || player.sidekickCharacter)) {
            const playerDiv = document.createElement("div");
            playerDiv.className = "save-slot-character";

            // Create character display
            let characterDisplay = "";
            if (player.mainSpriteFile) {
              characterDisplay += `<img src="${player.mainSpriteFile}" alt="Main Character">`;
            }
            if (player.sidekickSpriteFile) {
              characterDisplay += `<img src="${player.sidekickSpriteFile}" alt="Sidekick">`;
            }

            const characterName = player.name || `Player ${index + 1}`;
            characterDisplay += `<div class="save-slot-character-name">${characterName}</div>`;

            playerDiv.innerHTML = characterDisplay;
            charactersDiv.appendChild(playerDiv);
          }
        });

        if (charactersDiv.children.length > 0) {
          infoDiv.appendChild(charactersDiv);
        }
      }

      slot.appendChild(infoDiv);

      // Actions section
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "save-slot-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-save";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        this.deleteSave(saveInfo.name);
      };
      actionsDiv.appendChild(deleteBtn);

      slot.appendChild(actionsDiv);

      // Updated click behavior: select instead of immediate load
      slot.onclick = (e) => {
        if (!e.target.classList.contains("delete-save")) {
          // Remove selection from other slots
          saveSlots
            .querySelectorAll(".save-slot")
            .forEach((s) => s.classList.remove("selected"));

          // Select this slot
          slot.classList.add("selected");
          this.selectedSaveForLoad = saveInfo.name;

          // Enable load button
          const loadBtn = document.getElementById("confirm-load");
          if (loadBtn) loadBtn.disabled = false;
        }
      };

      saveSlots.appendChild(slot);
    });
  }

  updateSaveSlotsForSave() {
    const saveSlotsSave = document.getElementById("save-slots-save");
    if (!saveSlotsSave) return;

    const saveInfos = this.saveLoadManager.getAllSaveInfos();
    saveSlotsSave.innerHTML = "";

    saveInfos.forEach((saveInfo) => {
      const slot = document.createElement("div");
      slot.className = "save-slot";

      // Get the save data to access character information
      const saves = this.saveLoadManager.getSaves();
      const saveData = saves[saveInfo.name];

      // Create the info section
      const infoDiv = document.createElement("div");
      infoDiv.className = "save-slot-info";

      // Basic save info
      const basicInfo = document.createElement("div");
      basicInfo.innerHTML = `
        <strong>${saveInfo.name}</strong><br>
        <small>${saveInfo.date.toLocaleString()}</small>
      `;
      infoDiv.appendChild(basicInfo);

      // Character information
      if (saveData && saveData.players) {
        const charactersDiv = document.createElement("div");
        charactersDiv.className = "save-slot-characters";

        saveData.players.forEach((player, index) => {
          if (player && (player.mainCharacter || player.sidekickCharacter)) {
            const playerDiv = document.createElement("div");
            playerDiv.className = "save-slot-character";

            // Create character display
            let characterDisplay = "";
            if (player.mainSpriteFile) {
              characterDisplay += `<img src="${player.mainSpriteFile}" alt="Main Character">`;
            }
            if (player.sidekickSpriteFile) {
              characterDisplay += `<img src="${player.sidekickSpriteFile}" alt="Sidekick">`;
            }

            const characterName = player.name || `Player ${index + 1}`;
            characterDisplay += `<div class="save-slot-character-name">${characterName}</div>`;

            playerDiv.innerHTML = characterDisplay;
            charactersDiv.appendChild(playerDiv);
          }
        });

        if (charactersDiv.children.length > 0) {
          infoDiv.appendChild(charactersDiv);
        }
      }

      slot.appendChild(infoDiv);

      slot.onclick = () => {
        const alreadySelected = slot.classList.contains("selected");
        saveSlotsSave
          .querySelectorAll(".save-slot")
          .forEach((s) => s.classList.remove("selected"));
        const warn = document.getElementById("overwrite-warning");

        if (alreadySelected) {
          document.getElementById("save-name").value = "";
          if (warn) warn.classList.add("inactive");
        } else {
          document.getElementById("save-name").value = saveInfo.name;
          slot.classList.add("selected");
          if (warn) warn.classList.remove("inactive");
        }
      };

      saveSlotsSave.appendChild(slot);
    });
  }

  handleSave() {
    const saveName = document.getElementById("save-name").value.trim();
    if (saveName && window.gameController) {
      window.gameController.saveGame(saveName);
      this.closeModal();
    }
  }

  deleteSave(saveName) {
    this.saveLoadManager.deleteSave(saveName);
    this.updateSaveSlots();
  }

  showGameContainer() {
    document.getElementById("character-select-screen").style.display = "none";
    document.getElementById("game-container").style.display = "";
  }

  hideGameContainer() {
    document.getElementById("game-container").style.display = "none";
  }
}

class TitleScreenUI {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.titleScreen = document.getElementById("title-screen");
    this.titleCanvas = document.getElementById("title-canvas");
    this.titleText = document.getElementById("title-text");
    this.titleSprites = [];

    this.setupTitleScreen();
    this.loadTitleSprites();
    this.setupEventListeners();
  }

  setupTitleScreen() {
    if (this.titleText) {
      this.titleText.innerHTML = `<span class="game-title rainbow-text">${GAME_TITLE}</span><br><span class="rainbow-text">Click to start</span>`;
    }

    this.resizeTitleCanvas();
    window.addEventListener("resize", () => this.resizeTitleCanvas());
  }

  resizeTitleCanvas() {
    if (this.titleCanvas) {
      this.titleCanvas.width = window.innerWidth;
      this.titleCanvas.height = window.innerHeight;
    }
  }

  loadTitleSprites() {
    this.titleSprites = SPRITE_FILES.map((file) => {
      const img = new window.Image();
      img.src = SPRITES_FOLDER + file;
      return img;
    });
  }

  setupEventListeners() {
    if (this.titleScreen) {
      this.titleScreen.onclick = () => {
        this.audioManager.playSFX("pipe");
        this.titleScreen.style.pointerEvents = "none";

        setTimeout(() => {
          this.hideTitleScreen();
          if (window.gameController) {
            window.gameController.showCharacterSelect();
          }
        }, 500);
      };
    }
  }

  drawTitleScreen() {
    if (!this.titleCanvas) return;

    const ctx = this.titleCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.titleCanvas.width, this.titleCanvas.height);

    // Animated SNES border
    const t = Date.now() / 1000;
    const cx = this.titleCanvas.width / 2;
    const cy = this.titleCanvas.height / 2;
    const borderColors = [
      "#ffeb3b",
      "#ff5252",
      "#4fc3f7",
      "#81c784",
      "#ff00cc",
      "#ffd54f",
    ];
    const borderW = 18;

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.lineWidth = borderW - i * 4;
      ctx.strokeStyle =
        borderColors[(Math.floor(t * 2) + i) % borderColors.length];
      ctx.globalAlpha = 0.7 - i * 0.13;
      ctx.strokeRect(
        borderW / 2 + i * 2,
        borderW / 2 + i * 2,
        this.titleCanvas.width - borderW - i * 4,
        this.titleCanvas.height - borderW - i * 4
      );
      ctx.restore();
    }

    // Scanline overlay
    ctx.save();
    ctx.globalAlpha = 0.13;
    for (let y = 0; y < this.titleCanvas.height; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? "#fff" : "#000";
      ctx.fillRect(0, y, this.titleCanvas.width, 2);
    }
    ctx.restore();

    // Arrange sprites in a circle
    const radius = Math.min(cx, cy) * 0.6;
    const count = this.titleSprites.length;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x =
        cx + Math.cos(angle) * radius + Math.sin(Date.now() / 900 + i) * 24;
      const y =
        cy + Math.sin(angle) * radius + Math.cos(Date.now() / 700 + i) * 24;
      const img = this.titleSprites[i];

      let baseSize = 120 + Math.sin(Date.now() / 500 + i * 2) * 18;
      let drawW = baseSize,
        drawH = baseSize;

      if (img.naturalWidth && img.naturalHeight) {
        const aspect = img.naturalWidth / img.naturalHeight;
        if (aspect > 1) {
          drawH = baseSize;
          drawW = baseSize * aspect;
        } else {
          drawW = baseSize;
          drawH = baseSize / aspect;
        }
      }

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 16;
        ctx.drawImage(img, x - drawW / 2, y - drawH / 2, drawW, drawH);
        ctx.restore();
      }
    }

    requestAnimationFrame(() => this.drawTitleScreen());
  }

  showTitleScreen() {
    if (this.titleScreen) {
      this.titleScreen.classList.remove("hide");
      document.getElementById("character-select-screen").style.display = "none";
      document.getElementById("game-container").style.display = "none";
      this.audioManager.stopAllMusic();
    }
  }

  hideTitleScreen() {
    if (this.titleScreen) {
      this.titleScreen.classList.add("hide");
    }
  }

  start() {
    this.showTitleScreen();
    this.drawTitleScreen();
  }
}

class Renderer {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    // Load images
    this.bgImg = new Image();
    this.bgImg.src = "bowserbackground.png";

    this.bowserBowserImg = new Image();
    this.bowserBowserImg.src = "bowserSprite.png";

    this.bowserAttackImg = new Image();
    this.bowserAttackImg.src = "bowserAttackSheet.png";

    this.player1Img = new Image();
    this.player1Img.src = "goombaAI.png";

    this.setupCanvas();
  }

  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  getCenteredPositions() {
    const centerX = this.canvas.width / 2;
    const bowserY = this.canvas.height / 2 - 40;
    const playerY = this.canvas.height * 0.76;
    const spacing = this.canvas.width / 7;

    return {
      bowser: { x: centerX, y: bowserY },
      players: [
        { x: centerX - 1.5 * spacing, y: playerY },
        { x: centerX - 0.5 * spacing, y: playerY },
        { x: centerX + 0.5 * spacing, y: playerY },
        { x: centerX + 1.5 * spacing, y: playerY },
      ],
    };
  }

  draw(gameState, animationManager, cloudManager, floatingDamageManager) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.drawBackground();

    // Draw clouds
    this.drawClouds(cloudManager);

    const positions = this.getCenteredPositions();

    // Draw bowser health bar
    this.drawBossHealthBar(gameState.boss);

    // Draw boss
    this.drawBoss(gameState.boss, positions.bowser, animationManager);

    // Draw players
    if (!animationManager.showWinScreen) {
      this.drawPlayers(
        gameState.players,
        positions.players,
        gameState.currentPlayer,
        gameState.gameState,
        animationManager
      );
    }

    // Draw floating damages
    this.drawFloatingDamages(floatingDamageManager.getFloatingDamages());

    // Draw win screen
    if (animationManager.showWinScreen) {
      this.drawWinScreen(gameState.players, animationManager);
    }

    // Draw death screen
    if (animationManager.showDeathScreen) {
      this.drawDeathScreen(gameState.players);
    }
  }

  drawBackground() {
    if (this.bgImg.complete && this.bgImg.naturalWidth > 0) {
      const imgAspect = this.bgImg.naturalWidth / this.bgImg.naturalHeight;
      const canvasAspect = this.canvas.width / this.canvas.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      drawHeight = this.canvas.height;
      drawWidth = this.canvas.height * imgAspect;
      offsetX = (this.canvas.width - drawWidth) / 2;
      offsetY = 0;

      this.ctx.drawImage(this.bgImg, offsetX, offsetY, drawWidth, drawHeight);
    }
  }

  drawClouds(cloudManager) {
    const clouds = cloudManager.getClouds();
    const cloudImg = cloudManager.getCloudImage();

    clouds.forEach((cloud) => {
      if (cloudImg.complete && cloudImg.naturalWidth > 0) {
        this.ctx.drawImage(cloudImg, cloud.x, cloud.y, cloud.w, cloud.h);
      }
    });
  }

  drawBossHealthBar(boss) {
    const bowserBarW = Math.min(this.canvas.width * 0.6, 600);
    const bowserBarH = 32;
    const bowserBarX = (this.canvas.width - bowserBarW) / 2;
    const bowserBarY = 36;

    this.ctx.save();
    let shakeX = 0,
      shakeY = 0;
    if (bowser.barShake > 0) {
      shakeX = (Math.random() - 0.5) * 24 * bowser.barShake;
      shakeY = (Math.random() - 0.5) * 24 * bowser.barShake;
    }
    this.ctx.translate(shakeX, shakeY);

    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(bowserBarX, bowserBarY, bowserBarW, bowserBarH);
    this.ctx.fillStyle = "#e53935";
    this.ctx.fillRect(
      bowserBarX,
      bowserBarY,
      (bowserBarW * Math.max(0, bowser.displayHp)) / BOWSER_MAX_HP,
      bowserBarH
    );
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "#fff";
    this.ctx.strokeRect(bowserBarX, bowserBarY, bowserBarW, bowserBarH);

    // Health number
    this.ctx.font = 'bold 1.2em "Press Start 2P", monospace, sans-serif';
    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      `${Math.max(0, Math.round(bowser.displayHp))}/${BOWSER_MAX_HP}`,
      bowserBarX + bowserBarW - 12,
      bowserBarY + bowserBarH / 2
    );

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.restore();

    // Bowser Name
    this.ctx.save();
    this.ctx.font = 'bold 2em "Press Start 2P", monospace, sans-serif';
    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.shadowColor = "#000";
    this.ctx.shadowBlur = 6;
    this.ctx.fillText(
      "Bowser",
      this.canvas.width / 2,
      bowserBarY + bowserBarH + 10
    );
    this.ctx.restore();
  }

  drawBoss(boss, position, animationManager) {
    this.ctx.save();
    let bowserPos = {
      x: position.x + (bowser.attackOffset?.x || 0),
      y:
        position.y +
        (bowser.attackOffset?.y || 0) +
        animationManager.bowserDeathY,
    };

    if (bowser.anim > 0) {
      this.ctx.translate(bowserPos.x, bowserPos.y);
      this.ctx.rotate((Math.random() - 0.5) * 0.1 * bowser.anim);
      this.ctx.translate(-bowserPos.x, -bowserPos.y);
    }

    const bowserDrawW = 400;
    const bowserDrawH = 400;
    const bowserAttackDrawW = 506;
    const bowserAttackDrawH = 438;

    if (animationManager.bowserDeathAnim && !animationManager.showWinScreen) {
      if (
        animationManager.bowserDeathY <= 420 &&
        this.bowserAttackImg.complete &&
        this.bowserAttackImg.naturalWidth > 0
      ) {
        let frame = animationManager.bowserDeathFrame;
        this.ctx.drawImage(
          this.bowserAttackImg,
          Math.round(frame * BOWSER_ATTACK_FRAME_W),
          0,
          Math.round(BOWSER_ATTACK_FRAME_W),
          Math.round(BOWSER_ATTACK_FRAME_H),
          bowserPos.x - bowserAttackDrawW / 2,
          bowserPos.y - bowserAttackDrawH / 2,
          bowserAttackDrawW,
          bowserAttackDrawH
        );
      }
    } else if (
      animationManager.bowserDeathAnim &&
      animationManager.showWinScreen
    ) {
      if (
        this.bowserAttackImg.complete &&
        this.bowserAttackImg.naturalWidth > 0
      ) {
        this.ctx.drawImage(
          this.bowserAttackImg,
          Math.round(2 * BOWSER_ATTACK_FRAME_W),
          0,
          Math.round(BOWSER_ATTACK_FRAME_W),
          Math.round(BOWSER_ATTACK_FRAME_H),
          bowserPos.x - bowserAttackDrawW / 2,
          bowserPos.y - bowserAttackDrawH / 2,
          bowserAttackDrawW,
          bowserAttackDrawH
        );
      }
    } else if (
      animationManager.bowserAttackAnim &&
      this.bowserAttackImg.complete &&
      this.bowserAttackImg.naturalWidth > 0
    ) {
      let frame = animationManager.bowserAttackAnimFrame;
      this.ctx.drawImage(
        this.bowserAttackImg,
        Math.round(frame * BOWSER_ATTACK_FRAME_W),
        0,
        Math.round(BOWSER_ATTACK_FRAME_W),
        Math.round(BOWSER_ATTACK_FRAME_H),
        bowserPos.x - bowserAttackDrawW / 2,
        bowserPos.y - bowserAttackDrawH / 2,
        bowserAttackDrawW,
        bowserAttackDrawH
      );
    } else if (
      this.bowserBowserImg.complete &&
      this.bowserBowserImg.naturalWidth > 0
    ) {
      let frame = animationManager.bowserIdleFrame;
      let row = BOWSER_IDLE_ROW;
      this.ctx.drawImage(
        this.bowserBowserImg,
        Math.round(frame * BOWSER_FRAME_W),
        Math.round(row * BOWSER_FRAME_H),
        Math.round(BOWSER_FRAME_W),
        Math.round(BOWSER_FRAME_H),
        bowserPos.x - bowserDrawW / 2,
        bowserPos.y - bowserDrawH / 2,
        bowserDrawW,
        bowserDrawH
      );
    } else {
      this.ctx.beginPath();
      this.ctx.arc(bowserPos.x, bowserPos.y, 60, 0, Math.PI * 2);
      this.ctx.fillStyle = BOWSER_COLOR;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = "#fff";
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawPlayers(players, positions, currentPlayer, gameState, animationManager) {
    players.forEach((p, i) => {
      const basePos = positions[i];
      const pos = {
        x: basePos.x + (p.attackOffset?.x || 0),
        y: basePos.y + (p.attackOffset?.y || 0),
      };

      this.ctx.save();
      if (p.anim > 0) {
        this.ctx.translate(pos.x, pos.y);
        this.ctx.rotate((Math.random() - 0.5) * 0.1 * p.anim);
        this.ctx.translate(-pos.x, -pos.y);
      }

      const SPRITE_SIZE = 110;

      if (p.spriteFile) {
        let img = p._spriteImg;
        if (!img) {
          img = new window.Image();
          img.src = p.spriteFile;
          p._spriteImg = img;
        }

        let yOffset = 0;
        if (i === currentPlayer && gameState === "player") {
          yOffset = Math.sin(Date.now() / 120) * 12;
        }

        let drawW = SPRITE_SIZE,
          drawH = SPRITE_SIZE;
        if (img.naturalWidth && img.naturalHeight) {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (aspect > 1) {
            drawW = SPRITE_SIZE;
            drawH = SPRITE_SIZE / aspect;
          } else {
            drawH = SPRITE_SIZE;
            drawW = SPRITE_SIZE * aspect;
          }
        }

        if (!p.alive) {
          this.ctx.save();
          this.ctx.globalAlpha = 0.35;
          this.ctx.filter = "grayscale(1)";
        }

        this.ctx.drawImage(
          img,
          pos.x - drawW / 2,
          pos.y - drawH / 2 + yOffset,
          drawW,
          drawH
        );

        if (!p.alive) {
          this.ctx.globalAlpha = 1;
          this.ctx.filter = "none";
          this.ctx.save();
          this.ctx.font = 'bold 32px "Press Start 2P", monospace, sans-serif';
          this.ctx.fillStyle = "#ff5252";
          this.ctx.strokeStyle = "#000";
          this.ctx.lineWidth = 6;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.strokeText("DEAD", pos.x, pos.y);
          this.ctx.fillText("DEAD", pos.x, pos.y);
          this.ctx.restore();
          this.ctx.restore();
        }
      } else if (
        i === 0 &&
        this.player1Img.complete &&
        this.player1Img.naturalWidth > 0
      ) {
        let frame = animationManager.player1Frame;
        if (i === currentPlayer && gameState === "player") {
          frame = Math.floor((Date.now() / 180) % PLAYER1_IDLE_FRAMES);
        }
        this.ctx.drawImage(
          this.player1Img,
          0,
          frame * PLAYER1_FRAME_H,
          PLAYER1_FRAME_W,
          PLAYER1_FRAME_H,
          pos.x - SPRITE_SIZE / 2,
          pos.y - SPRITE_SIZE / 2,
          SPRITE_SIZE,
          SPRITE_SIZE
        );
      } else {
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, SPRITE_SIZE / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = PLAYER_COLORS[i];
        this.ctx.globalAlpha = p.alive ? 1 : 0.3;
        this.ctx.fill();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "#fff";
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
      }

      this.ctx.restore();

      // Health bar
      this.drawHealthBar(
        basePos.x - SPRITE_SIZE / 2,
        basePos.y + SPRITE_SIZE / 2 + 10,
        SPRITE_SIZE,
        16,
        p.displayHp,
        PLAYER_MAX_HP,
        p.barShake
      );

      // Player name
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "18px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        p.name || `P${i + 1}`,
        pos.x,
        pos.y - SPRITE_SIZE / 2 - 12
      );
    });
  }

  drawHealthBar(x, y, w, h, hp, maxHp, shake = 0) {
    this.ctx.save();
    if (shake > 0) {
      this.ctx.translate(
        (Math.random() - 0.5) * 24 * shake,
        (Math.random() - 0.5) * 24 * shake
      );
    }

    // Determine color based on health level
    let barColor = "#76ff03"; // Green (default)
    let shadowColor = "#4caf50"; // Green shadow
    let shouldFlash = false;

    if (hp <= 10) {
      // Red with flashing for very low health
      barColor = "#ff1744";
      shadowColor = "#d32f2f";
      shouldFlash = true;
    } else if (hp <= 20) {
      // Orange for low health
      barColor = "#ff9800";
      shadowColor = "#f57c00";
    }

    // Apply flashing effect for very low health
    if (shouldFlash) {
      const flashIntensity = Math.sin(Date.now() / 150) * 0.3 + 0.7; // Flash between 0.4 and 1.0
      this.ctx.globalAlpha = flashIntensity;
    }

    this.ctx.save();
    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = 16;
    this.ctx.fillStyle = barColor;
    this.ctx.fillRect(x, y, (w * Math.max(0, hp)) / maxHp, h);
    this.ctx.restore();

    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(x, y, w, h);
    this.ctx.fillStyle = barColor;
    this.ctx.fillRect(x, y, (w * Math.max(0, hp)) / maxHp, h);
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, w, h);

    // Reset alpha for text
    if (shouldFlash) {
      this.ctx.globalAlpha = 1;
    }

    this.ctx.font = `${h * 1.5}px sans-serif`;
    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      `${Math.max(0, Math.round(hp))}/${maxHp}`,
      x + w + 8,
      y + h / 2
    );
    this.ctx.restore();
  }

  drawFloatingDamages(floatingDamages) {
    floatingDamages.forEach((fd) => {
      this.ctx.save();
      this.ctx.globalAlpha = fd.alpha;
      this.ctx.font = `bold ${
        fd.size || 28
      }px 'Press Start 2P', monospace, sans-serif`;
      this.ctx.fillStyle = fd.color || "#ff5252";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.shadowColor = "#000";
      this.ctx.shadowBlur = 8;
      this.ctx.lineWidth = 6;

      if (fd.label) {
        this.ctx.font = `bold ${Math.round(
          (fd.size || 28) * 0.7
        )}px 'Press Start 2P', monospace, sans-serif`;
        this.ctx.strokeText(fd.label, fd.x, fd.y - 24);
        this.ctx.fillText(fd.label, fd.x, fd.y - 24);
        this.ctx.font = `bold ${
          fd.size || 28
        }px 'Press Start 2P', monospace, sans-serif`;
      }

      this.ctx.strokeText(fd.text, fd.x, fd.y);
      this.ctx.fillText(fd.text, fd.x, fd.y);
      this.ctx.restore();
    });
  }

  drawWinScreen(players, animationManager) {
    // Dim background
    this.ctx.save();
    this.ctx.globalAlpha = 0.7;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
    this.ctx.restore();

    // Fireworks
    this.drawFireworks(animationManager.fireworks);

    // YOU WIN heading
    this.ctx.save();
    this.ctx.font = 'bold 64px "Press Start 2P", monospace, sans-serif';
    this.ctx.fillStyle = "#ffeb3b";
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 10;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.shadowColor = "#fff";
    this.ctx.shadowBlur = 16;
    this.ctx.strokeText(
      "YOU WIN!",
      this.canvas.width / 2,
      this.canvas.height * 0.18
    );
    this.ctx.fillText(
      "YOU WIN!",
      this.canvas.width / 2,
      this.canvas.height * 0.18
    );
    this.ctx.restore();

    // Draw winning characters
    this.drawWinningCharacters(players);
  }

  drawFireworks(fireworks) {
    fireworks.forEach((fw) => {
      fw.particles.forEach((p) => {
        if (p.alpha > 0) {
          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 3.2, 0, 2 * Math.PI);
          this.ctx.fillStyle = p.color;
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 12;
          this.ctx.fill();
          this.ctx.restore();
        }
      });
    });
  }

  drawWinningCharacters(players) {
    const midY = this.canvas.height * 0.48;
    const spacing = this.canvas.width / 8;
    const startX = this.canvas.width / 2 - 1.5 * spacing;

    for (let i = 0; i < 4; i++) {
      const p = players[i];
      if (p.spriteFile) {
        let img = p._spriteImg;
        if (!img) {
          img = new window.Image();
          img.src = p.spriteFile;
          p._spriteImg = img;
        }

        let drawW = 140,
          drawH = 140;
        if (img.naturalWidth && img.naturalHeight) {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (aspect > 1) {
            drawH = 140 / aspect;
          } else {
            drawW = 140 * aspect;
          }
        }

        this.ctx.save();
        if (!p.alive) {
          this.ctx.globalAlpha = 0.35;
          this.ctx.filter = "grayscale(1)";
        }

        this.ctx.drawImage(
          img,
          startX + i * spacing - drawW / 2,
          midY - drawH / 2,
          drawW,
          drawH
        );

        if (!p.alive) {
          this.ctx.globalAlpha = 1;
          this.ctx.filter = "none";
          this.ctx.save();
          this.ctx.font = 'bold 32px "Press Start 2P", monospace, sans-serif';
          this.ctx.fillStyle = "#ff5252";
          this.ctx.strokeStyle = "#000";
          this.ctx.lineWidth = 6;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.strokeText("DEAD", startX + i * spacing, midY);
          this.ctx.fillText("DEAD", startX + i * spacing, midY);
          this.ctx.restore();
        }

        this.ctx.restore();

        // Player name
        this.ctx.save();
        this.ctx.font = 'bold 20px "Press Start 2P", monospace, sans-serif';
        this.ctx.fillStyle = "#fff";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.shadowColor = "#000";
        this.ctx.shadowBlur = 6;
        this.ctx.fillText(
          p.name || `P${i + 1}`,
          startX + i * spacing,
          midY + 80
        );
        this.ctx.restore();
      }
    }
  }

  drawDeathScreen(players) {
    // Hide turn indicator
    const turnIndicatorElem = document.getElementById("turn-indicator");
    if (turnIndicatorElem) turnIndicatorElem.style.display = "none";

    // Dim background
    this.ctx.save();
    this.ctx.globalAlpha = 0.7;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
    this.ctx.restore();

    // NO FIREWORKS for death screen

    // YOU LOSE heading
    this.ctx.save();
    this.ctx.font = 'bold 64px "Press Start 2P", monospace, sans-serif';
    this.ctx.fillStyle = "#ff5252";
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 10;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.shadowColor = "#000";
    this.ctx.shadowBlur = 16;
    this.ctx.strokeText(
      "YOU LOSE!",
      this.canvas.width / 2,
      this.canvas.height * 0.18
    );
    this.ctx.fillText(
      "YOU LOSE!",
      this.canvas.width / 2,
      this.canvas.height * 0.18
    );
    this.ctx.restore();

    // Draw defeated characters
    this.drawDefeatedCharacters(players);

    // Add Return to Main Menu and Restart buttons as HTML elements styled with 'snes-btn'
    let btnY = this.canvas.height / 2 + 180;
    let btnW = 320,
      btnH = 54;
    // Only add buttons if not already present
    let gameContainer = document.getElementById("game-container");
    let mainMenuBtn = document.getElementById("death-main-menu-btn");
    let restartBtn = document.getElementById("death-restart-btn");
    if (!mainMenuBtn) {
      mainMenuBtn = document.createElement("button");
      mainMenuBtn.id = "death-main-menu-btn";
      mainMenuBtn.className = "snes-btn";
      mainMenuBtn.textContent = "Return to Main Menu";
      mainMenuBtn.style.position = "absolute";
      mainMenuBtn.style.left = `calc(50% - ${btnW / 2}px)`;
      mainMenuBtn.style.top = `${btnY}px`;
      mainMenuBtn.style.width = `${btnW}px`;
      mainMenuBtn.style.height = `${btnH}px`;
      mainMenuBtn.style.zIndex = 5002;
      mainMenuBtn.onclick = function () {
        if (window.gameController) {
          window.gameController.returnToMainMenu();
        }
      };
      gameContainer.appendChild(mainMenuBtn);
    }
    if (!restartBtn) {
      restartBtn = document.createElement("button");
      restartBtn.id = "death-restart-btn";
      restartBtn.className = "snes-btn";
      restartBtn.textContent = "Restart Game";
      restartBtn.style.position = "absolute";
      restartBtn.style.left = `calc(50% - ${btnW / 2}px)`;
      restartBtn.style.top = `${btnY + btnH + 20}px`;
      restartBtn.style.width = `${btnW}px`;
      restartBtn.style.height = `${btnH}px`;
      restartBtn.style.zIndex = 5002;
      restartBtn.onclick = function () {
        if (window.gameController) {
          window.gameController.animationManager.showDeathScreen = false;
          window.gameController.startFight();
        }
      };
      gameContainer.appendChild(restartBtn);
    }
  }

  drawDefeatedCharacters(players) {
    const midY = this.canvas.height * 0.48;
    const spacing = this.canvas.width / 8;
    const startX = this.canvas.width / 2 - 1.5 * spacing;

    for (let i = 0; i < 4; i++) {
      const p = players[i];
      if (p.spriteFile) {
        let img = p._spriteImg;
        if (!img) {
          img = new window.Image();
          img.src = p.spriteFile;
          p._spriteImg = img;
        }

        let drawW = 140,
          drawH = 140;
        if (img.naturalWidth && img.naturalHeight) {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (aspect > 1) {
            drawH = 140 / aspect;
          } else {
            drawW = 140 * aspect;
          }
        }

        // Apply defeated effect - dim and desaturate
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.filter = "grayscale(0.8) brightness(0.6)";

        this.ctx.drawImage(
          img,
          startX + i * spacing - drawW / 2,
          midY - drawH / 2,
          drawW,
          drawH
        );

        this.ctx.restore();

        // Player name (dimmed)
        this.ctx.save();
        this.ctx.font = 'bold 20px "Press Start 2P", monospace, sans-serif';
        this.ctx.fillStyle = "#888";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.shadowColor = "#000";
        this.ctx.shadowBlur = 6;
        this.ctx.fillText(
          p.name || `P${i + 1}`,
          startX + i * spacing,
          midY + 80
        );
        this.ctx.restore();
      }
    }
  }
}

class GameController {
  constructor() {
    // Initialize services
    this.audioManager = new AudioManager();
    this.saveLoadManager = new SaveLoadManager();
    this.specialAttackService = new SpecialAttackService(this.audioManager);
    this.animationManager = new AnimationManager();
    this.cloudManager = new CloudManager();
    this.floatingDamageManager = new FloatingDamageManager();

    // Initialize UI
    this.characterSelectUI = new CharacterSelectUI(this.audioManager);
    this.gameUI = new GameUI(this.audioManager, this.saveLoadManager);
    this.titleScreenUI = new TitleScreenUI(this.audioManager);

    // Initialize renderer
    this.renderer = new Renderer();

    // Game state
    this.players = [new Player(0), new Player(1), new Player(2), new Player(3)];
    this.bowser = new Bowser();
    this.currentPlayer = 0;
    this.gameState = "player"; // 'player', 'bowser', 'gameover'
    this.playersThisRound = [];

    // Animation state
    this.player1Frame = 0;
    this.bowserFrame = 0;

    // Make controller globally accessible
    window.gameController = this;
    window.gameUI = this.gameUI;

    this.setupEventListeners();
    this.start();
  }

  setupEventListeners() {
    // Start fight button
    const startFightBtn = document.getElementById("start-fight");
    if (startFightBtn) {
      startFightBtn.addEventListener("click", () => {
        this.startFight();
      });
    }

    // Load save button for character select
    const loadSaveSelectBtn = document.getElementById("load-save-select");
    if (loadSaveSelectBtn) {
      loadSaveSelectBtn.addEventListener("click", () => {
        this.gameUI.openModal("load");
      });
    }

    // Wrong SFX for disabled buttons
    if (!window._wrongSFXHandlerAttached) {
      document.addEventListener(
        "click",
        (e) => {
          if (e.target instanceof HTMLButtonElement && e.target.disabled) {
            this.audioManager.playSFX("wrong", 0.7);
          }
        },
        true
      );
      window._wrongSFXHandlerAttached = true;
    }
  }

  start() {
    this.titleScreenUI.start();
  }

  showCharacterSelect() {
    this.characterSelectUI.showCharacterSelect();
  }

  startFight() {
    const selectedChars = this.characterSelectUI.getSelectedCharacters();

    // Set up players with selected sprites and names
    for (let i = 0; i < 4; i++) {
      this.players[i].spriteFile = "sprites/" + selectedChars.sprites[i].file;
      this.players[i].name = selectedChars.names[i];
      this.players[i].reset();
    }

    this.bowser.reset();
    this.currentPlayer = 0;
    this.gameState = "player";
    this.playersThisRound = [];
    this.animationManager.reset();
    this.floatingDamageManager.clear();

    this.updateTurnIndicator();
    this.gameUI.showGameContainer();
    this.audioManager.playGameMusic();
    this.gameUI.setAttackButtonEnabled(true);

    this.renderer.draw(
      this.getGameState(),
      this.animationManager,
      this.cloudManager,
      this.floatingDamageManager
    );
    this.startGameLoop();
  }

  handlePlayerAttack() {
    if (this.gameState !== "player" || !this.players[this.currentPlayer].alive)
      return;

    this.gameUI.setAttackButtonEnabled(false);
    this.audioManager.playSFX("playerAttack", 0.5);

    // Simple attack logic
    const damage = Math.floor(Math.random() * 6) + 1;
    this.bowser.takeDamage(damage);
    this.audioManager.playSFX("bossHit", 0.5);

    const positions = this.renderer.getCenteredPositions();
    this.floatingDamageManager.showFloatingDamage(
      positions.bowser.x,
      positions.bowser.y - 70,
      "-" + damage
    );

    setTimeout(() => {
      if (this.bowser.hp <= 0) {
        this.handleBossDefeat();
      } else {
        this.playersThisRound.push(this.currentPlayer);
        this.updateSpecialAttackButton();

        const alivePlayers = this.players
          .map((p, i) => (p.alive ? i : null))
          .filter((i) => i !== null);

        if (this.playersThisRound.length >= alivePlayers.length) {
          this.gameState = "bowser";
          setTimeout(() => this.bowserAttack(), 800);
        } else {
          this.nextPlayer();
          this.updateTurnIndicator();
          this.gameUI.setAttackButtonEnabled(true);
        }
      }
    }, 400);
  }

  handleSpecialAttack() {
    if (this.gameState !== "player" || !this.players[this.currentPlayer].alive)
      return;
    if (!this.players[this.currentPlayer].specialReady) return;

    this.gameUI.setSpecialAttackButtonEnabled(false);
    const positions = this.renderer.getCenteredPositions();

    this.specialAttackService.doSpecialAttack(
      this.players[this.currentPlayer],
      this.bowser,
      positions,
      this
    );

    setTimeout(() => {
      if (this.bowser.hp <= 0) {
        this.handleBossDefeat();
      } else {
        this.playersThisRound.push(this.currentPlayer);
        this.updateSpecialAttackButton();

        const alivePlayers = this.players
          .map((p, i) => (p.alive ? i : null))
          .filter((i) => i !== null);

        if (this.playersThisRound.length >= alivePlayers.length) {
          this.gameState = "bowser";
          setTimeout(() => this.bowserAttack(), 800);
        } else {
          this.nextPlayer();
          this.updateTurnIndicator();
          this.gameUI.setAttackButtonEnabled(true);
        }
      }
    }, 400);
  }

  bowserAttack() {
    // Add special charge to all players
    this.players.forEach((player) => {
      player.addSpecialCharge();
    });
    this.updateSpecialAttackButton();

    this.updateTurnIndicator();

    let targets = this.players
      .map((p, i) => (p.alive ? i : null))
      .filter((i) => i !== null);
    let numAttacks = Math.min(2, targets.length);
    let chosen = [];

    while (chosen.length < numAttacks) {
      let idx = targets[Math.floor(Math.random() * targets.length)];
      if (!chosen.includes(idx)) chosen.push(idx);
    }

    this.audioManager.playSFX("bowserAttack", 0.6);

    setTimeout(() => {
      const positions = this.renderer.getCenteredPositions();

      chosen.forEach((i) => {
        let damage = Math.floor(Math.random() * 8) + 2;
        this.players[i].takeDamage(damage);
        this.audioManager.playSFX("playerHit", 0.5);
        this.floatingDamageManager.showFloatingDamage(
          positions.players[i].x,
          positions.players[i].y - 50,
          "-" + damage,
          "#ffb300"
        );

        if (!this.players[i].alive) {
          this.audioManager.playSFX("playerDeath", 0.7);
        }
      });

      setTimeout(() => {
        if (this.players.every((p) => !p.alive)) {
          this.handlePlayerDefeat();
        } else {
          this.playersThisRound = [];
          this.currentPlayer = this.players.findIndex((p) => p.alive);
          this.gameState = "player";
          this.updateTurnIndicator();
          this.gameUI.setAttackButtonEnabled(true);
          this.updateSpecialAttackButton();
        }
      }, 400);
    }, 500);
  }

  handleBossDefeat() {
    this.bowser.hp = 0;
    this.gameState = "gameover";
    this.gameUI.updateTurnIndicator(
      this.gameState,
      this.currentPlayer,
      this.players
    );
    this.gameUI.setAttackButtonEnabled(false);
    this.gameUI.setSpecialAttackButtonEnabled(false);

    // Start boss death animation
    this.animationManager.bowserDeathAnim = true;
    this.animationManager.bowserDeathFrame = 0;
    this.animationManager.bowserDeathFrameTimer = 0;
    this.animationManager.bowserDeathY = 0;
    this.animationManager.bowserDeathDone = false;

    this.audioManager.playSFX("bowserDeath", 0.7);
    this.audioManager.stopAllMusic();
  }

  handlePlayerDefeat() {
    this.gameState = "gameover";
    this.gameUI.updateTurnIndicator(
      this.gameState,
      this.currentPlayer,
      this.players
    );
    this.gameUI.setAttackButtonEnabled(false);
    this.gameUI.setSpecialAttackButtonEnabled(false);
    this.audioManager.stopAllMusic();
    // Show death screen
    this.animationManager.showDeathScreen = true;
    this.animationManager.deathScreenTimer = 0;
    this.audioManager.playSFX("gameOver", 0.8);
    // Hide the UI when players lose
    const ui = document.getElementById("ui");
    if (ui) ui.style.display = "none";
  }

  nextPlayer() {
    do {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    } while (!this.players[this.currentPlayer].alive);
  }

  updateTurnIndicator() {
    this.gameUI.updateTurnIndicator(
      this.gameState,
      this.currentPlayer,
      this.players
    );
  }

  updateSpecialAttackButton() {
    this.gameUI.updateSpecialAttackBtn(
      this.currentPlayer,
      this.players,
      this.gameState
    );
  }

  triggerScreenShake() {
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    gameContainer.classList.remove("screen-shake");
    void gameContainer.offsetWidth;
    gameContainer.classList.add("screen-shake");

    setTimeout(() => {
      gameContainer.classList.remove("screen-shake");
    }, 400);
  }

  startGameLoop() {
    const gameLoop = () => {
      if (this.audioManager.isGamePaused) return;

      this.floatingDamageManager.updateFloatingDamages();
      this.cloudManager.updateClouds();

      // Update health bars
      this.bowser.updateHealthBar();
      this.bowser.updateBarShake();
      this.players.forEach((p) => {
        p.updateHealthBar();
        p.updateBarShake();
      });

      // Update animations
      this.animationManager.updatePlayer1Animation();
      this.animationManager.updateBossAnimation();

      // Update fireworks if win screen is showing
      if (this.animationManager.showWinScreen) {
        this.animationManager.updateFireworks();
        this.animationManager.winScreenTimer++;
      }
      if (this.animationManager.showDeathScreen) {
        this.animationManager.deathScreenTimer++;
      }

      this.renderer.draw(
        this.getGameState(),
        this.animationManager,
        this.cloudManager,
        this.floatingDamageManager
      );

      // Check for win screen trigger
      if (
        this.animationManager.bowserDeathAnim &&
        !this.animationManager.showWinScreen &&
        this.animationManager.bowserDeathY > 200
      ) {
        this.animationManager.showWinScreen = true;
        this.animationManager.winScreenTimer = 0;
        this.animationManager.fireworks = [];
        this.audioManager.playSFX("bowserExplode", 0.7);
        setTimeout(() => this.audioManager.playSFX("win", 0.7), 1200);
        this.audioManager.playSFX("bowserDefeat", 0.8);
        this.audioManager.stopAllMusic();

        // Hide the UI when bowser dies
        const ui = document.getElementById("ui");
        if (ui) ui.style.display = "none";

        // Hide player sprites and health bars
        if (this.renderer.canvas)
          this.renderer.canvas.classList.add("hide-players");
      }

      requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }

  getGameState() {
    return {
      players: this.players,
      bowser: this.bowser,
      currentPlayer: this.currentPlayer,
      gameState: this.gameState,
      playersThisRound: this.playersThisRound,
    };
  }

  saveGame(saveName) {
    this.saveLoadManager.saveGameState(saveName, this.getGameState());
  }

  loadGame(saveName) {
    const success = this.saveLoadManager.loadGameState(
      saveName,
      this.getGameState()
    );
    if (success) {
      this.updateTurnIndicator();
      // Enable attack buttons only if it's a player's turn and current player is alive
      this.gameUI.setAttackButtonEnabled(
        this.gameState === "player" && this.players[this.currentPlayer].alive
      );
      this.renderer.draw(
        this.getGameState(),
        this.animationManager,
        this.cloudManager,
        this.floatingDamageManager
      );

      // If character select is visible, switch to fight screen
      const charSel = document.getElementById("character-select-screen");
      if (charSel && charSel.style.display !== "none") {
        this.gameUI.showGameContainer();
        this.audioManager.playGameMusic();
      }
    }
  }

  returnToMainMenu() {
    // Reset game state
    this.players.forEach((p) => p.reset());
    this.bowser.reset();
    this.currentPlayer = 0;
    this.gameState = "player";
    this.playersThisRound = [];
    this.floatingDamageManager.clear();
    this.animationManager.reset();

    // Remove death screen buttons if present
    let mainMenuBtn = document.getElementById("death-main-menu-btn");
    let restartBtn = document.getElementById("death-restart-btn");
    if (mainMenuBtn) mainMenuBtn.remove();
    if (restartBtn) restartBtn.remove();

    // Show character select
    this.characterSelectUI.reset();
    this.showCharacterSelect();
  }

  // Method to show floating damage (used by SpecialAttackService)
  showFloatingDamage(x, y, text, color = "#ff5252", label = "") {
    this.floatingDamageManager.showFloatingDamage(x, y, text, color, label);
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new GameController();
});
