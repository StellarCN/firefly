
// 『我的』路由
export default {
    path:'/mysettings/',
    name: 'MySettings',
    component: resolve => require(['../pages/settings/SettingParent.vue'], resolve),
    redirect: { name: 'My' },
    children: [
      {
        path: 'my',
        name: 'My',
        component: resolve => require(['../pages/settings/My.vue'], resolve)
      },
      {
        path: 'settings',
        name: 'Settings',
        component: resolve => require(['../pages/settings/Settings.vue'], resolve)
      },
      {
        path: 'horizon',
        name: 'Horizon',
        component: resolve => require(['../pages/settings/Horizon'], resolve)
      },
      {
        path: 'language',
        name: 'Language',
        component: resolve => require(['../pages/settings/Language'], resolve)
      },
      {
        path: 'setpincode',
        name: 'SetPinCode',
        component: resolve => require(['../pages/settings/SetPinCode'], resolve)
      },
      {
        path: 'delpincode',
        name: 'DelPinCode',
        component: resolve => require(['../pages/settings/DelPinCode'], resolve)
      },
      {
        path: 'help',
        name: 'Help',
        component: resolve => require(['../pages/settings/Help'], resolve)
      },
      {
        path: 'about',
        name: 'Abount',
        component: resolve => require(['../pages/settings/About'], resolve)
      }
    ]
  }