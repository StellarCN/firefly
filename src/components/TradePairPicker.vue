/**
 * 交易内容选择框
 */

<template>
  <div class="trade-picker">
    
    <picker-item :listData="left" v-model="leftval"></picker-item>
    <picker-item :listData="right" v-model="rightval"></picker-item>

    <div class="btn-group">
      <v-btn class="btn-cancle">{{$t('Button.Cancel')}}</v-btn>
      <v-btn class="btn-ok">{{$t('Button.OK')}}</v-btn>
    </div>
  </div>
</template>

<script>
import PickerItem from './PickerItem'
export default {
  data(){
    return {
      leftval: null,
      rightval: null,
    }
  },
  computed: {
    left(){
      return this.items[0]
    },
    right(){
      return this.items[1]
    }
  },
  props: {
    items:{
      type: Array,
      required: true
    }
  },

  components: {
    PickerItem,

  }

}
</script>

<style lang="stylus" scoped>
.trade-picker 
  display: flex
  position: fixed
  bottom: 0
  bottom: constant(safe-area-inset-bottom)
  bottom: env(safe-area-inset-bottom)
  width: 100%
</style>
