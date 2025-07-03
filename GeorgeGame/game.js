// Sprite color mapping (used throughout character select)
const spriteColors = {
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
  "Sidekick_Toad.png": "rgb(180,180,200)",
};

let sfxVolume = 0.7;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const mainRegularBtn = document.getElementById("main-regular-btn");
const mainSpecialBtn = document.getElementById("main-special-btn");
const sidekickRegularBtn = document.getElementById("sidekick-regular-btn");
const sidekickSpecialBtn = document.getElementById("sidekick-special-btn");
const executeAttacksBtn = document.getElementById("execute-attacks-btn");
const turnIndicator = document.getElementById("turn-indicator");

const PLAYER_COLORS = ["#4fc3f7", "#81c784", "#ffd54f", "#e57373"];
const BOWSER_COLOR = "#b39ddb";
const BOWSER_POSITION = { x: 400, y: 420 };

const PLAYER_MAX_HP = 30;
const BOWSER_MAX_HP = 200;

let players = [
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    mainAttackOffset: { x: 0, y: 0 }, // Individual main character animation
    sidekickAttackOffset: { x: 0, y: 0 }, // Individual sidekick animation
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0, // +1 damage from Toad
    // New attack cycle properties
    mainSpecialCharges: 2, // Can use special attack twice per fight
    sidekickSpecialCharges: 2, // Can use special attack twice per fight
    mainAttackSelected: false, // Whether main character has selected attack type
    sidekickAttackSelected: false, // Whether sidekick has selected attack type
    mainAttackType: null, // 'regular' or 'special'
    sidekickAttackType: null, // 'regular' or 'special'
    mainCharacter: undefined,
    sidekickCharacter: undefined,
    mainSpriteFile: undefined,
    sidekickSpriteFile: undefined,
    spriteFile: undefined,
    name: "",
    _spriteImg: undefined,
    _mainSpriteImg: undefined,
    _sidekickSpriteImg: undefined,
  },
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    mainAttackOffset: { x: 0, y: 0 },
    sidekickAttackOffset: { x: 0, y: 0 },
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0,
    mainSpecialCharges: 2,
    sidekickSpecialCharges: 2,
    mainAttackSelected: false,
    sidekickAttackSelected: false,
    mainAttackType: null,
    sidekickAttackType: null,
    mainCharacter: undefined,
    sidekickCharacter: undefined,
    mainSpriteFile: undefined,
    sidekickSpriteFile: undefined,
    spriteFile: undefined,
    name: "",
    _spriteImg: undefined,
    _mainSpriteImg: undefined,
    _sidekickSpriteImg: undefined,
  },
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    mainAttackOffset: { x: 0, y: 0 },
    sidekickAttackOffset: { x: 0, y: 0 },
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0,
    mainSpecialCharges: 2,
    sidekickSpecialCharges: 2,
    mainAttackSelected: false,
    sidekickAttackSelected: false,
    mainAttackType: null,
    sidekickAttackType: null,
  },
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    mainAttackOffset: { x: 0, y: 0 },
    sidekickAttackOffset: { x: 0, y: 0 },
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0,
    mainSpecialCharges: 2,
    sidekickSpecialCharges: 2,
    mainAttackSelected: false,
    sidekickAttackSelected: false,
    mainAttackType: null,
    sidekickAttackType: null,
  },
];
let bowser = {
  hp: BOWSER_MAX_HP,
  displayHp: BOWSER_MAX_HP,
  alive: true,
  anim: 0,
  barShake: 0,
  attackOffset: { x: 0, y: 0 },
  statusEffects: {}, // { burn: { turns: 2 }, freeze: { turns: 1 }, ... }
};

let currentPlayer = 0;
let gameState = "player"; // 'player', 'bowser', 'gameover'
let floatingDamages = [];
let playersThisRound = [];

// Sprite sheet info
const FIREBRO_FRAMES = 20;
const FIREBRO_WIDTH = 48; // px
const FIREBRO_HEIGHT = 48; // px
const BOO_FRAMES = 5;
const BOO_WIDTH = 32;
const BOO_HEIGHT = 32;

// Sprite sheet info for player 1 (goombaAI.png)
const PLAYER1_COLS = 5;
const PLAYER1_ROWS = 2;
const PLAYER1_FRAME_W = 313;
const PLAYER1_FRAME_H = 348;
const PLAYER1_IDLE_FRAMES = 2; // first row
const PLAYER1_ATTACK_FRAMES = 5; // second row

// Load background image
const bgImg = new Image();
bgImg.src = "bowserbackground.png";

// Load bowser bowser image
const bowserBowserImg = new Image();
bowserBowserImg.src = "bowserSprite.png";

// Load bowser attack sheet
const bowserAttackImg = new Image();
bowserAttackImg.src = "bowserAttackSheet.png";

// Sprite sheet info for bowser
const BOWSER_FRAME_W = 626.35;
const BOWSER_FRAME_H = 698.61;
const BOWSER_IDLE_FRAMES = 6;
const BOWSER_IDLE_ROW = 2;
const BOWSER_IDLE_FRAME_DURATIONS = [18, 60, 24, 18, 32, 18];
let bowserIdleFrameTimer = 0;

// Sprite sheet info for attack
const BOWSER_ATTACK_FRAME_W = 791.82;
const BOWSER_ATTACK_FRAME_H = 686;
const BOWSER_ATTACK_FRAMES = 4;

// Animation state
let fireBroFrame = 0;
let fireBroAnimTimer = 0;
let booFrame = 0;
let booAnimTimer = 0;
let bowserFrame = 0;

// Animation state for player 1
let player1Frame = 0;
let player1AnimTimer = 0;
let player1AttackAnim = false;
let player1AttackAnimFrame = 0;

// Damage tracking for each player
let playerDamageDealt = [0, 0, 0, 0];

let bowserAttackAnim = false;
let bowserAttackAnimFrame = 0;
let bowserIdleFrame = 0;

// --- Bowser death animation state (move these up to avoid ReferenceError) ---
let bowserDeathAnim = false;
let bowserDeathFrame = 0;
let bowserDeathFrameTimer = 0;
let bowserDeathY = 0;
let bowserDeathDone = false;

// --- Fireworks and win screen state (move these up to avoid ReferenceError) ---
let fireworks = [];
let showWinScreen = false;
let winScreenTimer = 0;

// --- Special Attack Animation State ---
let specialProjectiles = [];
let specialEffects = [];
let fireballProjectiles = [];
let blizzardProjectiles = [];
let scratchProjectiles = [];
let bombProjectiles = [];
let flyingProjectiles = [];
let giantStompEffects = [];
let basicSpecialProjectiles = [];
let healAuras = [];
let buffAuras = [];

// Music controls
const gameMusic = new Audio("music/bossMusic.mp3");
gameMusic.loop = true;
gameMusic.volume = 0.5;

const menuMusic = new Audio("music/characterSelectMusic.mp3");
menuMusic.loop = true;
menuMusic.volume = 0.5;

document.getElementById("music-volume").addEventListener("input", (e) => {
  gameMusic.volume = parseFloat(e.target.value);
});

// Load cloud image
const cloudImg = new Image();
cloudImg.src = "cloud.png";

let clouds = [];

function spawnCloud() {
  if (clouds.length >= 3) return;
  const y = 20 + Math.random() * 100; // between 20px and 120px from top
  const speed = 0.5 + Math.random() * 0.5; // px per frame
  clouds.push({
    x: -100,
    y,
    speed,
    w: 120,
    h: 60,
  });
}

function updateClouds() {
  // Move clouds
  clouds.forEach((cloud) => {
    cloud.x += cloud.speed;
  });
  // Remove off-screen clouds
  clouds = clouds.filter((cloud) => cloud.x < canvas.width + 100);
  // Randomly spawn new cloud
  if (clouds.length < 3 && Math.random() < 0.01) {
    spawnCloud();
  }
}

