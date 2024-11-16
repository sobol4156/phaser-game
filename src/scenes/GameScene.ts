import Phaser from 'phaser';
import background from '../assets/backgroundGame.png';
import playerStand from '../assets/pixel/Tiles/Characters/tile_0000.png';
import playerMove from '../assets/pixel/Tiles/Characters/tile_0001.png';
import bullet from '../assets/pixel/Tiles/tile_0151.png';
import enemy from '../assets/pixel/Tiles/Characters/tile_0021.png';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;
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
  private isMoving: boolean = false;
  private moveAnimationInterval: NodeJS.Timeout | null = null;
  private isOnGround: boolean = false;
  private enemies!: Phaser.Physics.Arcade.Group;
  private gameOverContainer!: Phaser.GameObjects.Container;
  private enemySpawnEvent!: Phaser.Time.TimerEvent;

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

    this.player = this.physics.add.sprite(50, 550, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

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
    // Пульки
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true,
    })

    this.input.on('pointerdown', this.shootBullet, this)

    //Враги
    this.enemies = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true
    })

    this.enemySpawnEvent = this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(this.player, this.enemies, this.handlePlayerHit, undefined, this)

    this.physics.add.collider(this.bullets, this.enemies, this.handleBulletHitEnemy, undefined, this);

    this.createGameOverScreen();
  }

  update() {
    // Проверяем, находится ли игрок на земле
    if (this.player.body?.blocked.down) {
      if (!this.isOnGround) {
        // Игрок только что приземлился
        this.isOnGround = true;
        this.stopMoveAnimation();
        this.player.setTexture('player');
      }
    } else {
      // Игрок в воздухе
      this.isOnGround = false;
      this.stopMoveAnimation();
      this.player.setTexture('player-move');

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

    // удаляем врагов которые вышли за границу
    this.enemies.getChildren().forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (enemySprite.x < -50) {
        enemySprite.destroy()
      }
    })
  }
  // начало анимации ходьбы
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
  // прекращение анимации ходьбы
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
  // выстрел пули
  private shootBullet(pointer: Phaser.Input.Pointer) {
    const bullet = this.bullets.get(
      this.player.x,
      this.player.y - 10,
      'bullet'
    ) as Phaser.Physics.Arcade.Image;

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      this.physics.moveTo(bullet, pointer.x, pointer.y, 600)
    }
  }
  // появление врагов
  private spawnEnemy() {
    const x = Phaser.Math.Between(800, 1200);
    const y = Phaser.Math.Between(100, 500);
    const enemy = this.enemies.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;

    if (enemy) {
      enemy.setActive;
      enemy.setVisible;
      enemy.setCollideWorldBounds(true),
        enemy.setVelocityX(Phaser.Math.Between(-100, -150));
    }
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
    this.stopEnemySpawning();
    this.enemies.clear(true, true);
    this.player.setVisible(false);
    
    this.gameOverContainer.setVisible(true);
  }
  // создание окошка GameOver
  private createGameOverScreen(){
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
    .setInteractive({useHandCursos: true})
    .on('pointerdown', () => this.scene.restart())

    this.gameOverContainer = this.add.container(0,0, [background, gameOverText, restartButton])
    this.gameOverContainer.setVisible(false);
  }
  private stopEnemySpawning() {
    if (this.enemySpawnEvent) {
      this.enemySpawnEvent.remove(); 
    }
  }
}
