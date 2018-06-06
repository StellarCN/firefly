/*
 * 折线图
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-26 15:59:49 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-06-05 16:54:52
 * @License MIT 
 */

<template>
  <div class="line flex-row">
      <div class="flex1">
        <div :class="' price textright ' + ((titleData.change >=0 ^ redUpGreenDown)? 'up':'down') ">
            {{titleData.price >= 0 ? (titleData.price>=0.000001 ? Number(titleData.price): titleData.price):''}}</div>
      </div>
      <div class="flex1">
        <div class="rate">
            <div v-if="titleData.rate!==null && typeof titleData.rate!=='undefined'" :class="'rate-btn textcenter ' + (( titleData.change >=0 ^ redUpGreenDown)? 'up':'down')">
                <span v-if="titleData.rate>0">+</span>{{titleData.rate}}%    
            </div>    
        </div>
      </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
var moment = require('moment')
//var echarts = require('echarts')
import echarts from '@/libs/pkgs/initEcharts'
import { getTradeAggregation, getTradeAggregation1min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    RESOLUTION_1MIN,RESOLUTION_1HOUR,RESOLUTION_1DAY } from '@/api/tradeAggregation'
import { getAsset,isNativeAsset } from '@/api/assets'
import { getTrades } from '@/api/trade'
import { getOrderbook } from '@/api/orderbook'
import  defaultsDeep  from 'lodash/defaultsDeep'
import {Decimal} from 'decimal.js'

import { SET_TRADEPAIR_KLINE_LASTTRADE,SET_TRADEPAIR_KLINE_TRADEAGGREGATION, SET_TRADEPAIR_KLINE_7DAY_TRADEAGGREGATION } from '@/store/modules/AccountsStore'

const TRADE_INTERVAL = 60000