function resizeCanvas() {
  // Set max width to 1920px for 1920x1080 support
  const maxWidth = 1920;
  const targetWidth = Math.min(window.innerWidth, maxWidth);
  const targetHeight = window.innerHeight;

  // Set the canvas size to match the target dimensions
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Center the canvas horizontally if it's smaller than the viewport
  if (targetWidth < window.innerWidth) {
    const margin = (window.innerWidth - targetWidth) / 2;
    canvas.style.marginLeft = margin + "px";
  } else {
    canvas.style.marginLeft = "0px";
  }

  draw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function getCenteredPositions() {
  // Calculate background dimensions and position (same logic as in draw function)
  let bgDrawWidth, bgDrawHeight, bgOffsetX, bgOffsetY;

  if (bgImg.complete && bgImg.naturalWidth > 0) {
    const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
    bgDrawHeight = canvas.height;
    bgDrawWidth = canvas.height * imgAspect;
    bgOffsetX = (canvas.width - bgDrawWidth) / 2;
    bgOffsetY = 0;
  } else {
    // Fallback if background not loaded
    bgDrawWidth = canvas.width;
    bgDrawHeight = canvas.height;
    bgOffsetX = 0;
    bgOffsetY = 0;
  }

  // Calculate bowser position relative to background texture
  const bowserX = bgOffsetX + bgDrawWidth / 2; // Center of background
  const bowserY = canvas.height * 0.5; // 60% down from top of screen

  // Calculate UI position
  const uiElement = document.getElementById("ui");
  let uiTop = canvas.height; // Default to bottom if UI not found

  if (uiElement) {
    const uiRect = uiElement.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    uiTop = uiRect.top - canvasRect.top; // UI's top position relative to canvas
  }

  // Position sprites 48px above the UI
  const spriteY = uiTop - 108;

  // Calculate centered player positions
  const totalPlayers = 4;
  const playerSpacing = 333; // Space between each player
  const totalWidth = (totalPlayers - 1) * playerSpacing; // Total width of all players
  const startX = bgOffsetX + bgDrawWidth / 2 - totalWidth / 2; // Start position to center the group relative to background

  const playerPositions = [];
  for (let i = 0; i < totalPlayers; i++) {
    playerPositions.push({
      x: startX + i * playerSpacing,
      y: spriteY,
    });
  }

  return {
    bowser: { x: bowserX, y: bowserY },
    players: playerPositions,
  };
}

// Character select logic
const SPRITES_FOLDER = "sprites/";
const SPRITE_FILES = [
  "Mario_Cape.png",
  "Mario_Cat.png",
  "Mario_Fire.png",
  "Mario_Giant.png",
  "Mario_Penguin.png",
  "Mario_Raccoon.png",
  "Sidekick_DK.png",
  "Sidekick_Luigi.png",
  "Sidekick_Peach.png",
  "Sidekick_Toad.png",
  "Sidekick_Waluigi.png",
  "Sidekick_Wario.png",
];
let selectedSprites = []; // Array of {main: {idx, file}, sidekick: {idx, file}}
let selectedNames = []; // Array of player names

// --- Character Select Menu Button and Modal ---
let charMenuBtn = document.getElementById("char-menu-btn");
if (!charMenuBtn) {
  charMenuBtn = document.createElement("button");
  charMenuBtn.id = "char-menu-btn";
  charMenuBtn.textContent = "Menu";
  charMenuBtn.className = "snes-btn";
  charMenuBtn.style.position = "fixed";
  charMenuBtn.style.top = "24px";
  charMenuBtn.style.left = "24px";
  charMenuBtn.style.zIndex = "5001";
  document.body.appendChild(charMenuBtn);
}
const charMenuModal = document.createElement("div");
charMenuModal.id = "char-menu-modal";
charMenuModal.style.display = "none";
charMenuModal.innerHTML = `
  <div id="menu-modal-content">
    <h2>Menu</h2>
    <div class="modal-section">
      <label for="sfx-volume-slider-select"><b>Sound Effects Volume</b></label><br>
      <input id="sfx-volume-slider-select" type="range" min="0" max="1" step="0.01" value="${sfxVolume}">
    </div>
    <div class="modal-section">
      <label for="music-volume-modal-select"><b>Music Volume</b></label><br>
      <input id="music-volume-modal-select" type="range" min="0" max="1" step="0.01" value="${menuMusic.volume}">
    </div>
    <div class="modal-section">
      <button id="close-menu-modal-select" class="snes-btn">Close</button>
    </div>
  </div>
`;
document.body.appendChild(charMenuModal);
charMenuBtn.onclick = () => {
  playSound(SFX.pause, 0.7);
  menuMusic.pause();
  charMenuModal.style.display = "flex";
  charMenuModal.style.zIndex = "5000";
  pauseGame();
};
const sfxSliderSelect = charMenuModal.querySelector(
  "#sfx-volume-slider-select"
);
if (sfxSliderSelect) {
  sfxSliderSelect.value = sfxVolume;
  sfxSliderSelect.oninput = (e) => {
    sfxVolume = parseFloat(e.target.value);
  };
}
const musicSliderSelect = charMenuModal.querySelector(
  "#music-volume-modal-select"
);
if (musicSliderSelect) {
  musicSliderSelect.value = menuMusic.volume;
  musicSliderSelect.oninput = (e) => {
    menuMusic.volume = parseFloat(e.target.value);
    const mainVol = document.getElementById("music-volume");
    if (mainVol) mainVol.value = e.target.value;
  };
}
const closeMenuBtnSelect = charMenuModal.querySelector(
  "#close-menu-modal-select"
);
if (closeMenuBtnSelect)
  closeMenuBtnSelect.onclick = () => {
    charMenuModal.style.display = "none";
    menuMusic.play().catch((error) => {
      console.log("Menu music playback failed:", error.message);
    });
    resumeGame();
  };
// Only show charMenuBtn and charMenuModal on character select
function setCharMenuVisibility(visible) {
  charMenuBtn.style.display = visible ? "" : "none";
  charMenuModal.style.display = "none";
  if (fightMenuBtn) fightMenuBtn.style.display = "none";
  // Hide return to main menu button on character select
  const returnMainMenuBtn = document.getElementById("return-main-menu");
  if (returnMainMenuBtn)
    returnMainMenuBtn.style.display = visible ? "none" : "";
}
// --- Fight Screen Menu Button and Modal ---
let fightMenuBtn = document.getElementById("fight-menu-btn");
if (!fightMenuBtn) {
  fightMenuBtn = document.createElement("button");
  fightMenuBtn.id = "fight-menu-btn";
  fightMenuBtn.textContent = "Menu";
  fightMenuBtn.className = "snes-btn";
  fightMenuBtn.style.position = "fixed";
  fightMenuBtn.style.top = "24px";
  fightMenuBtn.style.left = "24px";
  fightMenuBtn.style.zIndex = "5001";
  document.body.appendChild(fightMenuBtn);
}
const fightMenuModal = document.createElement("div");
fightMenuModal.id = "fight-menu-modal";
fightMenuModal.style.display = "none";
fightMenuModal.innerHTML = `
  <div id="menu-modal-content">
    <h2>Menu</h2>
    <div class="modal-section">
      <button id="save-game-modal" class="snes-btn">Save</button>
      <button id="load-game-modal" class="snes-btn">Load</button>
      <button id="restart-game-modal" class="snes-btn">Restart</button>
      <button id="return-main-menu-modal" class="snes-btn">Return to Main Menu</button>
    </div>
    <div class="modal-section">
      <label for="sfx-volume-slider"><b>Sound Effects Volume</b></label><br>
      <input id="sfx-volume-slider" type="range" min="0" max="1" step="0.01" value="${sfxVolume}">
    </div>
    <div class="modal-section">
      <label for="music-volume-modal"><b>Music Volume</b></label><br>
      <input id="music-volume-modal" type="range" min="0" max="1" step="0.01" value="${gameMusic.volume}">
    </div>
    <div class="modal-section">
      <button id="close-menu-modal" class="snes-btn">Close</button>
    </div>
  </div>
`;
document.body.appendChild(fightMenuModal);
fightMenuBtn.onclick = () => {
  playSound(SFX.pause, 0.7);
  gameMusic.pause();
  fightMenuModal.style.display = "flex";
  fightMenuModal.style.zIndex = "5000";
  pauseGame();
};
const sfxSlider = fightMenuModal.querySelector("#sfx-volume-slider");
if (sfxSlider) {
  sfxSlider.value = sfxVolume;
  sfxSlider.oninput = (e) => {
    sfxVolume = parseFloat(e.target.value);
  };
}
const musicSlider = fightMenuModal.querySelector("#music-volume-modal");
if (musicSlider) {
  musicSlider.value = gameMusic.volume;
  musicSlider.oninput = (e) => {
    gameMusic.volume = parseFloat(e.target.value);
    const mainVol = document.getElementById("music-volume");
    if (mainVol) mainVol.value = e.target.value;
  };
}
const closeMenuBtn = fightMenuModal.querySelector("#close-menu-modal");
if (closeMenuBtn)
  closeMenuBtn.onclick = () => {
    fightMenuModal.style.display = "none";
    document.getElementById("ui").style.display = "";
    gameMusic.play().catch((error) => {
      console.log("Music playback failed:", error.message);
    });
    resumeGame();
  };
fightMenuModal.querySelector("#save-game-modal").onclick = () => {
  fightMenuModal.style.display = "none";
  document.getElementById("ui").style.display = "";
  gameMusic.play().catch((error) => {
    console.log("Music playback failed:", error.message);
  });
  resumeGame();
  openModal("save");
};
fightMenuModal.querySelector("#load-game-modal").onclick = () => {
  fightMenuModal.style.display = "none";
  document.getElementById("ui").style.display = "";
  openModal("load");
};
fightMenuModal.querySelector("#restart-game-modal").onclick = () => {
  fightMenuModal.style.display = "none";
  document.getElementById("ui").style.display = "";
  restartGame();
};
fightMenuModal.querySelector("#return-main-menu-modal").onclick = () => {
  fightMenuModal.style.display = "none";
  document.getElementById("ui").style.display = "";
  document.getElementById("confirm-modal").style.display = "flex";
};
function setFightMenuVisibility(visible) {
  fightMenuBtn.style.display = visible ? "" : "none";
  fightMenuModal.style.display = "none";
  if (charMenuBtn) charMenuBtn.style.display = "none";
  // Show return to main menu button only on fight screen
  const returnMainMenuBtn = document.getElementById("return-main-menu");
  if (returnMainMenuBtn)
    returnMainMenuBtn.style.display = visible ? "" : "none";
  charMenuModal.style.display = "none";
}

function showCharacterSelect() {
  document.getElementById("character-select-screen").style.display = "flex";
  document.getElementById("game-container").style.display = "none";

  // Start character select video
  if (window.characterSelectVideoControl) {
    window.characterSelectVideoControl.start();
  }

  // Clear all selected characters when returning to character menu
  selectedSprites = [];
  selectedNames = [];

  // Reset all animations and game state
  resetAllAnimations();

  // Clear and set up the grid
  const grid = document.getElementById("sprite-grid");
  grid.innerHTML = "";

  // Create container for both grids
  const gridsContainer = document.createElement("div");
  gridsContainer.className = "character-grids-container";

  // --- Main Characters Grid ---
  const mainGridWrapper = document.createElement("div");
  mainGridWrapper.className = "character-grid-wrapper main-characters";
  const mainHeader = document.createElement("h3");
  mainHeader.textContent = "Main Characters";
  mainHeader.className = "character-grid-header main-header";
  mainGridWrapper.appendChild(mainHeader);
  const mainGrid = document.createElement("div");
  mainGrid.className = "character-grid main-grid";
  // Add main characters (first 6 sprites)
  const mainCharacters = SPRITE_FILES.slice(0, 6);
  mainCharacters.forEach((file, idx) => {
    const div = document.createElement("div");
    div.className = "sprite-option main-character";
    div.dataset.idx = idx;
    div.dataset.type = "main";
    div.dataset.file = file;
    if (spriteColors[file]) {
      div.style.background = spriteColors[file];
    } else {
      div.style.background = "#4b367c";
    }
    const img = document.createElement("img");
    img.src = SPRITES_FOLDER + file;
    img.alt = file;
    // Remove fixed dimensions to let CSS handle aspect ratio
    div.appendChild(img);
    // Remove the 'MAIN' label
    const label = document.createElement("div");
    label.className = "sprite-label";
    label.textContent = file.replace(/\.[^.]+$/, "").replace(/_/g, " ");
    div.appendChild(label);
    div.onclick = () => {
      playSound(SFX.select, 0.5);
      toggleSelectSprite(idx, file, "main");
    };
    mainGrid.appendChild(div);
  });
  mainGridWrapper.appendChild(mainGrid);

  // --- Sidekicks Grid ---
  const sidekickGridWrapper = document.createElement("div");
  sidekickGridWrapper.className = "character-grid-wrapper sidekick-characters";
  const sidekickHeader = document.createElement("h3");
  sidekickHeader.textContent = "Sidekicks";
  sidekickHeader.className = "character-grid-header sidekick-header";
  sidekickGridWrapper.appendChild(sidekickHeader);
  const sidekickGrid = document.createElement("div");
  sidekickGrid.className = "character-grid sidekick-grid";
  // Add sidekicks (last 6 sprites)
  const sidekicks = SPRITE_FILES.slice(6);
  sidekicks.forEach((file, idx) => {
    const div = document.createElement("div");
    div.className = "sprite-option sidekick";
    div.dataset.idx = idx + 6;
    div.dataset.type = "sidekick";
    div.dataset.file = file;
    if (spriteColors[file]) {
      div.style.background = spriteColors[file];
    } else {
      div.style.background = "#4b367c";
    }
    const img = document.createElement("img");
    img.src = SPRITES_FOLDER + file;
    img.alt = file;
    // Remove fixed dimensions to let CSS handle aspect ratio
    div.appendChild(img);
    // Remove the 'SIDEKICK' label
    const label = document.createElement("div");
    label.className = "sprite-label";
    label.textContent = file.replace(/\.[^.]+$/, "").replace(/_/g, " ");
    div.appendChild(label);
    div.onclick = () => {
      playSound(SFX.select, 0.5);
      toggleSelectSprite(idx + 6, file, "sidekick");
    };
    sidekickGrid.appendChild(div);
  });
  sidekickGridWrapper.appendChild(sidekickGrid);

  // Add both grids to the container
  gridsContainer.appendChild(mainGridWrapper);
  gridsContainer.appendChild(sidekickGridWrapper);
  grid.appendChild(gridsContainer);

  updateSelectedCharacters();

  // Pause fight music, play menu music when entering character select
  gameMusic.pause();
  menuMusic.currentTime = 0;
  menuMusic.play().catch((error) => {
    console.log("Menu music playback failed:", error.message);
  });
  charMenuBtn.style.display = "";
}

// Add debounce mechanism to prevent rapid clicking issues
let lastClickTime = 0;
const CLICK_DEBOUNCE = 100; // 100ms debounce

function cleanupSelectedArrays() {
  // Always keep arrays at length 4, filling with nulls if needed
  for (let i = 0; i < 4; i++) {
    if (typeof selectedSprites[i] === "undefined") selectedSprites[i] = null;
    if (typeof selectedNames[i] === "undefined") selectedNames[i] = "";
  }
  // Remove any extras
  selectedSprites.length = 4;
  selectedNames.length = 4;
}

function toggleSelectSprite(idx, file, type) {
  // Debounce rapid clicks
  const now = Date.now();
  if (now - lastClickTime < CLICK_DEBOUNCE) {
    return;
  }
  lastClickTime = now;

  // Clean up arrays first to ensure no gaps
  cleanupSelectedArrays();

  // Check if this character is already selected
  let alreadySelected = -1;

  // Find if this character is already selected as the same type
  alreadySelected = selectedSprites.findIndex((s) => {
    if (!s) return false; // Skip undefined entries

    // Check if this specific character is selected as the same type
    if (type === "main" && s.main && s.main.idx === idx) return true;
    if (type === "sidekick" && s.sidekick && s.sidekick.idx === idx)
      return true;
    if (type === s.type && s.idx === idx) return true; // Old format

    return false;
  });

  if (alreadySelected !== -1) {
    // Deselect - remove the specific character
    playSound(SFX.clank1, 0.7);
    const playerData = selectedSprites[alreadySelected];

    if (playerData && (playerData.main || playerData.sidekick)) {
      // New format - remove only the specific character type
      if (type === "main") {
        if (playerData.sidekick && playerData.sidekick.file) {
          selectedSprites[alreadySelected] = { sidekick: playerData.sidekick };
        } else {
          // No valid sidekick, set slot to null
          selectedSprites[alreadySelected] = null;
          selectedNames[alreadySelected] = "";
        }
      } else if (type === "sidekick") {
        if (playerData.main && playerData.main.file) {
          selectedSprites[alreadySelected] = { main: playerData.main };
        } else {
          // No valid main, set slot to null
          selectedSprites[alreadySelected] = null;
          selectedNames[alreadySelected] = "";
        }
      }
      cleanupSelectedArrays();
    } else if (playerData && playerData.idx === idx) {
      // Old format with type property - set slot to null
      selectedSprites[alreadySelected] = null;
      selectedNames[alreadySelected] = "";
      cleanupSelectedArrays();
    }
  } else {
    // Find the appropriate player slot
    let playerIndex = -1;

    // First, try to find a player that already has a character of the opposite type
    for (let i = 0; i < 4; i++) {
      const playerData = selectedSprites[i];
      if (playerData) {
        const hasMain = !!(playerData.main || playerData.type === "main");
        const hasSidekick = !!(
          playerData.sidekick || playerData.type === "sidekick"
        );
        if (type === "main" && !hasMain) {
          playerIndex = i;
          break;
        } else if (type === "sidekick" && !hasSidekick) {
          playerIndex = i;
          break;
        }
      }
    }

    // If no existing player slot found, find the first available slot (null)
    if (playerIndex === -1) {
      for (let i = 0; i < 4; i++) {
        if (!selectedSprites[i]) {
          playerIndex = i;
          break;
        }
      }
    }

    if (playerIndex !== -1 && playerIndex < 4) {
      const existingPlayer = selectedSprites[playerIndex];
      if (!existingPlayer) {
        // First character for this player
        selectedSprites[playerIndex] = { idx, file, type };
        selectedNames[playerIndex] = "";
      } else if (existingPlayer.main || existingPlayer.sidekick) {
        // Existing player is in new format - add to the appropriate slot
        if (type === "main") {
          selectedSprites[playerIndex] = {
            main: { idx, file },
            sidekick: existingPlayer.sidekick || null,
          };
        } else if (type === "sidekick") {
          selectedSprites[playerIndex] = {
            main: existingPlayer.main || null,
            sidekick: { idx, file },
          };
        }
        selectedNames[playerIndex] = selectedNames[playerIndex] || "";
      } else if (existingPlayer.type !== type) {
        // Different type, can add as pair (old format)
        selectedSprites[playerIndex] = {
          main:
            type === "main"
              ? { idx, file }
              : { idx: existingPlayer.idx, file: existingPlayer.file },
          sidekick:
            type === "sidekick"
              ? { idx, file }
              : { idx: existingPlayer.idx, file: existingPlayer.file },
        };
        selectedNames[playerIndex] = selectedNames[playerIndex] || "";
      } else {
        // Same type, replace the existing one
        if (type === "main") {
          selectedSprites[playerIndex].main = { idx, file };
        } else {
          selectedSprites[playerIndex].sidekick = { idx, file };
        }
      }
    } else {
      // All 4 players selected, and user clicked a new character
      playSound(SFX.clank2, 0.7);
      // No change
    }
  }

  updateSelectedCharacters();
}

function updateSelectedCharacters() {
  const container = document.getElementById("selected-characters");
  container.innerHTML = "";

  // Sprite color mapping
  const spriteColors = {
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
    "Sidekick_Toad.png": "rgb(180,180,200)",
  };

  // Find the first empty main and sidekick slots
  let nextMainSlotIndex = -1;
  let nextSidekickSlotIndex = -1;
  for (let i = 0; i < 4; i++) {
    const playerData = selectedSprites[i];
    let hasMain = false;
    let hasSidekick = false;
    if (playerData) {
      hasMain = !!(playerData.main || playerData.type === "main");
      hasSidekick = !!(playerData.sidekick || playerData.type === "sidekick");
    }
    if (!hasMain && nextMainSlotIndex === -1) nextMainSlotIndex = i;
    if (!hasSidekick && nextSidekickSlotIndex === -1) nextSidekickSlotIndex = i;
    if (nextMainSlotIndex !== -1 && nextSidekickSlotIndex !== -1) break;
  }

  for (let i = 0; i < 4; i++) {
    // Create wrapper for badge and box
    const wrapper = document.createElement("div");
    wrapper.className = "selected-char-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "flex-start";
    wrapper.style.position = "relative";

    // Player number badge
    const numberBadge = document.createElement("div");
    numberBadge.className = "player-number-badge";
    numberBadge.textContent = i + 1;
    wrapper.appendChild(numberBadge);

    const div = document.createElement("div");
    div.className = "selected-char";
    div.style.position = "relative";

    const playerData = selectedSprites[i];
    let mainChar = null;
    let sidekickChar = null;

    if (playerData) {
      if (playerData.main) {
        mainChar =
          playerData.main && playerData.main.file ? playerData.main : null;
      }
      if (playerData.sidekick) {
        sidekickChar =
          playerData.sidekick && playerData.sidekick.file
            ? playerData.sidekick
            : null;
      }
      if (!mainChar && !sidekickChar) {
        if (playerData.type === "main" && playerData.file) {
          mainChar = { idx: playerData.idx, file: playerData.file };
        } else if (playerData.type === "sidekick" && playerData.file) {
          sidekickChar = { idx: playerData.idx, file: playerData.file };
        }
      }
    }

    // Character pair container
    const charPairContainer = document.createElement("div");
    charPairContainer.className = "char-pair-container";

    // Main character box
    const mainCharDiv = document.createElement("div");
    mainCharDiv.className = "main-char";
    if (mainChar && mainChar.file) {
      const img = document.createElement("img");
      img.src = SPRITES_FOLDER + mainChar.file;
      img.alt = mainChar.file;
      img.onerror = () => {
        console.error(
          "Failed to load main character image:",
          SPRITES_FOLDER + mainChar.file
        );
      };
      img.onload = () => {
        // Removed debug log for loaded main character image
      };
      mainCharDiv.appendChild(img);
      mainCharDiv.style.cursor = "pointer";
      mainCharDiv.onclick = (e) => {
        e.stopPropagation();
        if (playerData) {
          if (playerData.sidekick) {
            selectedSprites[i] = { sidekick: playerData.sidekick };
          } else {
            selectedSprites[i] = null;
            selectedNames[i] = "";
          }
          cleanupSelectedArrays();
          updateSelectedCharacters();
        }
      };
      makeCharBoxDraggable(
        mainCharDiv,
        mainChar.idx,
        mainChar.file,
        "main",
        i,
        "main"
      );
    } else {
      mainCharDiv.classList.add("empty-slot");
      if (i === nextMainSlotIndex) mainCharDiv.classList.add("next-slot");
    }
    charPairContainer.appendChild(mainCharDiv);

    // Sidekick character box
    const sidekickCharDiv = document.createElement("div");
    sidekickCharDiv.className = "sidekick-char";
    if (sidekickChar && sidekickChar.file) {
      const img = document.createElement("img");
      img.src = SPRITES_FOLDER + sidekickChar.file;
      img.alt = sidekickChar.file;
      img.onerror = () => {
        console.error(
          "Failed to load sidekick character image:",
          SPRITES_FOLDER + sidekickChar.file
        );
      };
      img.onload = () => {
        // Removed debug log for loaded sidekick character image
      };
      sidekickCharDiv.appendChild(img);
      sidekickCharDiv.style.cursor = "pointer";
      sidekickCharDiv.onclick = (e) => {
        e.stopPropagation();
        if (playerData) {
          if (playerData.main) {
            selectedSprites[i] = { main: playerData.main };
          } else {
            selectedSprites[i] = null;
            selectedNames[i] = "";
          }
          cleanupSelectedArrays();
          updateSelectedCharacters();
        }
      };
      makeCharBoxDraggable(
        sidekickCharDiv,
        sidekickChar.idx,
        sidekickChar.file,
        "sidekick",
        i,
        "sidekick"
      );
    } else {
      sidekickCharDiv.classList.add("empty-slot");
      if (i === nextSidekickSlotIndex)
        sidekickCharDiv.classList.add("next-slot");
    }
    charPairContainer.appendChild(sidekickCharDiv);

    // --- Highlight logic for both slots if both are available ---
    const hasMain = !!mainChar;
    const hasSidekick = !!sidekickChar;
    if (!hasMain) mainCharDiv.classList.add("next-slot");
    if (!hasSidekick) sidekickCharDiv.classList.add("next-slot");

    div.appendChild(charPairContainer);

    // Make the entire selected character container droppable
    makeSelectedCharContainerDroppable(div, i);

    // Name input
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Player name...";
    input.value = selectedNames[i] || "";
    input.oninput = (e) => {
      selectedNames[i] = e.target.value;
      checkStartFightEnabled();
    };
    div.appendChild(input);

    // Remove button (removes both main and sidekick)
    if (playerData && (mainChar || sidekickChar)) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-char-btn";
      removeBtn.innerHTML = "&times;";
      removeBtn.title = "Remove character pair";
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        selectedSprites[i] = null;
        selectedNames[i] = "";
        cleanupSelectedArrays();
        updateSelectedCharacters();
      };
      div.appendChild(removeBtn);
    }

    // Set background color
    if (
      (mainChar && mainChar.file && spriteColors[mainChar.file]) ||
      (sidekickChar && sidekickChar.file && spriteColors[sidekickChar.file])
    ) {
      if (mainChar && mainChar.file && spriteColors[mainChar.file]) {
        div.style.background = spriteColors[mainChar.file];
      } else if (
        sidekickChar &&
        sidekickChar.file &&
        spriteColors[sidekickChar.file]
      ) {
        div.style.background = spriteColors[sidekickChar.file];
      }
    } // else do not set background, let CSS handle empty

    // Empty slot styling
    if (!playerData) {
      div.classList.add("empty");
    }

    wrapper.appendChild(div);
    container.appendChild(wrapper);
  }

  // Highlight selected and update grid box styles
  document.querySelectorAll(".sprite-option").forEach((opt) => {
    opt.classList.remove("selected");
    // Remove any existing player number badge
    const oldBadge = opt.querySelector(".player-number-badge");
    if (oldBadge) oldBadge.remove();
    const idx = parseInt(opt.dataset.idx);
    const file = opt.dataset.file;
    const type = opt.dataset.type;
    // Check if this character is selected and get its player number
    let playerNumber = null;
    let isSelected = false;
    selectedSprites.forEach((s, pi) => {
      if (s && s.main && s.main.idx === idx) {
        playerNumber = pi + 1;
        isSelected = true;
      } else if (s && s.sidekick && s.sidekick.idx === idx) {
        playerNumber = pi + 1;
        isSelected = true;
      } else if (s && s.idx === idx) {
        playerNumber = pi + 1;
        isSelected = true;
      }
    });
    // Always set background color
    if (spriteColors[file]) {
      opt.style.background = spriteColors[file];
    } else {
      opt.style.background = "#4b367c";
    }
    if (playerNumber) {
      opt.classList.add("selected");
      // Add player number badge
      const badge = document.createElement("div");
      badge.className = "player-number-badge";
      badge.textContent = playerNumber;
      opt.appendChild(badge);
    }
    // Make grid sprite draggable if not selected
    makeSpriteOptionDraggable(opt, idx, file, type, isSelected);
  });

  // --- Add or remove .mains-full and .sidekicks-full classes on grids ---
  const mainGrid = document.querySelector(".character-grid.main-grid");
  const sidekickGrid = document.querySelector(".character-grid.sidekick-grid");
  // Count selected mains and sidekicks
  let mainCount = 0,
    sidekickCount = 0;
  selectedSprites.forEach((s) => {
    if (s && s.main && s.main.file) mainCount++;
    else if (s && s.type === "main" && s.file) mainCount++;
    if (s && s.sidekick && s.sidekick.file) sidekickCount++;
    else if (s && s.type === "sidekick" && s.file) sidekickCount++;
  });
  if (mainGrid) {
    if (mainCount >= 4) mainGrid.classList.add("mains-full");
    else mainGrid.classList.remove("mains-full");
  }
  if (sidekickGrid) {
    if (sidekickCount >= 4) sidekickGrid.classList.add("sidekicks-full");
    else sidekickGrid.classList.remove("sidekicks-full");
  }

  checkStartFightEnabled();
}

function checkStartFightEnabled() {
  const btn = document.getElementById("start-fight");

  // Check that all 4 players have complete character pairs and names
  const allComplete =
    selectedSprites.length === 4 &&
    selectedSprites.every((playerData, i) => {
      // Must have a name
      if (!selectedNames[i] || selectedNames[i].trim().length === 0)
        return false;

      // Must have both main and sidekick characters
      const hasMain = playerData.main || playerData.type === "main";
      const hasSidekick = playerData.sidekick || playerData.type === "sidekick";

      return hasMain && hasSidekick;
    });

  btn.disabled = !allComplete;
}

