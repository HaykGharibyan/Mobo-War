import { useEffect, useState } from 'react';
import promoArt from '../assets/starter-pack-premium-art-v2.webp';
import { ensureStarterOfferStarted, readStarterOffer } from '../services/StarterOfferService';
import { AnalyticsService } from '../services/AnalyticsService';
import './starter-pack-promo.css';

function formatCountdown(milliseconds:number){
  const total=Math.max(0,Math.floor(milliseconds/1000));
  const hours=Math.floor(total/3600).toString().padStart(2,'0');
  const minutes=Math.floor(total%3600/60).toString().padStart(2,'0');
  const seconds=(total%60).toString().padStart(2,'0');
  return `${hours}:${minutes}:${seconds}`;
}

type Props={onPurchase?:()=>void;compact?:boolean;className?:string;remainingMs?:number;ctaLabel?:string;variant?:'limited'|'standard'};

export function StarterPackPromo({onPurchase,compact=false,className='',remainingMs,ctaLabel,variant='limited'}:Props){
  const limited=variant==='limited';
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
  const shopPromo=limited&&remainingMs!==undefined&&!className.includes('starter-offer-modal-card');
  useEffect(()=>{if(shopPromo)AnalyticsService.trackPromoView('shop',Math.max(0,Math.floor((remainingMs||0)/1000)))},[shopPromo,remainingMs]);
  const purchase=()=>{if(shopPromo){const seconds=Math.max(0,Math.floor((remainingMs||0)/1000));AnalyticsService.trackPromoClick('shop',seconds);AnalyticsService.trackPromoPurchaseStarted('shop',seconds)}onPurchase?.()};
  const buttonLabel=ctaLabel??(limited?'GET THE PACK':'BUY NOW · $14.99');
  return <article className={`starter-promo ${compact?'starter-promo-compact ':''}${limited?'':' starter-promo-standard '}${className}`} aria-label={limited?'Royal Starter Pack':'Black Gold Set'}>
    <img className="starter-promo-art" src={promoArt} alt="Premium black-gold starter pack artwork"/>
    <div className="starter-promo-art-overlay">
      <div className="starter-promo-topline"><span>{limited?'LIMITED 24H OFFER':'PREMIUM COMMANDER SET'}</span><b>{limited?'SAVE 80%':'EXCLUSIVE'}</b></div>
      <div className="starter-promo-heading"><small>{limited?'ROYAL SUPPLY DROP':'BLACK-GOLD ARMORY'}</small><h3>{limited?'SPECIAL STARTER PACK':'BLACK GOLD SET'}</h3><p>{limited?'Forge your first legend in style.':'Own the ultimate commander loadout.'}</p></div>
      <div className="starter-promo-skin-copy"><span>EXCLUSIVE</span><b>BLACK-GOLD SKIN</b><small>+40% POWER · +40% HP</small></div>
      <div className="starter-promo-art-reward starter-promo-art-coins"><strong>50,000</strong><small>COINS</small></div>
      <div className="starter-promo-art-reward starter-promo-art-gems"><strong>200</strong><small>GEMS</small></div>
      <div className="starter-promo-art-reward starter-promo-art-boosts"><strong>5</strong><small>BOOSTS</small></div>
      <div className="starter-promo-footer">
        {limited?<div className="starter-promo-timer"><small>OFFER ENDS IN</small><strong>{expired?'00:00:00':formatCountdown(remaining)}</strong></div>:<div className="starter-promo-standard-note"><small>PERMANENT PREMIUM SET</small><strong>50K COINS · 200 GEMS · 5 BOOSTS</strong></div>}
        <div className="starter-promo-price">{limited&&<del>$14.95</del>}<strong>{limited?'$2.99':'$14.99'}</strong></div>
      </div>
      <button className="starter-promo-cta" type="button" disabled={(limited&&expired)||!onPurchase} onClick={purchase}>{limited&&expired?'OFFER EXPIRED':buttonLabel}</button>
    </div>
  </article>;
}
