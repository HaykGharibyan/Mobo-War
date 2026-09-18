import { Capacitor, registerPlugin } from '@capacitor/core';
import type { AnalyticsParams, NativeFirebaseStatus } from './analyticsTypes';

type MoboFirebasePlugin = {
  logEvent(options: { name: string; params?: AnalyticsParams }): Promise<void>;
  setUserProperty(options: { name: string; value: string }): Promise<void>;
  setCustomKey(options: { name: string; value: string | number | boolean }): Promise<void>;
  log(options: { message: string }): Promise<void>;
  recordException(options: { message: string; name?: string }): Promise<void>;
  getStatus(): Promise<NativeFirebaseStatus>;
  testCrash(): Promise<void>;
};

const plugin = registerPlugin<MoboFirebasePlugin>('MoboFirebase');
const isNativeAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

function safeCall(operation: () => Promise<unknown>): void {
  if (!isNativeAndroid()) return;
  void operation().catch(() => undefined);
}

export const NativeFirebase = {
  isNativeAndroid,
  logEvent(name: string, params?: AnalyticsParams) { safeCall(() => plugin.logEvent({ name, params })); },
  setUserProperty(name: string, value: string) { safeCall(() => plugin.setUserProperty({ name, value })); },
  setCustomKey(name: string, value: string | number | boolean) { safeCall(() => plugin.setCustomKey({ name, value })); },
  log(message: string) { safeCall(() => plugin.log({ message })); },
  recordException(message: string, name?: string) { safeCall(() => plugin.recordException({ message, name })); },
  async getStatus(): Promise<NativeFirebaseStatus> {
    if (!isNativeAndroid()) return { available: false, appVersion: 'web', buildNumber: 'web', packageName: 'web', debugBuild: import.meta.env.DEV };
    try { return await plugin.getStatus(); }
    catch { return { available: false, appVersion: 'unknown', buildNumber: 'unknown', packageName: 'unknown', debugBuild: false }; }
  },
  async testCrash(): Promise<void> {
    if (!isNativeAndroid()) return;
    await plugin.testCrash();
  },
};
