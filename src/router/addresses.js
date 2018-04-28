
export default {
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
  }