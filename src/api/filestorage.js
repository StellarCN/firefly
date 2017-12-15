// file storage
var Promise = require('es6-promise').Promise
var Base64 = require('js-base64').Base64

export const FILE_STORAGE_DIR = 'stellar'


export function initFileStorage(){
  return new Promise((resolve,reject) => {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fs=>{
      if (!cordova.file) {
        return reject('Could not write on device storage');
      }
      fs.root.getDirectory(FILE_STORAGE_DIR,{create: true}, dir=>{
        resolve({fs,dir})
      },err=>{
        console.error('-----------create dir error')
        console.error(err)
        reject(err)
      })
    }, err=>{
      console.error('get fs error')
      console.error(err)
      reject(err);
    });
  });
}



// delete file
export function deleteFile(file){
  return initFileStorage().then(({fs,dir})=>{
    return new Promise((resolve,reject)=>{
      dir.getFile(file,{create:false},fileEntry=>{
        fileEntry.remove(()=>{
          resolve()
        })
      },error=>{
        reject(error)
      })
    });
  });
}

// read file into string
export function readFile(file){
  return initFileStorage().then(({fs,dir})=>{
    return new Promise((resolve,reject)=>{
      dir.getFile(file,{ create: true, exclusive: false }, fileEntry=>{
        fileEntry.file(file=>{
          let reader = new FileReader()
          reader.onloadend = (e)=>{
            let result = e.target.result
            result = Base64.decode(result)
            resolve(result)
          }
          reader.onerror = reject
          reader.readAsText(file)
        },error=>{
          reject(error)
        })
      },error=>{
        console.log(error)
        reject(error)
      })
    });
  });
}

// save file content
export function saveFile(file,value){
  return initFileStorage().then(({fs,dir})=>{
    console.log('save -- file -- ')
    console.log(dir)
    console.log(file)
    return new Promise((resolve,reject)=>{
      dir.getFile(file, {create: true, exclusive: true},
        fileEntry => {
          fileEntry.createWriter(fileWriter=>{
            fileWriter.onwriteend = e => {
              resolve(e)
            }
            fileWriter.onerror = reject
            if(typeof value === 'object'){
              value = JSON.stringify(value)
            }
            console.log('file write ok')
            console.log(file)
            console.log(value)
            //做base64处理
            value = Base64.encode(value)
            fileWriter.write(value)
          },error=>{
            console.error('file write error')
            console.error(error)
            reject(error)
          });//end of fileEntry.createWriter
        },
        error => {
          console.error('get file error')
          console.log(dir)
          console.log(file)
          console.log(value)
          console.error(error)
          reject(error)
        })//end of dir.getFile 
    });
  })
}
