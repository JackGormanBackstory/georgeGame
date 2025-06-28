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
  "Sidekick_Toad.png": "rgb(255,255,255)",
};

let sfxVolume = 0.7;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const attackBtn = document.getElementById("attack-btn");
const turnIndicator = document.getElementById("turn-indicator");

const PLAYER_COLORS = ["#4fc3f7", "#81c784", "#ffd54f", "#e57373"];
const BOSS_COLOR = "#b39ddb";
const PLAYER_POSITIONS = [
  { x: 200, y: 650 }, // Player 1 - positioned for equal edge distance
  { x: 533, y: 650 }, // Player 2 - 333px spacing
  { x: 866, y: 650 }, // Player 3 - 333px spacing
  { x: 1200, y: 650 }, // Player 4 - positioned for equal edge distance
];
const BOSS_POSITION = { x: 400, y: 420 };

const PLAYER_MAX_HP = 30;
const BOSS_MAX_HP = 100;

let players = [
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0, // +1 damage from Toad
  },
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0,
  },
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0,
  },
  {
    hp: PLAYER_MAX_HP,
    displayHp: PLAYER_MAX_HP,
    alive: true,
    anim: 0,
    barShake: 0,
    attackOffset: { x: 0, y: 0 },
    specialCharge: 0,
    specialReady: false,
    teamBuff: 0,
  },
];
let boss = {
  hp: BOSS_MAX_HP,
  displayHp: BOSS_MAX_HP,
  alive: true,
  anim: 0,
  barShake: 0,
  attackOffset: { x: 0, y: 0 },
  statusEffects: {}, // { burn: { turns: 2 }, freeze: { turns: 1 }, ... }
};

let currentPlayer = 0;
let gameState = "player"; // 'player', 'boss', 'gameover'
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

// Load boss bowser image
const bossBowserImg = new Image();
bossBowserImg.src = "bowserSprite.png";

// Load boss attack sheet
const bossAttackImg = new Image();
bossAttackImg.src = "bowserAttackSheet.png";

// Sprite sheet info for boss bowser
const BOSS_FRAME_W = 626.35;
const BOSS_FRAME_H = 698.61;
const BOSS_IDLE_FRAMES = 6;
const BOSS_IDLE_ROW = 2;
const BOSS_IDLE_FRAME_DURATIONS = [18, 60, 24, 18, 32, 18];
let bossIdleFrameTimer = 0;

// Sprite sheet info for attack
const BOSS_ATTACK_FRAME_W = 791.82;
const BOSS_ATTACK_FRAME_H = 686;
const BOSS_ATTACK_FRAMES = 4;

// Animation state
let fireBroFrame = 0;
let fireBroAnimTimer = 0;
let booFrame = 0;
let booAnimTimer = 0;
let bossFrame = 0;

// Animation state for player 1
let player1Frame = 0;
let player1AnimTimer = 0;
let player1AttackAnim = false;
let player1AttackAnimFrame = 0;

let bossAttackAnim = false;
let bossAttackAnimFrame = 0;
let bossIdleFrame = 0;

// --- Boss death animation state (move these up to avoid ReferenceError) ---
let bossDeathAnim = false;
let bossDeathFrame = 0;
let bossDeathFrameTimer = 0;
let bossDeathY = 0;
let bossDeathDone = false;