document.getElementById("start-fight").onclick = () => {
  // Reset damage tracking for new fight
  playerDamageDealt = [0, 0, 0, 0];

  // Set up players with selected sprites and names
  for (let i = 0; i < 4; i++) {
    const playerData = selectedSprites[i];

    // Handle different data structures in selectedSprites
    let mainChar = null;
    let sidekick = null;

    if (playerData) {
      if (playerData.main && playerData.sidekick) {
        // Complete pair
        mainChar = playerData.main;
        sidekick = playerData.sidekick;
      } else if (playerData.type === "main") {
        // Only main character selected
        mainChar = playerData;
        sidekick = null;
      } else if (playerData.type === "sidekick") {
        // Only sidekick selected
        mainChar = null;
        sidekick = playerData;
      }
    }

    // Set sprite files (use empty string if no character selected)
    players[i].mainSpriteFile = mainChar ? SPRITES_FOLDER + mainChar.file : "";
    players[i].sidekickSpriteFile = sidekick
      ? SPRITES_FOLDER + sidekick.file
      : "";
    players[i].mainCharacter = mainChar ? mainChar.file : "";
    players[i].sidekickCharacter = sidekick ? sidekick.file : "";
    players[i].name = selectedNames[i];
    players[i].hp = PLAYER_MAX_HP;
    players[i].displayHp = PLAYER_MAX_HP;
    players[i].alive = true;
    players[i].anim = 0;
    players[i].barShake = 0;
    players[i].attackOffset = { x: 0, y: 0 };
    players[i].specialCharge = 0;
    players[i].specialReady = false;
    players[i].teamBuff = 0;
    players[i].hasAttackedThisTurn = false; // Track if main character has attacked
    players[i].sidekickHasAttackedThisTurn = false; // Track if sidekick has attacked
    // Set special charges to 2 at the start of the fight
    players[i].mainSpecialCharges = 2;
    players[i].sidekickSpecialCharges = 2;
    // Reset attack selection state
    players[i].mainAttackSelected = false;
    players[i].sidekickAttackSelected = false;
    players[i].mainAttackType = null;
    players[i].sidekickAttackType = null;
  }

  bowser.hp = BOWSER_MAX_HP;
  bowser.displayHp = BOWSER_MAX_HP;
  bowser.alive = true;
  bowser.anim = 0;
  bowser.barShake = 0;
  bowser.attackOffset = { x: 0, y: 0 };
  bowser.statusEffects = {};

  // Reset all animation states for fight start
  bowserAttackAnim = false;
  bowserAttackAnimFrame = 0;
  bowserDeathAnim = false;
  player1AttackAnim = false;
  player1AttackAnimFrame = 0;

  currentPlayer = 0;
  gameState = "player";
  playersThisRound = [];
  updateTurnIndicator();
  enableAttackButtonsForPlayerTurn(); // Enable attack buttons for the first player
  document.getElementById("character-select-screen").style.display = "none";
  document.getElementById("game-container").style.display = "";

  // Stop character select video when leaving character select
  if (window.characterSelectVideoControl) {
    window.characterSelectVideoControl.stop();
  }

  draw();

  // Pause menu music, play fight music
  menuMusic.pause();
  gameMusic.currentTime = 0;
  gameMusic.play().catch((error) => {
    console.log("Music playback failed:", error.message);
  });
  setCharMenuVisibility(false);
  setFightMenuVisibility(true);
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw background with aspect ratio preservation - cover full height
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    let drawWidth, drawHeight, offsetX, offsetY;
    drawHeight = canvas.height;
    drawWidth = canvas.height * imgAspect;
    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = 0;
    ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);
  }
  // Draw clouds
  clouds.forEach((cloud) => {
    if (cloudImg.complete && cloudImg.naturalWidth > 0) {
      ctx.drawImage(cloudImg, cloud.x, cloud.y, cloud.w, cloud.h);
    }
  });
  const positions = getCenteredPositions();

  // Draw Bowser Health Bar (large, red, top of screen)
  const bowserBarW = Math.min(canvas.width * 0.6, 600);
  const bowserBarH = 32;
  const bowserBarX = (canvas.width - bowserBarW) / 2;
  const bowserBarY = 36;
  // Red health bar with white border and shake
  ctx.save();
  let shakeX = 0,
    shakeY = 0;
  if (bowser.barShake > 0) {
    shakeX = (Math.random() - 0.5) * 24 * bowser.barShake;
    shakeY = (Math.random() - 0.5) * 24 * bowser.barShake;
  }
  ctx.translate(shakeX, shakeY);
  ctx.fillStyle = "#222";
  ctx.fillRect(bowserBarX, bowserBarY, bowserBarW, bowserBarH);
  ctx.fillStyle = "#e53935";
  ctx.fillRect(
    bowserBarX,
    bowserBarY,
    (bowserBarW * Math.max(0, bowser.displayHp)) / BOWSER_MAX_HP,
    bowserBarH
  );
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(bowserBarX, bowserBarY, bowserBarW, bowserBarH);
  // Health number
  ctx.font = 'bold 1.2em "Press Start 2P", monospace, sans-serif';
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${Math.max(0, Math.round(bowser.displayHp))}/${BOWSER_MAX_HP}`,
    bowserBarX + bowserBarW - 12,
    bowserBarY + bowserBarH / 2
  );

  // Draw status effect icons to the right of the health bar
  drawStatusEffectIcons(
    bowserBarX + bowserBarW + 8,
    bowserBarY,
    bowser.statusEffects
  );

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.restore();
  // Bowser Name (large, under health bar)
  ctx.save();
  ctx.font = 'bold 2em "Press Start 2P", monospace, sans-serif';
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 6;
  ctx.fillText("Bowser", canvas.width / 2, bowserBarY + bowserBarH + 10);
  ctx.restore();

  // Draw Bowser (Bowser)
  ctx.save();
  let bowserPos = {
    x: positions.bowser.x + (bowser.attackOffset?.x || 0),
    y: positions.bowser.y + (bowser.attackOffset?.y || 0) + bowserDeathY,
  };

  // --- SCALE LOGIC START ---
  let scale = 1.0;
  if (bowserAttackAnim) {
    // Calculate how far Bowser is from his start position (0 = start, 1 = max lunge)
    const maxDist = 120; // Tune this to match your max lunge distance
    const dist = Math.sqrt(
      (bowser.attackOffset?.x || 0) ** 2 + (bowser.attackOffset?.y || 0) ** 2
    );
    // Scale from 1.0 to 1.3 at max lunge
    scale = 1.0 + 1.0 * Math.min(dist / maxDist, 1);
  }
  ctx.translate(bowserPos.x, bowserPos.y);
  ctx.scale(scale, scale);
  ctx.translate(-bowserPos.x, -bowserPos.y);
  // --- SCALE LOGIC END ---

  if (bowser.anim > 0) {
    ctx.translate(bowserPos.x, bowserPos.y);
    ctx.rotate((Math.random() - 0.5) * 0.1 * bowser.anim); // shake
    ctx.translate(-bowserPos.x, -bowserPos.y);
  }
  // Calculate bowser size based on screen height while maintaining aspect ratio
  const baseBowserHeight = 400; // Base height for reference
  const screenHeightRatio = canvas.height / 1080; // Assuming 1080p as base resolution
  const bowserScale = Math.max(0.6, Math.min(1.2, screenHeightRatio)); // Scale between 60% and 120%

  const bowserDrawW = 400 * bowserScale;
  const bowserDrawH = 400 * bowserScale;
  const bowserAttackDrawW = 506 * bowserScale;
  const bowserAttackDrawH = 438 * bowserScale;
  if (bowserDeathAnim && !showWinScreen) {
    // Use bowserAttackSheet.png frames 0,1,2 for death
    if (
      bowserDeathY <= 420 &&
      bowserAttackImg.complete &&
      bowserAttackImg.naturalWidth > 0
    ) {
      let frame = bowserDeathFrame;
      ctx.drawImage(
        bowserAttackImg,
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
    // Don't return; allow win screen to draw
  } else if (bowserDeathAnim && showWinScreen) {
    // During the drop after win screen, always use frame 2 (third frame)
    if (bowserAttackImg.complete && bowserAttackImg.naturalWidth > 0) {
      ctx.drawImage(
        bowserAttackImg,
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
    bowserAttackAnim &&
    bowserAttackImg.complete &&
    bowserAttackImg.naturalWidth > 0
  ) {
    // Draw attack animation from bowserAttackSheet.png
    let frame = bowserAttackAnimFrame;
    ctx.drawImage(
      bowserAttackImg,
      Math.round(frame * BOWSER_ATTACK_FRAME_W),
      0,
      Math.round(BOWSER_ATTACK_FRAME_W),
      Math.round(BOWSER_ATTACK_FRAME_H),
      bowserPos.x - bowserAttackDrawW / 2,
      bowserPos.y - bowserAttackDrawH / 2,
      bowserAttackDrawW,
      bowserAttackDrawH
    );
  } else if (bowserBowserImg.complete && bowserBowserImg.naturalWidth > 0) {
    // Draw idle or death from bowserSprite.png
    let frame = bowserIdleFrame;
    let row = BOWSER_IDLE_ROW;
    ctx.drawImage(
      bowserBowserImg,
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
    ctx.beginPath();
    ctx.arc(bowserPos.x, bowserPos.y, 60, 0, Math.PI * 2);
    ctx.fillStyle = BOWSER_COLOR;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  }
  ctx.restore();

  // Draw Players
  if (!showWinScreen) {
    players.forEach((p, i) => {
      const basePos = positions.players[i];
      ctx.save();
      if (p.anim > 0) {
        ctx.translate(basePos.x, basePos.y);
        ctx.rotate((Math.random() - 0.5) * 0.1 * p.anim); // shake
        ctx.translate(-basePos.x, -basePos.y);
      }

      // Draw character pair (main + sidekick)
      const SPRITE_SIZE = 120; // Match character select screen size
      const SIDEKICK_SIZE = 120; // Match character select screen size
      const PAIR_SPACING = 120; // Increased spacing between main and sidekick

      // Draw main character with individual offset
      if (p.mainSpriteFile) {
        let mainImg = p._mainSpriteImg;
        if (!mainImg) {
          mainImg = new window.Image();
          mainImg.onload = () => {};
          mainImg.onerror = () => {
            console.error(
              `Failed to load main sprite for player ${i}:`,
              p.mainSpriteFile
            );
          };
          mainImg.src = p.mainSpriteFile;
          p._mainSpriteImg = mainImg;
        }

        // Only draw if image is loaded
        if (mainImg.complete && mainImg.naturalWidth > 0) {
          // Animate the current player's sprite (simple bounce effect)
          let yOffset = 0;
          if (i === currentPlayer && gameState === "player") {
            yOffset = Math.sin(Date.now() / 120) * 8;
          }

          // Maintain aspect ratio for main character
          let drawW = SPRITE_SIZE,
            drawH = SPRITE_SIZE;
          if (mainImg.naturalWidth && mainImg.naturalHeight) {
            const aspect = mainImg.naturalWidth / mainImg.naturalHeight;
            if (aspect > 1) {
              // Wider than tall - fit to width
              drawW = SPRITE_SIZE;
              drawH = SPRITE_SIZE / aspect;
            } else {
              // Taller than wide - fit to height
              drawH = SPRITE_SIZE;
              drawW = SPRITE_SIZE * aspect;
            }
          }

          // Special sizing for certain characters
          if (p.mainCharacter === "Mario_Fire.png") {
            drawW = 140;
            drawH = 140;
          } else if (p.mainCharacter === "Mario_Giant.png") {
            drawW = 160;
            drawH = 160;
          }

          if (!p.alive) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.filter = "grayscale(1)";
          }

          // Draw main character with individual animation offset
          let drawMarioCapeFly = false;
          let drawMarioCatLeap = false;
          let marioCapeFlyX, marioCapeFlyY;
          let marioCatLeapX, marioCatLeapY;
          if (
            (p.mainCharacter === "Mario_Cape.png" ||
              p.mainCharacter === "Mario_Raccoon.png") &&
            p.capeFlyAnim &&
            p.capeFlyAnim.phase === "arc"
          ) {
            drawMarioCapeFly = true;
            marioCapeFlyX = p.capeFlyAnim.marioX;
            marioCapeFlyY = p.capeFlyAnim.marioY;
          } else if (
            p.mainCharacter === "Mario_Cat.png" &&
            p.catLeapAnim &&
            (p.catLeapAnim.phase === "leap" || p.catLeapAnim.phase === "return")
          ) {
            drawMarioCatLeap = true;
            marioCatLeapX = p.catLeapAnim.marioX;
            marioCatLeapY = p.catLeapAnim.marioY;
          }
          const mainPos = drawMarioCapeFly
            ? { x: marioCapeFlyX, y: marioCapeFlyY }
            : drawMarioCatLeap
            ? { x: marioCatLeapX, y: marioCatLeapY }
            : {
                x: basePos.x - PAIR_SPACING / 2 + (p.mainAttackOffset?.x || 0),
                y: basePos.y + yOffset + (p.mainAttackOffset?.y || 0),
              };

          // Flip sprites horizontally for players 3 and 4 (indices 2 and 3)
          if (i >= 2) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
              mainImg,
              -mainPos.x - drawW / 2,
              mainPos.y - drawH / 2,
              drawW,
              drawH
            );
            ctx.restore();
          } else {
            ctx.drawImage(
              mainImg,
              mainPos.x - drawW / 2,
              mainPos.y - drawH / 2,
              drawW,
              drawH
            );
          }

          if (!p.alive) {
            ctx.globalAlpha = 1;
            ctx.filter = "none";
            ctx.restore();
          }
        } else {
          console.log(
            `Main sprite not ready for player ${i}:`,
            p.mainSpriteFile
          );
          // Draw placeholder circle for main character
          ctx.save();
          ctx.fillStyle = PLAYER_COLORS[i];
          ctx.beginPath();
          ctx.arc(basePos.x - PAIR_SPACING / 2, basePos.y, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw sidekick character with individual offset
      if (p.sidekickSpriteFile) {
        let sidekickImg = p._sidekickSpriteImg;
        if (!sidekickImg) {
          sidekickImg = new window.Image();
          sidekickImg.onload = () => {};
          sidekickImg.onerror = () => {
            console.error(
              `Failed to load sidekick sprite for player ${i}:`,
              p.sidekickSpriteFile
            );
          };
          sidekickImg.src = p.sidekickSpriteFile;
          p._sidekickSpriteImg = sidekickImg;
        }

        // Only draw if image is loaded
        if (sidekickImg.complete && sidekickImg.naturalWidth > 0) {
          // Animate the current player's sidekick (delayed bounce effect)
          let yOffset = 0;
          if (i === currentPlayer && gameState === "player") {
            yOffset = Math.sin((Date.now() + 200) / 120) * 6; // Delayed and smaller bounce
          }

          // Maintain aspect ratio for sidekick
          let drawW = SIDEKICK_SIZE,
            drawH = SIDEKICK_SIZE;
          if (sidekickImg.naturalWidth && sidekickImg.naturalHeight) {
            const aspect = sidekickImg.naturalWidth / sidekickImg.naturalHeight;
            if (aspect > 1) {
              // Wider than tall - fit to width
              drawW = SIDEKICK_SIZE;
              drawH = SIDEKICK_SIZE / aspect;
            } else {
              // Taller than wide - fit to height
              drawH = SIDEKICK_SIZE;
              drawW = SIDEKICK_SIZE * aspect;
            }
          }

          // Special sizing for certain sidekicks
          if (p.sidekickCharacter === "Sidekick_DK.png") {
            drawW = 120;
            drawH = 120;
          }

          if (!p.alive) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.filter = "grayscale(1)";
          }

          // Draw sidekick with individual animation offset
          const sidekickPos = {
            x: basePos.x + PAIR_SPACING / 2 + (p.sidekickAttackOffset?.x || 0),
            y: basePos.y + yOffset + (p.sidekickAttackOffset?.y || 0),
          };

          // Flip sprites horizontally for players 3 and 4 (indices 2 and 3)
          if (i >= 2) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
              sidekickImg,
              -sidekickPos.x - drawW / 2,
              sidekickPos.y - drawH / 2,
              drawW,
              drawH
            );
            ctx.restore();
          } else {
            ctx.drawImage(
              sidekickImg,
              sidekickPos.x - drawW / 2,
              sidekickPos.y - drawH / 2,
              drawW,
              drawH
            );
          }

          if (!p.alive) {
            ctx.globalAlpha = 1;
            ctx.filter = "none";
            ctx.restore();
          }
        } else {
          console.log(
            `Sidekick sprite not ready for player ${i}:`,
            p.sidekickSpriteFile
          );
          // Draw placeholder circle for sidekick character
          ctx.save();
          ctx.fillStyle = PLAYER_COLORS[i];
          ctx.beginPath();
          ctx.arc(basePos.x + PAIR_SPACING / 2, basePos.y, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw 'DEAD' text if player is dead
      if (!p.alive) {
        ctx.save();
        ctx.font = 'bold 24px "Press Start 2P", monospace, sans-serif';
        ctx.fillStyle = "#ff5252";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText("DEAD", basePos.x, basePos.y);
        ctx.fillText("DEAD", basePos.x, basePos.y);
        ctx.restore();
      }

      ctx.restore();

      // Health bar (positioned below the character pair)
      const healthBarWidth = 200; // Increased width to account for spread out characters
      drawHealthBar(
        basePos.x - healthBarWidth / 2,
        basePos.y + SPRITE_SIZE / 2 + 15,
        healthBarWidth,
        16,
        p.displayHp,
        PLAYER_MAX_HP,
        p.barShake
      );

      // Player name (positioned above the character pair)
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.font = 'bold 28px "Press Start 2P", monospace, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 8;
      ctx.fillText(
        p.name || `P${i + 1}`,
        basePos.x,
        basePos.y - SPRITE_SIZE / 2 - 15
      );
      ctx.restore();
    });
  }

  // Draw floating damages
  floatingDamages.forEach((fd) => {
    ctx.save();
    ctx.globalAlpha = fd.alpha;
    ctx.font = `bold ${
      fd.size || 42
    }px 'Press Start 2P', monospace, sans-serif`;
    ctx.fillStyle = fd.color || "#ff5252";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 6;
    // Draw label above number if present
    if (fd.label) {
      ctx.font = `bold ${Math.round(
        (fd.size || 28) * 0.7
      )}px 'Press Start 2P', monospace, sans-serif`;
      ctx.strokeText(fd.label, fd.x, fd.y - 24);
      ctx.fillText(fd.label, fd.x, fd.y - 24);
      ctx.font = `bold ${
        fd.size || 28
      }px 'Press Start 2P', monospace, sans-serif`;
    }
    ctx.strokeText(fd.text, fd.x, fd.y);
    ctx.fillText(fd.text, fd.x, fd.y);
    ctx.restore();
  });

  // Draw special attack projectiles and effects
  drawSpecialProjectiles();

  // WIN SCREEN
  if (showWinScreen) {
    // Hide turn indicator
    const turnIndicatorElem = document.getElementById("turn-indicator");
    if (turnIndicatorElem) turnIndicatorElem.style.display = "none";
    // Dim background
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.restore();
    // Fireworks
    drawFireworks();
    // YOU WIN heading
    ctx.save();
    ctx.font = 'bold 64px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = "#ffeb3b";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 10;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 16;
    ctx.strokeText("YOU WIN!", canvas.width / 2, canvas.height * 0.18);
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height * 0.18);
    ctx.restore();

    // Draw winning characters - show both main and sidekick for each player
    const midY = canvas.height * 0.48;
    const spacing = canvas.width / 8;
    const startX = canvas.width / 2 - 1.5 * spacing;

    for (let i = 0; i < 4; i++) {
      const p = players[i];
      const playerX = startX + i * spacing;

      // Draw main character sprite
      if (p.mainSpriteFile) {
        let mainImg = p._mainSpriteImg;
        if (!mainImg) {
          mainImg = new window.Image();
          mainImg.src = p.mainSpriteFile;
          p._mainSpriteImg = mainImg;
        }

        let mainDrawW = 120,
          mainDrawH = 120;
        if (mainImg.naturalWidth && mainImg.naturalHeight) {
          const aspect = mainImg.naturalWidth / mainImg.naturalHeight;
          if (aspect > 1) {
            // Wider than tall - fit to width
            mainDrawW = 120;
            mainDrawH = 120 / aspect;
          } else {
            // Taller than wide - fit to height
            mainDrawH = 120;
            mainDrawW = 120 * aspect;
          }
        }

        // Special sizing for certain characters
        if (p.mainCharacter === "Mario_Fire.png") {
          mainDrawW = 140;
          mainDrawH = 140;
        } else if (p.mainCharacter === "Mario_Giant.png") {
          mainDrawW = 160;
          mainDrawH = 160;
        }

        // Flip sprites horizontally for players 3 and 4 (indices 2 and 3)
        if (i >= 2) {
          ctx.save();
          ctx.translate(playerX, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(
            mainImg,
            -mainDrawW / 2 - 30,
            midY - mainDrawH / 2,
            mainDrawW,
            mainDrawH
          );
          ctx.restore();
        } else {
          ctx.drawImage(
            mainImg,
            playerX - mainDrawW / 2 - 30,
            midY - mainDrawH / 2,
            mainDrawW,
            mainDrawH
          );
        }
      }

      // Draw sidekick sprite
      if (p.sidekickSpriteFile) {
        let sidekickImg = p._sidekickSpriteImg;
        if (!sidekickImg) {
          sidekickImg = new window.Image();
          sidekickImg.src = p.sidekickSpriteFile;
          p._sidekickSpriteImg = sidekickImg;
        }

        let sidekickDrawW = 120,
          sidekickDrawH = 120;
        if (sidekickImg.naturalWidth && sidekickImg.naturalHeight) {
          const aspect = sidekickImg.naturalWidth / sidekickImg.naturalHeight;
          if (aspect > 1) {
            // Wider than tall - fit to width
            sidekickDrawW = 120;
            sidekickDrawH = 120 / aspect;
          } else {
            // Taller than wide - fit to height
            sidekickDrawH = 120;
            sidekickDrawW = 120 * aspect;
          }
        }

        // Special sizing for certain sidekicks
        if (p.sidekickCharacter === "Sidekick_DK.png") {
          sidekickDrawW = 120;
          sidekickDrawH = 120;
        }

        // Flip sprites horizontally for players 3 and 4 (indices 2 and 3)
        if (i >= 2) {
          ctx.save();
          ctx.translate(playerX, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(
            sidekickImg,
            -sidekickDrawW / 2 + 30,
            midY - sidekickDrawH / 2,
            sidekickDrawW,
            sidekickDrawH
          );
          ctx.restore();
        } else {
          ctx.drawImage(
            sidekickImg,
            playerX - sidekickDrawW / 2 + 30,
            midY - sidekickDrawH / 2,
            sidekickDrawW,
            sidekickDrawH
          );
        }
      }

      // Draw player name
      ctx.save();
      ctx.font = 'bold 20px "Press Start 2P", monospace, sans-serif';
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 6;
      ctx.fillText(p.name || `P${i + 1}`, playerX, midY + 80);
      ctx.restore();

      // Draw damage dealt
      ctx.save();
      ctx.font = 'bold 16px "Press Start 2P", monospace, sans-serif';
      ctx.fillStyle = "#ffeb3b";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 4;
      ctx.fillText(`${playerDamageDealt[i]} DMG`, playerX, midY + 110);
      ctx.restore();
    }

    // Add Return to Main Menu and Restart buttons as HTML elements styled with 'snes-btn'
    let btnY = canvas.height / 2 + 180;
    let btnW = 320,
      btnH = 54;
    // Only add buttons if not already present
    let gameContainer = document.getElementById("game-container");
    let mainMenuBtn = document.getElementById("win-main-menu-btn");
    let restartBtn = document.getElementById("win-restart-btn");
    if (!mainMenuBtn) {
      mainMenuBtn = document.createElement("button");
      mainMenuBtn.id = "win-main-menu-btn";
      mainMenuBtn.className = "snes-btn";
      mainMenuBtn.textContent = "Return to Main Menu";
      mainMenuBtn.style.position = "absolute";
      mainMenuBtn.style.left = `calc(50% - ${btnW / 2}px)`;
      mainMenuBtn.style.top = `${btnY}px`;
      mainMenuBtn.style.width = `${btnW}px`;
      mainMenuBtn.style.height = `${btnH}px`;
      mainMenuBtn.style.zIndex = 5002;
      mainMenuBtn.onclick = function () {
        showCharacterSelect();
        setCharMenuVisibility(true);
        setFightMenuVisibility(false);
        showWinScreen = false;
        bowserDeathAnim = false;
        bowserDeathFrame = 0;
        bowserDeathFrameTimer = 0;
        bowserDeathY = 0;
        bowserDeathDone = false;
        fireworks = [];
        // Reset bowser health
        bowser.hp = BOWSER_MAX_HP;
        bowser.displayHp = BOWSER_MAX_HP;
        // Reset damage tracking
        playerDamageDealt = [0, 0, 0, 0];

        // Reset all animations and game state
        resetAllAnimations();

        // Show UI again
        const ui = document.getElementById("ui");
        if (ui) ui.style.display = "";
        // Show players again
        if (canvas) canvas.classList.remove("hide-players");
        // Show turn indicator again
        const turnIndicatorElem = document.getElementById("turn-indicator");
        if (turnIndicatorElem) turnIndicatorElem.style.display = "";
        // Remove buttons
        if (mainMenuBtn) mainMenuBtn.remove();
        if (restartBtn) restartBtn.remove();
        draw();
      };
      gameContainer.appendChild(mainMenuBtn);
    }
    if (!restartBtn) {
      restartBtn = document.createElement("button");
      restartBtn.id = "win-restart-btn";
      restartBtn.className = "snes-btn";
      restartBtn.textContent = "Restart";
      restartBtn.style.position = "absolute";
      restartBtn.style.left = `calc(50% - ${btnW / 2}px)`;
      restartBtn.style.top = `${btnY + btnH + 18}px`;
      restartBtn.style.width = `${btnW}px`;
      restartBtn.style.height = `${btnH}px`;
      restartBtn.style.zIndex = 5002;
      restartBtn.onclick = function () {
        restartGame();
        showWinScreen = false;
        bowserDeathAnim = false;
        bowserDeathFrame = 0;
        bowserDeathFrameTimer = 0;
        bowserDeathY = 0;
        bowserDeathDone = false;
        fireworks = [];
        // Reset bowser health
        bowser.hp = BOWSER_MAX_HP;
        bowser.displayHp = BOWSER_MAX_HP;
        // Reset damage tracking
        playerDamageDealt = [0, 0, 0, 0];
        // Show UI again
        const ui = document.getElementById("ui");
        if (ui) ui.style.display = "";
        // Show players again
        if (canvas) canvas.classList.remove("hide-players");
        // Remove buttons
        if (mainMenuBtn) mainMenuBtn.remove();
        if (restartBtn) restartBtn.remove();
        draw();
      };
      gameContainer.appendChild(restartBtn);
    }
  } else {
    // Remove win screen buttons if not showing win screen
    let mainMenuBtn = document.getElementById("win-main-menu-btn");
    let restartBtn = document.getElementById("win-restart-btn");
    if (mainMenuBtn) mainMenuBtn.remove();
    if (restartBtn) restartBtn.remove();
    // Show turn indicator again
    const turnIndicatorElem = document.getElementById("turn-indicator");
    if (turnIndicatorElem) turnIndicatorElem.style.display = "";
  }
}

function drawHealthBar(x, y, w, h, hp, maxHp, shake = 0) {
  ctx.save();
  if (shake > 0) {
    ctx.translate(
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
    ctx.globalAlpha = flashIntensity;
  }

  // Add glowing effect by drawing a shadowed rectangle first
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 16;
  ctx.fillStyle = barColor;
  ctx.fillRect(x, y, (w * Math.max(0, hp)) / maxHp, h);
  ctx.restore();
  ctx.fillStyle = "#222";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = barColor;
  ctx.fillRect(x, y, (w * Math.max(0, hp)) / maxHp, h);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Reset alpha for text
  if (shouldFlash) {
    ctx.globalAlpha = 1;
  }

  // Draw health number to the right of the bar
  ctx.font = `${h * 1.5}px sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.max(0, Math.round(hp))}/${maxHp}`, x + w + 8, y + h / 2);
  ctx.restore();
}

function showFloatingDamage(x, y, text, color = "#ff5252", label = "") {
  floatingDamages.push({
    x,
    y,
    text,
    color,
    label,
    alpha: 1,
    vy: -0.5,
    life: 240,
  });
}

function updateFloatingDamages() {
  floatingDamages.forEach((fd) => {
    fd.y += fd.vy;
    fd.life--;
    fd.alpha = Math.max(0, fd.life / 240);
  });
  floatingDamages = floatingDamages.filter((fd) => fd.life > 0);
  // Reduce barShake for boss and players
  if (bowser.barShake > 0) bowser.barShake -= 0.1;
  players.forEach((p) => {
    if (p.barShake > 0) p.barShake -= 0.1;
  });
  // Animate health bars
  // Boss
  if (Math.abs(bowser.displayHp - bowser.hp) > 0.1) {
    bowser.displayHp += (bowser.hp - bowser.displayHp) * 0.15;
  } else {
    bowser.displayHp = bowser.hp;
  }
  // Players
  players.forEach((p) => {
    if (Math.abs(p.displayHp - p.hp) > 0.1) {
      p.displayHp += (p.hp - p.displayHp) * 0.15;
    } else {
      p.displayHp = p.hp;
    }
  });
}

function nextPlayer() {
  // Reset attack selection for the current player
  players[currentPlayer].mainAttackSelected = false;
  players[currentPlayer].sidekickAttackSelected = false;
  players[currentPlayer].mainAttackType = null;
  players[currentPlayer].sidekickAttackType = null;

  // Find next alive player
  do {
    currentPlayer = (currentPlayer + 1) % 4;
  } while (!players[currentPlayer].alive);

  // Reset attack selection for the new player as well
  players[currentPlayer].mainAttackSelected = false;
  players[currentPlayer].sidekickAttackSelected = false;
  players[currentPlayer].mainAttackType = null;
  players[currentPlayer].sidekickAttackType = null;

  // Update UI for new player - enable buttons for the new player's turn
  enableAttackButtonsForPlayerTurn();
}

// Legacy attack functions removed - using consolidated animation system instead

// Global screen shake function
function triggerScreenShake() {
  const gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;
  gameContainer.classList.remove("screen-shake");
  void gameContainer.offsetWidth;
  gameContainer.classList.add("screen-shake");
  setTimeout(() => {
    gameContainer.classList.remove("screen-shake");
  }, 400);
}

function bowserAttack() {
  // Disable all attack buttons during bowser turn
  disableAllAttackButtons();

  // Reset attack selection state for all players at the beginning of bowser attack phase
  players.forEach((player) => {
    if (player.alive) {
      player.mainAttackSelected = false;
      player.sidekickAttackSelected = false;
      player.mainAttackType = null;
      player.sidekickAttackType = null;
    }
    // Reset attack flags for all players at the start of a new round
    player.hasAttackedThisTurn = false;
    player.sidekickHasAttackedThisTurn = false;
  });
  updateAttackButtons();

  const positions = getCenteredPositions();
  updateTurnIndicator();
  let targets = players
    .map((p, i) => (p.alive ? i : null))
    .filter((i) => i !== null);
  let numAttacks = Math.min(3, targets.length);
  let chosen = [];
  while (chosen.length < numAttacks) {
    let idx = targets[Math.floor(Math.random() * targets.length)];
    if (!chosen.includes(idx)) chosen.push(idx);
  }
  bowserAttackAnim = true;
  bowserAttackAnimFrame = 0;

  // --- Staggered status effect damage ---
  const statusEffectsToApply = [];
  if (bowser.statusEffects.burn) {
    statusEffectsToApply.push({
      type: "burn",
      color: "#ff5722",
      label: "BURN",
      value: -2,
    });
  }
  if (bowser.statusEffects.bleed) {
    statusEffectsToApply.push({
      type: "bleed",
      color: "#ffb300",
      label: "BLEED",
      value: -2,
    });
  }
  if (bowser.statusEffects.poison) {
    statusEffectsToApply.push({
      type: "poison",
      color: "#8bc34a",
      label: "POISON",
      value: -2,
    });
  }

  // Helper to apply one status effect damage
  function applyStatusEffectDamage(effect, idx) {
    bowser.hp -= 2;
    showFloatingDamage(
      getCenteredPositions().bowser.x,
      getCenteredPositions().bowser.y - 120 + idx * 20,
      effect.value.toString(),
      effect.color,
      effect.label
    );
    bowser.statusEffects[effect.type].turns--;
    if (bowser.statusEffects[effect.type].turns <= 0)
      delete bowser.statusEffects[effect.type];
    draw();
  }

  // Process status effects with staggered delay, then continue with bowser attack
  if (statusEffectsToApply.length > 0) {
    statusEffectsToApply.forEach((effect, idx) => {
      setTimeout(() => {
        applyStatusEffectDamage(effect, idx);
      }, idx * 500);
    });
    // Delay the bowser attack until all status effects have been processed
    setTimeout(() => {
      continueBowserAttack();
    }, statusEffectsToApply.length * 800 + 100); // +100ms buffer
    return;
  } else {
    continueBowserAttack();
    return;
  }

  // --- Clean rewrite of bowser attack animation ---
  function continueBowserAttack() {
    // Check status effects first
    let skipTurn = false;
    if (bowser.statusEffects.freeze) {
      skipTurn = true;
      bowser.statusEffects.freeze.turns--;
      showFloatingDamage(
        getCenteredPositions().bowser.x,
        getCenteredPositions().bowser.y - 60,
        "FROZEN!",
        "#00e5ff"
      );
      if (bowser.statusEffects.freeze.turns <= 0)
        delete bowser.statusEffects.freeze;
    }
    if (bowser.statusEffects.distract) {
      skipTurn = true;
      bowser.statusEffects.distract.turns--;
      showFloatingDamage(
        getCenteredPositions().bowser.x,
        getCenteredPositions().bowser.y - 40,
        "DISTRACTED!",
        "#fff"
      );
      if (bowser.statusEffects.distract.turns <= 0)
        delete bowser.statusEffects.distract;
    }

    // Check if bowser is already dead
    if (bowser.hp <= 0) {
      bowser.hp = 0;
      gameState = "gameover";
      turnIndicator.textContent = "Players Win!";
      bowserDeathAnim = true;
      bowserDeathFrame = 0;
      bowserDeathFrameTimer = 0;
      bowserDeathY = 0;
      bowserDeathDone = false;
      playSound(SFX.bowserDeath, 0.7);
      gameMusic.pause();
      return;
    }

    // If bowser should skip turn due to status effects
    if (skipTurn) {
      setTimeout(() => {
        // Reset bowser animation state
        bowserAttackAnim = false;
        bowserAttackAnimFrame = 0;

        playersThisRound = [];
        currentPlayer = players.findIndex((p) => p.alive);
        gameState = "player";
        players.forEach((player) => {
          player.hasAttackedThisTurn = false;
          player.sidekickHasAttackedThisTurn = false;
        });
        updateTurnIndicator();
        enableAttackButtonsForPlayerTurn();
      }, 1200);
      return;
    }

    // Calculate target position (average of chosen players)
    let tx = 0,
      ty = 0;
    chosen.forEach((i) => {
      tx += positions.players[i].x;
      ty += positions.players[i].y;
    });
    tx /= chosen.length;
    ty /= chosen.length;

    const targetOffset = {
      x: (tx - positions.bowser.x) * 0.7, // Move 70% of the way there
      y: (ty - positions.bowser.y) * 0.7,
    };

    // Animation state
    let state = "approaching"; // "approaching", "attacking", "returning", "done"
    let stompCount = 0;
    let walkProgress = 0;
    let isStomping = false;
    let stompPauseFrames = 0;
    let currentLeanSide = 1; // 1 for right, -1 for left
    let returnProgress = 0;

    bowserAttackAnim = true;
    bowser.attackOffset = { x: 0, y: 0 };

    function animate() {
      if (state === "approaching") {
        // Handle stomping
        if (!isStomping) {
          // Check if it's time for next stomp
          const stompThresholds = [0.25, 0.5, 0.75]; // At 25%, 50%, 75% of journey
          if (stompCount < 3 && walkProgress >= stompThresholds[stompCount]) {
            // Start stomp
            playSound("sounds/stomp2.wav", 0.3);
            isStomping = true;
            stompPauseFrames = 15; // Pause for 15 frames
            currentLeanSide *= -1; // Alternate lean side
            stompCount++;
          } else {
            // Normal walking progress
            walkProgress += 0.008; // Slow walking speed
          }
        } else {
          // Handle stomp pause
          let leanIntensity =
            Math.sin(((15 - stompPauseFrames) / 15) * Math.PI) * 20;
          bowser.attackOffset.x =
            targetOffset.x * walkProgress + currentLeanSide * leanIntensity;
          bowser.attackOffset.y =
            targetOffset.y * walkProgress + Math.abs(leanIntensity) * 0.2;

          stompPauseFrames--;
          if (stompPauseFrames <= 0) {
            isStomping = false;
          }
        }

        if (!isStomping) {
          // Update position during normal walking
          bowser.attackOffset.x = targetOffset.x * walkProgress;
          bowser.attackOffset.y = targetOffset.y * walkProgress;
        }

        // Set sprite frame based on progress (frame 0-2 during approach)
        bowserAttackAnimFrame = Math.min(2, Math.floor(walkProgress * 3));

        if (walkProgress >= 1.0) {
          // Arrived at destination
          console.log("Bowser reached destination, starting attack");
          state = "attacking";
          bowserAttackAnimFrame = 2; // Frame 3 (index 2) for attack
          bowser.attackOffset.x = targetOffset.x;
          bowser.attackOffset.y = targetOffset.y;
        }
      } else if (state === "attacking") {
        // Only attack once - set flag immediately
        state = "attacking_pause";

        // Deal damage and play explosion sound
        playSound(SFX.bowserAttack, 1);
        triggerScreenShake();

        chosen.forEach((i) => {
          let damage = Math.floor(Math.random() * 8) + 2;
          players[i].hp -= damage;
          players[i].anim = 1;
          players[i].barShake = 1;
          showFloatingDamage(
            positions.players[i].x,
            positions.players[i].y - 50,
            "-" + damage,
            "#ffb300"
          );
          if (players[i].hp <= 0) {
            players[i].hp = 0;
            players[i].alive = false;
            playSound(SFX.playerDeath, 0.7);
          }
        });

        setTimeout(() => {
          console.log("Bowser attack timeout complete, starting return");
          players.forEach((p) => (p.anim = 0));
          state = "returning";
        }, 500);
      } else if (state === "attacking_pause") {
        // Just wait for the timeout to change state to "returning"
        // Don't do anything else here
      } else if (state === "returning") {
        // Return to original position more quickly
        returnProgress += 0.04; // Faster return speed

        bowser.attackOffset.x = targetOffset.x * (1 - returnProgress);
        bowser.attackOffset.y = targetOffset.y * (1 - returnProgress);

        // Frame animation during return (frame 2 back to 0)
        bowserAttackAnimFrame = Math.max(
          0,
          Math.floor((1 - returnProgress) * 3)
        );

        if (returnProgress >= 1.0) {
          console.log("Bowser returning complete, transitioning to done");
          state = "done";
          bowser.attackOffset = { x: 0, y: 0 };
          bowserAttackAnimFrame = 0;

          // Immediately execute done logic instead of waiting for next frame
          console.log("Bowser attack ending, resetting to player turn");

          // Completely reset bowser animation state
          bowser.anim = 0;
          bowserAttackAnim = false;

          // Check win/lose conditions
          if (players.every((p) => !p.alive)) {
            gameState = "gameover";
            turnIndicator.textContent = "Bowser Wins!";
            gameMusic.pause();
          } else {
            // Reset for next round
            playersThisRound = [];
            currentPlayer = players.findIndex((p) => p.alive);

            // Reset all player turn flags
            players.forEach((player) => {
              player.hasAttackedThisTurn = false;
              player.sidekickHasAttackedThisTurn = false;
            });

            // Set game state to player AFTER resetting everything
            gameState = "player";
            updateTurnIndicator();
            enableAttackButtonsForPlayerTurn();
          }

          draw();
          return; // Stop animation completely
        }
      } else if (state === "done") {
        // End bowser turn - this should only run once
        console.log("Bowser attack ending, resetting to player turn");

        // Completely reset bowser animation state
        bowser.anim = 0;
        bowser.attackOffset = { x: 0, y: 0 };
        bowserAttackAnim = false;
        bowserAttackAnimFrame = 0;

        // Check win/lose conditions
        if (players.every((p) => !p.alive)) {
          gameState = "gameover";
          turnIndicator.textContent = "Bowser Wins!";
          gameMusic.pause();
        } else {
          // Reset for next round
          playersThisRound = [];
          currentPlayer = players.findIndex((p) => p.alive);

          // Reset all player turn flags
          players.forEach((player) => {
            player.hasAttackedThisTurn = false;
            player.sidekickHasAttackedThisTurn = false;
          });

          // Set game state to player AFTER resetting everything
          gameState = "player";
          updateTurnIndicator();
          enableAttackButtonsForPlayerTurn();
        }

        draw();
        return; // Stop animation completely
      }

      draw();

      if (state !== "done") {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }
}

function updateTurnIndicator() {
  if (gameState === "player") {
    const name = players[currentPlayer].name || `Player ${currentPlayer + 1}`;
    turnIndicator.textContent = `${name}'s Turn`;
  } else if (gameState === "bowser") {
    turnIndicator.textContent = `Bowser Attacking!`;
  }
}

