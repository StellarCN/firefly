import StellarSdk from 'stellar-sdk'
import { getServer } from './server'


// get transaction page 
function transactionsPage(address,order='desc',limit=200){
  return getServer().transactions().forAccount(address).order(order).limit(limit).call();
}

export {
  transactionsPage
}