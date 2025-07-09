// Referencias a elementos
const character = document.getElementById('character');
const gameArea = document.getElementById('gameArea');
const numberOptions = document.getElementById('numberOptions');
const scoreDisplay = document.querySelector('.score-level div:nth-child(1)');
const levelDisplay = document.querySelector('.score-level div:nth-child(2)');

// Variables de estado
let jumping = false;
let numberType = 'primos';
let gameStarted = false;
let gamePaused = false;
let score = 0;
let level = 1;
let obstacleSpeed = 5;
let obstacleInterval;
let obstacles = [];

// Configuración de niveles
const levels = {
    facil: ['primos', 'pares', 'impares'],
    medio: ['multiplos de 3', 'multiplos de 4', 'multiplos de 5'],
    dificil: ['multiplos de 7', 'cuadrados perfectos', 'fracciones']
};

// Mostrar opciones según nivel
function showOptions(nivel) {
    numberOptions.innerHTML = '';
    levels[nivel].forEach(tipo => {
        const btn = document.createElement('button');
        btn.className = 'option number-option';
        btn.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        btn.onclick = () => setNumberType(tipo);
        numberOptions.appendChild(btn);
    });
    numberOptions.style.display = 'flex';
}

function setNumberType(type) {
    numberType = type;
    console.log(`Tipo de número seleccionado: ${numberType}`);
}

// Lógica de salto
function jump() {
    if (jumping) return;
    jumping = true;
    let velocity = 12;
    let gravity = 0.5;
    let position = parseFloat(getComputedStyle(character).bottom);

    function performJump() {
        if (velocity > 0 || position > 20) {
            position += velocity;
            velocity -= gravity;
            character.style.bottom = position + 'px';
            requestAnimationFrame(performJump);
        } else {
            character.style.bottom = '20px';
            jumping = false;
        }
    }

    requestAnimationFrame(performJump);
}

// Iniciar el juego
function startGame() {
    gameStarted = true;
    gamePaused = false;
    score = 0;
    level = 1;
    obstacleSpeed = 5;

    scoreDisplay.textContent = `Puntuación: ${score}`;
    levelDisplay.textContent = `Nivel: ${level}`;

    document.getElementById('startButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'inline-block';

    obstacleInterval = setInterval(() => {
        if (!gamePaused) {
            createObstacle();
        }
    }, getRandomTime(800, 2500));

    requestAnimationFrame(updateObstacles);
}

// Pausar o reanudar el juego
function pauseGame() {
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseButton');
    pauseBtn.innerText = gamePaused ? 'Reanudar Juego' : 'Pausar Juego';

    if (gamePaused) {
        clearInterval(obstacleInterval);
    } else {
        obstacleInterval = setInterval(() => {
            if (!gamePaused) {
                createObstacle();
            }
        }, getRandomTime(800, 2500));
        requestAnimationFrame(updateObstacles);
    }
}

// Crear un nuevo obstáculo
function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';

    const value = generateNumber();
    obstacle.innerText = value;
    obstacle.dataset.value = value;
    obstacle.style.left = gameArea.offsetWidth + 'px';

    gameArea.appendChild(obstacle);
    obstacles.push(obstacle);
}

// Mover y gestionar colisiones de obstáculos
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        const currentLeft = parseFloat(obstacle.style.left);
        obstacle.style.left = (currentLeft - obstacleSpeed) + 'px';

        const obsRect = obstacle.getBoundingClientRect();
        const charRect = character.getBoundingClientRect();

        const horizontalOverlap = charRect.right > obsRect.left && charRect.left < obsRect.right;
        const verticalOverlap = charRect.bottom > obsRect.top && charRect.top < obsRect.bottom;

        if (horizontalOverlap && verticalOverlap) {
            const num = parseObstacleNumber(obstacle.dataset.value);
            if (isNumberValid(num)) {
                score += 10;
                scoreDisplay.textContent = `Puntuación: ${score}`;
                if (score % 100 === 0) {
                    obstacleSpeed += 1;
                    level++;
                    levelDisplay.textContent = `Nivel: ${level}`;
                }
            } else {
                endGame("¡Perdiste! Colisionaste con un número incorrecto.");
            }
            gameArea.removeChild(obstacle);
            obstacles.splice(index, 1);
        }

        if (currentLeft < -50) {
            gameArea.removeChild(obstacle);
            obstacles.splice(index, 1);
        }
    });

    if (!gamePaused && gameStarted) {
        requestAnimationFrame(updateObstacles);
    }
}

