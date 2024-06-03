export default class Timer {
    #timer;
    #savedTime;
    #paused;

    constructor() {
        this.#timer = null;
        this.#savedTime = 0;
        this.#paused = true;
    }

    start() {
        if (this.#paused) {
            this.#timer = this.#getCurrentTime();
            this.#paused = false;
        }
    }

    pause() {
        if (!this.#paused) {
            this.#savedTime += this.#getElapsedTimeSinceLastPause();
            this.#paused = true;
        }
    }

    reset() {
        this.pause();
        this.#savedTime = 0;
    }

    getElapsedTime() {
        if (this.#paused) {
            return this.#savedTime;
        } else {
            return this.#savedTime + this.#getElapsedTimeSinceLastPause();
        }
    }

    #getElapsedTimeSinceLastPause() {
        if (this.#timer === null) {
            return 0;
        } else {
            let currentTime = this.#getCurrentTime();
            return currentTime - this.#timer;
        }
    }

    #getCurrentTime() {
        return performance.now();
    }
}
