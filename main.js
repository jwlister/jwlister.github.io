import initLayout from "./layout.js";
import GameUI from "./GameUI.js";

document.addEventListener("DOMContentLoaded", () => {
    initLayout();

    const gameUI = new GameUI();
    gameUI.init();
});

// initLayout();

// const gameUI = new GameUI();
// gameUI.init();
