import { ADS_CONFIG } from '../game/config/ads';
import { AdService } from './AdService';
export const AdController={canShowInterstitial(removeAds:boolean,battles:number,lastShown:number){return ADS_CONFIG.adsEnabled&&!removeAds&&battles>=ADS_CONFIG.interstitialMinBattles&&Date.now()-lastShown>ADS_CONFIG.interstitialCooldownMs},async showRewarded(kind:'double-reward'|'revive'|'daily'){if(!ADS_CONFIG.reviveRewardEnabled&&kind==='revive')return false;return AdService.showRewarded()}};
