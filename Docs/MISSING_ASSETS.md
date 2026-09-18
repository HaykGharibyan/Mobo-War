# MOBO WAR — Battle asset backlog

The playable battle uses original procedural cartoon textures so it works without missing files. These production assets can replace them later through `BattleRenderer` without changing battle logic:

- Robot sprite sheets: blue basic/runner/tank and red basic/fast/tank/boss, including run, attack, hit and death frames.
- Cannon sprite sheets for Pulse, Rapid and Plasma variants, including idle and recoil.
- Fortress variants for Green Kingdom, Frozen Valley and Robot City, including damage states.
- Battle particles: spawn burst, gate trail, hit spark, robot defeat burst, fortress debris and victory confetti.
- Battle audio: `spawn`, `shoot`, `hit`, `death`, `gate_pass`, `base_hit`, `victory`, `defeat`.
- Booster icons for Freeze, Army Drop and Blast. The current HUD uses compact symbol placeholders.

Preferred export: transparent WebP/PNG atlases at 2x resolution, with trimmed frames and consistent pivots. Battle audio should be short compressed OGG/AAC clips suitable for mobile playback.
