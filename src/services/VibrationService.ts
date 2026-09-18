import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

type Pattern = number | number[];

function webVibrate(pattern: Pattern) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
}

function nativeOrWeb(nativeFeedback: () => Promise<void>, fallback: Pattern) {
  if (!Capacitor.isNativePlatform()) {
    webVibrate(fallback);
    return;
  }
  void nativeFeedback().catch(() => webVibrate(fallback));
}

/** Physical feedback for both browser testing and the installed Android APK. */
export const VibrationService = {
  tap(enabled: boolean) {
    if (!enabled) return;
    nativeOrWeb(() => Haptics.impact({ style: ImpactStyle.Light }), 12);
  },
  success(enabled: boolean) {
    if (!enabled) return;
    nativeOrWeb(() => Haptics.notification({ type: NotificationType.Success }), [18, 30, 38]);
  },
  error(enabled: boolean) {
    if (!enabled) return;
    nativeOrWeb(() => Haptics.notification({ type: NotificationType.Error }), [60, 25, 60]);
  },
};