function endGame(message) {
    alert(message);
    gameStarted = false;
    document.getElementById('startButton').style.display = 'inline-block';
    document.getElementById('pauseButton').style.display = 'none';
    score = 0;
    level = 1;
    obstacleSpeed = 5;
    scoreDisplay.textContent = 'Puntuación: 0';
    levelDisplay.textContent = `Nivel: ${level}`;
    clearInterval(obstacleInterval);
    obstacles.forEach(o => gameArea.removeChild(o));
    obstacles = [];
}

// Utilidades de generación
function generateNumber() {
    let isValid = Math.random() < 0.6;
    let num;
    switch (numberType) {
        case 'primos': return isValid ? generatePrime() : generateNonPrime();
        case 'pares': return isValid ? randomEven() : randomOdd();
        case 'impares': return isValid ? randomOdd() : randomEven();
        case 'multiplos de 3': return isValid ? randomMultipleOf(3) : randomNonMultipleOf(3);
        case 'multiplos de 4': return isValid ? randomMultipleOf(4) : randomNonMultipleOf(4);
        case 'multiplos de 5': return isValid ? randomMultipleOf(5) : randomNonMultipleOf(5);
        case 'multiplos de 7': return isValid ? randomMultipleOf(7) : randomNonMultipleOf(7);
        case 'cuadrados perfectos': return isValid ? generatePerfectSquare() : generateNonPerfectSquare();
        case 'fracciones': return isValid ? '1/2' : '5';
        default: return 0;
    }
}

function parseObstacleNumber(text) {
    if (text.includes('/')) {
        const [num, den] = text.split('/').map(Number);
        return num / den;
    }
    return parseInt(text);
}

function isNumberValid(num) {
    switch (numberType) {
        case 'primos': return isPrime(num);
        case 'pares': return num % 2 === 0;
        case 'impares': return num % 2 !== 0;
        case 'multiplos de 3': return num % 3 === 0;
        case 'multiplos de 4': return num % 4 === 0;
        case 'multiplos de 5': return num % 5 === 0;
        case 'multiplos de 7': return num % 7 === 0;
        case 'cuadrados perfectos': return Number.isInteger(Math.sqrt(num));
        case 'fracciones': return isNaN(num); // porque parseObstacleNumber da número real
        default: return false;
    }
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

// Generadores auxiliares
function randomEven() { return Math.floor(Math.random() * 50) * 2; }
function randomOdd() { return Math.floor(Math.random() * 50) * 2 + 1; }
function randomMultipleOf(n) { return Math.floor(Math.random() * 20 + 1) * n; }
function randomNonMultipleOf(n) {
    let x;
    do { x = Math.floor(Math.random() * 100) + 1; } while (x % n === 0);
    return x;
}
function generatePrime() {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
    return primes[Math.floor(Math.random() * primes.length)];
}
function generateNonPrime() {
    let x;
    do { x = Math.floor(Math.random() * 50) + 1; } while (isPrime(x));
    return x;
}
function generatePerfectSquare() {
    const squares = [1, 4, 9, 16, 25, 36, 49, 64];
    return squares[Math.floor(Math.random() * squares.length)];
}
function generateNonPerfectSquare() {
    let x;
    do { x = Math.floor(Math.random() * 100); } while (Number.isInteger(Math.sqrt(x)));
    return x;
}

// Tiempo aleatorio entre obstáculos
function getRandomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Entradas de usuario
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && gameStarted && !gamePaused) {
        jump();
    }
});

gameArea.addEventListener('click', () => {
    if (gameStarted && !gamePaused) {
        jump();
    }
});
