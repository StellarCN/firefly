<template>
   <v-bottom-sheet persistent full-width v-model="show">
    <v-snackbar  bottom vertical full-width
      v-model="show"
      :timeout="0"
      :color = 'color'
      >
        <div class='bottom-notice'>{{ text }}</div>
        <v-btn flat small @click="close">{{$t('Close')}}</v-btn>
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
      type: String,
      default: ""
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
</style>
