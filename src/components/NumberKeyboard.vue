/**
 * 数字键盘
 */
<template>
		<div class="numberkeyboard" v-show="show">
			<div class="list">
				<div class="key" @touchstart="onChange('1')">1</div>
				<div class="key" @touchstart="onChange('2')">2</div>
				<div class="key" @touchstart="onChange('3')">3</div>
				<div class="key" @touchstart="onChange('4')">4</div>
				<div class="key" @touchstart="onChange('5')">5</div>
				<div class="key" @touchstart="onChange('6')">6</div>
				<div class="key" @touchstart="onChange('7')">7</div>
				<div class="key" @touchstart="onChange('8')">8</div>
				<div class="key" @touchstart="onChange('9')">9</div>
        <div class="key">&nbsp;</div>
				<div class="key" @touchstart="onChange('0')">0</div>
				<div class="key"@touchstart="onDelete('')">
					<i class="material-icons">&#xE14A;</i>
				</div>
			</div>

		</div>
</template>

<script>
export default {
  data(){
    return {
      value: ''
    }
  },
  props: {
    show: {
      type: Boolean,
      default: true
    },
    max: {
      type: Number,
      default: 6
    },
    reset: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onChange (i) {
      if(this.value.length >= this.max)return
      this.value += i
      this.$emit('onChange',this.value)
      if(this.value.length === this.max && this.reset){
        setTimeout(()=>{
          this.value = ''
        },200)
      }
    },
    onDelete () {
      if(this.value.length === 0)return
      this.value = this.value.substring(0,this.value.length-1)
      this.$emit('onChange',this.value)
    }
  }

}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.numberkeyboard
  height: 50%
  width: 100%
  position: absolute
  bottom: 0
  left: 0
  right: 0
  background: $secondarycolor.gray
  z-index: 999
  .list
    height 100%
    .key
      float: left
      width: 33.33%
      height: 25%
      color: $primarycolor.font
      text-align: center
      align-items: center
      display: flex
      justify-content: center
      font-size: 30px

</style>
 