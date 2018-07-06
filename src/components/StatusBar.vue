<template>
  <div class="status-bar" :style="{background: bg}"></div>
</template>

<script>
export default {
  props:{
    bg:{
      type: String,
      default:'#21CE90'
    }
  }
}
</script>

<style lang="stylus" scoped>
.status-bar
  height: 24px
  height: calc(24px + constant(safe-area-inset-bottom))
  height: calc(24px + env(safe-area-inset-bottom))
  width: 100%
  position: fixed
  left: 0
  right:0
  top: 0
  z-index: 3
</style>