// --- Fireworks and win screen state (move these up to avoid ReferenceError) ---
let fireworks = [];
let showWinScreen = false;
let winScreenTimer = 0;

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
  // Set a larger max width, e.g., 1600px
  const maxWidth = 1800;
  canvas.width = Math.min(window.innerWidth, maxWidth);
  canvas.height = window.innerHeight;
  draw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function getCenteredPositions() {
  const centerX = canvas.width / 2;
  const bossY = canvas.height / 2 - 40;
  // Use PLAYER_POSITIONS for player positions
  return {
    boss: { x: centerX, y: bossY },
    players: PLAYER_POSITIONS.map((pos) => ({ x: pos.x, y: pos.y })),
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

  // Clear and set up the grid
  const grid = document.getElementById("sprite-grid");
  grid.innerHTML = "";

  // Create container for both grids
  const gridsContainer = document.createElement("div");
  gridsContainer.className = "character-grids-container";

  // --- Main Characters Grid ---
  const mainGridWrapper = document.createElement("div");
  mainGridWrapper.className = "character-grid-wrapper";
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
    img.style.width = "70px";
    img.style.height = "70px";
    div.appendChild(img);
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
  sidekickGridWrapper.className = "character-grid-wrapper";
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
    img.style.width = "60px";
    img.style.height = "60px";
    div.appendChild(img);
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

  // Pause fight music, play menu music
  gameMusic.pause();
  menuMusic.currentTime = 0;
  menuMusic.play().catch((error) => {
    console.log("Menu music playback failed:", error.message);
  });
  charMenuBtn.style.display = "";
}

function toggleSelectSprite(idx, file, type) {
  // Find if this character is already selected
  const alreadySelected = selectedSprites.findIndex((s) => {
    if (s.main && s.main.idx === idx) return true;
    if (s.sidekick && s.sidekick.idx === idx) return true;
    if (s.idx === idx) return true;
    return false;
  });

  if (alreadySelected !== -1) {
    // Deselect
    playSound(SFX.clank1, 0.7);
    selectedSprites.splice(alreadySelected, 1);
    selectedNames.splice(alreadySelected, 1);
  } else {
    // Find the appropriate player slot
    let playerIndex = -1;

    // First, try to find a player that already has a character of the opposite type
    for (let i = 0; i < selectedSprites.length; i++) {
      const playerData = selectedSprites[i];
      if (playerData) {
        const hasMain = playerData.main || playerData.type === "main";
        const hasSidekick =
          playerData.sidekick || playerData.type === "sidekick";

        if (type === "main" && !hasMain) {
          playerIndex = i;
          break;
        } else if (type === "sidekick" && !hasSidekick) {
          playerIndex = i;
          break;
        }
      }
    }

    // If no existing player slot found, create a new one
    if (playerIndex === -1 && selectedSprites.length < 4) {
      playerIndex = selectedSprites.length;
    }

    if (playerIndex !== -1 && playerIndex < 4) {
      const existingPlayer = selectedSprites[playerIndex];

      if (!existingPlayer) {
        // First character for this player
        selectedSprites[playerIndex] = { idx, file, type };
        selectedNames[playerIndex] = "";
      } else if (existingPlayer.type !== type) {
        // Different type, can add as pair
        selectedSprites[playerIndex] = {
          main: type === "main" ? { idx, file } : existingPlayer,
          sidekick: type === "sidekick" ? { idx, file } : existingPlayer,
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
    "Sidekick_Toad.png": "rgb(255,255,255)",
  };

  for (let i = 0; i < 4; i++) {
    const div = document.createElement("div");
    div.className = "selected-char";

    const playerData = selectedSprites[i];
    const mainChar = playerData && playerData.main ? playerData.main : null;
    const sidekickChar =
      playerData && playerData.sidekick ? playerData.sidekick : null;

    // Character pair container
    const charPairContainer = document.createElement("div");
    charPairContainer.className = "char-pair-container";

    // Main character box
    const mainCharDiv = document.createElement("div");
    mainCharDiv.className = "main-char";
    if (mainChar) {
      const img = document.createElement("img");
      img.src = SPRITES_FOLDER + mainChar.file;
      img.alt = mainChar.file;
      img.style.width = "60px";
      img.style.height = "60px";
      mainCharDiv.appendChild(img);
      mainCharDiv.style.cursor = "pointer";
      mainCharDiv.onclick = (e) => {
        e.stopPropagation();
        // Remove only the main character from this pair
        if (playerData) {
          if (playerData.sidekick) {
            selectedSprites[i] = { sidekick: playerData.sidekick };
          } else {
            selectedSprites[i] = undefined;
          }
          updateSelectedCharacters();
        }
      };
    } else {
      mainCharDiv.classList.add("empty-slot");
    }
    charPairContainer.appendChild(mainCharDiv);

    // Sidekick character box
    const sidekickCharDiv = document.createElement("div");
    sidekickCharDiv.className = "sidekick-char";
    if (sidekickChar) {
      const img = document.createElement("img");
      img.src = SPRITES_FOLDER + sidekickChar.file;
      img.alt = sidekickChar.file;
      img.style.width = "50px";
      img.style.height = "50px";
      sidekickCharDiv.appendChild(img);
      sidekickCharDiv.style.cursor = "pointer";
      sidekickCharDiv.onclick = (e) => {
        e.stopPropagation();
        // Remove only the sidekick character from this pair
        if (playerData) {
          if (playerData.main) {
            selectedSprites[i] = { main: playerData.main };
          } else {
            selectedSprites[i] = undefined;
          }
          updateSelectedCharacters();
        }
      };
    } else {
      sidekickCharDiv.classList.add("empty-slot");
    }
    charPairContainer.appendChild(sidekickCharDiv);

    div.appendChild(charPairContainer);

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
        selectedSprites[i] = undefined;
        selectedNames[i] = "";
        updateSelectedCharacters();
      };
      div.appendChild(removeBtn);
    }

    // Set background color
    if (mainChar && spriteColors[mainChar.file]) {
      div.style.background = spriteColors[mainChar.file];
    } else if (sidekickChar && spriteColors[sidekickChar.file]) {
      div.style.background = spriteColors[sidekickChar.file];
    } else {
      div.style.background = "#3a235a";
    }

    // Empty slot styling
    if (!playerData) {
      div.classList.add("empty");
    }

    container.appendChild(div);
  }

  // Highlight selected and update grid box styles
  document.querySelectorAll(".sprite-option").forEach((opt) => {
    opt.classList.remove("selected");
    const idx = parseInt(opt.dataset.idx);
    const file = opt.dataset.file;
    const type = opt.dataset.type;
    // Check if this character is selected
    const isSelected = selectedSprites.some((s) => {
      if (s && s.main && s.main.idx === idx) return true;
      if (s && s.sidekick && s.sidekick.idx === idx) return true;
      if (s && s.idx === idx) return true;
      return false;
    });
    // Always set background color
    if (spriteColors[file]) {
      opt.style.background = spriteColors[file];
    } else {
      opt.style.background = "#4b367c";
    }
    if (isSelected) {
      opt.classList.add("selected");
      opt.style.outline = "4px solid #ffeb3b";
      opt.style.filter = "brightness(0.92)";
      opt.style.boxShadow = "0 0 0 4px #ffeb3b55";
    } else {
      opt.style.outline = "";
      opt.style.filter = "";
      opt.style.boxShadow = "";
    }
  });

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
  }

  boss.hp = BOSS_MAX_HP;
  boss.displayHp = BOSS_MAX_HP;
  boss.alive = true;
  boss.anim = 0;
  boss.barShake = 0;
  boss.attackOffset = { x: 0, y: 0 };
  currentPlayer = 0;
  gameState = "player";
  playersThisRound = [];
  updateTurnIndicator();
  document.getElementById("character-select-screen").style.display = "none";
  document.getElementById("game-container").style.display = "";
  draw();

  // Pause menu music, play fight music
  menuMusic.pause();
  gameMusic.currentTime = 0;
  gameMusic.play().catch((error) => {
    console.log("Music playback failed:", error.message);
  });
  setCharMenuVisibility(false);
  setFightMenuVisibility(true);
  attackBtn.disabled = false;
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

  // Draw Boss Health Bar (large, red, top of screen)
  const bossBarW = Math.min(canvas.width * 0.6, 600);
  const bossBarH = 32;
  const bossBarX = (canvas.width - bossBarW) / 2;
  const bossBarY = 36;
  // Red health bar with white border and shake
  ctx.save();
  let shakeX = 0,
    shakeY = 0;
  if (boss.barShake > 0) {
    shakeX = (Math.random() - 0.5) * 24 * boss.barShake;
    shakeY = (Math.random() - 0.5) * 24 * boss.barShake;
  }
  ctx.translate(shakeX, shakeY);
  ctx.fillStyle = "#222";
  ctx.fillRect(bossBarX, bossBarY, bossBarW, bossBarH);
  ctx.fillStyle = "#e53935";
  ctx.fillRect(
    bossBarX,
    bossBarY,
    (bossBarW * Math.max(0, boss.displayHp)) / BOSS_MAX_HP,
    bossBarH
  );
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(bossBarX, bossBarY, bossBarW, bossBarH);
  // Health number
  ctx.font = 'bold 1.2em "Press Start 2P", monospace, sans-serif';
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${Math.max(0, Math.round(boss.displayHp))}/${BOSS_MAX_HP}`,
    bossBarX + bossBarW - 12,
    bossBarY + bossBarH / 2
  );
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.restore();
  // Boss Name (large, under health bar)
  ctx.save();
  ctx.font = 'bold 2em "Press Start 2P", monospace, sans-serif';
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 6;
  ctx.fillText("Boss", canvas.width / 2, bossBarY + bossBarH + 10);
  ctx.restore();

  // Draw Boss (Bowser)
  ctx.save();
  let bossPos = {
    x: positions.boss.x + (boss.attackOffset?.x || 0),
    y: positions.boss.y + (boss.attackOffset?.y || 0) + bossDeathY,
  };

  // --- SCALE LOGIC START ---
  let scale = 1.0;
  if (bossAttackAnim) {
    // Calculate how far Bowser is from his start position (0 = start, 1 = max lunge)
    const maxDist = 120; // Tune this to match your max lunge distance
    const dist = Math.sqrt(
      (boss.attackOffset?.x || 0) ** 2 + (boss.attackOffset?.y || 0) ** 2
    );
    // Scale from 1.0 to 1.3 at max lunge
    scale = 1.0 + 1.0 * Math.min(dist / maxDist, 1);
  }
  ctx.translate(bossPos.x, bossPos.y);
  ctx.scale(scale, scale);
  ctx.translate(-bossPos.x, -bossPos.y);
  // --- SCALE LOGIC END ---

  if (boss.anim > 0) {
    ctx.translate(bossPos.x, bossPos.y);
    ctx.rotate((Math.random() - 0.5) * 0.1 * boss.anim); // shake
    ctx.translate(-bossPos.x, -bossPos.y);
  }
  const bossDrawW = 400;
  const bossDrawH = 400;
  const bossAttackDrawW = 506;
  const bossAttackDrawH = 438;
  if (bossDeathAnim && !showWinScreen) {
    // Use bowserAttackSheet.png frames 0,1,2 for death
    if (
      bossDeathY <= 420 &&
      bossAttackImg.complete &&
      bossAttackImg.naturalWidth > 0
    ) {
      let frame = bossDeathFrame;
      ctx.drawImage(
        bossAttackImg,
        Math.round(frame * BOSS_ATTACK_FRAME_W),
        0,
        Math.round(BOSS_ATTACK_FRAME_W),
        Math.round(BOSS_ATTACK_FRAME_H),
        bossPos.x - bossAttackDrawW / 2,
        bossPos.y - bossAttackDrawH / 2,
        bossAttackDrawW,
        bossAttackDrawH
      );
    }
    // Don't return; allow win screen to draw
  } else if (bossDeathAnim && showWinScreen) {
    // During the drop after win screen, always use frame 2 (third frame)
    if (bossAttackImg.complete && bossAttackImg.naturalWidth > 0) {
      ctx.drawImage(
        bossAttackImg,
        Math.round(2 * BOSS_ATTACK_FRAME_W),
        0,
        Math.round(BOSS_ATTACK_FRAME_W),
        Math.round(BOSS_ATTACK_FRAME_H),
        bossPos.x - bossAttackDrawW / 2,
        bossPos.y - bossAttackDrawH / 2,
        bossAttackDrawW,
        bossAttackDrawH
      );
    }
  } else if (
    bossAttackAnim &&
    bossAttackImg.complete &&
    bossAttackImg.naturalWidth > 0
  ) {
    // Draw attack animation from bowserAttackSheet.png
    let frame = bossAttackAnimFrame;
    ctx.drawImage(
      bossAttackImg,
      Math.round(frame * BOSS_ATTACK_FRAME_W),
      0,
      Math.round(BOSS_ATTACK_FRAME_W),
      Math.round(BOSS_ATTACK_FRAME_H),
      bossPos.x - bossAttackDrawW / 2,
      bossPos.y - bossAttackDrawH / 2,
      bossAttackDrawW,
      bossAttackDrawH
    );
  } else if (bossBowserImg.complete && bossBowserImg.naturalWidth > 0) {
    // Draw idle or death from bowserSprite.png
    let frame = bossIdleFrame;
    let row = BOSS_IDLE_ROW;
    ctx.drawImage(
      bossBowserImg,
      Math.round(frame * BOSS_FRAME_W),
      Math.round(row * BOSS_FRAME_H),
      Math.round(BOSS_FRAME_W),
      Math.round(BOSS_FRAME_H),
      bossPos.x - bossDrawW / 2,
      bossPos.y - bossDrawH / 2,
      bossDrawW,
      bossDrawH
    );
  } else {
    ctx.beginPath();
    ctx.arc(bossPos.x, bossPos.y, 60, 0, Math.PI * 2);
    ctx.fillStyle = BOSS_COLOR;
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
      const pos = {
        x: basePos.x + (p.attackOffset?.x || 0),
        y: basePos.y + (p.attackOffset?.y || 0),
      };
      ctx.save();
      if (p.anim > 0) {
        ctx.translate(pos.x, pos.y);
        ctx.rotate((Math.random() - 0.5) * 0.1 * p.anim); // shake
        ctx.translate(-pos.x, -pos.y);
      }

      // Draw character pair (main + sidekick)
      const SPRITE_SIZE = 80; // Smaller size to fit both characters
      const SIDEKICK_SIZE = 60; // Even smaller for sidekick
      const PAIR_SPACING = 120; // Increased spacing between main and sidekick

      // Draw main character
      if (p.mainSpriteFile) {
        let mainImg = p._mainSpriteImg;
        if (!mainImg) {
          mainImg = new window.Image();
          mainImg.onload = () => {
            console.log(
              `Main sprite loaded for player ${i}:`,
              p.mainSpriteFile
            );
          };
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
              drawW = SPRITE_SIZE;
              drawH = SPRITE_SIZE / aspect;
            } else {
              drawH = SPRITE_SIZE;
              drawW = SPRITE_SIZE * aspect;
            }
          }

          // Special sizing for certain characters
          if (p.mainCharacter === "Mario_Fire.png") {
            drawW = 100;
            drawH = 100;
          } else if (p.mainCharacter === "Mario_Giant.png") {
            drawW = 120;
            drawH = 120;
          }

          if (!p.alive) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.filter = "grayscale(1)";
          }

          // Draw main character slightly to the left
          ctx.drawImage(
            mainImg,
            pos.x - drawW / 2 - PAIR_SPACING / 2,
            pos.y - drawH / 2 + yOffset,
            drawW,
            drawH
          );

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
          ctx.arc(pos.x - PAIR_SPACING / 2, pos.y, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw sidekick character
      if (p.sidekickSpriteFile) {
        let sidekickImg = p._sidekickSpriteImg;
        if (!sidekickImg) {
          sidekickImg = new window.Image();
          sidekickImg.onload = () => {
            console.log(
              `Sidekick sprite loaded for player ${i}:`,
              p.sidekickSpriteFile
            );
          };
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
              drawW = SIDEKICK_SIZE;
              drawH = SIDEKICK_SIZE / aspect;
            } else {
              drawH = SIDEKICK_SIZE;
              drawW = SIDEKICK_SIZE * aspect;
            }
          }

          // Special sizing for certain sidekicks
          if (p.sidekickCharacter === "Sidekick_DK.png") {
            drawW = 80;
            drawH = 80;
          }

          if (!p.alive) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.filter = "grayscale(1)";
          }

          // Draw sidekick slightly to the right
          ctx.drawImage(
            sidekickImg,
            pos.x - drawW / 2 + PAIR_SPACING / 2,
            pos.y - drawH / 2 + yOffset,
            drawW,
            drawH
          );

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
          ctx.arc(pos.x + PAIR_SPACING / 2, pos.y, 25, 0, Math.PI * 2);
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
        ctx.strokeText("DEAD", pos.x, pos.y);
        ctx.fillText("DEAD", pos.x, pos.y);
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
      ctx.fillStyle = "#fff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.name || `P${i + 1}`, pos.x, pos.y - SPRITE_SIZE / 2 - 15);
    });
  }

  // Draw floating damages
  floatingDamages.forEach((fd) => {
    ctx.save();
    ctx.globalAlpha = fd.alpha;
    ctx.font = `bold ${
      fd.size || 28
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

  // WIN SCREEN
  if (showWinScreen) {
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
    // Draw 4 winning characters centered
    const midY = canvas.height * 0.48;
    const spacing = canvas.width / 8;
    const startX = canvas.width / 2 - 1.5 * spacing;
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
        ctx.save();
        if (!p.alive) {
          ctx.globalAlpha = 0.35;
          ctx.filter = "grayscale(1)";
        }
        ctx.drawImage(
          img,
          startX + i * spacing - drawW / 2,
          midY - drawH / 2,
          drawW,
          drawH
        );
        if (!p.alive) {
          ctx.globalAlpha = 1;
          ctx.filter = "none";
          ctx.save();
          ctx.font = 'bold 32px "Press Start 2P", monospace, sans-serif';
          ctx.fillStyle = "#ff5252";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 6;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeText("DEAD", startX + i * spacing, midY);
          ctx.fillText("DEAD", startX + i * spacing, midY);
          ctx.restore();
        }
        ctx.restore();
        // Draw player name
        ctx.save();
        ctx.font = 'bold 20px "Press Start 2P", monospace, sans-serif';
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 6;
        ctx.fillText(p.name || `P${i + 1}`, startX + i * spacing, midY + 80);
        ctx.restore();
      }
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
        bossDeathAnim = false;
        bossDeathFrame = 0;
        bossDeathFrameTimer = 0;
        bossDeathY = 0;
        bossDeathDone = false;
        fireworks = [];
        // Reset boss health
        boss.hp = BOSS_MAX_HP;
        boss.displayHp = BOSS_MAX_HP;
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
        bossDeathAnim = false;
        bossDeathFrame = 0;
        bossDeathFrameTimer = 0;
        bossDeathY = 0;
        bossDeathDone = false;
        fireworks = [];
        // Reset boss health
        boss.hp = BOSS_MAX_HP;
        boss.displayHp = BOSS_MAX_HP;
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
  // Add glowing effect by drawing a shadowed rectangle first
  ctx.save();
  ctx.shadowColor = "#4caf50";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#76ff03";
  ctx.fillRect(x, y, (w * Math.max(0, hp)) / maxHp, h);
  ctx.restore();
  ctx.fillStyle = "#222";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#76ff03";
  ctx.fillRect(x, y, (w * Math.max(0, hp)) / maxHp, h);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  // Draw health number to the right of the bar
  ctx.font = `${h * 1.5}px sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.max(0, Math.round(hp))}/${maxHp}`, x + w + 8, y + h / 2);
  ctx.restore();
}

function showFloatingDamage(x, y, text, color = "#ff5252") {
  floatingDamages.push({ x, y, text, color, alpha: 1, vy: -1, life: 60 });
}

function updateFloatingDamages() {
  floatingDamages.forEach((fd) => {
    fd.y += fd.vy;
    fd.life--;
    fd.alpha = Math.max(0, fd.life / 60);
  });
  floatingDamages = floatingDamages.filter((fd) => fd.life > 0);
  // Reduce barShake for boss and players
  if (boss.barShake > 0) boss.barShake -= 0.1;
  players.forEach((p) => {
    if (p.barShake > 0) p.barShake -= 0.1;
  });
  // Animate health bars
  // Boss
  if (Math.abs(boss.displayHp - boss.hp) > 0.1) {
    boss.displayHp += (boss.hp - boss.displayHp) * 0.15;
  } else {
    boss.displayHp = boss.hp;
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
  // Reset attack flags for the new player
  players[currentPlayer].hasAttackedThisTurn = false;
  players[currentPlayer].sidekickHasAttackedThisTurn = false;

  // Find next alive player
  do {
    currentPlayer = (currentPlayer + 1) % 4;
  } while (!players[currentPlayer].alive);
}

function playerAttack() {
  if (gameState !== "player" || !players[currentPlayer].alive) return;

  const player = players[currentPlayer];

  // Check if main character has already attacked this turn
  if (player.hasAttackedThisTurn) {
    // Main character already attacked, now sidekick attacks
    sidekickAttack();
    return;
  }

  // Main character attacks first
  attackBtn.disabled = true;

  // Get current positions
  const positions = getCenteredPositions();

  // Start attack animation for player 1
  if (currentPlayer === 0) {
    player1AttackAnim = true;
    player1AttackAnimFrame = 0;
  }

  playSound(SFX.playerAttack, 0.5);

  // Attack animation with wind-up
  let animFrames = 48; // Match boss attack animation duration
  let damage = Math.floor(Math.random() * 6) + 1;
  let pos = positions.players[currentPlayer];
  let dx = (positions.boss.x - pos.x) * 0.25;
  let dy = (positions.boss.y - pos.y) * 0.25;
  let windupDist = -30; // pixels to move back for wind-up

  let anim = () => {
    players[currentPlayer].anim = animFrames / 48;

    // Animate player 1 attack frames
    if (currentPlayer === 0 && player1AttackAnim) {
      if (animFrames > 32) {
        player1AttackAnimFrame = 0;
      } else if (animFrames > 16) {
        player1AttackAnimFrame = Math.min(
          PLAYER1_ATTACK_FRAMES - 1,
          Math.floor(5 - (animFrames - 17) / 5.4)
        );
      } else {
        player1AttackAnimFrame = PLAYER1_ATTACK_FRAMES - 1;
      }
    }

    if (animFrames > 21) {
      // Wind-up: move back
      let t = (48 - animFrames) / 6;
      players[currentPlayer].attackOffset = {
        x: windupDist * t,
        y: 0,
      };
    } else if (animFrames > 12) {
      // Lunge forward
      let t = (32 - animFrames) / 9;
      players[currentPlayer].attackOffset = {
        x: windupDist * (1 - t) + dx * t,
        y: dy * t,
      };
    } else {
      // Return
      let t = (12 - animFrames) / 12;
      players[currentPlayer].attackOffset = {
        x: dx * (1 - t),
        y: dy * (1 - t),
      };
    }

    draw();

    if (--animFrames > 0) {
      requestAnimationFrame(anim);
    } else {
      players[currentPlayer].anim = 0;
      players[currentPlayer].attackOffset = { x: 0, y: 0 };
      if (currentPlayer === 0) {
        player1AttackAnim = false;
        player1AttackAnimFrame = 0;
      }

      // Deal damage
      boss.hp -= damage;
      boss.anim = 1;
      boss.barShake = 1;
      playSound(SFX.bossHit, 0.5);
      showFloatingDamage(positions.boss.x, positions.boss.y - 70, "-" + damage);

      // Mark main character as having attacked
      players[currentPlayer].hasAttackedThisTurn = true;

      setTimeout(() => {
        boss.anim = 0;
        draw();

        if (boss.hp <= 0) {
          boss.hp = 0;
          gameState = "gameover";
          turnIndicator.textContent = "Players Win!";
          attackBtn.disabled = true;
          // Start boss death animation
          bossDeathAnim = true;
          bossDeathFrame = 0;
          bossDeathFrameTimer = 0;
          bossDeathY = 0;
          bossDeathDone = false;
          playSound(SFX.bossDeath, 0.7);
          gameMusic.pause();
        } else {
          // Now sidekick attacks automatically
          setTimeout(() => {
            sidekickAttack();
          }, 400);
        }
      }, 400);
    }
  };
  anim();
}

// New function for sidekick attacks
function sidekickAttack() {
  const player = players[currentPlayer];

  // Get current positions
  const positions = getCenteredPositions();

  // Sidekick always does special attack (no charging required)
  let damage = 0;
  let color = "#4fc3f7";
  let label = "SIDEKICK!";
  let effect = null;

  // Determine sidekick special attack based on character
  const sidekickName = player.sidekickCharacter;

  if (sidekickName === "Sidekick_Peach.png") {
    // Peach: heal all players by double rng
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
      }
    });
  } else if (sidekickName === "Sidekick_Toad.png") {
    // Toad: buff team + boss skips turn
    damage = 0;
    color = "#fff";
    label = "BUFF!";
    players.forEach((pl) => {
      pl.teamBuff = (pl.teamBuff || 0) + 1;
    });
    if (!boss.statusEffects.distract) {
      boss.statusEffects.distract = { turns: 1 };
      effect = "Boss distracted!";
    }
  } else if (sidekickName === "Sidekick_Luigi.png") {
    // Luigi: 2 normal attacks
    damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    let damage2 = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    color = "#66bb6a";
    label = "DOUBLE!";
    boss.hp -= damage2;
    showFloatingDamage(
      positions.boss.x,
      positions.boss.y - 110,
      "-" + damage2,
      color,
      label
    );
  } else if (sidekickName === "Sidekick_Waluigi.png") {
    // Waluigi: bomb, 7 damage
    damage = 7 + player.teamBuff;
    color = "#ba68c8";
    label = "BOMB!";
  } else if (sidekickName === "Sidekick_Wario.png") {
    // Wario: normal + poison
    damage = Math.floor(Math.random() * 6) + 1 + player.teamBuff;
    color = "#8bc34a";
    label = "POISON!";
    if (!boss.statusEffects.poison) {
      boss.statusEffects.poison = { turns: 3 };
      effect = "Poison applied!";
    }
  } else if (sidekickName === "Sidekick_DK.png") {
    // DK: 8 damage
    damage = 8 + player.teamBuff;
    color = "#8d6e63";
    label = "SMASH!";
  } else {
    // Default: 5 damage
    damage = 5 + player.teamBuff;
    color = "#4fc3f7";
    label = "SIDEKICK!";
  }

  // Apply damage if not Peach/Toad
  if (damage > 0) {
    boss.hp -= damage;
    boss.anim = 1;
    boss.barShake = 1.5;
    playSound(SFX.bossHit, 0.7);
    showFloatingDamage(
      positions.boss.x,
      positions.boss.y - 70,
      "-" + damage,
      color,
      label
    );
  }

  // Show effect text if any
  if (effect) {
    showFloatingDamage(
      positions.boss.x,
      positions.boss.y - 120,
      effect,
      color,
      label
    );
  }

  // Mark sidekick as having attacked
  players[currentPlayer].sidekickHasAttackedThisTurn = true;

  setTimeout(() => {
    boss.anim = 0;
    draw();

    if (boss.hp <= 0) {
      boss.hp = 0;
      gameState = "gameover";
      turnIndicator.textContent = "Players Win!";
      attackBtn.disabled = true;
      specialAttackBtn.disabled = true;
      bossDeathAnim = true;
      bossDeathFrame = 0;
      bossDeathFrameTimer = 0;
      bossDeathY = 0;
      bossDeathDone = false;
      playSound(SFX.bossDeath, 0.7);
      gameMusic.pause();
    } else {
      // Mark this player as having completed their turn
      playersThisRound.push(currentPlayer);
      if (window.updateSpecialAttackBtn) window.updateSpecialAttackBtn();

      // Check if all alive players have completed their turns
      const alivePlayers = players
        .map((p, i) => (p.alive ? i : null))
        .filter((i) => i !== null);

      if (playersThisRound.length >= alivePlayers.length) {
        // All players have completed their turns, boss's turn
        gameState = "boss";
        setTimeout(bossAttack, 800);
      } else {
        // Next alive player who hasn't completed their turn
        nextPlayer();
        updateTurnIndicator();
        attackBtn.disabled = false;
      }
    }
  }, 400);
}

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

