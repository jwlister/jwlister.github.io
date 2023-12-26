import Timer from 'timer.js';

const questionElement = document.getElementById('question');
const answerInputBox = document.getElementById('answer');
const answerTimerElement = document.getElementById('answer-timer');
const scoreElement = document.getElementById('score');
const pauseResumeButton = document.getElementById('pause-resume');
const resetButton = document.getElementById('reset');
const answerTimeLimitElement = document.getElementById('answer-time-limit');
const factor1MinElement = document.getElementById('factor-1-min');
const factor2MinElement = document.getElementById('factor-2-min');
const factor1MaxElement = document.getElementById('factor-1-max');
const factor2MaxElement = document.getElementById('factor-2-max');
const sessionLengthTimeElement = document.getElementById('session-length-time');
const sessionLengthCountElement = document.getElementById('session-length-count');
const FRAME_TIME_MS = 1000 / 30;

export default class Game {
    constructor() {
        this.factor1 = null;
        this.factor2 = null;
        this.numQuestionsAsked = 0;
        this.numQuestionsCorrect = 0;
        this.paused = true;
        this.answerTimer = new Timer();
        this.sessionTimer = new Timer();
        this.answerTimerInterval = null;
        this.sessionTimerInterval = null;
    }

    getFirstFactor() {
        return this.factor1;
    }

    getSecondFactor() {
        return this.factor2;
    }

    getCorrectAnswer() {
        return this.factor1 * this.factor2;
    }

    startNewQuestion() {
        function genRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(cryptoRandom() * (max - min + 1)) + min;
        }

        function cryptoRandom() {
            const randomBuffer = new Uint32Array(1);
            window.crypto.getRandomValues(randomBuffer);
            return randomBuffer[0] / (0xffffffff + 1);
        }

        if (this.paused)
            return;

        factor1 = genRandomInt(parseInt(factor1MinElement.value), parseInt(factor1MaxElement.value));
        factor2 = genRandomInt(parseInt(factor2MinElement.value), parseInt(factor2MaxElement.value));
        
        clearPressed();
        startAnswerTimerInterval();
    }

    checkAnswer() {
        if (answerInputBox.value.length === correctAnswer.toString().length) {
            if (parseInt(answerInputBox.value) === correctAnswer) {
                processQuestionCorrect();
            } else {
                processQuestionIncorrect();
            }

            if (isGameFinished()) {
                finishGame();
            } else {
                startNewQuestion();
            }
        }
    }

    updateScore() {
        scoreElement.textContent = `${numQuestionsCorrect} / ${numQuestionsAsked}`;
    }

    startAnswerTimerInterval() {
        let animationDuration = parseFloat(answerTimeLimitElement.value) * 1000;
        this.answerTimerInterval = setInterval(function () {
            let elapsedTime = answerTimer.getElapsedTime();
            updateAnswerTimerDisplay(elapsedTime / animationDuration);

            if (elapsedTime >= animationDuration) {
                if (parseInt(answerInputBox.value) !== correctAnswer) {
                    processQuestionIncorrect();
                }

                clearInterval(answerTimerInterval);

                if (isGameFinished) {
                    finishGame();
                } else {
                    startNewQuestion();
                }
            }
        }, gameFrameTime);
    }

    isGameFinished() {
        let lengthSelection = document.querySelector('input[name="session-length-type"]:checked').value;
        return (lengthSelection === "count" && numQuestionsAsked >= sessionLengthCountElement.value) ||
            (lengthSelection === "time" && sessionTimer.getElapsedTime() >= parseFloat(sessionLengthTimeElement.value) * 60 * 1000);
    }

    startSessionTimerInterval() {
        sessionTimer.start();
        sessionTimerInterval = setInterval(processSessionTimer, gameFrameTime);
    }

    processSessionTimer() {
        let elapsedTime = sessionTimer.getElapsedTime();
        // let progress = elapsedTime / sessionLengthTime;
        // updateSessionTimerDisplay(progress);
        if (elapsedTime >= parseFloat(sessionLengthTimeElement.value) * 60 * 1000) {
            finishGame();
        }
    }

    processQuestionCorrect() {
        numQuestionsCorrect++;
        numQuestionsAsked++;
        updateScore();
        flashElement("answer", "#00ff00", 500, "transparent");
    }

    processQuestionIncorrect() {
        numQuestionsAsked++;
        updateScore();
        flashElement("answer", "#ff0000", 500, "transparent");
    }

    resume() {
        this.paused = false;
        pauseResumeButton.textContent = 'Pause';
        answerInputBox.disabled = false;
        setSettingsInputsDisabled(true);
        answerTimer.start();
        sessionTimer.start();
        startNewQuestion();
    }

    pause() {
        this.paused = true;
        questionElement.textContent = `Paused`;
        updateAnswerTimerDisplay(0);
        clearPressed();
        answerInputBox.disabled = true;
        setSettingsInputsDisabled(false);
        clearInterval(answerTimerInterval);
        pauseResumeButton.textContent = 'Resume';
        answerTimer.reset();
        sessionTimer.pause();
    }

    finish() {
        pauseGame();
        questionElement.textContent = `Finished`;
        pauseResumeButton.textContent = 'Start';
        pauseResumeButton.disabled = true;
        clearInterval(sessionTimerInterval);
    }

    reset() {
        pauseGame();
        clearScore();
        pauseResumeButton.textContent = 'Start';
        pauseResumeButton.disabled = false;
        sessionTimer.reset();
        answerTimer.reset();
        startSessionTimerInterval();
    }


    clearScore() {
        numQuestionsCorrect = 0;
        numQuestionsAsked = 0;
        updateScore();
    }

    togglePause() {
        this.paused ? resumeGame() : pauseGame();
    }
}

function updateAnswerTimerDisplay(progress) {
    let display = document.getElementById('answer-timer');
    let progressAngle = progress * 360;
    display.style.background = `conic-gradient(
            #4CAF50 ${progressAngle}deg, 
            #333 ${progressAngle}deg
        )`;
}

function flashElement(elementId, color, duration, originalColor) {
    const element = document.getElementById(elementId);

    if (!element)
        return;

    element.style.backgroundColor = color;
    setTimeout(function () {
        element.style.backgroundColor = originalColor;
    }, duration);
}



function setSettingsInputsDisabled(disabled) {
    let containers = document.getElementsByClassName('settings');
    Array.from(containers).forEach(function (container) {
        let inputs = container.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = disabled;
        }
    });
}

function numberPressed(num) {
    if (this.paused) return;
    answerInputBox.value += num;
    checkAnswer();
}

function clearPressed() {
    answerInputBox.value = '';
}

function deleteLastFromAnswer() {
    answerInputBox.value = answerInputBox.value.slice(0, -1);
}
