import StellarSdk from 'stellar-sdk'
import { OFFICIAL_HORIZON } from './horizon'

let server = undefined
let url = undefined

export function newServer(url){
  if(url){
    server = undefined
  }else{
    url = OFFICIAL_HORIZON
  }
  console.log(`server api url: ${url}`)
  //StellarSdk.Network.usePublicNetwork();
  if(url.indexOf('test') >= 0){
    StellarSdk.Network.useTestNetwork();
  }else{
    StellarSdk.Network.usePublicNetwork();
  }
  server = new StellarSdk.Server(url)
  return server
}

export function getServer(){
  if(server)return server
  server = new StellarSdk.Server(url||OFFICIAL_HORIZON)
  return server
}

export function setServerUrl(horizon){
  server = undefined
  url = horizon
  server = getServer()
}

export default server
