import Parent from '@/pages/dapp/DAPPParent.vue'
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
        component: resolve => require(['../pages/dapp/DApp.vue'], resolve)
      },
      {
        path: 'setting',
        name: 'DAppSetting',
        component: resolve => require(['../pages/dapp/DAppSetting.vue'], resolve)
      },

    ]
}