<style>

@keyframes picker-close {
  0% { transform: translateY(0%) }
  100% { transform: translateY(100%) }
}
@keyframes picker-open {
  0% { transform: translateY(100%) }
  100% { transform: translateY(0) }
}
@keyframes picker-close-backdrop {
  0% { opacity: 1 }
  50% { opacity: 1 }
  100% {opacity: 0 }
}
@keyframes picker-open-backdrop {
  0% { opacity: 0 }
  50% { opacity: 1 }
  100% { opacity: 1 }
}
.picker-enter-active {
  animation: picker-open-backdrop 0.3s ease-out;
}
.picker-enter-active .picker-wrapper {
  animation: picker-open 0.3s ease;
}
.picker-leave-active {
  animation: picker-close-backdrop 0.3s ease-out;
}
.picker-leave-active .picker-wrapper {
  animation: picker-close 0.3s ease;
}
.picker-enter, .picker-leave-active {
  opacity: 0;
}
.picker-top-content, .picker-bottom-content{
  display: flex;
  width: 100%;
  background-color: #fff;
  justify-content: center;
}
.picker-backdrop {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
.picker-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: transparent;
  transform: translate3d(0px, 0px, 0px);
  z-index: 9999;
  padding: 10px 10px
}
.picker-content {
  position: relative;
  width: 100%;
  height: 228px;
  background: #303034;
}
.picker-body {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.picker-item {
  font-size: 20px;
  height: 100%;
  position: relative;
  display: flex;
  flex: 1;
  color:#FFF;
  overflow: hidden;
}
.picker-helper {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.picker-h-w{
  display: flex;
  height: 60px;
  padding-left: 10px;
  padding-right: 10px;
}
.picker-h-l,.picker-h-r{
  flex: 5;
  border-top: 1px solid #21ce90;
  border-bottom: 1px solid #21ce90;
}
.picker-h-m{
  flex: 2;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  vertical-align: middle;
  padding-top: 10px;
}
.picker-h-m .icons {
  font-size: 40px;
  color:#21ce90;
}
/*
.picker-helper:before {
  content: '';
  width: 45%;
  height: 38px;
  border-top: 1px solid #21ce90;
  border-bottom: 1px solid #21ce90;
  display: flex;
}
.picker-helper:after {
  content: '';
  margin-left: 55%;
  width: 45%;
  height: 38px;
  border-top: 1px solid #21ce90;
  border-bottom: 1px solid #21ce90;
  display: flex;
}
*/
.picker-item-content {
  width: 100%;
  height: 60px;
  position: absolute;
  top: 80px;
  left: 0px;
  transform-style: preserve-3d;
  transform-origin: center center -113.64752726415074px;
}
.picker-item-content>.item-wrapper,.picker-item-content>.item-wrapper>div {
  width: 100%;
  margin-top: 8px;
  transform-origin: top;
  transform-style: preserve-3d;
  transform: rotateX(-36deg);
}
.item-cont{
    width: 100%;
    height:  60px;
    text-align: center;
    display: block;
    line-height: 60px;
    backface-visibility: hidden;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.asset-code{
    height:  36px;
    text-align: center;
    display: block;
    line-height: 36px;
    backface-visibility: hidden;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.asset-host{
   height:  24px;
    text-align: center;
    display: block;
    line-height: 24px;
    backface-visibility: hidden;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px
}
.picker-item-content>div.item-wrapper {
  top: 10px;
  transform: rotateX(0deg);
}
</style>

<template>
  <transition name="picker">
    <v-touch class="picker-backdrop" v-show="value" v-on:tap="onClose">
      <div class="picker-wrapper">
        <slot class="picker-top-content" name="top-content"></slot>
        <div class="picker-content">
          <div class="picker-body">
            <picker-item @change="onChangeValue" v-for="(item, index) in dataItems" 
              :key="index"
              :itemIndex="index" 
              :index="item.index" 
              :all-values="item.values" 
              :values="item.$value"
              :hosts="item.hosts"
              :length="item.values.length - 1" 
              :maxScrollValue="item.maxScrollValue"
              :keyName="item.key"
              :style="item.style"></picker-item>
          </div>
          <div class="picker-helper">
            <div class="picker-h-w">
              <div class="picker-h-l"></div>
              <div class="picker-h-m">
                <i class="icons material-icons">&#xE8D4;</i>
              </div>
              <div class="picker-h-r"></div>
            </div>
          </div>
        </div>
        <slot class="picker-bottom-content" name="bottom-content"></slot>
      </div>
    </v-touch>
  </transition>
</template>

<script>
  import 'raf.js';
  import Vue from 'vue';
  import pickerItem from './picker-item.vue';

  
  Vue.directive('for-nested', {
    bind (el, binding) {
      console.log(binding)
      let value = binding.value[0];
      let key = binding.value[1];
      let hosts = binding.value[2];
      let html = '';
      for(let i = 0; i < 20; i++) {
        let n = 19 - i;
        let item = null;
        let host = null;
        if (typeof value[n] == 'object') {
          item = value[n] && typeof value[n][key] !== 'undefined' ? value[n][key] : '';
          host = hosts[n] && typeof hosts[n][key] !== 'undefined' ? hosts[n][key] : '';
        } else {
          item = typeof value[n] !== 'undefined' ? value[n] : '';
          host = typeof hosts[n] !== 'undefined' ? hosts[n] : '';
        }
        html = `<div class="item-wrapper"><div data-index="${n}">
                  <div class="item-cont">
                    <div class="asset-code">${item}</div>
                    <div class="asset-host">${host}</div>
                  </div>
                </div>${html}</div>`;
      }
      el.innerHTML = html;
    },
    update (el, binding) {
      let value = binding.value[0];
      let key = binding.value[1];
      let spenEl = el.querySelectorAll('span');
      let length = spenEl.length;
      for(let i = 0; i < length; i++) {
        let item = null;
        if (typeof value[i] == 'object') {
          item = value[i] && typeof value[i][key] !== 'undefined' ? value[i][key] : '';
        } else {
          item = typeof value[i] !== 'undefined' ? value[i] : '';
        }
        spenEl[i].innerHTML = item;
      }
    }
  });
  export default {
    name: 'picker',
    components: {
      'picker-item': pickerItem
    },
    data () {
      return {
        result: [],
        flex: {
          '-webkit-box-flex': 'initial',
          '-ms-flex': 'initial',
          'flex': 'initial'
        }
      }
    },
    props: {
      value: {
        type: Boolean
      },
      dataItems: {
        type: Array
      },
      callbackArg: {}
    },
    methods : {
      onClose (... arg) {
        let e = arg[0];
        if (e.target && e.target.classList.contains('picker-backdrop')) {
          this.$emit('input', false);
        }
      },
      onChangeValue (itemIndex, result, isSend) {
        if (isSend) {
          this.result[itemIndex] = result;
          this.$emit('change', ...this.result, this.callbackArg);
        } else {
          this.result[itemIndex] = result;
        }
      },
      init (n) {
        Vue.set(n, 'key', n.name );
        if (n.width) {
          let width = { 'width' : n.width }
          Vue.set(n, 'style', [width, this.flex] );
        }
        if (! n.maxScrollValue) {
          Vue.set(n, 'maxScrollValue', n.values.length);
        }
        n.$value = n.values.slice(0, 15);
      }
    },
    watch: {
      dataItems (newDataItems) {
        newDataItems.forEach(this.init);
      },
      value (result) {
        if (! result) return;
        this.$emit('change', ...this.result, this.callbackArg);
      }
    },
    created () {
      this.dataItems.forEach(this.init);
    }
  }
</script>