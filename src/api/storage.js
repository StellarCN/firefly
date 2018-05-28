/**
 * storage use file
 */
import {encrypt,decrypt} from './crypt'
var Promise = require('es6-promise').Promise
//import * as fileStorage from './filestorage'
import * as localstorage from './localstorage'
import * as sqlstorage from './sqlstorage'
import { newServer } from './server'
import { OFFICIAL_HORIZON,FCHAIN_HORIZON } from './horizon'

export const FILENAME_ACCOUNTS = 'accounts.firefly'
export const FILENAME_LOCK = 'lock.firefly'
export const FILENAME_APP_SETTING = 'appsetting.firefly'
export const FILENAME_MESSAGE = 'msg.firefly'
export const FILENAME_MESSAGE_READ = 'read_msg.firefly'
export const FILENAME_TRADEPAIR = 'tradepair.firefly'

const LOCK_KEY = 'ilovefirefly'


export function initStorage(){
  if(!isbrowser){
    return sqlstorage.initDB()
  }
  return new Promise((resolve,reject)=>{
    resolve()
  })
}

export function checkPlatform(){
  isbrowser = cordova.platformId === 'browser'
  console.log(isbrowser+",isbrowser")
}

let isbrowser = true

// read account
export function readAccounts(){
  let read = undefined
  if(isbrowser){
    read = localstorage.readFile(FILENAME_ACCOUNTS);
  }else{
    read = sqlstorage.readFile(FILENAME_ACCOUNTS)
  }

  return read.then(result=>{
    return new Promise((resolve,reject)=>{
      if(result){
        try{
          resolve(JSON.parse(result))
        }catch(err){
          reject(err._message)
        }
      }else{
        reject('Error.NoData')
      }
    })
  })
}

/**
 * 新增账户
 * 合并saveAccounts和readyAccountData
 */
export function createAccount(accounts, address,value,password){
  return saveAccounts(accounts).then(data=>{
    return saveAccountData(address,value,password)
  })
}

// write accounts
export function saveAccounts(accounts){
  if(isbrowser){
    return localstorage.saveFile(FILENAME_ACCOUNTS, accounts);
  }else{
    return sqlstorage.saveFile(FILENAME_ACCOUNTS, accounts);
  }
}

// read account data
export function readAccountData(address,password){
  return readByEncrypt(address+'.firefly',password)
}

// save account data
export function saveAccountData(address,value,password){
  return saveByEncrypt(address+'.firefly',value,password)
}

// save app setting
export function saveAppSetting(setting){
 return saveByEncrypt(FILENAME_APP_SETTING,setting)
      .then(()=>{
        //重新设置server
        return new Promise((resolve,reject)=>{
          try{
            newServer(setting.horizon || FCHAIN_HORIZON)
            resolve()
          }catch(err){
            reject(err)
          }
        })
      })
}

// read app setting
export function readAppSetting(){
  return readByEncrypt(FILENAME_APP_SETTING)
    .then((settings)=>{
      //重新设置server
      return new Promise((resolve,reject)=>{
        try{
          newServer(settings.horizon || FCHAIN_HORIZON)
          resolve(settings)
        }catch(err){
          reject(err)
        }
      })
    })
}

//交易对数据，单独保存
export function saveTradePairData(value){
  return saveByEncrypt(FILENAME_TRADEPAIR,value);
}
export function readTradePairData(){
  return readByEncrypt(FILENAME_TRADEPAIR)
}


export function readByEncrypt(file,password = LOCK_KEY){
  let read = undefined
  if(isbrowser){
    read = localstorage.readFile(file);
  }else{
    read = sqlstorage.readFile(file)
  }
  return read.then(value=>{
    console.log('read value')
    console.log(value)
    return new Promise((resolve,reject)=>{
      if(value){
        try{
          value = decrypt(password, value)
          value = JSON.parse(value)
          console.log('---password read ok')
          console.log(value)
          resolve(value)
        }catch(err){
          console.log(err)
          reject('Error.PasswordWrong')
        }
      }else{
        reject('Error.ValueIsNull')
      }
    });
  });
}

export function saveByEncrypt(file,value,password = LOCK_KEY){
  value = JSON.stringify(value)
  value = encrypt(password, value)
  if(isbrowser){
    return localstorage.saveFile(file,value)
  }else{
    localstorage.saveFile(file,value)
    return sqlstorage.saveFile(file,value)
  }
}

export function deleteAccountData(address){
  let file = address +'.firefly'
  if(isbrowser){
    return localstorage.deleteFile(file)
  }else{
    localstorage.deleteFile(file)
    return sqlstorage.deleteFile(file)
  }
}

//获取现有消息link地址数组
export function getMsgLinks(){
  //直接从localStorage，不是localstorage.js中的
  let data = localStorage.getItem(FILENAME_MESSAGE)
  if(data){
    return JSON.parse(data)//结果为link的数组
  }
  return []//没有数据，返回空值
}

//保存link地址数组
export function setMsgLinks(links = []){
  localStorage.setItem(FILENAME_MESSAGE, JSON.stringify(links))
  //清理掉已经不存在的读取过的id
  let data = getReadMsgs()
  data = data.filter(id=> links.indexOf(id)>-1)
  setReadMsgs(data)
}
//读了某个消息
export function readMsg(link){
  let data = getReadMsgs()
  data = data.filter(id=>id!==link)
  data.push(link)
  setReadMsgs(data)
}

export function setReadMsgs(data=[]){
  localStorage.setItem(FILENAME_MESSAGE_READ,JSON.stringify(data))
}

export function getReadMsgs(){
  let data = localStorage.getItem(FILENAME_MESSAGE_READ)
  if(data){
    return JSON.parse(data)
  }else{
    return []
  }
}