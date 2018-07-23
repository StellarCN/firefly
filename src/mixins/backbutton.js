/**
 * 退出应用mixins
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-30 19:59:57 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-07-20 15:04:24
 * @License: MIT 
 */
export default {
  data(){
    return {
      isBackBtn: true,
      backBtnInterval: null,
    }
  },
  created(){
    this.isBackBtn = true
    console.log('-----------------------------------------------backbutton-----------')
    //document.removeEventListener("backbutton", this.onBackKeyDown, false); 
    document.addEventListener("backbutton", this.onBackKeyDown, false); 
  },
  beforeDestroy(){
    if(this.backBtnInterval){
      clearInterval(this.backBtnInterval)
      lthis.backBtnInterval = null
    }
    if(this.isBackBtn){
      document.removeEventListener("backbutton", this.onBackKeyDown, false);
    }else{
      document.removeEventListener("backbutton", this.exitApp, false); 
    }
  },
  methods: {

    onBackKeyDown() {  
      this.isBackBtn = false
      this.$toasted.show(this.$t('App.ClickOneMoreTimeExit'));  
      document.removeEventListener("backbutton", this.onBackKeyDown, false); // 注销返回键  
      document.addEventListener("backbutton", this.exitApp, false);//绑定退出事件  
      // 3秒后重新注册  
      this.backBtnInterval = setInterval(()=>{
        this.isBackBtn = true
        clearInterval(this.backBtnInterval)
        this.backBtnInterval = null
        document.removeEventListener("backbutton", this.exitApp, false); // 注销返回键  
        document.addEventListener("backbutton", this.onBackKeyDown, false); // 返回键   
      },3000);
    }  ,
    exitApp(){  
        navigator.app.exitApp();  
    }
   

  }
}