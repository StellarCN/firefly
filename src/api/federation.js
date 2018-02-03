import StellarSdk from 'stellar-sdk'
var Promise = require('es6-promise').Promise


export function federation(fed_url) {
  return StellarSdk.StellarTomlResolver.resolve(fed_url);
};

export function federationServer (domain) {
  return StellarSdk.FederationServer.createForDomain(domain);
};

export function getFedName (domain, address) {
  return new Promise((resolve,reject) => {
    federationServer(domain).then((server)=>{
      server.resolveAccountId(address).then((data)=>{
        if(data.stellar_address) {
          var index = data.stellar_address.indexOf("*");
          var fed_name = data.stellar_address.substring(0, index);
          resolve(fed_name);
        }
      }).catch(function(err){
        reject(err);
      });
    }).catch(function(err){
      reject(err);
    });
  })
}

//查询过的联邦地址信息
let federations = {

}


/**
 * 根据公网地址查询当前用户的联邦地址
 * @param {*} accountId
 * @return Promise
 */
export function getAddressByAccountId(accountId, domain='fed.network') {
  // 或许可以考虑获取用户的 home_domain 作为这里的 domain
  if(federations[accountId]){
    return new Promise((resolve,reject)=>{
      resolve(federations[accountId])
    })
  }
  return federationServer(domain).then(server => server.resolveAccountId(accountId)
    .then(data=>{
      console.log('---------------- resolve account id ')
      console.log(data)
      return new Promise((resolve,reject)=>{
        resolve(data)
      })
    })
  )
}

/**
 * 根据联邦地址查询公网地址
 * @param {*} address 联邦地址，如  bind*fed.network
 * @return Promise
 */
export function getAccountIdByAddress(address) {
  // 返回的数据格式
  // {
  //   account_id: 'GAUXS***',
  //   stellar_address: 'id*fed.network'
  // }
  return StellarSdk.FederationServer.resolve(address)
    .then(data=>{
      console.log('---------------- resolve address ')
      console.log(data)
      return new Promise((resolve,reject)=>{
        resolve(data)
      })
    })
}

// resolve the given federation address to public address
// @return Promise
// @see https://stellar.github.io/js-stellar-sdk/FederationServer.html#resolve
// @example
// StellarSdk.FederationServer.resolve('bob*stellar.org')
//  .then(federationRecord => {
//    {
//      account_id: 'GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS',
//      memo_type: 'id',
//      memo: 100
//    }
//  });
//
/**
 * 根据联邦地址查询相应的信息，主要用于提现部分
 * @param {*} address  like btc_withdraw*naobtc.com
 */
export function resolveByFedAddress(address){
  return StellarSdk.FederationServer.resolve(address)
}

export function resolveByFedDomain(server,domain,address){
  let  federationServer = new StellarSdk.FederationServer(server,domain,{})
  return federationServer.resolveAddress(address)
}
