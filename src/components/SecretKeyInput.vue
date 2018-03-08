/*
 * 密钥输入容器，自动格式化内容
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-03-05 17:30:09 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-03-06 18:54:09
 * @License MIT 
 */
 <template>
   <v-text-field dark
      :label="$t('SecretKey')"
      v-model="seedInput"
      required
      multi-line
      class="seed-input"
      onpaste="return false"
      @input="inputText"
      rows=2></v-text-field>
    

 </template>
 
 <script>
 import _ from 'lodash'
 import util from './SecretKeyInputUtil'
 export default {
   data(){
     return {
       seedInput: 'S-',
       originInput: 'S',
       cleaveInstance: null,
       blocks: [1,5,5,5,5,5,5,5,5,5,5,5],
       delimiter: '-',
       prefix: 'S',
       maxLength: 56,
       uppercase: true,

     }
   },
   methods:{
     inputText(value){
       if(value && _.endsWith(value, this.delimiter)){
         this.seedInput = this.seedInput.substr(0, this.seedInput.length -1)
         return;
       }
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
     }
   }
 }
 </script>
 
 <style lang="stylus">
 
 </style>
 
