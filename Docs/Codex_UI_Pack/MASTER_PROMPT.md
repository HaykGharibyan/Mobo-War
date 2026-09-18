# MASTER PROMPT — Full Mobile Game UI Implementation

You are working inside an EXISTING mobile game project inspired by the core flow of crowd-control / lane-battle casual games. Your task is to implement a complete production-ready UI/UX system using the visual reference pack in `references/` and `UI_OVERVIEW.png`.

## Non-negotiable rules
- Do not rewrite working gameplay systems unless required for integration.
- First inspect the current project structure, engine/framework, scenes/screens, UI system, prefabs/components, data models, save system, currencies, progression, weapons, units, missions and navigation.
- Before coding, produce a short implementation plan based on the actual repository.
- Reuse existing data and logic. Do not duplicate state in UI scripts.
- Build reusable UI components instead of one-off screen code.
- Make the UI responsive for common mobile aspect ratios and safe areas/notches.
- Keep UI code separated from gameplay logic.
- If a backend/data system does not exist yet, introduce mock/demo data behind clean interfaces so it can be replaced later.
- Do not silently delete or disable existing game functionality.
- After every stage: run/build the project, fix errors, check navigation, check console/logs, and verify multiple mobile resolutions.

## Visual direction
Use `UI_OVERVIEW.png` and all files under `references/` as the primary visual source of truth.

Style:
- colorful polished mobile-casual game UI
- deep blue panels and navigation
- cyan/blue active states
- gold/yellow primary CTA buttons
- green upgrade/claim buttons
- purple premium/reward accents
- large rounded cards and buttons
- readable bold typography
- subtle gradients, shadows, highlights, borders
- strong visual hierarchy
- playful but clean
- minimal clutter during gameplay

Do not copy text or numbers mechanically if the project already has real values. Bind UI to real project data.

## Screens to implement
1. Lobby / Home — `references/01_lobby_home.png`
2. Level Map — `references/02_level_map.png`
3. Loadout / Before Battle — `references/03_loadout.png`
4. Battle HUD — `references/04_battle_hud.png`
5. Victory — `references/05_victory.png`
6. Defeat — `references/06_defeat.png`
7. Weapons — `references/07_weapons.png`
8. Units — `references/08_units.png`
9. Shop — `references/09_shop.png`
10. Daily Rewards — `references/10_daily_rewards.png`
11. Missions — `references/11_missions.png`
12. Battle Pass — `references/12_battle_pass.png`
13. Profile — `references/13_profile.png`
14. Settings — `references/14_settings.png`
15. Skins / Customization — `references/15_customization.png`
16. Events — `references/16_events.png`
17. Loading — `references/17_loading.png`
18. Theme variations reference only — `references/18_theme_variations.png`

## Shared UI architecture
Create equivalent reusable components appropriate for the project's technology:
- App/Game UI root
- ScreenRouter / NavigationController
- SafeAreaContainer
- TopBar
- CurrencyDisplay
- PlayerBadge
- BottomNavigation
- PrimaryButton
- SecondaryButton
- UpgradeButton
- ClaimButton
- IconButton
- ProgressBar
- LevelBadge
- Tabs
- ItemCard
- WeaponCard
- UnitCard
- RewardCard
- MissionCard
- OfferCard
- Modal/Dialog
- LockedOverlay
- NotificationBadge
- TimerBadge
- StatRow
- CharacterPreview
- WeaponPreview
- Toast/RewardPopup

## States that every relevant component must support
- normal
- pressed
- selected
- disabled
- locked
- claimed
- available
- new
- upgrade available
- insufficient currency

## Design tokens
Create centralized tokens/theme values instead of hardcoding styles everywhere.
Suggested semantic tokens:
- panel/background primary
- panel/background secondary
- accent blue
- CTA gold
- success green
- premium purple
- danger red
- text primary
- text secondary
- border/highlight
- radius small / medium / large / pill
- spacing 4 / 8 / 12 / 16 / 24 / 32
- typography title / section / body / caption / numeric
- shadow small / medium / large

Exact values should be tuned visually against the references and the actual engine/framework rendering.

## Navigation model
Main bottom navigation:
- Home
- Units
- Weapons
- Shop
- Profile

