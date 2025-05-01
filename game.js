// Инициализация canvas и контекста
let canvas;
let ctx;
let menu;
let achievementsButton;
let achievementsPanel;
let achievementsList;
let closeButton;
let debug;
let gameLoopId = null;
let frameCount = 0;
let particles = [];
let stars = [];
let keys = {};

// Настройки уровней
const levelSettings = {
    1: {
        starCount: 5,
        starSpeed: 2,
        cometCount: 0,
        starsToNextLevel: 10,
        playerSpeed: 5,
        cometSpeed: 0,
        specialFeatures: []
    },
    2: {
        starCount: 8,
        starSpeed: 3,
        cometCount: 2,
        starsToNextLevel: 15,
        playerSpeed: 5,
        cometSpeed: 3,
        specialFeatures: ['comets']
    },
    3: {
        starCount: 10,
        starSpeed: 3.5,
        cometCount: 3,
        starsToNextLevel: 20,
        playerSpeed: 6,
        cometSpeed: 4,
        specialFeatures: ['comets', 'movingStars']
    },
    4: {
        starCount: 12,
        starSpeed: 4,
        cometCount: 4,
        starsToNextLevel: 25,
        playerSpeed: 6,
        cometSpeed: 5,
        specialFeatures: ['comets', 'movingStars', 'shrinkingStars']
    },
    5: {
        starCount: 15,
        starSpeed: 4.5,
        cometCount: 5,
        starsToNextLevel: 30,
        playerSpeed: 7,
        cometSpeed: 6,
        specialFeatures: ['comets', 'movingStars', 'shrinkingStars', 'cometBurst']
    },
    6: {
        starCount: 18,
        starSpeed: 5,
        cometCount: 6,
        starsToNextLevel: 35,
        playerSpeed: 7,
        cometSpeed: 7,
        specialFeatures: ['comets', 'movingStars', 'shrinkingStars', 'cometBurst', 'blackHoles']
    }
};

// Система достижений
const achievements = {
    firstStar: {
        id: 'firstStar',
        title: 'Первая звезда',
        description: 'Соберите свою первую звезду',
        icon: '⭐',
        unlocked: false
    },
    starCollector: {
        id: 'starCollector',
        title: 'Собиратель звёзд',
        description: 'Соберите 100 звёзд',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        target: 100
    },
    speedster: {
        id: 'speedster',
        title: 'Спидстер',
        description: 'Достигните 5 уровня',
        icon: '⚡',
        unlocked: false
    },
    master: {
        id: 'master',
        title: 'Мастер',
        description: 'Наберите 1000 очков',
        icon: '👑',
        unlocked: false
    },
    perfect: {
        id: 'perfect',
        title: 'Идеальный улов',
        description: 'Поймайте 20 звёзд подряд, не пропустив ни одной',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        target: 20
    },
    cometDodger: {
        id: 'cometDodger',
        title: 'Уклонение от комет',
        description: 'Пройдите уровень 2, не получив урона от комет',
        icon: '☄️',
        unlocked: false
    },
    starChaser: {
        id: 'starChaser',
        title: 'Преследователь звёзд',
        description: 'Поймайте 10 движущихся звёзд на уровне 3',
        icon: '🌠',
        unlocked: false,
        progress: 0,
        target: 10
    },
    quickFinger: {
        id: 'quickFinger',
        title: 'Быстрые пальцы',
        description: 'Поймайте 5 уменьшающихся звёзд на уровне 4',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        target: 5
    },
    cometMaster: {
        id: 'cometMaster',
        title: 'Повелитель комет',
        description: 'Уничтожьте 10 взрывающихся комет на уровне 5',
        icon: '💥',
        unlocked: false,
        progress: 0,
        target: 10
    },
    blackHoleSurvivor: {
        id: 'blackHoleSurvivor',
        title: 'Выживший в черной дыре',
        description: 'Пройдите уровень 6, собрав все звёзды',
        icon: '🕳️',
        unlocked: false
    }
};

// Игровые объекты
const player = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    speed: 5,
    score: 0,
    health: 100
};

// Добавляем массив для комет
let comets = [];

// Система уровней
const gameState = {
    level: 1,
    starsToNextLevel: 10,
    starsCaught: 0,
    maxStars: 5,
    starSpeed: 2,
    starSpawnRate: 60,
    isPlaying: false,
    missedStars: 0,
    consecutiveCatches: 0,
    unlockedLevels: [1],
    movingStars: false,
    shrinkingStars: false,
    cometBurst: false
};

// Добавляем интеграцию с Яндекс.Играми
let ysdk;

// Добавляем систему бонусов и улучшений
const powerUps = {
    shield: {
        active: false,
        duration: 0,
        maxDuration: 300,
        icon: '🛡️',
        color: '#00ffff'
    },
    magnet: {
        active: false,
        duration: 0,
        maxDuration: 300,
        icon: '🧲',
        color: '#ff00ff'
    },
    multiplier: {
        active: false,
        duration: 0,
        maxDuration: 300,
        value: 2,
        icon: '✨',
        color: '#ffff00'
    },
    timeFreeze: {
        active: false,
        duration: 0,
        maxDuration: 200,
        icon: '❄️',
        color: '#00ffff'
    },
    rapidFire: {
        active: false,
        duration: 0,
        maxDuration: 250,
        icon: '🔥',
        color: '#ff4400'
    },
    ghostMode: {
        active: false,
        duration: 0,
        maxDuration: 200,
        icon: '👻',
        color: '#ffffff'
    }
};

// Добавляем ежедневные награды
const dailyRewards = {
    lastClaimDate: null,
    rewards: [
        { stars: 50, powerUps: ['shield'] },
        { stars: 100, powerUps: ['magnet'] },
        { stars: 150, powerUps: ['multiplier'] },
        { stars: 200, powerUps: ['shield', 'magnet'] },
        { stars: 250, powerUps: ['magnet', 'multiplier'] },
        { stars: 300, powerUps: ['shield', 'multiplier'] },
        { stars: 500, powerUps: ['shield', 'magnet', 'multiplier'] }
    ],
    currentStreak: 0,
    maxStreak: 7
};

// Добавляем бонусный уровень
const bonusLevel = {
    active: false,
    duration: 0,
    maxDuration: 1800, // 30 секунд
    starMultiplier: 3,
    scoreMultiplier: 5
};

// Добавляем звуковые эффекты
const sounds = {
    starCollect: null,
    cometHit: null,
    powerUp: null,
    initialized: false
};

// Функция воспроизведения звука
function playSound(soundName) {
    if (!sounds.initialized) return;
    
    const sound = sounds[soundName];
    if (!sound) return;
    
    try {
        sound.currentTime = 0;
        const playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Тихо игнорируем ошибки воспроизведения
            });
        }
    } catch (error) {
        // Тихо игнорируем ошибки
    }
}

