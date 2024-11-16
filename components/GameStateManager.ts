import Phaser from 'phaser';

export default class GameStateManager {
  private health: number;
  private score: number;
  private healthTextL!: Phaser.GameObjects.Text;
  private scoreTextL!: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene, initialHealth: number = 100, initialScore: number = 0) {
    this.health = initialHealth;
    this.score = initialScore;

    // Тексты здоровья и очков
    this.healthText = this.scene.add.text(20, 20, `Health: ${this.health}`, {
      font: '26px Arial',
      fill: 'red',
      stroke: 'red',
      strokeThickness: 1,
    });

    this.scoreText = this.scene.add.text(1040, 20, `Score: ${this.score}`, {
      font: '26px Arial',
      fill: 'white',
      strokeThickness: 1,
    });
  }

  decreaseHealth(amount: number) {
    this.health -= amount;
    this.updateHealthText();
    return this.health;
  }

  increaseScore(amount: number) {
    this.score += amount;
    this.updateScoreText();
  }

  reset() {
    this.health = 100;
    this.score = 0;
    this.updateHealthText();
    this.updateScoreText();
  }

  // Обновление текста
  private updateHealthText() {
    this.healthText.setText(`Health: ${this.health}`);
  }

  private updateScoreText() {
    this.scoreText.setText(`Score: ${this.score}`);
  }
}