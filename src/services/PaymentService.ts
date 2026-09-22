export type PaidProductId=
  | 'com.hayk.mobowar.gems_100'
  | 'com.hayk.mobowar.gems_300'
  | 'com.hayk.mobowar.gems_900'
  | 'com.hayk.mobowar.combo_tier1'
  | 'com.hayk.mobowar.combo_tier2'
  | 'com.hayk.mobowar.combo_tier3'
  | 'com.hayk.mobowar.promo_starter_pack';

export type StoreProduct={
  id:PaidProductId;
  priceUsd:number;
  title:string;
  fulfillment:'level-scaled-mixed'|'level-scaled-gems'|'level-scaled-coins'|'level-scaled-daily'|'remove-ads'|'starter-pack'|'battle-pass-premium';
};

export const STORE_PRODUCTS:Record<PaidProductId,StoreProduct>={
  'com.hayk.mobowar.gems_100':{id:'com.hayk.mobowar.gems_100',priceUsd:.99,title:'Gem Pouch',fulfillment:'level-scaled-gems'},
  'com.hayk.mobowar.gems_300':{id:'com.hayk.mobowar.gems_300',priceUsd:1.99,title:'Gem Cache',fulfillment:'level-scaled-gems'},
  'com.hayk.mobowar.gems_900':{id:'com.hayk.mobowar.gems_900',priceUsd:4.99,title:'Gem Vault',fulfillment:'level-scaled-gems'},
  'com.hayk.mobowar.combo_tier1':{id:'com.hayk.mobowar.combo_tier1',priceUsd:.99,title:'Small Supply',fulfillment:'level-scaled-mixed'},
  'com.hayk.mobowar.combo_tier2':{id:'com.hayk.mobowar.combo_tier2',priceUsd:1.99,title:'Commander Pack',fulfillment:'level-scaled-mixed'},
  'com.hayk.mobowar.combo_tier3':{id:'com.hayk.mobowar.combo_tier3',priceUsd:4.99,title:'War Chest',fulfillment:'level-scaled-mixed'},
  'com.hayk.mobowar.promo_starter_pack':{id:'com.hayk.mobowar.promo_starter_pack',priceUsd:2.99,title:'Royal Starter Pack',fulfillment:'starter-pack'}
};

export type PurchaseResult={status:'not-configured';productId:PaidProductId;transactionId:string};

// The game is ready for a store SDK. Only this adapter needs to be replaced
// when App Store, Google Play, or another payment provider is connected.
export const PaymentService={
  configured:false,
  getProduct(productId:PaidProductId){return STORE_PRODUCTS[productId]},
  requestPurchase(productId:PaidProductId):PurchaseResult{
    const transactionId=`pending-${productId}-${Date.now()}`;
    if(import.meta.env.DEV)console.info('[payment] provider not configured',{productId,transactionId});
    return {status:'not-configured',productId,transactionId};
  }
};
