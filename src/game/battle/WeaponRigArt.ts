import Phaser from 'phaser';

export type WeaponRigKind = 'pulse' | 'rapid' | 'plasma';

const colors = {
  pulse: { armor: '#1978d1', light: '#75e8ff', dark: '#092d59', glow: '#5beaff', trim: '#e5b956' },
  rapid: { armor: '#267bd0', light: '#7fe8ff', dark: '#0a315b', glow: '#55eaff', trim: '#ff9a37' },
  plasma: { armor: '#57578c', light: '#c3a0ff', dark: '#181b43', glow: '#d15cff', trim: '#e2b858' },
} as const;

function texture(scene: Phaser.Scene, key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return;
  const canvas = scene.textures.createCanvas(key, width, height)!;
  draw(canvas.context);
  canvas.refresh();
}

function round(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient, stroke?: string, lineWidth = 2) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  if (stroke) { ctx.lineWidth = lineWidth; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient, stroke?: string, lineWidth = 2) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) { ctx.lineWidth = lineWidth; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function polygon(ctx: CanvasRenderingContext2D, points: number[], fill: string | CanvasGradient, stroke?: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.closePath();
  ctx.fill();
  if (stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); }
}

export function makeWeaponRigArt(scene: Phaser.Scene) {
  for (const kind of ['pulse', 'rapid', 'plasma'] as const) {
    const p = colors[kind];
    texture(scene, `rig-hull-${kind}`, 150, 104, c => {
      ellipse(c, 75, 92, 72, 10, '#00172899');
      polygon(c, [10, 48, 37, 17, 113, 17, 140, 48, 130, 85, 20, 85], p.dark, p.light);
      const body = c.createLinearGradient(20, 18, 128, 84);
      body.addColorStop(0, p.light); body.addColorStop(.3, p.armor); body.addColorStop(1, p.dark);
      polygon(c, [25, 44, 48, 15, 102, 15, 125, 44, 116, 77, 34, 77], body, '#b2eaff');
      polygon(c, [48, 15, 75, 8, 102, 15, 106, 37, 44, 37], '#102c51', p.trim);
      round(c, 48, 54, 54, 12, 5, p.dark, p.light);
      round(c, 60, 57, 30, 5, 2, p.glow);
      for (const x of [40, 110]) {
        ellipse(c, x, 48, 6, 5, p.trim, '#fff3b1');
        ellipse(c, x, 48, 2, 2, '#6b481f');
      }
      polygon(c, [23, 77, 127, 77, 118, 93, 32, 93], '#0b2649', p.light);
      round(c, 56, 82, 38, 6, 2, p.armor);
    });

    texture(scene, `rig-wheel-${kind}`, 44, 44, c => {
      const tire = c.createRadialGradient(18, 14, 2, 22, 22, 22);
      tire.addColorStop(0, '#53667c'); tire.addColorStop(.55, '#1c2b44'); tire.addColorStop(1, '#060f23');
      ellipse(c, 22, 22, 21, 21, tire, p.light, 2);
      ellipse(c, 22, 22, 13, 13, p.dark, p.trim, 3);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        ellipse(c, 22 + Math.cos(a) * 9, 22 + Math.sin(a) * 9, 2, 2, p.light);
      }
      ellipse(c, 22, 22, 6, 6, p.trim, '#fff2b1');
    });

    texture(scene, `rig-track-${kind}`, 42, 116, c => {
      round(c, 2, 2, 38, 112, 18, '#081329', p.light, 3);
      round(c, 8, 8, 26, 100, 11, '#25324e', p.trim, 2);
      for (let y = 13; y < 104; y += 14) {
        round(c, 5, y, 32, 9, 3, '#0c2548', p.armor, 2);
        round(c, 12, y + 2, 18, 3, 1, p.light);
      }
      for (const y of [16, 100]) ellipse(c, 21, y, 7, 7, p.trim, '#fff0b0');
    });

    texture(scene, `rig-turret-${kind}`, 140, 172, c => {
      // The pivot is near the lower armor ring. Every muzzle points toward the top of the screen.
      const steel = c.createLinearGradient(20, 20, 115, 154);
      steel.addColorStop(0, p.light); steel.addColorStop(.25, p.armor); steel.addColorStop(.75, p.dark); steel.addColorStop(1, '#07162e');
      ellipse(c, 70, 139, 56, 25, '#091b36', p.trim, 3);
      ellipse(c, 70, 133, 47, 20, steel, '#d6eeff', 3);
      polygon(c, [30, 104, 42, 79, 98, 79, 110, 104, 99, 142, 41, 142], steel, p.light);
      polygon(c, [40, 97, 53, 75, 87, 75, 100, 97, 91, 127, 49, 127], p.armor, '#bceeff');

      if (kind === 'rapid') {
        for (const x of [43, 97]) {
          const barrel = c.createLinearGradient(x - 14, 0, x + 14, 0);
          barrel.addColorStop(0, p.dark); barrel.addColorStop(.45, p.armor); barrel.addColorStop(1, p.light);
          polygon(c, [x - 15, 95, x - 12, 20, x + 12, 20, x + 15, 95], barrel, '#c7f5ff');
          for (const y of [46, 68]) round(c, x - 15, y, 30, 9, 4, p.dark, p.trim);
          ellipse(c, x, 20, 13, 8, '#103b74', p.light, 3);
          ellipse(c, x, 20, 6, 4, p.glow);
        }
        round(c, 53, 99, 34, 11, 4, '#1c3155', p.trim);
        for (const x of [23, 113]) for (const y of [100, 113]) round(c, x - 3, y, 7, 5, 2, '#ff7a2c');
      } else {
        const wide = kind === 'plasma';
        const left = wide ? 43 : 51, right = wide ? 97 : 89;
        const barrel = c.createLinearGradient(left, 0, right, 0);
        barrel.addColorStop(0, p.dark); barrel.addColorStop(.25, p.armor); barrel.addColorStop(.55, p.light); barrel.addColorStop(1, p.dark);
        polygon(c, [left - 5, 102, left, 24, right, 24, right + 5, 102], barrel, '#cbeaff');
        round(c, left + 6, 40, right - left - 12, 42, 8, p.dark, p.light);
        const core = c.createLinearGradient(left + 7, 44, right - 7, 79);
        core.addColorStop(0, p.armor); core.addColorStop(.5, '#e4faff'); core.addColorStop(1, p.glow);
        round(c, left + 10, 44, right - left - 20, 34, 6, core);
        for (const y of [36, 84]) round(c, left - 8, y, right - left + 16, 12, 5, p.dark, p.trim, 3);
        ellipse(c, 70, 24, (right - left) / 2 + 3, 10, p.dark, p.light, 3);
        ellipse(c, 70, 24, wide ? 17 : 12, 5, p.glow, '#f4ffff', 2);
        if (wide) {
          for (const x of [31, 109]) for (const y of [107, 122]) round(c, x - 4, y, 8, 7, 2, '#c051f5');
        }
      }

      polygon(c, [36, 112, 56, 99, 84, 99, 104, 112, 95, 143, 45, 143], steel, p.trim);
      round(c, 52, 117, 36, 15, 5, p.dark, p.light);
      round(c, 59, 122, 22, 5, 2, p.glow);
      for (const x of [44, 96]) ellipse(c, x, 135, 4, 4, p.trim, '#fff0ba');
    });

    texture(scene, `rig-shot-${kind}`, kind === 'plasma' ? 40 : 24, kind === 'plasma' ? 40 : 48, c => {
      c.shadowColor = p.glow;
      c.shadowBlur = kind === 'plasma' ? 12 : 9;
      if (kind === 'plasma') {
        const core = c.createRadialGradient(19, 15, 1, 20, 20, 19);
        core.addColorStop(0, '#ffffff'); core.addColorStop(.25, '#f4b8ff'); core.addColorStop(.65, '#b128e9'); core.addColorStop(1, '#55209700');
        ellipse(c, 20, 20, 18, 18, core);
        ellipse(c, 20, 20, 13, 13, '#ffffff11', '#efb5ff', 2);
      } else if (kind === 'rapid') {
        polygon(c, [12, 2, 18, 15, 18, 34, 12, 46, 6, 34, 6, 15], '#30dfff88');
        round(c, 8, 9, 8, 22, 4, '#ffffff', '#ff9b3b');
        ellipse(c, 12, 10, 5, 6, '#fff6bf');
      } else {
        round(c, 6, 9, 12, 29, 6, '#4ee9ff99');
        round(c, 8, 13, 8, 20, 4, '#eaffff');
        ellipse(c, 12, 10, 7, 7, '#a9ffff', '#3fd8ff');
      }
    });
  }
}