function bossAttack() {
  // Add 1 charge to all players at the beginning of boss attack phase
  players.forEach((player) => {
    if (player.alive && player.specialCharge < 3) {
      player.specialCharge++;
      if (player.specialCharge >= 3) {
        player.specialReady = true;
      }
    }
    // Reset attack flags for all players at the start of a new round
    player.hasAttackedThisTurn = false;
    player.sidekickHasAttackedThisTurn = false;
  });
  if (window.updateSpecialAttackBtn) window.updateSpecialAttackBtn();

  const positions = getCenteredPositions();
  updateTurnIndicator();
  let targets = players
    .map((p, i) => (p.alive ? i : null))
    .filter((i) => i !== null);
  let numAttacks = Math.min(2, targets.length);
  let chosen = [];
  while (chosen.length < numAttacks) {
    let idx = targets[Math.floor(Math.random() * targets.length)];
    if (!chosen.includes(idx)) chosen.push(idx);
  }
  let animFrames = 60 * BOSS_ATTACK_FRAMES; // Slower: 1 FPS, 4 frames = 240 frames
  bossAttackAnim = true;
  bossAttackAnimFrame = 0;
  let damageDealt = false;
  let anim = () => {
    boss.anim = animFrames / (60 * BOSS_ATTACK_FRAMES);
    // Move boss toward each target (average position if 2)
    let tx = 0,
      ty = 0;
    chosen.forEach((i) => {
      tx += positions.players[i].x;
      ty += positions.players[i].y;
    });
    tx /= chosen.length;
    ty /= chosen.length;
    let dx = (tx - positions.boss.x) * 0.18;
    let dy = (ty - positions.boss.y) * 0.18;
    // Animate boss attack frames at 1 FPS
    bossAttackAnimFrame = Math.floor(
      (60 * BOSS_ATTACK_FRAMES - animFrames) / 60
    );
    if (bossAttackAnimFrame >= BOSS_ATTACK_FRAMES)
      bossAttackAnimFrame = BOSS_ATTACK_FRAMES - 1;
    // Move out for first 3 frames, then deal damage, pause, then move back
    if (animFrames > 60) {
      // Move out
      let offset = { x: 0, y: 0 };
      if (animFrames > 30 * BOSS_ATTACK_FRAMES) {
        offset.x =
          (dx * (60 * BOSS_ATTACK_FRAMES - animFrames)) /
          (30 * BOSS_ATTACK_FRAMES);
        offset.y =
          (dy * (60 * BOSS_ATTACK_FRAMES - animFrames)) /
          (30 * BOSS_ATTACK_FRAMES);
      } else {
        offset.x = (dx * animFrames) / (30 * BOSS_ATTACK_FRAMES);
        offset.y = (dy * animFrames) / (30 * BOSS_ATTACK_FRAMES);
      }
      // Boss jump after 2nd frame (frames 2 and 3, i.e., bossAttackAnimFrame >= 2)
      if (bossAttackAnimFrame >= 2 && animFrames > 60) {
        // Calculate jump progress: 0 at start of frame 2, 1 at end of frame 3
        let jumpTotalFrames = 2 * 60; // 2 frames at 1 FPS = 120 frames
        let jumpFrame =
          60 * (BOSS_ATTACK_FRAMES - bossAttackAnimFrame) - animFrames;
        if (jumpFrame < 0) jumpFrame = 0;
        if (jumpFrame > jumpTotalFrames) jumpFrame = jumpTotalFrames;
        // Parabolic arc: peak at middle
        let t = jumpFrame / jumpTotalFrames;
        let jumpY = -40 * 4 * t * (1 - t); // Parabola, peak -40px
        offset.y += jumpY;
      }
      boss.attackOffset = offset;
      draw();
      if (--animFrames > 0) {
        requestAnimationFrame(anim);
      }
    } else if (!damageDealt) {
      // On the last frame (frame 3), play sound and deal damage
      bossAttackAnimFrame = BOSS_ATTACK_FRAMES - 1;
      draw();
      playSound(SFX.bossAttack, 0.6);
      triggerScreenShake(); // Only shake when the attack sound plays
      chosen.forEach((i) => {
        let damage = Math.floor(Math.random() * 8) + 2;
        players[i].hp -= damage;
        players[i].anim = 1;
        players[i].barShake = 1;
        playSound(SFX.playerHit, 0.5);
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
      damageDealt = true;
      setTimeout(() => {
        // Animate boss moving back to original position over 0.5s
        let returnFrames = 30;
        let startOffset = { ...boss.attackOffset };
        let returnAnim = () => {
          let t = returnFrames / 30;
          boss.attackOffset = {
            x: startOffset.x * t,
            y: startOffset.y * t,
          };
          draw();
          if (--returnFrames > 0) {
            requestAnimationFrame(returnAnim);
          } else {
            boss.anim = 0;
            boss.attackOffset = { x: 0, y: 0 };
            bossAttackAnim = false;
            bossAttackAnimFrame = 0;
            setTimeout(() => {
              players.forEach((p) => (p.anim = 0));
              draw();
              if (players.every((p) => !p.alive)) {
                gameState = "gameover";
                turnIndicator.textContent = "Boss Wins!";
                attackBtn.disabled = true;
                gameMusic.pause();
              } else {
                // Reset for next round
                playersThisRound = [];
                // Set currentPlayer to first alive player
                currentPlayer = players.findIndex((p) => p.alive);
                gameState = "player";
                updateTurnIndicator();
                attackBtn.disabled = false;
                // --- Special Attack Button Enablement for Player 1 ---
                if (
                  players[0].alive &&
                  players[0].specialReady &&
                  gameState === "player"
                ) {
                  specialAttackBtn.disabled = false;
                }
                if (window.updateSpecialAttackBtn)
                  window.updateSpecialAttackBtn();
              }
            }, 400);
          }
        };
        returnAnim();
      }, 500); // 0.5 second pause on last frame
    }
  };
  anim();
  // Process status effects
  let skipTurn = false;
  if (boss.statusEffects.burn) {
    boss.hp -= 2;
    showFloatingDamage(
      getCenteredPositions().boss.x,
      getCenteredPositions().boss.y - 120,
      "-2",
      "#ff5722",
      "BURN"
    );
    boss.statusEffects.burn.turns--;
    if (boss.statusEffects.burn.turns <= 0) delete boss.statusEffects.burn;
  }
  if (boss.statusEffects.bleed) {
    boss.hp -= 2;
    showFloatingDamage(
      getCenteredPositions().boss.x,
      getCenteredPositions().boss.y - 100,
      "-2",
      "#ffb300",
      "BLEED"
    );
    boss.statusEffects.bleed.turns--;
    if (boss.statusEffects.bleed.turns <= 0) delete boss.statusEffects.bleed;
  }
  if (boss.statusEffects.poison) {
    boss.hp -= 2;
    showFloatingDamage(
      getCenteredPositions().boss.x,
      getCenteredPositions().boss.y - 80,
      "-2",
      "#8bc34a",
      "POISON"
    );
    boss.statusEffects.poison.turns--;
    if (boss.statusEffects.poison.turns <= 0) delete boss.statusEffects.poison;
  }
  if (boss.statusEffects.freeze) {
    skipTurn = true;
    boss.statusEffects.freeze.turns--;
    showFloatingDamage(
      getCenteredPositions().boss.x,
      getCenteredPositions().boss.y - 60,
      "FROZEN!",
      "#00e5ff",
      "FREEZE"
    );
    if (boss.statusEffects.freeze.turns <= 0) delete boss.statusEffects.freeze;
  }
  if (boss.statusEffects.distract) {
    skipTurn = true;
    boss.statusEffects.distract.turns--;
    showFloatingDamage(
      getCenteredPositions().boss.x,
      getCenteredPositions().boss.y - 40,
      "DISTRACTED!",
      "#fff",
      "BUFF"
    );
    if (boss.statusEffects.distract.turns <= 0)
      delete boss.statusEffects.distract;
  }
  if (boss.hp <= 0) {
    boss.hp = 0;
    gameState = "gameover";
    turnIndicator.textContent = "Players Win!";
    attackBtn.disabled = true;
    specialAttackBtn.disabled = true;
    bossDeathAnim = true;
    bossDeathFrame = 0;
    bossDeathFrameTimer = 0;
    bossDeathY = 0;
    bossDeathDone = false;
    playSound(SFX.bossDeath, 0.7);
    gameMusic.pause();
    return;
  }
  if (skipTurn) {
    // Boss skips turn
    setTimeout(() => {
      playersThisRound = [];
      currentPlayer = players.findIndex((p) => p.alive);
      gameState = "player";
      updateTurnIndicator();
      attackBtn.disabled = false;
      updateSpecialAttackBtn();
    }, 1200);
    return;
  }
}

function updateTurnIndicator() {
  if (gameState === "player") {
    const name = players[currentPlayer].name || `Player ${currentPlayer + 1}`;
    turnIndicator.textContent = `${name}'s Turn`;
  } else if (gameState === "boss") {
    turnIndicator.textContent = `Boss Attacking!`;
  }
}

function getNextBossIdleFrame(current) {
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
  return (current + 1) % BOSS_IDLE_FRAMES;
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
  updateFloatingDamages();
  updateClouds();
  // Animate player 1 (idle: frames 0-4)
  player1AnimTimer++;
  if (!player1AttackAnim && player1AnimTimer % 28 === 0) {
    player1Frame = (player1Frame + 1) % PLAYER1_IDLE_FRAMES; // Only use frames 0-4 for idle
  }
  // Animate Boss Bowser idle or death
  if (bossDeathAnim) {
    if (!bossDeathDone) {
      bossDeathFrameTimer++;
      // Slower, staggered animation: pause at intervals
      if (bossDeathFrame < 2 && bossDeathFrameTimer > 48) {
        // slower frame change
        bossDeathFrame++;
        bossDeathFrameTimer = 0;
      } else if (bossDeathFrame === 2 && bossDeathFrameTimer > 80) {
        // longer pause on last frame
        bossDeathDone = true;
        bossDeathFrameTimer = 0;
      }
    } else {
      // More staggered, slow drop with more frequent/longer pauses
      // Drop further (e.g., 900px instead of 600)
      if (bossDeathY < 900) {
        // Pause for 0.7s every 60px
        if (Math.floor(bossDeathY / 60) !== Math.floor((bossDeathY + 2) / 60)) {
          if (!bossDeathAnim._pause) {
            bossDeathAnim._pause = true;
            setTimeout(() => {
              bossDeathAnim._pause = false;
            }, 700);
          }
        }
        if (!bossDeathAnim._pause) {
          bossDeathY += 1.0; // even slower drop
        }
      }
      // Show win screen much earlier in the drop (after 200px)
      if (!showWinScreen && bossDeathY > 200) {
        showWinScreen = true;
        winScreenTimer = 0;
        fireworks = [];
        playSound(SFX.bossExplode, 0.7);
        setTimeout(() => playSound(SFX.win, 0.7), 1200);
        playSound(SFX.bossDefeat, 0.8); // Play Boss Defeat.wav
        gameMusic.pause();
        // Hide the UI when boss dies
        const ui = document.getElementById("ui");
        if (ui) ui.style.display = "none";
        // Hide player sprites and health bars
        if (canvas) canvas.classList.add("hide-players");
      }
    }
  } else if (!bossAttackAnim) {
    bossIdleFrameTimer++;
    if (bossIdleFrameTimer >= BOSS_IDLE_FRAME_DURATIONS[bossIdleFrame]) {
      bossIdleFrame = getNextBossIdleFrame(bossIdleFrame);
      bossIdleFrameTimer = 0;
    }
  } else {
    bossIdleFrameTimer = 0;
  }
  booAnimTimer++;
  draw();
  if (showWinScreen) {
    updateFireworks();
    winScreenTimer++;
  }
  animationFrameId = requestAnimationFrame(gameLoop);
}

attackBtn.addEventListener("click", () => {
  if (gameState === "player") playerAttack();
});

function restartGame() {
  // Reset players
  players.forEach((p) => {
    p.hp = PLAYER_MAX_HP;
    p.displayHp = PLAYER_MAX_HP;
    p.alive = true;
    p.anim = 0;
    p.barShake = 0;
    p.attackOffset = { x: 0, y: 0 };
  });
  // Reset boss
  boss.hp = BOSS_MAX_HP;
  boss.displayHp = BOSS_MAX_HP;
  boss.alive = true;
  boss.anim = 0;
  boss.barShake = 0;
  boss.attackOffset = { x: 0, y: 0 };
  bossDeathAnim = false;
  bossDeathFrame = 0;
  bossDeathFrameTimer = 0;
  bossDeathY = 0;
  bossDeathDone = false;
  showWinScreen = false;
  winScreenTimer = 0;
  fireworks = [];
  // Reset turn and state
  currentPlayer = 0;
  gameState = "player";
  playersThisRound = [];
  updateTurnIndicator();
  attackBtn.disabled = false;
  // Reset player 1 animation
  player1Frame = 0;
  player1AttackAnim = false;
  player1AttackAnimFrame = 0;
  // Reset boss animation
  bossFrame = 0;
  bossAttackAnim = false;
  bossAttackAnimFrame = 0;
  // Reset floating damages
  floatingDamages = [];
  // Restart music
  gameMusic.currentTime = 0;
  gameMusic.play().catch((error) => {
    console.log("Music playback failed:", error.message);
  });
  // Redraw
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
    boss: JSON.parse(JSON.stringify(boss)),
    currentPlayer: currentPlayer,
    gameState: gameState,
    playersThisRound: JSON.parse(JSON.stringify(playersThisRound)),
    player1Frame: player1Frame,
    bossFrame: bossFrame,
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
    boss.hp = BOSS_MAX_HP;
    boss.displayHp = BOSS_MAX_HP;
    boss.alive = true;
    boss.anim = 0;
    boss.barShake = 0;
    boss.attackOffset = { x: 0, y: 0 };
    // Reset win/celebration state
    showWinScreen = false;
    winScreenTimer = 0;
    bossDeathAnim = false;
    bossDeathFrame = 0;
    bossDeathFrameTimer = 0;
    bossDeathY = 0;
    bossDeathDone = false;
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
        players[i].spriteFile = src.spriteFile;
        players[i].name = src.name;
        players[i]._spriteImg = undefined; // re-init
      }
    }
    const bossSrc = saveData.boss;
    if (bossSrc) {
      boss.hp = bossSrc.hp;
      boss.displayHp = bossSrc.displayHp;
      boss.alive = bossSrc.alive;
      boss.anim = bossSrc.anim;
      boss.barShake = bossSrc.barShake;
      boss.attackOffset = bossSrc.attackOffset || { x: 0, y: 0 };
    }
    currentPlayer = saveData.currentPlayer;
    gameState = saveData.gameState;
    playersThisRound = Array.isArray(saveData.playersThisRound)
      ? [...saveData.playersThisRound]
      : [];
    player1Frame = saveData.player1Frame;
    bossFrame = saveData.bossFrame;

    updateTurnIndicator();
    attackBtn.disabled = gameState !== "player";
    draw();
    // If character select is visible, switch to fight screen
    const charSel = document.getElementById("character-select-screen");
    const gameCont = document.getElementById("game-container");
    if (charSel && charSel.style.display !== "none") {
      charSel.style.display = "none";
      if (gameCont) gameCont.style.display = "";
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
    slot.innerHTML = `
      <div>
        <strong>${saveName}</strong><br>
        <small>${date.toLocaleString()}</small>
      </div>
      <button class="delete-save" onclick="deleteSave('${saveName}')">Delete</button>
    `;
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
        slot.innerHTML = `
          <div>
            <strong>${saveName}</strong><br>
            <small>${date.toLocaleString()}</small>
          </div>
        `;
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
      p.anim = 0;
      p.barShake = 0;
      p.attackOffset = { x: 0, y: 0 };
      p.spriteFile = undefined;
      p.name = "";
      p._spriteImg = undefined;
    });
    boss.hp = BOSS_MAX_HP;
    boss.displayHp = BOSS_MAX_HP;
    boss.alive = true;
    boss.anim = 0;
    boss.barShake = 0;
    boss.attackOffset = { x: 0, y: 0 };
    currentPlayer = 0;
    gameState = "player";
    playersThisRound = [];
    floatingDamages = [];
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
  bossAttack: SOUND_PATH + "Castle Explode.wav",
  playerHit: SOUND_PATH + "Boss Hit.wav",
  bossHit: SOUND_PATH + "Bowser Hit.wav",
  playerDeath: SOUND_PATH + "Enemy Tumble.wav",
  bossDeath: SOUND_PATH + "Boss Defeat.wav",
  bossExplode: SOUND_PATH + "Boss Explode.wav",
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

