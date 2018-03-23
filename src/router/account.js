
export default {
    path: '/account/',
    name: 'AccountParent',
    component: resolve => require(['../pages/account/AccountParent.vue'], resolve),
    redirect: { name: 'MyAddressList' },
    children: [
      {
        path: 'manage',
        name: 'ManageAccount',
        component: resolve => require(['../pages/account/Manage.vue'], resolve),
        meta: {
          keepAlive: false
        }
      },
      {
        path: 'info',
        name: 'AccountInfo',
        component: resolve => require(['../pages/account/Info.vue'], resolve),
        meta: {
          keepAlive: false
        }
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
      },{
        path:"message",
        name :"MessageCenter",
        component:resolve => require(['../pages/account/MessageCenter.vue'],resolve),
      },
      {
        path: "message-detils",
        name: "MessageDetils",
        component: resolve => require(['../pages/account/message-detils.vue'], resolve),
      }
    ]
}
