/**
 * Holds references to various DOM elements used throughout the game to simplify DOM manipulation tasks.
 * @const {Object} elementsDOM - Maps IDs and classes to their corresponding DOM elements for easy access.
 */
const elementsDOM = {
  gamePage: document.getElementById('game-page'),
  scorePage: document.getElementById('score-page'),
  splashPage: document.getElementById('splash-page'),
  countdownPage: document.getElementById('countdown-page'),
  startForm: document.getElementById('start-form'),
  radioContainers: document.querySelectorAll('.radio-container'),
  radioInputs: document.querySelectorAll('input'),
  bestScores: document.querySelectorAll('.best-score-value'),
  countdown: document.querySelector('.countdown'),
  itemContainer: document.querySelector('.item-container'),
  finalTimeEl: document.querySelector('.final-time'),
  baseTimeEl: document.querySelector('.base-time'),
  penaltyTimeEl: document.querySelector('.penalty-time'),
  playAgainBtn: document.querySelector('.play-again'),
};

/**
 * Stores the state and configuration of the game, including counters, arrays for equations, and score details.
 * @const {Object} game - Contains game settings like question amount, arrays for equations, player's answers, and timing details.
 */
const game = {
  questionAmount: 0,
  equationsArray: [],
  playerGuessArray: [],
  bestScoreArray: [],
  firstNumber: 0,
  secondNumber: 0,
  equationObject: {},
  wrongFormat: [],
  timer: null,
  timePlayed: 0,
  baseTime: 0,
  penaltyTime: 0,
  finalTime: 0,
  finalTimeDisplay: '0.0',
  valueY: 0,
};

/**
 * Updates the DOM to display best scores retrieved from local storage or initialized values.
 */
