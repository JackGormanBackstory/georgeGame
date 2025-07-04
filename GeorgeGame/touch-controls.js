// ===== TOUCH CONTROLS FOR MOBILE GAMEPLAY =====

class TouchControls {
  constructor() {
    this.canvas = null;
    this.isTouch = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50;
    this.virtualButtons = [];
    this.isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupTouchControls()
      );
    } else {
      this.setupTouchControls();
    }
  }

  setupTouchControls() {
    // Add touch event listeners to the entire document
    document.addEventListener("touchstart", (e) => this.handleTouchStart(e), {
      passive: false,
    });
    document.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
      passive: false,
    });
    document.addEventListener("touchend", (e) => this.handleTouchEnd(e), {
      passive: false,
    });

    // Add canvas-specific touch controls
    this.setupCanvasTouch();

    // Add virtual buttons for mobile
    if (this.isTouchDevice) {
      this.addVirtualButtons();
    }

    // Add orientation change handling
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.handleOrientationChange(), 100);
    });
  }

  setupCanvasTouch() {
    const canvas = document.getElementById("game-canvas");
    if (!canvas) return;

    this.canvas = canvas;

    // Prevent default touch behaviors on canvas
    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        this.handleCanvasTouch(e);
      },
      { passive: false }
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    canvas.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }

  handleTouchStart(e) {
    if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isTouch = true;
    }
  }

  handleTouchMove(e) {
    if (!this.isTouch) return;

    // Prevent scrolling during game
    const gameContainer = document.getElementById("game-container");
    const characterSelect = document.getElementById("character-select-screen");

    if (
      gameContainer?.style.display !== "none" ||
      characterSelect?.style.display !== "none"
    ) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (!this.isTouch) return;

    if (e.changedTouches.length === 1) {
      this.touchEndX = e.changedTouches[0].clientX;
      this.touchEndY = e.changedTouches[0].clientY;

      this.processSwipe();
    }

    this.isTouch = false;
  }

  handleCanvasTouch(e) {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Convert touch coordinates to game coordinates
    const gameX = (x / rect.width) * this.canvas.width;
    const gameY = (y / rect.height) * this.canvas.height;

    // Simulate mouse click for existing game logic
    const mouseEvent = new MouseEvent("click", {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
    });

    this.canvas.dispatchEvent(mouseEvent);
  }

  processSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < this.minSwipeDistance) {
      // Tap instead of swipe
      this.handleTap();
      return;
    }

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.handleSwipe("right");
      } else {
        this.handleSwipe("left");
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        this.handleSwipe("down");
      } else {
        this.handleSwipe("up");
      }
    }
  }

  handleTap() {
    // Handle tap actions (like clicking to continue)
    const titleScreen = document.getElementById("title-screen");
    if (titleScreen && !titleScreen.classList.contains("hide")) {
      // Simulate click on title screen
      titleScreen.click();
    }
  }

  handleSwipe(direction) {
    // Handle swipe gestures
    console.log(`Swipe ${direction} detected`);

    // Example: Navigate through menus with swipes
    // This can be expanded based on game needs
  }

  addVirtualButtons() {
    // Only add virtual buttons if we're in the game screen
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    // Create virtual button container
    const virtualButtonContainer = document.createElement("div");
    virtualButtonContainer.id = "virtual-buttons";
    virtualButtonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: none;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;

    // Add menu button
    const menuButton = this.createVirtualButton("☰", "Menu", () => {
      this.showGameMenu();
    });

    // Add pause button
    const pauseButton = this.createVirtualButton("⏸️", "Pause", () => {
      this.pauseGame();
    });

    virtualButtonContainer.appendChild(menuButton);
    virtualButtonContainer.appendChild(pauseButton);

    document.body.appendChild(virtualButtonContainer);

    // Show virtual buttons when game is active
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const isGameVisible = gameContainer.style.display !== "none";
          virtualButtonContainer.style.display = isGameVisible
            ? "flex"
            : "none";
        }
      });
    });

    observer.observe(gameContainer, { attributes: true });
  }

  createVirtualButton(text, label, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.title = label;
    button.className = "virtual-btn";
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: 2px solid #fff;
      font-size: 24px;
      cursor: pointer;
      pointer-events: auto;
      touch-action: manipulation;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    `;

    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.style.transform = "scale(0.9)";
      button.style.background = "rgba(255, 255, 255, 0.2)";
    });

    button.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.style.transform = "scale(1)";
      button.style.background = "rgba(0, 0, 0, 0.7)";
      onClick();
    });

    return button;
  }

  showGameMenu() {
    // Show in-game menu
    const menuModal = document.getElementById("menu-modal");
    if (menuModal) {
      menuModal.style.display = "flex";
    }
  }

  pauseGame() {
    // Pause game functionality
    console.log("Game paused via touch");
    // Add your pause game logic here
  }

  handleOrientationChange() {
    // Handle orientation changes
    const gameCanvas = document.getElementById("game-canvas");
    if (gameCanvas && typeof resizeCanvas === "function") {
      resizeCanvas();
    }

    // Notify user about optimal orientation
    if (window.orientation === 90 || window.orientation === -90) {
      // Landscape mode
      this.showOrientationHint("landscape");
    } else {
      // Portrait mode
      this.showOrientationHint("portrait");
    }
  }

  showOrientationHint(orientation) {
    const existingHint = document.getElementById("orientation-hint");
    if (existingHint) {
      existingHint.remove();
    }

    const hint = document.createElement("div");
    hint.id = "orientation-hint";
    hint.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      z-index: 10000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    const message =
      orientation === "landscape"
        ? "📱 Rotated to landscape mode"
        : "📱 Rotated to portrait mode";

    hint.textContent = message;
    document.body.appendChild(hint);

    // Fade in
    setTimeout(() => {
      hint.style.opacity = "1";
    }, 100);

    // Fade out after 3 seconds
    setTimeout(() => {
      hint.style.opacity = "0";
      setTimeout(() => {
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }
      }, 300);
    }, 3000);
  }

  // Public methods for game integration
  enableTouchControls() {
    document.body.classList.add("touch-enabled");
  }

  disableTouchControls() {
    document.body.classList.remove("touch-enabled");
  }

  isTouchSupported() {
    return this.isTouchDevice;
  }
}

// Initialize touch controls
let touchControls;

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    touchControls = new TouchControls();
  });
} else {
  touchControls = new TouchControls();
}

// Export for global use
window.touchControls = touchControls;

// Add some utility functions
window.isMobile = function () {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

window.isTablet = function () {
  return (
    /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) &&
    window.innerWidth >= 768
  );
};

// Add touch-specific CSS if needed
if (touchControls?.isTouchSupported()) {
  const style = document.createElement("style");
  style.textContent = `
    .touch-enabled {
      touch-action: manipulation;
    }
    
    .touch-enabled .snes-btn,
    .touch-enabled .attack-btn {
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: rgba(0,0,0,0);
    }
    
    .virtual-btn:active {
      transform: scale(0.9) !important;
    }
  `;
  document.head.appendChild(style);
}
