import AssetParent from '@/pages/asset/AssetParent.vue'
import MyAssets from '@/pages/asset/MyAssets.vue'

export default {
    path: '/assets/',
    name: 'Assets',
    component: AssetParent,
    redirect: { name: 'MyAssets' },
    children: [
      
      {
        path: 'my',
        name: 'MyAssets',
        component: MyAssets
      },
      {
        path: 'info',
        name: 'Asset',
        component: resolve => require(['../pages/asset/Asset.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
      {
        path: 'add',
        name: 'AddAsset',
        component: resolve => require(['../pages/asset/AddAsset.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
      {
        path: 'receive',
        name: 'ReceiveAsset',
        component: resolve => require(['../pages/asset/ReceiveAsset.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
      {
        path: 'send',
        name: 'SendAsset',
        component: resolve => require(['../pages/asset/SendAsset.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
      {
        path: 'assetknowledge',
        name: 'AssetKnowledge',
        component: resolve => require(['../pages/asset/AssetKnowledge.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
    ]
  }