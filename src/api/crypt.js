// use sjcl encrypt and decrypt 
var sjcl = require('sjcl')

export function encrypt(password,data){
  return sjcl.encrypt(password,data)
}

export function decrypt(password,crypttext){
  return sjcl.decrypt(password,crypttext)
}

export default { encrypt, decrypt }