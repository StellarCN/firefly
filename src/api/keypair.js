import StellarSdk from 'stellar-sdk'
var Buffer = require('buffer/').Buffer

/**
 * 对数据进行签名，并转为base64
 * @param {*} seed 
 * @param {*} data 
 */
export function signToBase64(seed,data){
  if(data === null || typeof data === 'undefined')throw new Error('sign data is null')
  let val = null
  if(typeof data === 'string'){
    val = data
  }else{
    val = JSON.stringify(data)
  }
  return StellarSdk.Keypair.fromSecret(seed).sign(val).toString('base64')
}

/**
 * 校验base64位的数据，是否为正常的签名
 * @param {String} address 
 * @param {String} data 
 */
export function verifyByBase64(address,data,signature){
  //let buffer = base64ToArrayBuffer(signature)
  buffer = new Buffer(base64ToHex(signature))
  return StellarSdk.Keypair.fromPublicKey(address).verify(data,buffer)
}


function arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}



function base64ToArrayBuffer(base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array( len );
  for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function hexToBase64(str) {
  return btoa(String.fromCharCode.apply(null,
    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
  );
}

// Base64 to Hex
function base64ToHex(str) {
  for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
      let tmp = bin.charCodeAt(i).toString(16);
      if (tmp.length === 1) tmp = "0" + tmp;
      hex[hex.length] = tmp;
  }
  return hex.join("");
}

/**
 * 根据提供的transaction进行签名
 * @param {*} seed 
 * @param {*} tx 
 * @return tx xdr
 */
export function signDecoratedByTx(seed,tx){
  if(tx){
    //得到对象，有hint和sy
    //return StellarSdk.Keypair.fromSecret(seed).signDecorated(tx.hash())
    tx.sign(StellarSdk.Keypair.fromSecret(seed))
    return tx.toEnvelope().toXDR().toString('base64')
  }
  throw new Error('no transaction to sign')
}