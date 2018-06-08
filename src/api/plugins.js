// 插件功能

/**
 * 校验指纹验证是否可用
 */
export function isFingerPrintAvailable(){
  return new Promise((resolve,reject)=>{
    if (typeof window.Fingerprint != 'undefined') {
      window.Fingerprint.isAvailable(result=>{
        resolve(result);
      }, message => {
        reject(message);
      })
    }else{
      reject();
    }
  });
}

/**
 * 打开指纹界面
 * @param {String} password 密码，安卓端需要
 */
export function showFingerPrintAuth(password){
  return new Promise((resolve,reject) => {
    window.Fingerprint.show({
      clientId: "FireflyWallet",
      clientSecret: password
    }, ()=>{
      resolve();
    }, err=>{
      reject(err);
    })
  })
}