/*
 * 我的，显示界面，即：个人中心
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-23 11:14:24 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-01-31 10:58:23
 * @License: MIT 
 */
<template>
  <div class="page">
      <toolbar :title="$t('Menu.My')" :showbackicon="false"  ref="toolbar">
          <div slot="left-tool">
            <v-btn icon @click.native="showAccounts">
                <i class="material-icons">menu</i>
            </v-btn>
          </div>
      </toolbar>

      <accounts-nav :show="showaccountsview" @close="closeView"/>

      <div class="content">
          <card padding="0px 0px"  class="infocard">
            <div slot="card-content">
                <div class="flex-row">
                    <div class="flex2 textcenter">
                        <div class="avatar-wrapper">
                            <span class="avatar-back" @click="toNameCard"><i class="iconfont icon-erweima avatar"></i></span>
                        </div>
                    </div>
                    <div class="flex4">
                        <div class="title">{{account.name}}</div>
                        <div class="address">{{account.address | shortaddress}}</div>
                    </div>
                </div>
            </div>
          </card>
          <card padding="0px 0px" margin="20px 0px" class="infocard">
            <div slot="card-content">
                <ul class="settings-ul">
                    <li class="settings-li" @click="toManageAccount">
                    <span>{{$t('ManageAccount')}}</span>
                    </li>
                    <li class="settings-li">
                    <span>{{$t('PinCode')}}</span>
                    <v-switch class="pincodeswitch"
                                v-model="pinEnable"
                                color="primary"
                                hide-details
                                @change="switchPinCode"
                                ></v-switch>
                    
                    </li>
                    <li class="settings-li" @click="toChangeLanguage">
                    <span>{{$t('Language')}}</span>
                    </li>
                    <li class="settings-li" @click="toChangeHorizon">
                    <span>{{$t('PublicNetUrl')}}</span>
                    </li>
                    <li class="settings-li" @click="toAbout">
                    <span>{{$t('About.Title')}}</span> 
                    </li>
                </ul>
                
            </div>
          </card>
      </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import AccountsNav from '@/components/AccountsNav'
import { mapState, mapActions, mapGetters } from 'vuex'
export default {
    data(){
        return {
            pinEnable: false,
            showaccountsview: false,
        }
    },
    computed: {
        ...mapState({
            account: state => state.accounts.selectedAccount,
            accountData: state => state.account.data,
            app: state => state.app
        }),
    },
    beforeMount(){
        this.pinEnable = this.app.enablePin || false
    },
    beforeUpdate(){
        this.pinEnable = this.app.enablePin || false
    },
    methods: {
        toNameCard(){
              this.$router.push({name:'AccountNameCard'})
        },  
        switchPinCode(val){
            //value=true，跳转到设置ping界面
            if(val){
                this.$router.push({name:'SetPinCode'})
                return
            }
            // value=false，则要求输入ping码，正确后才可以取消
            this.$router.push({name: 'DelPinCode'})
            
            },
        toManageAccount(){
            this.$router.push({name: 'ManageAccount'})
        },
        toChangeLanguage(){
            this.$router.push({name: 'Language'})
        },
        toChangeHorizon(){
            this.$router.push({name: 'Horizon'})
        },
        toAbout(){
            this.$router.push({name: 'About'})
        },

        showAccounts(){
            this.showaccountsview = true
        },
        closeView(){
            this.showaccountsview = false
        }
        
    },

    components: {
        Toolbar,
        Card,
        AccountsNav,
    }

}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/settings.styl'

</style>
