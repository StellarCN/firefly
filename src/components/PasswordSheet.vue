<template>
    <!--显示密码输入界面-->
    <v-bottom-sheet :persistent="persistent" v-model="showPwdSheet" v-if="showPwdSheet" dark>
      <div class="sheet-content">
        <div class="sheet-title textcenter" v-if="title">
          <div class="title">{{title}}</div>
        </div>
        <div class="sheet-title">
          <div class="label">{{$t('Account.AccountName')}}</div>
          <div class="value">{{account_name}}</div>
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
import { mapState, mapActions } from 'vuex'
export default {
    data(){
        return {
            showPwdSheet: true,
            inpassword: null,
            pwdvisible: false,
            working: false,
            account_name: null,
            _address: null,
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
        }
    },
    computed:{
        ...mapState({
            accounts: state => state.accounts.data,
            account: state => state.accounts.selectedAccount,
            selectedAccountIndex: state => state.accounts.selected,
            accountData: state => state.accounts.accountData,
        })
    },
    beforeMount(){
        this.account_name = this.accountname || this.account.name
        this._address = this.address || this.account.address
    },
    methods:{
        ...mapActions({
            checkAccountPWD: 'checkAccountPWD',
            choseAccount: 'changeAccount',
            choseAccountNoPwd: 'changeAccountNoPassword',
            getAccountInfo: 'getAccountInfo'
        }),
        canclePwdInput(){
            this.inpassword = null
            this.$emit('cancel')
        },
        okPwdInput(){
            if(this.inpassword === null || this.inpassword.length === 0)return
            if(this.working)return
            this.working = true
            if(this.address){
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
            }else{
                this.checkAccountPWD({
                    index: this.selectedAccountIndex,
                    address: this._address,
                    password: this.inpassword
                }).then(account=>{
                    //this.$toasted.show(this.$t('Info.ChangeAccountSuccess'));
                    this.working = false
                     this.$emit('ok')
                    // this.getAccountInfo(this.account.address).then(data=>{
                        
                    //     //  this.$emit('ok')
                    // }).catch(err=>{
                    //     // this.$toasted.error(this.$t('Error.PasswordWrong'))
                    //     this.working = false
                    //      this.$emit('ok')
                    // })
                }).catch(err=>{
                    console.error('change account error')
                    console.error(err)
                    this.$toasted.error(this.$t('Error.PasswordWrong'))
                    this.working = false
                })
            }
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
  padding-bottom: calc(10px + constant(safe-area-inset-bottom))
  padding-bottom: calc(10px + env(safe-area-inset-bottom))
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
    background: $secondarycolor.gray
    padding-bottom: 0
    padding-bottom: constant(safe-area-inset-bottom)
    padding-bottom: env(safe-area-inset-bottom)
    .sheet-btn
      float: left
      width: 50%
      height: 40px
      line-height: 40px
      text-align: center
      font-size: 16px
      color: $primarycolor.green

</style>
