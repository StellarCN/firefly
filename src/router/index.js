import Vue from 'vue'
import Router from 'vue-router'
import Index from '../pages/Index'
import Main from '../pages/Main'
import Wallet from '../pages/Wallet'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(Router)


const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/main',
      name: 'Main',
      component: Main
    },

    {
      path: '/wallet',
      name: 'Wallet',
      component: Wallet
    },
    {
      path: '/termsofservice',
      name: 'TermsOfService',
      component: resolve => require(['../pages/TermsOfService.vue'], resolve)
    },
    {
      path: '/importaccount',
      name: 'ImportAccount',
      component: resolve => require(['../pages/ImportAccount.vue'], resolve)
    },
    {
      path: '/createaccount',
      name: 'CreateAccount',
      component: resolve => require(['../pages/CreateAccount.vue'], resolve)
    },
    {
      path: '/createaccountready',
      name: 'CreateAccountReady',
      component: resolve => require(['../pages/CreateAccountReady.vue'], resolve)
    },
    {
      path:'/mysettings',
      name: 'MySettings',
      component: resolve => require(['../pages/settings/SettingParent.vue'], resolve),
      redirect: { name: 'Settings' },
      children: [
        {
          path: '/settings',
          name: 'Settings',
          component: resolve => require(['../pages/settings/Settings.vue'], resolve)
        },
        {
          path: '/horizon',
          name: 'Horizon',
          component: resolve => require(['../pages/settings/Horizon'], resolve)
        },
        {
          path: '/language',
          name: 'Language',
          component: resolve => require(['../pages/settings/Language'], resolve)
        },
        {
          path: '/setpincode',
          name: 'SetPinCode',
          component: resolve => require(['../pages/settings/SetPinCode'], resolve)
        },
        {
          path: '/delpincode',
          name: 'DelPinCode',
          component: resolve => require(['../pages/settings/DelPinCode'], resolve)
        },
        {
          path: '/help',
          name: 'Help',
          component: resolve => require(['../pages/settings/Help'], resolve)
        },
        {
          path: '/about',
          name: 'Abount',
          component: resolve => require(['../pages/settings/About'], resolve)
        }
      ]
    },
    {
      path: '/assets',
      name: 'Assets',
      component: resolve => require(['../pages/asset/AssetParent.vue'], resolve),
      redirect: { name: 'MyAssets' },
      children: [
        {
          path: '/myassets',
          name: 'MyAssets',
          component: resolve => require(['../pages/asset/MyAssets.vue'], resolve)
        },
        {
          path: '/asset',
          name: 'Asset',
          component: resolve => require(['../pages/asset/Asset.vue'], resolve)
        },
        {
          path: '/assets/add',
          name: 'AddAsset',
          component: resolve => require(['../pages/asset/AddAsset.vue'], resolve)
        },
        {
          path: '/receiveasset',
          name: 'ReceiveAsset',
          component: resolve => require(['../pages/asset/ReceiveAsset.vue'], resolve)
        },
        {
          path: '/sendasset',
          name: 'SendAsset',
          component: resolve => require(['../pages/asset/SendAsset.vue'], resolve)
        },
      ]
    },
    {
      path: '/tradecenter',
      name: 'TradeCenter',
      component: resolve => require(['../pages/trade/TradeCenter.vue'], resolve)
    },
    {
      path: '/trade',
      name: 'Trade',
      component: resolve => require(['../pages/trade/Trade.vue'], resolve)
    },
    {
      path: '/trade/buy',
      name: 'TradeBuy',
      component: resolve => require(['../pages/trade/TradeBuy.vue'], resolve)
    },
    {
      path: '/trade/sell',
      name: 'TradeSell',
      component: resolve => require(['../pages/trade/TradeSell.vue'], resolve)
    },
    {
      path: '/funding',
      name: 'Funding',
      component: resolve => require(['../pages/Funding.vue'], resolve)
    },
    {
      path: '/history',
      name: 'History',
      component: resolve => require(['../pages/History.vue'], resolve)
    },
    {
      path: '/mycontacts/',
      name: 'MyContacts',
      component: resolve => require(['../pages/contacts/MyContacts.vue'], resolve),
      redirect: { name: 'ContactsList' },
      children: [
        {
          path: 'list',
          name: 'ContactsList',
          component: resolve => require(['../pages/contacts/ContactsList.vue'], resolve),
        },
        {
          path: 'add',
          name: 'AddContact',
          component: resolve => require(['../pages/contacts/AddContact.vue'], resolve)
        },
        {
          path: 'modify/:id',
          name: 'ModifyContact',
          component: resolve => require(['../pages/contacts/ModifyContact.vue'], resolve)
        },
        {
          path: ':id',
          name: 'ContactDetails',
          component: resolve => require(['../pages/contacts/ContactDetails.vue'], resolve)
        },
      ]
    },
    {
      path: '/account/manage',
      name: 'ManageAccount',
      component: resolve => require(['../pages/account/Manage.vue'], resolve)
    },
    {
      path: '/account/info',
      name: 'AccountInfo',
      component: resolve => require(['../pages/account/Info.vue'], resolve)
    },
    {
      path: '/account/namecard',
      name: 'AccountNameCard',
      component: resolve => require(['../pages/account/NameCard.vue'], resolve)
    },
    {
      path: '/account/modify',
      name: 'ModifyAccount',
      component: resolve => require(['../pages/account/ModifyAccount.vue'], resolve)
    },
    {
      path: '/transaction',
      name: 'Transaction',
      component: resolve => require(['../pages/Transaction'], resolve)
    },
    {
      path: '/myaddress/',
      name: 'MyAddress',
      component: resolve => require(['../pages/myaddress/MyAddress.vue'], resolve),
      redirect: { name: 'MyAddressList' },
      children: [
        {
          path: 'list',
          name: 'MyAddressList',
          component: resolve => require(['../pages/myaddress/MyAddressList.vue'], resolve),
        },
        {
          path: 'add',
          name: 'MyAddressAdd',
          component: resolve => require(['../pages/myaddress/MyAddressAdd.vue'], resolve)
        },
        {
          path: 'edit/:name',
          name: 'MyAddressEdit',
          component: resolve => require(['../pages/myaddress/MyAddressEdit.vue'], resolve)
        },
        {
          path: ':name',
          name: 'MyAddressView',
          component: resolve => require(['../pages/myaddress/MyAddressView.vue'], resolve)
        },
      ]
    },
    {
      path: '/pinlock',
      name: 'PinLock',
      component: resolve => require(['../pages/PinLock'], resolve)
    },


  ]
})

router.beforeEach((to,from,next) => {
  NProgress.start();
  next()
})

router.afterEach((to,from)=>{
  NProgress.done();
})

export default router
