// css class for different card image
const CARD_TECHS = [
  'html5',
  'css3',
  'js',
  'sass',
  'nodejs',
  'react',
  'linkedin',
  'heroku',
  'github',
  'aws'
];

// only list out some of the properties,
// add more when needed
const game = {
  score: 0,
  level: 1,
  timer: 60,
  timerDisplay: null,
  scoreDisplay: null,
  levelDisplay: null,
  timerInterval: null,
  startButton: null,
  // and much more
  gameBoard: null,
  selectedCardFront: null,
  hasPenalty: false,
  levelOneLeft: 4,
  levelTwoLeft: 16,
  levelThreeLeft: 36,
  isEnd: false
};

setGame();
startGame();

/*******************************************
 /     game process
 /******************************************/
function setGame() {
  // register any element in your game object
  game.startButton = document.querySelector('.game-stats__button');
  game.gameBoard = document.querySelector('.game-board');
  game.scoreDisplay = document.querySelector('.game-stats__score--value');
  game.levelDisplay = document.querySelector('.game-stats__level--value');
  game.timerDisplay = document.querySelector('.game-timer__bar');
}

function startGame() {
  bindStartButton();
  bindCardClick();
}

function levelUp() {
  clearInterval(game.timerInterval);
  setTimeout(function () {
    game.level++;
    updateLevel();
    resetTimer();
    updateTimerDisplay();
    nextLevel();
  }, 2000);
}

function handleClearCards() {
  // update score
  updateScore();

  if (game.level === 1) {
    game.levelOneLeft -= 2;
    if (game.levelOneLeft === 0) {
      levelUp();
    }
  } else if (game.level === 2) {
    game.levelTwoLeft -= 2;
    if (game.levelTwoLeft == 0) {
      levelUp();
    }
  } else if (game.level === 3) {
    game.levelThreeLeft -= 2;
    if (game.levelThreeLeft === 0) {
      setTimeout(function () {
        handleGameOver();
      }, 500);
    }
  }
}

function nextLevel() {
  let arrayCard = generateCards(game.level);
  arrayCard = shuffle(arrayCard);

  // create document fragment
  const docFragment = document.createDocumentFragment();
  for (const i in arrayCard) {
    // create card div
    const divCard = document.createElement('div');
    divCard.setAttribute('class', 'card ' + arrayCard[i]);
    // create card front div
    const divCardFront = document.createElement('div');
    // create card back div
    const divCardBack = document.createElement('div');
    divCardFront.setAttribute('class', 'card__face card__face--front');
    divCardBack.setAttribute('class', 'card__face card__face--back');
    divCard.appendChild(divCardFront);
    divCard.appendChild(divCardBack);
    docFragment.appendChild(divCard);
  }
  // append to game board
  const gridTemplateColumns = game.level === 1 ? '1fr 1fr' :
    (game.level === 2 ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr 1fr 1fr 1fr');
  game.gameBoard.style = 'grid-template-columns: ' + gridTemplateColumns;
  game.gameBoard.innerHTML = null;
  game.gameBoard.appendChild(docFragment);
}

function generateCards(level) {
  let arrayCard = [];
  if (level === 1) {
    for (let i = 0; i < 2; i++) {
      arrayCard.push(CARD_TECHS[i]);
    }
  } else if (level === 2) {
    for (let i = 0; i < 8; i++) {
      arrayCard.push(CARD_TECHS[i]);
    }
  } else if (level === 3) {
    let j = 0;
    for (let i = 0; i < 18; i++) {
      if (j === 10) {
        j = 0;
      }
      arrayCard.push(CARD_TECHS[j++]);
    }
  }
  return arrayCard.concat(arrayCard);
}

function shuffle(cards) {
  return cards.sort(function () {
    return 0.5 - Math.random();
  });
}

function handleGameOver() {
  game.isEnd = true;
  alert('Congratulations, your score is ' + game.score);
  game.startButton.innerHTML = 'New Game';
}

/*******************************************
 /     UI update
 /******************************************/
function updateScore() {
  game.score += 10;
  game.scoreDisplay.innerHTML = game.score;
}

function updateLevel() {
  game.levelDisplay.innerHTML = game.level;
}

function updateTimerDisplay() {
  game.timerInterval = setInterval(function () {
    if (game.isEnd) {
      clearInterval(game.timerInterval);
      return;
    }
    game.timerDisplay.innerHTML = --game.timer + 's';
    const width = game.timer / 60 * 100 + '%';
    game.timerDisplay.style.width = width;

    if (game.timer === 0) {
      handleGameOver();
    }
  }, 1000);
}

/*******************************************
 /     bindings
 /******************************************/
function bindStartButton() {
  // bind start button
  game.startButton.addEventListener('click', function () {
    if (this.innerHTML === 'New Game') {
      this.innerHTML = 'End Game';
      initializeGame();
      // generate card layout
      nextLevel();
      updateTimerDisplay();
    } else {
      handleGameOver();
    }
  });
}

function resetTimer() {
  game.timer = 60;
  game.timerDisplay.innerHTML = game.timer + 's';
  game.timerDisplay.style = null;
}

function initializeGame() {
  game.isEnd = false;
  game.levelOneLeft = 4;
  game.levelTwoLeft = 16;
  game.levelThreeLeft = 36;
  game.score = 0;
  game.level = 1;
  game.scoreDisplay.innerHTML = game.score;
  game.levelDisplay.innerHTML = game.level;
  resetTimer();
}

function bindCardClick() {
  // bubble event up to game board div
  game.gameBoard.addEventListener('click', function (event) {
    const target = event.target;
    if (game.isEnd || target === this ||
      game.hasPenalty || target.parentElement.hasAttribute('data-matched')) {
      return;
    }
    // if selecting the card the first time
    if (!game.selectedCardFront) {
      game.selectedCardFront = target;
      // flip card
      flipCard(game.selectedCardFront);
      return;
    }
    const comparedCardFront = target.parentElement.firstElementChild;
    // if selecting the same card
    if (game.selectedCardFront === comparedCardFront) {
      flipBackCard(game.selectedCardFront);
      game.selectedCardFront = null;
    } else {
      // flip card
      flipCard(target);
      const selectedCardParent = game.selectedCardFront.parentElement;
      const comparedCardParent = target.parentElement;
      // if two selected card has the same value of the class attribute
      if (selectedCardParent.getAttribute('class')
        === comparedCardParent.getAttribute('class')) {
        game.selectedCardFront.parentElement.dataset.matched = '1';
        target.parentElement.dataset.matched = '1';
        game.selectedCardFront = null;

        handleClearCards();
      } else {
        game.hasPenalty = true;
        // flip back after 1.5 seconds
        setTimeout(function () {
          game.hasPenalty = false;
          flipBackCard(game.selectedCardFront, target);
          game.selectedCardFront = null;
        }, 1500);
      }
    }
  });
}

function flipCard(cardFront) {
  cardFront.style.transform = 'rotateY(180deg)';
  cardFront.nextElementSibling.style.transform = 'rotateY(0deg)';
}

function flipBackCard(cardFront, comparedCardFront) {
  cardFront.style = null;
  cardFront.nextElementSibling.style = null;
  if (comparedCardFront) {
    comparedCardFront.style = null;
    comparedCardFront.nextElementSibling.style = null;
  }
}
