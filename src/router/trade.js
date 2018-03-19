import TradeParent from '@/pages/trade/TradeParent.vue'
import TradeCenter from '@/pages/trade/TradeCenter.vue'
import Trade from '@/pages/trade/Trade.vue'
import TradeK from '@/pages/trade/TradeK.vue'
import TradeBuySell from '@/pages/trade/TradeBuySell.vue'

export default {
    path:'/trade/',
    name: 'TradeParent',
    component: TradeParent,
    redirect: { name: 'TradeCenter' },
    children: [
        {
            path: 'center',
            name: 'TradeCenter',
            component: TradeCenter,
            meta: {
              keepAlive: false
            }
          },
          {
            path: 'view',
            name: 'Trade',
            component: Trade,
            meta: {
              keepAlive: false
            }
          },
          {
            path: 'buysell',
            name: 'TradeBuySell',
            component: TradeBuySell,
            meta: {
              keepAlive: false
            }
          },
          {
            path: 'full',
            name: 'TradeK',
            component: TradeK,
            meta: {
              keepAlive: false
            }
          }
    ]
}