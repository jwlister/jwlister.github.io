import Game from "./Game.js";
import { SessionLength } from "./SessionLength.js";

const ANSWER_TIME_LIMIT = document.getElementById("answer-time-limit");
const FACTOR_1_MIN = document.getElementById("factor-1-min");
const FACTOR_1_MAX = document.getElementById("factor-1-max");
const FACTOR_2_MIN = document.getElementById("factor-2-min");
const FACTOR_2_MAX = document.getElementById("factor-2-max");
const SESSION_LENGTH_TYPE = document.querySelectorAll('input[name="session-length-type"]');
const SESSION_LENGTH_TIME = document.getElementById("session-length-time");
const SESSION_LENGTH_COUNT = document.getElementById("session-length-count");

const SESSION_TIMER_DISPLAY = document.getElementById("session-timer-display");
const SCORE = document.getElementById("score");
const ANSWER_TIMER_DISPLAY = document.getElementById("answer-timer-display");
const QUESTION = document.getElementById("question");

const ANSWER = document.getElementById("answer");
const PAUSE_RESUME = document.getElementById("pause-resume");
const RESET = document.getElementById("reset");
const NUMPAD_BUTTONS = document.querySelectorAll(".numpad button");

// Num questions only matches up with session length at 5 FPS or less? Even 5
// often gives 1 less question than expected.
const FPS = 60;
const FRAME_TIME_MS = 1000 / FPS;

// TODO: Finish organizing functions, start using SessionLength, and give code a general once-over.
// TODO: Make layout look good on literally ANY screen size.
// TODO: Allow user to enter answer regardless of whether the answer box is focused or not?
// TODO: Add a "settings" button that opens a modal with all the settings?
// TODO: Make flash durations scale with answer time limit, clamped?
// TODO: Add some kind of visual indicator at session finish, kinda like answer flashes?
// TODO: Figure out this weird framerate thing.

export default class GameUI {
    constructor() {
        this.game = new Game({
            onStartQuestionCallback: () => this.onStartQuestion(),
            onEndQuestionCallback: () => this.onEndQuestion(),
            onFinishCallback: () => this.onFinish(),
            answerTimeLimit: this.getAnswerTimeLimit(),
            factor1Min: this.getFactor1Min(),
            factor1Max: this.getFactor1Max(),
            factor2Min: this.getFactor2Min(),
            factor2Max: this.getFactor2Max(),
            sessionLengthType: this.getSessionLengthType(),
            sessionLength: this.getSessionLength(),
        });
        this.gameLoopInterval = null;
    }

    keepFocus() {
        if (document.activeElement !== ANSWER) {
            ANSWER.focus();
        }
    }

    onStartQuestion() {
        this.updateScoreDisplay();
        this.updateQuestionDisplay();
        this.clearAnswerBox();
    }

    onEndQuestion() {
        this.processQuestionIncorrect();
    }

    /* {{{ ********** INITIALIZATION ********** */

    init() {
        // ANSWER.focus();
        this.registerEventListeners();
        this.updateGameFromUIInputs();
        this.updateUIOutputsFromGame();
    }

