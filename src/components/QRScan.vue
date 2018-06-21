/**
 * 二维码扫
 * 需要两个事件，
 * finish(result)
 * close()
 */
<template>
  <div class="qrscanner">
    <div class="qrscanner-area"></div>
    <div class="qrscanner-btn-group">
      <!--关闭闪光灯-->
      <span class="qrscanner-btn" @click="closeFlashLight" v-if="isFlashLightOn"><i class="material-icons">&#xE3E6;</i></span>
      <!--打开闪光灯-->
      <span class="qrscanner-btn" @click="openFlashLight" v-else><i class="material-icons">&#xE3E7;</i></span>
      <!--切换摄像头-->
      <span class="qrscanner-btn" @click="switchCamera"><i class="material-icons">&#xE41E;</i></span>
    </div>
  </div>
</template>

<script>
const HIDE_CLASSNAME = 'bg-hide'
export default {
  data(){
    return {
      isFlashLightOn: false,
      isBackCamera: true,
      isQRScannerPrepared: false,
      qrInterval: undefined
    }
  },
  props:{
    validator:{
      type: Function,
      required: true
    }
  },
  beforeCreate(){
    this.qrInterval = setInterval(this.prepareQRScanner, 60000)
    
  },
  mounted(){
    QRScanner.scan((err,result)=>{
      console.log('----qr scanner --- ')
      console.log(err)
      console.log(result)
      if(err){
        if(err.code != 6){
          // 关闭时不显示错误提示
          this.$toasted.error(err._message)
        }
        this.closeQRScanner()
      }else{
        if(!this.validator(result)){
          this.$toasted.error(this.$t('ERROR.SCANNER_CONTENT_VALIDATE'));
          this.closeQRScanner()
        }else{
          // 成功
          QRScanner.destroy(function(status){
            console.log('cancelScan qrscanner')
          })
          this.$emit('finish',result)
        }
      } 
    })

    var body = window.document.querySelector('body')
    this.addClass(body,HIDE_CLASSNAME)
    var app = window.document.querySelector('.app')
    this.addClass(app,HIDE_CLASSNAME)
    var page = window.document.querySelector('.page')
    this.addClass(page,HIDE_CLASSNAME)
    //var loading = window.document.querySelector('.loading')
    //this.addClass(loading,'hide')
    QRScanner.show()
  },
  beforeDestroy(){
    console.log('before destroy-----')
    if(this.qrInterval){
      clearInterval(this.qrInterval)
    }
    //window.document.querySelector('.app').classList.remove('hide');
    var body = window.document.querySelector('body')
    this.removeClass(body,HIDE_CLASSNAME)
    var app = window.document.querySelector('.app')
    this.removeClass(app,HIDE_CLASSNAME)
    var page = window.document.querySelector('.page')
    this.removeClass(page,HIDE_CLASSNAME)
    //var loading = window.document.querySelector('.loading')
    //this.removeClass(loading,'hide')
    QRScanner.destroy(function(status){
      console.log(status)
    })
  },
  methods:{
    prepareQRScanner(){
      console.log('----------prepare qrscanner--------')
      if(this.isQRScannerPrepared)return
        QRScanner.prepare((err,status)=>{
          if (err) {
            console.error(err)
            this.$toasted.show(this.$t('ERROR.SCANNER_PREPARE_FAIL'))
            return
          }
          if (status.authorized) {
            this.isQRScannerPrepared = true
          } else if (status.denied) {
            this.$toasted.error(this.$t('ERROR.SCANNER_PERMISSTION_DENIED'))
            this.isQRScannerPrepared = false
          } else {
            this.isQRScannerPrepared = false
          }
        })
    },
    closeQRScanner(){
      QRScanner.destroy(function(status){
        console.log('destory qrscanner :' + status)
      })
      this.$emit('close')
    },
    openFlashLight(){
      this.isFlashLightOn = !this.isFlashLightOn
      QRScanner.enableLight()
    },
    closeFlashLight(){
      this.isFlashLightOn = !this.isFlashLightOn
      QRScanner.disableLight()
    },
    switchCamera(){
      if(this.isBackCamera){
        QRScanner.useFrontCamera()
      }else{
        QRScanner.useBackCamera()
      }
      this.isBackCamera = !this.isBackCamera
    },
    hasClass(ele, cls) {
      if(ele){
        return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
      }
      return false
    },
    //为指定的dom元素添加样式
    addClass(ele, cls) {
      if(!ele)return
      if (!this.hasClass(ele, cls)) ele.className += " " + cls;
    },
    //删除指定dom元素的样式
    removeClass(ele, cls) {
      if (this.hasClass(ele, cls)) {
          var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
          ele.className = ele.className.replace(reg, " ");
      }
    },
    //如果存在(不存在)，就删除(添加)一个样式
    toggleClass(ele,cls){ 
      if(this.hasClass(ele,cls)){ 
          this.removeClass(ele, cls); 
      }else{ 
          this.addClass(ele, cls); 
      } 
    }
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.qrscanner
  background: none
  background-color:transparent
  position: fixed
  top: 48px
  top: calc(48px + constant(safe-area-inset-top))
  top: calc(48px + env(safe-area-inset-top))
  bottom: 0
  // bottom: constant(safe-area-inset-bottom)
  // bottom: env(safe-area-inset-bottom)
  left: 0
  right: 0
  .qrscanner-area
    width: 100%!important
    height: 85%!important
    background: url(../assets/img/scanner.svg) no-repeat center center!important
    background-size: 50%!important
    background-color:transparent!important

  .qrscanner-btn-group
    text-align: center!important
    background: none!important
    .qrscanner-btn
      padding: 12px 5px
      display: inline-block!important
      text-align: center
      vertical-align: middle
      justify-content: center;
      color: $primarycolor.font
      width: 56px
      height: 56px
      line-height: 56px
      border-radius: 56px
      background-color: $primarycolor.gray
      .material-icons
        font-size: 32px

</style>
