// use sjcl encrypt and decrypt 
var sjcl = require('sjcl')
var Base64 = require('js-base64').Base64

export function encrypt(password,data){
  return sjcl.encrypt(password,data)
}

export function decrypt(password,crypttext){
  return sjcl.decrypt(password,crypttext)
}

export function encryptToBase64(password,data){
  return Base64.encode(encrypt(password,data))
}

export function decryptByBase64(password, data){
  return decrypt(password, Base64.decode(data))
}
