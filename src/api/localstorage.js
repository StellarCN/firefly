// 使用localstorage保存数据，如果是浏览器环境下
var Promise = require('es6-promise').Promise
var Base64 = require('js-base64').Base64
// delete file
export function deleteFile(file){
  return new Promise((resolve,reject)=>{
    try{
      localStorage.removeItem(file)
      resolve()
    }catch(err){
      reject(err)
    }
  });
}

// read file into string
export function readFile(key){
  return new Promise((resolve,reject)=>{
    let value = localStorage.getItem(key)
    if(value){
      try{
        value = Base64.decode(value)
        resolve(value)
      }catch(err){
        reject(err)
      }
    }else{
      reject('Error.NoData')
    }
  });
}

// save file content
export function saveFile(key,value){
  return new Promise((resolve,reject)=>{
    try{
      if(typeof value === 'object'){
        value = JSON.stringify(value)
      }
      value = Base64.encode(value)
      localStorage.setItem(key,value)
      resolve()
    }catch(err){
      reject(err)
    }
  });
}
