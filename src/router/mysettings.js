import SettingParent from '@/pages/settings/SettingParent.vue'
import My from '@/pages/settings/My.vue'

// 『我的』路由
export default {
    path:'/mysettings/',
    name: 'MySettings',
    component: SettingParent,
    redirect: { name: 'My' },
    children: [
      {
        path: 'my',
        name: 'My',
        component: My
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
        path: 'federation',
        name: 'Federation',
        component: resolve => require(['../pages/settings/Federation'], resolve)
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
        name: 'About',
        component: resolve => require(['../pages/settings/About'], resolve)
      },
      {
        path: 'messageCenter',
        name: 'MessageCenter',
        component: resolve => require(['../pages/settings/MessageCenter'], resolve)
      }
    ]
  }
