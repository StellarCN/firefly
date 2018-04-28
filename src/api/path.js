import StellarSdk from 'stellar-sdk'
import { getServer }  from './server'
import { getAsset } from './assets'
var Promise = require('es6-promise').Promise

export function pathAssets(source,destination,destinationAsset_code,destinationAsset_issuer,destinationAmount){
  let asset = getAsset(destinationAsset_code, destinationAsset_issuer);
  return new Promise((resolve,reject)=>{
    getServer().paths(source,destination, asset, destinationAmount)
      .call().then(res => {
          let data = res.records.filter(item => item.source_amount !== '0.0000000')
          resolve(data)
        }).catch(err => {
          reject(err)
        })
  })
}