function getNextBowserIdleFrame(current) {
  // Weighted random: linger on frame 1 and 4, sometimes repeat or skip
  const weights = [0.12, 0.32, 0.12, 0.12, 0.24, 0.08];
  let r = Math.random();
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (r < acc) {
      // 35% chance to repeat current frame if it's frame 1 or 4
      if ((i === 1 || i === 4) && i === current && Math.random() < 0.35)
        return current;
      return i;
    }
  }
  // Fallback: next frame
  return (current + 1) % BOWSER_IDLE_FRAMES;
}

function updateFireworks() {
  // Add new fireworks randomly
  if (Math.random() < 0.08 && fireworks.length < 12) {
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
    fireworks.push({ particles });
  }
  // Update particles
  fireworks.forEach((fw) => {
    fw.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.vy += 0.04; // gravity
      p.alpha -= 0.018;
    });
  });
  // Remove finished fireworks
  fireworks = fireworks.filter((fw) => fw.particles.some((p) => p.alpha > 0));
}

function drawFireworks() {
  fireworks.forEach((fw) => {
    fw.particles.forEach((p) => {
      if (p.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }
    });
  });
}

// --- Global Pause/Resume System ---
let isGamePaused = false;
let pausedSFX = [];
let animationFrameId = null;

function pauseAllSFX() {
  // Pause all currently playing SFX
  pausedSFX = [];
  document.querySelectorAll("audio").forEach((audio) => {
    if (!audio.paused && !audio.ended) {
      audio.pause();
      pausedSFX.push(audio);
    }
  });
}
function resumeAllSFX() {
  pausedSFX.forEach((audio) => {
    try {
      audio.play();
    } catch (e) {}
  });
  pausedSFX = [];
}
function pauseGame() {
  isGamePaused = true;
  pauseAllSFX();
}
function resumeGame() {
  isGamePaused = false;
  resumeAllSFX();
  gameLoop();
}
// --- Patch playSound to track SFX ---
function playSound(name, volume = 1) {
  try {
    const audio = new Audio(name);
    audio.volume = volume * sfxVolume;
    audio.play().catch((error) => {
      // Silently handle audio playback errors (common with autoplay restrictions)
      console.log("Audio playback failed:", error.message);
    });
    // Track SFX for pausing if needed
    if (isGamePaused) {
      audio.pause();
      pausedSFX.push(audio);
    }
  } catch (error) {
    // Handle any other audio creation errors
    console.log("Audio creation failed:", error.message);
  }
}
// --- Patch gameLoop to respect pause ---
function gameLoop() {
  if (isGamePaused) return;

  // Performance optimization: Use throttled timestamp
  if (!window.lastFrameTime || Date.now() - window.lastFrameTime > 16) {
    window.lastFrameTime = Date.now();
  }

  updateFloatingDamages();
  updateClouds();
  updateSpecialProjectiles();

  // Update attack animations (consolidated system)
  updateAttackAnimation();

  // Animate player 1 (idle: frames 0-4)
  player1AnimTimer++;
  if (!player1AttackAnim && player1AnimTimer % 28 === 0) {
    player1Frame = (player1Frame + 1) % PLAYER1_IDLE_FRAMES; // Only use frames 0-4 for idle
  }
  // Animate Bowser Bowser idle or death
  if (bowserDeathAnim) {
    if (!bowserDeathDone) {
      bowserDeathFrameTimer++;
      // Slower, staggered animation: pause at intervals
      if (bowserDeathFrame < 2 && bowserDeathFrameTimer > 48) {
        // slower frame change
        bowserDeathFrame++;
        bowserDeathFrameTimer = 0;
      } else if (bowserDeathFrame === 2 && bowserDeathFrameTimer > 80) {
        // longer pause on last frame
        bowserDeathDone = true;
        bowserDeathFrameTimer = 0;
      }
    } else {
      // More staggered, slow drop with more frequent/longer pauses
      // Drop further (e.g., 900px instead of 600)
      if (bowserDeathY < 900) {
        // Pause for 0.7s every 60px
        if (
          Math.floor(bowserDeathY / 60) !== Math.floor((bowserDeathY + 2) / 60)
        ) {
          if (!bowserDeathAnim._pause) {
            bowserDeathAnim._pause = true;
            setTimeout(() => {
              bowserDeathAnim._pause = false;
            }, 700);
          }
        }
        if (!bowserDeathAnim._pause) {
          bowserDeathY += 1.0; // even slower drop
        }
      }
      // Show win screen much earlier in the drop (after 200px)
      if (!showWinScreen && bowserDeathY > 200) {
        showWinScreen = true;
        winScreenTimer = 0;
        fireworks = [];
        playSound(SFX.bowserExplode, 0.7);
        setTimeout(() => playSound(SFX.win, 0.7), 1200);
        playSound(SFX.bowserDefeat, 0.8); // Play Boss Defeat.wav
        gameMusic.pause();
        // Hide the UI when bowser dies
        const ui = document.getElementById("ui");
        if (ui) ui.style.display = "none";
        // Hide player sprites and health bars
        if (canvas) canvas.classList.add("hide-players");
      }
    }
  } else if (!bowserAttackAnim) {
    bowserIdleFrameTimer++;
    if (bowserIdleFrameTimer >= BOWSER_IDLE_FRAME_DURATIONS[bowserIdleFrame]) {
      bowserIdleFrame = getNextBowserIdleFrame(bowserIdleFrame);
      bowserIdleFrameTimer = 0;
    }
  } else {
    bowserIdleFrameTimer = 0;
  }
  booAnimTimer++;
  draw();
  if (showWinScreen) {
    updateFireworks();
    winScreenTimer++;
  }
  animationFrameId = requestAnimationFrame(gameLoop);
}

// Remove old attack button event listener - no longer needed with new UI
// attackBtn.addEventListener("click", () => {
//   if (gameState === "player") playerAttack();
// });

function restartGame() {
  // Reset players
  players.forEach((p) => {
    p.hp = PLAYER_MAX_HP;
    p.displayHp = PLAYER_MAX_HP;
    p.alive = true;
  });
  // Reset bowser
  bowser.hp = BOWSER_MAX_HP;
  bowser.displayHp = BOWSER_MAX_HP;
  bowser.alive = true;

  // Reset all animations and game state
  resetAllAnimations();

  updateTurnIndicator();
  // Remove old attack button reference - no longer needed with new UI
  // attackBtn.disabled = false;
  // Show UI again
  const ui = document.getElementById("ui");
  if (ui) ui.style.display = "";
  // Show players again
  if (canvas) canvas.classList.remove("hide-players");
  // Show turn indicator again
  const turnIndicatorElem = document.getElementById("turn-indicator");
  if (turnIndicatorElem) turnIndicatorElem.style.display = "";
  // Update attack buttons
  updateAttackButtons();
  draw();
}

// Init
draw();
updateTurnIndicator();
playersThisRound = [];
currentPlayer = players.findIndex((p) => p.alive);
// Start the main game loop
animationFrameId = requestAnimationFrame(gameLoop);

// Save/Load functionality
function saveGameState(saveName) {
  // Deep clone players and boss to avoid reference issues
  const saveData = {
    players: JSON.parse(JSON.stringify(players)),
    bowser: JSON.parse(JSON.stringify(bowser)),
    currentPlayer: currentPlayer,
    gameState: gameState,
    playersThisRound: JSON.parse(JSON.stringify(playersThisRound)),
    player1Frame: player1Frame,
    bowserFrame: bowserFrame,
    playerDamageDealt: [...playerDamageDealt],
    timestamp: Date.now(),
    saveName: saveName,
  };

  const saves = JSON.parse(localStorage.getItem("gameSaves") || "{}");
  saves[saveName] = saveData;
  localStorage.setItem("gameSaves", JSON.stringify(saves));
}

