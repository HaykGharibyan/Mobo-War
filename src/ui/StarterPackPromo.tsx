import { useEffect, useState } from 'react';
import promoArt from '../assets/starter-pack-premium-art-v3.png';
import { ensureStarterOfferStarted, readStarterOffer } from '../services/StarterOfferService';
import { AnalyticsService } from '../services/AnalyticsService';
import { getPlayerSkinArt, type PlayerKind } from '../game/battle/PlayerSkinAssets';
import './starter-pack-promo.css';

function formatCountdown(milliseconds:number){
  const total=Math.max(0,Math.floor(milliseconds/1000));
  const hours=Math.floor(total/3600).toString().padStart(2,'0');
  const minutes=Math.floor(total%3600/60).toString().padStart(2,'0');
  const seconds=(total%60).toString().padStart(2,'0');
  return `${hours}:${minutes}:${seconds}`;
}

type Props={onPurchase?:()=>void;compact?:boolean;className?:string;remainingMs?:number;ctaLabel?:string};
const starterSkinArts:PlayerKind[]=['basic','runner','tank'];

export function StarterPackPromo({onPurchase,compact=false,className='',remainingMs,ctaLabel}:Props){
  // Royal Starter Pack is the only promo offer. It repeats every 24 hours;
  // The removed full-price fallback must never be rendered.
  const limited=true;
  const [remaining,setRemaining]=useState(()=>remainingMs??readStarterOffer().remainingMs);
  const expired=remaining<=0;
  useEffect(()=>{
    ensureStarterOfferStarted();
    if(remainingMs!==undefined){
      setRemaining(Math.max(0,remainingMs));
      return;
    }
    const update=()=>setRemaining(readStarterOffer().remainingMs);
    update();
    const timer=window.setInterval(update,1000);
    return()=>window.clearInterval(timer);
  },[remainingMs]);
  const shopPromo=remainingMs!==undefined&&!className.includes('starter-offer-modal-card');
  useEffect(()=>{if(shopPromo)AnalyticsService.trackPromoView('shop',Math.max(0,Math.floor((remainingMs||0)/1000)))},[shopPromo,remainingMs]);
  const purchase=()=>{if(shopPromo){const seconds=Math.max(0,Math.floor((remainingMs||0)/1000));AnalyticsService.trackPromoClick('shop',seconds);AnalyticsService.trackPromoPurchaseStarted('shop',seconds)}onPurchase?.()};
  const buttonLabel=ctaLabel??'BUY NOW · $2.99';
  return <article className={`starter-promo ${compact?'starter-promo-compact ':''}${className}`} aria-label="Royal Starter Pack">
    <img className="starter-promo-art" src={promoArt} alt="Premium black-gold starter pack artwork"/>
    <div className="starter-promo-art-overlay">
      <div className="starter-promo-topline"><span>{limited?'LIMITED 24H OFFER':'SPECIAL PROMO OFFER'}</span><b>SAVE 80%</b></div>
      <div className="starter-promo-heading"><small>ROYAL SUPPLY DROP</small><h3>ROYAL STARTER PACK</h3><p>Forge your first legend in style.</p></div>
      <div className="starter-promo-skin-copy"><span>EXCLUSIVE</span><b>BLACK-GOLD SKIN</b><small>+40% POWER · +40% HP</small></div>
      <div className="starter-promo-skin-row" aria-label="Three exclusive black-gold skins"><small>3 EXCLUSIVE SKINS</small><div>{starterSkinArts.map(kind=><img key={kind} src={getPlayerSkinArt(kind,'blackgold','front')} alt=""/>)}</div></div>
      <div className="starter-promo-art-reward starter-promo-art-coins"><strong>50,000</strong><small>COINS</small></div>
      <div className="starter-promo-art-reward starter-promo-art-gems"><strong>200</strong><small>GEMS</small></div>
      <div className="starter-promo-art-reward starter-promo-art-boosts"><strong>5</strong><small>BOOSTS</small></div>
      <div className="starter-promo-footer">
        <div className="starter-promo-timer"><small>OFFER ENDS IN</small><strong>{expired?'00:00:00':formatCountdown(remaining)}</strong></div>
        <div className="starter-promo-price"><strong>$2.99</strong></div>
      </div>
      <button className="starter-promo-cta" type="button" disabled={!onPurchase} onClick={purchase}>{buttonLabel}</button>
    </div>
  </article>;
}
