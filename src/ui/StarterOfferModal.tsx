import { StarterPackPromo } from './StarterPackPromo';
import './starter-offer.css';

type Props = {
  remainingMs: number;
  onClose: () => void;
  onPurchase: () => void;
};

export function StarterOfferModal({ remainingMs, onClose, onPurchase }: Props) {
  return <div className="starter-offer-modal" role="dialog" aria-modal="true" aria-labelledby="starter-offer-title">
    <div className="starter-offer-modal-shell">
      <div id="starter-offer-title" className="starter-offer-modal-eyebrow">WELCOME, COMMANDER</div>
      <StarterPackPromo remainingMs={remainingMs} onPurchase={onPurchase} ctaLabel="BUY NOW · $2.99" className="starter-offer-modal-card" />
      <button className="starter-offer-dismiss" type="button" onClick={onClose}>CLOSE</button>
    </div>
  </div>;
}
