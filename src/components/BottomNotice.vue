<template>
   <v-bottom-sheet persistent full-width v-model="show">
    <v-snackbar class="bn-snackbar" bottom vertical full-width
      multi-line
      auto-height
      v-model="show"
      :timeout="0"
      :color = 'color'
      >
        <div class='bottom-notice' v-if="text">{{ text }}</div>
        <div class="bottom-notice" v-else>
          <slot></slot>
        </div>
        <v-btn class="snackbar-btn" flat small @click="close">{{$t('Close')}}</v-btn>
      </v-snackbar>
  </v-bottom-sheet>
</template>

<script>
export default {
  props:{
    show:{
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'notice'
    },
    text:{
      type: String
    }

  },
  methods: {
    close(){
      this.$emit('update:show',false)
    }
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.bottom-notice
  color: $primarycolor.green
.btn
    color: $primarycolor.green
// .bn-snackbar
//   padding-bottom: 8px
//   padding-bottom: calc(8px + constant(safe-area-inset-bottom))!important
//   padding-bottom: calc(8px + env(safe-area-inset-bottom))!important
//   background-color: #303034!important
.snackbar-btn
  margin-top: 8px!important
</style>