// Инициализация звуков
function initializeSounds() {
    try {
        // Создаем звуковые объекты
        sounds.starCollect = new Audio();
        sounds.cometHit = new Audio();
        sounds.powerUp = new Audio();

        // Устанавливаем источники звуков
        const soundSources = {
            starCollect: 'data:audio/wav;base64,UklGRl4JAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToJAAAAAAEAAP//AgD//wQA//8GAP//CAD//woA//8MAP//DgD//xAA//8SAP//FAD//xYA//8YAP//GgD//xwA//8eAP//IAD//yIA//8kAP//JgD//ygA//8qAP//LAD//y4A//8wAP//MgD//zQA//82AP//OAD//zoA//88AP//PgD//0AA//9CAP//RAD//0YA//9IAP//SgD//0wA//9OAP//UAD//1IA//9UAP//VgD//1gA//9aAP//XAD//14A//9gAP//YgD//2QA//9mAP//aAD//2oA//9sAP//bgD//3AA//9yAP//dAD//3YA//94AP//egD//3wA//9+AP//gAD//4IA//+EAP//hgD//4gA//+KAP//jAD//44A//+QAP//kgD//5QA//+WAP//mAD//5oA//+cAP//ngD//6AA//+iAP//pAD//6YA//+oAP//qgD//6wA//+uAP//sAD//7IA//+0AP//tgD//7gA//+6AP//vAD//74A//',
            cometHit: 'data:audio/wav;base64,UklGRmYJAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YT4JAAD//wIA//8EAP//BgD//wgA//8KAP//DAD//w4A//8QAP//EgD//xQA//8WAP//GAD//xoA//8cAP//HgD//yAA//8iAP//JAD//yYA//8oAP//KgD//ywA//8uAP//MAD//zIA//80AP//NgD//zgA//86AP//PAD//z4A//9AAP//QgD//0QA//9GAP//SAD//0oA//9MAP//TgD//1AA//9SAP//VAD//1YA//9YAP//WgD//1wA//9eAP//YAD//2IA//9kAP//ZgD//2gA//9qAP//bAD//24A//9wAP//cgD//3QA//92AP//eAD//3oA//98AP//fgD//4AA//+CAP//hAD//4YA//+IAP//igD//4wA//+OAP//kAD//5IA//+UAP//lgD//5gA//+aAP//nAD//54A//+gAP//ogD//6QA//+mAP//qAD//6oA//+sAP//rgD//7AA//+yAP//tAD//7YA//+4AP//ugD//7wA//++AP//',
            powerUp: 'data:audio/wav;base64,UklGRnYJAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4JAAD//wIA//8EAP//BgD//wgA//8KAP//DAD//w4A//8QAP//EgD//xQA//8WAP//GAD//xoA//8cAP//HgD//yAA//8iAP//JAD//yYA//8oAP//KgD//ywA//8uAP//MAD//zIA//80AP//NgD//zgA//86AP//PAD//z4A//9AAP//QgD//0QA//9GAP//SAD//0oA//9MAP//TgD//1AA//9SAP//VAD//1YA//9YAP//WgD//1wA//9eAP//YAD//2IA//9kAP//ZgD//2gA//9qAP//bAD//24A//9wAP//cgD//3QA//92AP//eAD//3oA//98AP//fgD//4AA//+CAP//hAD//4YA//+IAP//igD//4wA//+OAP//kAD//5IA//+UAP//lgD//5gA//+aAP//nAD//54A//+gAP//ogD//6QA//+mAP//qAD//6oA//+sAP//rgD//7AA//+yAP//tAD//7YA//+4AP//ugD//7wA//++AP//'
        };

        // Загружаем звуки
        Object.entries(soundSources).forEach(([name, src]) => {
            if (sounds[name]) {
                sounds[name].src = src;
                sounds[name].volume = 0.5;
                sounds[name].load();
            }
        });

        // Добавляем обработчик для разблокировки звука после взаимодействия пользователя
        const unlockAudio = () => {
            Object.values(sounds).forEach(sound => {
                if (sound && sound.play) {
                    sound.play().then(() => {
                        sound.pause();
                        sound.currentTime = 0;
                    }).catch(() => {
                        // Игнорируем ошибки
                    });
                }
            });
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };

        // Добавляем обработчики для разблокировки звука
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        sounds.initialized = true;
    } catch (error) {
        sounds.initialized = false;
        // Тихо игнорируем ошибки инициализации
    }
}

// Добавляем таблицу рекордов
const leaderboard = {
    scores: [],
    maxEntries: 10,
    
    addScore(score, playerName = 'Player') {
        this.scores.push({ score, playerName, date: new Date().toISOString() });
        this.scores.sort((a, b) => b.score - a.score);
        if (this.scores.length > this.maxEntries) {
            this.scores.length = this.maxEntries;
        }
        this.save();
    },
    
    save() {
        localStorage.setItem('leaderboard', JSON.stringify(this.scores));
    },
    
    load() {
        const saved = localStorage.getItem('leaderboard');
        if (saved) {
            this.scores = JSON.parse(saved);
        }
    },
    
    show() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            color: white;
            min-width: 300px;
        `;
        
        panel.innerHTML = `
            <h2 style="color: #ffd700; text-align: center; margin-bottom: 20px;">Таблица рекордов</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <th style="padding: 8px; border-bottom: 1px solid #333;">Место</th>
                    <th style="padding: 8px; border-bottom: 1px solid #333;">Игрок</th>
                    <th style="padding: 8px; border-bottom: 1px solid #333;">Очки</th>
                </tr>
                ${this.scores.map((score, index) => `
                    <tr>
                        <td style="padding: 8px; text-align: center;">${index + 1}</td>
                        <td style="padding: 8px;">${score.playerName}</td>
                        <td style="padding: 8px; text-align: right;">${score.score}</td>
                    </tr>
                `).join('')}
            </table>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 8px 16px;
                background: #ffd700;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                display: block;
                margin-left: auto;
                margin-right: auto;
            ">Закрыть</button>
        `;
        
        document.body.appendChild(panel);
    }
};

// Функция создания бонуса
function createPowerUp() {
    const types = Object.keys(powerUps);
    const type = types[Math.floor(Math.random() * types.length)];
    return {
        type,
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2
    };
}

// Массив активных бонусов
let activePowerUps = [];

// Система частиц
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
        this.size *= 0.95;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Создание частиц
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Обновление частиц
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0 || particles[i].size <= 0.5) {
            particles.splice(i, 1);
        }
    }
}

// Отрисовка частиц
function drawParticles() {
    particles.forEach(particle => particle.draw(ctx));
}

// Обработчики событий
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameState.isPlaying) {
        returnToMenu();
    }
});

// Добавляем обработчики для кнопок после загрузки DOM
function initializeEventListeners() {
    // Создаем контейнер для кнопок уровней
    const levelsContainer = document.createElement('div');
    levelsContainer.id = 'levelsContainer';
    levelsContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
        padding: 10px;
    `;
    menu.appendChild(levelsContainer);

    // Создаем кнопки для каждого уровня
    for (let i = 1; i <= 6; i++) {
        const levelButton = document.createElement('button');
        levelButton.className = 'level-button';
        levelButton.dataset.level = i;
        levelButton.innerHTML = `
            <div class="level-number">${i}</div>
            <div class="level-info">
                <div class="level-stars">⭐ ${levelSettings[i].starsToNextLevel}</div>
                <div class="level-features">${getLevelFeatures(i)}</div>
            </div>
        `;
        levelButton.style.cssText = `
            width: 150px;
            height: 80px;
            border: 2px solid #4a4a4a;
            border-radius: 10px;
            background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
        `;

        // Добавляем эффект при наведении
        levelButton.onmouseover = () => {
            levelButton.style.transform = 'scale(1.05)';
            levelButton.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
        };
        levelButton.onmouseout = () => {
            levelButton.style.transform = 'scale(1)';
            levelButton.style.boxShadow = 'none';
        };

        // Добавляем обработчик клика
        levelButton.onclick = () => {
            if (!levelButton.classList.contains('locked')) {
                startGame(i);
            }
        };

        levelsContainer.appendChild(levelButton);
    }

    // Добавляем стили для заблокированных уровней
    const style = document.createElement('style');
    style.textContent = `
        .level-button.locked {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
        }
        .level-button.locked::after {
            content: '🔒';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
        }
        .level-number {
            font-size: 24px;
            font-weight: bold;
            color: #ffd700;
            margin-bottom: 5px;
        }
        .level-info {
            font-size: 12px;
            text-align: center;
        }
        .level-stars {
            color: #ffd700;
            margin-bottom: 3px;
        }
        .level-features {
            color: #aaa;
            font-size: 10px;
        }
    `;
    document.head.appendChild(style);

    // Остальные обработчики событий
    document.getElementById('startButton').addEventListener('click', () => {
        startGame(1);
    });

    achievementsButton.addEventListener('click', () => {
        achievementsPanel.classList.remove('hidden');
        updateAchievementsDisplay();
    });

    closeButton.addEventListener('click', () => {
        achievementsPanel.classList.add('hidden');
    });

    // Добавляем обработчик клавиши Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && achievementsPanel.classList.contains('hidden') === false) {
            closeButton.click();
        } else if (e.key === 'Escape' && gameState.isPlaying) {
            returnToMenu();
        }
    });
}

// Функция для получения описания особенностей уровня
function getLevelFeatures(level) {
    const features = [];
    const settings = levelSettings[level];
    
    if (settings.cometCount > 0) features.push('☄️');
    if (settings.specialFeatures.includes('movingStars')) features.push('🌠');
    if (settings.specialFeatures.includes('shrinkingStars')) features.push('⭐');
    if (settings.specialFeatures.includes('cometBurst')) features.push('💥');
    if (settings.specialFeatures.includes('blackHoles')) features.push('🕳️');
    
    return features.join(' ');
}

// Обновляем функцию updateLevelButtons
function updateLevelButtons() {
    const levelButtons = document.querySelectorAll('.level-button');
    levelButtons.forEach((button, index) => {
        const level = index + 1;
        if (gameState.unlockedLevels.includes(level)) {
            button.classList.remove('locked');
            button.disabled = false;
        } else {
            button.classList.add('locked');
            button.disabled = true;
        }
    });
}

