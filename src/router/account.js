
export default {
    path: '/account/',
    name: 'AccountParent',
    component: resolve => require(['../pages/account/AccountParent.vue'], resolve),
    redirect: { name: 'MyAddressList' },
    children: [
      {
        path: 'manage',
        name: 'ManageAccount',
        component: resolve => require(['../pages/account/Manage.vue'], resolve)
      },
      {
        path: 'info',
        name: 'AccountInfo',
        component: resolve => require(['../pages/account/Info.vue'], resolve)
      },
      {
        path: 'namecard',
        name: 'AccountNameCard',
        component: resolve => require(['../pages/account/NameCard.vue'], resolve)
      },
      {
        path: 'modify',
        name: 'ModifyAccount',
        component: resolve => require(['../pages/account/ModifyAccount.vue'], resolve)
      }
    ]
}