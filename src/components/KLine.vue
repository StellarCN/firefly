/*
 * 折线图
 * @Author: mazhaoyong@gmail.com 
 * @Date: 2018-01-26 15:59:49 
 * @Last Modified by: mazhaoyong@gmail.com
 * @Last Modified time: 2018-02-26 17:45:38
 * @License MIT 
 */

<template>
  <div class="line flex-row">
      <div class="flex1">
          <div class="linegraph" :id="id" v-bind:style="{height: height + 'px'}"></div>
      </div>
      <div class="flex1" v-if="titleData!==null && titleData.price!==null">
           <div :class="' price textcenter ' + ( titleData.change >=0 ? 'up':'down') ">{{titleData.price}}{{counter.code}}</div>
           <div :class="' rate  textcenter ' + ( titleData.rate >=0 ? 'up':'down')">
              <span v-if="titleData.rate>0">+</span>
              {{titleData.rate}}%</div>
      </div>
      <div class="flex1" v-else>&nbsp;</div>
  </div>
</template>

<script>
var moment = require('moment')
var echarts = require('echarts')
import { getTradeAggregation, getTradeAggregation5min, 
    getTradeAggregation15min, getTradeAggregation1hour, 
    getTradeAggregation1day, getTradeAggregation1week,
    RESOLUTION_5MIN,RESOLUTION_1HOUR,RESOLUTION_1DAY } from '@/api/tradeAggregation'
import { getAsset } from '@/api/assets'
import { getTrades } from '@/api/trade'
import _ from 'lodash'
import {Decimal} from 'decimal.js'

const TRADE_INTERVAL = 60000

export default {
    data(){
        return {
            id: null,//元素主键
            ele: null,//echarts对象
            opt: null,
            dates:[],
            data: [],
            tinterval: null,//定时器
            lasttime: null,//上次的执行时间
            
            lastTradeAggregation:null,
            //最新的成交价格统计
            lastTrade:null,
            tradeInterval: null,//查询最新一次交易数据的interval
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
            default: RESOLUTION_5MIN
        },
        resolution: {
            type: Number,
            default: RESOLUTION_1HOUR
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
        }
    },
    computed: {
        titleData(){
          if(this.lastTradeAggregation && this.lastTrade){
            let price = new Decimal(this.lastTrade.base_amount).dividedBy(this.lastTrade.counter_amount)
            let open = new Decimal(this.lastTradeAggregation.open)
            let change = price.minus(open)
            let rate = change.times(100).dividedBy(open)
            return  _.defaultsDeep({}, this.lastTradeAggregation, {
                price: new Decimal(price.toFixed(7)).toNumber(),
                change: new Decimal(change.toFixed(7)).toNumber(),
                rate: new Decimal(rate.toFixed(2)).toNumber() })
          }
          return {}
      }  
    },
    beforeMount () {
        //生成随机的id
        this.id = 'k_'+ new Date().getTime()
        //开启定时器
        this.tinterval = setInterval(this.fetch, this.interval)
        this.setupTradeInterval()
        this.fetchLastTradeAggregation()
       
    },
    beforeDestroy () {
        //关闭定时器
        if(this.tinterval){
            clearInterval(this.tinterval)
            this.tinterval = null
        }
        this.deleteTradeInterval()
    },
    mounted () {
        this.$nextTick(()=>{
            this.init();
            this.fetch();
            this.fetchLastTrade();
        })
    },
    methods: {
        init() {
            this.initView()
        },
        //请求api，获取数据
        fetch(){
          let start_time = null, end_time=null;
          if(this.lasttime){
              start_time = this.lasttime;
              end_time = new Date().getTime()
          }else{//初次请求，判断start是否存在
            if(this.start < 0){
                //前24小时
                start_time = Number(moment().subtract(24,"hours").format('x'))
            }else{
                start_time = this.start;
            }
            if(this.end < 0 ){
                end_time = new Date().getTime()
            }else{
                end_time = this.end
            }
          }
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
                start_time, end_time, this.resolution, 200, 'desc')
            .then(data => {
                this.lasttime = end_time
                let records = data.records
                let _data = records.reverse()
                // if(_data.length > 0){
                //     this.lastTradeAggregation = _.defaultsDeep({}, _data[0])
                // }
                _data.map(item=>{
                    if(this.incremental){
                        this.data = []
                        this.dates = []
                    }
                    this.dates.push(new Date(item.timestamp).Format('MM-dd hh:mm'))
                    this.data.push(Number(item.avg))
                })
                this.opt.xAxis.date = this.dates
                this.opt.series[0].data = this.data
                this.ele.setOption(this.opt)
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
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
                    data: this.dates
                },
                yAxis: {
                    show: false,
                    type: 'value',
                    max: function(value) {
                        return value.max * 1.5;
                    }
                },
                series: [{
                    data: this.data,
                    type: 'line',
                    sampling: 'average'
                }]
            }
        }, // end of koption
        calculateMA(dayCount) {
            var result = [];
            for (var i = 0, len = this.data.length; i < len; i++) {
                if (i < dayCount) {
                    result.push('-');
                    continue;
                }
                var sum = 0;
                for (var j = 0; j < dayCount; j++) {
                    sum += this.data[i - j][1];
                }
                result.push((sum / dayCount).toFixed(2));
            }
            return result;
        },
        
        // 查询24小时的统计数据
        fetchLastTradeAggregation(){
          let start_time = 0, end_time = new Date().getTime()
          getTradeAggregation(getAsset(this.base), getAsset(this.counter), 
                start_time, end_time, RESOLUTION_1DAY, 1, 'desc')
            .then(data => {
                let records = data.records
                if(records && records.length > 0){
                    this.lastTradeAggregation = records[0]
                }
            })
            .catch(err=>{
                console.error(`-----err on get trade aggregation -- `)
                console.error(err)
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
                this.lastTrade = null
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
                        this.lastTrade = data.records[0]
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
    line-height: 30px
    vertical-align: bottom
.change
.rate
    line-height: 16px
    font-size: 14px

</style>
