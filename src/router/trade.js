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
            component: TradeCenter
          },
          {
            path: 'view',
            name: 'Trade',
            component: Trade
          },
          {
            path: 'buysell',
            name: 'TradeBuySell',
            component: TradeBuySell
          },
          {
            path: 'full',
            name: 'TradeK',
            component: TradeK
          }
    ]
}