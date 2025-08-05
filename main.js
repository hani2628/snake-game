// Snake Game Configuration
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const GAME_SPEED = 150;

// Game State
let snake = [...INITIAL_SNAKE];
let food = { ...INITIAL_FOOD };
let direction = 'RIGHT';
let gameRunning = false;
let gameOver = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
let gameInterval = null;

// DOM Elements
let gameBoard = null;
let scoreElement = null;
let highScoreElement = null;
let playButton = null;
let resetButton = null;
let gameOverOverlay = null;

// Utility Functions
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

function resetGame() {
  snake = [...INITIAL_SNAKE];
  food = { ...INITIAL_FOOD };
  direction = 'RIGHT';
  gameRunning = false;
  gameOver = false;
  score = 0;
  updateScore();
  updateUI();
  renderGame();
}

function toggleGame() {
  if (gameOver) {
    resetGame();
  } else {
    gameRunning = !gameRunning;
    if (gameRunning) {
      startGameLoop();
    } else {
      stopGameLoop();
    }
    updateUI();
  }
}

function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(moveSnake, GAME_SPEED);
}

function stopGameLoop() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
}

function moveSnake() {
  if (!gameRunning || gameOver) return;

  const newSnake = [...snake];
  const head = { ...newSnake[0] };

  // Move head based on direction
  switch (direction) {
    case 'UP':
      head.y -= 1;
      break;
    case 'DOWN':
      head.y += 1;
      break;
    case 'LEFT':
      head.x -= 1;
      break;
    case 'RIGHT':
      head.x += 1;
      break;
  }

  // Check wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    gameOver = true;
    gameRunning = false;
    stopGameLoop();
    updateUI();
    showGameOver();
    return;
  }

  // Check self collision
  if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver = true;
    gameRunning = false;
    stopGameLoop();
    updateUI();
    showGameOver();
    return;
  }

  newSnake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', highScore.toString());
    }
    updateScore();
    food = generateFood();
  } else {
    newSnake.pop();
  }

  snake = newSnake;
  renderGame();
}

function updateScore() {
  if (scoreElement) scoreElement.textContent = score;
  if (highScoreElement) highScoreElement.textContent = highScore;
}

function updateUI() {
  if (!playButton) return;
  
  const playIcon = playButton.querySelector('.play-icon');
  const pauseIcon = playButton.querySelector('.pause-icon');
  const resetIcon = playButton.querySelector('.reset-icon');
  const buttonText = playButton.querySelector('.button-text');

  if (gameOver) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'none';
    resetIcon.style.display = 'inline';
    buttonText.textContent = 'Play Again';
    playButton.className = playButton.className.replace('bg-green-600 hover:bg-green-700', 'bg-green-600 hover:bg-green-700');
  } else if (gameRunning) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'inline';
    resetIcon.style.display = 'none';
    buttonText.textContent = 'Pause';
  } else {
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
    resetIcon.style.display = 'none';
    buttonText.textContent = 'Start';
  }
}

function showGameOver() {
  if (gameOverOverlay) {
    const finalScore = gameOverOverlay.querySelector('.final-score');
    const newHighScore = gameOverOverlay.querySelector('.new-high-score');
    
    if (finalScore) finalScore.textContent = score;
    if (newHighScore) {
      newHighScore.style.display = (score === highScore && score > 0) ? 'block' : 'none';
    }
    
    gameOverOverlay.style.display = 'flex';
  }
}

function hideGameOver() {
  if (gameOverOverlay) {
    gameOverOverlay.style.display = 'none';
  }
}

function renderGame() {
  if (!gameBoard) return;

  const cells = gameBoard.children;
  
  // Clear all cells
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    cell.className = 'transition-all duration-100 border border-green-100 bg-green-50 hover:bg-green-100';
  }

  // Render snake
  snake.forEach((segment, index) => {
    const cellIndex = segment.y * GRID_SIZE + segment.x;
    const cell = cells[cellIndex];
    if (cell) {
      if (index === 0) {
        // Snake head
        cell.className = 'transition-all duration-100 border border-green-100 bg-green-600 shadow-lg scale-110';
      } else {
        // Snake body
        cell.className = 'transition-all duration-100 border border-green-100 bg-green-500';
      }
    }
  });

  // Render food
  const foodIndex = food.y * GRID_SIZE + food.x;
  const foodCell = cells[foodIndex];
  if (foodCell) {
    foodCell.className = 'transition-all duration-100 border border-green-100 bg-red-500 rounded-full shadow-lg animate-pulse';
  }
}