// Инициализация игровых элементов
function initializeGameElements() {
    try {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) throw new Error('Canvas element not found');
        
        ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        menu = document.getElementById('menu');
        achievementsButton = document.getElementById('achievementsButton');
        achievementsPanel = document.getElementById('achievementsPanel');
        achievementsList = document.getElementById('achievementsList');
        closeButton = document.querySelector('.close-button');
        debug = document.getElementById('debug');

        // Устанавливаем размеры canvas
        canvas.width = 800;
        canvas.height = 600;

        // Инициализируем обработчики событий
        initializeEventListeners();

        // Сбрасываем позицию игрока
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - player.height - 10;

        return true;
    } catch (error) {
        console.error('Error initializing game elements:', error);
        if (debug) debug.textContent = `Error: ${error.message}`;
        return false;
    }
}

// Инициализация игры
function initGame() {
    try {
        // Создаем элементы меню, если они не существуют
        if (!document.getElementById('menu')) {
            const menuDiv = document.createElement('div');
            menuDiv.id = 'menu';
            menuDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            `;

            // Добавляем заголовок
            const title = document.createElement('h1');
            title.textContent = 'Star Catcher';
            title.style.cssText = `
                color: #ffd700;
                font-size: 36px;
                margin-bottom: 20px;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            `;
            menuDiv.appendChild(title);

            // Добавляем кнопку "Начать игру"
            const startButton = document.createElement('button');
            startButton.id = 'startButton';
            startButton.textContent = 'Начать игру';
            startButton.style.cssText = `
                margin: 10px;
                padding: 15px 30px;
                background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                color: white;
                border: 2px solid #ffd700;
                border-radius: 5px;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.3s ease;
            `;
            startButton.onmouseover = () => {
                startButton.style.transform = 'scale(1.1)';
                startButton.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
            };
            startButton.onmouseout = () => {
                startButton.style.transform = 'scale(1)';
                startButton.style.boxShadow = 'none';
            };
            menuDiv.appendChild(startButton);

            document.body.appendChild(menuDiv);
            menu = menuDiv;
        } else {
            menu = document.getElementById('menu');
        }

        // Создаем canvas, если он не существует
        if (!document.getElementById('gameCanvas')) {
            canvas = document.createElement('canvas');
            canvas.id = 'gameCanvas';
            canvas.width = 800;
            canvas.height = 600;
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
        } else {
            canvas = document.getElementById('gameCanvas');
        }
        ctx = canvas.getContext('2d');

        // Создаем кнопку достижений, если она не существует
        if (!document.getElementById('achievementsButton')) {
            achievementsButton = document.createElement('button');
            achievementsButton.id = 'achievementsButton';
            achievementsButton.textContent = 'Достижения';
            achievementsButton.style.cssText = `
                margin: 10px;
                padding: 10px 20px;
                background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            `;
            menu.appendChild(achievementsButton);
        } else {
            achievementsButton = document.getElementById('achievementsButton');
        }

        // Создаем панель достижений, если она не существует
        if (!document.getElementById('achievementsPanel')) {
            const panel = document.createElement('div');
            panel.id = 'achievementsPanel';
            panel.className = 'hidden';
            panel.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                padding: 20px;
                border-radius: 10px;
                z-index: 1000;
            `;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-button';
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            `;
            panel.appendChild(closeBtn);
            
            const list = document.createElement('div');
            list.id = 'achievementsList';
            panel.appendChild(list);
            
            document.body.appendChild(panel);
            achievementsPanel = panel;
            achievementsList = list;
            closeButton = closeBtn;
        } else {
            achievementsPanel = document.getElementById('achievementsPanel');
            achievementsList = document.getElementById('achievementsList');
            closeButton = achievementsPanel.querySelector('.close-button');
        }

        // Создаем элемент для отладки
        if (!document.getElementById('debug')) {
            debug = document.createElement('div');
            debug.id = 'debug';
            debug.style.cssText = `
                position: fixed;
                bottom: 10px;
                left: 10px;
                color: white;
                font-family: monospace;
                font-size: 12px;
            `;
            document.body.appendChild(debug);
        } else {
            debug = document.getElementById('debug');
        }

        // Инициализируем обработчики событий
        initializeEventListeners();

        // Сбрасываем позицию игрока
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - player.height - 10;

        // Загружаем сохраненный прогресс
        loadProgress();

        // Показываем меню
        menu.style.display = 'block';
        canvas.style.display = 'none';

        // Запускаем анимацию меню
        requestAnimationFrame(menuLoop);

        console.log('Game initialized successfully');
        debug.textContent = 'Game initialized successfully';
        
        // Инициализируем звуки
        initializeSounds();
        
        return true;
    } catch (error) {
        console.error('Error initializing game:', error);
        if (debug) debug.textContent = `Initialization error: ${error.message}`;
        return false;
    }
}

// Load progress from localStorage
function loadProgress() {
    try {
        const savedLevels = localStorage.getItem('unlockedLevels');
        if (savedLevels) {
            gameState.unlockedLevels = JSON.parse(savedLevels);
        }
        const savedAchievements = localStorage.getItem('achievements');
        if (savedAchievements) {
            Object.assign(achievements, JSON.parse(savedAchievements));
        }
        updateAchievementsDisplay();
        console.log('Progress loaded successfully');
    } catch (error) {
        console.error('Error loading progress:', error);
        if (debug) debug.textContent = `Error loading progress: ${error.message}`;
    }
}

// Обновляем функцию сохранения прогресса
function saveProgress() {
    try {
        localStorage.setItem('unlockedLevels', JSON.stringify(gameState.unlockedLevels));
        localStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// Модифицируем функцию unlockAchievement для работы с Яндекс.Играми
function unlockAchievement(id) {
    if (achievements[id] && !achievements[id].unlocked) {
        achievements[id].unlocked = true;
        showAchievementNotification(achievements[id]);
        
        // Отправляем информацию о достижении в Яндекс.Игры
        if (ysdk) {
            ysdk.getPlayer()
                .then(player => {
                    player.setStats({
                        [id]: 1
                    });
                })
                .catch(console.error);
        }
        
        saveProgress();
    }
}

// Обновление отображения достижений
function updateAchievementsDisplay() {
    achievementsList.innerHTML = '';
    Object.values(achievements).forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${achievement.unlocked ? '' : 'locked'}`;
        
        let progressHtml = '';
        if (achievement.progress !== undefined) {
            const progress = Math.min(achievement.progress, achievement.target);
            const percentage = (progress / achievement.target) * 100;
            progressHtml = `
                <div style="margin-top: 5px;">
                    <div style="background: #333; height: 4px; border-radius: 2px;">
                        <div style="background: #ffd700; width: ${percentage}%; height: 100%; border-radius: 2px;"></div>
                    </div>
                    <div style="font-size: 12px; color: #ccc; margin-top: 2px;">
                        ${progress}/${achievement.target}
                    </div>
                </div>
            `;
        }
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${progressHtml}
            </div>
        `;
        
        achievementsList.appendChild(achievementElement);
    });
}

// Установка уровня
function setLevel(level) {
    try {
        // Очищаем массивы объектов
        stars = [];
        comets = [];
        
        // Настройки для каждого уровня
        const levelSettings = {
            1: {
                starCount: 5,
                starSpeed: 2,
                cometCount: 0,
                starsToNextLevel: 10,
                playerSpeed: 5,
                cometSpeed: 0,
                specialFeatures: []
            },
            2: {
                starCount: 8,
                starSpeed: 3,
                cometCount: 2,
                starsToNextLevel: 15,
                playerSpeed: 5,
                cometSpeed: 3,
                specialFeatures: ['comets']
            },
            3: {
                starCount: 10,
                starSpeed: 3.5,
                cometCount: 3,
                starsToNextLevel: 20,
                playerSpeed: 6,
                cometSpeed: 4,
                specialFeatures: ['comets', 'movingStars']
            },
            4: {
                starCount: 12,
                starSpeed: 4,
                cometCount: 4,
                starsToNextLevel: 25,
                playerSpeed: 6,
                cometSpeed: 5,
                specialFeatures: ['comets', 'movingStars', 'shrinkingStars']
            },
            5: {
                starCount: 15,
                starSpeed: 4.5,
                cometCount: 5,
                starsToNextLevel: 30,
                playerSpeed: 7,
                cometSpeed: 6,
                specialFeatures: ['comets', 'movingStars', 'shrinkingStars', 'cometBurst']
            },
            6: {
                starCount: 18,
                starSpeed: 5,
                cometCount: 6,
                starsToNextLevel: 35,
                playerSpeed: 7,
                cometSpeed: 7,
                specialFeatures: ['comets', 'movingStars', 'shrinkingStars', 'cometBurst', 'blackHoles']
            }
        };
        
        // Получаем настройки для текущего уровня или используем настройки первого уровня по умолчанию
        const settings = levelSettings[level] || levelSettings[1];
        
        // Применяем настройки уровня
        gameState.level = level;
        gameState.starsCaught = 0;
        gameState.starsToNextLevel = settings.starsToNextLevel;
        gameState.maxStars = settings.starCount;
        gameState.starSpeed = settings.starSpeed;
        gameState.starSpawnRate = Math.max(60 - (level - 1) * 5, 30);
        player.speed = settings.playerSpeed;
        
        // Создаем начальные звезды
        for (let i = 0; i < Math.min(3, settings.starCount); i++) {
            createStar();
        }
        
        // Создаем кометы
        if (settings.cometCount > 0) {
            for (let i = 0; i < settings.cometCount; i++) {
                comets.push(new Comet(settings.cometSpeed));
            }
        }

        // Добавляем особые механики уровня
        if (settings.specialFeatures.includes('movingStars')) {
            gameState.movingStars = true;
        }
        if (settings.specialFeatures.includes('shrinkingStars')) {
            gameState.shrinkingStars = true;
        }
        if (settings.specialFeatures.includes('cometBurst')) {
            gameState.cometBurst = true;
        }
        if (settings.specialFeatures.includes('blackHoles')) {
            createBlackHoles();
        }
        
        debug.textContent = `Level ${level} initialized with ${settings.starCount} stars and ${settings.cometCount} comets`;
    } catch (error) {
        console.error('Error setting level:', error);
        debug.textContent = `Error setting level: ${error.message}`;
    }
}

// Обработчики кнопок меню
function startGame(level) {
    try {
        debug.textContent = `Starting game at level ${level}...`;
        
        // Проверяем, разблокирован ли уровень
        if (!gameState.unlockedLevels.includes(level)) {
            debug.textContent = `Level ${level} is locked!`;
            return;
        }
        
        // Устанавливаем состояние игры
        gameState.level = level;
        gameState.isPlaying = true;
        
        // Скрываем меню и показываем canvas
        if (menu) menu.style.display = 'none';
        if (canvas) {
            canvas.style.display = 'block';
            // Убеждаемся, что размеры canvas установлены
            canvas.width = 800;
            canvas.height = 600;
        }
        
        // Сброс состояния игры
        player.score = 0;
        player.health = 100;
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 60;
        stars = [];
        comets = [];
        particles = [];
        frameCount = 0;
        damageFlashAlpha = 0;
        screenShakeAmount = 0;
        
        // Настройка уровня
        setLevel(level);
        
        // Остановка предыдущего игрового цикла
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        // Запуск нового игрового цикла
        gameLoopId = requestAnimationFrame(gameLoop);
        
        debug.textContent = `Game started at level ${level}`;
    } catch (error) {
        console.error('Error starting game:', error);
        debug.textContent = `Error starting game: ${error.message}`;
        // Возвращаемся в меню в случае ошибки
        returnToMenu();
    }
}

// Возврат в меню
function returnToMenu() {
    try {
        // Останавливаем игровой цикл
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        // Сбрасываем состояние игры
        gameState.isPlaying = false;
        
        // Показываем меню и скрываем canvas
        if (menu) menu.style.display = 'block';
        if (canvas) canvas.style.display = 'none';
        
        // Обновляем отображение разблокированных уровней
        updateLevelButtons();
        
        debug.textContent = 'Returned to menu';
    } catch (error) {
        console.error('Error returning to menu:', error);
        debug.textContent = `Error returning to menu: ${error.message}`;
    }
}

// Создание новой звезды
function createStar() {
    if (stars.length < gameState.maxStars) {
        const size = gameState.shrinkingStars ? Math.random() * 20 + 20 : 40; // Случайный размер для shrinkingStars
        const star = {
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed: gameState.starSpeed,
            angle: 0,
            movePattern: gameState.movingStars ? Math.floor(Math.random() * 3) : -1 // Случайный паттерн движения
        };

        if (gameState.movingStars) {
            star.originalX = star.x;
            star.amplitude = Math.random() * 100 + 50; // Амплитуда движения
            star.frequency = Math.random() * 0.02 + 0.01; // Частота движения
        }

        stars.push(star);
    }
}

// Функция для применения урона
function applyDamage(amount) {
    // Игнорируем урон при активном щите
    if (powerUps.shield.active) {
        createShieldEffect();
        return;
    }
    
    player.health -= amount;
    damageFlashAlpha = 0.5;
    screenShakeAmount = 10;
    lastDamageTime = Date.now();

    // Создаем частицы крови
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const particle = new Particle(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#ff0000'
        );
        particle.speedX = Math.cos(angle) * speed;
        particle.speedY = Math.sin(angle) * speed;
        particle.life = 1;
        particles.push(particle);
    }

    // Добавляем звуковой эффект (вибрация)
    if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
    }
}

// Обновляем функцию draw для добавления эффектов
function draw() {
    if (!gameState.isPlaying) return;

    ctx.save();

    // Применяем тряску экрана
    if (screenShakeAmount > 0) {
        const shakeX = Math.random() * screenShakeAmount - screenShakeAmount / 2;
        const shakeY = Math.random() * screenShakeAmount - screenShakeAmount / 2;
        ctx.translate(shakeX, shakeY);
        screenShakeAmount *= 0.9;
        if (screenShakeAmount < 0.5) screenShakeAmount = 0;
    }

    // Очищаем canvas с градиентным фоном
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000066');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем звезды фона (декоративные)
    drawBackgroundStars();

    // Отрисовка звёзд с эффектом свечения
    stars.forEach(star => {
        drawStar(star);
    });

    // Отрисовка комет с улучшенным эффектом
    comets.forEach(comet => {
        drawCometWithTrail(comet);
    });

    // Отрисовка игрока с эффектом свечения
    drawPlayerWithEffects();

    // Отрисовка частиц
    drawParticles();

    // Эффект красной вспышки при уроне
    if (damageFlashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${damageFlashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        damageFlashAlpha *= 0.9;
    }

    // Отрисовка UI с современным дизайном
    drawModernUI();

    // Отрисовка черных дыр
    if (window.blackHoles) {
        window.blackHoles.forEach(hole => {
            ctx.save();
            
            // Создаем градиент для черной дыры
            const gradient = ctx.createRadialGradient(
                hole.x, hole.y, 0,
                hole.x, hole.y, hole.radius * 3
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.3, 'rgba(75, 0, 130, 0.7)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Добавляем эффект свечения
            ctx.shadowColor = '#4B0082';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }

    ctx.restore();
}

// Добавляем фоновые звезды
function drawBackgroundStars() {
    if (!window.backgroundStars) {
        window.backgroundStars = Array.from({length: 100}, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            alpha: Math.random()
        }));
    }

    window.backgroundStars.forEach(star => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Мерцание
        star.alpha = Math.sin(Date.now() / 1000 + star.x) * 0.5 + 0.5;
    });
}

// Улучшенная отрисовка звезды
function drawStar(star) {
    ctx.save();
    
    // Добавляем свечение
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    
    // Рисуем звезду
    ctx.translate(star.x + star.width / 2, star.y + star.height / 2);
    ctx.rotate(Date.now() / 1000);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, star.width / 2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#ffff00');
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    
    ctx.fillStyle = gradient;
    
    // Рисуем пятиконечную звезду
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5;
        const x = Math.cos(angle) * star.width / 2;
        const y = Math.sin(angle) * star.height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Улучшенная отрисовка кометы
function drawCometWithTrail(comet) {
    ctx.save();
    
    // Рисуем след кометы
    const gradient = ctx.createLinearGradient(
        comet.x, comet.y - 50,
        comet.x, comet.y + comet.height
    );
    gradient.addColorStop(0, 'rgba(255, 68, 68, 0)');
    gradient.addColorStop(1, 'rgba(255, 68, 68, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(comet.x, comet.y - 50);
    ctx.lineTo(comet.x + comet.width, comet.y - 50);
    ctx.lineTo(comet.x + comet.width, comet.y);
    ctx.lineTo(comet.x, comet.y);
    ctx.closePath();
    ctx.fill();
    
    // Рисуем комету
    ctx.translate(comet.x + comet.width / 2, comet.y + comet.height / 2);
    ctx.rotate(comet.angle);
    
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    
    const cometGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, comet.width);
    cometGradient.addColorStop(0, '#ffffff');
    cometGradient.addColorStop(0.3, '#ff4444');
    cometGradient.addColorStop(1, 'rgba(255, 68, 68, 0)');
    
    ctx.fillStyle = cometGradient;
    ctx.beginPath();
    ctx.moveTo(-comet.width / 2, -comet.height / 2);
    ctx.lineTo(comet.width / 2, -comet.height / 2);
    ctx.lineTo(0, comet.height / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Улучшенная отрисовка игрока
function drawPlayerWithEffects() {
    ctx.save();
    
    // Добавляем свечение
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    
    // Рисуем след движения
    if (keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'] ||
        keys['a'] || keys['d'] || keys['w'] || keys['s']) {
        const trailGradient = ctx.createRadialGradient(
            player.x + player.width / 2,
            player.y + player.height / 2,
            0,
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width
        );
        trailGradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
        trailGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // Рисуем игрока
    const playerGradient = ctx.createRadialGradient(
        player.x + player.width / 2,
        player.y + player.height / 2,
        0,
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2
    );
    playerGradient.addColorStop(0, '#ffffff');
    playerGradient.addColorStop(0.5, '#00ff00');
    playerGradient.addColorStop(1, '#003300');
    
    ctx.fillStyle = playerGradient;
    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.restore();
}

// Современный UI
function drawModernUI() {
    // Полупрозрачная панель сверху
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, 60);
    
    // Счет с анимацией
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Счёт: ${player.score}`, 20, 40);
    
    // Уровень
    ctx.textAlign = 'center';
    ctx.fillText(`Уровень ${gameState.level}`, canvas.width / 2, 40);
    
    // Прогресс уровня
    const progressWidth = 200;
    const progressHeight = 10;
    const progressX = canvas.width - progressWidth - 20;
    const progressY = 25;
    
    // Фон прогресс-бара
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressWidth, progressHeight, 5);
    ctx.fill();
    
    // Заполнение прогресс-бара
    const progress = Math.min(gameState.starsCaught / gameState.starsToNextLevel, 1);
    const gradient = ctx.createLinearGradient(progressX, 0, progressX + progressWidth, 0);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(1, '#ffff00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressWidth * progress, progressHeight, 5);
    ctx.fill();
    
    // Текст прогресса
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(
        `${gameState.starsCaught}/${gameState.starsToNextLevel} звёзд`,
        canvas.width - 20,
        55
    );
    
    // Полоска здоровья
    const healthWidth = 150;
    const healthHeight = 8;
    const healthX = 20;
    const healthY = 55;
    
    // Фон полоски здоровья
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(healthX, healthY, healthWidth, healthHeight, 4);
    ctx.fill();
    
    // Заполнение полоски здоровья
    const healthGradient = ctx.createLinearGradient(healthX, 0, healthX + healthWidth, 0);
    healthGradient.addColorStop(0, '#ff0000');
    healthGradient.addColorStop(0.5, '#ff6600');
    healthGradient.addColorStop(1, '#00ff00');
    
    ctx.fillStyle = healthGradient;
    ctx.beginPath();
    ctx.roundRect(healthX, healthY, healthWidth * (player.health / 100), healthHeight, 4);
    ctx.fill();

    // Отрисовка активных бонусов
    const activePowerUps = Object.entries(powerUps)
        .filter(([, powerUp]) => powerUp.active);

    if (activePowerUps.length > 0) {
        const startX = 10;
        const startY = 100;
        
        activePowerUps.forEach(([name, powerUp], index) => {
            // Фон иконки
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.roundRect(startX, startY + index * 40, 35, 35, 5);
            ctx.fill();
            
            // Иконка
            ctx.font = '20px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(powerUp.icon, startX + 8, startY + index * 40 + 25);
            
            // Полоска времени
            const timeWidth = 30;
            const timeHeight = 3;
            const timeProgress = powerUp.duration / powerUp.maxDuration;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(startX + 2, startY + index * 40 + 32, timeWidth, timeHeight);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(startX + 2, startY + index * 40 + 32, timeWidth * timeProgress, timeHeight);
        });
    }

    // Отрисовка индикатора бонусного уровня
    if (bonusLevel.active) {
        const bonusWidth = 200;
        const bonusHeight = 10;
        const bonusX = (canvas.width - bonusWidth) / 2;
        const bonusY = 70;
        
        // Фон
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(bonusX, bonusY, bonusWidth, bonusHeight, 5);
        ctx.fill();
        
        // Прогресс
        const bonusProgress = bonusLevel.duration / bonusLevel.maxDuration;
        const gradient = ctx.createLinearGradient(bonusX, 0, bonusX + bonusWidth, 0);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(1, '#ffa500');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(bonusX, bonusY, bonusWidth * bonusProgress, bonusHeight, 5);
        ctx.fill();
        
        // Текст
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('БОНУСНЫЙ УРОВЕНЬ!', canvas.width / 2, bonusY - 5);
    }
}

// Обновляем обработку столкновения с кометой
function checkCollision(player, object) {
    const playerHitbox = {
        x: player.x + player.width * 0.2,
        y: player.y + player.height * 0.2,
        width: player.width * 0.6,
        height: player.height * 0.6
    };

    const objectHitbox = {
        x: object.x + object.width * 0.2,
        y: object.y + object.height * 0.2,
        width: object.width * 0.6,
        height: object.height * 0.6
    };

    return playerHitbox.x < objectHitbox.x + objectHitbox.width &&
           playerHitbox.x + playerHitbox.width > objectHitbox.x &&
           playerHitbox.y < objectHitbox.y + objectHitbox.height &&
           playerHitbox.y + playerHitbox.height > objectHitbox.y;
}

// Переход на следующий уровень
function nextLevel() {
    try {
        // Останавливаем текущий игровой цикл
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }

        gameState.level++;
        gameState.starsCaught = 0;
        gameState.starsToNextLevel = Math.floor(gameState.starsToNextLevel * 1.2);
        gameState.maxStars = Math.min(gameState.maxStars + 1, 15);
        gameState.starSpeed = Math.min(gameState.starSpeed + 0.2, 5);
        gameState.starSpawnRate = Math.max(gameState.starSpawnRate - 3, 20);
        
        // Очищаем массив звезд
        stars = [];
        
        // Показываем сообщение о новом уровне
        showLevelUpMessage();
        
        // Проверяем достижения
        checkAchievements();
        
        // Обновляем отладочную информацию
        debug.textContent = `Level ${gameState.level} started`;
        
        // Запускаем новый игровой цикл после показа сообщения
        setTimeout(() => {
            if (gameState.isPlaying) {
                gameLoopId = requestAnimationFrame(gameLoop);
            }
        }, 2000);
    } catch (error) {
        console.error('Error in nextLevel:', error);
        debug.textContent = `Level transition error: ${error.message}`;
        // Пытаемся восстановить игровой цикл
        if (gameState.isPlaying && !gameLoopId) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }
}

