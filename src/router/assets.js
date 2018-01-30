export default {
    path: '/assets/',
    name: 'Assets',
    component: resolve => require(['../pages/asset/AssetParent.vue'], resolve),
    redirect: { name: 'MyAssets' },
    children: [
      
      {
        path: 'my',
        name: 'MyAssets',
        component: resolve => require(['../pages/asset/MyAssets.vue'], resolve)
      },
      {
        path: 'info',
        name: 'Asset',
        component: resolve => require(['../pages/asset/Asset.vue'], resolve)
      },
      {
        path: 'add',
        name: 'AddAsset',
        component: resolve => require(['../pages/asset/AddAsset.vue'], resolve)
      },
      {
        path: 'receive',
        name: 'ReceiveAsset',
        component: resolve => require(['../pages/asset/ReceiveAsset.vue'], resolve)
      },
      {
        path: 'send',
        name: 'SendAsset',
        component: resolve => require(['../pages/asset/SendAsset.vue'], resolve)
      },
    ]
  }