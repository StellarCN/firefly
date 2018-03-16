/*
* 我的，显示界面，即：个人中心
* @Author: mazhaoyong@gmail.com
* @Date: 2018-01-23 11:14:24
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-03-16 18:06:29
* @License: MIT
*/
<template>
  <div class="page">
      <toolbar :title="$t('Menu.My')" :showbackicon="false"  ref="toolbar">
            <v-btn icon @click.native="showAccounts" slot="left-tool">
                <i class="material-icons">repeat</i>
            </v-btn>
      </toolbar>

      <accounts-nav :show="showaccountsview" @close="closeView"/>

      <div class="content">
          <card padding="20px 0px"  class="infocard My_my_infocard">
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
                <div class="flex-row line32 margin-t-10">
                    <div class="flex1 textcenter" @click="toOffer">
                        <i class="material-icons vcenter">&#xE85D;</i>
                        <span>{{ $t('History.Offer') }}</span>
                    </div>
                    <div class="flex1 textcenter" @click="toHistory">
                        <i class="material-icons  vcenter">&#xE889;</i>
                        <span>{{$t('History.Title')}}</span>
                    </div>
                </div>
            </div>
          </card>
          <card padding="0px 0px" margin="20px 0px" class="infocard My_my_tabbar">
            <div slot="card-content">
                <ul class="settings-ul">
                    <li class="settings-li" @click="redirect(item.name)" v-for="item in menus" :key="item.name">
                        <i class="material-icons vcenter">{{item.icon}}</i>
                        <span>{{$t(item.title)}}</span>
                        <i class="material-icons vcenter f-right mt-2">keyboard_arrow_right</i>
                        <div class="circular" v-if="item.name=='MessageCenter'&&unreadMessage.length>0"> {{unreadMessage.length}}</div>
                    </li>
                </ul>
            </div>
          </card>
      </div>
      <tab-bar />
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import AccountsNav from '@/components/AccountsNav'
import { mapState, mapActions, mapGetters } from 'vuex'
import  TabBar from '@/components/TabBar'
export default {
    data(){
        return {
            showaccountsview: false,
            menus: [               
                {
                    title: "ManageAccount",
                    name: "ManageAccount",
                    icon: "account_balance_wallet"
                },
                {
                    title: "Menu.Contacts",
                    name: "ContactsList",
                    icon: "supervisor_account"
                },
                {
                    title: "Menu.MyAddress",
                    name: "MyAddress",
                    icon: "bookmark"
                },
                {
                    title: "Menu.Settings",
                    name: "Settings",
                    icon: "settings"
                },
                {
                    title: "Menu.Help",
                    name: "Help",
                    icon: "help"
                },
              {
                title: "Menu.MessageCenter",
                name: "MessageCenter",
                icon: "message"
              }
            ],
            myofferpage:{ name: 'History', params: { active: 'offer' } },
            historypage:{ name: 'History', params: { active: 'transaction' } }

        }
    },
    computed: {
        ...mapState({
            account: state => state.accounts.selectedAccount,
            accountData: state => state.account.data,
            app: state => state.app
        }),
      ...mapGetters([
        'unreadMessage'
      ])
    },
    beforeMount(){
        this.pinEnable = this.app.enablePin || false
    },
    beforeUpdate(){
        this.pinEnable = this.app.enablePin || false
    },
    methods: {
        ...mapActions([
            'changeCurrentHistoryComponent'
        ]),
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
        redirect(name){
            this.$router.push({name})
        },
        showAccounts(){
            this.showaccountsview = true
        },
        closeView(){
            this.showaccountsview = false
        },
        toOffer(){
            this.changeCurrentHistoryComponent(this.myofferpage.params.active)
            this.$router.push(this.myofferpage)

        },
        toHistory(){
            this.changeCurrentHistoryComponent(this.historypage.params.active)
            this.$router.push(this.historypage)
        },

    },

    components: {
        Toolbar,
        Card,
        AccountsNav,
        TabBar
    }

}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/settings.styl'

</style>
