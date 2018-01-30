/**
 * 退出应用mixins
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-30 19:59:57 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-01-30 20:02:55
 * @License: MIT 
 */
export default {
  data(){
    return {
      intervalID: null,
    }
  },
  mounted(){
    document.removeEventListener("backbutton", this.onBackKeyDown, false); 
    document.addEventListener("backbutton", this.onBackKeyDown, false); 
  },
  beforeDestroy(){
    if(this.intervalID){
      window.clearInterval(this.intervalID);
    }
    document.removeEventListener("backbutton", this.onBackKeyDown, false);
    document.removeEventListener("backbutton", this.exitApp, false); 
  },
  methods: {

    onBackKeyDown() {  
        this.$toasted.show(this.$t('App.ClickOneMoreTimeExit'));  
        document.removeEventListener("backbutton", this.onBackKeyDown, false); // 注销返回键  
        document.addEventListener("backbutton", this.exitApp, false);//绑定退出事件  
        // 3秒后重新注册  
        this.intervalID = window.setInterval(() => {  
            document.removeEventListener("backbutton", this.exitApp, false); // 注销返回键  
            document.addEventListener("backbutton", this.onBackKeyDown, false); // 返回键  
            window.clearInterval(this.intervalID);  
        }, 3000);  
    }  ,
    exitApp(){  
        navigator.app.exitApp();  
    },  
   

  },
}