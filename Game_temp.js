import Timer from "./Timer.js";
import { SessionLength } from "./SessionLength.js";

export default class Game {
    #factor1;
    #factor2;
    #correctAnswer;
    #numQuestionsAsked;
    #numQuestionsCorrect;
    #paused;
    #answerTimer;
    #sessionTimer;

    #onStartQuestionCallback;
    #onEndQuestionCallback;
    #onFinishCallback;
    #answerTimeLimit;
    #factor1Min;
    #factor1Max;
    #factor2Min;
    #factor2Max;
    #sessionLengthType;
    #sessionLength;

    constructor({
        onStartQuestionCallback,
        onEndQuestionCallback,
        onFinishCallback,
        answerTimeLimit,
        factor1Min,
        factor1Max,
        factor2Min,
        factor2Max,
        sessionLengthType,
        sessionLength,
    }) {
        if (
            onStartQuestionCallback === undefined ||
            onEndQuestionCallback === undefined ||
            onFinishCallback === undefined ||
            answerTimeLimit === undefined ||
            factor1Min === undefined ||
            factor1Max === undefined ||
            factor2Min === undefined ||
            factor2Max === undefined ||
            sessionLengthType === undefined ||
            sessionLength === undefined
        ) {
            throw new Error("Missing required parameter");
        }

        this.#factor1 = null;
        this.#factor2 = null;
        this.#correctAnswer = null;
        this.#numQuestionsAsked = 0;
        this.#numQuestionsCorrect = 0;
        this.#paused = true;
        this.#answerTimer = new Timer();
        this.#sessionTimer = new Timer();

        this.#onStartQuestionCallback = onStartQuestionCallback;
        this.#onEndQuestionCallback = onEndQuestionCallback;
        this.#onFinishCallback = onFinishCallback;
        this.#answerTimeLimit = answerTimeLimit;
        this.#factor1Min = factor1Min;
        this.#factor1Max = factor1Max;
        this.#factor2Min = factor2Min;
        this.#factor2Max = factor2Max;
        this.#sessionLengthType = sessionLengthType;
        this.#sessionLength = sessionLength;
    }

    /* {{{ ********** LOGIC METHODS ********** */

    tick() {
        // console.log(this.#sessionLengthType, this.#sessionLength, this.#numQuestionsAsked, this.#sessionTimer.getElapsedTime());

        if (this.#paused) {
            return;
        }

        if (this.#answerTimer.getElapsedTime() >= this.#answerTimeLimit) {
            this.#numQuestionsAsked++;
            this.#onEndQuestionCallback();
            this.#startNewQuestion();
        }

        if (this.getIsSessionFinished()) {
            console.log("Session finished");
            this.#finish();
        }
    }

    receiveAnswer(answer) {
        let isCorrect = answer === this.#correctAnswer;
        this.#numQuestionsAsked++;
        if (isCorrect) {
            this.#numQuestionsCorrect++;
        }
        this.#onEndQuestionCallback();

        this.#startNewQuestion();

        return isCorrect;
    }

    start() {
        this.#paused = false;
        this.#startSession();
        this.#startNewQuestion();
    }

    #startSession() {
        this.#sessionTimer.start();
    }

    #startNewQuestion() {
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

        this.#answerTimer.reset();
        this.#factor1 = genRandomInt(this.#factor1Min, this.#factor1Max);
        this.#factor2 = genRandomInt(this.#factor2Min, this.#factor2Max);
        this.#correctAnswer = this.#factor1 * this.#factor2;
        this.#answerTimer.start();

        if (this.#onStartQuestionCallback) {
            this.#onStartQuestionCallback();
        }
    }

    pause() {
        this.#paused = true;
        this.#answerTimer.reset();
        this.#sessionTimer.pause();
    }

    reset() {
        this.#paused = true;
        this.#numQuestionsAsked = 0;
        this.#numQuestionsCorrect = 0;
        this.#sessionTimer.reset();
        this.#answerTimer.reset();
    }

    #finish() {
        this.pause();
        if (this.#onFinishCallback) {
            this.#onFinishCallback();
        }
    }

    /* }}} */

    /* {{{ ********** GETTERS FOR INTERNALLY-MANAGED STATE ********** */

    getFactor1() {
        return this.#factor1;
    }

    getFactor2() {
        return this.#factor2;
    }

    getCorrectAnswer() {
        return this.#correctAnswer;
    }

    getNumQuestionsAsked() {
        return this.#numQuestionsAsked;
    }

    getNumQuestionsCorrect() {
        return this.#numQuestionsCorrect;
    }

    getIsPaused() {
        return this.#paused;
    }

    getSessionTimerElapsedTime() {
        return this.#sessionTimer.getElapsedTime();
    }

    getSessionTimerProgress() {
        // If "time" is the session length type, then the progress is the fraction of the session time elapsed, otherwise it's the fraction of the session questions asked
        return (
            (this.#sessionLengthType === "time" ? this.#sessionTimer.getElapsedTime() : this.#numQuestionsAsked) /
            this.#sessionLength
        );
    }

    getAnswerTimerElapsedTime() {
        return this.#answerTimer.getElapsedTime();
    }

    getAnswerTimerProgress() {
        return this.#answerTimer.getElapsedTime() / this.#answerTimeLimit;
    }

    getIsSessionFinished() {
        return (
            (this.#sessionLengthType === "time" && this.#sessionTimer.getElapsedTime() >= this.#sessionLength) ||
            (this.#sessionLengthType === "count" && this.#numQuestionsAsked >= this.#sessionLength)
        );
    }

    /* }}} */

    /* {{{ ********** GETTERS/SETTERS FOR EXTERNALLY-MANAGED STATE ********** */

    setAnswerTimeLimit(answerTimeLimit) {
        this.#answerTimeLimit = answerTimeLimit;
    }

    setFactor1Min(min) {
        this.#factor1Min = min;
    }

    setFactor1Max(max) {
        this.#factor1Max = max;
    }

    setFactor2Min(min) {
        this.#factor2Min = min;
    }

    setFactor2Max(max) {
        this.#factor2Max = max;
    }

    // `sessionLengthType` is either `"time"` or `"count"`
    setSessionLengthType(sessionLengthType) {
        this.#sessionLengthType = sessionLengthType;
    }

    // `sessionLength` is either a number of questions or a number of minutes
    setSessionLength(sessionLength) {
        this.#sessionLength = sessionLength;
    }

    getAnswerTimeLimit() {
        return this.#answerTimeLimit;
    }

    getFactor1Min() {
        return this.#factor1Min;
    }

    getFactor1Max() {
        return this.#factor1Max;
    }

    getFactor2Min() {
        return this.#factor2Min;
    }

    getFactor2Max() {
        return this.#factor2Max;
    }

    getSessionLengthType() {
        return this.#sessionLengthType;
    }

    getSessionLength() {
        return this.#sessionLength;
    }

    /* }}} */
}