Secondary entry points from Lobby/top/side widgets:
- Settings
- Events
- Missions
- Daily Rewards
- Battle Pass
- Offers

Battle flow:
Lobby -> Level Map / Play -> Loadout -> Battle -> Victory or Defeat -> Next Level / Retry / Home

## Screen behavior
### Lobby
- player badge + progress
- currencies
- settings
- character and equipped weapon preview
- Events/Missions/Daily shortcuts with optional badges
- offer/starter pack widget
- battle pass progress card
- large Play CTA showing current level
- bottom navigation
- subtle idle animation

### Level Map
- chapter title
- scrollable path of levels
- completed/current/locked states
- reward/chest markers
- current level emphasized
- Play Level CTA

### Loadout
- selected unit/weapon/booster tabs
- character preview
- equipment cards
- stats
- change/select controls
- large Battle CTA

### Battle HUD
- pause
- level
- battle progress / opposing sides
- currency/reward feedback if needed
- multipliers/gates/powerup indicators
- keep center gameplay area unobstructed

### Victory / Defeat
- strong result animation
- rewards bound to actual result data
- Victory: Next Level + Home
- Defeat: Retry + Home
- reward count-up animations

### Weapons / Units
- collection/list/grid
- selected item preview
- rarity, level, upgrade progress
- meaningful stats
- upgrade/equip actions
- locked states
- insufficient currency handling

### Shop
- sections/tabs for featured, currencies, offers
- starter/premium packs
- remove ads only if project supports monetization conceptually
- do NOT implement real-money purchase logic unless the project already has a compliant purchase system; UI may remain integration-ready

### Daily Rewards
- day sequence
- claimed/current/locked states
- persistent claim state via existing save/profile system
- large final-day reward

### Missions
- Daily / Weekly / Season tabs
- progress bars
- reward + claim states
- data-driven list

### Battle Pass
- season header
- XP/progress
- Free/Premium tracks
- claimable/locked/claimed states
- Claim All if supported
- premium upsell UI only; real purchase integration only if existing system supports it

### Profile
- player name/id/level/XP
- stats
- achievements entry
- customize entry

### Settings
- music
- SFX
- vibration
- language
- help/privacy where appropriate
- restore purchases only if the platform purchase system exists
- persist settings

### Customization
- tabs for Units / Weapons / Effects
- skins with selected/locked states
- equip action

### Events
- event cards/banner
- countdown
- progress
- missions/challenges
- rewards
- use existing time/event system if available

### Loading
- background art or existing game scene art
- progress indicator if actual loading progress is available; otherwise use a safe indeterminate approach
- short gameplay tip

## Animation requirements
Keep animations short and responsive:
- button press scale
- screen/panel entrance
- tab transitions
- card selection pulse
- progress fill
- currency count-up
- reward pop
- chest reveal
- victory celebration
- subtle Lobby character/weapon idle

Do not add heavy effects that hurt mobile performance.

## Responsiveness
Test at minimum:
- 16:9
- 18:9
- 19.5:9 / 20:9
- devices with safe-area inset/notch
- small phone width

Avoid absolute positioning unless the project's UI system requires it. Prefer anchors/layout groups/flex/grid/constraints appropriate to the technology.

## Implementation order
PHASE 0 — repository audit and plan
PHASE 1 — design tokens, typography, button/card/navigation primitives
PHASE 2 — Lobby + navigation shell
PHASE 3 — Level Map + Loadout
PHASE 4 — Battle HUD + result screens
PHASE 5 — Weapons + Units
PHASE 6 — Missions + Daily Rewards + Battle Pass
PHASE 7 — Shop + Profile + Settings + Customization + Events
PHASE 8 — loading, animations, responsive polish, accessibility/readability, cleanup

At the end of each phase:
1. build/run
2. fix compile/runtime errors
3. verify screen navigation
4. verify data binding
5. verify safe area and common aspect ratios
6. list what changed
7. continue to the next phase unless a genuinely blocking project decision is required

## First action
Start by inspecting the repository. Identify the engine/framework and existing UI architecture. Then output:
1. what you found
2. what files/systems you will reuse
3. which files/components you will create or modify
4. implementation order adapted to this repository

Then begin PHASE 1 and PHASE 2 without waiting for approval unless there is a blocking ambiguity that could damage existing game systems.
