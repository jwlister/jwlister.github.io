export default class Timer {
    constructor() {
        this.timer = null;
        this.savedTime = 0;
        this.paused = true;
    }

    start() {
        this.timer = new Date();
        this.paused = false;
    }

    pause() {
        if (!this.paused) {
            this.savedTime += this.getElapsedTime();
            this.paused = true;
        }
    }

    reset() {
        this.pause();
        this.savedTime = 0;
    }

    getElapsedTimeSinceLastPause() {
        if (this.timer === null)
            return 0;

        let currentTime = new Date();
        let elapsed = currentTime - this.timer;
        return elapsed;
    }

    getElapsedTime() {
        if (this.paused) {
            return this.savedTime;
        } else {
            return this.savedTime + this.getElapsedTimeSinceLastPause();
        }
    }
}
