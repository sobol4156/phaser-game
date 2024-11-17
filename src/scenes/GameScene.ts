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
    console.log(playerStand)
    this.gameStartUI = new GameStartUI(this, () => {
      this.startGame();
    });

    this.inputManager = new InputManager(this)

    this.player = new Player(this, 50, 550);

    this.enemies = new Enemy(this)

    this.gameOverUI = new GameOverUI(this, () => {
      this.resetGame();
    });

    this.gameState = new GameStateManager(this);

    this.enemies.startSpawning(2000, () => this.gameState.currentScore())

    this.physics.add.collider(this.player.getSprite(), this.enemies.getGroup(), this.handlePlayerHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this)

    this.physics.add.collider(this.player.getBullets(), this.enemies.getGroup(), this.handleBulletHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    this.player.getSprite().setVisible(false);
    this.enemies.stopSwawning();
    this.physics.pause();
  }

  update() {
    if (!this.isGameStarted) {
      return;
    }

    this.player.handleMovement(this.inputManager.getKeys());
    this.enemies.update();
  }

  // урон по игроку
  private handlePlayerHit(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

    this.gameState.decreaseHealth(10)
    this.enemies.takeDamage(enemySprite, 5)

    if (this.gameState.currentHealth() <= 0) {
      this.showGameOverScreen();
    }
  }
  // урон по врагу
  private handleBulletHitEnemy(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Image;
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

    this.gameState.increaseScore(10)

    bulletSprite.destroy();
    this.enemies.takeDamage(enemySprite , 5)
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
    this.gameOverUI.hide(); // Скрываем интерфейс "Game Over"
  }

}
