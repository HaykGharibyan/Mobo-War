import Phaser from 'phaser';
import type { WeaponRigKind } from './WeaponRigArt';

// The source art contains two equal cells: the stationary tracks and the rotating turret.
// Build small transparent textures once, so the checker preview backdrop never reaches the battlefield.
export function makeWeaponSpriteArt(scene: Phaser.Scene, sourceKey: string, kind: WeaponRigKind) {
  const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  const cellWidth = source.naturalWidth / 2;
  const width = 384;
  const height = Math.round(source.naturalHeight * width / cellWidth);

  for (const [part, cell] of [['base', 0], ['turret', 1]] as const) {
    const key = `battle-weapon-${kind}-${part}`;
    if (scene.textures.exists(key)) continue;
    const texture = scene.textures.createCanvas(key, width, height)!;
    const context = texture.context;
    context.clearRect(0, 0, width, height);
    context.drawImage(source, cell * cellWidth, 0, cellWidth, source.naturalHeight, 0, 0, width, height);
    const image = context.getImageData(0, 0, width, height);
    const pixels = image.data;
    for (let i = 0; i < pixels.length; i += 4) {
      const red = pixels[i], green = pixels[i + 1], blue = pixels[i + 2];
      const darkest = Math.min(red, green, blue);
      const chroma = Math.max(red, green, blue) - darkest;
      if (darkest >= 187 && chroma <= 24) pixels[i + 3] = 0;
    }
    context.putImageData(image, 0, 0);
    texture.refresh();
  }
}
