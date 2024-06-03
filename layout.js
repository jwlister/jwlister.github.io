export default function initLayout() {
    new ResizeObserver(resizeControlPanelToMain).observe(document.querySelector(".control-panel-bounds"));
    window.addEventListener("resize", setMainHeightToWindowHeight);
    setMainHeightToWindowHeight();
}

function resizeControlPanelToMain() {
    var main = document.querySelector(".control-panel-bounds");
    var controlPanel = document.querySelector(".control-panel");
    var aspectRatio = 4 / 3;

    var availableHeight = main.offsetHeight;
    var maxWidth = main.offsetWidth;
    var maxHeight = maxWidth / aspectRatio;

    if (maxHeight > availableHeight) {
        maxHeight = availableHeight;
        maxWidth = maxHeight * aspectRatio;
    }

    controlPanel.style.width = maxWidth + "px";
    controlPanel.style.height = maxHeight + "px";
}

function setMainHeightToWindowHeight() {
    document.querySelector("main").style.height = window.innerHeight + "px";
}
