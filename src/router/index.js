import Vue from 'vue'
import Router from 'vue-router'
import Index from '../pages/Index'
import Main from '../pages/Main'
import Wallet from '../pages/Wallet'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import mysettings from './mysettings'
import assets from './assets'
import trade from './trade'
import contacts from './contacts'
import addresses from './addresses'
import account from './account'

import Picklanguage from '../pages/Picklanguage'
import Guidepage from '../pages/Guidepage'

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
      path: 'picklanguage',
      name: 'Picklanguage',
      component: Picklanguage
    },
    {
      path: 'guidepage',
      name: 'Guidepage',
      component: Guidepage
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
      path: '/transaction',
      name: 'Transaction',
      component: resolve => require(['../pages/Transaction'], resolve)
    },
    {
      path: '/pinlock',
      name: 'PinLock',
      component: resolve => require(['../pages/PinLock'], resolve)
    },

    mysettings,
    assets,
    trade,
    contacts,
    addresses,
    account,
    

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
