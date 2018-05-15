/**
 * 代码来自:https://github.com/ttzshawn/vue-custom-keyboard/blob/master/src/VueCustomKeyboard.vue
 * 针对该代码做了调整，适配本项目
 */
 <template>
  <div class="custom-keyboard">  
    <div class="keyboard" :class="{keyboardOpen: this.isOpen}" onTouchMove={this.preventTouchMove} :style="{height: `${winH * 0.32}px`}">
      <div :class="{keyboardLayout: true}">
        <div class="numbers">
          <span v-for="(item, i) in numbers" :key="item+i" class="btnKey">
            <button class="button" type="button" @click="selectLevel1(item)">
              {{item}}
            </button>
            <div class="btnActive">
              <span>{{item}}</span>
            </div>
          </span>  
        </div>
        <div class="words">
          <span v-for="(item, i) in words" :key="item+i" class="btnKey">
            <button class="button" type="button" @click="selectLevel1(item)">
              {{item}}
            </button>
            <div class="btnActive">
              <span>{{item}}</span>
            </div>
          </span>
          
          <span class="btnKey backspace" >
            <button class="button" type="button" @click="backspace">
              <i class="material-icons icons">backspace</i>
            </button>
          </span>
            
        </div>
        
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: true
    },
    maxLength: {
      type: Number,
      default: 56
    },
    onChange: {
      type: Function,
      default: (onChangeFunc) => {}
    },
    onBack:{
      type: Function,
      default: ()=>{}
    },
    onBlur: {
      type: Function
    },
    onDone: {
      type: Function,
      default: () => {}
    },
    defaultValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      numbers: "23456789",
      words: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      winH: window.innerHeight,
      inputValue: this.defaultValue || ''
    }
  },
  watch: {
    defaultValue() {
      this.inputValue = this.defaultValue
    }
  },
  methods: {
    selectLevel1(level1) {
      if(this.inputValue.length >= this.maxLength){
        this.onDone()
      }else{
        this.inputValue =  this.inputValue + level1
        this.onChange(level1)
      }
    },
    backspace() {
      const inputValue = this.inputValue
      const backspaceValue = inputValue.substr(0, inputValue.length - 1)
      this.inputValue = backspaceValue
      this.onBack(backspaceValue)
    },
    reset(){
      this.inputValue = ''
    },
    getInputValue(){
      return this.inputValue
    }
  }
}
</script>

<style lang="stylus">
@require '../../stylus/color.styl'
.material-icons.icons
  font-size: .7rem!important
  font-style: normal
  -webkit-font-smoothing: antialiased
  -webkit-text-stroke-width: 0.2px
  -moz-osx-font-smoothing: grayscale
.keyboard
  position: fixed
  z-index: 900
  right: 0
  bottom: 1.5rem
  left: 0
  padding-top: 10px
  user-select: none
  transition: transform 200ms ease-out
  transform: translateY(100%)
  text-align: center
  background-color: $primarycolor.gray
.keyboardOpen 
  transform: translateY(0)

.keyboardLayout 
  height: 100%

.btnKey 
  position: relative
  display: inline-block
  width: 10%
  height: 25%

.button 
  font-size: .7rem
  display: inline
  width: 80%
  height: 80%
  margin: 10% auto
  padding: 0
  text-align: center
  border: 0
  border-radius: 3px
  background-color: $secondarycolor.gray
  box-shadow: 0 2px 3px rgba(0, 0, 0, .15)
  &:focus
    outline: 0
  &:active~.btnActive 
    font-size: 1.5rem
    line-height: 200%
    position: absolute
    top: 0
    left: -10%
    display: table
    width: 140%
    height: 100%
    padding: 0 .2rem
    margin-bottom: 10px
    transform: translateY(-100%)
    border-radius: 5px
    background-color: $secondarycolor.font
    box-shadow: 0 2px 3px rgba(0, 0, 0, .15)
    span
      display: table-cell
      width: 100%
      text-align: center
      vertical-align: middle
    &::after
      position: absolute
      bottom: 0
      left: 50%
      width: 0
      height: 0
      content: ''
      transform: translate3d(-50%, 100%, 0)
      border-top: 10px solid #fff
      border-right: 10px solid transparent
      border-left: 10px solid transparent
  i
    font-size: 3rem !important
    color: #fff
.btnActive 
  display: none

.hide
  display: none

.show 
  display: block

.backspace 
  width: 15%
  vertical-align: middle
  i
    font-size: 1rem
  .button
    margin-top: 0
    padding-top: .1rem
    &:active
      background-color: #fff
      i
        color: #cbcdd1
      
.keyboardHide
  display: none
.keyboardShow 
  display: block

</style>