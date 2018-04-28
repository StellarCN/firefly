// 使用sqlite保存数据
var Promise = require('es6-promise').Promise
var Base64 = require('js-base64').Base64

let db = undefined

export const DB_NAME = 'firefly.db'
export const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS firefly (K TEXT PRIMARY KEY NOT NULL,V TEXT)`
/**
 * 初始化数据库
 * @param {string} dbname 数据库名称
 */
export function initDB(dbname){
    return new Promise((resolve,reject)=>{
        try{
            //打开数据库
            db = window.sqlitePlugin.openDatabase({name: dbname || DB_NAME, location: 'default'});
            //创建表
            db.transaction((tx) => {
                tx.executeSql(CREATE_TABLE);
              }, error => {
                console.error('--create table error--')
                console.error(err)
                reject(error)
              }, () => {
              console.log("创建成功")
                resolve(db)
              });
        }catch(err){
          console.error('--create table error2--')
          console.error(err)

            reject(err)
        }
    })
}

function dbPromise(cb){
  if(db){
    return cb()
  }else{
    return initDB().then(()=>{
      return cb()
    })
  }
}

// delete file
export function deleteFile(file){
  return dbPromise(()=>{
    return new Promise((resolve,reject) => {
      db.transaction(tx=>{
        tx.executeSql(`DELETE FROM firefly where K=?`,[file]);
      },error=>{
        reject(error)
      },()=>{
        resolve()
      })
    });
  })
}

// read file into string
export function readFile(key){
  return dbPromise(()=>{
    return new Promise((resolve,reject) => {
      db.transaction(tx=>{
        tx.executeSql(`SELECT V FROM firefly where K=?`,[key],(tr,rs)=>{
          try{
            let value = rs.rows.item(0).V
            value = Base64.decode(value)
            resolve(value)
          }catch(err){
            reject('Error.NoData')
          }
        });
      },error=>{
        reject(error)
      })
    });
  })
}

// save file content
export function saveFile(key,value){
  if(typeof value === 'object'){
    value = JSON.stringify(value)
  }
  value = Base64.encode(value)
  return dbPromise(()=>{
    return new Promise((resolve,reject) => {
      db.transaction(tx=>{
        tx.executeSql(`SELECT V FROM firefly where K=?`,[key],(tr,rs)=>{
          let sql = null
          if(rs.rows.length === 0){
            sql = `INSERT INTO firefly (K,V)values(?,?)`
            tx.executeSql(sql,[key,value],(itr,irs)=>{
              resolve()
            },(tx,err)=>{
              reject(err)
            })
          }else{
            sql = `UPDATE firefly set V=? where K=?`
            tx.executeSql(sql,[value,key],(itr,irs)=>{
              resolve()
            },(tx,err)=>{
              reject(err)
            })
          }
        });//end of executesql
      },error=>{
        reject(error)
      })//end of transaction
    });
  })
}