function loadGameState(saveName) {
  const saves = JSON.parse(localStorage.getItem("gameSaves") || "{}");
  const saveData = saves[saveName];

  if (saveData) {
    // Reset all animations first to ensure clean state
    resetAllAnimations();

    // Always reset players and boss to a clean state
    for (let i = 0; i < 4; i++) {
      players[i] = {
        hp: PLAYER_MAX_HP,
        displayHp: PLAYER_MAX_HP,
        alive: true,
        anim: 0,
        barShake: 0,
        attackOffset: { x: 0, y: 0 },
        spriteFile: undefined,
        name: "",
        _spriteImg: undefined,
      };
    }
    bowser.hp = BOWSER_MAX_HP;
    bowser.displayHp = BOWSER_MAX_HP;
    bowser.alive = true;
    bowser.anim = 0;
    bowser.barShake = 0;
    bowser.attackOffset = { x: 0, y: 0 };
    // Reset win/celebration state
    showWinScreen = false;
    winScreenTimer = 0;
    bowserDeathAnim = false;
    bowserDeathFrame = 0;
    bowserDeathFrameTimer = 0;
    bowserDeathY = 0;
    bowserDeathDone = false;
    fireworks = [];
    // Copy only expected properties from save
    for (let i = 0; i < 4; i++) {
      const src = saveData.players[i];
      if (src) {
        players[i].hp = src.hp;
        players[i].displayHp = src.displayHp;
        players[i].alive = src.alive;
        players[i].anim = src.anim;
        players[i].barShake = src.barShake;
        players[i].attackOffset = src.attackOffset || { x: 0, y: 0 };
        players[i].mainAttackOffset = src.mainAttackOffset || { x: 0, y: 0 };
        players[i].sidekickAttackOffset = src.sidekickAttackOffset || {
          x: 0,
          y: 0,
        };
        players[i].specialCharge = src.specialCharge || 0;
        players[i].specialReady = src.specialReady || false;
        players[i].teamBuff = src.teamBuff || 0;
        players[i].mainSpecialCharges = src.mainSpecialCharges || 2;
        players[i].sidekickSpecialCharges = src.sidekickSpecialCharges || 2;
        players[i].mainAttackSelected = src.mainAttackSelected || false;
        players[i].sidekickAttackSelected = src.sidekickAttackSelected || false;
        players[i].mainAttackType = src.mainAttackType || null;
        players[i].sidekickAttackType = src.sidekickAttackType || null;
        players[i].mainCharacter = src.mainCharacter;
        players[i].sidekickCharacter = src.sidekickCharacter;
        players[i].mainSpriteFile = src.mainSpriteFile;
        players[i].sidekickSpriteFile = src.sidekickSpriteFile;
        players[i].spriteFile = src.spriteFile;
        players[i].name = src.name || "";
        players[i]._spriteImg = undefined; // re-init
        players[i]._mainSpriteImg = undefined; // re-init
        players[i]._sidekickSpriteImg = undefined; // re-init
      }
    }
    const bowserSrc = saveData.bowser;
    if (bowserSrc) {
      bowser.hp = bowserSrc.hp;
      bowser.displayHp = bowserSrc.displayHp;
      bowser.alive = bowserSrc.alive;
      bowser.anim = bowserSrc.anim;
      bowser.barShake = bowserSrc.barShake;
      bowser.attackOffset = bowserSrc.attackOffset || { x: 0, y: 0 };
    }
    currentPlayer = saveData.currentPlayer;
    gameState = saveData.gameState;
    playersThisRound = Array.isArray(saveData.playersThisRound)
      ? [...saveData.playersThisRound]
      : [];
    player1Frame = saveData.player1Frame;
    bowserFrame = saveData.bowserFrame;
    playerDamageDealt = Array.isArray(saveData.playerDamageDealt)
      ? [...saveData.playerDamageDealt]
      : [0, 0, 0, 0];

    updateTurnIndicator();
    updateAttackButtons(); // Update attack buttons with character special attack names
    // Remove old attack button reference - no longer needed with new UI
    // attackBtn.disabled = gameState !== "player";
    draw();
    // If character select is visible, switch to fight screen
    const charSel = document.getElementById("character-select-screen");
    const gameCont = document.getElementById("game-container");
    if (charSel && charSel.style.display !== "none") {
      charSel.style.display = "none";
      if (gameCont) gameCont.style.display = "";

      // Stop character select video when loading saved game
      if (window.characterSelectVideoControl) {
        window.characterSelectVideoControl.stop();
      }

      // After switching to fight screen, ensure correct menu button is visible
      setCharMenuVisibility(false);
      setFightMenuVisibility(true);
      // Pause menu music when loading a save
      menuMusic.pause();
    }
  }
}

function deleteSave(saveName) {
  const saves = JSON.parse(localStorage.getItem("gameSaves") || "{}");
  delete saves[saveName];
  localStorage.setItem("gameSaves", JSON.stringify(saves));
  updateSaveSlots();
}

function updateSaveSlots() {
  const saveSlots = document.getElementById("save-slots");
  const saves = JSON.parse(localStorage.getItem("gameSaves") || "{}");

  saveSlots.innerHTML = "";

  Object.keys(saves).forEach((saveName) => {
    const saveData = saves[saveName];
    const date = new Date(saveData.timestamp);
    const slot = document.createElement("div");
    slot.className = "save-slot";

    // Create the info section
    const infoDiv = document.createElement("div");
    infoDiv.className = "save-slot-info";

    // Basic save info
    const basicInfo = document.createElement("div");
    basicInfo.innerHTML = `
      <strong>${saveName}</strong><br>
      <small>${date.toLocaleString()}</small>
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
      deleteSave(saveName);
    };
    actionsDiv.appendChild(deleteBtn);

    slot.appendChild(actionsDiv);

    slot.onclick = (e) => {
      if (!e.target.classList.contains("delete-save")) {
        loadGameState(saveName);
        closeModal();
      }
    };
    saveSlots.appendChild(slot);
  });
}

function openModal(mode) {
  const modal = document.getElementById("save-modal");
  const title = document.getElementById("modal-title");
  const saveSection = document.getElementById("save-input-section");
  const loadSection = document.getElementById("load-section");
  const saveSlotsSave = document.getElementById("save-slots-save");
  let selectedSaveName = null;

  if (mode === "save") {
    title.textContent = "Save Game";
    saveSection.style.display = "block";
    loadSection.style.display = "none";
    // Show save slots for overwrite
    if (saveSlotsSave) {
      const saves = JSON.parse(localStorage.getItem("gameSaves") || "{}");
      saveSlotsSave.innerHTML = "";
      Object.keys(saves).forEach((saveName) => {
        const saveData = saves[saveName];
        const date = new Date(saveData.timestamp);
        const slot = document.createElement("div");
        slot.className = "save-slot";

        // Create the info section
        const infoDiv = document.createElement("div");
        infoDiv.className = "save-slot-info";

        // Basic save info
        const basicInfo = document.createElement("div");
        basicInfo.innerHTML = `
          <strong>${saveName}</strong><br>
          <small>${date.toLocaleString()}</small>
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
          // If already selected, unselect
          const alreadySelected = slot.classList.contains("selected");
          saveSlotsSave
            .querySelectorAll(".save-slot")
            .forEach((s) => s.classList.remove("selected"));
          const warn = document.getElementById("overwrite-warning");
          if (alreadySelected) {
            document.getElementById("save-name").value = "";
            selectedSaveName = null;
            // Hide warning
            if (warn) warn.classList.add("inactive");
          } else {
            document.getElementById("save-name").value = saveName;
            selectedSaveName = saveName;
            slot.classList.add("selected");
            // Show overwrite warning
            if (warn) warn.classList.remove("inactive");
          }
        };
        saveSlotsSave.appendChild(slot);
      });
    }
    // Clear highlight/input on open
    document.getElementById("save-name").oninput = () => {
      selectedSaveName = null;
      if (saveSlotsSave)
        saveSlotsSave
          .querySelectorAll(".save-slot")
          .forEach((s) => s.classList.remove("selected"));
      // Hide overwrite warning
      const warn = document.getElementById("overwrite-warning");
      if (warn) warn.classList.add("inactive");
    };
    // Hide warning on modal open
    const warn = document.getElementById("overwrite-warning");
    if (warn) warn.classList.add("inactive");
  } else {
    title.textContent = "Load Game";
    saveSection.style.display = "none";
    loadSection.style.display = "block";
    updateSaveSlots();
  }

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("save-modal").style.display = "none";
  document.getElementById("save-name").value = "";

  // Reset animation states when closing modal
  resetAllAnimations();
}

// Event listeners for save/load
const saveGameBtn = document.getElementById("save-game");
if (saveGameBtn) {
  saveGameBtn.addEventListener("click", () => {
    openModal("save");
  });
}
const loadGameBtn = document.getElementById("load-game");
if (loadGameBtn) {
  loadGameBtn.addEventListener("click", () => {
    openModal("load");
  });
}

document.getElementById("confirm-save").addEventListener("click", () => {
  const saveName = document.getElementById("save-name").value.trim();
  if (saveName) {
    saveGameState(saveName);
    closeModal();
  }
});

document.getElementById("close-modal").addEventListener("click", closeModal);

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  const modal = document.getElementById("save-modal");
  if (e.target === modal) {
    closeModal();
  }
});

// On page load, show character select
showCharacterSelect();
// Ensure correct menu button is visible on page load
if (
  document.getElementById("character-select-screen").style.display !== "none"
) {
  setCharMenuVisibility(true);
  setFightMenuVisibility(false);
} else {
  setCharMenuVisibility(false);
  setFightMenuVisibility(true);
}

// --- Return to Main Menu logic ---
const returnMainMenuBtn = document.getElementById("return-main-menu");
const confirmModal = document.getElementById("confirm-modal");
const confirmYesBtn = document.getElementById("confirm-yes");
const confirmNoBtn = document.getElementById("confirm-no");

if (returnMainMenuBtn) {
  returnMainMenuBtn.addEventListener("click", () => {
    confirmModal.style.display = "flex";
  });
}
if (confirmNoBtn) {
  confirmNoBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });
}
if (confirmYesBtn) {
  confirmYesBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
    // Reset game state and show character select
    players.forEach((p) => {
      p.hp = PLAYER_MAX_HP;
      p.displayHp = PLAYER_MAX_HP;
      p.alive = true;
      p.spriteFile = undefined;
      p.name = "";
      p._spriteImg = undefined;
    });
    bowser.hp = BOWSER_MAX_HP;
    bowser.displayHp = BOWSER_MAX_HP;
    bowser.alive = true;

    // Reset all animations and game state
    resetAllAnimations();

    // Show character select
    showCharacterSelect();
    setCharMenuVisibility(true);
    setFightMenuVisibility(false);
    // Pause music if desired, or keep playing
    draw();
  });
}

// --- Music controls for select screen ---
function renderMusicControls(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;
  container.innerHTML = `
    <input id="music-volume-select" type="range" min="0" max="1" step="0.01" value="${
      menuMusic.volume
    }">
    <button id="music-mute-select" title="Mute/Unmute" style="margin-left:8px;">${
      menuMusic.muted ? "🔇" : "🔊"
    }</button>
  `;
  document.getElementById("music-volume-select").oninput = (e) => {
    menuMusic.volume = parseFloat(e.target.value);
    // Sync main music slider if present
    const mainVol = document.getElementById("music-volume");
    if (mainVol) mainVol.value = e.target.value;
  };
  const muteBtn = document.getElementById("music-mute-select");
  if (muteBtn) {
    muteBtn.onclick = () => {
      const isMuted = menuMusic.muted && gameMusic.muted;
      menuMusic.muted = !isMuted;
      gameMusic.muted = !isMuted;
      muteBtn.textContent = isMuted ? "🔊" : "🔇";
      // Sync main mute button
      const mainMute = document.getElementById("music-mute");
      if (mainMute) mainMute.textContent = isMuted ? "🔊" : "🔇";
    };
    setInterval(() => {
      const isMuted = menuMusic.muted && gameMusic.muted;
      muteBtn.textContent = isMuted ? "🔇" : "🔊";
    }, 500);
  }
}

// --- Load Save button for select screen ---
function attachLoadSaveSelectBtn() {
  const loadSaveSelectBtn = document.getElementById("load-save-select");
  if (loadSaveSelectBtn) {
    loadSaveSelectBtn.onclick = () => openModal("load");
  }
}

// Render music controls on select screen
renderMusicControls("music-controls-select");
attachLoadSaveSelectBtn();

// Patch showCharacterSelect to re-attach listeners after re-render
const _origShowCharacterSelect = showCharacterSelect;
showCharacterSelect = function () {
  _origShowCharacterSelect();
  renderMusicControls("music-controls-select");
  attachLoadSaveSelectBtn();
  setCharMenuVisibility(true);
  setFightMenuVisibility(false);
  charMenuBtn.style.display = "";
};

// Keep music sliders in sync between menuMusic and gameMusic
const mainMusicVol = document.getElementById("music-volume");
if (mainMusicVol) {
  mainMusicVol.oninput = (e) => {
    gameMusic.volume = parseFloat(e.target.value);
    menuMusic.volume = parseFloat(e.target.value);
    const selectVol = document.getElementById("music-volume-select");
    if (selectVol) selectVol.value = e.target.value;
  };
}

// --- Sound effects ---
const SOUND_PATH = "sounds/";
const SFX = {
  playerAttack: SOUND_PATH + "Squeak.wav",
  bowserAttack: SOUND_PATH + "Castle Explode.wav",
  playerHit: SOUND_PATH + "Boss Hit.wav",
  bossHit: SOUND_PATH + "Bowser Hit.wav",
  playerDeath: SOUND_PATH + "Hurt.wav",
  bowserDeath: SOUND_PATH + "Boss Defeat.wav",
  bowserExplode: SOUND_PATH + "Boss Explode.wav",
  win: SOUND_PATH + "World Complete.wav",
  select: SOUND_PATH + "Select.wav",
  pause: SOUND_PATH + "Pause.wav",
  wrong: SOUND_PATH + "Wrong.wav",
  clank1: SOUND_PATH + "Clank 1.wav",
  clank2: SOUND_PATH + "Clank 2.wav",
  pipe: SOUND_PATH + "Pipe.wav",
};

// --- Title Screen Logic ---
const GAME_TITLE = "SUPER SMASH SHOWDOWN"; // You can change this name!
const titleScreen = document.getElementById("title-screen");
const titleCanvas = document.getElementById("title-canvas");
const titleText = document.getElementById("title-text");
let titleSprites = [];

// Update title text to include game title and click-to-start
if (titleText) {
  titleText.innerHTML = `
    <object id="super-smash-svg" type="image/svg+xml" data="SuperSmashShowdown.svg" class="rainbow-svg-title" style="display:block;margin:0 auto;width:90%;max-width:600px;height:auto;"></object>
    <br><span class="click-to-start-outline">Click to start</span>
  `;
}

function resizeTitleCanvas() {
  titleCanvas.width = window.innerWidth;
  titleCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeTitleCanvas);
resizeTitleCanvas();

// Load all selectable sprites for the title screen
function loadTitleSprites() {
  titleSprites = SPRITE_FILES.map((file) => {
    const img = new window.Image();
    img.src = SPRITES_FOLDER + file;
    return img;
  });
}
loadTitleSprites();

let titleAnimationId = null;
let isTitleScreenVisible = false;

