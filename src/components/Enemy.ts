import Phaser from 'phaser';

export default class Enemy {
  private group: Phaser.Physics.Arcade.Group;
  private enemySpawnEvent!: Phaser.Time.TimerEvent;

  constructor(private scene: Phaser.Scene) {
    this.group = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite
    })
  }

  startSpawning(delaySpawn: number, getScore: () => number) {
    this.enemySpawnEvent = this.scene.time.addEvent({
      delay: delaySpawn,
      callback: () => this.spawnEnemy(getScore()),
      callbackScope: this,
      loop: true,
    });
  }

  stopSwawning() {
    if (this.enemySpawnEvent) {
      this.enemySpawnEvent.remove();
    }
  }

  clearEnemies() {
    this.clearHealthBars();
    this.group.getChildren().forEach((enemy) => {
      enemy.destroy();
    });
  }

  clearHealthBars() {
    this.group.getChildren().forEach((enemy) => {
      const healthBar = (enemy as Phaser.Physics.Arcade.Sprite).getData('healthBar') as Phaser.GameObjects.Graphics;
      if (healthBar) {
        healthBar.destroy();
      }
    });
  }

  // появление врагов
  spawnEnemy(score: number) {
    const x = Phaser.Math.Between(800, 1200);
    const y = Phaser.Math.Between(100, 500);

    const enemy = this.group.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;

    enemy
      .setCollideWorldBounds(true)
      .setBounce(1)
      .setVelocityX(Phaser.Math.Between(-100, -150))
      .setInteractive()
      .on('worldbounds', () => {
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        enemy.setVelocityX(-body.velocity.x)
      });


    const health = score >= 200 ? 30 : score >= 100 ? 20 : 10;
    (enemy as any).health = health;



    const healthBar = this.scene.add.graphics();
    healthBar.fillStyle(0x00ff00, 1); // Зеленый цвет
    healthBar.fillRect(-20, -10, 40, 5); // Размер индикатора здоровья

    enemy.setData('healthBar', healthBar);
    enemy.setData('maxHealth', health);
    enemy.setData('currentHealth', health);
  }

  updateHealthBar(enemy: Phaser.Physics.Arcade.Sprite) {
    const maxHealth = enemy.getData('maxHealth');
    const currentHealth = enemy.getData('currentHealth');
    const healthBar = enemy.getData('healthBar') as Phaser.GameObjects.Graphics;

    // Обновляем индикатор здоровья
    healthBar.clear();

    if (currentHealth > 0) {
      const healthPercentage = currentHealth / maxHealth;
      // Зеленая часть
      healthBar.fillStyle(0x00ff00, 1);
      healthBar.fillRect(enemy.x - 20, enemy.y - 10, 40 * healthPercentage, 5);

      // Красная часть
      healthBar.fillStyle(0xff0000, 1);
      healthBar.fillRect(
        enemy.x - 20 + 40 * healthPercentage,
        enemy.y - 10,
        40 * (1 - healthPercentage),
        5
      );
    }
  }

  update() {
    this.group.getChildren().forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      this.updateHealthBar(enemySprite);
    });
  }

  getGroup() {
    return this.group;
  }


  takeDamage(enemy: Phaser.Physics.Arcade.Sprite, damage: number) {
    const currentHealth = enemy.getData('currentHealth');
    const newHealth = currentHealth - damage;
    enemy.setData('currentHealth', newHealth);

    this.updateHealthBar(enemy); // Обновляем индикатор здоровья

    if (newHealth <= 0) {
      const healthBar = enemy.getData('healthBar') as Phaser.GameObjects.Graphics;
      healthBar.destroy(); // Удаляем индикатор здоровья
      enemy.destroy(); // Уничтожаем врага
    }
  }
}