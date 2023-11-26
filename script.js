document.addEventListener('DOMContentLoaded', function() {
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const pauseResumeButton = document.getElementById('pause-resume');
    const resetButton = document.getElementById('reset');
    const timeLimitElement = document.getElementById('time-limit');
    const minNumberElement = document.getElementById('min-number');
    const maxNumberElement = document.getElementById('max-number');
    const sessionTimeElement = document.getElementById('session-time');
    let number1, number2, correctAnswer;
    let score = 0, totalAsked = 0;
    let answerTimer, sessionTimer;
    let paused = true;

    function startNewQuestion() {
        if(paused) return;
        number1 = getRandomNumber();
        number2 = getRandomNumber();
        correctAnswer = number1 * number2;
        questionElement.textContent = `${number1} x ${number2}`;
        answerElement.value = '';
        resetTimer();
    }

    function getRandomNumber() {
        const min = parseInt(minNumberElement.value);
        const max = parseInt(maxNumberElement.value);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function checkAnswer() {
        if(parseInt(answerElement.value) === correctAnswer) {
            score++;
        }
        totalAsked++;
        updateScore();
        startNewQuestion();
    }

    function updateScore() {
        scoreElement.textContent = `Correct: ${score} / ${totalAsked}`;
    }

	function resetTimer() {
		clearInterval(answerTimer);

		// Reset the timer animation
		timerElement.classList.remove('timer-animation');
		void timerElement.offsetWidth; // Trigger reflow
		timerElement.classList.add('timer-animation');

		let animationDuration = parseFloat(timeLimitElement.value) * 1000;
		timerElement.style.setProperty('--animation-duration', `${animationDuration / 2}ms`);

		answerTimer = setInterval(function() {
			if (parseInt(answerElement.value) !== correctAnswer) {
				totalAsked++;
				updateScore();
			}
			clearInterval(answerTimer);
			startNewQuestion();
		}, animationDuration);
	}

    function pauseGame() {
        paused = true;
        clearInterval(answerTimer);
        clearInterval(sessionTimer);
        pauseResumeButton.textContent = 'Resume';
    }

    function resumeGame() {
        paused = false;
        pauseResumeButton.textContent = 'Pause';
        let countdown = 3;
        document.getElementById('countdown-overlay').style.display = 'flex';
        document.getElementById('countdown-overlay').textContent = countdown;
        const countdownTimer = setInterval(function() {
            countdown--;
            document.getElementById('countdown-overlay').textContent = countdown;
            if(countdown <= 0) {
                clearInterval(countdownTimer);
                document.getElementById('countdown-overlay').style.display = 'none';
                startSessionTimer();
                startNewQuestion();
            }
        }, 1000);
    }

    function startSessionTimer() {
        let sessionTime = parseInt(sessionTimeElement.value) * 60;
        sessionTimer = setInterval(function() {
            if(--sessionTime <= 0) {
                clearInterval(sessionTimer);
                pauseGame();
                alert('Session complete!');
            }
        }, 1000);
    }

    answerElement.addEventListener('input', function() {
        if(answerElement.value.length === correctAnswer.toString().length) {
            checkAnswer();
        }
    });

    document.querySelectorAll('#number-pad button').forEach(button => {
        button.addEventListener('click', function() {
            const buttonValue = this.textContent;
            if (buttonValue === 'C') {
                clearAnswer();
            } else if (buttonValue === 'Del') {
                deleteLast();
            } else {
                enterNumber(buttonValue);
            }
        });
    });

    function enterNumber(num) {
        if(paused) return;
        answerElement.value += num;
        if(answerElement.value.length === correctAnswer.toString().length) {
            checkAnswer();
        }
    }

    function clearAnswer() {
        answerElement.value = '';
    }

    function deleteLast() {
        answerElement.value = answerElement.value.slice(0, -1);
    }

    pauseResumeButton.addEventListener('click', function() {
        paused ? resumeGame() : pauseGame();
    });

    resetButton.addEventListener('click', function() {
        score = 0;
        totalAsked = 0;
        updateScore();
        pauseGame();
        startNewQuestion();
    });

    // Initialize the app in a paused state
    pauseGame();
});