function drawTitleScreen() {
  // Only animate if title screen is visible
  if (!isTitleScreenVisible) {
    titleAnimationId = null;
    return;
  }

  const ctx = titleCanvas.getContext("2d");
  ctx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);

  // --- Animated SNES border ---
  const t = Date.now() / 1000;
  const cx = titleCanvas.width / 2;
  const cy = titleCanvas.height / 2;
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
      titleCanvas.width - borderW - i * 4,
      titleCanvas.height - borderW - i * 4
    );
    ctx.restore();
  }

  // --- Scanline overlay ---
  ctx.save();
  ctx.globalAlpha = 0.13;
  for (let y = 0; y < titleCanvas.height; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? "#fff" : "#000";
    ctx.fillRect(0, y, titleCanvas.width, 2);
  }
  ctx.restore();

  // Arrange sprites in a circle, with some random offset for excitement
  const radius = Math.min(cx, cy) * 0.6;
  const count = titleSprites.length;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x =
      cx + Math.cos(angle) * radius + Math.sin(Date.now() / 900 + i) * 24;
    const y =
      cy + Math.sin(angle) * radius + Math.cos(Date.now() / 700 + i) * 24;
    const img = titleSprites[i];
    // Maintain aspect ratio
    let baseSize = 120 + Math.sin(Date.now() / 500 + i * 2) * 18;
    let drawW = baseSize,
      drawH = baseSize;
    if (img.naturalWidth && img.naturalHeight) {
      const aspect = img.naturalWidth / img.naturalHeight;
      if (aspect > 1) {
        // Wider than tall - fit to width
        drawW = baseSize;
        drawH = baseSize / aspect;
      } else {
        // Taller than wide - fit to height
        drawH = baseSize;
        drawW = baseSize * aspect;
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

  titleAnimationId = requestAnimationFrame(drawTitleScreen);
}

function startTitleAnimation() {
  isTitleScreenVisible = true;
  if (!titleAnimationId) {
    drawTitleScreen();
  }
}

function stopTitleAnimation() {
  isTitleScreenVisible = false;
  if (titleAnimationId) {
    cancelAnimationFrame(titleAnimationId);
    titleAnimationId = null;
  }

  // Also pause title video when stopping animation
  const titleVideo = document.getElementById("title-video");
  if (titleVideo) {
    titleVideo.pause();
  }
}

// Initialize title screen
startTitleAnimation();

// Show only title screen on load
function showTitleScreen() {
  titleScreen.classList.remove("hide");
  document.getElementById("character-select-screen").style.display = "none";
  document.getElementById("game-container").style.display = "none";

  // Stop character select video when returning to title screen
  if (window.characterSelectVideoControl) {
    window.characterSelectVideoControl.stop();
  }

  // Start title screen animation
  startTitleAnimation();

  // Optionally pause menu music until character select
  menuMusic.pause();
}
showTitleScreen();

// Title screen click logic
if (titleScreen) {
  titleScreen.onclick = () => {
    // Hide the "Click to start" text immediately
    const clickToStartText = titleScreen.querySelector(
      ".click-to-start-outline"
    );
    if (clickToStartText) {
      clickToStartText.style.display = "none";
    }

    // Play pipe.wav, then proceed to character select after sound finishes
    const audio = new Audio(SFX.pipe);
    audio.volume = sfxVolume;
    audio.play();
    titleScreen.style.pointerEvents = "none";
    audio.onended = () => {
      titleScreen.classList.add("hide");
      // Stop title animation when leaving title screen
      stopTitleAnimation();
      showCharacterSelect();
      menuMusic.currentTime = 0;
      menuMusic.play().catch((error) => {
        console.log("Menu music playback failed:", error.message);
      });
    };
  };
}

// Play wrong.wav when clicking a disabled button
if (!window._wrongSFXHandlerAttached) {
  document.addEventListener(
    "click",
    function (e) {
      if (e.target instanceof HTMLButtonElement && e.target.disabled) {
        playSound(SFX.wrong, 0.7);
      }
    },
    true
  );
  window._wrongSFXHandlerAttached = true;
}

// After music volume slider event listener in main UI
const musicMuteBtn = document.getElementById("music-mute");
if (musicMuteBtn) {
  let wasMusicMuted = false;
  musicMuteBtn.onclick = () => {
    const isMuted = menuMusic.muted && gameMusic.muted;
    menuMusic.muted = !isMuted;
    gameMusic.muted = !isMuted;
    musicMuteBtn.textContent = isMuted ? "🔊" : "🔇";
    wasMusicMuted = !isMuted;
  };
  // Keep icon in sync if user changes mute elsewhere
  setInterval(() => {
    const isMuted = menuMusic.muted && gameMusic.muted;
    musicMuteBtn.textContent = isMuted ? "🔇" : "🔊";
  }, 500);
}

function createDragImage(file, fallbackImg) {
  // Use fallback image directly since drag images don't exist
  return fallbackImg;
}
function makeSpriteOptionDraggable(opt, idx, file, type, isSelected) {
  if (isSelected) {
    opt.removeAttribute("draggable");
    opt.ondragstart = null;
    opt.ondragend = null;
    // Remove drag prevention from image
    const img = opt.querySelector("img");
    if (img) {
      img.ondragstart = null;
      img.draggable = false;
    }
  } else {
    opt.setAttribute("draggable", "true");
    // Prevent default drag on the image element
    const img = opt.querySelector("img");
    if (img) {
      img.draggable = false;
      img.ondragstart = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
    }
    opt.ondragstart = (e) => {
      const dragData = { idx, file, type, source: "grid" };
      // Set global drag data for highlighting
      currentDragData = dragData;
      e.dataTransfer.setData("application/json", JSON.stringify(dragData));
      // Use the original sprite image for drag
      const img = opt.querySelector("img");
      if (
        img &&
        img.complete &&
        img.naturalWidth > 0 &&
        img.naturalHeight > 0
      ) {
        const canvas = document.createElement("canvas");
        canvas.width = 72;
        canvas.height = 72;
        const ctx = canvas.getContext("2d");
        let drawW = 72,
          drawH = 72;
        const aspect = img.naturalWidth / img.naturalHeight;
        if (aspect > 1) {
          drawW = 72;
          drawH = 72 / aspect;
        } else {
          drawH = 72;
          drawW = 72 * aspect;
        }
        ctx.clearRect(0, 0, 72, 72);
        ctx.drawImage(img, (72 - drawW) / 2, (72 - drawH) / 2, drawW, drawH);
        e.dataTransfer.setDragImage(canvas, 36, 36);
      }
    };
    opt.ondragend = (e) => {
      // Clear global drag data if drag ends without dropping
      currentDragData = null;
    };
  }
}

function makeCharBoxDroppable(box, playerIndex, charType) {
  box.ondragover = (e) => {
    e.preventDefault();
    box.classList.add("drag-over");
  };
  box.ondragleave = (e) => {
    box.classList.remove("drag-over");
  };
  box.ondrop = (e) => {
    e.preventDefault();
    box.classList.remove("drag-over");
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch (err) {
      console.error("Failed to parse drag data:", err);
      return;
    }
    console.log(
      "Dropping on player",
      playerIndex,
      "charType",
      charType,
      "data:",
      data
    );
    if (!data || !data.file || !data.type) return;
    // Only allow main->main and sidekick->sidekick
    if (data.type !== charType) return;
    // If dropping from grid
    if (data.source === "grid") {
      console.log("Dropping from grid to player", playerIndex);
      // Find if this sprite is already selected elsewhere and remove it
      let removedFromPlayer = null;
      selectedSprites.forEach((s, idx) => {
        if (!s) return;
        if (charType === "main" && s.main && s.main.idx === data.idx) {
          console.log("Removing main from player", idx);
          selectedSprites[idx].main = null;
          removedFromPlayer = idx;
        }
        if (
          charType === "sidekick" &&
          s.sidekick &&
          s.sidekick.idx === data.idx
        ) {
          console.log("Removing sidekick from player", idx);
          selectedSprites[idx].sidekick = null;
          removedFromPlayer = idx;
        }
      });

      // If we removed from a player and that player now has no characters, clear the slot
      if (removedFromPlayer !== null) {
        const s = selectedSprites[removedFromPlayer];
        if (
          (!s.main && !s.sidekick) ||
          (s.main === null && s.sidekick === null)
        ) {
          console.log("Clearing empty player slot", removedFromPlayer);
          selectedSprites[removedFromPlayer] = null;
          selectedNames[removedFromPlayer] = "";
        }
      }

      // Override target slot
      if (!selectedSprites[playerIndex]) selectedSprites[playerIndex] = {};
      selectedSprites[playerIndex][charType] = {
        idx: data.idx,
        file: data.file,
      };
      console.log("Updated selectedSprites:", selectedSprites);
      updateSelectedCharacters();
    } else if (data.source === "player") {
      console.log(
        "Dropping from player",
        data.playerIndex,
        "to player",
        playerIndex,
        "charType",
        charType
      );
      // Move from another player box
      if (data.playerIndex === playerIndex && data.charType === charType) {
        console.log("Same slot, ignoring");
        return; // same slot
      }
      // Remove from old slot
      if (selectedSprites[data.playerIndex]) {
        console.log(
          "Checking player",
          data.playerIndex,
          "for",
          data.charType,
          ":",
          selectedSprites[data.playerIndex]
        );

        // Check new format first (main/sidekick properties)
        if (selectedSprites[data.playerIndex][data.charType]) {
          console.log("Removing from old player slot", data.playerIndex);
          selectedSprites[data.playerIndex][data.charType] = null;
          // If both main and sidekick are now null, clear the slot
          const s = selectedSprites[data.playerIndex];
          if (
            (!s.main && !s.sidekick) ||
            (s.main === null && s.sidekick === null)
          ) {
            console.log("Clearing empty player slot", data.playerIndex);
            selectedSprites[data.playerIndex] = null;
            selectedNames[data.playerIndex] = "";
          }
        }
        // Check old format (type property)
        else if (selectedSprites[data.playerIndex].type === data.charType) {
          console.log(
            "Removing from old player slot (old format)",
            data.playerIndex
          );
          selectedSprites[data.playerIndex] = null;
          selectedNames[data.playerIndex] = "";
        } else {
          console.log(
            "No",
            data.charType,
            "found in player",
            data.playerIndex,
            "structure:",
            selectedSprites[data.playerIndex]
          );
        }
      }
      // Override target slot
      if (!selectedSprites[playerIndex]) selectedSprites[playerIndex] = {};
      selectedSprites[playerIndex][charType] = {
        idx: data.idx,
        file: data.file,
      };
      console.log("Updated selectedSprites:", selectedSprites);
      updateSelectedCharacters();
    }
  };
}

// Global variable to store current drag data
let currentDragData = null;

// New function to make the entire selected character container droppable
function makeSelectedCharContainerDroppable(container, playerIndex) {
  container.ondragover = (e) => {
    e.preventDefault();

    // Use the global drag data instead of trying to parse it
    if (!currentDragData || !currentDragData.file || !currentDragData.type)
      return;

    // Highlight the appropriate slot based on the dragged character type
    const mainCharDiv = container.querySelector(".main-char");
    const sidekickCharDiv = container.querySelector(".sidekick-char");

    // Remove any existing highlights
    mainCharDiv?.classList.remove("drag-over");
    sidekickCharDiv?.classList.remove("drag-over");

    // Highlight the appropriate slot
    if (currentDragData.type === "main" && mainCharDiv) {
      mainCharDiv.classList.add("drag-over");
    } else if (currentDragData.type === "sidekick" && sidekickCharDiv) {
      sidekickCharDiv.classList.add("drag-over");
    }
  };

  container.ondragleave = (e) => {
    // Only remove highlight if we're leaving the container entirely
    if (!container.contains(e.relatedTarget)) {
      const mainCharDiv = container.querySelector(".main-char");
      const sidekickCharDiv = container.querySelector(".sidekick-char");
      mainCharDiv?.classList.remove("drag-over");
      sidekickCharDiv?.classList.remove("drag-over");
    }
  };

  container.ondrop = (e) => {
    e.preventDefault();
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch (err) {
      console.error("Failed to parse drag data:", err);
      return;
    }

    // Clear the global drag data
    currentDragData = null;

    // Remove highlights
    const mainCharDiv = container.querySelector(".main-char");
    const sidekickCharDiv = container.querySelector(".sidekick-char");
    mainCharDiv?.classList.remove("drag-over");
    sidekickCharDiv?.classList.remove("drag-over");

    if (!data || !data.file || !data.type) return;

    // Determine which slot to drop into based on character type
    const charType = data.type;

    // Check if the target slot is empty before dropping
    const targetSlot = charType === "main" ? mainCharDiv : sidekickCharDiv;
    const isTargetSlotEmpty =
      targetSlot && targetSlot.classList.contains("empty-slot");

    // If dropping from grid
    if (data.source === "grid") {
      console.log(
        "Dropping from grid to player",
        playerIndex,
        "charType",
        charType
      );
      // Find if this sprite is already selected elsewhere and remove it
      let removedFromPlayer = null;
      selectedSprites.forEach((s, idx) => {
        if (!s) return;
        if (charType === "main" && s.main && s.main.idx === data.idx) {
          console.log("Removing main from player", idx);
          selectedSprites[idx].main = null;
          removedFromPlayer = idx;
        }
        if (
          charType === "sidekick" &&
          s.sidekick &&
          s.sidekick.idx === data.idx
        ) {
          console.log("Removing sidekick from player", idx);
          selectedSprites[idx].sidekick = null;
          removedFromPlayer = idx;
        }
      });

      // If we removed from a player and that player now has no characters, clear the slot
      if (removedFromPlayer !== null) {
        const s = selectedSprites[removedFromPlayer];
        if (
          (!s.main && !s.sidekick) ||
          (s.main === null && s.sidekick === null)
        ) {
          console.log("Clearing empty player slot", removedFromPlayer);
          selectedSprites[removedFromPlayer] = null;
          selectedNames[removedFromPlayer] = "";
        }
      }

      // Override target slot
      if (!selectedSprites[playerIndex]) selectedSprites[playerIndex] = {};
      selectedSprites[playerIndex][charType] = {
        idx: data.idx,
        file: data.file,
      };
      console.log("Updated selectedSprites:", selectedSprites);
      updateSelectedCharacters();

      // Play appropriate sound based on whether slot was empty
      if (isTargetSlotEmpty) {
        playSound(SFX.select);
      } else {
        playSound(SFX.clank1);
      }
    } else if (data.source === "player") {
      console.log(
        "Dropping from player",
        data.playerIndex,
        "to player",
        playerIndex,
        "charType",
        charType
      );
      // Move from another player box
      if (data.playerIndex === playerIndex && data.charType === charType) {
        console.log("Same slot, ignoring");
        return; // same slot
      }
      // Remove from old slot
      if (selectedSprites[data.playerIndex]) {
        console.log(
          "Checking player",
          data.playerIndex,
          "for",
          data.charType,
          ":",
          selectedSprites[data.playerIndex]
        );

        // Check new format first (main/sidekick properties)
        if (selectedSprites[data.playerIndex][data.charType]) {
          console.log("Removing from old player slot", data.playerIndex);
          selectedSprites[data.playerIndex][data.charType] = null;
          // If both main and sidekick are now null, clear the slot
          const s = selectedSprites[data.playerIndex];
          if (
            (!s.main && !s.sidekick) ||
            (s.main === null && s.sidekick === null)
          ) {
            console.log("Clearing empty player slot", data.playerIndex);
            selectedSprites[data.playerIndex] = null;
            selectedNames[data.playerIndex] = "";
          }
        }
        // Check old format (type property)
        else if (selectedSprites[data.playerIndex].type === data.charType) {
          console.log(
            "Removing from old player slot (old format)",
            data.playerIndex
          );
          selectedSprites[data.playerIndex] = null;
          selectedNames[data.playerIndex] = "";
        } else {
          console.log(
            "No",
            data.charType,
            "found in player",
            data.playerIndex,
            "structure:",
            selectedSprites[data.playerIndex]
          );
        }
      }
      // Override target slot
      if (!selectedSprites[playerIndex]) selectedSprites[playerIndex] = {};
      selectedSprites[playerIndex][charType] = {
        idx: data.idx,
        file: data.file,
      };
      console.log("Updated selectedSprites:", selectedSprites);
      updateSelectedCharacters();

      // Play appropriate sound based on whether slot was empty
      if (isTargetSlotEmpty) {
        playSound(SFX.select);
      } else {
        playSound(SFX.clank1);
      }
    }
  };
}

function makeCharBoxDraggable(box, idx, file, type, playerIndex, charType) {
  box.setAttribute("draggable", "true");
  // Prevent default drag on the image element
  const img = box.querySelector("img");
  if (img) {
    img.draggable = false;
    img.ondragstart = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
  }
  box.ondragstart = (e) => {
    const dragData = {
      idx,
      file,
      type,
      source: "player",
      playerIndex,
      charType,
    };
    // Set global drag data for highlighting
    currentDragData = dragData;
    console.log("Dragging from character box:", dragData);
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    // Use the original sprite image for drag
    const img = box.querySelector("img");
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = 72;
      canvas.height = 72;
      const ctx = canvas.getContext("2d");
      let drawW = 72,
        drawH = 72;
      const aspect = img.naturalWidth / img.naturalHeight;
      if (aspect > 1) {
        drawW = 72;
        drawH = 72 / aspect;
      } else {
        drawH = 72;
        drawW = 72 * aspect;
      }
      ctx.clearRect(0, 0, 72, 72);
      ctx.drawImage(img, (72 - drawW) / 2, (72 - drawH) / 2, drawW, drawH);
      e.dataTransfer.setDragImage(canvas, 36, 36);
    }
  };
  box.ondragend = (e) => {
    // Clear global drag data if drag ends without dropping
    currentDragData = null;
  };
}

// --- Attack Selection Functions ---
function selectMainAttack(type) {
  const player = players[currentPlayer];
  console.log("selectMainAttack called:", {
    type,
    player: !!player,
    alive: player?.alive,
    gameState,
  });

  if (!player.alive || gameState !== "player") {
    console.log(
      "selectMainAttack blocked: player not alive or not player turn"
    );
    return;
  }

  // Prevent selection during attacks or bowser turn
  if (bowserAttackAnim) {
    console.log("selectMainAttack blocked:", {
      bowserAttackAnim,
      gameState,
      currentPlayer,
    });
    return;
  }

  // Clear previous selection
  player.mainAttackSelected = false;
  player.mainAttackType = null;

  // Set new selection
  player.mainAttackSelected = true;
  player.mainAttackType = type;

  // Update UI
  updateAttackButtons();
  playSound(SFX.select, 0.5);
}

function selectSidekickAttack(type) {
  const player = players[currentPlayer];
  console.log("selectSidekickAttack called:", {
    type,
    player: !!player,
    alive: player?.alive,
    gameState,
  });

  if (!player.alive || gameState !== "player") {
    console.log(
      "selectSidekickAttack blocked: player not alive or not player turn"
    );
    return;
  }

  // Prevent selection during attacks or bowser turn
  if (bowserAttackAnim) {
    console.log("selectSidekickAttack blocked:", {
      bowserAttackAnim,
      gameState,
      currentPlayer,
    });
    return;
  }

  // Clear previous selection
  player.sidekickAttackSelected = false;
  player.sidekickAttackType = null;

  // Set new selection
  player.sidekickAttackSelected = true;
  player.sidekickAttackType = type;

  // Update UI
  updateAttackButtons();
  playSound(SFX.select, 0.5);
}

// Function to get special attack name for a character
function getSpecialAttackName(characterSprite, isMainCharacter = true) {
  if (isMainCharacter) {
    // Main character special attacks
    switch (characterSprite) {
      case "Mario_Fire.png":
        return "Fireball";
      case "Mario_Penguin.png":
        return "Blizzard";
      case "Mario_Cape.png":
      case "Mario_Raccoon.png":
        return "Fly";
      case "Mario_Giant.png":
        return "Mega stomp";
      case "Mario_Cat.png":
        return "Scratch";
      default:
        return "Special Attack";
    }
  } else {
    // Sidekick special attacks
    switch (characterSprite) {
      case "Sidekick_Peach.png":
        return "Healing aura";
      case "Sidekick_Toad.png":
        return "SCREAM!";
      case "Sidekick_Luigi.png":
        return "Double slap";
      case "Sidekick_Waluigi.png":
        return "Bomb throw";
      case "Sidekick_Wario.png":
        return "Fart bomb";
      case "Sidekick_DK.png":
        return "Double punch";
      default:
        return "Sidekick Attack";
    }
  }
}

function updateAttackButtons() {
  const player = players[currentPlayer];

  if (!player || !player.alive) {
    disableAllAttackButtons();
    return;
  }

  // Disable all buttons if not player turn or during animations
  if (gameState !== "player" || bowserAttackAnim) {
    disableAllAttackButtons();
    return;
  }

  // Get special attack names for current player's characters
  const mainSpecialName = getSpecialAttackName(player.mainCharacter, true);
  const sidekickSpecialName = getSpecialAttackName(
    player.sidekickCharacter,
    false
  );

  // Update main character buttons
  mainRegularBtn.classList.toggle(
    "selected",
    player.mainAttackType === "regular"
  );
  mainSpecialBtn.classList.toggle(
    "selected",
    player.mainAttackType === "special"
  );
  mainSpecialBtn.disabled = player.mainSpecialCharges <= 0;

  // Display main special charges with character's special attack name
  if (player.mainSpecialCharges > 0) {
    mainSpecialBtn.textContent = `${mainSpecialName} (${player.mainSpecialCharges}/2)`;
  } else {
    mainSpecialBtn.textContent = "No attacks left!";
  }

  // Update sidekick buttons
  sidekickRegularBtn.classList.toggle(
    "selected",
    player.sidekickAttackType === "regular"
  );
  sidekickSpecialBtn.classList.toggle(
    "selected",
    player.sidekickAttackType === "special"
  );
  sidekickSpecialBtn.disabled = player.sidekickSpecialCharges <= 0;

  // Display sidekick special charges with character's special attack name
  if (player.sidekickSpecialCharges > 0) {
    sidekickSpecialBtn.textContent = `${sidekickSpecialName} (${player.sidekickSpecialCharges}/2)`;
  } else {
    sidekickSpecialBtn.textContent = "No attacks left!";
  }

  // Update execute button
  const executeDisabled =
    !player.mainAttackSelected || !player.sidekickAttackSelected;
  executeAttacksBtn.disabled = executeDisabled;
}

function executeAttacks() {
  const player = players[currentPlayer];
  if (!player.alive || gameState !== "player") return;
  if (!player.mainAttackSelected || !player.sidekickAttackSelected) return;

  // Disable all attack buttons immediately to prevent multiple clicks
  disableAllAttackButtons();

  // Execute main character attack first
  if (player.mainAttackType === "special") {
    doMainSpecialAttack();
  } else {
    doMainRegularAttack();
  }
}

function doMainRegularAttack() {
  const player = players[currentPlayer];
  const positions = getCenteredPositions();

  playSound("sounds/Cut.mp3", 1);

  // Calculate damage and movement
  let damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
  let pos = positions.players[currentPlayer];
  let dx = (positions.bowser.x - pos.x) * 0.25;
  let dy = (positions.bowser.y - pos.y) * 0.25;

  // Use consolidated animation system
  startAttackAnimation({
    type: "main-regular",
    player: currentPlayer,
    animFrames: 58,
    damage: damage,
    dx: dx,
    dy: dy,
    windupDist: -30,
    onComplete: () => {
      // Deal damage
      bowser.hp -= damage;
      bowser.anim = 1;
      bowser.barShake = 1;
      playSound(SFX.bossHit, 0.5);
      showFloatingDamage(
        positions.bowser.x,
        positions.bowser.y - 70,
        "-" + damage
      );

      // Track damage dealt by this player
      playerDamageDealt[currentPlayer] += damage;

      setTimeout(() => {
        bowser.anim = 0;

        if (bowser.hp <= 0) {
          bowser.hp = 0;
          gameState = "gameover";
          turnIndicator.textContent = "";
          executeAttacksBtn.disabled = true;
          bowserDeathAnim = true;
          bowserDeathFrame = 0;
          bowserDeathFrameTimer = 0;
          bowserDeathY = 0;
          bowserDeathDone = false;
          playSound(SFX.bowserDeath, 0.7);
          gameMusic.pause();
        } else {
          // Now execute sidekick attack
          setTimeout(() => {
            executeSidekickAttack();
          }, 400);
        }
      }, 400);
    },
  });
}