function handleKeyPress(e) {
  if (!gameRunning && !gameOver) return;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault();
      if (direction !== 'DOWN') direction = 'UP';
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault();
      if (direction !== 'UP') direction = 'DOWN';
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault();
      if (direction !== 'RIGHT') direction = 'LEFT';
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault();
      if (direction !== 'LEFT') direction = 'RIGHT';
      break;
    case ' ':
      e.preventDefault();
      toggleGame();
      break;
  }
}

// Initialize Game
function initGame() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="flex items-center justify-center gap-3 mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h1 class="text-4xl font-bold text-gray-800">Snake Game</h1>
          </div>
          
          <!-- Score Display -->
          <div class="flex justify-center gap-8 mb-4">
            <div class="text-center">
              <p class="text-sm text-gray-600 font-medium">Score</p>
              <p class="text-2xl font-bold text-green-600" id="score">0</p>
            </div>
            <div class="text-center">
              <div class="flex items-center gap-1 justify-center">
                <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <p class="text-sm text-gray-600 font-medium">Best</p>
              </div>
              <p class="text-2xl font-bold text-yellow-600" id="highScore">${highScore}</p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex justify-center gap-4 mb-6">
            <button id="playButton" class="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5 play-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
              </svg>
              <svg class="w-5 h-5 pause-icon" style="display: none;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <svg class="w-5 h-5 reset-icon" style="display: none;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span class="button-text">Start</span>
            </button>
            <button id="resetButton" class="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Reset
            </button>
          </div>
        </div>

        <!-- Game Board -->
        <div class="relative mx-auto mb-6" style="width: 400px; height: 400px;">
          <div id="gameBoard" class="grid border-4 border-gray-800 rounded-lg overflow-hidden shadow-inner bg-green-50" style="grid-template-columns: repeat(${GRID_SIZE}, 1fr); grid-template-rows: repeat(${GRID_SIZE}, 1fr); width: 400px; height: 400px;">
            ${Array.from({ length: GRID_SIZE * GRID_SIZE }, () => 
              '<div class="transition-all duration-100 border border-green-100 bg-green-50 hover:bg-green-100"></div>'
            ).join('')}
          </div>

          <!-- Game Over Overlay -->
          <div id="gameOverOverlay" class="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg" style="display: none;">
            <div class="text-center text-white">
              <h2 class="text-3xl font-bold mb-2">Game Over!</h2>
              <p class="text-lg mb-4">Final Score: <span class="final-score">0</span></p>
              <p class="text-yellow-400 font-bold mb-4 new-high-score" style="display: none;">🎉 New High Score! 🎉</p>
              <button id="playAgainButton" class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200">
                Play Again
              </button>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="text-center text-gray-600">
          <p class="text-sm mb-2">
            Use <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">WASD</kbd> or 
            <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono ml-1">Arrow Keys</kbd> to move
          </p>
          <p class="text-sm">
            Press <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Space</kbd> to pause/resume
          </p>
        </div>
      </div>
    </div>
  `;

  // Get DOM references
  gameBoard = document.getElementById('gameBoard');
  scoreElement = document.getElementById('score');
  highScoreElement = document.getElementById('highScore');
  playButton = document.getElementById('playButton');
  resetButton = document.getElementById('resetButton');
  gameOverOverlay = document.getElementById('gameOverOverlay');
  const playAgainButton = document.getElementById('playAgainButton');

  // Add event listeners
  playButton.addEventListener('click', toggleGame);
  resetButton.addEventListener('click', resetGame);
  playAgainButton.addEventListener('click', () => {
    hideGameOver();
    toggleGame();
  });
  
  window.addEventListener('keydown', handleKeyPress);

  // Initial render
  updateScore();
  updateUI();
  renderGame();
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);