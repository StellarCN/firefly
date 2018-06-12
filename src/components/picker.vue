<template>
  <transition name="picker-fade">
    <div class="picker" v-show="state===1" @touchmove.prevent @click="cancel">
      <transition name="picker-move">
        <div class="picker-panel" v-show="state===1" @click.stop>

          <div class="picker-content">
            <div class="mask-top border-bottom-1px"></div>
            <div class="mask-bottom border-top-1px"></div>
            <div class="wheel-wrapper" ref="wheelWrapper">
              <div class="wheel">
                <ul class="wheel-scroll">
                  <li v-for="item in data" :key='item.value' class="wheel-item">
                        <small>{{item.text.host}}</small>
                        {{item.text.code}}
                  </li>
                </ul>
              </div>
              <div class="match"><v-icon dark color=primary>swap_horiz</v-icon></div>
              <div class="wheel">
                <ul class="wheel-scroll">
                  <li v-for="item in data" :key='item.value' class="wheel-item">
                        {{item.text.code}}
                        <small>{{item.text.host}}</small>
                </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="picker-footer"></div>
          <div class="picker-choose border-bottom-1px d-flex">
            <v-spacer></v-spacer>
            <v-btn flat  color='primary' @click="cancel">{{cancelTxt}}</v-btn>
            <v-spacer></v-spacer>
            <v-btn flat  color='primary' @click="confirm">{{confirmTxt}}</v-btn>
            <v-spacer></v-spacer>
            <!-- <span class="cancel" @click="cancel">{{cancelTxt}}</span>
            <span class="confirm" @click="confirm">{{confirmTxt}}</span> -->
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  const STATE_HIDE = 0
  const STATE_SHOW = 1

  const COMPONENT_NAME = 'picker'
  const EVENT_SELECT = 'select'
  const EVENT_VALUE_CHANGE = 'valuechange'
  const EVENT_CANCEL = 'cancel'
  const EVENT_CHANGE = 'change'

  export default {
    name: COMPONENT_NAME,
    props: {
      data: {
        type: Array,
        default() {
          return []
        }
      },
      title: {
        type: String
      },
      cancelTxt: {
        type: String,
        default: 'cancel'
      },
      confirmTxt: {
        type: String,
        default: 'confirm'
      },
      selectedIndex: {
        type: Array,
        default() {
          return []
        }
      },
      value: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        state: STATE_HIDE,
        pickerData: [ this.data, this.data] ,
        pickerSelectedIndex: this.selectedIndex,
        pickerSelectedVal: [],
        pickerSelectedText: [],
      }
    },
    created() {
      if (!this.pickerSelectedIndex.length) {
        this.pickerSelectedIndex = []
        for (let i = 0; i < this.pickerData.length; i++) {
          this.pickerSelectedIndex[i] = 1
        }
      }
    },
    computed: {
        wheelWrapper() {
            return this.$refs.wheelWrapper
        }
    },
    methods: {
      confirm() {
        if (!this._canConfirm()) {
          return
        }
        this.hide()

        let changed = false
        for (let i = 0; i < this.pickerData.length; i++) {
          let index = this.wheels[i].getSelectedIndex()
          this.pickerSelectedIndex[i] = index

          let value = null
          if (this.pickerData[i].length) {
            value = this.pickerData[i][index].value
          }
          if (this.pickerSelectedVal[i] !== value) {
            changed = true
          }
          this.pickerSelectedText[i] = this.pickerData[i][index].text
        }

        this.$emit(EVENT_SELECT, this.pickerSelectedIndex)

        if (changed) {
          this.$emit(EVENT_VALUE_CHANGE,  this.pickerSelectedIndex)
        }
      },
      cancel() {
        this.hide()
        this.$emit(EVENT_CANCEL)
      },
      show() {
        if (this.state === STATE_SHOW) {
          return
        }
        this.state = STATE_SHOW

        if (!this.wheels || this.dirty) {
          this.$nextTick(() => {
            this.wheels = []
            //let wheelWrapper = this.$refs.wheelWrapper

            for (let i = 0; i < this.pickerData.length; i++) {
              this._createWheel(this.wheelWrapper, i)
            }
            this.dirty = false
          })
        } else {
          for (let i = 0; i < this.pickerData.length; i++) {
            this.wheels[i].enable()
            this.wheels[i].wheelTo(this.pickerSelectedIndex[i])
          }
        }
        
        // console.log(this.wheels)
        // // if(!this.wheels){
        // //     this.refresh()
        // // }
        // // this.refresh()
        // for ( wheel in this.wheels){
        //     wheel.enable()
        // }
      },
      hide() {
        this.state = STATE_HIDE

        for (let i = 0; i < this.pickerData.length; i++) {
          this.wheels[i].disable()
        }
      },
      setData(data) {
        this.pickerData = [data, data] 
        this.dirty = true
      },
      setSelectedIndex(index) {
        this.pickerSelectedIndex = index
      },
      refill(datas) {
        let ret = []
        if (!datas.length) {
          return ret
        }
        datas.forEach((data, index) => {
          ret[index] = this.refillColumn(index, data)
        })
        return ret
      },
      refillColumn(index, data) {
        if (this.state !== STATE_SHOW) {
          console.error('can not use refillColumn when picker is not show')
          return
        }
        // const wheelWrapper = this.$refs.wheelWrapper
        let scroll = this.wheelWrapper.querySelectorAll('.wheel')[index].querySelector('.wheel-scroll')
        let wheel = this.wheels[index]
        if (scroll && wheel) {
          let oldData = this.pickerData[index]
          this.$set(this.pickerData, index, data)
          let selectedIndex = wheel.getSelectedIndex()
          let dist = 0
          if (oldData.length) {
            let oldValue = oldData[selectedIndex].value
            for (let i = 0; i < data.length; i++) {
              if (data[i].value === oldValue) {
                dist = i
                break
              }
            }
          }
          this.pickerSelectedIndex[index] = dist
          this.$nextTick(() => {
            // recreate wheel so that the wrapperHeight will be correct.
            wheel = this._createWheel(wheelWrapper, index)
            wheel.wheelTo(dist)
          })
          return dist
        }
      },
      scrollTo(index, dist) {
        const wheel = this.wheels[index]
        this.pickerSelectedIndex[index] = dist
        wheel.wheelTo(dist)
      },
      refresh() {
        setTimeout(() => {
          this.wheels.forEach((wheel, index) => {
            wheel.refresh()
          })
        }, 200)
      },
      _createWheel(wheelWrapper, i) {
        
        if (!this.wheels[i]) {
        //   this.wheels[i] = new BScroll(wheelWrapper.children[i], {
          this.wheels[i] = new BScroll(wheelWrapper.querySelectorAll(".wheel")[i], {
            wheel: {
              selectedIndex: this.pickerSelectedIndex[i],
              /** 默认值就是下面配置的两个，为了展示二者的作用，这里再配置一下 */
              wheelWrapperClass: 'wheel-scroll',
              wheelItemClass: 'wheel-item'
            },
            probeType: 3
          })

          this.wheels[i].on('scrollEnd', () => {
            this.$emit(EVENT_CHANGE, i, this.wheels[i].getSelectedIndex())
          })
        } else {
          this.wheels[i].refresh()
        }

        return this.wheels[i]
      },
      _canConfirm() {
        return this.wheels.every((wheel) => {
          return !wheel.isInTransition
        })
      }
    },
    watch: {
      data(newData) {
        this.setData(newData)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@require '~@/stylus/color.styl'
@import "~@/stylus/mixin.styl"
@import "~@/stylus/variable.styl"

  .picker
    position: fixed
    left: 0
    top: 0
    top: constant(safe-area-inset-top)
    top: env(safe-area-inset-bottom)
    z-index: 100
    width: 100%
    height: 100%
    overflow: hidden
    text-align: center
    font-size: $fontsize-medium
    background-color: $color-mask-bgc
    &.picker-fade-enter, &.picker-fade-leave-active
      opacity: 0
    &.picker-fade-enter-active, &.picker-fade-leave-active
      transition: all .3s ease-in-out
    .picker-panel
      position: absolute
      z-index: 600
      bottom: 0
      width: 100%
      height: 253px
      background: $primarycolor.gray
      &.picker-move-enter, &.picker-move-leave-active
        transform: translate3d(0, 273px, 0)
      &.picker-move-enter-active, &.picker-move-leave-active
        transition: all .3s ease-in-out
      .picker-choose
        position: relative
        height: 60px
        color: $color-light-grey
        .picker-title
          margin: 0
          line-height: 60px
          font-weight: normal
          text-align: center
          font-size: $fontsize-large-x
          color: $color-dark-grey
        .confirm, .cancel
          position: absolute
          top: 6px
          padding: 16px
          font-size: $fontsize-medium
        .confirm
          right: 0
          color: $color-main
          &:active
            color: $color-main-ll
        .cancel
          left: 0
          &:active
            color: $color-active-light-gray-fe
      .picker-content
        position: relative
        top: 20px
        .mask-top, .mask-bottom
          z-index: 10
          width: 100%
          height: 68px
          pointer-events: none
          transform: translateZ(0)
        .mask-top
          position: absolute
          top: 0
          background: linear-gradient(to top, rgba(33, 33, 34, 0.4), rgba(33, 33, 33, 0.8))
          border-bottom: solid 1px $primarycolor.green;
        .mask-bottom
          position: absolute
          bottom: 1px
          background: linear-gradient(to bottom, rgba(33, 33, 34, 0.4), rgba(33, 33, 33, 0.8))
          border-top: solid 1px $primarycolor.green;
      .wheel-wrapper
        display: flex
        padding: 0 16px
        .wheel
          flex-fix()
          height: 173px
          overflow: hidden
          font-size: $fontsize-large-xx
          .wheel-scroll
            padding: 0
            margin-top: 68px
            line-height: 36px
            list-style: none
            display: flex;
            flex-direction: column;
            .wheel-item
              list-style: none
              height: 36px
              overflow: hidden
              display flex
              white-space: nowrap
              font-size 16px
              color: $primarycolor.font
              & > small 
                  margin-left: 0.5em
                  overflow: hidden;
                  display: flex;
                  color: #fffc;
    .picker-footer
      height: 20px


.match
  padding-top: 73px;
  width: 36px;
  .icon
    font-size 28px

.wheel:nth-of-type(1)
  .wheel-scroll
    .wheel-item
      justify-content flex-end
      & > small
        margin-left: 0  !important
        margin-right: 0.5em
.wheel:nth-of-type(2)
  .wheel-scroll
    .wheel-item
      justify-content flex-start
      & > small
        margin-left: 0.5em
</style>