function doMainSpecialAttack() {
  const player = players[currentPlayer];
  const positions = getCenteredPositions();
  let bowserPos = positions.bowser;
  let damage = 0;
  let color = "#fff";
  let label = "SPECIAL!";
  let effect = null;

  // Determine special by main character sprite file
  const mainChar = player.mainCharacter;

  if (mainChar === "Mario_Fire.png") {
    // Fire Mario: normal rng + burn
    playSound("sounds/Fire Punch.mp3", 1);
    damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    color = "#ff5722";
    label = "BURN!";
    if (!bowser.statusEffects.burn) {
      bowser.statusEffects.burn = { turns: 3 };
      effect = "Burn applied!";
    }
    // Create fireball projectile
    const playerPos = positions.players[currentPlayer];
    createFireballProjectile(
      playerPos.x,
      playerPos.y,
      bowserPos.x,
      bowserPos.y
    );
  } else if (mainChar === "Mario_Penguin.png") {
    // Penguin Mario: normal rng + freeze
    playSound("sounds/Ice Ball.mp3", 1);
    damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    color = "#00e5ff";
    label = "FREEZE!";
    if (!bowser.statusEffects.freeze) {
      bowser.statusEffects.freeze = { turns: 1 };
      effect = "Bowser frozen!";
    }
    // Create blizzard projectile
    const playerPos = positions.players[currentPlayer];
    createBlizzardProjectile(
      playerPos.x,
      playerPos.y,
      bowserPos.x,
      bowserPos.y
    );
  } else if (mainChar === "Mario_Cape.png") {
    // Mario Cape: fly out, then dive down into bowser
    playSound("sounds/Fly part 2.mp3", 1);
    damage = 7 + player.teamBuff;
    color = "#ffd600";
    label = "CRIT!";

    // Start custom cape fly animation using consolidated system
    let playerPos = positions.players[currentPlayer];
    let flyState = {
      phase: "arc",
      t: 0,
      marioX: playerPos.x,
      marioY: playerPos.y,
      startX: playerPos.x,
      startY: playerPos.y,
      bowserX: bowserPos.x,
      bowserY: bowserPos.y,
      peakY: playerPos.y - 450,
      impact: false,
    };
    player.capeFlyAnim = flyState;

    startAttackAnimation({
      type: "main-special-cape",
      player: currentPlayer,
      damage: damage,
      customAnimation: animateCapeFly,
      specialState: flyState,
      onImpact: () => {
        // Impact: apply damage, effects, etc.
        bowser.hp -= damage;
        bowser.anim = 1;
        bowser.barShake = 1.5;
        playSound(SFX.bossHit, 0.7);
        showFloatingDamage(
          bowserPos.x,
          bowserPos.y - 70,
          "-" + damage,
          color,
          label
        );
        playerDamageDealt[currentPlayer] += damage;
        setTimeout(() => {
          bowser.anim = 0;
        }, 400);
      },
      onComplete: () => {
        // End animation
        player.capeFlyAnim = null;
        player.anim = 0;
        player.mainAttackOffset = { x: 0, y: 0 };
        player.mainSpecialCharges--;
        updateAttackButtons();

        setTimeout(() => {
          if (bowser.hp <= 0) {
            bowser.hp = 0;
            gameState = "gameover";
            turnIndicator.textContent = "Players Win!";
            executeAttacksBtn.disabled = true;
            bowserDeathAnim = true;
            bowserDeathFrame = 0;
            bowserDeathFrameTimer = 0;
            bowserDeathY = 0;
            bowserDeathDone = false;
            playSound(SFX.bowserDeath, 0.7);
            gameMusic.pause();
          } else {
            // Now execute sidekick attack
            setTimeout(() => {
              executeSidekickAttack();
            }, 400);
          }
        }, 400);
      },
    });
    return; // Skip the rest of the default animation logic
  } else if (mainChar === "Mario_Raccoon.png") {
    // Mario Raccoon: fly out, then dive down into bowser (same as Cape Mario)
    playSound("sounds/Fly part 2.mp3", 1);
    damage = 7 + player.teamBuff;
    color = "#ffd600";
    label = "CRIT!";

    // Start custom raccoon fly animation (same as cape) using consolidated system
    let playerPos = positions.players[currentPlayer];
    let flyState = {
      phase: "arc",
      t: 0,
      marioX: playerPos.x,
      marioY: playerPos.y,
      startX: playerPos.x,
      startY: playerPos.y,
      bowserX: bowserPos.x,
      bowserY: bowserPos.y,
      peakY: playerPos.y - 450,
      impact: false,
    };
    player.capeFlyAnim = flyState;

    startAttackAnimation({
      type: "main-special-raccoon",
      player: currentPlayer,
      damage: damage,
      customAnimation: animateCapeFly, // Same animation as cape
      specialState: flyState,
      onImpact: () => {
        // Impact: apply damage, effects, etc.
        bowser.hp -= damage;
        bowser.anim = 1;
        bowser.barShake = 1.5;
        playSound(SFX.bossHit, 0.7);
        showFloatingDamage(
          bowserPos.x,
          bowserPos.y - 70,
          "-" + damage,
          color,
          label
        );
        playerDamageDealt[currentPlayer] += damage;
        setTimeout(() => {
          bowser.anim = 0;
        }, 400);
      },
      onComplete: () => {
        // End animation
        player.capeFlyAnim = null;
        player.anim = 0;
        player.mainAttackOffset = { x: 0, y: 0 };
        player.mainSpecialCharges--;
        updateAttackButtons();

        setTimeout(() => {
          if (bowser.hp <= 0) {
            bowser.hp = 0;
            gameState = "gameover";
            turnIndicator.textContent = "Players Win!";
            executeAttacksBtn.disabled = true;
            bowserDeathAnim = true;
            bowserDeathFrame = 0;
            bowserDeathFrameTimer = 0;
            bowserDeathY = 0;
            bowserDeathDone = false;
            playSound(SFX.bowserDeath, 0.7);
            gameMusic.pause();
          } else {
            // Now execute sidekick attack
            setTimeout(() => {
              executeSidekickAttack();
            }, 400);
          }
        }, 400);
      },
    });
    return; // Skip the rest of the default animation logic
  } else if (mainChar === "Mario_Giant.png") {
    // Giant Mario: double damage with stomp effect and generic animation
    playSound("sounds/Cut.mp3", 1); // Placeholder sound until specific sound is found
    damage = (Math.floor(Math.random() * 6) + 1 + player.teamBuff) * 2;
    color = "#bdbdbd";
    label = "SMASH!";
    triggerScreenShake();
    // Create giant stomp effect
    const playerPos = positions.players[currentPlayer];
    createGiantStompEffect(playerPos.x, playerPos.y, bowserPos.x, bowserPos.y);
    // Giant Mario uses generic animation + effects
  } else if (mainChar === "Mario_Cat.png") {
    // Cat Mario: normal rng + bleed + scratch projectile with leap animation
    playSound("sounds/Fury Swipes 1hit.mp3", 1);
    damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    color = "#ffb300";
    label = "BLEED!";
    if (!bowser.statusEffects.bleed) {
      bowser.statusEffects.bleed = { turns: 3 };
      effect = "Bleed applied!";
    }

    // Start cat leap animation using consolidated system
    const playerPos = positions.players[currentPlayer];
    const bowserTarget = positions.bowser;

    let leapState = {
      phase: "leap", // aggressive leap motion
      t: 0,
      marioX: playerPos.x,
      marioY: playerPos.y,
      startX: playerPos.x,
      startY: playerPos.y,
      bowserX: bowserTarget.x,
      bowserY: bowserTarget.y,
      peakY: playerPos.y - 180, // lower arc than cape fly, more aggressive
      impact: false,
    };
    player.catLeapAnim = leapState;

    startAttackAnimation({
      type: "main-special-cat",
      player: currentPlayer,
      damage: damage,
      customAnimation: animateCatLeap,
      specialState: leapState,
      onImpact: () => {
        // Create scratch projectile at impact point
        createScratchProjectile(
          bowserTarget.x,
          bowserTarget.y,
          bowserTarget.x,
          bowserTarget.y
        );
        // Add some screen shake for impact
        triggerScreenShake();
      },
      onComplete: () => {
        // End animation
        player.catLeapAnim = null;
        player.anim = 0;
        player.mainAttackOffset = { x: 0, y: 0 };

        // Apply damage and effects
        if (damage > 0) {
          bowser.hp -= damage;
          bowser.anim = 1;
          bowser.barShake = 1.5;
          playSound(SFX.bossHit, 0.7);
          showFloatingDamage(
            bowserPos.x,
            bowserPos.y - 70,
            "-" + damage,
            color,
            label
          );
          playerDamageDealt[currentPlayer] += damage;
        }

        // Show effect text if any
        if (effect) {
          showFloatingDamage(bowserPos.x, bowserPos.y - 120, effect, color);
        }

        // Use special charge
        player.mainSpecialCharges--;
        updateAttackButtons();

        setTimeout(() => {
          bowser.anim = 0;

          if (bowser.hp <= 0) {
            bowser.hp = 0;
            gameState = "gameover";
            turnIndicator.textContent = "Players Win!";
            executeAttacksBtn.disabled = true;
            bowserDeathAnim = true;
            bowserDeathFrame = 0;
            bowserDeathFrameTimer = 0;
            bowserDeathY = 0;
            bowserDeathDone = false;
            playSound(SFX.bowserDeath, 0.7);
            gameMusic.pause();
          } else {
            // Now execute sidekick attack
            setTimeout(() => {
              executeSidekickAttack();
            }, 400);
          }
        }, 400);
      },
    });
    return; // Don't run generic animation
  } else {
    // Default characters: Fire, Penguin, etc. use generic animation with projectiles
    if (mainChar === "Mario_Fire.png") {
      damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      color = "#ff5722";
      label = "BURN!";
    } else if (mainChar === "Mario_Penguin.png") {
      damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
      color = "#00e5ff";
      label = "FREEZE!";
    } else {
      damage = 7 + player.teamBuff;
      color = "#fff";
      label = "SPECIAL!";
    }
  }

  // Generic special attack animation for characters without custom animations using consolidated system
  let pos = positions.players[currentPlayer];
  let dx = (positions.bowser.x - pos.x) * 0.25;
  let dy = (positions.bowser.y - pos.y) * 0.25;

  startAttackAnimation({
    type: "main-special-generic",
    player: currentPlayer,
    animFrames: 58,
    damage: damage,
    dx: dx,
    dy: dy,
    windupDist: -30,
    onComplete: () => {
      // Apply damage
      if (damage > 0) {
        bowser.hp -= damage;
        bowser.anim = 1;
        bowser.barShake = 1.5;
        playSound(SFX.bossHit, 0.7);
        showFloatingDamage(
          bowserPos.x,
          bowserPos.y - 70,
          "-" + damage,
          color,
          label
        );
        playerDamageDealt[currentPlayer] += damage;
      }

      // Show effect text if any
      if (effect) {
        showFloatingDamage(bowserPos.x, bowserPos.y - 120, effect, color);
      }

      // Use special charge
      player.mainSpecialCharges--;
      updateAttackButtons();

      setTimeout(() => {
        bowser.anim = 0;

        if (bowser.hp <= 0) {
          bowser.hp = 0;
          gameState = "gameover";
          turnIndicator.textContent = "Players Win!";
          executeAttacksBtn.disabled = true;
          bowserDeathAnim = true;
          bowserDeathFrame = 0;
          bowserDeathFrameTimer = 0;
          bowserDeathY = 0;
          bowserDeathDone = false;
          playSound(SFX.bowserDeath, 0.7);
          gameMusic.pause();
        } else {
          // Now execute sidekick attack
          setTimeout(() => {
            executeSidekickAttack();
          }, 400);
        }
      }, 400);
    },
  });
}

function executeSidekickAttack() {
  const player = players[currentPlayer];

  if (player.sidekickAttackType === "special") {
    doSidekickSpecialAttack();
  } else {
    doSidekickRegularAttack();
  }
}

function doSidekickRegularAttack() {
  const player = players[currentPlayer];
  const positions = getCenteredPositions();

  // Sidekick regular attack with animation
  playSound("sounds/Cut.mp3", 1);
  let damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
  let color = "#4fc3f7";
  let label = "SIDEKICK!";

  // Calculate movement
  let pos = positions.players[currentPlayer];
  let dx = (positions.bowser.x - pos.x) * 0.25;
  let dy = (positions.bowser.y - pos.y) * 0.25;

  // Use consolidated animation system
  startAttackAnimation({
    type: "sidekick-regular",
    player: currentPlayer,
    animFrames: 58,
    damage: damage,
    dx: dx,
    dy: dy,
    windupDist: -30,
    onComplete: () => {
      // Apply damage
      bowser.hp -= damage;
      bowser.anim = 1;
      bowser.barShake = 1.5;
      playSound(SFX.bossHit, 0.7);
      showFloatingDamage(
        positions.bowser.x,
        positions.bowser.y - 70,
        "-" + damage,
        color,
        label
      );

      // Track damage dealt by this player's sidekick
      playerDamageDealt[currentPlayer] += damage;

      // Regular attacks don't use special charges
      updateAttackButtons();

      setTimeout(() => {
        bowser.anim = 0;

        if (bowser.hp <= 0) {
          bowser.hp = 0;
          gameState = "gameover";
          turnIndicator.textContent = "Players Win!";
          executeAttacksBtn.disabled = true;
          bowserDeathAnim = true;
          bowserDeathFrame = 0;
          bowserDeathFrameTimer = 0;
          bowserDeathY = 0;
          bowserDeathDone = false;
          playSound(SFX.bowserDeath, 0.7);
          gameMusic.pause();
        } else {
          // Mark this player as having completed their turn
          playersThisRound.push(currentPlayer);

          // Check if all alive players have completed their turns
          const alivePlayers = players
            .map((p, i) => (p.alive ? i : null))
            .filter((i) => i !== null);

          if (playersThisRound.length >= alivePlayers.length) {
            // All players have completed their turns, boss's turn
            gameState = "bowser";
            setTimeout(bowserAttack, 800);
          } else {
            // Next alive player who hasn't completed their turn
            nextPlayer();
            updateTurnIndicator();
            updateAttackButtons();
          }
        }
      }, 400);
    },
  });
}

function doSidekickSpecialAttack() {
  const player = players[currentPlayer];
  const positions = getCenteredPositions();

  // Sidekick special attack (each character plays their own specific sound)
  let damage = 0;
  let color = "#4fc3f7";
  let label = "SIDEKICK!";
  let effect = null;

  // Determine sidekick special attack based on character
  const sidekickName = player.sidekickCharacter;

  if (sidekickName === "Sidekick_Peach.png") {
    // Peach: heal all players by double rng
    playSound("sounds/In-Battle Heal HP Restore.mp3", 1);
    damage = 0;
    color = "#f06292";
    label = "HEAL!";
    let heal = (Math.floor(Math.random() * 6) + 1) * 2;
    players.forEach((pl, idx) => {
      if (pl.alive) {
        pl.hp = Math.min(PLAYER_MAX_HP, pl.hp + heal);
        showFloatingDamage(
          positions.players[idx].x,
          positions.players[idx].y - 70,
          "+" + heal,
          "#f06292",
          "HEAL!"
        );
        // Create heal aura for each player
        createHealAura(idx);
      }
    });
  } else if (sidekickName === "Sidekick_Toad.png") {
    // Toad: buff team + bowser skips turn
    playSound("sounds/Charm.mp3", 1);
    damage = 0;
    color = "#fff";
    label = "BUFF!";
    players.forEach((pl, idx) => {
      pl.teamBuff = (pl.teamBuff || 0) + 1;
      // Create buff aura for each player
      createBuffAura(idx);
    });
    if (!bowser.statusEffects.distract) {
      bowser.statusEffects.distract = { turns: 1 };
      effect = "Bowser distracted!";
    }
  } else if (sidekickName === "Sidekick_Luigi.png") {
    // Luigi: 2 normal attacks
    playSound("sounds/Double Slap 2hits.mp3", 1);
    damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    let damage2 = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    color = "#66bb6a";
    label = "DOUBLE SLAP!";
    bowser.hp -= damage2;
    showFloatingDamage(
      positions.bowser.x,
      positions.bowser.y - 110,
      "-" + damage2,
      color,
      label
    );
  } else if (sidekickName === "Sidekick_Waluigi.png") {
    // Waluigi: bomb throw, 7 damage
    playSound("sounds/Cut.mp3", 1); // Placeholder sound until specific sound is found
    damage = 7 + player.teamBuff;
    color = "#ba68c8";
    label = "BOMB THROW!";
    // Create bomb projectile
    const playerPos = positions.players[currentPlayer];
    createBombProjectile(
      playerPos.x,
      playerPos.y,
      positions.bowser.x,
      positions.bowser.y
    );
  } else if (sidekickName === "Sidekick_Wario.png") {
    // Wario: fart bomb + poison
    playSound("sounds/fart.mp3", 1);
    damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    color = "#8bc34a";
    label = "FART BOMB!";
    if (!bowser.statusEffects.poison) {
      bowser.statusEffects.poison = { turns: 3 };
      effect = "Poison applied!";
    }
  } else if (sidekickName === "Sidekick_DK.png") {
    // DK: double punch, 8 damage
    playSound("sounds/Cut.mp3", 1); // Placeholder sound until specific sound is found
    damage = 8 + player.teamBuff;
    color = "#8d6e63";
    label = "DOUBLE PUNCH!";
  } else {
    // Default: 5 damage
    playSound("sounds/Cut.mp3", 1); // Placeholder sound for any other sidekicks
    damage = 5 + player.teamBuff;
    color = "#4fc3f7";
    label = "SIDEKICK!";
  }

  // Use consolidated animation system for sidekick special attacks
  let pos = positions.players[currentPlayer];
  let dx = (positions.bowser.x - pos.x) * 0.25;
  let dy = (positions.bowser.y - pos.y) * 0.25;

  startAttackAnimation({
    type: "sidekick-special",
    player: currentPlayer,
    animFrames: 58,
    damage: damage,
    dx: dx,
    dy: dy,
    windupDist: -30,
    onComplete: () => {
      // Apply damage if not Peach/Toad
      if (damage > 0) {
        bowser.hp -= damage;
        bowser.anim = 1;
        bowser.barShake = 1.5;
        playSound(SFX.bossHit, 0.7);
        showFloatingDamage(
          positions.bowser.x,
          positions.bowser.y - 70,
          "-" + damage,
          color,
          label
        );

        // Track damage dealt by this player's sidekick
        playerDamageDealt[currentPlayer] += damage;
      }

      // Show effect text if any
      if (effect) {
        showFloatingDamage(
          positions.bowser.x,
          positions.bowser.y - 120,
          effect,
          color
        );
      }

      // Use special charge
      player.sidekickSpecialCharges--;
      updateAttackButtons();

      setTimeout(() => {
        bowser.anim = 0;

        if (bowser.hp <= 0) {
          bowser.hp = 0;
          gameState = "gameover";
          turnIndicator.textContent = "Players Win!";
          executeAttacksBtn.disabled = true;
          bowserDeathAnim = true;
          bowserDeathFrame = 0;
          bowserDeathFrameTimer = 0;
          bowserDeathY = 0;
          bowserDeathDone = false;
          playSound(SFX.bowserDeath, 0.7);
          gameMusic.pause();
        } else {
          // Mark this player as having completed their turn
          playersThisRound.push(currentPlayer);

          // Check if all alive players have completed their turns
          const alivePlayers = players
            .map((p, i) => (p.alive ? i : null))
            .filter((i) => i !== null);

          if (playersThisRound.length >= alivePlayers.length) {
            // All players have completed their turns, boss's turn
            gameState = "bowser";
            setTimeout(bowserAttack, 800);
          } else {
            // Next alive player who hasn't completed their turn
            nextPlayer();
            updateTurnIndicator();
            updateAttackButtons();
          }
        }
      }, 400);
    },
  });
}

// Add event listeners for new attack selection UI with proper guards
if (mainRegularBtn)
  mainRegularBtn.addEventListener("click", (e) => {
    if (e.target.disabled || gameState !== "player" || bowserAttackAnim) return;
    selectMainAttack("regular");
  });
if (mainSpecialBtn)
  mainSpecialBtn.addEventListener("click", (e) => {
    if (e.target.disabled || gameState !== "player" || bowserAttackAnim) return;
    selectMainAttack("special");
  });
if (sidekickRegularBtn)
  sidekickRegularBtn.addEventListener("click", (e) => {
    if (e.target.disabled || gameState !== "player" || bowserAttackAnim) return;
    selectSidekickAttack("regular");
  });
if (sidekickSpecialBtn)
  sidekickSpecialBtn.addEventListener("click", (e) => {
    if (e.target.disabled || gameState !== "player" || bowserAttackAnim) return;
    selectSidekickAttack("special");
  });
if (executeAttacksBtn)
  executeAttacksBtn.addEventListener("click", (e) => {
    if (e.target.disabled || gameState !== "player" || bowserAttackAnim) return;
    executeAttacks();
  });

// Initialize attack buttons for first player
updateAttackButtons();

