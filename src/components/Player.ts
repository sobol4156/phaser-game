import Phaser from 'phaser';

export default class Player {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private isOnGround: boolean = false;
  private moveAnimationInterval: NodeJS.Timeout | null = null;
  private bullets!: Phaser.Physics.Arcade.Group;
  
  constructor(private scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setBounce(0.1).setCollideWorldBounds(true);

    this.bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true,
    });

    // Обработка кликов мыши для стрельбы
    scene.input.on('pointerdown', this.shootBullet, this);
  }

  getSprite() {
    return this.sprite;
  }

  getBullets() {
    return this.bullets;
  }

  handleMovement(keys: Record<string, Phaser.Input.Keyboard.Key>) {
    // Проверяем, находится ли игрок на земле
    if (this.sprite.body?.blocked.down) {
      if (!this.isOnGround) {
        this.isOnGround = true;
        this.stopMoveAnimation();
        this.sprite.setTexture('player'); // Устанавливаем текстуру "стоя"
      }
    } else {
      this.isOnGround = false;
      this.stopMoveAnimation();
      this.sprite.setTexture('player-move'); // Устанавливаем текстуру "прыжок"
    }

    // Логика движения
    if (keys.left.isDown) {
      this.sprite.setVelocityX(-160);
      if (this.isOnGround) {
        this.startMoveAnimation();
      }
    } else if (keys.right.isDown) {
      this.sprite.setVelocityX(160);
      if (this.isOnGround) {
        this.startMoveAnimation();
      }
    } else {
      this.sprite.setVelocityX(0);
      this.stopMoveAnimation();
    }

    // Прыжок
    if ((keys.up.isDown || keys.jump.isDown) && this.sprite.body?.blocked.down) {
      this.sprite.setVelocityY(-330);
    }
  }

  private startMoveAnimation() {
    if (!this.moveAnimationInterval) {
      let toggle = true;
      this.moveAnimationInterval = setInterval(() => {
        this.sprite.setTexture(toggle ? 'player-move' : 'player');
        toggle = !toggle;
      }, 100);
    }
  }

  private stopMoveAnimation() {
    if (this.moveAnimationInterval) {
      clearInterval(this.moveAnimationInterval);
      this.moveAnimationInterval = null;
      this.sprite.setTexture('player');
    }
  }
    // выстрел пули
  private shootBullet(pointer: Phaser.Input.Pointer) {
      const bullet = this.bullets.get(
        this.sprite.x,
        this.sprite.y - 10,
        'bullet'
      ) as Phaser.Physics.Arcade.Image;
  
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
  
        this.scene.physics.moveTo(bullet, pointer.x, pointer.y, 600)
      }
    }
}