function drawTitleScreen() {
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
  requestAnimationFrame(drawTitleScreen);
}
drawTitleScreen();

// Show only title screen on load
function showTitleScreen() {
  titleScreen.classList.remove("hide");
  document.getElementById("character-select-screen").style.display = "none";
  document.getElementById("game-container").style.display = "none";
  // Optionally pause menu music until character select
  menuMusic.pause();
}
showTitleScreen();

titleScreen.addEventListener("click", () => {
  titleScreen.classList.add("hide");
  document.getElementById("character-select-screen").style.display = "";
  showCharacterSelect();
  menuMusic.currentTime = 0;
  menuMusic.play().catch((error) => {
    console.log("Menu music playback failed:", error.message);
  });
});

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

// Title screen click logic
if (titleScreen) {
  titleScreen.onclick = () => {
    // Play pipe.wav, then proceed to character select after sound finishes
    const audio = new Audio(SFX.pipe);
    audio.volume = sfxVolume;
    audio.play();
    titleScreen.style.pointerEvents = "none";
    audio.onended = () => {
      titleScreen.classList.add("hide");
      showCharacterSelect();
      menuMusic.currentTime = 0;
      menuMusic.play();
    };
  };
}

// --- Special Attack Logic ---
function doSpecialAttack(idx) {
  const p = players[idx];
  const positions = getCenteredPositions();
  let bossPos = positions.boss;
  let damage = 0;
  let color = "#fff";
  let label = "SPECIAL!";
  let effect = null;

  // Determine special by main character sprite file
  const mainChar = p.mainCharacter;

  if (mainChar === "Mario_Fire.png") {
    // Fire Mario: normal rng + burn
    damage = Math.floor(Math.random() * 6) + 1 + p.teamBuff;
    color = "#ff5722";
    label = "BURN!";
    if (!boss.statusEffects.burn) {
      boss.statusEffects.burn = { turns: 3 };
      effect = "Burn applied!";
    }
  } else if (mainChar === "Mario_Penguin.png") {
    // Penguin Mario: normal rng + freeze
    damage = Math.floor(Math.random() * 6) + 1 + p.teamBuff;
    color = "#00e5ff";
    label = "FREEZE!";
    if (!boss.statusEffects.freeze) {
      boss.statusEffects.freeze = { turns: 1 };
      effect = "Boss frozen!";
    }
  } else if (
    mainChar === "Mario_Cape.png" ||
    mainChar === "Mario_Raccoon.png"
  ) {
    // Flying Mario: 7 damage
    damage = 7 + p.teamBuff;
    color = "#ffd600";
    label = "CRIT!";
  } else if (mainChar === "Mario_Giant.png") {
    // Giant Mario: double normal, shake
    damage = (Math.floor(Math.random() * 6) + 1 + p.teamBuff) * 2;
    color = "#bdbdbd";
    label = "SMASH!";
    triggerScreenShake();
  } else if (mainChar === "Mario_Cat.png") {
    // Cat Mario: choose one (for now, always Bleed)
    damage = Math.floor(Math.random() * 6) + 1 + p.teamBuff;
    color = "#ffb300";
    label = "BLEED!";
    if (!boss.statusEffects.bleed) {
      boss.statusEffects.bleed = { turns: 3 };
      effect = "Bleed applied!";
    }
  } else {
    // Default: 7 damage
    damage = 7 + p.teamBuff;
    color = "#fff";
    label = "SPECIAL!";
  }

  // Apply damage
  if (damage > 0) {
    boss.hp -= damage;
    boss.anim = 1;
    boss.barShake = 1.5;
    playSound(SFX.bossHit, 0.7);
    showFloatingDamage(bossPos.x, bossPos.y - 70, "-" + damage, color, label);
  }

  // Show effect text if any
  if (effect) {
    showFloatingDamage(bossPos.x, bossPos.y - 120, effect, color, label);
  }

  // Reset special charge
  p.specialCharge = 0;
  p.specialReady = false;
  if (window.updateSpecialAttackBtn) window.updateSpecialAttackBtn();

  setTimeout(() => {
    boss.anim = 0;
    draw();

    if (boss.hp <= 0) {
      boss.hp = 0;
      gameState = "gameover";
      turnIndicator.textContent = "Players Win!";
      attackBtn.disabled = true;
      specialAttackBtn.disabled = true;
      bossDeathAnim = true;
      bossDeathFrame = 0;
      bossDeathFrameTimer = 0;
      bossDeathY = 0;
      bossDeathDone = false;
      playSound(SFX.bossDeath, 0.7);
      gameMusic.pause();
    } else {
      // Mark main character as having attacked
      players[currentPlayer].hasAttackedThisTurn = true;

      // Now sidekick attacks automatically
      setTimeout(() => {
        sidekickAttack();
      }, 400);
    }
  }, 400);
}

