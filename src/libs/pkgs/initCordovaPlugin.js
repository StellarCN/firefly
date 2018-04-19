// 初始化cordova的部分插件

export default () => {
  cordova.plugins.instabug.activate({
      ios: "69bc6b04088f680fbc922088f565c0a1"
    },"shake",{
      commentRequired: true,
      colorTheme: "dark"
    },()=> {
      console.log("Instabug initialized.");
    },error => {
      console.log("Instabug could not be initialized - " + error);
    }
  );
}
