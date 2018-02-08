
export default {
    path:'/trade/',
    name: 'TradeParent',
    component: resolve => require(['../pages/trade/TradeParent.vue'], resolve),
    redirect: { name: 'TradeCenter' },
    children: [
        {
            path: 'center',
            name: 'TradeCenter',
            component: resolve => require(['../pages/trade/TradeCenter.vue'], resolve)
          },
          {
            path: 'view',
            name: 'Trade',
            component: resolve => require(['../pages/trade/Trade.vue'], resolve)
          },
          {
            path: 'buysell',
            name: 'TradeBuySell',
            component: resolve => require(['../pages/trade/TradeBuySell.vue'], resolve)
          },
          {
            path: 'full',
            name: 'TradeK',
            component: resolve => require(['../pages/trade/TradeK.vue'], resolve)
          }
    ]
}