function drawStatusEffectIcons(x, y, statusEffects) {
  const iconSize = 32;
  const iconSpacing = 8;
  let currentX = x;

  // Draw each active status effect
  Object.entries(statusEffects).forEach(([effect, data]) => {
    if (data && data.turns > 0) {
      ctx.save();

      // Draw icon background
      ctx.fillStyle = "#333";
      ctx.fillRect(currentX, y, iconSize, iconSize);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(currentX, y, iconSize, iconSize);

      // Draw effect-specific icon
      ctx.fillStyle = "#fff";
      ctx.font = `${iconSize * 0.6}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let icon = "";
      let color = "#fff";

      switch (effect) {
        case "burn":
          icon = "🔥";
          color = "#ff5722";
          break;
        case "freeze":
          icon = "❄️";
          color = "#00e5ff";
          break;
        case "poison":
          icon = "☠️";
          color = "#8bc34a";
          break;
        case "bleed":
          icon = "🩸";
          color = "#d32f2f";
          break;
        case "distract":
          icon = "💫";
          color = "#fff";
          break;
        default:
          icon = "⚡";
      }

      ctx.fillStyle = color;
      ctx.fillText(icon, currentX + iconSize / 2, y + iconSize / 2);

      // Draw turn counter below the icon box
      ctx.fillStyle = "#fff";
      ctx.font = `${iconSize * 0.5}px sans-serif`;
      ctx.fillText(
        data.turns.toString(),
        currentX + iconSize / 2,
        y + iconSize + 16
      );

      ctx.restore();

      currentX += iconSize + iconSpacing;
    }
  });
}

// --- Special Attack Animation Functions ---
function createFireballProjectile(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 8;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  fireballProjectiles.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    life: 60,
    maxLife: 60,
    size: 20,
    rotation: 0,
  });
}

function createBlizzardProjectile(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 6;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  blizzardProjectiles.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    life: 80,
    maxLife: 80,
    size: 25,
    rotation: 0,
    particles: [],
  });
}

function createScratchProjectile(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 12;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  scratchProjectiles.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    life: 40,
    maxLife: 40,
    size: 15,
    rotation: 0,
  });
}

function createBombProjectile(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 5;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  bombProjectiles.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    life: 100,
    maxLife: 100,
    size: 30,
    rotation: 0,
    fuse: 60,
  });
}

function createHealAura(playerIndex) {
  const positions = getCenteredPositions();
  const playerPos = positions.players[playerIndex];

  healAuras.push({
    x: playerPos.x,
    y: playerPos.y,
    life: 60,
    maxLife: 60,
    size: 0,
    maxSize: 120,
    playerIndex: playerIndex,
  });
}

function createBuffAura(playerIndex) {
  const positions = getCenteredPositions();
  const playerPos = positions.players[playerIndex];

  buffAuras.push({
    x: playerPos.x,
    y: playerPos.y,
    life: 80,
    maxLife: 80,
    size: 0,
    maxSize: 150,
    playerIndex: playerIndex,
  });
}

function updateSpecialProjectiles() {
  // Update fireball projectiles
  fireballProjectiles.forEach((proj, index) => {
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    proj.rotation += 0.3;

    // Check collision with bowser
    const positions = getCenteredPositions();
    const bowserPos = positions.bowser;
    const distance = Math.sqrt(
      (proj.x - bowserPos.x) ** 2 + (proj.y - bowserPos.y) ** 2
    );

    if (distance < 60 && proj.life > 0) {
      // Hit bowser
      proj.life = 0;
    }
  });
  fireballProjectiles = fireballProjectiles.filter((proj) => proj.life > 0);

  // Update blizzard projectiles
  blizzardProjectiles.forEach((proj, index) => {
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    proj.rotation += 0.2;

    // Add snow particles
    if (proj.life % 3 === 0) {
      proj.particles.push({
        x: proj.x + (Math.random() - 0.5) * 20,
        y: proj.y + (Math.random() - 0.5) * 20,
        life: 20,
        size: 2 + Math.random() * 3,
      });
    }

    // Update particles
    proj.particles.forEach((particle, pIndex) => {
      particle.life--;
    });
    proj.particles = proj.particles.filter((particle) => particle.life > 0);

    // Check collision with bowser
    const positions = getCenteredPositions();
    const bowserPos = positions.bowser;
    const distance = Math.sqrt(
      (proj.x - bowserPos.x) ** 2 + (proj.y - bowserPos.y) ** 2
    );

    if (distance < 60 && proj.life > 0) {
      // Hit bowser
      proj.life = 0;
    }
  });
  blizzardProjectiles = blizzardProjectiles.filter((proj) => proj.life > 0);

  // Update scratch projectiles
  scratchProjectiles.forEach((proj, index) => {
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    proj.rotation += 0.5;

    // Check collision with bowser
    const positions = getCenteredPositions();
    const bowserPos = positions.bowser;
    const distance = Math.sqrt(
      (proj.x - bowserPos.x) ** 2 + (proj.y - bowserPos.y) ** 2
    );

    if (distance < 60 && proj.life > 0) {
      // Hit bowser
      proj.life = 0;
    }
  });
  scratchProjectiles = scratchProjectiles.filter((proj) => proj.life > 0);

  // Update bomb projectiles
  bombProjectiles.forEach((proj, index) => {
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    proj.fuse--;
    proj.rotation += 0.1;

    // Check collision with bowser or fuse expiration
    const positions = getCenteredPositions();
    const bowserPos = positions.bowser;
    const distance = Math.sqrt(
      (proj.x - bowserPos.x) ** 2 + (proj.y - bowserPos.y) ** 2
    );

    if ((distance < 60 || proj.fuse <= 0) && proj.life > 0) {
      // Explode
      proj.life = 0;
      // Create explosion effect
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const speed = 3 + Math.random() * 2;
        specialEffects.push({
          x: proj.x,
          y: proj.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 30,
          maxLife: 30,
          color: "#ff5722",
          size: 8 + Math.random() * 4,
        });
      }
    }
  });
  bombProjectiles = bombProjectiles.filter((proj) => proj.life > 0);

  // Update flying projectiles
  flyingProjectiles.forEach((proj, index) => {
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    proj.rotation += 0.4;

    // Add trail effect
    if (proj.life % 2 === 0) {
      proj.trail.push({
        x: proj.x,
        y: proj.y,
        life: 15,
        size: proj.size * 0.6,
      });
    }

    // Update trail
    proj.trail.forEach((trail, tIndex) => {
      trail.life--;
    });
    proj.trail = proj.trail.filter((trail) => trail.life > 0);

    // Check collision with bowser
    const positions = getCenteredPositions();
    const bowserPos = positions.bowser;
    const distance = Math.sqrt(
      (proj.x - bowserPos.x) ** 2 + (proj.y - bowserPos.y) ** 2
    );

    if (distance < 60 && proj.life > 0) {
      // Hit bowser
      proj.life = 0;
    }
  });
  flyingProjectiles = flyingProjectiles.filter((proj) => proj.life > 0);

  // Update giant stomp effects
  giantStompEffects.forEach((proj, index) => {
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    proj.rotation += 0.2;

    // Add shockwave effect
    if (proj.life % 4 === 0) {
      proj.shockwaves.push({
        x: proj.x,
        y: proj.y,
        life: 25,
        size: 0,
        maxSize: 80,
      });
    }

    // Update shockwaves
    proj.shockwaves.forEach((shockwave, sIndex) => {
      shockwave.life--;
      shockwave.size = (shockwave.maxSize * (25 - shockwave.life)) / 25;
    });
    proj.shockwaves = proj.shockwaves.filter((shockwave) => shockwave.life > 0);

    // Check collision with bowser
    const positions = getCenteredPositions();
    const bowserPos = positions.bowser;
    const distance = Math.sqrt(
      (proj.x - bowserPos.x) ** 2 + (proj.y - bowserPos.y) ** 2
    );

    if (distance < 60 && proj.life > 0) {
      // Hit bowser
      proj.life = 0;
    }
  });
  giantStompEffects = giantStompEffects.filter((proj) => proj.life > 0);

  // Update basic special projectiles
  basicSpecialProjectiles.forEach((proj, index) => {
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    proj.rotation += 0.3;

    // Add sparkle effect
    if (proj.life % 3 === 0) {
      proj.sparkles.push({
        x: proj.x + (Math.random() - 0.5) * 15,
        y: proj.y + (Math.random() - 0.5) * 15,
        life: 18,
        size: 2 + Math.random() * 3,
        color: ["#ffeb3b", "#ff9800", "#fff"][Math.floor(Math.random() * 3)],
      });
    }

    // Update sparkles
    proj.sparkles.forEach((sparkle, sIndex) => {
      sparkle.life--;
    });
    proj.sparkles = proj.sparkles.filter((sparkle) => sparkle.life > 0);

    // Check collision with bowser
    const positions = getCenteredPositions();
    const bowserPos = positions.bowser;
    const distance = Math.sqrt(
      (proj.x - bowserPos.x) ** 2 + (proj.y - bowserPos.y) ** 2
    );

    if (distance < 60 && proj.life > 0) {
      // Hit bowser
      proj.life = 0;
    }
  });
  basicSpecialProjectiles = basicSpecialProjectiles.filter(
    (proj) => proj.life > 0
  );

  // Update heal auras
  healAuras.forEach((aura, index) => {
    aura.life--;
    aura.size = (aura.maxSize * (aura.maxLife - aura.life)) / aura.maxLife;
  });
  healAuras = healAuras.filter((aura) => aura.life > 0);

  // Update buff auras
  buffAuras.forEach((aura, index) => {
    aura.life--;
    aura.size = (aura.maxSize * (aura.maxLife - aura.life)) / aura.maxLife;
  });
  buffAuras = buffAuras.filter((aura) => aura.life > 0);

  // Update special effects
  specialEffects.forEach((effect, index) => {
    effect.x += effect.vx;
    effect.y += effect.vy;
    effect.life--;
  });
  specialEffects = specialEffects.filter((effect) => effect.life > 0);
}

function drawSpecialProjectiles() {
  // Draw fireball projectiles
  fireballProjectiles.forEach((proj) => {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rotation);

    // Fireball glow
    ctx.shadowColor = "#ff5722";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.arc(0, 0, proj.size, 0, Math.PI * 2);
    ctx.fill();

    // Fireball core
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(0, 0, proj.size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Draw blizzard projectiles
  blizzardProjectiles.forEach((proj) => {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rotation);

    // Blizzard glow
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#81d4fa";
    ctx.beginPath();
    ctx.arc(0, 0, proj.size, 0, Math.PI * 2);
    ctx.fill();

    // Snow particles
    proj.particles.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = particle.life / 20;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(
        particle.x - proj.x,
        particle.y - proj.y,
        particle.size,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  });

  // Draw scratch projectiles
  scratchProjectiles.forEach((proj) => {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rotation);

    // Scratch effect
    ctx.strokeStyle = "#ffb300";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ffb300";
    ctx.shadowBlur = 8;

    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 5;
      ctx.beginPath();
      ctx.moveTo(-proj.size, offset);
      ctx.lineTo(proj.size, offset);
      ctx.stroke();
    }

    ctx.restore();
  });

  // Draw bomb projectiles
  bombProjectiles.forEach((proj) => {
    ctx.save();
    ctx.globalAlpha = proj.life / proj.maxLife;
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rotation);

    // Draw bomb body
    ctx.fillStyle = "#424242";
    ctx.beginPath();
    ctx.arc(0, 0, proj.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw fuse
    ctx.strokeStyle = "#ff5722";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -proj.size);
    ctx.lineTo(0, -proj.size - 15);
    ctx.stroke();

    // Draw fuse tip
    ctx.fillStyle = "#ff5722";
    ctx.beginPath();
    ctx.arc(0, -proj.size - 15, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Draw flying projectiles
  flyingProjectiles.forEach((proj) => {
    ctx.save();
    ctx.globalAlpha = proj.life / proj.maxLife;

    // Draw trail
    proj.trail.forEach((trail, index) => {
      const alpha = trail.life / 15;
      ctx.globalAlpha = alpha * (proj.life / proj.maxLife);
      ctx.fillStyle = "#ffd600";
      ctx.beginPath();
      ctx.arc(
        trail.x,
        trail.y,
        trail.size * (index / proj.trail.length),
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw projectile
    ctx.globalAlpha = proj.life / proj.maxLife;
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rotation);

    // Draw flying projectile (winged shape)
    ctx.fillStyle = "#ffd600";
    ctx.beginPath();
    ctx.moveTo(0, -proj.size);
    ctx.lineTo(-proj.size * 0.7, 0);
    ctx.lineTo(0, proj.size);
    ctx.lineTo(proj.size * 0.7, 0);
    ctx.closePath();
    ctx.fill();

    // Draw wings
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.ellipse(
      -proj.size * 0.8,
      0,
      proj.size * 0.4,
      proj.size * 0.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      proj.size * 0.8,
      0,
      proj.size * 0.4,
      proj.size * 0.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  });

  // Draw giant stomp effects
  giantStompEffects.forEach((proj) => {
    ctx.save();
    ctx.globalAlpha = proj.life / proj.maxLife;

    // Draw shockwaves
    proj.shockwaves.forEach((shockwave) => {
      const alpha = shockwave.life / 25;
      ctx.globalAlpha = alpha * (proj.life / proj.maxLife);
      ctx.strokeStyle = "#bdbdbd";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(shockwave.x, shockwave.y, shockwave.size, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw stomp projectile
    ctx.globalAlpha = proj.life / proj.maxLife;
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rotation);

    // Draw giant foot
    ctx.fillStyle = "#bdbdbd";
    ctx.beginPath();
    ctx.ellipse(0, 0, proj.size, proj.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw foot details
    ctx.strokeStyle = "#757575";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, proj.size * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  });

  // Draw basic special projectiles
  basicSpecialProjectiles.forEach((proj) => {
    ctx.save();
    ctx.globalAlpha = proj.life / proj.maxLife;

    // Draw sparkles
    proj.sparkles.forEach((sparkle) => {
      const alpha = sparkle.life / 18;
      ctx.globalAlpha = alpha * (proj.life / proj.maxLife);
      ctx.fillStyle = sparkle.color;
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw projectile
    ctx.globalAlpha = proj.life / proj.maxLife;
    ctx.translate(proj.x, proj.y);
    ctx.rotate(proj.rotation);

    // Draw star shape
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * proj.size;
      const y = Math.sin(angle) * proj.size;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Draw inner glow
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(0, 0, proj.size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Draw heal auras
  healAuras.forEach((aura) => {
    ctx.save();
    ctx.globalAlpha = aura.life / aura.maxLife;

    // Heal ring
    ctx.strokeStyle = "#f06292";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#f06292";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(aura.x, aura.y, aura.size, 0, Math.PI * 2);
    ctx.stroke();

    // Heal particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Date.now() / 1000;
      const x = aura.x + Math.cos(angle) * aura.size;
      const y = aura.y + Math.sin(angle) * aura.size;

      ctx.fillStyle = "#f06292";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  // Draw buff auras
  buffAuras.forEach((aura) => {
    ctx.save();
    ctx.globalAlpha = aura.life / aura.maxLife;

    // Buff ring
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(aura.x, aura.y, aura.size, 0, Math.PI * 2);
    ctx.stroke();

    // Buff stars
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Date.now() / 800;
      const x = aura.x + Math.cos(angle) * aura.size;
      const y = aura.y + Math.sin(angle) * aura.size;

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  // Draw special effects
  specialEffects.forEach((effect) => {
    ctx.save();
    ctx.globalAlpha = effect.life / effect.maxLife;
    ctx.fillStyle = effect.color;
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function createFlyingProjectile(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 10;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  flyingProjectiles.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    life: 50,
    maxLife: 50,
    size: 18,
    rotation: 0,
    trail: [],
  });
}

function createGiantStompEffect(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 15;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  giantStompEffects.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    life: 40,
    maxLife: 40,
    size: 40,
    rotation: 0,
    shockwaves: [],
  });
}

function createBasicSpecialProjectile(startX, startY, targetX, targetY) {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 9;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  basicSpecialProjectiles.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    life: 70,
    maxLife: 70,
    size: 22,
    rotation: 0,
    sparkles: [],
  });
}

// Comprehensive animation reset function
function resetAllAnimations() {
  // Reset all animation variables
  player1Frame = 0;
  player1AttackAnim = false;
  player1AttackAnimFrame = 0;
  player1AnimTimer = 0;
  bowserFrame = 0;
  bowserAttackAnim = false;
  bowserAttackAnimFrame = 0;
  bowserIdleFrame = 0;
  bowserIdleFrameTimer = 0;
  bowserDeathAnim = false;
  bowserDeathFrame = 0;
  bowserDeathFrameTimer = 0;
  bowserDeathY = 0;
  bowserDeathDone = false;
  showWinScreen = false;
  winScreenTimer = 0;
  fireworks = [];
  fireBroFrame = 0;
  fireBroAnimTimer = 0;
  booFrame = 0;
  booAnimTimer = 0;
  skipTurn = false;
  isGamePaused = false;
  pausedSFX = [];

  // Reset player animation states and clear sprite images
  players.forEach((p) => {
    p.anim = 0;
    p.barShake = 0;
    p.attackOffset = { x: 0, y: 0 };
    p.mainAttackOffset = { x: 0, y: 0 };
    p.sidekickAttackOffset = { x: 0, y: 0 };
    p.specialCharge = 0;
    p.specialReady = false;
    p.hasAttackedThisTurn = false;
    p.sidekickHasAttackedThisTurn = false;
    p.mainSpecialCharges = 2;
    p.sidekickSpecialCharges = 2;
    p.mainAttackSelected = false;
    p.sidekickAttackSelected = false;
    p.mainAttackType = null;
    p.sidekickAttackType = null;
    p.teamBuff = 0;
    // Clear special animations
    p.capeFlyAnim = null;
    p.catLeapAnim = null;
    // Clear sprite images
    p._spriteImg = undefined;
    p._mainSpriteImg = undefined;
    p._sidekickSpriteImg = undefined;
  });

  // Reset bowser animation states
  bowser.anim = 0;
  bowser.barShake = 0;
  bowser.attackOffset = { x: 0, y: 0 };
  bowser.statusEffects = {};
  // If you ever use bowser._spriteImg, clear it here
  if (bowser._spriteImg) bowser._spriteImg = undefined;

  // Clear special attack animations
  specialProjectiles = [];
  specialEffects = [];
  fireballProjectiles = [];
  blizzardProjectiles = [];
  scratchProjectiles = [];
  bombProjectiles = [];
  flyingProjectiles = [];
  giantStompEffects = [];
  basicSpecialProjectiles = [];
  healAuras = [];
  buffAuras = [];

  // Clear floating damages
  floatingDamages = [];

  // Reset game state
  currentPlayer = 0;
  gameState = "player";
  playersThisRound = [];
  playerDamageDealt = [0, 0, 0, 0];

  // Performance cleanup: Clear any cached timestamps
  if (window.lastFrameTime) {
    delete window.lastFrameTime;
  }

  // Cancel and restart animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Helper functions for button state management ---
function disableAllAttackButtons() {
  if (mainRegularBtn) mainRegularBtn.disabled = true;
  if (mainSpecialBtn) mainSpecialBtn.disabled = true;
  if (sidekickRegularBtn) sidekickRegularBtn.disabled = true;
  if (sidekickSpecialBtn) sidekickSpecialBtn.disabled = true;
  if (executeAttacksBtn) executeAttacksBtn.disabled = true;
}

function enableAttackButtonsForPlayerTurn() {
  const player = players[currentPlayer];

  if (!player || !player.alive || gameState !== "player" || bowserAttackAnim) {
    disableAllAttackButtons();
    return;
  }

  // Enable regular attack buttons (always available during player turn)
  if (mainRegularBtn) mainRegularBtn.disabled = false;
  if (sidekickRegularBtn) sidekickRegularBtn.disabled = false;

  // Enable special attack buttons only if charges available
  if (mainSpecialBtn) mainSpecialBtn.disabled = player.mainSpecialCharges <= 0;
  if (sidekickSpecialBtn)
    sidekickSpecialBtn.disabled = player.sidekickSpecialCharges <= 0;

  // Update all button states and execute button
  updateAttackButtons();
}

// Attack Animation System - Consolidated into main game loop
let currentAttackAnimation = null;

function startAttackAnimation(config) {
  // Cancel any existing attack animation
  if (currentAttackAnimation) {
    currentAttackAnimation = null;
  }

  currentAttackAnimation = {
    type: config.type, // 'main-regular', 'main-special', 'sidekick-regular', 'sidekick-special', 'bowser'
    player: config.player,
    animFrames: config.animFrames || 58,
    maxFrames: config.animFrames || 58,
    damage: config.damage || 0,
    windupDist: config.windupDist || -30,
    dx: config.dx || 0,
    dy: config.dy || 0,
    onComplete: config.onComplete,
    onImpact: config.onImpact, // For impact events in custom animations
    customAnimation: config.customAnimation, // For special animations like cape fly
    specialState: config.specialState, // For special animation state
    impactHandled: false, // Track if impact event has been handled
  };

  // Set initial player attack animation state
  if (config.player === 0) {
    player1AttackAnim = true;
    player1AttackAnimFrame = 0;
  }
}

// Custom Animation Handlers for Special Attacks
function animateCapeFly(state) {
  if (state.phase === "arc") {
    // Smooth arc motion from start to bowser
    state.t += 0.0333;

    // Create smooth arc using quadratic bezier curve
    let t = Math.min(state.t, 1);
    let midX = (state.startX + state.bowserX) / 2;

    let oneMinusT = 1 - t;
    let tSquared = t * t;
    let oneMinusTSquared = oneMinusT * oneMinusT;
    let twoOneMinusTTimesT = 2 * oneMinusT * t;

    // X follows a simple linear interpolation (slight arc)
    state.marioX =
      oneMinusTSquared * state.startX +
      twoOneMinusTTimesT * midX +
      tSquared * state.bowserX;

    // Y follows the arc (up then down)
    state.marioY =
      oneMinusTSquared * state.startY +
      twoOneMinusTTimesT * state.peakY +
      tSquared * state.bowserY;

    // Check for impact when close to bowser
    if (t >= 0.95 && !state.impact) {
      state.impact = true;
      return { impact: true };
    }

    if (t >= 1) {
      state.phase = "done";
    }
  } else if (state.phase === "done") {
    return { complete: true };
  }

  return { complete: false };
}

function animateCatLeap(state) {
  if (state.phase === "leap") {
    // Fast aggressive leap motion from start to bowser
    state.t += 0.0667; // Faster than cape fly

    // Create aggressive arc using quadratic bezier curve
    let t = Math.min(state.t, 1);

    // Quadratic bezier curve for cat leap
    let midX = (state.startX + state.bowserX) / 2;

    let oneMinusT = 1 - t;
    let tSquared = t * t;
    let oneMinusTSquared = oneMinusT * oneMinusT;
    let twoOneMinusTTimesT = 2 * oneMinusT * t;

    // X follows arc motion
    state.marioX =
      oneMinusTSquared * state.startX +
      twoOneMinusTTimesT * midX +
      tSquared * state.bowserX;

    // Y follows arc motion with peak
    state.marioY =
      oneMinusTSquared * state.startY +
      twoOneMinusTTimesT * state.peakY +
      tSquared * state.bowserY;

    // Check if reached target
    if (t >= 1.0 && !state.impact) {
      state.impact = true;
      // Start return journey
      state.phase = "return";
      state.t = 0;
      return { impact: true };
    }
  } else if (state.phase === "return") {
    // Gentle return to original position
    state.t += 0.05; // Slower, more graceful return
    let t = Math.min(state.t, 1);

    // Linear interpolation back to start
    state.marioX = state.bowserX + (state.startX - state.bowserX) * t;
    state.marioY = state.bowserY + (state.startY - state.bowserY) * t;

    if (t >= 1.0) {
      return { complete: true };
    }
  }

  return { complete: false };
}

function updateAttackAnimation() {
  if (!currentAttackAnimation) return;

  const anim = currentAttackAnimation;
  const player = players[anim.player];

  // Handle custom animations (cape fly, cat leap, etc.)
  if (anim.customAnimation) {
    const result = anim.customAnimation(anim.specialState);
    if (result.complete) {
      // Animation complete
      currentAttackAnimation = null;
      if (anim.onComplete) anim.onComplete();
    } else if (result.impact) {
      // Handle impact event - only call once per impact
      if (!anim.impactHandled && anim.onImpact) {
        anim.impactHandled = true;
        anim.onImpact();
      }
    }
    return;
  }

  // Standard attack animation
  player.anim = anim.animFrames / anim.maxFrames;

  // Animate player 1 attack frames
  if (anim.player === 0 && player1AttackAnim) {
    if (anim.animFrames > 38) {
      player1AttackAnimFrame = 0;
    } else if (anim.animFrames > 19) {
      player1AttackAnimFrame = Math.min(
        PLAYER1_ATTACK_FRAMES - 1,
        Math.floor(5 - (anim.animFrames - 20) / 6.5)
      );
    } else {
      player1AttackAnimFrame = PLAYER1_ATTACK_FRAMES - 1;
    }
  }

  // Calculate position offsets
  const offsetTarget = anim.type.includes("sidekick")
    ? "sidekickAttackOffset"
    : "mainAttackOffset";

  if (anim.animFrames > 25) {
    // Wind-up: move back
    let t = (anim.maxFrames - anim.animFrames) / 7;
    player[offsetTarget] = {
      x: anim.windupDist * t,
      y: 0,
    };
  } else if (anim.animFrames > 14) {
    // Lunge forward
    let t = (38 - anim.animFrames) / 11;
    player[offsetTarget] = {
      x: anim.windupDist * (1 - t) + anim.dx * t,
      y: anim.dy * t,
    };
  } else {
    // Return
    let t = (14 - anim.animFrames) / 14;
    player[offsetTarget] = {
      x: anim.dx * (1 - t),
      y: anim.dy * (1 - t),
    };
  }

  // Decrement frame counter
  anim.animFrames--;

  if (anim.animFrames <= 0) {
    // Animation complete
    player.anim = 0;
    player[offsetTarget] = { x: 0, y: 0 };
    if (anim.player === 0) {
      player1AttackAnim = false;
      player1AttackAnimFrame = 0;
    }

    currentAttackAnimation = null;
    if (anim.onComplete) anim.onComplete();
  }
}
