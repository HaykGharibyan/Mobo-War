# Mobile build

The game is mobile-first and is prepared for Capacitor. The web build remains the source of truth for React menus and Phaser battle.

```powershell
pnpm build
pnpm cap:add:android
pnpm cap:sync
```

Then open the generated `android/` project in Android Studio. iOS uses the same flow with Xcode on macOS:

```powershell
pnpm cap:add:ios
pnpm cap:sync
```

Native AdMob, IAP, vibration and audio providers can replace the mock service interfaces without changing gameplay screens.

## Android prerequisites

Capacitor 8 and the current Android Gradle Plugin require JDK 21 and an installed Android SDK. Configure Android Studio's bundled JDK as `JAVA_HOME`, then sync and build the `android/` project. The APK locks portrait orientation and uses native immersive fullscreen; Android's back button is routed through the app's screen history.
