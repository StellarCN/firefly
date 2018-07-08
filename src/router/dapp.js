import Parent from '@/pages/dapp/DAPPParent.vue'
import DApp from '@/pages/dapp/DApp.vue'
// dapp 路由
export default {
  path:'/apps/',
    name: 'DAPPParent',
    component: Parent,
    redirect: { name: 'Apps' },
    children: [
      {
        path: 'all',
        name: 'Apps',
        component: DApp
      },
      {
        path: 'setting',
        name: 'DAppSetting',
        component: resolve => require(['../pages/dapp/DAppSetting.vue'], resolve)
      },
      {
        path: 'dappopener',
        name: 'DAppOpener',
        component: resolve => require(['../pages/dapp/DAppOpener.vue'], resolve)
      },

    ]
}