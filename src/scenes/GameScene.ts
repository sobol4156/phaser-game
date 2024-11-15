import Phaser from 'phaser';
import background from '../assets/backgroundGame.png';
import playerStand from '../assets/pixel/Tiles/Characters/tile_0000.png';
import playerMove from '../assets/pixel/Tiles/Characters/tile_0001.png';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
  };
  private isMoving: boolean = false;
  private moveAnimationInterval: NodeJS.Timeout | null = null;
  private isOnGround: boolean = false;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('background', background);
    this.load.image('player', playerStand);
    this.load.image('player-move', playerMove);

  }

  create() {
    this.add.image(600, 340, 'background');

    this.player = this.physics.add.sprite(50, 550, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  update() {
    // Проверяем, находится ли игрок на земле
    if (this.player.body?.blocked.down) {
      if (!this.isOnGround) {
        // Игрок только что приземлился
        this.isOnGround = true;
        this.stopMoveAnimation();
        this.player.setTexture('player'); // Устанавливаем текстуру стояния
      }
    } else {
      // Игрок в воздухе
      this.isOnGround = false;
      this.stopMoveAnimation();
      this.player.setTexture('player-move'); // Устанавливаем текстуру прыжка

    }
    // Логика движения влево
    if (this.keys.left.isDown) {
      this.player.setVelocityX(-160);
      if (this.isOnGround) {
        this.startMoveAnimation()
      }
    }
    // Логика движения вправо
    else if (this.keys.right.isDown) {
      this.player.setVelocityX(160);
      if (this.isOnGround) {
        this.startMoveAnimation()
      }
    }
    // Логика остановки
    else {
      this.player.setVelocityX(0);
      this.stopMoveAnimation()
    }

    // Прыжок
    if ((this.keys.up.isDown || this.keys.jump.isDown) && this.player.body?.blocked.down) {
      this.player.setVelocityY(-330);
    }
  }

  private startMoveAnimation() {
    if (!this.isMoving) {
      this.isMoving = true;

      let toggle = true;
      this.moveAnimationInterval = setInterval(() => {
        this.player.setTexture(toggle ? 'player-move' : 'player');
        toggle = !toggle;
      }, 100); // Интервал смены текстур
    }
  }

  private stopMoveAnimation() {
    if (this.isMoving) {
      this.isMoving = false;
      if (this.moveAnimationInterval) {
        clearInterval(this.moveAnimationInterval); // Очищаем интервал анимации
        this.moveAnimationInterval = null;
      }
      this.player.setTexture('player'); 
    }

  }
}
