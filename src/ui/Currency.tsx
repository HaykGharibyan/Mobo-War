import coinArt from '../assets/currency-coin-premium.webp';
import gemArt from '../assets/currency-gem-premium.webp';

export type CurrencyKind='coin'|'gem';

/** Shared raster currency treatment. Never falls back to platform emoji or SVG. */
export function CurrencyIcon({kind,size=22}:{kind:CurrencyKind;size?:number}){
  return <img className="game-currency-icon" src={kind==='coin'?coinArt:gemArt} width={size} height={size} alt={kind==='coin'?'Coins':'Gems'}/>;
}

export function CurrencyValue({kind,value,className=''}:{kind:CurrencyKind;value:string|number;className?:string}){
  return <span className={`game-currency-value ${className}`}><CurrencyIcon kind={kind}/><b>{value}</b></span>;
}