export default {
    data(){
        return {
            id: null,//元素主键
            ele: null,//echarts对象
            opt: null,
            //dates:[],
            //data: [],
            tinterval: null,//定时器
            lasttime: null,//上次的执行时间
            
            //lastTradeAggregation:null,
            //最新的成交价格统计
            //lastTrade:null,
            tradeInterval: null,//查询最新一次交易数据的interval
            working: true,

            lineData: null,
            loading: false,
        }
    },
    props: {
        //交易资产
        base: {
            type: Object,
            require: true
        },
        //交易对手资产
        counter: {
            type: Object,
            require: true
        },
        //数据获取的起始时间，单位毫秒
        start: {
            type: Number,
            default: -1
        },
        //数据获取的截止时间，单位毫秒
        end: {
            type: Number,
            default: -1
        },
        //时间间隔，单位毫秒
        interval: {
            type: Number,
            default: RESOLUTION_1DAY
        },
        resolution: {
            type: Number,
            default: RESOLUTION_1DAY
        },
        //是否增量更新模式
        incremental: {
            type: Boolean,
            default: false
        },
        //高度
        height: {
            type: Number,
            default: 60
        },
        //需要多长时间后进行界面数据展示
        timeout: {
            type: Number,
            default: 10
        },
        //位于交易对中的索引值
        tradepairIndex: {
            type: String,
            required: true
        }
    },
    computed: {
        ...mapState({
            tradePairKLineData: state => state.accounts.tradePairKLineData,
            redUpGreenDown: state => state.app.redUpGreenDown,
            tradePairsStat: state => state.accounts.tradePairsStat,

        }),
        decimal(){
            if(this.counter.code === 'BTC'){
                return 7
            }
            return 4
        },
        // lineData(){
        //     return this.tradePairKLineData[this.tradepairIndex]
        // },
    
        //7天的聚合数据
        // sevenDayTradeAggregation(){
        //     return this.lineData ? this.lineData.sevenDayTradeAggregation : null
        // },
        // sevenData(){
        //     return this.sevenDayTradeAggregation ? this.sevenDayTradeAggregation.data || [] : []
        // },
        // sevenDates(){
        //     return this.sevenDayTradeAggregation ? this.sevenDayTradeAggregation.dates||[] : []
        // },
        titleData(){
          let idf = isNativeAsset(this.base) ? 'XLM' : this.base.code+'-'+this.base.issuer
          let idt = isNativeAsset(this.counter) ? 'XLM' : this.counter.code +'-'+this.counter.issuer
          let key = idf + '_' + idt;
          let d = this.tradePairsStat[key]
          if(d){
            let price = new Decimal(d.latest_price||d.order_book_avg)//new Decimal(this.lastTrade.base_amount).dividedBy(this.lastTrade.counter_amount)
            let rate = new Decimal(0)
            let change = new Decimal(0)
            if(d.open){
                let open = new Decimal(d.open)
                change = price.minus(open)
                rate = change.toNumber() === 0 ? new Decimal(0) : change.times(100).dividedBy(open)
            }
            if(price.toNumber() === 0){
                price = null
            }else{
                price = price.toFixed(this.decimal)
            }
            return Object.assign({},d,{
                    price,
                    rate: Number(rate.toFixed(2)),
                    change: change.toNumber()
                    })
          }
          return {}
      },  
      cid(){
          return `${this.base.code}-${this.base.issuer}-${this.counter.code}-${this.counter.issuer}`
      }
    },
    watch: {
      
    },
    beforeMount () {
        //生成随机的id
        // this.id = 'k_'+ new Date().getTime()
       //先从缓存中取值
        // this.lineData = this.tradePairKLineData[this.tradepairIndex]
    },
    beforeDestroy () {
        // this.clearAll()
    },
    mounted () {
        // this.init()
    },
    methods: {
        reload(){
            //假延迟
            return new Promise((resolve,reject)=>{
                this.clearAll()
                this.init()
                setTimeout(()=>{
                    resolve()
                }, this.timeout+3000)
            })
        },
        clearAll(){
            //关闭定时器
            // if(this.tinterval){
            //     clearInterval(this.tinterval)
            //     this.tinterval = null
            // }
            this.deleteTradeInterval()
        },
        init() {
            this.$nextTick(()=>{
                setTimeout(()=>{
                    //开启定时器
                    // this.tinterval = setInterval(this.fetch, this.interval)
                    this.fetchLastTradeAggregation()
                    // this.initView()
                    // this.fetch();
                }, this.timeout)
            })    
        },
        //请求api，获取数据
        fetch(){
          let start_time = null, end_time=null;
          //初次请求，判断start是否存在
            if(this.start < 0){
                //前7天
                start_time = Number(moment().subtract(7,"days").format('x'))
            }else{
                start_time = this.start;
            }
            if(this.end < 0 ){
                end_time = new Date().getTime()
            }else{
                end_time = this.end
            }
          this.working = true
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
                start_time, end_time, this.resolution, 200, 'desc')
            .then(data => {
                this.lasttime = end_time
                let records = data.records
                let _data = records.reverse()
                // if(_data.length > 0){
                //     this.lastTradeAggregation = _.defaultsDeep({}, _data[0])
                // }
                let opt_data = this.incremental ? [...this.sevenData]:[]
                let opt_dates = this.incremental ? [...this.sevenDates]:[]
                _data.map(item=>{
                    opt_dates.push(new Date(item.timestamp).Format('MM-dd hh:mm'))
                    opt_data.push(Number(item.avg))
                })
                this.$store.commit(SET_TRADEPAIR_KLINE_7DAY_TRADEAGGREGATION,{
                    index: this.tradepairIndex, date: this.lasttime, data: {data: opt_data, dates:opt_dates}})
                this.$nextTick(()=>{
                    this.lineData = this.tradePairKLineData[this.tradepairIndex]
                })
                this.opt.xAxis.date = opt_dates
                this.opt.series[0].data = opt_data
                this.ele.setOption(this.opt)
                this.working = false
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
                this.working = false
            })
        },
        initView() {
            this.ele = echarts.init(document.getElementById(this.id))
            this.opt = this.koption()
            this.ele.setOption(this.opt)
        },
        koption() {
            return {
                color:['#21ce90'],
                xAxis: {
                    show: false,
                    type: 'category',
                    data: this.sevenDates
                },
                yAxis: {
                    show: false,
                    type: 'value',
                    max: function(value) {
                        return value.max * 1.5;
                    },
                    min: function(value){
                        return value.min / 2
                    }
                },
                series: [{
                    data: this.sevenData,
                    type: 'line',
                    sampling: 'average'
                }]
            }
        }, // end of koption
        calculateMA(dayCount) {
            var result = [];
            for (var i = 0, len = this.sevenData.length; i < len; i++) {
                if (i < dayCount) {
                    result.push('-');
                    continue;
                }
                var sum = 0;
                for (var j = 0; j < dayCount; j++) {
                    sum += this.sevenData[i - j][1];
                }
                result.push((sum / dayCount).toFixed(2));
            }
            return result;
        },
        
        // 查询24小时的统计数据
        fetchLastTradeAggregation(){
          this.loading = true
          let start_time = 0, end_time = new Date().getTime()
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
                start_time, end_time, RESOLUTION_1DAY, 1, 'desc')
            .then(data => {
                this.loading = false
                let records = data.records
                if(records && records.length > 0){
                    //this.lastTradeAggregation = records[0]
                    this.$store.commit(SET_TRADEPAIR_KLINE_TRADEAGGREGATION, {
                        index: this.tradepairIndex,
                        date: end_time,
                        data: records[0]
                    })   
                    this.$nextTick(()=>{
                        this.lineData = this.tradePairKLineData[this.tradepairIndex]
                    })
                    
                }else{
                    //查询orderbook，构造数据
                    getOrderbook(getAsset(this.base), getAsset(this.counter))
                        .then(data=>{
                            let bids = data.bids;
                            let asks = data.asks;
                            let price = null;
                            let index = 0
                            if(bids && bids.length>0){
                                price = new Decimal(bids[0].price)
                                index++
                            }
                            if(asks && asks.length>0){
                                price.add(asks[0].price)
                                index++
                            }
                            if(index>0){
                                price = price.div(index).toNumber();
                            }
                            this.$nextTick(()=>{
                                this.lineData = {orderbook_price:  price}
                            })
                            
                        })
                        .catch(err=>{

                        })


                }

            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
                this.loading = false
            })
        },

         setupTradeInterval(){
            if (!this.tradeInterval){
                this.tradeInterval = setInterval(()=>{
                this.fetchLastTrade()
                },TRADE_INTERVAL)
            }
            this.fetchLastTrade()
        },

        deleteTradeInterval(){
            if(this.tradeInterval!= null && typeof this.tradeInterval != 'undefined'){
                clearInterval(this.tradeInterval)
                //this.lastTrade = null
                this.tradeInterval = null
            }
        },
        //查询最新一次成交记录
        fetchLastTrade(){
            let counterasset = getAsset(this.counter.code,this.counter.issuer)
            let baseasset = getAsset(this.base.code,this.base.issuer)
            getTrades(baseasset,counterasset,"desc",1)
                .then(data=>{
                    if(data.records && data.records.length > 0){
                        //this.lastTrade = data.records[0]
                        this.$store.commit(SET_TRADEPAIR_KLINE_LASTTRADE,{
                            index: this.tradepairIndex,
                            date: this.lasttime,
                            data: data.records[0]
                        })
                    }
                }).catch(err=>{
                    console.log(err)
                })
        },

    }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.price
  font-size: 16px
.price
.change
.rate
  vertical-align: middle
  &.up
    color: $primarycolor.green
  &.down
    color: $primarycolor.red
.price
    line-height: 50px
    height: 50px
    font-size: 18px
    overflow: hidden
    width:100%
    display:block
    text-overflow:none
    white-space:nowrap
.change
.rate
    line-height: 50px
    height: 50px
    font-size: 16px
.rate
    padding-top: 12px
    padding-bottom: 12px
    padding-left: 10px
    padding-right: 10px
    .rate-btn
        line-height: 26px
        height: 26px
        font-size: 14px
        color: $primarycolor.font
        &.up
            background: $primarycolor.green
        &.down
            background: $primarycolor.red

.working
    padding-top: 8px
    text-align: center

</style>
