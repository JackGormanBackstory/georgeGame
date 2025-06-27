export class GameController {
  // ... other properties and methods ...

  triggerScreenShake() {
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) return;

    // Clear any previous timeout
    if (this._screenShakeTimeout) {
      clearTimeout(this._screenShakeTimeout);
      this._screenShakeTimeout = null;
    }

    // Remove and re-add the class to restart the animation
    gameContainer.classList.remove("screen-shake");
    void gameContainer.offsetWidth;
    gameContainer.classList.add("screen-shake");

    // Set a new timeout to remove the class
    this._screenShakeTimeout = setTimeout(() => {
      gameContainer.classList.remove("screen-shake");
      this._screenShakeTimeout = null;
    }, 400);
  }

  // ... rest of the GameController methods ...
}
