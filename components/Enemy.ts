import Phaser from 'phaser';

export default class Enemy {
  private group: Phaser.Physics.Arcade.Group;
  private enemySpawnEvent!: Phaser.Time.TimerEvent;

  constructor(private scene: Phaser.Scene) {
    this.group = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite
    })
  }

  startSpawning(delaySpawn: number) {
    this.enemySpawnEvent = this.scene.time.addEvent({
      delay: delaySpawn,
      callback: this.spawnEnemy,
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
      enemy.destroy();
    });
  }

  // появление врагов
  spawnEnemy() {
    const x = Phaser.Math.Between(800, 1200);
    const y = Phaser.Math.Between(100, 500);

    const enemy = this.group.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;

    enemy
      .setCollideWorldBounds(true)
      .setVelocityX(Phaser.Math.Between(-100, -150));
  }

  getGroup() {
    return this.group;
  }


}