// Показ сообщения о новом уровне
function showLevelUpMessage() {
    try {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = `Уровень ${gameState.level}!`;
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        // Создаем частицы для эффекта
        createParticles(x, y, '#ffffff', 50);
        
        ctx.fillText(text, x, y);
    } catch (error) {
        console.error('Error in showLevelUpMessage:', error);
        debug.textContent = `Level message error: ${error.message}`;
    }
}

// Создание фоновых частиц
function createBackgroundParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(particle);
    }
}

// Отрисовка игрока
function drawPlayer() {
    ctx.save();
    
    // Добавляем свечение
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    
    // Рисуем треугольник
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const size = player.width * 0.8; // Немного уменьшаем размер треугольника

    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(centerX, player.y + size * 0.2); // Вершина
    ctx.lineTo(centerX + size / 2, player.y + size); // Правый нижний угол
    ctx.lineTo(centerX - size / 2, player.y + size); // Левый нижний угол
    ctx.closePath();
    ctx.fill();

    // Добавляем обводку
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();

    // Отрисовка хитбокса в режиме отладки
    if (debug.textContent.includes('debug')) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.strokeRect(
            player.x + player.width * 0.2,
            player.y + player.height * 0.2,
            player.width * 0.6,
            player.height * 0.6
        );
    }
}

