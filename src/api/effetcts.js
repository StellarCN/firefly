import StellarSdk from 'stellar-sdk'
import { getServer } from './server'

// fetch effects
// return page
export function fetchEffects(address,order='desc',limit=200){
  return getServer().payments().forAccount(address).order(order).limit(limit).call();
}
