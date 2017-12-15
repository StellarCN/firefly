<template>
  <div class="pd-select-item">
    <div class="pd-select-line"></div>
    <div class="pd-select-list">
      <ul class="pd-select-ul" ref="list">
        <li class="pd-select-list-item" v-for="(el,index) in renderData " 
          :class="{'hidden':setHidden(el.index)}" 
          :key="index">{{el.value.code}}</li>
      </ul>
    </div>
    <ul class="pd-select-wheel" ref="wheel">
      <li class="pd-select-wheel-item" 
          :class="{'hidden':setHidden(el.index)}" 
          :style="setWheelItemDeg(el.index)" :index="el.index" 
          v-for="(el,index) in renderData " 
          :key="index">{{el.value.code}}</li>
    </ul>
  </div>
</template>
<script>
  /**
   * Created by k186 on 2017/5/3.
   * gitHub: https://github.com/k186/iosSelect
   */
  /*
   * selectItem components
   *
   * @param value {String} current select value or init value
   * @param listData {Array} loop array value
   * @param type {String} 'cycle' ,default 'line'
   *
   * */
  export default{
    name: 'PickerItem',
    data () {
      return {
        spin: {start: -9, end: 9, branch: 9},
        finger: {startY: 0, lastY: 0, startTime: 0, lastTime: 0, transformY: 0}
      }
    },
    props: {
      listData: {
        type: Array,
        required: true
      },
      type: {
        type: String,
        default: 'line'
      },
      value: {}
    },
    computed: {
      renderData () {
        let temp = []
        for (let k = this.spin.start; k <= this.spin.end; k++) {
          let data = {
            value: this.getSpinData(k),
            index: k
          }
          temp.push(data)
        }
        return temp
      }
    },
    mounted () {
      /* 事件绑定 */
      this.$el.addEventListener('touchstart', this.itemTouchStart)
      this.$el.addEventListener('touchmove', this.itemTouchMove)
      this.$el.addEventListener('touchend', this.itemTouchEnd)
      /* 初始化状态 */
      let index = this.listData.indexOf(this.value)
      if (index === -1) {
        console.warn('当前初始值不存在，请检查后listData范围！！')
        this.setListTransform()
        this.getPickValue(0)
      } else {
        let move = index * 34
        /* 因为往上滑动所以是负 */
        this.setStyle(-move)
        this.setListTransform(-move, -move)
      }
    },
    methods: {
      /* 根据type 控制滚轮显示效果 */
      setHidden (index) {
        if (this.type === 'line') {
          return index < 0 || index > this.listData.length - 1
        } else {
          return false
        }
      },
      setWheelItemDeg (index) {
        return {
          transform: `rotate3d(1, 0, 0, ${-index * 20 % 360}deg) translate3d(0px, 0px, 100px)`
        }
      },
      setWheelDeg (updateDeg, type, time = 1000) {
        
        if (type === 'end') {
          this.$refs.wheel.style.webkitTransition = `transform ${time}ms cubic-bezier(0.19, 1, 0.22, 1)`
          this.$refs.wheel.style.webkitTransform = `rotate3d(1, 0, 0, ${updateDeg}deg)`
        } else {
          this.$refs.wheel.style.webkitTransition = ''
          this.$refs.wheel.style.webkitTransform = `rotate3d(1, 0, 0, ${updateDeg}deg)`
        }
      },
      setListTransform (translateY = 0, marginTop = 0, type, time = 1000) {
        /*
        if (type === 'end') {
          this.$refs.list.style.webkitTransition = `transform ${time}ms cubic-bezier(0.19, 1, 0.22, 1)`
          this.$refs.list.style.webkitTransform = `translateY(${translateY - this.spin.branch * 34}px)`
          this.$refs.list.style.marginTop = `${-marginTop}px`
          this.$refs.list.setAttribute('scroll', translateY)
        } else {
          this.$refs.list.style.webkitTransition = ''
          this.$refs.list.style.webkitTransform = `translateY(${translateY - this.spin.branch * 34}px)`
          this.$refs.list.style.marginTop = `${-marginTop}px`
          this.$refs.list.setAttribute('scroll', translateY)
        }*/
      },
      itemTouchStart (event) {
        let finger = event.changedTouches[0]
        this.finger.startY = finger.pageY
        this.finger.startTime = event.timestamp || Date.now()
        this.finger.transformY = this.$refs.list.getAttribute('scroll')
        event.preventDefault()
      },
      itemTouchMove (event) {
        let finger = event.changedTouches[0]
        this.finger.lastY = finger.pageY
        this.finger.lastTime = event.timestamp || Date.now()
        /* 设置css */
        let move = this.finger.lastY - this.finger.startY
        this.setStyle(move)
        event.preventDefault()
      },
      itemTouchEnd (event) {
        let finger = event.changedTouches[0]
        this.finger.lastY = finger.pageY
        this.finger.lastTime = event.timestamp || Date.now()
        let move = this.finger.lastY - this.finger.startY
        /* 计算速度 */
        /* 速度计算说明
         * 当时间小于300毫秒 最后的移动距离等于 move + 减速运动距离
         * */
        let time = this.finger.lastTime - this.finger.startTime
        let v = move / time
        /* 减速加速度a */
        let a = 1.8
        /* 设置css */
        if (time <= 300) {
          move = v * a * time
          time = 1000 + time * a
          this.setStyle(move, 'end', time)
        } else {
          this.setStyle(move, 'end')
        }
      },
      /* 设置css */
      setStyle (move, type, time) {
        const singleHeight = 34
        const deg = 20
        const singleDeg = deg / singleHeight
        let currentListMove = this.finger.transformY
        let updateMove = move + Number(currentListMove)
        /* 根据滚轮类型 line or cycle 判断 updateMove最大距离 */
        if (this.type === 'line') {
          if (updateMove > 0) {
            updateMove = 0
          }
          if (updateMove < -(this.listData.length - 1) * singleHeight) {
            updateMove = -(this.listData.length - 1) * singleHeight
          }
        }
        let updateDeg = -updateMove * singleDeg
        let spinAim = Math.round(updateDeg / 20)
        let margin = Math.round(updateMove / singleHeight) * singleHeight // 如果不这么写 会导致没有滚动效果
        /* 计算touchEnd移动的整数距离 */
        let endMove = margin
        let endDeg = Math.round(updateDeg / deg) * deg
        if (type === 'end') {
          this.setListTransform(endMove, margin, type, time)
          this.setWheelDeg(endDeg, type, time)
          /* 设置$emit 延迟 */
          setTimeout(() => this.getPickValue(endMove), 1000)
        } else {
          this.setListTransform(updateMove, margin)
          this.setWheelDeg(updateDeg)
        }
        this.updateSpin(spinAim)
      },
      /* 更新spin */
      updateSpin (spinAim) {
        this.spin.start = this.spin.branch * -1 + spinAim
        this.spin.end = this.spin.start + this.spin.branch * 2
      },
      /* 获取spin 数据 */
      getSpinData (index) {
        index = index % this.listData.length
        return this.listData[index >= 0 ? index : index + this.listData.length]
      },
      /* 获取选中值 */
      getPickValue (move) {
        let index = Math.abs(move / 34)
        let pickValue = this.getSpinData(index)
        this.$emit('input', pickValue)
      }
    },
    beforeDestroy () {
      this.$el.removeEventListener('touchstart', this.itemTouchStart)
      this.$el.removeEventListener('touchmove', this.itemTouchMove)
      this.$el.removeEventListener('touchend', this.itemTouchEnd)
    }
  }
