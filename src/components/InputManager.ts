import Phaser from 'phaser';

export default class InputManager {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(private scene: Phaser.Scene) {
    this.keys = this.scene.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as Record<string, Phaser.Input.Keyboard.Key> || {} as Record<string, Phaser.Input.Keyboard.Key>;
  }

  getKeys(): Record<string, Phaser.Input.Keyboard.Key> {
    return this.keys;
  }
}
