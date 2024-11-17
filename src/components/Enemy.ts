import Phaser from 'phaser';

export default class Enemy {
  private group: Phaser.Physics.Arcade.Group;
  private healthBars: Phaser.GameObjects.Graphics[] = []; // Храним ссылки на healthBar
  private enemySpawnEvent!: Phaser.Time.TimerEvent;

  constructor(private scene: Phaser.Scene) {
    this.group = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    });
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
    this.group.getChildren().forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      const healthBar = enemySprite.getData('healthBar') as Phaser.GameObjects.Graphics;

      if (healthBar) {
        healthBar.clear();
        healthBar.destroy();
      }

      enemySprite.destroy();
    });

    // Удаляем все индикаторы здоровья
    this.healthBars.forEach((healthBar) => {
      healthBar.clear();
      healthBar.destroy();
    });

    this.healthBars = []; // Очищаем массив healthBars
    this.group.clear(true, true);
  }

  createBoss() {
    const x = 900; 
    const y = 300;
  
    const boss = this.group.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;
  
    boss
      .setCollideWorldBounds(true)
      .setBounce(0.4)
      .setScale(3) // Увеличиваем размер босса
      .setVelocityX(Phaser.Math.Between(-150, -250))
      .setInteractive()
      .on('worldbounds', () => {
        const body = boss.body as Phaser.Physics.Arcade.Body;
        boss.setVelocityX(-body.velocity.x);
      });
  
    // Устанавливаем 200 HP для босса
    const health = 200;
    boss.setData('isBoss', true); // Помечаем как босса
    const healthBar = this.createHealthBar(boss, health);
    boss.setData('healthBar', healthBar);
    boss.setData('maxHealth', health);
    boss.setData('currentHealth', health);
  
    return boss;
  }
  
  private createHealthBar(enemy: Phaser.Physics.Arcade.Sprite, health: number): Phaser.GameObjects.Graphics {
    const healthBar = this.scene.add.graphics();
    healthBar.fillStyle(0x00ff00, 1); // Зеленый цвет
    healthBar.fillRect(-50, -20, 100, 10); // Размер индикатора здоровья для босса
    return healthBar;
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
        enemy.setVelocityX(-body.velocity.x);
      });

    const health = score >= 200 ? 30 : score >= 100 ? 20 : 10;
    (enemy as any).health = health;

    const healthBar = this.scene.add.graphics();
    healthBar.fillStyle(0x00ff00, 1); // Зеленый цвет
    healthBar.fillRect(-20, -10, 40, 5); // Размер индикатора здоровья

    enemy.setData('healthBar', healthBar);
    enemy.setData('maxHealth', health);
    enemy.setData('currentHealth', health);

    this.healthBars.push(healthBar); // Добавляем healthBar в массив
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
    const isBoss = enemy.getData('isBoss');

    enemy.setData('currentHealth', newHealth);

    this.updateHealthBar(enemy); // Обновляем индикатор здоровья

    if (newHealth <= 0) {
      const healthBar = enemy.getData('healthBar') as Phaser.GameObjects.Graphics;
      healthBar.destroy(); // Удаляем индикатор здоровья
      this.healthBars = this.healthBars.filter((bar) => bar !== healthBar); // Удаляем из массива

      enemy.destroy(); 

      if (isBoss) {
        this.scene.events.emit('bossDefeated'); // Генерируем событие при смерти босса
      }else{
        this.scene.events.emit('enemyDefeated');// Генерируем событие при смерти юнита
      }
    }
  }
}
