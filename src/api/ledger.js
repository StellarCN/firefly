import StellarSdk from 'stellar-sdk'
import { getServer} from './server'

export function getLedger(ledgerID){
  console.log(`------get ledger s------`)
  let server = getServer()
  if(ledgerID){
    return server.ledgers().ledger(ledgerID).call()
  }else{
    return server.ledgers().limit(1).order('desc').call()
  }
}