    registerEventListeners() {
        ANSWER_TIME_LIMIT.addEventListener("input", () => this.updateAnswerTimeLimit());
        FACTOR_1_MIN.addEventListener("input", () => this.updateFactor1Min());
        FACTOR_1_MAX.addEventListener("input", () => this.updateFactor1Max());
        FACTOR_2_MIN.addEventListener("input", () => this.updateFactor2Min());
        FACTOR_2_MAX.addEventListener("input", () => this.updateFactor2Max());

        SESSION_LENGTH_TYPE.forEach((radio) => {
            radio.addEventListener("change", () => {
                this.updateSessionLengthType();
                this.updateSessionLength();
            });
        });

        // TODO: Only update session length if it's currently in time mode
        SESSION_LENGTH_TIME.addEventListener("input", () => this.updateSessionLength());

        // TODO: Only update session length if it's currently in count mode
        SESSION_LENGTH_COUNT.addEventListener("input", () => this.updateSessionLength());

        ANSWER.addEventListener("input", () => this.sendAnswerIfCorrectLength());

        ANSWER.addEventListener("blur", () => this.keepFocus());
        window.addEventListener("click", () => this.keepFocus());
        window.addEventListener("focus", () => this.keepFocus());

        PAUSE_RESUME.addEventListener("click", () => this.togglePause());
        RESET.addEventListener("click", () => this.reset());

        NUMPAD_BUTTONS.forEach((button) => {
            button.addEventListener("click", () => {
                const buttonValue = button.textContent;
                if (buttonValue === "C") {
                    this.clearAnswerBox();
                } else if (buttonValue === "←") {
                    this.deleteLastFromAnswerBox();
                } else {
                    this.inputNumberToAnswerBox(buttonValue);
                }
            });
        });
    }

    /* }}} */

    /* {{{ ********** UPDATE GAME WITH UI ********** */

    updateGameFromUIInputs() {
        this.updateAnswerTimeLimit();
        this.updateFactor1Min();
        this.updateFactor1Max();
        this.updateFactor2Min();
        this.updateFactor2Max();
        this.updateSessionLengthType();
        this.updateSessionLength();
    }

    updateAnswerTimeLimit() {
        this.game.setAnswerTimeLimit(this.getAnswerTimeLimit());
    }

    updateFactor1Min() {
        this.game.setFactor1Min(this.getFactor1Min());
    }

    updateFactor1Max() {
        this.game.setFactor1Max(this.getFactor1Max());
    }

    updateFactor2Min() {
        this.game.setFactor2Min(this.getFactor2Min());
    }

    updateFactor2Max() {
        this.game.setFactor2Max(this.getFactor2Max());
    }

    updateSessionLengthType() {
        this.game.setSessionLengthType(this.getSessionLengthType());
    }

    updateSessionLength() {
        this.game.setSessionLength(this.getSessionLength());
    }

    /* }}} */

    /* {{{ ********** GET CURRENT UI STATE ********** */

    getAnswerTimeLimit() {
        return parseFloat(ANSWER_TIME_LIMIT.value) * 1000;
    }

    getFactor1Min() {
        return parseInt(FACTOR_1_MIN.value);
    }

    getFactor1Max() {
        return parseInt(FACTOR_1_MAX.value);
    }

    getFactor2Min() {
        return parseInt(FACTOR_2_MIN.value);
    }

    getFactor2Max() {
        return parseInt(FACTOR_2_MAX.value);
    }

    getSessionLengthType() {
        return document.querySelector('input[name="session-length-type"]:checked').value;
    }

    getSessionLength() {
        if (this.getSessionLengthType() === "time") {
            return parseFloat(SESSION_LENGTH_TIME.value) * 60 * 1000;
        } else {
            return parseInt(SESSION_LENGTH_COUNT.value);
        }
    }

    /* }}} */

    /* {{{ ********** UPDATE UI WITH GAME ********** */

    updateUIOutputsFromGame() {
        this.updateSessionTimerDisplay();
        this.updateScoreDisplay();
        this.updateAnswerTimerDisplay();
        this.updateQuestionDisplay();
    }

    updateSessionTimerDisplay() {
        this.setSessionTimerDisplay(this.game.getSessionTimerProgress());
    }

    updateScoreDisplay() {
        SCORE.textContent = `${this.game.getNumQuestionsCorrect()} / ${this.game.getNumQuestionsAsked()}`;
    }

    updateAnswerTimerDisplay() {
        this.setAnswerTimerDisplay(this.game.getAnswerTimerProgress());
    }

    updateQuestionDisplay() {
        if (this.game.getIsPaused()) {
            QUESTION.textContent = "Paused";
        } else {
            QUESTION.textContent = `${this.game.getFactor1()} x ${this.game.getFactor2()}`;
        }
    }

