// 初始化cordova的部分插件

export default () => {
  QRScanner.prepare((err, status)=>{
    if(err){
      //alert(err.message)
      console.error(err)
      return
    }
    if (status.authorized) {
      console.log(' qrscanner authorized')
      QRScanner.destroy((dstatus)=>{
        console.log(status);
      });
    } else if (status.denied) {
      console.error(' qrscanner denied ')
    } else {
    }
  }); 
}
