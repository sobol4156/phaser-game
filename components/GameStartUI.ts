import Phaser from 'phaser';

export default class GameStartUi {
  private container!: Phaser.GameObjects.Container;

  constructor(
    private scene: Phaser.Scene,
    private onStart: () => void 
  ) {
    this.createScreen();
  }

  private createScreen() {
    const background = this.scene.add.rectangle(600, 340, 1200, 750, 0x000000, 0.7);

    const startText = this.scene.add.text(600, 250, 'START GAME', {
      font: '48px Arial',
      fill: '#ffffff',
    }).setOrigin(0.5);

    const startButton = this.scene.add.text(600, 400, 'Start', {
      font: '32px Arial',
      fill: '#ffffff',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.onStart(); // Вызываем коллбэк для запуска игры
      });

    this.container = this.scene.add.container(0, 0, [background, startText, startButton]);
  }

  show() {
    this.container.setVisible(true);
  }

  hide() {
    this.container.setVisible(false);
  }
}
