import Game from 'game.js';

document.addEventListener('DOMContentLoaded', function () {
    function resizeControlPanelToMain() {
        var main = document.querySelector('.control-panel-bounds');
        var controlPanel = document.querySelector('.control-panel');
        var aspectRatio = 4 / 3;

        var availableHeight = main.offsetHeight;
        var maxWidth = main.offsetWidth;
        var maxHeight = maxWidth / aspectRatio;

        if (maxHeight > availableHeight) {
            maxHeight = availableHeight;
            maxWidth = maxHeight * aspectRatio;
        }

        controlPanel.style.width = maxWidth + 'px';
        controlPanel.style.height = maxHeight + 'px';
    }

    function setMainHeightToWindowHeight() {
        document.querySelector('main').style.height = window.innerHeight + 'px';
    }

    const game = new Game();

    // questionElement.textContent = `${factor1} x ${factor2}`;

    new ResizeObserver(resizeControlPanelToMain).observe(document.querySelector('.control-panel-bounds'));

    window.addEventListener('resize', setMainHeightToWindowHeight);
    pauseResumeButton.addEventListener('click', togglePause);
    resetButton.addEventListener('click', resetGame);
    answerInputBox.addEventListener('input', checkAnswer);
    document.querySelectorAll('.numpad button').forEach(button => {
        button.addEventListener('click', function () {
            const buttonValue = this.textContent;
            if (buttonValue === 'C') {
                clearPressed();
            } else if (buttonValue === '←') {
                deleteLastFromAnswer();
            } else {
                numberPressed(buttonValue);
            }
        });
    });

    setMainHeightToWindowHeight();
    resetGame();
});