// Обновление состояния игры
function update() {
    if (!gameState.isPlaying) return;

    // Движение игрока
    if ((keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['ф'] || keys['Ф']) && player.x > -player.width * 0.3) {
        player.x -= player.speed;
    }
    if ((keys['ArrowRight'] || keys['d'] || keys['D'] || keys['в'] || keys['В']) && player.x < canvas.width - player.width * 0.7) {
        player.x += player.speed;
    }
    if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys['ц'] || keys['Ц']) && player.y > 0) {
        player.y -= player.speed;
    }
    if ((keys['ArrowDown'] || keys['s'] || keys['S'] || keys['ы'] || keys['Ы']) && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Создание звёзд
    frameCount++;
    if (frameCount >= gameState.starSpawnRate) {
        createStar();
        frameCount = 0;
        
        // Создаем бонус с небольшой вероятностью
        if (Math.random() < 0.1) {
            activePowerUps.push(createPowerUp());
        }
    }

    // Обновление бонусов
    for (let i = activePowerUps.length - 1; i >= 0; i--) {
        const powerUp = activePowerUps[i];
        powerUp.y += powerUp.speed;
        
        // Проверяем столкновение с игроком
        if (checkCollision(player, powerUp)) {
            const powerUpInfo = powerUps[powerUp.type];
            powerUpInfo.active = true;
            powerUpInfo.duration = powerUpInfo.maxDuration;
            
            // Создаем эффект при подборе бонуса
            createParticles(
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2,
                powerUpInfo.color,
                20
            );
            
            // Воспроизводим звук
            playSound('powerUp');
            
            activePowerUps.splice(i, 1);
            continue;
        }
        
        // Удаляем бонусы, вышедшие за пределы экрана
        if (powerUp.y > canvas.height) {
            activePowerUps.splice(i, 1);
        }
    }

    // Обновление звезд с учетом новых механик
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        
        // Применяем эффект заморозки времени
        if (powerUps.timeFreeze.active) {
            star.y += star.speed * 0.3;
        } else {
            star.y += star.speed;
        }

        // Обработка движущихся звезд
        if (gameState.movingStars && star.movePattern !== -1) {
            switch (star.movePattern) {
                case 0:
                    star.x = star.originalX + Math.sin(star.y * star.frequency) * star.amplitude;
                    break;
                case 1:
                    star.x += Math.sin(star.y / 30) * 2;
                    break;
                case 2:
                    star.angle += 0.02;
                    star.x = star.originalX + Math.cos(star.angle) * 50;
                    break;
            }
        }

        // Проверка столкновения с игроком
        if (checkCollision(player, star)) {
            // Проверяем множитель очков
            let points = 10;
            if (powerUps.multiplier.active) {
                points *= powerUps.multiplier.value;
            }
            
            player.score += points;
            gameState.starsCaught++;
            
            // Создаем эффект при сборе звезды
            createParticles(
                star.x + star.width / 2,
                star.y + star.height / 2,
                '#ffff00',
                15
            );
            
            // Воспроизводим звук
            playSound('starCollect');
            
            stars.splice(i, 1);
            
            // Проверяем достижения
            checkAchievements();
            
            // Проверяем завершение уровня
            if (gameState.starsCaught >= gameState.starsToNextLevel) {
                completeLevel();
                return;
            }
            continue;
        }

        // Удаление звезд, вышедших за пределы экрана
        if (star.y > canvas.height) {
            stars.splice(i, 1);
            gameState.missedStars++;
            gameState.consecutiveCatches = 0;
        }
    }

    // Обновление комет
    for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        
        // Применяем эффект заморозки времени
        if (powerUps.timeFreeze.active) {
            comet.y += comet.speed * 0.3;
        } else {
            if (comet.update()) {
                comets.splice(i, 1);
                continue;
            }
        }

        // Проверка столкновения с игроком
        if (!powerUps.ghostMode.active && checkCollision(player, comet)) {
            if (!powerUps.shield.active) {
                applyDamage(comet.damage);
                
                // Воспроизводим звук
                playSound('cometHit');
                
                // Создаем эффект при столкновении
                createParticles(
                    comet.x + comet.width / 2,
                    comet.y + comet.height / 2,
                    '#ff4444',
                    20
                );
            }
            comets.splice(i, 1);

            // Проверка на проигрыш
            if (player.health <= 0) {
                gameOver();
                return;
            }
        }
    }

    // Обновление бонусов
    Object.values(powerUps).forEach(powerUp => {
        if (powerUp.active) {
            powerUp.duration--;
            if (powerUp.duration <= 0) {
                powerUp.active = false;
            }
        }
    });

    // Обновление частиц
    updateParticles();
}

