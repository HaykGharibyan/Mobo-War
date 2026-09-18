export type PaidProductId=
  | 'shop-mixed-small'
  | 'shop-mixed-medium'
  | 'shop-mixed-large'
  | 'shop-gems-small'
  | 'shop-gems-medium'
  | 'shop-gems-large'
  | 'shop-coins-small'
  | 'shop-coins-medium'
  | 'shop-coins-large'
  | 'shop-daily-small'
  | 'shop-daily-medium'
  | 'shop-remove-ads'
  | 'starter-royal-pack'
  | 'shop-royal-pack'
  | 'battle-pass-premium';

export type StoreProduct={
  id:PaidProductId;
  priceUsd:number;
  title:string;
  fulfillment:'level-scaled-mixed'|'level-scaled-gems'|'level-scaled-coins'|'level-scaled-daily'|'remove-ads'|'starter-pack'|'battle-pass-premium';
};

export const STORE_PRODUCTS:Record<PaidProductId,StoreProduct>={
  'shop-mixed-small':{id:'shop-mixed-small',priceUsd:.99,title:'Small Supply',fulfillment:'level-scaled-mixed'},
  'shop-mixed-medium':{id:'shop-mixed-medium',priceUsd:1.99,title:'Commander Pack',fulfillment:'level-scaled-mixed'},
  'shop-mixed-large':{id:'shop-mixed-large',priceUsd:5.99,title:'War Chest',fulfillment:'level-scaled-mixed'},
  'shop-gems-small':{id:'shop-gems-small',priceUsd:.99,title:'Gem Pouch',fulfillment:'level-scaled-gems'},
  'shop-gems-medium':{id:'shop-gems-medium',priceUsd:1.99,title:'Gem Cache',fulfillment:'level-scaled-gems'},
  'shop-gems-large':{id:'shop-gems-large',priceUsd:4.99,title:'Gem Vault',fulfillment:'level-scaled-gems'},
  'shop-coins-small':{id:'shop-coins-small',priceUsd:.99,title:'Coin Stack',fulfillment:'level-scaled-coins'},
  'shop-coins-medium':{id:'shop-coins-medium',priceUsd:4.99,title:'Coin Crate',fulfillment:'level-scaled-coins'},
  'shop-coins-large':{id:'shop-coins-large',priceUsd:9.99,title:'Coin Fortune',fulfillment:'level-scaled-coins'},
  'shop-daily-small':{id:'shop-daily-small',priceUsd:.99,title:'Daily Deal',fulfillment:'level-scaled-daily'},
  'shop-daily-medium':{id:'shop-daily-medium',priceUsd:4.99,title:'Commander Deal',fulfillment:'level-scaled-daily'},
  'shop-remove-ads':{id:'shop-remove-ads',priceUsd:2.99,title:'Remove Ads',fulfillment:'remove-ads'},
  'starter-royal-pack':{id:'starter-royal-pack',priceUsd:2.99,title:'Royal Starter Pack',fulfillment:'starter-pack'},
  'shop-royal-pack':{id:'shop-royal-pack',priceUsd:14.99,title:'Black Gold Set',fulfillment:'starter-pack'},
  'battle-pass-premium':{id:'battle-pass-premium',priceUsd:6.99,title:'Premium Battle Pass',fulfillment:'battle-pass-premium'}
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