// --- Update floating damage to support label and color ---
function showFloatingDamage(x, y, text, color = "#ff5252", label = "") {
  floatingDamages.push({
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

// --- Special Attack Button Logic ---
const specialAttackBtn = document.getElementById("special-attack-btn");
function updateSpecialAttackBtn() {
  const p = players[currentPlayer];
  console.log("updateSpecialAttackBtn", {
    currentPlayer,
    name: players[currentPlayer].name,
    specialReady: players[currentPlayer].specialReady,
    specialCharge: players[currentPlayer].specialCharge,
    alive: players[currentPlayer].alive,
    gameState,
  });
  specialAttackBtn.disabled =
    !p.alive || !p.specialReady || gameState !== "player";
  if (!p.specialReady) {
    specialAttackBtn.textContent = `Special (${p.specialCharge}/3)`;
  } else {
    specialAttackBtn.textContent = "Special Attack!";
  }
}
window.updateSpecialAttackBtn = updateSpecialAttackBtn;
specialAttackBtn.addEventListener("click", () => {
  if (gameState !== "player" || !players[currentPlayer].alive) return;
  if (!players[currentPlayer].specialReady) return;
  specialAttackBtn.disabled = true;
  doSpecialAttack(currentPlayer);
});
updateSpecialAttackBtn();