// Игровой цикл
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    try {
        // Обновление игровой логики
        update();
        
        // Обновление игровых механик
        updateGameMechanics();
        
        // Очистка canvas с градиентным фоном
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000066');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем фоновые звезды
        drawBackgroundStars();
        
        // Рисуем игровые эффекты
        drawGameEffects();
        
        // Отрисовка звёзд с эффектами
        stars.forEach(star => {
            applyMotionBlur(star);
            drawStar(star);
            createGlow(star.x + star.width/2, star.y + star.height/2, 
                      visualEffects.glow.color, visualEffects.glow.size);
        });
        
        // Отрисовка комет с эффектами
        comets.forEach(comet => {
            applyMotionBlur(comet);
            drawCometWithTrail(comet);
        });
        
        // Отрисовка игрока с эффектами
        drawPlayerWithEffects();
        
        // Отрисовка бонусов с эффектами
        activePowerUps.forEach(powerUp => {
            ctx.save();
            const powerUpInfo = powerUps[powerUp.type];
            ctx.fillStyle = powerUpInfo.color;
            ctx.beginPath();
            ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, 
                   powerUp.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Добавляем свечение
            createGlow(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, 
                      powerUpInfo.color, powerUp.width);
            
            // Добавляем иконку
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(powerUpInfo.icon, 
                        powerUp.x + powerUp.width/2, 
                        powerUp.y + powerUp.height/2);
            ctx.restore();
        });
        
        // Отрисовка частиц
        drawParticles();
        
        // Отрисовка UI
        drawModernUI();
        
        // Эффект красной вспышки при уроне
        if (damageFlashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${damageFlashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            damageFlashAlpha *= 0.9;
        }
        
        // Продолжаем игровой цикл
        gameLoopId = requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Error in gameLoop:', error);
        debug.textContent = `Game loop error: ${error.message}`;
        // Пытаемся восстановить игровой цикл
        if (gameState.isPlaying && !gameLoopId) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }
}

// Menu animation loop
function menuLoop() {
    if (!gameState.isPlaying) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        updateParticles();
        drawParticles();
        
        // Continue animation
        requestAnimationFrame(menuLoop);
    }
}

// Разблокировка следующего уровня
function unlockNextLevel() {
    const nextLevel = gameState.level + 1;
    if (nextLevel <= 3 && !gameState.unlockedLevels.includes(nextLevel)) {
        gameState.unlockedLevels.push(nextLevel);
        // Сохраняем прогресс в localStorage
        localStorage.setItem('unlockedLevels', JSON.stringify(gameState.unlockedLevels));
        
        // Показываем уведомление о разблокировке
        showLevelUnlockNotification(nextLevel);
    }
}

// Показ уведомления о разблокировке уровня
function showLevelUnlockNotification(level) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 5px;
        font-size: 18px;
        text-align: center;
        animation: slideDown 0.5s ease-out;
        z-index: 1000;
    `;
    
    notification.innerHTML = `Уровень ${level} разблокирован!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.5s ease-in';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Завершение уровня
function completeLevel() {
    try {
        // Останавливаем текущий уровень
        gameState.isPlaying = false;
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        // Показываем сообщение о завершении уровня
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(`Уровень ${gameState.level} пройден!`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText(`Собрано звёзд: ${gameState.starsToNextLevel}`, canvas.width / 2, canvas.height / 2 + 10);
        
        // Разблокируем следующий уровень
        const nextLevelNumber = gameState.level + 1;
        if (nextLevelNumber <= 3 && !gameState.unlockedLevels.includes(nextLevelNumber)) {
            gameState.unlockedLevels.push(nextLevelNumber);
            localStorage.setItem('unlockedLevels', JSON.stringify(gameState.unlockedLevels));
            showLevelUnlockNotification(nextLevelNumber);
        }
        
        // Сохраняем прогресс
        saveProgress();
        
        // Создаем эффект празднования
        createVictoryParticles();
        
        // Автоматически возвращаемся в меню через 3 секунды
        setTimeout(() => {
            // Сбрасываем количество собранных звезд
            gameState.starsCaught = 0;
            returnToMenu();
            updateLevelButtons();
        }, 3000);
        
        debug.textContent = `Level ${gameState.level} completed`;
    } catch (error) {
        console.error('Error completing level:', error);
        debug.textContent = `Error completing level: ${error.message}`;
        returnToMenu();
    }
}

// Добавляем эффект празднования победы
function createVictoryParticles() {
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#4169E1'];
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        createParticles(x, y, color, 5);
    }
}

// Добавляем функцию окончания игры
function gameOver() {
    gameState.isPlaying = false;
    
    // Показываем сообщение о проигрыше
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('Игра окончена!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Финальный счёт: ${player.score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Нажмите ПРОБЕЛ для возврата в меню', canvas.width / 2, canvas.height / 2 + 50);
    
    // Добавляем обработчик для пробела
    const handleSpacebar = (e) => {
        if (e.code === 'Space') {
            document.removeEventListener('keydown', handleSpacebar);
            returnToMenu();
            updateLevelButtons();
        }
    };
    document.addEventListener('keydown', handleSpacebar);
}

