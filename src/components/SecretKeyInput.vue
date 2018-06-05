/*
 * 密钥输入容器，自动格式化内容
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-03-05 17:30:09 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-05-25 11:21:44
 * @License MIT 
 */
 <template>
   <div  onTouchMove={this.preventTouchMove}>

   <v-text-field dark
      :label="$t('SecretKey')"
      v-model="seedInput"
      required
      multi-line
      clearable
      :disabled="disabled"
      class="seed-input"
      @paste="pasteHandler($event)"
      @focus="focusHandler($event)"
      @blur="blurHandler($event)"
      @input="inputText"
      rows=3
      :append-icon="hideKeyboard ? 'keyboard' : 'keyboard_hide'"
      :append-icon-cb="keyboardIconClick"
      ></v-text-field>
    
    <secret-keyboard v-show="!hideKeyboard"
      ref="keyboard"
      :onChange="keyBoardChange"
      :onDone="keyBoardDone"
      :onBack="keyBoardBack"
      />
   </div>

 </template>
 
 <script>
 import  endsWith  from 'lodash/endsWith'
 import util from './SecretKeyInputUtil'
 import SecretKeyboard from '@/libs/custom-keyboard/SecretKeyboard'
 export default {
   data(){
     return {
       seedInput: '',
       cleaveInstance: null,
       blocks: [1,5,5,5,5,5,5,5,5,5,5,5],
       delimiter: '-',
       prefix: 'S',
       maxLength: 56,
       uppercase: true,

       hideKeyboard: false,

     }
   },
   props:{
     enablePaste:{
       type: Boolean,
       default: false
     },
     disabled: {
       type: Boolean,
       default: false
     },
     seed:{
       type: String
     }
   },
   watch: {
   },
   beforeDestroy () {
   },
   methods:{
     pasteHandler(event){
       return this.enablePaste
     },
     inputText(value){
       if(value && endsWith(value, this.delimiter)){
         this.seedInput = this.seedInput.substr(0, this.seedInput.length -1)
         return;
       }
       if(value === null)value = ''
       //
       // strip delimiters
        value = util.stripDelimiters(value, this.delimiter, []);
        if(value && value.length >= this.maxLength){
          value = value.substr(0, this.maxLength)
        }

        // strip prefix
        value = util.getPrefixStrippedValue(value, this.prefix, this.prefix.length);
        // convert case
        value = this.uppercase ? value.toUpperCase() : value;
       
        // prefix
        if (this.prefix &&  value.length) {
            value = this.prefix + value;

            // no blocks specified, no need to do formatting
            if (this.blocks.length === 0) {
                this.seedInput = value
                return;
            }
        }

        // strip over length characters
        value = util.headStr(value, this.maxLength);

        // apply blocks
        this.seedInput = util.getFormattedValue(
            value,
            this.blocks, this.blocks.length,
            this.delimiter, [], false
        );
     },

    getSeed(){
      if(this.seed)return this.seed.toUpperCase()
      if(this.seedInput){
        return this.seedInput.replace(new RegExp(this.delimiter, 'gm'), '').toUpperCase()
      }
      return null
    },
    keyBoardChange(val){
      let value = this.$refs.keyboard.getInputValue()
      this.seedInput = util.getFormattedValue(
            value,
            this.blocks, this.blocks.length,
            this.delimiter, [], false
        );
    },
    keyBoardDone(){
      console.log('done')
    },
    keyBoardBack(){
      this.keyBoardChange() 
    },

    focusHandler(event){
      //console.log('----focus----')
      //禁止弹出输入框
      //document.activeElement.blur()
      this.hideKeyboard = true
    },
    blurHandler(event){
      this.hideKeyboard = false
    },
    focusoutHandler(){
      this.hideKeyboard = false
    },
    keyboardIconClick(){
      this.hideKeyboard = !this.hideKeyboard
      if(!this.hideKeyboard){
        document.activeElement.blur()
      }
    },
    reset(){
      this.seedInput = ''
    }
    

   },
   components: {
     SecretKeyboard,
   }
 }
 </script>
 
 <style lang="stylus">
 
 </style>
 
