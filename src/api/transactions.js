import StellarSdk from 'stellar-sdk'
import { getServer } from './server'


// get transaction page
function transactionsPage(address,order='desc',limit=200){
  return getServer().transactions().forAccount(address).order(order).limit(limit).call();
}

function transactionDetail(transactionId) {
  return getServer().transactions().transaction(transactionId).call()
}
export {
  transactionsPage,
  transactionDetail,
}

export function transactionOperations(hash,limit=200){
  return getServer().operations().forTransaction(hash).limit(limit).call();
}