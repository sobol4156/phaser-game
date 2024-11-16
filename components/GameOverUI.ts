import Phaser from 'phaser';

export default class GameOverUI {
  private container!: Phaser.GameObjects.Container;

  constructor(private scene: Phaser.Scene, private onRestart: () => void) {
    const background = scene.add.rectangle(600, 340, 1200, 750, 0x000000, 0.7);
    const gameOverText = scene.add.text(600, 250, 'GAME OVER', {
      font: '48px Arial',
      fill: '#ffffff',
    }).setOrigin(0.5);

    const restartButton = scene.add.text(600, 400, 'Try again', {
      font: '32px Arial',
      fill: '#ffffff',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.onRestart);

    this.container = scene.add.container(0, 0, [background, gameOverText, restartButton]);
    this.container.setVisible(false);
  }

  show() {
    this.container.setVisible(true);
  }

  hide() {
    this.container.setVisible(false);
  }
}
