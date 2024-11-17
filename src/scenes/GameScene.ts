import Phaser from 'phaser';
import Player from '@/components/Player'
import Enemy from '@/components/Enemy'
import GameOverUI from '@/components/GameOverUI'
import GameStateManager from '@/components/GameStateManager';
import InputManager from '@/components/InputManager';
import GameStartUI from '@/components/GameStartUI';
import background from '@/assets/backgroundGame.png';
import playerStand from '@/assets/pixel/Tiles/Characters/tile_0000.png';
import playerMove from '@/assets/pixel/Tiles/Characters/tile_0001.png';
import bullet from '@/assets/pixel/Tiles/tile_0151.png';
import enemy from '@/assets/pixel/Tiles/Characters/tile_0021.png';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private enemies!: Enemy;
  private gameOverUI!: GameOverUI;
  private gameState!: GameStateManager;
  private gameStartUI!: GameStartUI;
  private isGameStarted: boolean = false;
  private damagePlayer: number = 10;

  private currentLevel: number = 1;
  private levelText!: Phaser.GameObjects.Text;
  private isTransitioningLevel: boolean = false;

  private levels = Array.from({ length: 100 }, (_, i) => ({
    level: i + 1,
    score: i * 20,
  }));

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('background', background);
    this.load.image('player', playerStand);
    this.load.image('player-move', playerMove);
    this.load.image('bullet', bullet);
    this.load.image('enemy', enemy);
  }

  create() {
    this.add.image(600, 340, 'background');

    this.gameStartUI = new GameStartUI(this, () => {
      this.startGame();
    });

    this.inputManager = new InputManager(this)

    this.player = new Player(this, 50, 550);

    this.enemies = new Enemy(this)

    this.gameOverUI = new GameOverUI(this, () => {
      this.resetGame();
    });

    this.levelText = this.add.text(550, 20, `Level: ${this.currentLevel}`, {
      font: '26px Arial',
      color: '#ffffff',
    });

    this.gameState = new GameStateManager(this);

    this.enemies.startSpawning(2000, () => this.gameState.currentScore())

    this.physics.add.collider(this.player.getSprite(), this.enemies.getGroup(), this.handlePlayerHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this)

    this.physics.add.collider(this.player.getBullets(), this.enemies.getGroup(), this.handleBulletHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    this.player.getSprite().setVisible(false);
    this.enemies.stopSwawning();
    this.physics.pause();

    this.events.on('enemyDefeated', () => {
      this.gameState.increaseScore(10)
    })

    this.events.on('bossDefeated', () => {
      this.gameState.increaseScore(20);
    })
  }

  update() {
    if (!this.isGameStarted) {
      return;
    }

    this.player.handleMovement(this.inputManager.getKeys());
    this.enemies.update();
    this.checkLevelProgression();
  }

  // урон по игроку
  private handlePlayerHit(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

    this.gameState.decreaseHealth(10)
    this.enemies.takeDamage(enemySprite, this.damagePlayer / 2)

    if (this.gameState.currentHealth() <= 0) {
      this.showGameOverScreen();
    }
  }
  // урон по врагу
  private handleBulletHitEnemy(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Image;
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

    bulletSprite.destroy();
    this.enemies.takeDamage(enemySprite, this.damagePlayer)
  }
  // показ окошка GameOver
  private showGameOverScreen() {
    this.enemies.stopSwawning();
    this.enemies.clearEnemies();
    this.player.getSprite().setVisible(false);
    this.physics.pause();
    this.gameOverUI.show();
  }

  private startGame() {
    this.isGameStarted = true; // Устанавливаем флаг старта
    this.gameStartUI.hide(); // Скрываем экран старта
    this.physics.resume(); // Возобновляем физику
    this.player.getSprite().setVisible(true); // Делаем игрока видимым
    this.enemies.startSpawning(2000, () => this.gameState.currentScore()); // Начинаем спавн врагов
  }

  private resetGame() {
    this.isGameStarted = true; // Устанавливаем флаг старта
    this.physics.resume(); // Возобновляем физику
    this.player.getSprite().setVisible(true); // Показываем игрока
    this.player.getSprite().setPosition(50, 550);
    this.player.getSprite().setVelocity(0, 0);
    this.enemies.clearEnemies(); // Удаляем всех врагов
    this.enemies.startSpawning(2000, () => this.gameState.currentScore()); // Перезапускаем спавн врагов
    this.gameState.reset(); // Сбрасываем состояние здоровья и очков
    this.currentLevel = 1; // Сбрасываем уровень
    this.levelText.setText(`Level: ${this.currentLevel}`);// Обновляем текст уровня
    this.gameOverUI.hide(); // Скрываем интерфейс "Game Over"
  }

  private checkLevelProgression() {
    const score = this.gameState.currentScore();

    const nextLevel = this.levels.findLast((lvl) => score >= lvl.score)

    if (nextLevel && this.currentLevel < nextLevel.level) {
      this.setLevel(nextLevel.level);
    }
  }

  private setLevel(level: number) {
    // Если переход уже выполняется или уровень не изменился, ничего не делаем
    if (this.isTransitioningLevel || this.currentLevel === level) return;

    this.isTransitioningLevel = true; // Устанавливаем флаг перехода
    this.currentLevel = level;

    // Очищаем врагов и останавливаем их спавн
    this.enemies.stopSwawning();
    this.enemies.clearEnemies();

    this.player.clearBullets(); // Очищаем пули
    this.player.getSprite().setPosition(50, 750); // Сбрасываем позицию игрока
    this.physics.pause(); // Останавливаем физику

    // Создаем затемненный фон
    const backgroundBlur = this.add.rectangle(600, 340, 1200, 750, 0x000000, 0.7);

    // Создаем текст уровня
    const levelText = this.add.text(600, 340, `Level ${level}`, {
      font: '48px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.levelText.setText(`Level: ${this.currentLevel}`);
    // Контейнер для уровня
    const levelContainer = this.add.container(0, 0, [backgroundBlur, levelText]);

    // Показ уведомления на 2 секунды
    this.time.delayedCall(2000, () => {
      levelContainer.destroy(); // Удаляем уведомление
      this.physics.resume(); // Возобновляем физику
      if (level % 5 === 0) {
        this.enemies.createBoss();
      } else {
        const delay = 2000; // Задержка появления врагов
        this.enemies.startSpawning(delay, () => this.gameState.currentScore());
      }
      this.isTransitioningLevel = false; // Сбрасываем флаг перехода
    });
  }

}
