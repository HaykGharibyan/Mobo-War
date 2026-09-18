export type AdType='REWARDED'|'INTERSTITIAL'; export interface AdProvider{show(type:AdType):Promise<boolean>}
// Until a native AdMob provider is connected, never grant an ad-gated reward.
// This keeps x2 rewards and revive flows honest in the Android build.
export const MockAdProvider:AdProvider={show:async(type)=>{console.info(`[ads] ${type} unavailable: native provider not connected`);return false}};
export const AdService={provider:MockAdProvider,async showRewarded(){return this.provider.show('REWARDED')},async showInterstitial(){return this.provider.show('INTERSTITIAL')}};
