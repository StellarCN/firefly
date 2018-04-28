<template>
    <!--显示密码输入界面-->
    <v-bottom-sheet :persistent="persistent" v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content">
        <div class="sheet-title textcenter" v-if="title">
          <div class="title">{{title}}</div>
        </div>
        <div class="sheet-title">
          <div class="label">{{$t('Account.AccountName')}}</div>
          <div class="value">{{accountname}}</div>
        </div>
        <div class="sheet-input">
           <v-text-field
                name="password"
                :label="$t('Account.Password')"
                v-model="inpassword"
                :append-icon="pwdvisible ? 'visibility' : 'visibility_off'"
                :append-icon-cb="() => (pwdvisible = !pwdvisible)"
                :type="pwdvisible ? 'text':'password'"
                required dark
                ></v-text-field>
        </div>
        <div  class="sheet-btns">
          <div class="sheet-btn" @click="canclePwdInput">{{$t('Button.Cancel')}}</div>
          <div class="sheet-btn" @click="okPwdInput">{{$t('Button.OK')}}</div>
        </div>
      </div>
    </v-bottom-sheet>
</template>

<script>
import { readAccountData } from '@/api/storage'
export default {
    data(){
        return {
            showPwdSheet: true,
            inpassword: null,
            working: false,

        }
    },
    props: {
        persistent: {
            type: Boolean,
            default: true
        },
        title: {
            type: String
        },
        accountname: {
            type: String
        },
        address: {
            type: String,
            required: true
        }


    },
    methods:{
        canclePwdInput(){
            this.inpassword = null
            this.$emit('cancel')
        },
        okPwdInput(){
            if(this.inpassword === null || this.inpassword.length === 0)return
            if(this.working)return
            this.working = true

            //校验密码是否正确
            readAccountData(this.address, this.inpassword)
                .then(data=>{
                    this.working = false
                    this.$emit('ok',data)
                })
                .catch(err=>{
                    this.working = false
                    console.error(err)
                    this.$toasted.error(this.$t('Error.PasswordWrong'))
                })
        }

    }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/color.styl'
.sheet-content
  background: $secondarycolor.gray
  color: $primarycolor.font
  padding: 10px 10px
  word-wrap: break-word
  .sheet-title
    .title
      height: 40px
      line-height: 40px
      font-size: 32px
      text-align: center
      color: $primarycolor.green
      padding: 10px 10px
    .label
      color: $secondarycolor.font
    .value
      font-size: 16px
  .sheet-btns
    margin-top: 10px
    display: inline-block
    width: 100%
    .sheet-btn
      float: left
      width: 50%
      height: 40px
      line-height: 40px
      text-align: center
      font-size: 16px
      color: $primarycolor.green

</style>
