import Phaser from 'phaser';
import Player from '../../components/Player'
import Enemy from '../../components/Enemy'
import background from '../assets/backgroundGame.png';
import playerStand from '../assets/pixel/Tiles/Characters/tile_0000.png';
import playerMove from '../assets/pixel/Tiles/Characters/tile_0001.png';
import bullet from '../assets/pixel/Tiles/tile_0151.png';
import enemy from '../assets/pixel/Tiles/Characters/tile_0021.png';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private health: number = 0;
  private healthText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
  };
  private enemies!: Enemy;
  private gameOverContainer!: Phaser.GameObjects.Container;

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

    this.player = new Player(this, 50, 550);

    this.keys = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // Текст здоровья и счёта
    this.healthText = this.add.text(20, 20, `Health: ${this.health}`, {
      font: '26px Arial',
      fill: 'red',
      stroke: 'red',
      strokeThickness: 1
    })

    this.scoreText = this.add.text(1040, 20, `Score: ${this.score}`, {
      font: '26px Arial',
      fill: 'white',
      strokeThickness: 1
    })

    //Враги
    this.enemies = new Enemy(this)

    this.enemies.startSpawning(2000)

    this.physics.add.collider(this.player.getSprite(), this.enemies.getGroup(), this.handlePlayerHit, undefined, this)

    this.physics.add.collider(this.player.getBullets(), this.enemies.getGroup(), this.handleBulletHitEnemy, undefined, this);

    this.createGameOverScreen();
  }

  update() {
    this.player.handleMovement(this.keys);

  }

  // урон по игроку
  private handlePlayerHit(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

    this.health -= 10;
    this.healthText.setText(`Health: ${this.health}`)

    enemySprite.destroy()
    if (this.health <= 0) {
      this.showGameOverScreen();
    }
  }
  // урон по врагу
  private handleBulletHitEnemy(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Image;
    const enemySprite = enemy as Phaser.Physics.Arcade.Image;

    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`)

    bulletSprite.destroy();
    enemySprite.destroy();
  }
  // показ окошка GameOver
  private showGameOverScreen() {
    this.enemies.stopSwawning();
    this.enemies.clearEnemies();
    this.player.getSprite().setVisible(false);
    this.gameOverContainer.setVisible(true);
  }
  // создание окошка GameOver
  private createGameOverScreen() {
    const background = this.add.rectangle(600, 340, 1200, 750, 0x000000, 0.7);

    const gameOverText = this.add.text(600, 250, 'GAME OVER', {
      font: '48px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const restartButton = this.add.text(600, 400, 'Try again', {
      font: '32px Arial',
      fill: '#ff0000',
      backgroundColor: '#ffffff',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.restart())

    this.gameOverContainer = this.add.container(0, 0, [background, gameOverText, restartButton])
    this.gameOverContainer.setVisible(false);
  }

}