function bestScoresToDOM() {
  elementsDOM.bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${game.bestScoreArray[index].bestScore}s`;
  });
}

/**
 * Retrieves best scores from local storage and initializes the game's best score array.
 */
function getSavedBestScores() {
  if (localStorage.getItem('bestScores')) {
    game.bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    game.bestScoreArray = [
      { questions: 10, bestScore: game.finalTimeDisplay },
      { questions: 25, bestScore: game.finalTimeDisplay },
      { questions: 50, bestScore: game.finalTimeDisplay },
      { questions: 99, bestScore: game.finalTimeDisplay },
    ];
    localStorage.setItem('bestScores', JSON.stringify(game.bestScoreArray));
  }
  bestScoresToDOM();
}

/**
 * Updates the best scores if the current final time is a new best for the set number of questions.
 */
function updateBestScore() {
  game.bestScoreArray.forEach((score, index) => {
    if (game.questionAmount == score.questions) {
      const savedBestScore = Number(game.bestScoreArray[index].bestScore);
      if (savedBestScore === 0 || savedBestScore > game.finalTime) {
        game.bestScoreArray[index].bestScore = game.finalTimeDisplay;
      }
    }
  });
  bestScoresToDOM();
  localStorage.setItem('bestScores', JSON.stringify(game.bestScoreArray));
}

/**
 * Resets the game to initial settings and shows the splash page to start a new round.
 */
function playAgain() {
  elementsDOM.gamePage.addEventListener('click', startTimer);
  elementsDOM.scorePage.hidden = true;
  elementsDOM.splashPage.hidden = false;
  game.equationsArray = [];
  game.playerGuessArray = [];
  game.valueY = 0;
  elementsDOM.playAgainBtn.hidden = true;
}

/**
 * Displays the score page with final time and penalties, and allows for playing again.
 */
function showScorePage() {
  setTimeout(() => {
    elementsDOM.playAgainBtn.hidden = false;
  }, 1000);
  elementsDOM.gamePage.hidden = true;
  elementsDOM.scorePage.hidden = false;
}

/**
 * Updates score elements on the DOM and processes end of game calculations.
 */
function scoresToDOM() {
  game.finalTimeDisplay = game.finalTime.toFixed(1);
  game.baseTime = game.timePlayed.toFixed(1);
  game.penaltyTime = game.penaltyTime.toFixed(1);

  elementsDOM.baseTimeEl.textContent = `Base Time: ${game.baseTime}s`;
  elementsDOM.penaltyTimeEl.textContent = `Penalty: +${game.penaltyTime}s`;
  elementsDOM.finalTimeEl.textContent = `${game.finalTimeDisplay}s`;

  updateBestScore();

  elementsDOM.itemContainer.scrollTo({ top: 0, behavior: 'instant' });

  showScorePage();
}

/**
 * Checks if the game has reached the set number of questions and stops the timer if so.
 */
function checkTime() {
  if (game.playerGuessArray.length == game.questionAmount) {
    clearInterval(game.timer);
    game.equationsArray.forEach((equation, index) => {
      if (equation.evaluated === game.playerGuessArray[index]) {
      } else {
        game.penaltyTime += 0.5;
      }
    });
    game.finalTime = game.timePlayed + game.penaltyTime;
    scoresToDOM();
  }
}

/**
 * Adds a tenth of a second to the total time played and checks the game's progress.
 */
function addTime() {
  game.timePlayed += 0.1;
  checkTime();
}

/**
 * Starts the game timer and removes the event listener to prevent restarting the timer.
 */
function startTimer() {
  game.timePlayed = 0;
  game.penaltyTime = 0;
  game.finalTime = 0;
  game.timer = setInterval(addTime, 100);
  elementsDOM.gamePage.removeEventListener('click', startTimer);
}

/**
 * Updates the label styling for selected radio buttons on the splash page.
 */
function updateSelectedLabel() {
  elementsDOM.radioContainers.forEach((radioEl) => {
    radioEl.classList.remove('selected-label');
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  });
}

/**
 * Retrieves the value of the selected radio input that represents the number of questions to play.
 * @returns {string} radioValue - The value of the checked radio input.
 */
function getRadioValue() {
  let radioValue;
  elementsDOM.radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

/**
 * Initiates a countdown starting from 3 to 0, then transitions to the game page.
 * This function manages the visual countdown displayed to the user before the game starts.
 */
function countdownStart() {
  let count = 3;
  elementsDOM.countdown.textContent = count;
  const timeCountdown = setInterval(() => {
    count--;
    if (count === 0) {
      elementsDOM.countdown.textContent = 'GO!';
    } else if (count === -1) {
      showGamePage();
      clearInterval(timeCountdown);
    } else {
      elementsDOM.countdown.textContent = count;
    }
  }, 1000);
}

/**
 * Shows the countdown page and hides the splash page, setting up the game by populating it with equations.
 * This function is part of the pre-game sequence, ensuring the game setup is complete before starting the countdown.
 */
function showCountdown() {
  elementsDOM.countdownPage.hidden = false;
  elementsDOM.splashPage.hidden = true;
  populateGamePage();
  countdownStart();
}

/**
 * Initiates the countdown before starting the game, sets up game state based on selected question amount.
 * @param {Event} e - The event object that triggered the form submission.
 */
function selectQuestionAmount(e) {
  e.preventDefault();
  game.questionAmount = getRadioValue();
  if (game.questionAmount) {
    showCountdown();
  } else {
    // TODO: Show msg -> Choose amount of questions
  }
}

/**
 * Handles user input for selecting true or false for a given equation during gameplay.
 * @param {boolean} guessedTrue - Indicates whether the user guessed 'true' or 'false'.
 * @returns {boolean} - The value of 'guessedTrue', indicating the user's guess.
 */
function select(guessedTrue) {
  game.valueY += 80;
  elementsDOM.itemContainer.scroll(0, game.valueY);
  return guessedTrue
    ? game.playerGuessArray.push('true')
    : game.playerGuessArray.push('false');
}

/**
 * Shows the game page and hides the countdown page, transitioning the user into actual gameplay.
 */
function showGamePage() {
  elementsDOM.gamePage.hidden = false;
  elementsDOM.countdownPage.hidden = true;
}

/**
 * Randomly generates an integer up to a maximum number.
 * @param {number} max - The upper limit for the generated integer (exclusive).
 * @returns {number} - A randomly generated integer from 0 to max-1.
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Creates and stores a mix of correct and incorrect equations based on the game's settings.
 */
function createEquations() {
  const MAX_CORRECT_NUMBER = 9;
  const MAX_WRONG_NUMBER = 3;

  const correctEquations = getRandomInt(game.questionAmount);

  const wrongEquations = game.questionAmount - correctEquations;

  for (let i = 0; i < correctEquations; i++) {
    game.firstNumber = getRandomInt(MAX_CORRECT_NUMBER);
    game.secondNumber = getRandomInt(MAX_CORRECT_NUMBER);

    const equationValue = game.firstNumber * game.secondNumber;
    const equation = `${game.firstNumber} x ${game.secondNumber} = ${equationValue}`;

    game.equationObject = { value: equation, evaluated: 'true' };
    game.equationsArray.push(game.equationObject);
  }

  for (let i = 0; i < wrongEquations; i++) {
    game.firstNumber = getRandomInt(MAX_CORRECT_NUMBER);
    game.secondNumber = getRandomInt(MAX_CORRECT_NUMBER);

    const equationValue = game.firstNumber * game.secondNumber;

    game.wrongFormat[0] = `${game.firstNumber} x ${
      game.secondNumber + 1
    } = ${equationValue}`;
    game.wrongFormat[1] = `${game.firstNumber} x ${game.secondNumber} = ${
      equationValue - 1
    }`;
    game.wrongFormat[2] = `${game.firstNumber + 1} x ${
      game.secondNumber
    } = ${equationValue}`;

    const formatChoice = getRandomInt(MAX_WRONG_NUMBER);
    const equation = game.wrongFormat[formatChoice];

    game.equationObject = { value: equation, evaluated: 'false' };
    game.equationsArray.push(game.equationObject);
  }
}

/**
 * Appends equation elements to the DOM within the game page for user interaction.
 */
function equationsToDOM() {
  game.equationsArray.forEach((equation) => {
    const item = document.createElement('div');
    item.classList.add('item');
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    item.appendChild(equationText);
    elementsDOM.itemContainer.appendChild(item);
  });
}

/**
 * Populates the game page with equations and spacer elements to facilitate gameplay.
 */
function populateGamePage() {
  elementsDOM.itemContainer.textContent = '';
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  elementsDOM.itemContainer.append(topSpacer, selectedItem);
  createEquations();
  equationsToDOM();
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  elementsDOM.itemContainer.appendChild(bottomSpacer);
}

/**
 * Attaches event listeners to various elements for game setup and gameplay.
 */
elementsDOM.startForm.addEventListener('click', updateSelectedLabel);
elementsDOM.startForm.addEventListener('submit', selectQuestionAmount);
elementsDOM.gamePage.addEventListener('click', startTimer);

// On Load
getSavedBestScores();
