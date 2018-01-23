/*
 * 我的，显示界面，即：个人中心
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-23 11:14:24 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-01-23 19:32:39
 * @License: MIT 
 */
<template>
  <div class="page">
      <toolbar :title="$t('Menu.My')" :showmenuicon="true" :showbackicon="false"  ref="toolbar"/>
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
import { mapState, mapActions, mapGetters } from 'vuex'
export default {
    data(){
        return {
            pinEnable: false,
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
            
        },  
        switchPinCode(val){
            //value=true，跳转到设置ping界面
            if(val){
                this.$router.push(`/setpincode`)
                return
            }
            // value=false，则要求输入ping码，正确后才可以取消
            this.$router.push(`/delpincode`)
            
            },
        toManageAccount(){
            this.$router.push(`/account/manage`)
        },
        toChangeLanguage(){
            this.$router.push(`/language`)
        },
        toChangeHorizon(){
            this.$router.push(`/horizon`)
        },
        toAbout(){
            this.$router.push(`/about`)
        },
        
    },

    components: {
        Toolbar,
        Card,
    }

}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.avatar
    font-size: 42px
    color: $primarycolor.green
.title
  margin-top: 5px
  height: 32px
  line-height: 32px!important
  font-size: 16px
.address
  height: 14px
  line-height: 14px!important
  font-size: 14px
.settings-ul
    padding-left: 10px
    .settings-li
        font-size: 16px
        padding-top: 5px
        padding-bottom: 5px
        .pincodeswitch
            float: right
            width: 50px
            padding-top: 0px
</style>
