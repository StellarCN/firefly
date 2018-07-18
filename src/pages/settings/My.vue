/*
* 我的，显示界面，即：个人中心
* @Author: mazhaoyong@gmail.com
* @Date: 2018-01-23 11:14:24
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-07-18 16:14:54
* @License: MIT
*/
<template>
  <div class="page">
      <toolbar :title="$t('Menu.My')" :showbackicon="false" lockpass  ref="toolbar">
            <v-btn icon @click.native="showAccounts" slot="left-tool">
                <i class="material-icons font28">menu</i>
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
                        <div class="circular" v-if="item.name=='MessageCenter'&&unReadCount>0"> {{unReadCount}}</div>
                    </li>
                </ul>
            </div>
          </card>
      </div>
      <!-- <tab-bar /> -->
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
                    title: 'kyc',
                    name: 'KYC',
                    icon: "security"
                },
                 {
                    title: "Menu.Funding",
                    name: "Funding",
                    icon: "import_export"
                },
                {
                    title: "Menu.Settings",
                    name: "Settings",
                    icon: "settings"
                },
                // {
                //     title: "Title.ThirdApp",
                //     name: "Apps",
                //     icon: "apps"
                // },
                {
                    title: "Menu.Help",
                    name: "Help",
                    icon: "help"
                },
                {
                title: "Menu.MessageCenter",
                name: "MessageCenter",
                icon: "message"
              },   
               {
                title: "tickets",
                name: "Tickets",
                icon: "assignment"
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
            app: state => state.app,
            islogin: state => (state.accounts.accountData.seed ? true : false),
        }),
      ...mapGetters([
        'unReadCount'
      ])
    },
    mounted(){
        if(!this.islogin){
            this.$refs.toolbar.showPasswordLogin()
            return
        }
    },
    methods: {
        ...mapActions([
            'changeCurrentHistoryComponent'
        ]),
        toNameCard(){
              this.$router.push({name:'AccountNameCard'})
        },
        redirect(name){
            //帮助页面单独做
            // if('Help' === name){
            //     let site = 'https://wallet.fchain.io/manual'+'?'+Math.random()
            //     let title = this.$t('Menu.Help')
            //     this.$router.push({name: 'DAppOpener', params: { site, title} })
            //     return;
            // }
            // if('kyc' === name){//打开KYC的界面
            //     let site = 'https://fchain.io/kyc/accounts/login/?next=/portal/'+'?'+Math.random()
            //     let title = this.$t('kyc')
            //     this.$router.push({name: 'DAppOpener', params: { site, title} })
            //     return;
            // }
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
.content
    padding-bottom:0px
</style>