    /* }}} */

    /* {{{ ********** LOGIC ********** */

    // The only reason we have a main loop (instead of everything being purely
    // event-driven) is to update the timers, their displays, and the logic that
    // needs to be executed when they expire.
    startGameLoopInterval() {
        this.gameLoopInterval = setInterval(() => this.tick(), FRAME_TIME_MS);
    }

    tick() {
        this.game.tick();
        this.updateSessionTimerDisplay();
        this.updateAnswerTimerDisplay();
    }

    sendAnswerIfCorrectLength() {
        if (ANSWER.value.length === this.game.getCorrectAnswer().toString().length) {
            if (this.game.receiveAnswer(parseInt(ANSWER.value))) {
                this.processQuestionCorrect();
            } else {
                this.processQuestionIncorrect();
            }
            this.clearAnswerBox();
        }
    }

    // Progress is a number between 0 and 1
    setSessionTimerDisplay(progress) {
        SESSION_TIMER_DISPLAY.style.width = `${progress * 100}%`;
    }

    // Progress is a number between 0 and 1
    setAnswerTimerDisplay(progress) {
        let ang = progress * 360;
        ANSWER_TIMER_DISPLAY.style.background = `conic-gradient(#4CAF50 ${ang}deg, #333 ${ang}deg)`;
    }

    processQuestionCorrect() {
        this.flashElement("answer", "#00ff00", 250, "transparent");
    }

    processQuestionIncorrect() {
        this.flashElement("answer", "#ff0000", 250, "transparent");
    }

    start() {
        PAUSE_RESUME.textContent = "Pause";
        ANSWER.disabled = false;
        this.disableSettings(true);
        this.startGameLoopInterval();
        this.game.start();
    }

    pause() {
        this.game.pause();

        // Comment this out to let `ANSWER_TIMER_DISPLAY` keep its current
        // progress while paused, or uncomment it to instead reset it. Depends
        // on preference. I kind of like seeing it stop where it is.
        // this.updateAnswerTimerDisplay(0);

        QUESTION.textContent = "Paused";
        this.clearAnswerBox();
        ANSWER.disabled = true;
        this.disableSettings(false);
        PAUSE_RESUME.textContent = "Resume";
        clearInterval(this.gameLoopInterval);
    }

    onFinish() {
        QUESTION.textContent = "Finished";
        ANSWER.disabled = true;
        PAUSE_RESUME.textContent = "Start";
        PAUSE_RESUME.disabled = true;
        clearInterval(this.gameLoopInterval);
    }

    reset() {
        this.pause();
        this.game.reset();
        SCORE.textContent = "0 / 0";
        this.setSessionTimerDisplay(0);
        this.setAnswerTimerDisplay(0);
        QUESTION.textContent = "Paused";
        PAUSE_RESUME.textContent = "Start";
        PAUSE_RESUME.disabled = false;
    }

    togglePause() {
        this.game.getIsPaused() ? this.start() : this.pause();
    }

    flashElement(elementId, color, duration, originalColor) {
        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.style.backgroundColor = color;
        setTimeout(() => (element.style.backgroundColor = originalColor), duration);
    }

    disableSettings(disabled) {
        let containers = document.getElementsByClassName("settings");
        Array.from(containers).forEach(function (container) {
            let inputs = container.getElementsByTagName("input");
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].disabled = disabled;
            }
        });
    }

    inputNumberToAnswerBox(num) {
        if (this.game.getIsPaused()) {
            return;
        }

        ANSWER.value += num;
        this.sendAnswerIfCorrectLength();
    }

    clearAnswerBox() {
        ANSWER.value = "";
    }

    deleteLastFromAnswerBox() {
        ANSWER.value = ANSWER.value.slice(0, -1);
    }

    /* }}} */
}