// Обновляем класс кометы
class Comet {
    constructor(speed) {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = speed || gameState.starSpeed * 1.5;
        this.damage = 20;
        this.angle = 0;
        this.rotationSpeed = Math.random() * 0.1 - 0.05;
        this.burstMode = gameState.cometBurst && Math.random() < 0.3;
    }

    update() {
        this.y += this.speed;
        this.angle += this.rotationSpeed;

        if (this.burstMode) {
            this.x += Math.sin(this.y / 30) * 3; // Волнообразное движение для комет в режиме burst
        }

        return this.y > canvas.height;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        
        // Рисуем комету
        ctx.beginPath();
        ctx.fillStyle = '#ff4444';
        ctx.moveTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(this.width / 2, -this.height / 2);
        ctx.lineTo(0, this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Добавляем свечение
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#ff8888';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

// Загрузка данных о ежедневных наградах
function loadDailyRewards() {
    const savedRewards = localStorage.getItem('dailyRewards');
    if (savedRewards) {
        Object.assign(dailyRewards, JSON.parse(savedRewards));
    }
}

// Сохранение данных о ежедневных наградах
function saveDailyRewards() {
    localStorage.setItem('dailyRewards', JSON.stringify(dailyRewards));
}

// Проверка доступности ежедневной награды
function checkDailyReward() {
    const today = new Date().toDateString();
    if (dailyRewards.lastClaimDate !== today) {
        showDailyRewardPopup();
    }
}

// Показ всплывающего окна с ежедневной наградой
function showDailyRewardPopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #ffff00;
        border-radius: 10px;
        padding: 20px;
        color: white;
        text-align: center;
        z-index: 1000;
    `;

    const reward = dailyRewards.rewards[dailyRewards.currentStreak];
    popup.innerHTML = `
        <h2>Ежедневная награда!</h2>
        <p>День ${dailyRewards.currentStreak + 1} из ${dailyRewards.maxStreak}</p>
        <p>Награда:</p>
        <p>🌟 ${reward.stars} звёзд</p>
        <p>${reward.powerUps.map(p => powerUps[p].icon).join(' ')}</p>
        <button id="claimReward" style="
            background: #ffff00;
            color: black;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        ">Получить награду</button>
    `;

    document.body.appendChild(popup);

    document.getElementById('claimReward').onclick = () => {
        claimDailyReward();
        document.body.removeChild(popup);
    };
}

// Получение ежедневной награды
function claimDailyReward() {
    const reward = dailyRewards.rewards[dailyRewards.currentStreak];
    player.score += reward.stars;
    
    reward.powerUps.forEach(powerUpName => {
        powerUps[powerUpName].active = true;
        powerUps[powerUpName].duration = powerUps[powerUpName].maxDuration;
    });

    dailyRewards.lastClaimDate = new Date().toDateString();
    dailyRewards.currentStreak = (dailyRewards.currentStreak + 1) % dailyRewards.maxStreak;
    saveDailyRewards();
}

// Обновление бонусов
function updatePowerUps() {
    Object.keys(powerUps).forEach(powerUpName => {
        const powerUp = powerUps[powerUpName];
        if (powerUp.active) {
            powerUp.duration--;
            if (powerUp.duration <= 0) {
                powerUp.active = false;
            }
        }
    });

    // Применение эффекта магнита
    if (powerUps.magnet.active) {
        stars.forEach(star => {
            const dx = player.x + player.width / 2 - (star.x + star.width / 2);
            const dy = player.y + player.height / 2 - (star.y + star.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                const speed = 5;
                star.x += (dx / distance) * speed;
                star.y += (dy / distance) * speed;
            }
        });
    }
}

// Запуск бонусного уровня
function startBonusLevel() {
    bonusLevel.active = true;
    bonusLevel.duration = bonusLevel.maxDuration;
    
    // Создаем дополнительные звезды
    for (let i = 0; i < 20; i++) {
        createStar();
    }
    
    // Показываем сообщение
    showMessage('Бонусный уровень!', '#ffff00');
}

// Обновление бонусного уровня
function updateBonusLevel() {
    bonusLevel.duration--;
    
    if (bonusLevel.duration <= 0) {
        bonusLevel.active = false;
        return;
    }
    
    // Создаем больше звезд
    if (frameCount % 30 === 0) {
        createStar();
    }
}

// Обновляем функцию подсчета очков
function addScore(basePoints) {
    let points = basePoints;
    
    // Применяем множитель очков
    if (powerUps.multiplier.active) {
        points *= powerUps.multiplier.value;
    }
    
    // Применяем множитель бонусного уровня
    if (bonusLevel.active) {
        points *= bonusLevel.scoreMultiplier;
    }
    
    player.score += points;
}

// Эффект щита
function createShieldEffect() {
    const shieldParticles = 20;
    for (let i = 0; i < shieldParticles; i++) {
        const angle = (i / shieldParticles) * Math.PI * 2;
        const x = player.x + player.width / 2 + Math.cos(angle) * player.width;
        const y = player.y + player.height / 2 + Math.sin(angle) * player.height;
        createParticles(x, y, '#00ffff', 1);
    }
}

// Функция показа сообщений
function showMessage(text, color = '#ffffff', duration = 2000) {
    const message = {
        text,
        color,
        alpha: 1,
        y: canvas.height / 2
    };
    
    const fadeOut = setInterval(() => {
        message.alpha -= 0.02;
        message.y -= 0.5;
        
        if (message.alpha <= 0) {
            clearInterval(fadeOut);
        }
    }, 20);
    
    const draw = () => {
        if (message.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = message.alpha;
        ctx.fillStyle = color;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, message.y);
        ctx.restore();
        
        requestAnimationFrame(draw);
    };
    
    draw();
}

// Добавляем функцию проверки достижений
function checkAchievements() {
    try {
        // Проверяем достижение "Первая звезда"
        if (!achievements.firstStar.unlocked && gameState.starsCaught > 0) {
            unlockAchievement('firstStar');
        }

        // Проверяем достижение "Собиратель звёзд"
        if (!achievements.starCollector.unlocked) {
            achievements.starCollector.progress = player.score / 10;
            if (achievements.starCollector.progress >= achievements.starCollector.target) {
                unlockAchievement('starCollector');
            }
        }

        // Проверяем достижение "Спидстер"
        if (!achievements.speedster.unlocked && gameState.level >= 5) {
            unlockAchievement('speedster');
        }

        // Проверяем достижение "Мастер"
        if (!achievements.master.unlocked && player.score >= 1000) {
            unlockAchievement('master');
        }

        // Проверяем достижение "Идеальный улов"
        if (!achievements.perfect.unlocked) {
            if (gameState.missedStars === 0) {
                achievements.perfect.progress++;
                if (achievements.perfect.progress >= achievements.perfect.target) {
                    unlockAchievement('perfect');
                }
            } else {
                achievements.perfect.progress = 0;
            }
        }

        // Проверяем достижение "Уклонение от комет"
        if (!achievements.cometDodger.unlocked && gameState.level === 2 && player.health === 100) {
            unlockAchievement('cometDodger');
        }

        // Проверяем достижение "Преследователь звёзд"
        if (!achievements.starChaser.unlocked && gameState.level === 3) {
            if (gameState.movingStars) {
                achievements.starChaser.progress++;
                if (achievements.starChaser.progress >= achievements.starChaser.target) {
                    unlockAchievement('starChaser');
                }
            }
        }

        // Проверяем достижение "Быстрые пальцы"
        if (!achievements.quickFinger.unlocked && gameState.level === 4) {
            if (gameState.shrinkingStars) {
                achievements.quickFinger.progress++;
                if (achievements.quickFinger.progress >= achievements.quickFinger.target) {
                    unlockAchievement('quickFinger');
                }
            }
        }

        // Проверяем достижение "Повелитель комет"
        if (!achievements.cometMaster.unlocked && gameState.level === 5) {
            if (gameState.cometBurst) {
                achievements.cometMaster.progress++;
                if (achievements.cometMaster.progress >= achievements.cometMaster.target) {
                    unlockAchievement('cometMaster');
                }
            }
        }

        // Проверяем достижение "Выживший в черной дыре"
        if (!achievements.blackHoleSurvivor.unlocked && gameState.level === 6) {
            if (gameState.starsCaught >= gameState.starsToNextLevel) {
                unlockAchievement('blackHoleSurvivor');
            }
        }

        // Сохраняем прогресс достижений
        saveProgress();
    } catch (error) {
        console.error('Error checking achievements:', error);
        debug.textContent = `Achievement check error: ${error.message}`;
    }
}

// Добавляем функцию создания черных дыр
function createBlackHoles() {
    if (!window.blackHoles) {
        window.blackHoles = [];
    }
    
    // Создаем 2 черные дыры
    for (let i = 0; i < 2; i++) {
        window.blackHoles.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 200) + 100,
            radius: 20,
            pullForce: 0.5
        });
    }
}

// Новые механики игры
const gameMechanics = {
    // Портал телепортации
    portal: {
        active: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        radius: 30,
        cooldown: 0,
        maxCooldown: 180,
        color: '#4B0082'
    },
    
    // Временные замедления
    timeWarp: {
        active: false,
        duration: 0,
        maxDuration: 300,
        slowFactor: 0.5
    },
    
    // Отражающие поверхности
    reflectors: [],
    
    // Гравитационные зоны
    gravityWells: []
};

// Визуальные эффекты
const visualEffects = {
    // Эффект размытия движения
    motionBlur: {
        enabled: true,
        strength: 0.2,
        previousPositions: []
    },
    
    // Эффект свечения
    glow: {
        enabled: true,
        color: '#ffff00',
        size: 20
    },
    
    // Эффект частиц
    particles: {
        enabled: true,
        maxParticles: 100,
        list: []
    },
    
    // Эффект искажения пространства
    distortion: {
        enabled: true,
        strength: 5
    }
};

// Функция для создания отражающей поверхности
function createReflector(x, y, width, height, angle) {
    gameMechanics.reflectors.push({
        x, y, width, height, angle,
        active: true
    });
}

// Функция для создания гравитационной зоны
function createGravityWell(x, y, radius, strength) {
    gameMechanics.gravityWells.push({
        x, y, radius, strength,
        active: true
    });
}

// Функция для применения эффекта размытия движения
function applyMotionBlur(object) {
    if (!visualEffects.motionBlur.enabled) return;
    
    const positions = visualEffects.motionBlur.previousPositions;
    positions.push({ x: object.x, y: object.y });
    
    if (positions.length > 5) positions.shift();
    
    ctx.save();
    ctx.globalAlpha = 0.2;
    
    positions.forEach((pos, index) => {
        const alpha = (index + 1) / positions.length * 0.2;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pos.x + object.width / 2, pos.y + object.height / 2, 
                object.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.restore();
}

// Функция для создания эффекта свечения
function createGlow(x, y, color, size) {
    if (!visualEffects.glow.enabled) return;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Функция для создания эффекта искажения
function createDistortion(x, y, strength) {
    if (!visualEffects.distortion.enabled) return;
    
    ctx.save();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, strength * 10);
    gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, strength * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Обновляем функцию update для новых механик
function updateGameMechanics() {
    // Обновление порталов
    if (gameMechanics.portal.active) {
        if (gameMechanics.portal.cooldown > 0) {
            gameMechanics.portal.cooldown--;
        }
        
        // Проверяем коллизии с порталами
        stars.forEach(star => {
            const dist1 = Math.hypot(star.x - gameMechanics.portal.x1, 
                                   star.y - gameMechanics.portal.y1);
            if (dist1 < gameMechanics.portal.radius && gameMechanics.portal.cooldown === 0) {
                star.x = gameMechanics.portal.x2;
                star.y = gameMechanics.portal.y2;
                gameMechanics.portal.cooldown = gameMechanics.portal.maxCooldown;
                createDistortion(star.x, star.y, visualEffects.distortion.strength);
            }
        });
    }
    
    // Обновление временного замедления
    if (gameMechanics.timeWarp.active) {
        stars.forEach(star => {
            star.speed *= gameMechanics.timeWarp.slowFactor;
        });
        comets.forEach(comet => {
            comet.speed *= gameMechanics.timeWarp.slowFactor;
        });
    }
    
    // Обновление гравитационных зон
    gameMechanics.gravityWells.forEach(well => {
        if (!well.active) return;
        
        stars.forEach(star => {
            const dx = well.x - star.x;
            const dy = well.y - star.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < well.radius) {
                const force = (well.radius - dist) * well.strength;
                star.x += (dx / dist) * force;
                star.y += (dy / dist) * force;
                createDistortion(star.x, star.y, force * 0.1);
            }
        });
    });
}

// Обновляем функцию draw для новых визуальных эффектов
function drawGameEffects() {
    // Рисуем порталы
    if (gameMechanics.portal.active) {
        [
            { x: gameMechanics.portal.x1, y: gameMechanics.portal.y1 },
            { x: gameMechanics.portal.x2, y: gameMechanics.portal.y2 }
        ].forEach(portal => {
            createGlow(portal.x, portal.y, gameMechanics.portal.color, 
                      gameMechanics.portal.radius * 1.5);
            
            ctx.save();
            ctx.strokeStyle = gameMechanics.portal.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(portal.x, portal.y, gameMechanics.portal.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
    }
    
    // Рисуем отражающие поверхности
    gameMechanics.reflectors.forEach(reflector => {
        if (!reflector.active) return;
        
        ctx.save();
        ctx.translate(reflector.x, reflector.y);
        ctx.rotate(reflector.angle);
        
        const gradient = ctx.createLinearGradient(0, -reflector.height/2, 
                                                0, reflector.height/2);
        gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-reflector.width/2, -reflector.height/2, 
                    reflector.width, reflector.height);
        ctx.restore();
    });
    
    // Рисуем гравитационные зоны
    gameMechanics.gravityWells.forEach(well => {
        if (!well.active) return;
        
        createGlow(well.x, well.y, '#4B0082', well.radius);
        createDistortion(well.x, well.y, well.strength);
    });
}

// Make initGame available globally
window.initGame = initGame;

// ... existing code ...
function initializeMenu() {
    menu.innerHTML = '';
    
    // Обновляем стили меню
    menu.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        min-width: 400px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    `;
    
    // Заголовок
    const title = document.createElement('h1');
    title.textContent = 'Star Catcher';
    title.style.cssText = `
        color: #ffd700;
        font-size: 36px;
        margin-bottom: 30px;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `;
    menu.appendChild(title);
    
    // Контейнер для кнопок уровней
    const levelsContainer = document.createElement('div');
    levelsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 20px;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    `;
    
    // Создаем кнопки для каждого уровня
    for (let i = 1; i <= 6; i++) {
        const levelButton = document.createElement('button');
        levelButton.className = 'level-button';
        levelButton.dataset.level = i;
        
        // Проверяем, разблокирован ли уровень
        const isUnlocked = gameState.unlockedLevels.includes(i) || i === 1;
        
        levelButton.style.cssText = `
            background: ${isUnlocked ? 'linear-gradient(135deg, #4a90e2, #357abd)' : '#666'};
            border: none;
            border-radius: 10px;
            padding: 15px;
            color: white;
            cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
            overflow: hidden;
        `;
        
        if (isUnlocked) {
            levelButton.addEventListener('mouseover', () => {
                levelButton.style.transform = 'scale(1.05)';
                levelButton.style.boxShadow = '0 0 15px rgba(74, 144, 226, 0.5)';
            });
            
            levelButton.addEventListener('mouseout', () => {
                levelButton.style.transform = 'scale(1)';
                levelButton.style.boxShadow = 'none';
            });
            
            levelButton.addEventListener('click', () => {
                startLevel(i);
            });
        }
        
        // Добавляем содержимое кнопки
        levelButton.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 5px;">Уровень ${i}</div>
            <div style="font-size: 12px; opacity: 0.8;">
                ${isUnlocked ? getLevelDescription(i) : '🔒 Заблокировано'}
            </div>
        `;
        
        levelsContainer.appendChild(levelButton);
    }
    menu.appendChild(levelsContainer);
    
    // Кнопки действий
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    `;
    
    // Кнопка таблицы рекордов
    const leaderboardButton = document.createElement('button');
    leaderboardButton.textContent = '🏆 Рекорды';
    leaderboardButton.style.cssText = buttonStyle;
    leaderboardButton.addEventListener('click', () => {
        leaderboard.show();
    });
    buttonsContainer.appendChild(leaderboardButton);
    
    // Кнопка достижений
    const achievementsButton = document.createElement('button');
    achievementsButton.textContent = '🌟 Достижения';
    achievementsButton.style.cssText = buttonStyle;
    achievementsButton.addEventListener('click', showAchievements);
    buttonsContainer.appendChild(achievementsButton);
    
    menu.appendChild(buttonsContainer);
}

// Стили для кнопок
const buttonStyle = `
    background: linear-gradient(135deg, #4a90e2, #357abd);
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    font-size: 16px;
`;

// Функция для получения описания уровня
function getLevelDescription(level) {
    const descriptions = {
        1: 'Базовый уровень',
        2: 'Появление комет',
        3: 'Движущиеся звёзды',
        4: 'Уменьшающиеся звёзды',
        5: 'Взрывающиеся кометы',
        6: 'Чёрные дыры'
    };
    return descriptions[level] || 'Уровень ' + level;
}

// ... existing code ...