</script>
<style lang="stylus" scoped>
@css{
  html{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent;height:100%}body{margin:0;font-size:14px;font-family:PingFang SC,Helvetica Neue,Helvetica,STHeiTi,Arial,sans-serif}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}audio:not([controls]){display:none;height:0}progress{vertical-align:baseline}[hidden],template{display:none}a{background-color:transparent;-webkit-text-decoration-skip:objects;text-decoration:none}a:active,a:hover{outline-width:0}abbr[title]{text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}dfn{font-style:italic}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}img{border-style:none}svg:not(:root){overflow:hidden}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}pre{overflow:auto;white-space:pre;white-space:pre-wrap;word-wrap:break-word}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0;vertical-align:middle}button,input{overflow:visible}button,select{text-transform:none}[type=reset],[type=submit],button,html [type=button]{-webkit-appearance:button}[disabled]{cursor:default}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}textarea{overflow:auto;resize:none;vertical-align:top}optgroup{font-weight:700}button:focus,input:focus,select:focus,textarea:focus{outline:0}input,textarea{-webkit-user-modify:read-write-plaintext-only}input::-ms-clear,input::-ms-reveal{display:none}input:-ms-input-placeholder,textarea:-ms-input-placeholder{color:inherit;opacity:.54}input::-webkit-input-placeholder,textarea::-webkit-input-placeholder{color:inherit;opacity:.54}table{border-collapse:collapse;border-spacing:0}td,th{padding:0}blockquote,figure,form,h1,h2,h3,h4,h5,h6,p{margin:0}dd,dl,li,ol,ul{margin:0;padding:0}ol,ul{list-style:none outside none}h1,h2,h3,h4,h5,h6{font-size:100%;font-weight:400;line-height:2}*{box-sizing:border-box}html{background:#efeff4}html[data-v-14e7ebf9]{font-family:PingFang SC,Helvetica Neue,Helvetica,STHeitiSC-Light,Arial,sans-serif;line-height:1.8}.pd-select-item[data-v-14e7ebf9]{overflow:hidden;width:100%;text-align:center;height:220px;background:#fff;position:relative}.pd-select-ul[data-v-14e7ebf9]{position:relative}.pd-select-line[data-v-14e7ebf9],.pd-select-list[data-v-14e7ebf9],.pd-select-wheel[data-v-14e7ebf9]{position:absolute;left:0;right:0;top:93px}.pd-select-line[data-v-14e7ebf9]{z-index:3}.pd-select-list[data-v-14e7ebf9]{z-index:2;background:#fff}.pd-select-wheel[data-v-14e7ebf9]{z-index:1}.pd-select-line[data-v-14e7ebf9]:after,.pd-select-line[data-v-14e7ebf9]:before{position:absolute;top:0;content:"";display:table;background:#2c97f1;width:100%;height:2px;-webkit-transform:scaleY(.5);transform:scaleY(.5);-webkit-transform-origin:0 0;transform-origin:0 0}.pd-select-line[data-v-14e7ebf9]:before{bottom:-1px;top:auto}.pd-select-line[data-v-14e7ebf9],.pd-select-list[data-v-14e7ebf9]{height:34px;-webkit-transform:translateZ(110px);transform:translateZ(110px)}.pd-select-list[data-v-14e7ebf9]{overflow:hidden}.pd-select-list-item[data-v-14e7ebf9]{text-shadow:0 1px 1px hsla(0,0%,40%,.6)}.pd-select-list-item[data-v-14e7ebf9],.pd-select-wheel-item[data-v-14e7ebf9]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:34px;font-size:18px;color:#333}.pd-select-list-item.hidden[data-v-14e7ebf9],.pd-select-wheel-item.hidden[data-v-14e7ebf9]{visibility:hidden;opacity:0}.pd-select-wheel[data-v-14e7ebf9]{-webkit-transform-style:preserve-3d;transform-style:preserve-3d;height:34px}.pd-select-wheel-item[data-v-14e7ebf9]{-webkit-backface-visibility:hidden;backface-visibility:hidden;position:absolute;top:0;width:100%;color:#a8a8a8}.pd-select-box[data-v-c81dd650]{display:-webkit-box;display:-ms-flexbox;display:flex}
}
</style>