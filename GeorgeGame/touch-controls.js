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
    this.isPortrait = window.innerHeight > window.innerWidth;
    this.lastTouchTime = 0;
    this.doubleTapDelay = 300;

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
    // Only setup touch controls on mobile devices
    if (!this.isTouchDevice || window.innerWidth > 768) {
      return;
    }

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

    // Handle orientation changes
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.isPortrait = window.innerHeight > window.innerWidth;
        this.updateVirtualButtons();
      }, 100);
    });

    // Handle resize events
    window.addEventListener("resize", () => {
      this.isPortrait = window.innerHeight > window.innerWidth;
      this.updateVirtualButtons();
    });

    // Setup virtual buttons for game screens
    this.setupVirtualButtons();

    // Add touch-specific enhancements
    this.addTouchEnhancements();

    console.log("Touch controls initialized for mobile device");
  }

  handleTouchStart(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.isTouch = true;

      // Check for double tap
      const currentTime = Date.now();
      if (currentTime - this.lastTouchTime < this.doubleTapDelay) {
        this.handleDoubleTap(touch);
      }
      this.lastTouchTime = currentTime;
    }
  }

  handleTouchMove(e) {
    if (!this.isTouch) return;

    // Prevent scrolling during touch moves
    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.touchEndX = touch.clientX;
      this.touchEndY = touch.clientY;
    }
  }

  handleTouchEnd(e) {
    if (!this.isTouch) return;

    this.isTouch = false;

    // Calculate swipe distance and direction
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.minSwipeDistance) {
      this.handleSwipe(deltaX, deltaY);
    } else {
      // Handle tap
      this.handleTap(this.touchStartX, this.touchStartY);
    }

    // Reset touch coordinates
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
  }

  handleSwipe(deltaX, deltaY) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine swipe direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.onSwipeRight();
      } else {
        this.onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        this.onSwipeDown();
      } else {
        this.onSwipeUp();
      }
    }
  }

  handleTap(x, y) {
    // Handle tap on current screen
    const currentScreen = this.getCurrentScreen();

    switch (currentScreen) {
      case "title":
        this.handleTitleScreenTap(x, y);
        break;
      case "character-select":
        this.handleCharacterSelectTap(x, y);
        break;
      case "game":
        this.handleGameScreenTap(x, y);
        break;
    }
  }

  handleDoubleTap(touch) {
    // Handle double tap actions
    const currentScreen = this.getCurrentScreen();

    if (currentScreen === "game") {
      // Double tap to pause/unpause
      this.togglePause();
    }
  }

  getCurrentScreen() {
    const titleScreen = document.getElementById("title-screen");
    const characterSelectScreen = document.getElementById(
      "character-select-screen"
    );
    const gameContainer = document.getElementById("game-container");

    if (
      titleScreen &&
      !titleScreen.classList.contains("hide") &&
      titleScreen.style.display !== "none"
    ) {
      return "title";
    } else if (
      characterSelectScreen &&
      characterSelectScreen.style.display !== "none"
    ) {
      return "character-select";
    } else if (gameContainer && gameContainer.style.display !== "none") {
      return "game";
    }

    return "unknown";
  }

  handleTitleScreenTap(x, y) {
    // Simulate click on title screen
    const titleText = document.getElementById("title-text");
    if (titleText) {
      titleText.click();
    }
  }

  handleCharacterSelectTap(x, y) {
    // Let the existing character select logic handle the tap
    // This is mainly for feedback purposes
    this.addTouchFeedback(x, y);
  }

  handleGameScreenTap(x, y) {
    // Handle taps on game screen
    const canvas = document.getElementById("game-canvas");
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        // Tap on canvas - could be used for targeting
        this.handleCanvasTap(x - rect.left, y - rect.top);
      }
    }
  }

  handleCanvasTap(canvasX, canvasY) {
    // Handle tap on game canvas
    // This could be used for selecting targets, etc.
    console.log(`Canvas tap at: ${canvasX}, ${canvasY}`);
  }

  onSwipeLeft() {
    const currentScreen = this.getCurrentScreen();
    if (currentScreen === "character-select") {
      // Swipe left to go to next character page or scroll
      this.scrollSelectedCharacters("left");
    }
  }

  onSwipeRight() {
    const currentScreen = this.getCurrentScreen();
    if (currentScreen === "character-select") {
      // Swipe right to go to previous character page or scroll
      this.scrollSelectedCharacters("right");
    }
  }

  onSwipeUp() {
    const currentScreen = this.getCurrentScreen();
    if (currentScreen === "character-select") {
      // Swipe up to scroll character grid up
      this.scrollCharacterGrid("up");
    }
  }

  onSwipeDown() {
    const currentScreen = this.getCurrentScreen();
    if (currentScreen === "character-select") {
      // Swipe down to scroll character grid down
      this.scrollCharacterGrid("down");
    }
  }

  scrollSelectedCharacters(direction) {
    const selectedCharacters = document.getElementById("selected-characters");
    if (selectedCharacters) {
      const scrollAmount = selectedCharacters.clientWidth * 0.5;
      if (direction === "left") {
        selectedCharacters.scrollLeft += scrollAmount;
      } else {
        selectedCharacters.scrollLeft -= scrollAmount;
      }
    }
  }

  scrollCharacterGrid(direction) {
    const characterGrids = document.querySelector(".character-grids-container");
    if (characterGrids) {
      const scrollAmount = characterGrids.clientHeight * 0.3;
      if (direction === "up") {
        characterGrids.scrollTop -= scrollAmount;
      } else {
        characterGrids.scrollTop += scrollAmount;
      }
    }
  }

  setupVirtualButtons() {
    // Only show virtual buttons during gameplay
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    // Create virtual buttons container
    let virtualButtonsContainer = document.getElementById("virtual-buttons");
    if (!virtualButtonsContainer) {
      virtualButtonsContainer = document.createElement("div");
      virtualButtonsContainer.id = "virtual-buttons";
      virtualButtonsContainer.style.cssText = `
        position: fixed;
        bottom: 1vh;
        right: 2vw;
        display: none;
        flex-direction: column;
        gap: 1vh;
        z-index: 1000;
        pointer-events: none;
      `;
      document.body.appendChild(virtualButtonsContainer);
    }

    // Create menu button
    const menuButton = this.createVirtualButton("☰", "Menu", () => {
      this.toggleGameMenu();
    });

    // Create pause button
    const pauseButton = this.createVirtualButton("⏸️", "Pause", () => {
      this.togglePause();
    });

    virtualButtonsContainer.appendChild(menuButton);
    virtualButtonsContainer.appendChild(pauseButton);

    this.virtualButtons = [menuButton, pauseButton];
  }

  createVirtualButton(text, title, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.title = title;
    button.className = "virtual-btn snes-btn";
    button.style.cssText = `
      width: 10vw;
      height: 10vw;
      font-size: 3vw;
      border: 2px solid #fff;
      border-radius: 50%;
      background: rgba(75, 54, 124, 0.9);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: manipulation;
      pointer-events: auto;
      text-shadow: 1px 1px 0 #000;
      backdrop-filter: blur(4px);
    `;

    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.style.transform = "scale(0.9)";
    });

    button.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      button.style.transform = "scale(1)";
      onClick();
    });

    return button;
  }

  updateVirtualButtons() {
    const virtualButtonsContainer = document.getElementById("virtual-buttons");
    const gameContainer = document.getElementById("game-container");

    if (virtualButtonsContainer && gameContainer) {
      // Show virtual buttons only during gameplay on mobile
      if (
        this.isTouchDevice &&
        window.innerWidth <= 768 &&
        gameContainer.style.display !== "none"
      ) {
        virtualButtonsContainer.style.display = "flex";
      } else {
        virtualButtonsContainer.style.display = "none";
      }
    }
  }

  toggleGameMenu() {
    // Try to find and click the menu button
    const menuBtn =
      document.getElementById("char-menu-btn") ||
      document.getElementById("fight-menu-btn");
    if (menuBtn) {
      menuBtn.click();
    }
  }

  togglePause() {
    // Try to find and click the pause functionality
    // This depends on the game's pause implementation
    const pauseBtn = document.querySelector('[data-action="pause"]');
    if (pauseBtn) {
      pauseBtn.click();
    } else {
      // Try to trigger pause via key event
      const pauseEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(pauseEvent);
    }
  }

  addTouchFeedback(x, y) {
    // Create visual feedback for touch
    const feedback = document.createElement("div");
    feedback.style.cssText = `
      position: fixed;
      left: ${x - 15}px;
      top: ${y - 15}px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      pointer-events: none;
      z-index: 9999;
      animation: touch-feedback 0.3s ease-out forwards;
    `;

    // Add CSS animation
    if (!document.getElementById("touch-feedback-styles")) {
      const style = document.createElement("style");
      style.id = "touch-feedback-styles";
      style.textContent = `
        @keyframes touch-feedback {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(feedback);

    // Remove feedback after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 300);
  }

  addTouchEnhancements() {
    // Add touch-specific CSS classes
    document.body.classList.add("touch-device");

    // Prevent context menu on long press
    document.addEventListener("contextmenu", (e) => {
      if (this.isTouchDevice) {
        e.preventDefault();
      }
    });

    // Prevent zoom on double tap
    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // Enhanced button press feedback
    document.addEventListener(
      "touchstart",
      (e) => {
        if (
          e.target.matches(
            ".snes-btn, .attack-btn, .difficulty-btn, .sprite-option"
          )
        ) {
          e.target.style.transform = "scale(0.95)";
          e.target.style.filter = "brightness(0.9)";
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (e) => {
        if (
          e.target.matches(
            ".snes-btn, .attack-btn, .difficulty-btn, .sprite-option"
          )
        ) {
          setTimeout(() => {
            e.target.style.transform = "";
            e.target.style.filter = "";
          }, 100);
        }
      },
      { passive: true }
    );
  }
}

// Initialize touch controls when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new TouchControls();
  });
} else {
  new TouchControls();
}

// Observer to update virtual buttons when screen changes
const touchControls = new TouchControls();
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes" && mutation.attributeName === "style") {
      touchControls.updateVirtualButtons();
    }
  });
});

// Observe game container for display changes
const gameContainer = document.getElementById("game-container");
if (gameContainer) {
  observer.observe(gameContainer, {
    attributes: true,
    attributeFilter: ["style"],
  });
}
