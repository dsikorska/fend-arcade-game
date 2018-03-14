const OFFSCREEN_X = 505;
const OFFSCREEN_Y = 606;
const COLLIDER = 60;
let playerHitbox = new Object();

class Character {
    constructor(posX = 0, posY = 0, speed = 100, sprite) {
        this.posX = posX;
        this.posY = posY;
        this.speed = speed;
        this.sprite = sprite;
    }

    update(dt) {
        this.posX += this.speed * dt;
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.posX, this.posY);
    }
}

class Enemy extends Character {
    constructor(tag, posX, posY, speed, sprite = 'images/enemy-bug.png') {
        super(posX, posY, speed, sprite);
        this.tag = tag;
    }

    update(dt) {
        super.update(dt);
        player.checkCollision(this);
        if (this.posX >= OFFSCREEN_X) {
            this.posX = -100;
        }
    }

    render() {
        super.render();
    }

    static randomSpeed() {
        return Math.round(Math.random() * 100 + Math.random() * 10);
    }

    static generateNewEnemies() {
        allEnemies = [];
        if (ui.level <= 3) {
            for (var i = 0; i < 3; i++) {
                allEnemies.push(new Enemy('enemy', randomPosition()[0], randomPosition()[1], Enemy.randomSpeed()));
            }
        } else {
            for (var i = 0; i < ui.level; i++) {
                allEnemies.push(new Enemy('enemy', randomPosition()[0], randomPosition()[1], Enemy.randomSpeed()));
            };
        }     
    }
}

class Player extends Character {
    static get MOVE_POS_X() {
        return 101;
    }

    static get MOVE_POS_Y() {
        return 83;
    }

    static get SIZE_X() {
        return 50;
    }

    static get SIZE_Y() {
        return 22; // minimum value to correct collision detection
    }

    static get START_X() {
        return 202;
    }

    static get START_Y() {
        return 375;
    }
    constructor(posX = 202, posY = 375, speed, sprite = 'images/char-boy.png') {
        super(posX, posY, speed, sprite);
    }

    update() {
        playerHitbox = { posX: player.posX, posY: player.posY, size_X: Player.SIZE_X, size_Y: Player.SIZE_Y };
    }

    render() {
        super.render();
    }

    handleInput(keyCode) {
        switch (keyCode) {
            case 'left':
                this.posX -= this.posX > 0 ? Player.MOVE_POS_X : 0;
                break;

            case 'right':
                this.posX += this.posX < 404 ? Player.MOVE_POS_X : 0;
                break;

            case 'up':
                this.posY -= Player.MOVE_POS_Y;
                this.win();
                break;

            case 'down':
                this.posY += this.posY < 375 ? Player.MOVE_POS_Y : 0;
                break;
        }
    }

    checkCollision(obj) {
        const objectHitbox = { posX: obj.posX, posY: obj.posY, collider: COLLIDER };

        if (playerHitbox.posX < objectHitbox.posX + objectHitbox.collider &&
            playerHitbox.posX + playerHitbox.size_X > objectHitbox.posX &&
            playerHitbox.posY < objectHitbox.posY + objectHitbox.collider &&
            playerHitbox.posY + playerHitbox.size_Y > objectHitbox.posY) {
            player.collision(obj);
        }
    }

    collision(obj) {
        switch (obj.tag) {
            case 'enemy':
                this.reset();
                ui.removeLive();
                ui.addScore(-500);
                break;
            case 'heart':
                obj.posX = -200;
                ui.addLive();
                ui.addScore(250);
                break;
            case 'star':
                obj.posX = -200;
                ui.addScore(500);
                break;
        }
    }

    reset() {
        this.posX = Player.START_X;
        this.posY = Player.START_Y;
    }

    win() {
        if (player.posY < 0) {
            allEnemies = [];
            this.reset();
            ui.addScore(1000);
            setTimeout(function () { //to prevent player from loosing live
                ui.addLevel();
            }, 10);
        }
    }
}

class GameObject {
    constructor(tag, posX, posY, sprite) {
        this.tag = tag;
        this.posX = posX;
        this.posY = posY;
        this.sprite = sprite;
    }

    update() {
        player.checkCollision(this);
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.posX, this.posY);
    }

    static generateNewObjects() {
        gameObjects.forEach(function (obj) {
            let newObj = new GameObject(obj.tag, randomPosition()[0], randomPosition()[1], obj.sprite);
            gameObjects[gameObjects.indexOf(obj)] = newObj;
        });
    }
}

class UI {
    constructor() {
        this.lives = 3;
        this.score = 0;
        this.level = 1;
    }
    render() {
        this.drawLives();
        this.drawScore();
        this.drawLevel();
    }

    drawLives() {
        let posX = 0;
        for (var i = 1; i <= this.lives; i++) {
            ctx.drawImage(Resources.get('images/Heart.png'), posX, OFFSCREEN_Y - 80, 50, 75);
            posX += 45;
        }
    }

    drawScore() {
        ctx.font = '30px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Score: ' + this.score, 500, OFFSCREEN_Y - 30);
    }

    drawLevel() {
        ctx.font = '24px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Level: ' + this.level, 500, 80);
    }

    addLive() {
        if (this.lives < 3) {
            this.lives++;
            this.drawLives();
        }
    }

    removeLive() {
        this.lives--;
        this.drawLives();
        if (this.lives === 0) {
            this.gameOver();
        }
    }

    addScore(val) {
        this.score += val;
    }

    addLevel() {
        this.level++;
        GameObject.generateNewObjects();
        Enemy.generateNewEnemies();
    }

    gameOver() {
        alert('Game Over');
        location = location;
    }
}

function randomPosition() {
    const posX = 101 * Math.floor(Math.random() * 4);
    const posY = 60 + (85 * Math.floor(Math.random() * 3));
    return [posX, posY];
}

const ui = new UI();
const player = new Player();
let allEnemies = new Array();
Enemy.generateNewEnemies();

let heart = new GameObject('heart', randomPosition()[0], randomPosition()[1], 'images/Heart.png');
let star = new GameObject('star', randomPosition()[0], randomPosition()[1], 'images/Star.png');
const gameObjects = new Array();
gameObjects.push(heart, star);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
